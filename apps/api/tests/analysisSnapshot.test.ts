import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { buildApp } from '../src/app.js';
import { migrateUp } from '../src/db/migrate.js';
import { saveTechnicalAssignmentDraft } from '../src/db/technicalAssignment.js';
import { computeAnalysisCommandHash, type CreateAnalysisSnapshotInput } from '../src/db/analysisSnapshot.js';
import {
  ANALYSIS_DATABASE_URL,
  API_DATABASE_URL,
  MIGRATION_DATABASE_URL,
  TA_DATABASE_URL,
  hasAnalysisDatabase
} from './testDatabaseUrls.js';

function futureDate(): string {
  return '2027-01-15';
}

function propertyPayload(rate: number, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    property_type: 'office',
    property_country_code: 'RU',
    property_region: 'Analysis Synthetic Region',
    property_city: 'Analysis Synthetic City',
    property_area_sqm: 100,
    property_condition: 'ready_to_use',
    property_available_from: futureDate(),
    property_monthly_rent_rub: rate * 100,
    property_operating_expenses_included: true,
    property_utilities_included: true,
    property_allowed_business_categories: ['office'],
    property_deal_priority: 'balanced',
    ...overrides
  };
}

function tenantRequestPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    request_business_category: 'office',
    request_business_stage: 'operating',
    request_country_code: 'RU',
    request_region: 'Analysis Synthetic Region',
    request_cities: ['Analysis Synthetic City'],
    request_property_types: ['office'],
    request_area_min_sqm: 50,
    request_area_max_sqm: 150,
    request_monthly_budget_max_rub: 250000,
    request_budget_includes_operating_expenses: true,
    request_condition_options: ['ready_to_use'],
    request_move_in_by: futureDate(),
    request_deal_priority: 'balanced',
    ...overrides
  };
}

let keyCounter = 0;
function key(prefix: string): string {
  keyCounter += 1;
  return `${prefix}-${Date.now()}-${keyCounter}`;
}

async function createReadyProperty(pool: pg.Pool, rate: number, overrides: Record<string, unknown> = {}): Promise<string> {
  const saved = await saveTechnicalAssignmentDraft(pool, {
    idempotencyKey: key('analysis-property'),
    scenario: 'need_tenant',
    payload: propertyPayload(rate, overrides)
  });
  assert.equal(saved.lifecycle_status, 'ready_for_analysis');
  return saved.technical_assignment_id;
}

async function createReadyRequest(pool: pg.Pool, overrides: Record<string, unknown> = {}): Promise<string> {
  const saved = await saveTechnicalAssignmentDraft(pool, {
    idempotencyKey: key('analysis-request'),
    scenario: 'need_property',
    payload: tenantRequestPayload(overrides)
  });
  assert.equal(saved.lifecycle_status, 'ready_for_analysis');
  return saved.technical_assignment_id;
}

function makeApp(): { app: ReturnType<typeof buildApp>; analysisPool: pg.Pool } {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 3 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 4 });
  return { app: buildApp({ pool, analysisPool, logger: false }), analysisPool };
}

let propertySubjectId = '';
let requestSubjectId = '';
let propertySnapshotId = '';
let propertyCreateKey = '';

test('Analysis fixtures: migrations and synthetic comparison records are ready', { skip: !hasAnalysisDatabase }, async () => {
  const migrationPool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 3 });
  try {
    await migrateUp(migrationPool);
    propertySubjectId = await createReadyProperty(taPool, 1500, {
      property_exact_address: 'Protected Analysis fixture address'
    });
    for (const rate of [1000, 1200, 1500, 1800, 2000]) {
      await createReadyProperty(taPool, rate);
    }
    await createReadyRequest(taPool);
    requestSubjectId = await createReadyRequest(taPool, {
      request_monthly_rent_rate_max_rub_per_sqm: 1600
    });
  } finally {
    await migrationPool.end();
    await taPool.end();
  }
});

test('AS-C-001/005/010: pre-launch Analysis is terminal, exact-decimal and probability-safe', { skip: !hasAnalysisDatabase }, async () => {
  const { app } = makeApp();
  try {
    propertyCreateKey = key('analysis-create');
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/analysis-snapshots',
      payload: {
        idempotency_key: propertyCreateKey,
        technical_assignment_id: propertySubjectId,
        expected_revision: 1,
        analysis_kind: 'pre_launch',
        campaign_id: null,
        retry_of_analysis_snapshot_id: null
      }
    });
    assert.equal(response.statusCode, 201, response.body);
    const body = response.json();
    propertySnapshotId = body.analysis_snapshot_id;
    assert.equal(body.status, 'completed');
    assert.equal(body.freshness_status, 'current');
    assert.equal(body.results.price_adequacy.value.subject_rate_rub_per_sqm_month, '1500.00');
    assert.equal(body.results.price_adequacy.value.median_rub_per_sqm_month, '1500.00');
    assert.equal(body.results.deal_probability_30d.metric_status, 'insufficient_data');
    assert.equal(body.results.deal_probability_30d.value, null);
    assert.equal(response.body.includes('Protected Analysis fixture address'), false);
  } finally {
    await app.close();
  }
});

test('AS-C-003: replay of the same normalized command returns the original Snapshot with 200', { skip: !hasAnalysisDatabase }, async () => {
  const { app } = makeApp();
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/analysis-snapshots',
      payload: {
        idempotency_key: propertyCreateKey,
        technical_assignment_id: propertySubjectId,
        expected_revision: 1,
        analysis_kind: 'pre_launch',
        campaign_id: null,
        retry_of_analysis_snapshot_id: null
      }
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json().analysis_snapshot_id, propertySnapshotId);
    assert.equal(response.json().calculation_attempt, 1);
  } finally {
    await app.close();
  }
});

test('AS-C-003/014: explicit retry creates attempt 2 while the old key remains pinned to failed attempt 1', { skip: !hasAnalysisDatabase }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const subjectId = await createReadyProperty(taPool, 1450);
  await taPool.end();

  const originalKey = key('analysis-failed-original');
  const failedSnapshotId = randomUUID();
  const originalCommand: CreateAnalysisSnapshotInput = {
    idempotencyKey: originalKey,
    technicalAssignmentId: subjectId,
    expectedRevision: 1,
    analysisKind: 'pre_launch',
    campaignId: null,
    retryOfAnalysisSnapshotId: null
  };
  const { app, analysisPool } = makeApp();
  try {
    await analysisPool.query(
      `INSERT INTO leasemind_app.analysis_snapshot (
         analysis_snapshot_id, property_id, source_revision, scenario, analysis_kind,
         calculation_attempt, status, schema_version, method_version,
         country_code, currency, locale, area_unit, rent_period, input_fingerprint
       ) VALUES ($1, $2, 1, 'need_tenant', 'pre_launch', 1, 'pending', '1.0',
         'synthetic_ru_v1', 'RU', 'RUB', 'ru-RU', 'sqm', 'month', $3)`,
      [failedSnapshotId, subjectId, 'a'.repeat(64)]
    );
    await analysisPool.query(
      `INSERT INTO leasemind_app.analysis_snapshot_idempotency_mapping
         (idempotency_key, command_hash, analysis_snapshot_id, retry_of_analysis_snapshot_id)
       VALUES ($1, $2, $3, NULL)`,
      [originalKey, computeAnalysisCommandHash(originalCommand), failedSnapshotId]
    );
    await analysisPool.query(
      `UPDATE leasemind_app.analysis_snapshot
          SET status = 'failed', generated_at = clock_timestamp(),
              failure = '{"code":"ANALYSIS_GENERATION_FAILED","retryable":true}'::jsonb
        WHERE analysis_snapshot_id = $1`,
      [failedSnapshotId]
    );

    const missingTarget = await app.inject({
      method: 'POST',
      url: '/api/v1/analysis-snapshots',
      payload: {
        idempotency_key: key('analysis-retry-missing-target'),
        technical_assignment_id: subjectId,
        expected_revision: 1,
        analysis_kind: 'pre_launch',
        campaign_id: null,
        retry_of_analysis_snapshot_id: null
      }
    });
    assert.equal(missingTarget.statusCode, 409, missingTarget.body);
    assert.equal(missingTarget.json().code, 'ANALYSIS_RETRY_TARGET_MISMATCH');

    const retry = await app.inject({
      method: 'POST',
      url: '/api/v1/analysis-snapshots',
      payload: {
        idempotency_key: key('analysis-explicit-retry'),
        technical_assignment_id: subjectId,
        expected_revision: 1,
        analysis_kind: 'pre_launch',
        campaign_id: null,
        retry_of_analysis_snapshot_id: failedSnapshotId
      }
    });
    assert.equal(retry.statusCode, 201, retry.body);
    assert.equal(retry.json().calculation_attempt, 2);
    assert.notEqual(retry.json().analysis_snapshot_id, failedSnapshotId);

    const oldKeyReplay = await app.inject({
      method: 'POST',
      url: '/api/v1/analysis-snapshots',
      payload: {
        idempotency_key: originalKey,
        technical_assignment_id: subjectId,
        expected_revision: 1,
        analysis_kind: 'pre_launch',
        campaign_id: null,
        retry_of_analysis_snapshot_id: null
      }
    });
    assert.equal(oldKeyReplay.statusCode, 200, oldKeyReplay.body);
    assert.equal(oldKeyReplay.json().analysis_snapshot_id, failedSnapshotId);
    assert.equal(oldKeyReplay.json().calculation_attempt, 1);
    assert.equal(oldKeyReplay.json().status, 'failed');
  } finally {
    await app.close();
  }
});

test('AS-C-004: concurrent different keys converge to one Snapshot and preserve both mappings', { skip: !hasAnalysisDatabase }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const subjectId = await createReadyProperty(taPool, 1550);
  await taPool.end();
  const { app, analysisPool } = makeApp();
  const keyOne = key('analysis-concurrent-a');
  const keyTwo = key('analysis-concurrent-b');
  const payload = (idempotencyKey: string) => ({
    idempotency_key: idempotencyKey,
    technical_assignment_id: subjectId,
    expected_revision: 1,
    analysis_kind: 'pre_launch',
    campaign_id: null,
    retry_of_analysis_snapshot_id: null
  });
  try {
    const [first, second] = await Promise.all([
      app.inject({ method: 'POST', url: '/api/v1/analysis-snapshots', payload: payload(keyOne) }),
      app.inject({ method: 'POST', url: '/api/v1/analysis-snapshots', payload: payload(keyTwo) })
    ]);
    assert.deepEqual([first.statusCode, second.statusCode].sort(), [200, 201]);
    assert.equal(first.json().analysis_snapshot_id, second.json().analysis_snapshot_id);
    assert.equal(first.json().calculation_attempt, 1);
    assert.equal(second.json().calculation_attempt, 1);
    const mappings = await analysisPool.query(
      `SELECT analysis_snapshot_id
         FROM leasemind_app.analysis_snapshot_idempotency_mapping
        WHERE idempotency_key = ANY($1::text[])
        ORDER BY idempotency_key`,
      [[keyOne, keyTwo]]
    );
    assert.equal(mappings.rowCount, 2);
    assert.equal(mappings.rows[0].analysis_snapshot_id, mappings.rows[1].analysis_snapshot_id);
  } finally {
    await app.close();
  }
});

test('AS-C-017: both recovery GET endpoints return the same persisted Snapshot', { skip: !hasAnalysisDatabase }, async () => {
  const { app } = makeApp();
  try {
    const byId = await app.inject({ method: 'GET', url: `/api/v1/analysis-snapshots/${propertySnapshotId}` });
    const current = await app.inject({
      method: 'GET',
      url: `/api/v1/technical-assignments/${propertySubjectId}/analysis-snapshots/current?revision=1&analysis_kind=pre_launch`
    });
    assert.equal(byId.statusCode, 200, byId.body);
    assert.equal(current.statusCode, 200, current.body);
    assert.equal(byId.json().analysis_snapshot_id, propertySnapshotId);
    assert.equal(current.json().analysis_snapshot_id, propertySnapshotId);
    assert.deepEqual(current.json(), byId.json());
  } finally {
    await app.close();
  }
});

test('AS-C-012: a persisted Snapshot becomes stale after the Technical Assignment revision changes', { skip: !hasAnalysisDatabase }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const subjectId = await createReadyProperty(taPool, 1525);
  const { app } = makeApp();
  try {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/analysis-snapshots',
      payload: {
        idempotency_key: key('analysis-stale-read-create'),
        technical_assignment_id: subjectId,
        expected_revision: 1,
        analysis_kind: 'pre_launch',
        campaign_id: null,
        retry_of_analysis_snapshot_id: null
      }
    });
    assert.equal(created.statusCode, 201, created.body);

    const updated = await saveTechnicalAssignmentDraft(taPool, {
      idempotencyKey: key('analysis-stale-read-update'),
      technicalAssignmentId: subjectId,
      expectedRevision: 1,
      scenario: 'need_tenant',
      payload: propertyPayload(1525, { property_area_sqm: 110 })
    });
    assert.equal(updated.revision, 2);

    const stale = await app.inject({
      method: 'GET',
      url: `/api/v1/analysis-snapshots/${created.json().analysis_snapshot_id}`
    });
    assert.equal(stale.statusCode, 200, stale.body);
    assert.equal(stale.json().freshness_status, 'stale');
    assert.equal(stale.json().freshness_reason, 'revision_changed');
  } finally {
    await taPool.end();
    await app.close();
  }
});

test('AS-C-006: explicit tenant rate basis is persisted without deriving a replacement field', { skip: !hasAnalysisDatabase }, async () => {
  const { app } = makeApp();
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/analysis-snapshots',
      payload: {
        idempotency_key: key('analysis-request-create'),
        technical_assignment_id: requestSubjectId,
        expected_revision: 1,
        analysis_kind: 'pre_launch',
        campaign_id: null,
        retry_of_analysis_snapshot_id: null
      }
    });
    assert.equal(response.statusCode, 201, response.body);
    assert.equal(response.json().results.price_adequacy.value.rate_basis, 'explicit_rate_cap');
    assert.equal(response.json().results.price_adequacy.value.subject_rate_rub_per_sqm_month, '1600.00');
  } finally {
    await app.close();
  }
});

test('AS-C-002/012: draft and revision mismatch are rejected without a Snapshot', { skip: !hasAnalysisDatabase }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const draft = await saveTechnicalAssignmentDraft(taPool, {
    idempotencyKey: key('analysis-draft'),
    scenario: 'need_tenant',
    payload: { property_country_code: 'RU' }
  });
  await taPool.end();
  const { app } = makeApp();
  try {
    const draftResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/analysis-snapshots',
      payload: {
        idempotency_key: key('analysis-draft-command'),
        technical_assignment_id: draft.technical_assignment_id,
        expected_revision: 1,
        analysis_kind: 'pre_launch',
        campaign_id: null,
        retry_of_analysis_snapshot_id: null
      }
    });
    assert.equal(draftResponse.statusCode, 409, draftResponse.body);
    assert.equal(draftResponse.json().code, 'ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_READY');

    const staleResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/analysis-snapshots',
      payload: {
        idempotency_key: key('analysis-stale-command'),
        technical_assignment_id: propertySubjectId,
        expected_revision: 999,
        analysis_kind: 'pre_launch',
        campaign_id: null,
        retry_of_analysis_snapshot_id: null
      }
    });
    assert.equal(staleResponse.statusCode, 409, staleResponse.body);
    assert.equal(staleResponse.json().code, 'ANALYSIS_REVISION_CONFLICT');
  } finally {
    await app.close();
  }
});

test('AS-C-020: synthetic_ru_v1 refuses a Technical Assignment from another market', { skip: !hasAnalysisDatabase }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const subjectId = await createReadyProperty(taPool, 1500);
  const { app } = makeApp();
  try {
    await taPool.query(
      'UPDATE leasemind_app.property SET property_country_code = $2 WHERE property_id = $1',
      [subjectId, 'KZ']
    );
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/analysis-snapshots',
      payload: {
        idempotency_key: key('analysis-unsupported-market'),
        technical_assignment_id: subjectId,
        expected_revision: 1,
        analysis_kind: 'pre_launch',
        campaign_id: null,
        retry_of_analysis_snapshot_id: null
      }
    });
    assert.equal(response.statusCode, 400, response.body);
    assert.equal(response.json().code, 'ANALYSIS_MARKET_UNSUPPORTED');
  } finally {
    await taPool.query(
      'UPDATE leasemind_app.property SET property_country_code = $2 WHERE property_id = $1',
      [subjectId, 'RU']
    ).catch(() => {});
    await taPool.end();
    await app.close();
  }
});

test('same idempotency key with another normalized command fails safely without leaking values', { skip: !hasAnalysisDatabase }, async () => {
  const { app } = makeApp();
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/analysis-snapshots',
      payload: {
        idempotency_key: propertyCreateKey,
        technical_assignment_id: propertySubjectId,
        expected_revision: 1,
        analysis_kind: 'post_launch_refresh',
        campaign_id: randomUUID(),
        retry_of_analysis_snapshot_id: null
      }
    });
    assert.equal(response.statusCode, 409, response.body);
    assert.equal(response.json().code, 'ANALYSIS_IDEMPOTENCY_CONFLICT');
    assert.equal(response.json().retryable, false);
    assert.equal(response.body.includes(propertyCreateKey), false);
    assert.equal(response.body.includes(propertySubjectId), false);
  } finally {
    await app.close();
  }
});
