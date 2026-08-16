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
import { CAMPAIGN_OUTCOME_ARGUMENT_INVALID, CAMPAIGN_OUTCOME_RUNTIME_NOT_SYNTHETIC } from '../src/db/campaignOutcomes.js';
import {
  ANALYSIS_DATABASE_URL,
  CAMPAIGN_OUTCOME_DATABASE_URL,
  COMMAND_DATABASE_URL,
  MIGRATION_DATABASE_URL,
  TA_DATABASE_URL,
  hasAnalysisDatabase,
  hasCampaignOutcomeDatabase
} from './testDatabaseUrls.js';

// Synthetic operational CLI for the Campaign Outcome command core
// (ADR-0010 §9). Mirrors the structure of evidenceDatasetRevocation.test.ts
// for revoke-evidence-dataset-cli.ts.

const SKIP = !hasCampaignOutcomeDatabase || !hasAnalysisDatabase;

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const RUNNING_COMPILED = path.basename(path.dirname(TEST_DIRECTORY)) === 'dist';
const API_ROOT = RUNNING_COMPILED ? path.join(TEST_DIRECTORY, '..', '..') : path.join(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.join(API_ROOT, '..', '..');
const CLI_ARGS = RUNNING_COMPILED
  ? ['dist/src/db/campaign-outcome-cli.js']
  : ['--import', 'tsx', 'src/db/campaign-outcome-cli.ts'];

const OPERATOR_REF = 'pilot-admin:11111111-1111-4111-8111-111111111111';

interface CliResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

function runCli(args: string[], databaseUrl = CAMPAIGN_OUTCOME_DATABASE_URL, envOverrides: NodeJS.ProcessEnv = {}): Promise<CliResult> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    LEASEMIND_CAMPAIGN_OUTCOME_DATABASE_URL: databaseUrl,
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

test('campaign outcome CLI is exposed only as the dedicated operational entrypoint', async () => {
  const [rootPackageRaw, apiPackageRaw, cliSource] = await Promise.all([
    readFile(path.join(REPOSITORY_ROOT, 'package.json'), 'utf8'),
    readFile(path.join(API_ROOT, 'package.json'), 'utf8'),
    readFile(path.join(API_ROOT, 'src', 'db', 'campaign-outcome-cli.ts'), 'utf8')
  ]);
  const rootPackage = JSON.parse(rootPackageRaw);
  const apiPackage = JSON.parse(apiPackageRaw);
  assert.equal(rootPackage.scripts['campaign-outcome'], 'npm run campaign-outcome --workspace apps/api --');
  assert.equal(
    apiPackage.scripts['campaign-outcome'],
    'node --env-file-if-exists=.env --import tsx src/db/campaign-outcome-cli.ts'
  );
  assert.match(cliSource, /parseCampaignOutcomeArgs\(process\.argv\.slice\(2\)\)/);
  assert.match(cliSource, /loadCampaignOutcomeDatabaseUrl\(\)/);
  assert.match(cliSource, /verifyRuntimeCampaignOutcomePrivileges\(pool\)/);
  assert.match(cliSource, /enforceRuntimeSafetyGate\(\)/);
  assert.doesNotMatch(cliSource, /console\.(?:error|log)\(error/);
  assert.doesNotMatch(cliSource, /JSON\.stringify\(error/);
  // The CLI's own JSON output objects must never key on actor_ref/operator_ref
  // (a documentation comment naming them, e.g. "never logs actor_ref", is
  // fine and expected -- only an actual output field would be a leak, which
  // the end-to-end test below checks behaviorally).
  assert.doesNotMatch(cliSource, /actor_ref:/);
  assert.doesNotMatch(cliSource, /operator_ref:/);
});

test('invalid CLI arguments fail before an unavailable database can be contacted', async () => {
  const result = await runCli(['record', '--campaign-id', 'not-a-uuid'], 'postgresql://invalid:invalid@127.0.0.1:1/unavailable');
  assert.notEqual(result.code, 0);
  assert.equal(result.stdout, '');
  assert.deepEqual(JSON.parse(result.stderr), {
    event: 'campaign_outcome_command_failed',
    safe_error_code: CAMPAIGN_OUTCOME_ARGUMENT_INVALID
  });
});

test('a non-synthetic runtime is rejected before an unavailable database can be contacted', async () => {
  const validArgs = [
    'record',
    '--campaign-id', '00000000-0000-4000-9400-000000000001',
    '--outcome-code', 'success_via_leasemind',
    '--expected-campaign-version', '1',
    '--idempotency-key', 'runtime-gate-probe',
    '--actor-ref', OPERATOR_REF,
    '--confirmation-attested'
  ];
  const result = await runCli(validArgs, 'postgresql://invalid:invalid@127.0.0.1:1/unavailable', {
    LEASEMIND_RUNTIME_MODE: 'production'
  });
  assert.notEqual(result.code, 0);
  assert.equal(result.stdout, '');
  assert.deepEqual(JSON.parse(result.stderr), {
    event: 'campaign_outcome_command_failed',
    safe_error_code: CAMPAIGN_OUTCOME_RUNTIME_NOT_SYNTHETIC
  });
});

test('CLI privilege gate rejects an interchangeable Analysis writer connection', { skip: SKIP }, async () => {
  const migrationPool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(migrationPool);
  } finally {
    await migrationPool.end();
  }
  const result = await runCli(
    [
      'record',
      '--campaign-id', '00000000-0000-4000-9400-000000000002',
      '--outcome-code', 'success_via_leasemind',
      '--expected-campaign-version', '1',
      '--idempotency-key', 'wrong-role-probe',
      '--actor-ref', OPERATOR_REF,
      '--confirmation-attested'
    ],
    ANALYSIS_DATABASE_URL
  );
  assert.notEqual(result.code, 0);
  assert.equal(result.stdout, '');
  assert.deepEqual(JSON.parse(result.stderr), {
    event: 'campaign_outcome_command_failed',
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
    property_region: 'CLI Synthetic Region',
    property_city: 'CLI Synthetic City',
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

async function currentVersion(campaignId: string): Promise<number> {
  const pool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 1 });
  try {
    const result = await pool.query<{ aggregate_version: string }>(
      'SELECT aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [campaignId]
    );
    return Number(result.rows[0].aggregate_version);
  } finally {
    await pool.end();
  }
}

test('CLI end-to-end: record dry-run, execute, duplicate execute (replay), then correct dry-run, execute, duplicate execute (replay) -- and never leaks actor_ref/operator_ref', { skip: SKIP }, async () => {
  const migrationPool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(migrationPool);
  } finally {
    await migrationPool.end();
  }

  const campaignId = await createLaunchedFixture('cli-e2e');
  const v1 = await currentVersion(campaignId);
  const idemKey = key('cli-e2e-record');
  const recordArgs = [
    'record',
    '--campaign-id', campaignId,
    '--outcome-code', 'success_via_leasemind',
    '--expected-campaign-version', String(v1),
    '--idempotency-key', idemKey,
    '--actor-ref', OPERATOR_REF,
    '--confirmation-attested'
  ];

  const dryRun = await runCli(recordArgs);
  assert.equal(dryRun.code, 0, dryRun.stderr);
  const dryRunBody = JSON.parse(dryRun.stdout);
  assert.equal(dryRunBody.event, 'campaign_outcome_dry_run_completed');
  assert.equal(dryRunBody.would_succeed, true);
  assert.equal(await currentVersion(campaignId), v1, 'a CLI dry-run must never mutate state');

  const executed = await runCli([...recordArgs, '--execute']);
  assert.equal(executed.code, 0, executed.stderr);
  const executedBody = JSON.parse(executed.stdout);
  assert.equal(executedBody.event, 'campaign_outcome_command_executed');
  assert.equal(executedBody.is_replay, false);
  assert.equal(executedBody.outcome_code, 'success_via_leasemind');
  assert.equal(executedBody.mapped_lifecycle_status, 'Completed');
  const outcomeRecordId = executedBody.outcome_record_id;
  assert.ok(outcomeRecordId);

  const replayed = await runCli([...recordArgs, '--execute']);
  assert.equal(replayed.code, 0, replayed.stderr);
  const replayedBody = JSON.parse(replayed.stdout);
  assert.equal(replayedBody.event, 'campaign_outcome_command_replayed');
  assert.equal(replayedBody.is_replay, true);
  assert.equal(replayedBody.outcome_record_id, outcomeRecordId);

  const v2 = await currentVersion(campaignId);
  const correctIdemKey = key('cli-e2e-correct');
  const correctArgs = [
    'correct',
    '--campaign-id', campaignId,
    '--outcome-code', 'cancelled',
    '--expected-campaign-version', String(v2),
    '--idempotency-key', correctIdemKey,
    '--actor-ref', OPERATOR_REF,
    '--confirmation-attested',
    '--corrects-outcome-record-id', outcomeRecordId,
    '--correction-reason-code', 'OUTCOME_CLASSIFICATION_CORRECTED'
  ];

  const correctDryRun = await runCli(correctArgs);
  assert.equal(correctDryRun.code, 0, correctDryRun.stderr);
  assert.equal(JSON.parse(correctDryRun.stdout).would_succeed, true);

  const correctExecuted = await runCli([...correctArgs, '--execute']);
  assert.equal(correctExecuted.code, 0, correctExecuted.stderr);
  const correctExecutedBody = JSON.parse(correctExecuted.stdout);
  assert.equal(correctExecutedBody.event, 'campaign_outcome_command_executed');
  assert.equal(correctExecutedBody.is_replay, false);
  assert.equal(correctExecutedBody.mapped_lifecycle_status, 'Failed');
  assert.notEqual(correctExecutedBody.outcome_record_id, outcomeRecordId);

  const correctReplayed = await runCli([...correctArgs, '--execute']);
  assert.equal(correctReplayed.code, 0, correctReplayed.stderr);
  const correctReplayedBody = JSON.parse(correctReplayed.stdout);
  assert.equal(correctReplayedBody.is_replay, true);
  assert.equal(correctReplayedBody.outcome_record_id, correctExecutedBody.outcome_record_id);

  // No transcript anywhere across this whole flow ever contains the raw
  // operator_ref/actor_ref value used as input.
  const allOutput = [dryRun, executed, replayed, correctDryRun, correctExecuted, correctReplayed]
    .map(r => `${r.stdout}\n${r.stderr}`)
    .join('\n');
  assert.equal(allOutput.includes(OPERATOR_REF), false, 'CLI output must never echo the operator_ref value');
});
