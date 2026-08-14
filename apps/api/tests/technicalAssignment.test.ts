import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import pg from 'pg';
import { buildApp } from '../src/app.js';
import { migrateUp, migrateDown } from '../src/db/migrate.js';
import { createOrReplayPreLaunchAnalysisSnapshot } from '../src/db/analysisSnapshot.js';
import { deriveCampaignIdFromIdempotencyKey } from '../src/db/createCampaign.js';
import {
  MIGRATION_DATABASE_URL,
  API_DATABASE_URL,
  COMMAND_DATABASE_URL,
  TA_DATABASE_URL,
  ANALYSIS_DATABASE_URL,
  hasDatabase,
  hasAnalysisDatabase
} from './testDatabaseUrls.js';

// All 27 acceptance scenarios from 02_PRODUCT/CAMPAIGN_TECHNICAL_ASSIGNMENT.md
// sections 15-16 (CTA-L-001..010, CTA-T-001..011, CTA-C-001..006), plus
// negative probes for PII/exact-address leakage. DB-privilege positive/
// negative probes and startup-gate probes live in
// tests/dbPrivilegeBoundary.test.ts, next to the equivalent ADR-0005/0007
// probes. See 03_ARCHITECTURE/decisions/ADR-0008-technical-assignment-implementation.md
// for how "переход в ready" / pre-launch Analysis / Contacts Gate map onto
// this implementation (no separate HTTP command for either -- see the ADR
// for the exact correspondence used in the assertions below).
//
// This file owns its own migration lifecycle (safe: package.json runs test
// files sequentially via --test-concurrency=1).

function futureDate(daysFromNow: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function minimalProperty(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    property_type: 'office',
    property_country_code: 'RU',
    property_region: 'Synthetic Region',
    property_city: 'Synthetic City',
    property_area_sqm: 100,
    property_condition: 'ready_to_use',
    property_available_from: futureDate(10),
    property_monthly_rent_rub: 150000,
    property_operating_expenses_included: true,
    property_utilities_included: true,
    property_allowed_business_categories: ['office'],
    property_deal_priority: 'balanced',
    ...overrides
  };
}

function minimalTenantRequest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    request_business_category: 'office',
    request_business_stage: 'operating',
    request_country_code: 'RU',
    request_region: 'Synthetic Region',
    request_cities: ['Synthetic City'],
    request_property_types: ['office'],
    request_area_min_sqm: 50,
    request_area_max_sqm: 150,
    request_monthly_budget_max_rub: 200000,
    request_budget_includes_operating_expenses: true,
    request_condition_options: ['ready_to_use'],
    request_move_in_by: futureDate(10),
    request_deal_priority: 'balanced',
    ...overrides
  };
}

interface Pools {
  pool: pg.Pool;
  commandPool: pg.Pool;
  technicalAssignmentPool: pg.Pool;
  analysisPool: pg.Pool;
}

function makePools(): Pools {
  return {
    pool: new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 }),
    commandPool: new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 }),
    technicalAssignmentPool: new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 }),
    analysisPool: new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 })
  };
}

let idempotencyCounter = 0;
function nextKey(prefix: string): string {
  idempotencyCounter += 1;
  return `${prefix}-${idempotencyCounter}-${Date.now()}`;
}

async function createPreLaunchSnapshot(
  analysisPool: pg.Pool,
  technicalAssignmentId: string,
  expectedRevision: number,
  prefix: string
): Promise<string> {
  const result = await createOrReplayPreLaunchAnalysisSnapshot(analysisPool, {
    idempotencyKey: nextKey(prefix),
    technicalAssignmentId,
    expectedRevision,
    analysisKind: 'pre_launch',
    campaignId: null,
    retryOfAnalysisSnapshotId: null
  });
  return result.analysisSnapshotId;
}

async function queryAsMigrator(text: string, values: unknown[] = []): Promise<pg.QueryResult> {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 1 });
  try {
    return await pool.query(text, values);
  } finally {
    await pool.end();
  }
}

async function queryRefreshIntentAsOwner(text: string, values: unknown[] = []): Promise<pg.QueryResult> {
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

test('migration up (fresh) prepares the schema for Technical Assignment acceptance scenarios', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(pool);
  } finally {
    await pool.end();
  }
});

// ---------------------------------------------------------------------------
// need_tenant / Property -- CTA-L-001..010 (doc section 15)
// ---------------------------------------------------------------------------

test('CTA-L-001: a minimally valid Property payload is ready_for_analysis', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('cta-l-001'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    assert.equal(response.statusCode, 201);
    const body = response.json();
    assert.equal(body.lifecycle_status, 'ready_for_analysis');
    assert.equal(body.revision, 1);
  } finally {
    await app.close();
  }
});

test('CTA-L-002: a missing required field (property_monthly_rent_rub) keeps the draft in "draft", not ready', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const payload = minimalProperty();
    delete payload.property_monthly_rent_rub;
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('cta-l-002'), scenario: 'need_tenant', payload }
    });
    // This implementation folds "transform/ready check" into the save
    // command itself (ADR-0008 section 1): a missing required field is not
    // a save-time error, it is reflected as lifecycle_status staying
    // 'draft' instead of 'ready_for_analysis' -- functionally the same
    // "not ready to become a real Property" outcome the doc describes.
    assert.equal(response.statusCode, 201);
    assert.equal(response.json().lifecycle_status, 'draft');
  } finally {
    await app.close();
  }
});

test('CTA-L-003: an absent optional field (power/ceiling/parking/exact address) does not block readiness', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('cta-l-003'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    assert.equal(response.statusCode, 201);
    const body = response.json();
    assert.equal(body.lifecycle_status, 'ready_for_analysis');
    assert.equal(body.payload.property_power_kw, null);
    assert.equal(body.payload.property_ceiling_height_m, null);
    assert.equal(body.payload.property_parking_spaces, null);
    assert.equal(body.has_exact_address, false);
  } finally {
    await app.close();
  }
});

test('CTA-L-004: a category present in both allowed and excluded is a cross-field conflict', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: nextKey('cta-l-004'),
        scenario: 'need_tenant',
        payload: minimalProperty({
          property_allowed_business_categories: ['office', 'cafe'],
          property_excluded_business_categories: ['cafe']
        })
      }
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error, 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT');
  } finally {
    await app.close();
  }
});

test('CTA-L-005: a valid exact address is stored protected and never returned', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: nextKey('cta-l-005'),
        scenario: 'need_tenant',
        payload: minimalProperty({ property_exact_address: 'Synthetic street 1, building 2' })
      }
    });
    assert.equal(response.statusCode, 201);
    const body = response.json();
    assert.equal(body.has_exact_address, true);
    assert.equal('property_exact_address' in body.payload, false);
    assert.equal(response.body.includes('Synthetic street 1'), false, 'raw address must never appear in the response');

    const addressRow = await pools.technicalAssignmentPool.query(
      'SELECT exact_address FROM leasemind_app.property_protected_address WHERE property_id = $1',
      [body.technical_assignment_id]
    );
    assert.equal(addressRow.rows[0].exact_address, 'Synthetic street 1, building 2');
  } finally {
    await app.close();
  }
});

test('CTA-L-006: personal data in additional requirements is rejected before any write', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const key = nextKey('cta-l-006');
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: key,
        scenario: 'need_tenant',
        payload: minimalProperty({ property_additional_requirements: 'Call me at +7 999 123 45 67' })
      }
    });
    assert.equal(response.statusCode, 400);
    const body = response.json();
    assert.equal(body.error, 'TECHNICAL_ASSIGNMENT_PERSONAL_DATA_FORBIDDEN');
    assert.equal(body.field_id, 'property_additional_requirements');
    assert.equal(response.body.includes('999 123 45 67'), false);

    const row = await pools.technicalAssignmentPool.query('SELECT 1 FROM leasemind_app.property WHERE idempotency_key = $1', [key]);
    assert.equal(row.rowCount, 0, 'no row must have been created for a rejected first save');
  } finally {
    await app.close();
  }
});

test('CTA-L-007: changing the price creates a new revision and the old revision becomes stale for launch', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const key = nextKey('cta-l-007');
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: key, scenario: 'need_tenant', payload: minimalProperty() }
    });
    assert.equal(first.json().revision, 1);

    const second = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: key,
        technical_assignment_id: first.json().technical_assignment_id,
        expected_revision: first.json().revision,
        scenario: 'need_tenant',
        payload: minimalProperty({ property_monthly_rent_rub: 200000 })
      }
    });
    assert.equal(second.statusCode, 200);
    const secondBody = second.json();
    assert.equal(secondBody.revision, 2);

    const staleLaunch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: nextKey('cta-l-007-launch'),
        technical_assignment_id: secondBody.technical_assignment_id,
        expected_revision: 1,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(staleLaunch.statusCode, 400);
    assert.equal(staleLaunch.json().error, 'TECHNICAL_ASSIGNMENT_ANALYSIS_STALE');
  } finally {
    await app.close();
  }
});

test('CTA-L-008: no code path changes a confirmed price automatically (AI Manager/Recommendation flow is out of scope)', { skip: !hasDatabase }, async () => {
  // AI Manager, Recommendation objects and Human Decision Gateway are not
  // built in Sprint 4 DEVELOPMENT scope. The only implemented invariant
  // this scenario maps to: the price field only ever changes via the
  // explicit, user-initiated save-draft command (already exercised by
  // CTA-L-007) -- there is no separate, autonomous write path.
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    assert.equal(app.hasRoute({ method: 'POST', url: '/api/v1/technical-assignments/:id/ai-recommendation' }), false);
    assert.equal(app.hasRoute({ method: 'PATCH', url: '/api/v1/technical-assignments/:id' }), false);
  } finally {
    await app.close();
  }
});

test('CTA-L-009: repeating the save command with the same idempotency_key does not create a duplicate Property', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const key = nextKey('cta-l-009');
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: key, scenario: 'need_tenant', payload: minimalProperty() }
    });
    const second = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: key, scenario: 'need_tenant', payload: minimalProperty() }
    });
    assert.equal(first.json().technical_assignment_id, second.json().technical_assignment_id);
    assert.equal(second.json().revision, 1, 'an identical resubmission must not bump revision');

    const rows = await pools.technicalAssignmentPool.query('SELECT count(*)::int AS count FROM leasemind_app.property WHERE idempotency_key = $1', [
      key
    ]);
    assert.equal(rows.rows[0].count, 1);
  } finally {
    await app.close();
  }
});

test('regression: reload -> edit -> save updates the restored Technical Assignment instead of creating a duplicate', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const creationKey = nextKey('restore-create');
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: creationKey, scenario: 'need_tenant', payload: minimalProperty() }
    });
    const original = first.json();

    // A remounted frontend has a fresh command key but the server-owned ID
    // and revision returned by GET /technical-assignments/{id}.
    const update = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: nextKey('restore-update'),
        technical_assignment_id: original.technical_assignment_id,
        expected_revision: original.revision,
        scenario: 'need_tenant',
        payload: minimalProperty({ property_monthly_rent_rub: 175000 })
      }
    });
    assert.equal(update.statusCode, 200);
    assert.equal(update.json().technical_assignment_id, original.technical_assignment_id);
    assert.equal(update.json().revision, original.revision + 1);

    const rows = await pools.technicalAssignmentPool.query(
      'SELECT count(*)::int AS count, min(idempotency_key) AS creation_key FROM leasemind_app.property WHERE property_id = $1',
      [original.technical_assignment_id]
    );
    assert.equal(rows.rows[0].count, 1);
    assert.equal(rows.rows[0].creation_key, creationKey, 'an update command must not replace the draft creation identity');
  } finally {
    await app.close();
  }
});

test('regression: concurrent updates from one revision allow one winner and reject the stale writer', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('concurrent-update-create'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const original = first.json();
    const request = (rent: number) =>
      app.inject({
        method: 'POST',
        url: '/api/v1/technical-assignments',
        payload: {
          idempotency_key: nextKey(`concurrent-update-${rent}`),
          technical_assignment_id: original.technical_assignment_id,
          expected_revision: original.revision,
          scenario: 'need_tenant',
          payload: minimalProperty({ property_monthly_rent_rub: rent })
        }
      });

    const responses = await Promise.all([request(180000), request(190000)]);
    assert.deepEqual(
      responses.map(response => response.statusCode).sort(),
      [200, 400]
    );
    const conflict = responses.find(response => response.statusCode === 400)!;
    assert.equal(conflict.json().error, 'TECHNICAL_ASSIGNMENT_REVISION_CONFLICT');

    const current = await app.inject({ method: 'GET', url: `/api/v1/technical-assignments/${original.technical_assignment_id}` });
    assert.equal(current.json().revision, original.revision + 1);
    assert.ok([180000, 190000].includes(current.json().payload.property_monthly_rent_rub));
  } finally {
    await app.close();
  }
});

test('regression: concurrent first saves cannot bind one idempotency key to both scenarios', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const key = nextKey('concurrent-cross-scenario');
    const [property, tenantRequest] = await Promise.all([
      app.inject({
        method: 'POST',
        url: '/api/v1/technical-assignments',
        payload: { idempotency_key: key, scenario: 'need_tenant', payload: minimalProperty() }
      }),
      app.inject({
        method: 'POST',
        url: '/api/v1/technical-assignments',
        payload: { idempotency_key: key, scenario: 'need_property', payload: minimalTenantRequest() }
      })
    ]);
    assert.deepEqual([property.statusCode, tenantRequest.statusCode].sort(), [201, 400]);
    const rejected = property.statusCode === 400 ? property : tenantRequest;
    assert.equal(rejected.json().error, 'TECHNICAL_ASSIGNMENT_SCENARIO_IMMUTABLE');

    const counts = await pools.technicalAssignmentPool.query(
      `SELECT
         (SELECT count(*)::int FROM leasemind_app.property WHERE idempotency_key = $1) AS properties,
         (SELECT count(*)::int FROM leasemind_app.tenant_request WHERE idempotency_key = $1) AS tenant_requests`,
      [key]
    );
    assert.equal(counts.rows[0].properties + counts.rows[0].tenant_requests, 1);
  } finally {
    await app.close();
  }
});

test('regression: update target ID and expected revision must be supplied together', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const base = {
      idempotency_key: nextKey('paired-update-fields'),
      scenario: 'need_tenant',
      payload: minimalProperty()
    };
    const idWithoutRevision = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { ...base, technical_assignment_id: '00000000-0000-4000-8000-000000000123' }
    });
    const revisionWithoutId = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { ...base, expected_revision: 1 }
    });
    assert.equal(idWithoutRevision.statusCode, 400);
    assert.equal(revisionWithoutId.statusCode, 400);
  } finally {
    await app.close();
  }
});

test('CTA-L-010: neither the API reader nor the campaign writer can read the protected exact address', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: nextKey('cta-l-010'),
        scenario: 'need_tenant',
        payload: minimalProperty({ property_exact_address: 'Synthetic protected street 5' })
      }
    });
    assert.equal(created.statusCode, 201);

    await assert.rejects(
      pools.pool.query('SELECT exact_address FROM leasemind_app.property_protected_address LIMIT 1'),
      /permission denied/,
      'lmapp_api_reader must not read the protected address table'
    );
    await assert.rejects(
      pools.commandPool.query('SELECT exact_address FROM leasemind_app.property_protected_address LIMIT 1'),
      /permission denied/,
      'lmapp_campaign_writer must not read the protected address table'
    );
  } finally {
    await app.close();
  }
});

// ---------------------------------------------------------------------------
// need_property / TenantRequest -- CTA-T-001..011 (doc section 16)
// ---------------------------------------------------------------------------

test('CTA-T-001: a minimally valid TenantRequest payload is ready_for_analysis', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('cta-t-001'), scenario: 'need_property', payload: minimalTenantRequest() }
    });
    assert.equal(response.statusCode, 201);
    assert.equal(response.json().lifecycle_status, 'ready_for_analysis');
  } finally {
    await app.close();
  }
});

test('CTA-T-002: a missing required field (request_monthly_budget_max_rub) keeps the draft in "draft"', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const payload = minimalTenantRequest();
    delete payload.request_monthly_budget_max_rub;
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('cta-t-002'), scenario: 'need_property', payload }
    });
    assert.equal(response.statusCode, 201);
    assert.equal(response.json().lifecycle_status, 'draft');
  } finally {
    await app.close();
  }
});

test('CTA-T-003: absent optional fields (occupancy/power/ceiling/parking/districts) do not block readiness', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('cta-t-003'), scenario: 'need_property', payload: minimalTenantRequest() }
    });
    assert.equal(response.statusCode, 201);
    const body = response.json();
    assert.equal(body.lifecycle_status, 'ready_for_analysis');
    assert.equal(body.payload.request_expected_occupancy_people, null);
    assert.deepEqual(body.payload.request_districts, []);
  } finally {
    await app.close();
  }
});

test('regression: multiple request_districts values are saved in order, without loss or dedup collapse, and survive a subsequent read', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const districts = ['Центральный округ', 'Северный округ', 'Юго-Западный округ'];
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: nextKey('cta-t-districts'),
        scenario: 'need_property',
        payload: minimalTenantRequest({ request_districts: districts })
      }
    });
    assert.equal(response.statusCode, 201);
    const body = response.json();
    assert.deepEqual(body.payload.request_districts, districts);

    const fetched = await app.inject({ method: 'GET', url: `/api/v1/technical-assignments/${body.technical_assignment_id}` });
    assert.equal(fetched.statusCode, 200);
    assert.deepEqual(fetched.json().payload.request_districts, districts);
  } finally {
    await app.close();
  }
});

test('CTA-T-004: an invalid area range (min > max) is a cross-field conflict', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: nextKey('cta-t-004'),
        scenario: 'need_property',
        payload: minimalTenantRequest({ request_area_min_sqm: 200, request_area_max_sqm: 100 })
      }
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error, 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT');
  } finally {
    await app.close();
  }
});

test('CTA-T-005: business_category=other without the required *_other note is rejected', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: nextKey('cta-t-005'),
        scenario: 'need_property',
        payload: minimalTenantRequest({ request_business_category: 'other' })
      }
    });
    assert.equal(response.statusCode, 400);
    const body = response.json();
    assert.equal(body.error, 'TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING');
    assert.equal(body.field_id, 'request_business_category_other');
  } finally {
    await app.close();
  }
});

test('CTA-T-006: a feature present in both required and excluded is a conflict', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: nextKey('cta-t-006'),
        scenario: 'need_property',
        payload: minimalTenantRequest({ request_required_features: ['parking'], request_excluded_features: ['parking'] })
      }
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error, 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT');
  } finally {
    await app.close();
  }
});

test('CTA-T-007: contacts in free text are rejected and never stored', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const key = nextKey('cta-t-007');
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: key,
        scenario: 'need_property',
        payload: minimalTenantRequest({ request_additional_requirements: 'reach me at synthetic.contact@example.test' })
      }
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error, 'TECHNICAL_ASSIGNMENT_PERSONAL_DATA_FORBIDDEN');
    const row = await pools.technicalAssignmentPool.query('SELECT 1 FROM leasemind_app.tenant_request WHERE idempotency_key = $1', [key]);
    assert.equal(row.rowCount, 0);
  } finally {
    await app.close();
  }
});

test('CTA-T-008: no code path changes a confirmed budget automatically (AI Manager flow out of scope)', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    assert.equal(app.hasRoute({ method: 'PATCH', url: '/api/v1/technical-assignments/:id' }), false);
  } finally {
    await app.close();
  }
});

test('CTA-T-009: changing location/area after readiness creates a new revision, making the prior one stale', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const key = nextKey('cta-t-009');
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: key, scenario: 'need_property', payload: minimalTenantRequest() }
    });
    const staleRevision = first.json().revision;

    const second = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: key,
        technical_assignment_id: first.json().technical_assignment_id,
        expected_revision: staleRevision,
        scenario: 'need_property',
        payload: minimalTenantRequest({ request_area_min_sqm: 60 })
      }
    });
    const secondBody = second.json();
    assert.equal(secondBody.revision, staleRevision + 1);

    const launch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: nextKey('cta-t-009-launch'),
        technical_assignment_id: secondBody.technical_assignment_id,
        expected_revision: staleRevision,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(launch.statusCode, 400);
    assert.equal(launch.json().error, 'TECHNICAL_ASSIGNMENT_ANALYSIS_STALE');
  } finally {
    await app.close();
  }
});

test('CTA-T-010: repeating the save command with the same idempotency_key does not create a duplicate TenantRequest', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const key = nextKey('cta-t-010');
    await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: key, scenario: 'need_property', payload: minimalTenantRequest() }
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: key, scenario: 'need_property', payload: minimalTenantRequest() }
    });
    const rows = await pools.technicalAssignmentPool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.tenant_request WHERE idempotency_key = $1',
      [key]
    );
    assert.equal(rows.rows[0].count, 1);
  } finally {
    await app.close();
  }
});

test('CTA-T-011: a maximum rent rate is persisted with the derived maximum total budget', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const key = nextKey('cta-t-011');
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: key,
        scenario: 'need_property',
        payload: minimalTenantRequest({
          request_monthly_rent_rate_max_rub_per_sqm: 4000,
          request_monthly_budget_max_rub: 600000
        })
      }
    });
    assert.equal(response.statusCode, 201);
    const body = response.json();
    assert.equal(body.lifecycle_status, 'ready_for_analysis');
    assert.equal(body.payload.request_monthly_rent_rate_max_rub_per_sqm, 4000);
    assert.equal(body.payload.request_monthly_budget_max_rub, 600000);

    const fetched = await app.inject({ method: 'GET', url: `/api/v1/technical-assignments/${body.technical_assignment_id}` });
    assert.equal(fetched.statusCode, 200);
    assert.equal(fetched.json().payload.request_monthly_rent_rate_max_rub_per_sqm, 4000);
    assert.equal(fetched.json().payload.request_monthly_budget_max_rub, 600000);

    const stored = await pools.technicalAssignmentPool.query(
      `SELECT request_monthly_rent_rate_max_rub_per_sqm, request_monthly_budget_max_rub
         FROM leasemind_app.tenant_request
        WHERE idempotency_key = $1`,
      [key]
    );
    assert.equal(Number(stored.rows[0].request_monthly_rent_rate_max_rub_per_sqm), 4000);
    assert.equal(stored.rows[0].request_monthly_budget_max_rub, 600000);

    const invalid = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: nextKey('cta-t-011-invalid'),
        scenario: 'need_property',
        payload: minimalTenantRequest({
          request_monthly_rent_rate_max_rub_per_sqm: 4000.001,
          request_monthly_budget_max_rub: 600000
        })
      }
    });
    assert.equal(invalid.statusCode, 400);
    assert.equal(invalid.json().error, 'TECHNICAL_ASSIGNMENT_FIELD_VALUE_INVALID');
    assert.equal(invalid.json().field_id, 'request_monthly_rent_rate_max_rub_per_sqm');
  } finally {
    await app.close();
  }
});

// ---------------------------------------------------------------------------
// Combined lifecycle flow -- CTA-C-001..006 (doc section 16, "C" scenarios)
// ---------------------------------------------------------------------------

test('CTA-C-001: saving an incomplete draft creates only the draft, no Property promotion or Campaign', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('cta-c-001'), scenario: 'need_tenant', payload: { property_type: 'office' } }
    });
    assert.equal(response.statusCode, 201);
    assert.equal(response.json().lifecycle_status, 'draft');
  } finally {
    await app.close();
  }
});

test('CTA-C-002: an invalid value in the draft is rejected and the raw value is not stored', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const key = nextKey('cta-c-002');
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: key, scenario: 'need_tenant', payload: { property_type: 'not-a-real-type' } }
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().error, 'TECHNICAL_ASSIGNMENT_FIELD_VALUE_INVALID');
    const row = await pools.technicalAssignmentPool.query('SELECT 1 FROM leasemind_app.property WHERE idempotency_key = $1', [key]);
    assert.equal(row.rowCount, 0);
  } finally {
    await app.close();
  }
});

test('CTA-C-003: once ready_for_analysis, the Technical Assignment is readable with the same id/revision and no Campaign exists yet', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('cta-c-003'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const body = saved.json();
    assert.equal(body.lifecycle_status, 'ready_for_analysis');

    const fetched = await app.inject({ method: 'GET', url: `/api/v1/technical-assignments/${body.technical_assignment_id}` });
    assert.equal(fetched.statusCode, 200);
    assert.equal(fetched.json().technical_assignment_id, body.technical_assignment_id);
    assert.equal(fetched.json().revision, body.revision);

    const campaignDetail = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${body.technical_assignment_id}` });
    assert.equal(campaignDetail.statusCode, 404, 'no Campaign must exist for this id yet');
  } finally {
    await app.close();
  }
});

test('CTA-C-004: changing a field after readiness bumps the revision and blocks launch on the old revision', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const key = nextKey('cta-c-004');
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: key, scenario: 'need_tenant', payload: minimalProperty() }
    });
    const firstRevision = first.json().revision;

    const second = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: key,
        technical_assignment_id: first.json().technical_assignment_id,
        expected_revision: firstRevision,
        scenario: 'need_tenant',
        payload: minimalProperty({ property_area_sqm: 250 })
      }
    });
    const secondBody = second.json();
    assert.equal(secondBody.revision, firstRevision + 1);

    const launchWithStaleRevision = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: nextKey('cta-c-004-launch'),
        technical_assignment_id: secondBody.technical_assignment_id,
        expected_revision: firstRevision,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(launchWithStaleRevision.statusCode, 400);
    assert.equal(launchWithStaleRevision.json().error, 'TECHNICAL_ASSIGNMENT_ANALYSIS_STALE');
  } finally {
    await app.close();
  }
});

test('CTA-C-005: attempting launch without the Contacts Gate marker is rejected and creates no Campaign', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('cta-c-005'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const body = saved.json();

    const launch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: nextKey('cta-c-005-launch'),
        technical_assignment_id: body.technical_assignment_id,
        expected_revision: body.revision,
        contacts_gate_evidence: 'not-the-real-marker'
      }
    });
    assert.equal(launch.statusCode, 400);
    assert.equal(launch.json().error, 'TECHNICAL_ASSIGNMENT_CONTACTS_GATE_REQUIRED');

    const campaignDetail = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${body.technical_assignment_id}` });
    assert.equal(campaignDetail.statusCode, 404);
  } finally {
    await app.close();
  }
});

// ---------------------------------------------------------------------------
// Sprint 4 defect 2: Contacts Gate bypass. These are deliberately "direct
// API call" probes -- no UI involved at all -- proving the server-owned
// check (ADR-0008 section 2, apps/api/src/db/contactsGate.ts) rejects every
// way of NOT having gone through the real synthetic-fixture-acknowledged-v1
// marker, and that a rejected launch never mutates the Technical Assignment
// (lifecycle_status stays exactly what it was) or creates a Campaign.
// ---------------------------------------------------------------------------

test('regression: launch is rejected when contacts_gate_evidence is missing from the request body entirely', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('gate-missing'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const body = saved.json();

    const launch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: nextKey('gate-missing-launch'),
        technical_assignment_id: body.technical_assignment_id,
        expected_revision: body.revision
        // contacts_gate_evidence intentionally omitted
      }
    });
    assert.equal(launch.statusCode, 400);

    const taAfter = await app.inject({ method: 'GET', url: `/api/v1/technical-assignments/${body.technical_assignment_id}` });
    assert.equal(taAfter.json().lifecycle_status, 'ready_for_analysis', 'a rejected launch must not mutate the Technical Assignment');
    const campaignDetail = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${body.technical_assignment_id}` });
    assert.equal(campaignDetail.statusCode, 404);
  } finally {
    await app.close();
  }
});

test('regression: launch is rejected when contacts_gate_evidence is an empty string', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('gate-empty'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const body = saved.json();

    const launch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: nextKey('gate-empty-launch'),
        technical_assignment_id: body.technical_assignment_id,
        expected_revision: body.revision,
        contacts_gate_evidence: ''
      }
    });
    assert.equal(launch.statusCode, 400);

    const taAfter = await app.inject({ method: 'GET', url: `/api/v1/technical-assignments/${body.technical_assignment_id}` });
    assert.equal(taAfter.json().lifecycle_status, 'ready_for_analysis');
    const campaignDetail = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${body.technical_assignment_id}` });
    assert.equal(campaignDetail.statusCode, 404);
  } finally {
    await app.close();
  }
});

test('regression: launch is rejected when contacts_gate_evidence is whitespace-only', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('gate-whitespace'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const body = saved.json();

    const launch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: nextKey('gate-whitespace-launch'),
        technical_assignment_id: body.technical_assignment_id,
        expected_revision: body.revision,
        contacts_gate_evidence: '   '
      }
    });
    assert.equal(launch.statusCode, 400);
    assert.equal(launch.json().error, 'TECHNICAL_ASSIGNMENT_CONTACTS_GATE_REQUIRED');

    const taAfter = await app.inject({ method: 'GET', url: `/api/v1/technical-assignments/${body.technical_assignment_id}` });
    assert.equal(taAfter.json().lifecycle_status, 'ready_for_analysis');
    const campaignDetail = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${body.technical_assignment_id}` });
    assert.equal(campaignDetail.statusCode, 404);
  } finally {
    await app.close();
  }
});

test('regression: launch is rejected when contacts_gate_evidence has the right text but the wrong case', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('gate-case'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const body = saved.json();

    const launch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: nextKey('gate-case-launch'),
        technical_assignment_id: body.technical_assignment_id,
        expected_revision: body.revision,
        contacts_gate_evidence: 'Synthetic-Fixture-Acknowledged-V1'
      }
    });
    assert.equal(launch.statusCode, 400);
    assert.equal(launch.json().error, 'TECHNICAL_ASSIGNMENT_CONTACTS_GATE_REQUIRED');

    const taAfter = await app.inject({ method: 'GET', url: `/api/v1/technical-assignments/${body.technical_assignment_id}` });
    assert.equal(taAfter.json().lifecycle_status, 'ready_for_analysis');
    const campaignDetail = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${body.technical_assignment_id}` });
    assert.equal(campaignDetail.statusCode, 404);
  } finally {
    await app.close();
  }
});

test('regression: a direct API launch attempt against a still-draft Technical Assignment is rejected even with valid contacts_gate_evidence ("Contacts only after Analysis", enforced server-side too)', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    // A draft missing a required field (property_monthly_rent_rub) never
    // reaches ready_for_analysis -- exactly the state a tampered/forged UI
    // could try to launch from directly, skipping Analysis and Contacts
    // entirely.
    const { property_monthly_rent_rub: _omit, ...incomplete } = minimalProperty();
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('gate-draft'), scenario: 'need_tenant', payload: incomplete }
    });
    const body = saved.json();
    assert.equal(body.lifecycle_status, 'draft');

    const launch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: nextKey('gate-draft-launch'),
        technical_assignment_id: body.technical_assignment_id,
        expected_revision: body.revision,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(launch.statusCode, 400);
    assert.equal(launch.json().error, 'TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED');

    const taAfter = await app.inject({ method: 'GET', url: `/api/v1/technical-assignments/${body.technical_assignment_id}` });
    assert.equal(taAfter.json().lifecycle_status, 'draft', 'a rejected launch must not mutate the Technical Assignment');
    const campaignDetail = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${body.technical_assignment_id}` });
    assert.equal(campaignDetail.statusCode, 404);
  } finally {
    await app.close();
  }
});

test('AS-C-015: a new launch without a pre-launch Snapshot creates no partial Campaign records', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('as-c-015'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const assignment = saved.json();
    const launchKey = nextKey('as-c-015-launch');
    const launch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: launchKey,
        technical_assignment_id: assignment.technical_assignment_id,
        expected_revision: assignment.revision,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(launch.statusCode, 400);
    assert.equal(launch.json().error, 'TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED');

    const partials = await queryAsMigrator(
      `SELECT
         (SELECT count(*)::int FROM leasemind_app.campaign_event_log WHERE campaign_id = $1) AS events,
         (SELECT count(*)::int FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1) AS campaign,
         (SELECT count(*)::int FROM leasemind_app.campaign_subject_link_projection WHERE campaign_id = $1) AS subject_link`,
      [deriveCampaignIdFromIdempotencyKey(launchKey)]
    );
    const intents = await queryRefreshIntentAsOwner(
      'SELECT count(*)::int AS count FROM leasemind_app.post_launch_refresh_intent WHERE campaign_id = $1',
      [deriveCampaignIdFromIdempotencyKey(launchKey)]
    );
    assert.deepEqual(partials.rows[0], { events: 0, campaign: 0, subject_link: 0 });
    assert.equal(intents.rows[0].count, 0);
  } finally {
    await app.close();
  }
});

test('ADR-0009 legacy_v1: replay without analysis_snapshot_id remains compatible after migration 008', { skip: !hasDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('legacy-replay-ta'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const assignment = saved.json();
    const launchKey = nextKey('legacy-replay-launch');
    const campaignId = deriveCampaignIdFromIdempotencyKey(launchKey);
    const commandHash = createHash('sha256')
      .update(`LEASEMIND_CAMPAIGN_LAUNCH_V1|COMMAND|${campaignId}|${assignment.technical_assignment_id}|${assignment.revision}`)
      .digest('hex');

    await queryAsMigrator(
      `WITH inserted_projection AS (
         INSERT INTO leasemind_app.campaign_current_state_projection
           (campaign_id, status, aggregate_version, created_at, updated_at)
         VALUES ($1, 'Created', 1, clock_timestamp(), clock_timestamp())
         RETURNING created_at
       ), inserted_event AS (
         INSERT INTO leasemind_app.campaign_event_log
           (event_id, campaign_id, event_sequence, event_type, schema_version, payload,
            idempotency_key, command_hash, previous_event_hash, event_hash, occurred_at)
         SELECT $2, $1, 1, 'campaign.status_recorded.v1', 1, '{"status":"Created"}'::jsonb,
                $3, $4, repeat('0', 64), repeat('a', 64), created_at
         FROM inserted_projection
       )
       INSERT INTO leasemind_app.campaign_subject_link_projection
         (campaign_id, scenario, property_id, tenant_request_id, source_revision,
          source_schema_version, linked_at, authorization_contract_version,
          analysis_snapshot_id, authorized_analysis_kind, authorized_analysis_status)
       SELECT $1, 'need_tenant', $5, NULL, $6, '1.0', created_at, 'legacy_v1', NULL, NULL, NULL
       FROM inserted_projection`,
      [campaignId, randomUUID(), launchKey, commandHash, assignment.technical_assignment_id, assignment.revision]
    );

    const replay = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: launchKey,
        technical_assignment_id: assignment.technical_assignment_id,
        expected_revision: assignment.revision,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(replay.statusCode, 200, replay.body);
    assert.equal(replay.json().campaign_id, campaignId);
  } finally {
    await app.close();
  }
});

test('CTA-C-006 / AS-C-016: a fresh Snapshot launch atomically creates one Campaign, authorization link and durable refresh intent', { skip: !hasAnalysisDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('cta-c-006'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const body = saved.json();
    assert.equal(body.lifecycle_status, 'ready_for_analysis');
    const analysisSnapshotId = await createPreLaunchSnapshot(
      pools.analysisPool,
      body.technical_assignment_id,
      body.revision,
      'cta-c-006-analysis'
    );

    const launchKey = nextKey('cta-c-006-launch');
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: launchKey,
        technical_assignment_id: body.technical_assignment_id,
        expected_revision: body.revision,
        analysis_snapshot_id: analysisSnapshotId,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(first.statusCode, 201);
    const campaign = first.json();
    assert.equal(campaign.status, 'Created');

    const missingAnalysisReplay = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: launchKey,
        technical_assignment_id: body.technical_assignment_id,
        expected_revision: body.revision,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(missingAnalysisReplay.statusCode, 400);
    assert.equal(missingAnalysisReplay.json().error, 'TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED');

    const differentAnalysisReplay = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: launchKey,
        technical_assignment_id: body.technical_assignment_id,
        expected_revision: body.revision,
        analysis_snapshot_id: randomUUID(),
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(differentAnalysisReplay.statusCode, 400);
    assert.equal(differentAnalysisReplay.json().error, 'TECHNICAL_ASSIGNMENT_REVISION_CONFLICT');

    const replay = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: launchKey,
        technical_assignment_id: body.technical_assignment_id,
        expected_revision: body.revision,
        analysis_snapshot_id: analysisSnapshotId,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(replay.statusCode, 200);
    assert.deepEqual(replay.json(), campaign, 'a replay must return the exact same Campaign, not a new one');

    const fetchedTa = await app.inject({ method: 'GET', url: `/api/v1/technical-assignments/${body.technical_assignment_id}` });
    assert.equal(fetchedTa.json().lifecycle_status, 'campaign_started');

    const events = await pools.commandPool.query(
      "SELECT event_type FROM leasemind_app.campaign_event_log WHERE campaign_id = $1 ORDER BY event_sequence ASC",
      [campaign.campaign_id]
    );
    assert.deepEqual(
      events.rows.map((r: { event_type: string }) => r.event_type),
      ['campaign.subject_linked.v1', 'campaign.status_recorded.v1']
    );

    const authorization = await queryAsMigrator(
      `SELECT
         link.authorization_contract_version,
         link.analysis_snapshot_id,
         link.authorized_analysis_kind,
         link.authorized_analysis_status
       FROM leasemind_app.campaign_subject_link_projection link
       WHERE link.campaign_id = $1`,
      [campaign.campaign_id]
    );
    const intent = await queryRefreshIntentAsOwner(
      `SELECT
         status AS intent_status,
         analysis_kind AS intent_analysis_kind,
         current_analysis_snapshot_id,
         extract(epoch FROM (sla_deadline_at - launched_at))::int AS sla_seconds
       FROM leasemind_app.post_launch_refresh_intent
       WHERE campaign_id = $1`,
      [campaign.campaign_id]
    );
    assert.equal(authorization.rowCount, 1);
    assert.equal(intent.rowCount, 1);
    assert.deepEqual(
      { ...authorization.rows[0], ...intent.rows[0] },
      {
        authorization_contract_version: 'analysis_v2',
        analysis_snapshot_id: analysisSnapshotId,
        authorized_analysis_kind: 'pre_launch',
        authorized_analysis_status: authorization.rows[0].authorized_analysis_status,
        intent_status: 'pending',
        intent_analysis_kind: 'post_launch_refresh',
        current_analysis_snapshot_id: null,
        sla_seconds: 900
      }
    );
    assert.ok(['completed', 'insufficient_data'].includes(authorization.rows[0].authorized_analysis_status));
  } finally {
    await app.close();
  }
});

test('AS-C-012/015: a Snapshot for revision N cannot authorize launch of revision N+1', { skip: !hasAnalysisDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const taKey = nextKey('stale-analysis-ta');
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: taKey, scenario: 'need_tenant', payload: minimalProperty() }
    });
    const revisionOne = first.json();
    const staleSnapshotId = await createPreLaunchSnapshot(
      pools.analysisPool,
      revisionOne.technical_assignment_id,
      revisionOne.revision,
      'stale-analysis-snapshot'
    );
    const second = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: taKey,
        technical_assignment_id: revisionOne.technical_assignment_id,
        expected_revision: revisionOne.revision,
        scenario: 'need_tenant',
        payload: minimalProperty({ property_area_sqm: 125 })
      }
    });
    const revisionTwo = second.json();
    const launchKey = nextKey('stale-analysis-launch');
    const launch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: launchKey,
        technical_assignment_id: revisionTwo.technical_assignment_id,
        expected_revision: revisionTwo.revision,
        analysis_snapshot_id: staleSnapshotId,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(launch.statusCode, 400);
    assert.equal(launch.json().error, 'TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED');
    const campaign = await queryAsMigrator(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [deriveCampaignIdFromIdempotencyKey(launchKey)]
    );
    assert.equal(campaign.rows[0].count, 0);
  } finally {
    await app.close();
  }
});

test('AS-C-016: need_property launch stores the TenantRequest identity in both durable records', { skip: !hasAnalysisDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('tenant-launch-ta'), scenario: 'need_property', payload: minimalTenantRequest() }
    });
    const assignment = saved.json();
    const analysisSnapshotId = await createPreLaunchSnapshot(
      pools.analysisPool,
      assignment.technical_assignment_id,
      assignment.revision,
      'tenant-launch-analysis'
    );
    const launch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: nextKey('tenant-launch-command'),
        technical_assignment_id: assignment.technical_assignment_id,
        expected_revision: assignment.revision,
        analysis_snapshot_id: analysisSnapshotId,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(launch.statusCode, 201, launch.body);
    const link = await queryAsMigrator(
      `SELECT property_id, tenant_request_id, scenario
       FROM leasemind_app.campaign_subject_link_projection WHERE campaign_id = $1`,
      [launch.json().campaign_id]
    );
    const intent = await queryRefreshIntentAsOwner(
      `SELECT property_id, tenant_request_id, scenario
       FROM leasemind_app.post_launch_refresh_intent WHERE campaign_id = $1`,
      [launch.json().campaign_id]
    );
    const expected = { property_id: null, tenant_request_id: assignment.technical_assignment_id, scenario: 'need_property' };
    assert.deepEqual(link.rows[0], expected);
    assert.deepEqual(intent.rows[0], expected);
  } finally {
    await app.close();
  }
});

test('regression: simultaneous retries of one Analysis-authorized launch converge to one Campaign and one durable intent', { skip: !hasAnalysisDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('concurrent-launch-ta'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const assignment = saved.json();
    const analysisSnapshotId = await createPreLaunchSnapshot(
      pools.analysisPool,
      assignment.technical_assignment_id,
      assignment.revision,
      'concurrent-launch-analysis'
    );
    const payload = {
      idempotency_key: nextKey('concurrent-launch-command'),
      technical_assignment_id: assignment.technical_assignment_id,
      expected_revision: assignment.revision,
      analysis_snapshot_id: analysisSnapshotId,
      contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
    };

    const responses = await Promise.all([
      app.inject({ method: 'POST', url: '/api/v1/campaigns', payload }),
      app.inject({ method: 'POST', url: '/api/v1/campaigns', payload })
    ]);
    assert.deepEqual(
      responses.map(response => response.statusCode).sort(),
      [200, 201]
    );
    assert.deepEqual(responses[0].json(), responses[1].json());

    const campaignId = responses[0].json().campaign_id;
    const events = await pools.commandPool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_event_log WHERE campaign_id = $1',
      [campaignId]
    );
    assert.equal(events.rows[0].count, 2, 'one subject link plus one Created event, never duplicates');
    const links = await queryAsMigrator(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_subject_link_projection WHERE campaign_id = $1',
      [campaignId]
    );
    const intents = await queryRefreshIntentAsOwner(
      'SELECT count(*)::int AS count FROM leasemind_app.post_launch_refresh_intent WHERE campaign_id = $1',
      [campaignId]
    );
    assert.equal(links.rows[0].count, 1);
    assert.equal(intents.rows[0].count, 1);
  } finally {
    await app.close();
  }
});

test('AS-C-027: revoking a Snapshot evidence revision blocks launch without partial writes', { skip: !hasAnalysisDatabase }, async () => {
  const pools = makePools();
  const app = buildApp({ ...pools, logger: false });
  try {
    const saved = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: { idempotency_key: nextKey('revoked-launch-ta'), scenario: 'need_tenant', payload: minimalProperty() }
    });
    const assignment = saved.json();
    const analysisSnapshotId = await createPreLaunchSnapshot(
      pools.analysisPool,
      assignment.technical_assignment_id,
      assignment.revision,
      'revoked-launch-analysis'
    );
    const evidence = await queryAsMigrator(
      'SELECT evidence_dataset_revision FROM leasemind_app.analysis_snapshot WHERE analysis_snapshot_id = $1',
      [analysisSnapshotId]
    );
    await queryAsMigrator(
      `INSERT INTO leasemind_app.evidence_dataset_revocation
         (evidence_dataset_revision, evidence_revocation_reason_code, revoked_by_actor_ref)
       VALUES ($1, 'SYNTHETIC_TEST_REVOCATION', 'test:privacy-safe-actor')`,
      [evidence.rows[0].evidence_dataset_revision]
    );

    const launchKey = nextKey('revoked-launch-command');
    const launch = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: launchKey,
        technical_assignment_id: assignment.technical_assignment_id,
        expected_revision: assignment.revision,
        analysis_snapshot_id: analysisSnapshotId,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(launch.statusCode, 400);
    assert.equal(launch.json().error, 'TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED');
    const campaignId = deriveCampaignIdFromIdempotencyKey(launchKey);
    const partials = await queryAsMigrator(
      `SELECT
         (SELECT count(*)::int FROM leasemind_app.campaign_event_log WHERE campaign_id = $1) AS events,
         (SELECT count(*)::int FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1) AS campaign,
         (SELECT count(*)::int FROM leasemind_app.campaign_subject_link_projection WHERE campaign_id = $1) AS link`,
      [campaignId]
    );
    const intent = await queryRefreshIntentAsOwner(
      'SELECT count(*)::int AS count FROM leasemind_app.post_launch_refresh_intent WHERE campaign_id = $1',
      [campaignId]
    );
    assert.deepEqual(partials.rows[0], { events: 0, campaign: 0, link: 0 });
    assert.equal(intent.rows[0].count, 0);
  } finally {
    await app.close();
  }
});

test('migration 006 down is blocked once a subject_linked event exists (cannot discard event data it cannot represent)', { skip: !hasDatabase }, async () => {
  // CTA-C-006 above created a 'campaign.subject_linked.v1' row. The Event
  // Log is immutable (Sprint 0/2 controlled artifact: DELETE/UPDATE are
  // rejected by a database trigger, CAMPAIGN_EVENT_LOG_IMMUTABLE), and
  // 006's down migration intentionally refuses to run while such a row
  // exists (ADR-0008) rather than silently drop it. Both guarantees are
  // deliberate and must hold at the same time: a real rollback can never
  // discard event data, and it can never bypass immutability to make room
  // for itself. This is a permanent property of any database that has ever
  // launched a Campaign, not a defect -- the standalone "provision -> up ->
  // down -> empty catalog" pass exercised in this session's regression
  // (no seed, no Campaign launches) is what proves the migration chain
  // itself round-trips cleanly in the ordinary case.
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await assert.rejects(() => migrateDown(pool), /campaign_event_log_payload_check/);
    const schemaExists = await pool.query("SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'leasemind_app') AS exists");
    assert.equal(schemaExists.rows[0].exists, true);
    const rateColumnExists = await pool.query(
      `SELECT EXISTS (
         SELECT 1
           FROM information_schema.columns
          WHERE table_schema = 'leasemind_app'
            AND table_name = 'tenant_request'
            AND column_name = 'request_monthly_rent_rate_max_rub_per_sqm'
       ) AS exists`
    );
    assert.equal(rateColumnExists.rows[0].exists, true, 'a blocked full downgrade must roll back migration 007 too');
  } finally {
    await pool.end();
  }
});
