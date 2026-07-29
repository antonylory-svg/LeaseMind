import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import pg from 'pg';
import { buildApp } from '../src/app.js';
import { migrateUp, migrateDown } from '../src/db/migrate.js';
import { seedCampaigns, SYNTHETIC_CAMPAIGN_SEEDS } from '../src/db/seed.js';
import { CAMPAIGN_STATUSES } from '../src/db/campaigns.js';

const UNREACHABLE_CONNECTION_STRING = 'postgres://synthetic:synthetic@127.0.0.1:1/synthetic';
const hasDatabase = Boolean(process.env.DATABASE_URL);
const MIGRATION_FILE = '001_campaign_current_state_projection.up.sql';

// Everything in this file that touches real Postgres catalog/data requires a
// live, disposable, synthetic-only database (DATABASE_URL). The DB-unavailable
// probe near the end is the one exception -- it deliberately never needs one.
test('migration up creates the exact catalog: schema, enum, table, constraints', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  try {
    const result = await migrateUp(pool);
    assert.ok(result.applied.includes(MIGRATION_FILE));

    const schemaExists = await pool.query(
      "SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'leasemind_app') AS exists"
    );
    assert.equal(schemaExists.rows[0].exists, true);

    const tableExists = await pool.query(
      "SELECT to_regclass('leasemind_app.campaign_current_state_projection') IS NOT NULL AS exists"
    );
    assert.equal(tableExists.rows[0].exists, true);

    const enumValues = await pool.query(`
      SELECT enumlabel FROM pg_enum
        JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
       WHERE pg_type.typname = 'campaign_status'
       ORDER BY enumsortorder
    `);
    assert.deepEqual(
      enumValues.rows.map(row => row.enumlabel),
      [...CAMPAIGN_STATUSES]
    );
    assert.equal(enumValues.rows.length, 11);

    const primaryKey = await pool.query(`
      SELECT count(*)::int AS count FROM pg_constraint
       WHERE conrelid = 'leasemind_app.campaign_current_state_projection'::regclass
         AND contype = 'p'
    `);
    assert.equal(primaryKey.rows[0].count, 1);

    const checkConstraints = await pool.query(`
      SELECT count(*)::int AS count FROM pg_constraint
       WHERE conrelid = 'leasemind_app.campaign_current_state_projection'::regclass
         AND contype = 'c'
    `);
    assert.ok(
      checkConstraints.rows[0].count >= 3,
      'expected uuid-format, aggregate_version and updated_at>=created_at checks'
    );

    // Behavioral constraint proofs, not just catalog metadata.
    await assert.rejects(
      pool.query(
        "INSERT INTO leasemind_app.campaign_current_state_projection (campaign_id, status) VALUES ('11111111-1111-1111-1111-111111111111', 'Created')"
      ),
      /violates check constraint/,
      'non-v4/v7 uuid must be rejected'
    );
    await assert.rejects(
      pool.query(
        "INSERT INTO leasemind_app.campaign_current_state_projection (campaign_id, status, aggregate_version) VALUES ('00000000-0000-4000-8000-000000000fff', 'Created', 0)"
      ),
      /violates check constraint/,
      'aggregate_version below 1 must be rejected'
    );
    await assert.rejects(
      pool.query(
        "INSERT INTO leasemind_app.campaign_current_state_projection (campaign_id, status, created_at, updated_at) VALUES ('00000000-0000-4000-8000-000000000ffe', 'Created', now(), now() - interval '1 minute')"
      ),
      /violates check constraint/,
      'updated_at earlier than created_at must be rejected'
    );
    await assert.rejects(
      pool.query(
        "INSERT INTO leasemind_app.campaign_current_state_projection (campaign_id, status) VALUES ('00000000-0000-4000-8000-000000000ffd', 'NotAStatus')"
      ),
      /invalid input value for enum/,
      'a status outside the 11 approved values must be rejected'
    );
  } finally {
    await pool.end();
  }
});

test('re-running migration up is idempotent (no error, migration skipped)', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  try {
    const result = await migrateUp(pool);
    assert.deepEqual(result.applied, []);
    assert.ok(result.skipped.includes(MIGRATION_FILE));
  } finally {
    await pool.end();
  }
});

test('a checksum mismatch on an already-applied migration is rejected', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  try {
    const migrationPath = new URL('../migrations/001_campaign_current_state_projection.up.sql', import.meta.url);
    const realSql = await readFile(migrationPath, 'utf8');
    const realChecksum = createHash('sha256').update(realSql).digest('hex');

    await pool.query(
      "UPDATE leasemind_app.schema_migrations SET checksum = repeat('0', 64) WHERE filename = $1",
      [MIGRATION_FILE]
    );

    await assert.rejects(migrateUp(pool), /MIGRATION_CHECKSUM_MISMATCH/);

    // Restore the correct checksum so later tests (seed, API, down) proceed
    // against a consistent, correctly-tracked ledger. The row is fixed in
    // place, never deleted: up.sql is not safe to re-run against an
    // already-existing type/table (CREATE TYPE/CREATE TABLE, no IF NOT EXISTS).
    await pool.query('UPDATE leasemind_app.schema_migrations SET checksum = $1 WHERE filename = $2', [
      realChecksum,
      MIGRATION_FILE
    ]);

    const result = await migrateUp(pool);
    assert.deepEqual(result.applied, []);
    assert.ok(result.skipped.includes(MIGRATION_FILE));
  } finally {
    await pool.end();
  }
});

test('synthetic seed inserts exactly 11 campaigns, one per approved status', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  try {
    await pool.query('DELETE FROM leasemind_app.campaign_current_state_projection');
    assert.equal(SYNTHETIC_CAMPAIGN_SEEDS.length, 11);

    const result = await seedCampaigns(pool);
    assert.equal(result.inserted, 11);
    assert.equal(result.skipped, 0);

    const rows = await pool.query(
      'SELECT status FROM leasemind_app.campaign_current_state_projection ORDER BY campaign_id ASC'
    );
    assert.deepEqual(
      rows.rows.map(row => row.status).sort(),
      [...CAMPAIGN_STATUSES].sort()
    );
  } finally {
    await pool.end();
  }
});

test('re-running the synthetic seed does not create duplicates', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  try {
    const result = await seedCampaigns(pool);
    assert.equal(result.inserted, 0);
    assert.equal(result.skipped, 11);

    const count = await pool.query('SELECT count(*)::int AS count FROM leasemind_app.campaign_current_state_projection');
    assert.equal(count.rows[0].count, 11);
  } finally {
    await pool.end();
  }
});

test('GET /api/v1/campaigns returns all 11 synthetic campaigns, sorted deterministically', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    const response = await app.inject({ method: 'GET', url: '/api/v1/campaigns' });
    assert.equal(response.statusCode, 200);
    const body = response.json() as { campaigns: Array<{ campaign_id: string; status: string }> };
    assert.equal(body.campaigns.length, 11);
    const ids = body.campaigns.map(c => c.campaign_id);
    assert.deepEqual(ids, [...ids].sort());
    assert.deepEqual(
      body.campaigns.map(c => c.status).sort(),
      [...CAMPAIGN_STATUSES].sort()
    );
  } finally {
    await app.close();
  }
});

test('GET /api/v1/campaigns/:campaignId returns 200 for an existing campaign', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    const target = SYNTHETIC_CAMPAIGN_SEEDS[0];
    const response = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${target.campaignId}` });
    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.campaign_id, target.campaignId);
    assert.equal(body.status, target.status);
    assert.equal(body.aggregate_version, '1');
  } finally {
    await app.close();
  }
});

test('GET /api/v1/campaigns/:campaignId rejects malformed UUIDs with 400', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    const malformedValues = ['not-a-uuid', '12345', '00000000-0000-4000-8000', 'aaaaaaaa-aaaa-4aaa-zzzz-aaaaaaaaaaaa'];
    for (const malformed of malformedValues) {
      const response = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${encodeURIComponent(malformed)}` });
      assert.equal(response.statusCode, 400, `input: ${JSON.stringify(malformed)}`);
      assert.deepEqual(response.json(), { error: 'INVALID_CAMPAIGN_ID' });
    }
  } finally {
    await app.close();
  }
});

test(
  'GET /api/v1/campaigns/:campaignId rejects forbidden UUID versions (v1/v2/v3/v5/v6/v8) with 400',
  { skip: !hasDatabase },
  async () => {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    const app = buildApp({ pool, logger: false });
    try {
      for (const version of ['1', '2', '3', '5', '6', '8']) {
        const forbidden = `aaaaaaaa-aaaa-${version}aaa-aaaa-aaaaaaaaaaaa`;
        const response = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${forbidden}` });
        assert.equal(response.statusCode, 400, `version: ${version}`);
        assert.deepEqual(response.json(), { error: 'INVALID_CAMPAIGN_ID' });
      }
    } finally {
      await app.close();
    }
  }
);

test('GET /api/v1/campaigns/:campaignId returns 404 for a well-formed but absent UUID', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/campaigns/00000000-0000-4000-8000-999999999999'
    });
    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), { error: 'CAMPAIGN_NOT_FOUND' });
  } finally {
    await app.close();
  }
});

test(
  'GET /api/v1/campaigns/:campaignId rejects a SQL-injection-shaped value before touching SQL',
  { skip: !hasDatabase },
  async () => {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    const app = buildApp({ pool, logger: false });
    try {
      const injectionPayloads = [
        "1' OR '1'='1",
        "'; DROP TABLE leasemind_app.campaign_current_state_projection; --",
        '00000000-0000-4000-8000-000000000001; DROP SCHEMA leasemind_app CASCADE'
      ];
      for (const payload of injectionPayloads) {
        const response = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${encodeURIComponent(payload)}` });
        assert.equal(response.statusCode, 400, `payload: ${payload}`);
        assert.deepEqual(response.json(), { error: 'INVALID_CAMPAIGN_ID' });
      }

      // Prove the injection attempt truly never reached SQL: the table (and
      // all 11 synthetic rows) must still exist and be intact.
      const stillThere = await pool.query(
        'SELECT count(*)::int AS count FROM leasemind_app.campaign_current_state_projection'
      );
      assert.equal(stillThere.rows[0].count, 11);
    } finally {
      await app.close();
    }
  }
);

// This probe intentionally does NOT depend on DATABASE_URL -- it always runs,
// using a deliberately unreachable pool, mirroring health.test.ts's pattern.
test('Campaign endpoints return 503 without leaking secrets when PostgreSQL is unavailable', async () => {
  const pool = new pg.Pool({
    connectionString: UNREACHABLE_CONNECTION_STRING,
    max: 1,
    connectionTimeoutMillis: 2000
  });
  const app = buildApp({ pool, logger: false });
  try {
    const listResponse = await app.inject({ method: 'GET', url: '/api/v1/campaigns' });
    assert.equal(listResponse.statusCode, 503);
    assert.deepEqual(listResponse.json(), { status: 'error', database: 'unreachable' });
    assertNoLeakedSecrets(listResponse.body);

    const detailResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/campaigns/00000000-0000-4000-8000-000000000001'
    });
    assert.equal(detailResponse.statusCode, 503);
    assert.deepEqual(detailResponse.json(), { status: 'error', database: 'unreachable' });
    assertNoLeakedSecrets(detailResponse.body);
  } finally {
    await app.close();
  }
});

function assertNoLeakedSecrets(responseBody: string): void {
  const forbidden = ['synthetic:synthetic', 'password', 'ECONNREFUSED', 'pg-protocol', 'node_modules'];
  for (const marker of forbidden) {
    assert.equal(responseBody.includes(marker), false, `response leaked: ${marker}`);
  }
}

test('migration down removes the entire app-foundation catalog', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  try {
    const result = await migrateDown(pool);
    assert.ok(result.reverted.includes('001_campaign_current_state_projection.down.sql'));

    const schemaExists = await pool.query(
      "SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'leasemind_app') AS exists"
    );
    assert.equal(schemaExists.rows[0].exists, false);

    const tableExists = await pool.query(
      "SELECT to_regclass('leasemind_app.campaign_current_state_projection') IS NOT NULL AS exists"
    );
    assert.equal(tableExists.rows[0].exists, false);
  } finally {
    await pool.end();
  }
});
