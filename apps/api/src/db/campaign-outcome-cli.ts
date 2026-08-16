import { loadCampaignOutcomeDatabaseUrl } from '../config.js';
import { createPool } from '../db.js';
import {
  DATABASE_PRIVILEGE_VIOLATION_CODE,
  DatabasePrivilegeViolation,
  verifyRuntimeCampaignOutcomePrivileges
} from '../dbPrivilegePolicy.js';
import { enforceRuntimeSafetyGate, RuntimeSafetyViolation } from '../runtimePolicy.js';
import {
  CAMPAIGN_OUTCOME_ARGUMENT_INVALID,
  CAMPAIGN_OUTCOME_RUNTIME_NOT_SYNTHETIC,
  CampaignOutcomeError,
  dryRunCampaignOutcomeCommand,
  executeCampaignOutcomeCommand,
  parseCampaignOutcomeArgs
} from './campaignOutcomes.js';

// Synthetic operational CLI for the Campaign Outcome command core
// (ADR-0010 §9). Not reachable from any HTTP route -- this is the only
// caller of executeCampaignOutcomeCommand/dryRunCampaignOutcomeCommand for
// Sprint 6. Structured JSON stdout/stderr only; never logs actor_ref,
// passwords, connection strings, or raw SQL/exception/stack trace detail.

const CONFIGURATION_ERROR_CODE = 'CAMPAIGN_OUTCOME_CONFIGURATION_INVALID';
const OPERATION_ERROR_CODE = 'CAMPAIGN_OUTCOME_OPERATION_FAILED';

function writeFailure(safeErrorCode: string): void {
  console.error(
    JSON.stringify({
      event: 'campaign_outcome_command_failed',
      safe_error_code: safeErrorCode
    })
  );
}

async function main(): Promise<void> {
  let command;
  try {
    // Contract requirement: the full argument allowlist is validated before
    // any runtime gate check, database configuration read, or connection.
    command = parseCampaignOutcomeArgs(process.argv.slice(2));
  } catch {
    writeFailure(CAMPAIGN_OUTCOME_ARGUMENT_INVALID);
    process.exitCode = 1;
    return;
  }

  let databaseUrl: string;
  try {
    enforceRuntimeSafetyGate();
    databaseUrl = loadCampaignOutcomeDatabaseUrl();
  } catch (error) {
    // ADR-0010 §9's own stable CLI-contract code -- distinct from
    // runtimePolicy.ts's generic RuntimeSafetyViolation message, which no
    // other CLI's safe-error-code contract names.
    writeFailure(error instanceof RuntimeSafetyViolation ? CAMPAIGN_OUTCOME_RUNTIME_NOT_SYNTHETIC : CONFIGURATION_ERROR_CODE);
    process.exitCode = 1;
    return;
  }

  const pool = createPool(databaseUrl);
  try {
    await verifyRuntimeCampaignOutcomePrivileges(pool);

    if (!command.execute) {
      const result = await dryRunCampaignOutcomeCommand(pool, command);
      console.log(
        JSON.stringify({
          event: 'campaign_outcome_dry_run_completed',
          would_succeed: result.wouldSucceed,
          command_type: result.commandType,
          campaign_id: result.campaignId,
          outcome_code: result.outcomeCode,
          safe_error_code: result.safeErrorCode,
          current_campaign_status: result.currentCampaignStatus,
          current_campaign_version: result.currentCampaignVersion,
          current_effective_outcome_code: result.currentEffectiveOutcomeCode
        })
      );
      return;
    }

    const result = await executeCampaignOutcomeCommand(pool, command);
    console.log(
      JSON.stringify({
        event: result.isReplay ? 'campaign_outcome_command_replayed' : 'campaign_outcome_command_executed',
        is_replay: result.isReplay,
        outcome_record_id: result.record.outcomeRecordId,
        campaign_id: result.record.campaignId,
        outcome_sequence: result.record.outcomeSequence,
        command_type: result.record.commandType,
        outcome_code: result.record.outcomeCode,
        mapped_lifecycle_status: result.record.mappedLifecycleStatus,
        corrects_outcome_record_id: result.record.correctsOutcomeRecordId,
        recorded_at: result.record.recordedAt,
        confirmation_method: result.record.confirmationMethod,
        resulting_campaign_aggregate_version: result.record.resultingCampaignAggregateVersion
      })
    );
  } catch (error) {
    const safeErrorCode =
      error instanceof CampaignOutcomeError
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
