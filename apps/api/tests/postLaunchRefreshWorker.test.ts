import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { migrateUp } from '../src/db/migrate.js';
import { saveTechnicalAssignmentDraft } from '../src/db/technicalAssignment.js';
import { launchCampaignFromTechnicalAssignment } from '../src/db/launchCampaign.js';
import {
  computeInitialPostLaunchRefreshIdempotencyKey,
  createOrReplayInitialPostLaunchAnalysisSnapshot,
  createOrReplayPreLaunchAnalysisSnapshot
} from '../src/db/analysisSnapshot.js';
import {
  claimPostLaunchRefreshIntents,
  runPostLaunchRefreshWorkerCycle
} from '../src/db/postLaunchRefreshWorker.js';
import {
  ANALYSIS_DATABASE_URL,
  ANALYSIS_WORKER_DATABASE_URL,
  COMMAND_DATABASE_URL,
  MIGRATION_DATABASE_URL,
  TA_DATABASE_URL,
  hasAnalysisDatabase
} from './testDatabaseUrls.js';

let keyCounter = 0;
function key(prefix: string): string {
  keyCounter += 1;
  return `${prefix}-${Date.now()}-${keyCounter}`;
}

function futureDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 30);
  return date.toISOString().slice(0, 10);
}

function propertyPayload(): Record<string, unknown> {
  return {
    property_type: 'office',
    property_country_code: 'RU',
    property_region: 'Worker Synthetic Region',
    property_city: 'Worker Synthetic City',
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

function tenantRequestPayload(): Record<string, unknown> {
  return {
    request_business_category: 'office',
    request_business_stage: 'operating',
    request_country_code: 'RU',
    request_region: 'Worker Synthetic Region',
    request_cities: ['Worker Synthetic City'],
    request_property_types: ['office'],
    request_area_min_sqm: 50,
    request_area_max_sqm: 150,
    request_monthly_budget_max_rub: 250000,
    request_budget_includes_operating_expenses: true,
    request_condition_options: ['ready_to_use'],
    request_move_in_by: futureDate(),
    request_deal_priority: 'balanced'
  };
}

interface Fixture {
  campaignId: string;
  technicalAssignmentId: string;
  sourceRevision: number;
}

async function createLaunchedFixture(
  taPool: pg.Pool,
  analysisPool: pg.Pool,
  commandPool: pg.Pool,
  prefix: string
): Promise<Fixture> {
  const assignment = await saveTechnicalAssignmentDraft(taPool, {
    idempotencyKey: key(`${prefix}-ta`),
    scenario: 'need_tenant',
    payload: propertyPayload()
  });
  assert.equal(assignment.lifecycle_status, 'ready_for_analysis');
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
  return {
    campaignId: launch.campaign_id,
    technicalAssignmentId: assignment.technical_assignment_id,
    sourceRevision: assignment.revision
  };
}

async function queryIntentAsOwner(text: string, values: unknown[] = []): Promise<pg.QueryResult> {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 1 });
  const client = await pool.connect();
  try {
    await client.query('SET ROLE lmapp_post_launch_refresh_owner');
    return await client.query(text, values);
  } finally {
    await client.query('RESET ROLE').catch(() => {});
    client.release();
    await pool.end();
  }
}

async function drainRefreshQueue(workerPool: pg.Pool): Promise<void> {
  const workerId = `test-worker-drain:${randomUUID()}`;
  for (let processed = 0; processed < 100; processed += 1) {
    const cycle = await runPostLaunchRefreshWorkerCycle(workerPool, workerId);
    if (cycle.claimed === 0) return;
  }
  throw new Error('post-launch refresh fixture queue did not drain');
}

test('post-launch worker fixtures: migrations are ready', { skip: !hasAnalysisDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(pool);
  } finally {
    await pool.end();
  }
});

test('AS-C-016: worker claims, calculates and completes a durable post-launch refresh', { skip: !hasAnalysisDatabase }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const workerPool = new pg.Pool({ connectionString: ANALYSIS_WORKER_DATABASE_URL, max: 5 });
  try {
    await drainRefreshQueue(workerPool);
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'worker-complete');
    const cycle = await runPostLaunchRefreshWorkerCycle(workerPool, `test-worker:${randomUUID()}`);
    assert.deepEqual(cycle, { claimed: 1, completed: 1, failed: 0, slaBreachesMarked: 0 });

    const intent = await queryIntentAsOwner(
      `SELECT status, current_analysis_snapshot_id
         FROM leasemind_app.post_launch_refresh_intent
        WHERE campaign_id = $1`,
      [fixture.campaignId]
    );
    assert.equal(intent.rows[0].status, 'completed');
    assert.ok(intent.rows[0].current_analysis_snapshot_id);

    const snapshot = await workerPool.query(
      `SELECT status, analysis_kind, campaign_id, calculation_attempt, results
         FROM leasemind_app.analysis_snapshot
        WHERE analysis_snapshot_id = $1`,
      [intent.rows[0].current_analysis_snapshot_id]
    );
    assert.equal(snapshot.rows[0].status, 'completed');
    assert.equal(snapshot.rows[0].analysis_kind, 'post_launch_refresh');
    assert.equal(snapshot.rows[0].campaign_id, fixture.campaignId);
    assert.equal(snapshot.rows[0].calculation_attempt, 1);
    assert.equal(snapshot.rows[0].results.deal_probability_30d.metric_status, 'insufficient_data');

    const initialKey = computeInitialPostLaunchRefreshIdempotencyKey({
      campaignId: fixture.campaignId,
      propertyId: fixture.technicalAssignmentId,
      tenantRequestId: null,
      technicalAssignmentId: fixture.technicalAssignmentId,
      scenario: 'need_tenant',
      sourceRevision: fixture.sourceRevision
    });
    const mapping = await workerPool.query(
      `SELECT analysis_snapshot_id, retry_of_analysis_snapshot_id
         FROM leasemind_app.analysis_snapshot_idempotency_mapping
        WHERE idempotency_key = $1`,
      [initialKey]
    );
    assert.deepEqual(mapping.rows[0], {
      analysis_snapshot_id: intent.rows[0].current_analysis_snapshot_id,
      retry_of_analysis_snapshot_id: null
    });
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), workerPool.end()]);
  }
});

test('AS-C-016: worker preserves the TenantRequest identity for need_property refresh', { skip: !hasAnalysisDatabase }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const workerPool = new pg.Pool({ connectionString: ANALYSIS_WORKER_DATABASE_URL, max: 5 });
  try {
    await drainRefreshQueue(workerPool);
    const assignment = await saveTechnicalAssignmentDraft(taPool, {
      idempotencyKey: key('worker-tenant-ta'),
      scenario: 'need_property',
      payload: tenantRequestPayload()
    });
    const preLaunch = await createOrReplayPreLaunchAnalysisSnapshot(analysisPool, {
      idempotencyKey: key('worker-tenant-analysis'),
      technicalAssignmentId: assignment.technical_assignment_id,
      expectedRevision: assignment.revision,
      analysisKind: 'pre_launch',
      campaignId: null,
      retryOfAnalysisSnapshotId: null
    });
    const launch = await launchCampaignFromTechnicalAssignment(commandPool, {
      idempotencyKey: key('worker-tenant-launch'),
      technicalAssignmentId: assignment.technical_assignment_id,
      expectedRevision: assignment.revision,
      analysisSnapshotId: preLaunch.analysisSnapshotId,
      contactsGateEvidence: 'synthetic-fixture-acknowledged-v1'
    });

    const cycle = await runPostLaunchRefreshWorkerCycle(workerPool, `test-worker:${randomUUID()}`);
    assert.deepEqual(cycle, { claimed: 1, completed: 1, failed: 0, slaBreachesMarked: 0 });
    const intent = await queryIntentAsOwner(
      `SELECT property_id, tenant_request_id, scenario, status, current_analysis_snapshot_id
         FROM leasemind_app.post_launch_refresh_intent
        WHERE campaign_id = $1`,
      [launch.campaign_id]
    );
    assert.deepEqual(
      {
        property_id: intent.rows[0].property_id,
        tenant_request_id: intent.rows[0].tenant_request_id,
        scenario: intent.rows[0].scenario,
        status: intent.rows[0].status
      },
      {
        property_id: null,
        tenant_request_id: assignment.technical_assignment_id,
        scenario: 'need_property',
        status: 'completed'
      }
    );
    const snapshot = await workerPool.query(
      `SELECT technical_assignment_id, scenario, status
         FROM leasemind_app.analysis_snapshot
        WHERE analysis_snapshot_id = $1`,
      [intent.rows[0].current_analysis_snapshot_id]
    );
    assert.deepEqual(snapshot.rows[0], {
      technical_assignment_id: assignment.technical_assignment_id,
      scenario: 'need_property',
      status: 'completed'
    });
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), workerPool.end()]);
  }
});

test('worker resumes an explicit retry Snapshot and never replays the initial key as the retry target', { skip: !hasAnalysisDatabase }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const workerPool = new pg.Pool({ connectionString: ANALYSIS_WORKER_DATABASE_URL, max: 5 });
  try {
    await drainRefreshQueue(workerPool);
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'worker-retry');
    const firstWorkerId = `test-worker:${randomUUID()}`;
    const [claim] = await claimPostLaunchRefreshIntents(workerPool, firstWorkerId, 1);
    assert.ok(claim);
    assert.equal(claim.currentAnalysisSnapshotId, null);
    const firstAttempt = await createOrReplayInitialPostLaunchAnalysisSnapshot(workerPool, claim);
    await workerPool.query(
      `UPDATE leasemind_app.analysis_snapshot
          SET status = 'failed', generated_at = clock_timestamp(),
              failure = '{"code":"ANALYSIS_GENERATION_FAILED","retryable":true}'::jsonb
        WHERE analysis_snapshot_id = $1`,
      [firstAttempt.analysisSnapshotId]
    );
    await workerPool.query(
      `SELECT leasemind_app.fail_post_launch_refresh_intent($1, $2, $3, $4)`,
      [fixture.campaignId, firstWorkerId, claim.executionClaimCount, firstAttempt.analysisSnapshotId]
    );

    const retrySnapshotId = randomUUID();
    const prior = await analysisPool.query<{ input_fingerprint: string }>(
      `SELECT input_fingerprint FROM leasemind_app.analysis_snapshot WHERE analysis_snapshot_id = $1`,
      [firstAttempt.analysisSnapshotId]
    );
    await analysisPool.query(
      `INSERT INTO leasemind_app.analysis_snapshot (
         analysis_snapshot_id, property_id, source_revision, scenario, analysis_kind,
         campaign_id, calculation_attempt, status, schema_version, method_version,
         country_code, currency, locale, area_unit, rent_period, input_fingerprint
       ) VALUES ($1, $2, $3, 'need_tenant', 'post_launch_refresh', $4, 2, 'pending',
         '1.0', 'synthetic_ru_v1', 'RU', 'RUB', 'ru-RU', 'sqm', 'month', $5)`,
      [
        retrySnapshotId,
        fixture.technicalAssignmentId,
        fixture.sourceRevision,
        fixture.campaignId,
        prior.rows[0].input_fingerprint
      ]
    );
    await analysisPool.query(
      `INSERT INTO leasemind_app.analysis_snapshot_idempotency_mapping
         (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
       VALUES ($1, $2, $3, $4)`,
      [key('worker-explicit-retry'), 'f'.repeat(64), retrySnapshotId, firstAttempt.analysisSnapshotId]
    );
    await analysisPool.query(
      `SELECT leasemind_app.request_post_launch_refresh_retry($1, $2)`,
      [fixture.campaignId, retrySnapshotId]
    );

    const cycle = await runPostLaunchRefreshWorkerCycle(workerPool, `test-worker:${randomUUID()}`);
    assert.deepEqual(cycle, { claimed: 1, completed: 1, failed: 0, slaBreachesMarked: 0 });
    const attempts = await workerPool.query(
      `SELECT analysis_snapshot_id, calculation_attempt, status
         FROM leasemind_app.analysis_snapshot
        WHERE technical_assignment_id = $1
          AND analysis_kind = 'post_launch_refresh'
          AND campaign_id = $2
        ORDER BY calculation_attempt`,
      [fixture.technicalAssignmentId, fixture.campaignId]
    );
    assert.deepEqual(attempts.rows, [
      { analysis_snapshot_id: firstAttempt.analysisSnapshotId, calculation_attempt: 1, status: 'failed' },
      { analysis_snapshot_id: retrySnapshotId, calculation_attempt: 2, status: 'completed' }
    ]);
    const intent = await queryIntentAsOwner(
      `SELECT status, current_analysis_snapshot_id
         FROM leasemind_app.post_launch_refresh_intent
        WHERE campaign_id = $1`,
      [fixture.campaignId]
    );
    assert.deepEqual(intent.rows[0], { status: 'completed', current_analysis_snapshot_id: retrySnapshotId });
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), workerPool.end()]);
  }
});
