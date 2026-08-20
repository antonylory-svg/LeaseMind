import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { migrateUp } from '../src/db/migrate.js';
import { saveTechnicalAssignmentDraft } from '../src/db/technicalAssignment.js';
import { createOrReplayPreLaunchAnalysisSnapshot } from '../src/db/analysisSnapshot.js';
import { launchCampaignFromTechnicalAssignment } from '../src/db/launchCampaign.js';
import { executeCampaignOutcomeCommand, type CampaignOutcomeCommand } from '../src/db/campaignOutcomes.js';
import {
  ANALYSIS_DATABASE_URL,
  CAMPAIGN_OUTCOME_DATABASE_URL,
  COMMAND_DATABASE_URL,
  MAINTENANCE_DATABASE_URL,
  MIGRATION_DATABASE_URL,
  TA_DATABASE_URL,
  hasAnalysisDatabase,
  hasCampaignOutcomeDatabase
} from './testDatabaseUrls.js';

// Narrow synthetic operational CLI making ADR-0010 §12's coordinated rebuild
// operationally reachable (apps/api/src/db/campaign-outcome-rebuild-cli.ts).
// Mirrors the structure of campaignOutcomeCli.test.ts.

const SKIP = !hasCampaignOutcomeDatabase || !hasAnalysisDatabase;

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const RUNNING_COMPILED = path.basename(path.dirname(TEST_DIRECTORY)) === 'dist';
const API_ROOT = RUNNING_COMPILED ? path.join(TEST_DIRECTORY, '..', '..') : path.join(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.join(API_ROOT, '..', '..');
const CLI_ARGS = RUNNING_COMPILED
  ? ['dist/src/db/campaign-outcome-rebuild-cli.js']
  : ['--import', 'tsx', 'src/db/campaign-outcome-rebuild-cli.ts'];

const OPERATOR_REF = 'pilot-admin:11111111-1111-4111-8111-111111111111';

interface CliResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

function runCli(args: string[], databaseUrl = MAINTENANCE_DATABASE_URL, envOverrides: NodeJS.ProcessEnv = {}): Promise<CliResult> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    LEASEMIND_MAINTENANCE_DATABASE_URL: databaseUrl,
    LEASEMIND_RUNTIME_MODE: 'synthetic',
    LEASEMIND_PRODUCTION_LAUNCH_GATE: 'blocked',
    LEASEMIND_ALLOW_REAL_PII: 'false',
    LEASEMIND_ALLOW_REAL_PAYMENTS: 'false',
    LEASEMIND_ALLOW_PROTECTED_REVEAL: 'false',
    LEASEMIND_ALLOW_PRODUCTION_ADAPTERS: 'false',
    ...envOverrides
  };
  return new Promise(resolve => {
    const child = spawn(process.execPath, [...CLI_ARGS, ...args], {
      cwd: API_ROOT,
      env,
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('close', code => resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() }));
  });
}

test('campaign outcome rebuild CLI is exposed only as the dedicated maintenance operational entrypoint', async () => {
  const [rootPackageRaw, apiPackageRaw, cliSource] = await Promise.all([
    readFile(path.join(REPOSITORY_ROOT, 'package.json'), 'utf8'),
    readFile(path.join(API_ROOT, 'package.json'), 'utf8'),
    readFile(path.join(API_ROOT, 'src', 'db', 'campaign-outcome-rebuild-cli.ts'), 'utf8')
  ]);
  const rootPackage = JSON.parse(rootPackageRaw);
  const apiPackage = JSON.parse(apiPackageRaw);
  assert.equal(rootPackage.scripts['campaign-outcome-rebuild'], 'npm run campaign-outcome-rebuild --workspace apps/api --');
  assert.equal(
    apiPackage.scripts['campaign-outcome-rebuild'],
    'node --env-file-if-exists=.env --import tsx src/db/campaign-outcome-rebuild-cli.ts'
  );
  assert.match(cliSource, /loadMaintenanceDatabaseUrl\(\)/);
  assert.match(cliSource, /verifyRuntimeCampaignOutcomeMaintainerPrivileges\(pool\)/);
  assert.match(cliSource, /enforceRuntimeSafetyGate\(\)/);
  assert.doesNotMatch(cliSource, /console\.(?:error|log)\(error/);
  assert.doesNotMatch(cliSource, /JSON\.stringify\(error/);
  // Never a fallback to any other connection identity (the writer identity
  // record/correct uses, or a bare process.env.DATABASE_URL read).
  assert.doesNotMatch(cliSource, /loadCampaignOutcomeDatabaseUrl/);
  assert.doesNotMatch(cliSource, /loadCommandDatabaseUrl/);
  assert.doesNotMatch(cliSource, /process\.env\.DATABASE_URL/);
});

test('invalid CLI arguments fail before an unavailable database can be contacted', async () => {
  const result = await runCli(['--campaign-id', 'not-a-uuid'], 'postgresql://invalid:invalid@127.0.0.1:1/unavailable');
  assert.notEqual(result.code, 0);
  assert.equal(result.stdout, '');
  assert.deepEqual(JSON.parse(result.stderr), {
    event: 'campaign_outcome_rebuild_failed',
    safe_error_code: 'CAMPAIGN_OUTCOME_REBUILD_ARGUMENT_INVALID'
  });
});

test('an unknown argument is rejected before an unavailable database can be contacted', async () => {
  const result = await runCli(
    ['--campaign-id', '00000000-0000-4000-9400-000000000001', '--outcome-code', 'success_via_leasemind'],
    'postgresql://invalid:invalid@127.0.0.1:1/unavailable'
  );
  assert.notEqual(result.code, 0);
  assert.deepEqual(JSON.parse(result.stderr), {
    event: 'campaign_outcome_rebuild_failed',
    safe_error_code: 'CAMPAIGN_OUTCOME_REBUILD_ARGUMENT_INVALID'
  });
});

test('a non-synthetic runtime is rejected before an unavailable database can be contacted', async () => {
  const result = await runCli(
    ['--campaign-id', '00000000-0000-4000-9400-000000000001', '--execute'],
    'postgresql://invalid:invalid@127.0.0.1:1/unavailable',
    { LEASEMIND_RUNTIME_MODE: 'production' }
  );
  assert.notEqual(result.code, 0);
  assert.equal(result.stdout, '');
  assert.deepEqual(JSON.parse(result.stderr), {
    event: 'campaign_outcome_rebuild_failed',
    safe_error_code: 'RUNTIME_SAFETY_VIOLATION'
  });
});

test('without --execute, nothing is written and no database connection is attempted (explicit dry-run preview)', async () => {
  const result = await runCli(
    ['--campaign-id', '00000000-0000-4000-9400-000000000001'],
    'postgresql://invalid:invalid@127.0.0.1:1/unavailable'
  );
  assert.equal(result.code, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout), {
    event: 'campaign_outcome_rebuild_dry_run',
    campaign_id: '00000000-0000-4000-9400-000000000001',
    would_execute: true
  });
});

test('CLI privilege gate rejects an interchangeable Analysis writer connection', { skip: SKIP }, async () => {
  const migrationPool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(migrationPool);
  } finally {
    await migrationPool.end();
  }
  const result = await runCli(['--campaign-id', '00000000-0000-4000-9400-000000000002', '--execute'], ANALYSIS_DATABASE_URL);
  assert.notEqual(result.code, 0);
  assert.equal(result.stdout, '');
  assert.deepEqual(JSON.parse(result.stderr), {
    event: 'campaign_outcome_rebuild_failed',
    safe_error_code: 'DATABASE_PRIVILEGE_VIOLATION'
  });
});

test('CLI privilege gate rejects the Campaign Outcome writer connection itself (rebuild is maintainer-only, never the record/correct writer)', { skip: SKIP }, async () => {
  const result = await runCli(['--campaign-id', '00000000-0000-4000-9400-000000000003', '--execute'], CAMPAIGN_OUTCOME_DATABASE_URL);
  assert.notEqual(result.code, 0);
  assert.deepEqual(JSON.parse(result.stderr), {
    event: 'campaign_outcome_rebuild_failed',
    safe_error_code: 'DATABASE_PRIVILEGE_VIOLATION'
  });
});

function futureDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 30);
  return date.toISOString().slice(0, 10);
}

function propertyPayload(): Record<string, unknown> {
  return {
    property_type: 'office',
    property_country_code: 'RU',
    property_region: 'Rebuild CLI Synthetic Region',
    property_city: 'Rebuild CLI Synthetic City',
    property_area_sqm: 100,
    property_condition: 'ready_to_use',
    property_available_from: futureDate(),
    property_monthly_rent_rub: 150000,
    property_operating_expenses_included: true,
    property_utilities_included: true,
    property_allowed_business_categories: ['office'],
    property_deal_priority: 'balanced'
  };
}

let keyCounter = 0;
function key(prefix: string): string {
  keyCounter += 1;
  return `${prefix}-${Date.now()}-${keyCounter}`;
}

async function createLaunchedFixture(prefix: string): Promise<string> {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  try {
    const assignment = await saveTechnicalAssignmentDraft(taPool, {
      idempotencyKey: key(`${prefix}-ta`),
      scenario: 'need_tenant',
      payload: propertyPayload()
    });
    const analysis = await createOrReplayPreLaunchAnalysisSnapshot(analysisPool, {
      idempotencyKey: key(`${prefix}-analysis`),
      technicalAssignmentId: assignment.technical_assignment_id,
      expectedRevision: assignment.revision,
      analysisKind: 'pre_launch',
      campaignId: null,
      retryOfAnalysisSnapshotId: null
    });
    const launch = await launchCampaignFromTechnicalAssignment(commandPool, {
      idempotencyKey: key(`${prefix}-launch`),
      technicalAssignmentId: assignment.technical_assignment_id,
      expectedRevision: assignment.revision,
      analysisSnapshotId: analysis.analysisSnapshotId,
      contactsGateEvidence: 'synthetic-fixture-acknowledged-v1'
    });
    return launch.campaign_id;
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end()]);
  }
}

async function currentVersion(campaignId: string): Promise<string> {
  const pool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 1 });
  try {
    const result = await pool.query<{ aggregate_version: string }>(
      'SELECT aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [campaignId]
    );
    return result.rows[0].aggregate_version;
  } finally {
    await pool.end();
  }
}

function buildCommand(overrides: Partial<CampaignOutcomeCommand> & { campaignId: string; expectedCampaignVersion: string }): CampaignOutcomeCommand {
  return {
    action: 'record',
    outcomeCode: 'success_via_leasemind',
    idempotencyKey: key('co-rebuild-cli-cmd'),
    actorRef: OPERATOR_REF,
    confirmationAttested: true,
    execute: true,
    correctsOutcomeRecordId: null,
    correctionReasonCode: null,
    ...overrides
  };
}

test('CLI end-to-end: --execute actually repairs a corrupted lifecycle/outcome projection pair for one Campaign, and the gate runs before any lock/DML', { skip: SKIP }, async () => {
  const migrationPool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(migrationPool);
  } finally {
    await migrationPool.end();
  }

  const campaignId = await createLaunchedFixture('rebuild-cli-e2e');
  const v1 = await currentVersion(campaignId);

  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  try {
    const record = await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId, expectedCampaignVersion: v1, outcomeCode: 'success_via_leasemind' }));
    const realVersion = await currentVersion(campaignId);

    // Corrupt the lifecycle projection out of band, exactly as a real
    // maintenance mistake would.
    await commandPool.query(
      `UPDATE leasemind_app.campaign_current_state_projection SET status = 'Analyzing', aggregate_version = 999 WHERE campaign_id = $1`,
      [campaignId]
    );
    const corrupted = await commandPool.query<{ status: string }>(
      'SELECT status FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [campaignId]
    );
    assert.equal(corrupted.rows[0].status, 'Analyzing');

    const dryRun = await runCli(['--campaign-id', campaignId]);
    assert.equal(dryRun.code, 0, dryRun.stderr);
    assert.deepEqual(JSON.parse(dryRun.stdout), {
      event: 'campaign_outcome_rebuild_dry_run',
      campaign_id: campaignId,
      would_execute: true
    });
    const stillCorrupted = await commandPool.query<{ status: string }>(
      'SELECT status FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [campaignId]
    );
    assert.equal(stillCorrupted.rows[0].status, 'Analyzing', 'a dry-run must never write anything');

    const executed = await runCli(['--campaign-id', campaignId, '--execute']);
    assert.equal(executed.code, 0, executed.stderr);
    assert.deepEqual(JSON.parse(executed.stdout), {
      event: 'campaign_outcome_rebuild_executed',
      campaign_id: campaignId
    });

    const repaired = await commandPool.query<{ status: string; aggregate_version: string }>(
      'SELECT status, aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [campaignId]
    );
    assert.equal(repaired.rows[0].status, 'Completed');
    assert.equal(repaired.rows[0].aggregate_version, realVersion);

    const outcomePointer = await writerPool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [campaignId]
    );
    assert.equal(outcomePointer.rows[0].current_outcome_record_id, record.record.outcomeRecordId);

    // No transcript across this whole flow ever contains connection
    // strings, credentials or audit-only fields.
    const allOutput = [dryRun, executed].map(r => `${r.stdout}\n${r.stderr}`).join('\n');
    assert.equal(allOutput.includes('synthetic-'), false, 'CLI output must never echo any password fragment');
    assert.equal(allOutput.includes('operator_ref'), false);
    assert.equal(allOutput.includes('actor_ref'), false);
  } finally {
    await Promise.all([writerPool.end(), commandPool.end()]);
  }
});
