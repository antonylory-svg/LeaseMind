import { loadMaintenanceDatabaseUrl } from '../config.js';
import { createPool } from '../db.js';
import {
  DATABASE_PRIVILEGE_VIOLATION_CODE,
  DatabasePrivilegeViolation,
  verifyRuntimeCampaignOutcomeMaintainerPrivileges
} from '../dbPrivilegePolicy.js';
import { enforceRuntimeSafetyGate, RuntimeSafetyViolation } from '../runtimePolicy.js';
import { isUuidV4OrV7 } from '../uuid.js';
import { CampaignOutcomeRebuildError, rebuildCampaignProjections } from './campaignOutcomeRebuild.js';

// Narrow synthetic operational CLI making ADR-0010 §12's coordinated
// rebuild (campaignOutcomeRebuild.ts) operationally reachable -- the only
// caller of rebuildCampaignProjections. Deliberately exposes only the
// single-Campaign, deterministic coordinated path (never a bare
// rebuildAllCampaignOutcomeProjections sweep from the CLI), matching the
// same minimal-surface discipline as campaign-outcome-cli.ts and
// revoke-evidence-dataset-cli.ts. Never logs connection strings,
// credentials, raw exceptions or audit-only fields (operator_ref,
// correction_reason_code never appear anywhere in this module).

const ARGUMENT_INVALID_CODE = 'CAMPAIGN_OUTCOME_REBUILD_ARGUMENT_INVALID';
const CONFIGURATION_ERROR_CODE = 'CAMPAIGN_OUTCOME_REBUILD_CONFIGURATION_INVALID';
const OPERATION_ERROR_CODE = 'CAMPAIGN_OUTCOME_REBUILD_OPERATION_FAILED';

function writeFailure(safeErrorCode: string): void {
  console.error(
    JSON.stringify({
      event: 'campaign_outcome_rebuild_failed',
      safe_error_code: safeErrorCode
    })
  );
}

interface RebuildCommand {
  campaignId: string;
  execute: boolean;
}

/** Minimal allowlist parser -- campaign-outcome-cli.ts's own discipline:
 * unknown/duplicate/missing arguments are all rejected before any database
 * configuration is read or a connection attempted. */
function parseRebuildArgs(argv: readonly string[]): RebuildCommand {
  let campaignId: string | undefined;
  let execute = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    switch (argument) {
      case '--campaign-id': {
        if (campaignId !== undefined) throw new Error('duplicate --campaign-id');
        const value = argv[index + 1];
        if (value === undefined || value.startsWith('--')) throw new Error('missing --campaign-id value');
        campaignId = value;
        index += 1;
        break;
      }
      case '--execute':
        if (execute) throw new Error('duplicate --execute');
        execute = true;
        break;
      default:
        throw new Error(`unknown argument: ${argument}`);
    }
  }

  if (campaignId === undefined || !isUuidV4OrV7(campaignId)) {
    throw new Error('a valid --campaign-id is required');
  }

  return { campaignId, execute };
}

async function main(): Promise<void> {
  let command: RebuildCommand;
  try {
    command = parseRebuildArgs(process.argv.slice(2));
  } catch {
    writeFailure(ARGUMENT_INVALID_CODE);
    process.exitCode = 1;
    return;
  }

  let databaseUrl: string;
  try {
    enforceRuntimeSafetyGate();
    // Maintenance-only connection, no fallback -- the same identity
    // seed-cli.ts and the existing rebuildCampaignProjection already use.
    databaseUrl = loadMaintenanceDatabaseUrl();
  } catch (error) {
    writeFailure(error instanceof RuntimeSafetyViolation ? 'RUNTIME_SAFETY_VIOLATION' : CONFIGURATION_ERROR_CODE);
    process.exitCode = 1;
    return;
  }

  if (!command.execute) {
    // Explicit --execute is required for any DML (task contract). Without
    // it, nothing is written and no database connection is even attempted
    // -- there is no separate "would-succeed" analysis to run, since the
    // rebuild itself already fails closed on any inconsistency it finds.
    console.log(
      JSON.stringify({
        event: 'campaign_outcome_rebuild_dry_run',
        campaign_id: command.campaignId,
        would_execute: true
      })
    );
    return;
  }

  const pool = createPool(databaseUrl);
  try {
    await verifyRuntimeCampaignOutcomeMaintainerPrivileges(pool);
    await rebuildCampaignProjections(pool, command.campaignId);
    console.log(
      JSON.stringify({
        event: 'campaign_outcome_rebuild_executed',
        campaign_id: command.campaignId
      })
    );
  } catch (error) {
    const safeErrorCode =
      error instanceof CampaignOutcomeRebuildError
        ? error.safeCode
        : error instanceof DatabasePrivilegeViolation
          ? error.message
          : OPERATION_ERROR_CODE;
    writeFailure(safeErrorCode || DATABASE_PRIVILEGE_VIOLATION_CODE);
    process.exitCode = 1;
  } finally {
    await pool.end().catch(() => {});
  }
}

void main();
