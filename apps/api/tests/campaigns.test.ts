import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import pg from 'pg';
import { buildApp } from '../src/app.js';
import { migrateUp, migrateDown } from '../src/db/migrate.js';
import { seedCampaigns, SYNTHETIC_CAMPAIGN_SEEDS } from '../src/db/seed.js';
import { CAMPAIGN_STATUSES } from '../src/db/campaigns.js';
import {
  appendCampaignStatusEvent,
  computeEventHash,
  rebuildAllCampaignProjections,
  rebuildCampaignProjection,
  GENESIS_EVENT_HASH,
  CAMPAIGN_EVENT_TYPE,
  CAMPAIGN_EVENT_SCHEMA_VERSION
} from '../src/db/campaignEvents.js';
import { MIGRATION_DATABASE_URL, MAINTENANCE_DATABASE_URL, API_DATABASE_URL, hasDatabase } from './testDatabaseUrls.js';

const UNREACHABLE_CONNECTION_STRING = 'postgres://synthetic:synthetic@127.0.0.1:1/synthetic';
const MIGRATION_FILE_001 = '001_campaign_current_state_projection.up.sql';
const MIGRATION_FILE_002 = '002_campaign_event_log.up.sql';

// Scratch campaign_ids used only by the event-log behavior tests below. They
// are never part of the 11 synthetic seed campaigns and their derived
// projection/stream-head rows are deleted once those tests finish, so the
// read-API tests further down see exactly the 11 seeded campaigns. Their
// campaign_event_log rows cannot be deleted (immutable by design) and are
// harmless leftovers.
const SCRATCH_CAMPAIGN_A = '00000000-0000-4000-9000-000000000001';
const SCRATCH_CAMPAIGN_B = '00000000-0000-4000-9000-000000000002';
const SCRATCH_CAMPAIGN_C = '00000000-0000-4000-9000-000000000003';

// Everything in this file that touches real Postgres catalog/data requires a
// live, disposable, synthetic-only database. Business-logic/catalog tests
// connect as lmapp_migrator (owner of every object, so it can freely prove
// constraint behavior); the six HTTP-surface tests connect as the real
// lmapp_api_reader (DATABASE_URL) to prove the actual production role can
// serve the four read-only operations end to end. See
// apps/api/tests/dbPrivilegeBoundary.test.ts for the dedicated privilege
// boundary (positive + negative) probes. The DB-unavailable probe near the
// end is the one exception -- it deliberately never needs a database.
test('migration up creates the exact catalog: schema, enum, table, constraints', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    // migrateUp is idempotent and every *.test.ts file independently calls it
    // for its own setup (see tests/testDatabaseUrls.ts / hasDatabase); which
    // file's process happens to reach this first is not guaranteed across
    // environments (e.g. Node's own glob resolution for `tests/*.test.ts`
    // vs. a shell expanding it), so a migration already applied by another
    // file's setup is exactly as valid as applying it fresh here.
    const result = await migrateUp(pool);
    assert.ok(result.applied.includes(MIGRATION_FILE_001) || result.skipped.includes(MIGRATION_FILE_001));
    assert.ok(result.applied.includes(MIGRATION_FILE_002) || result.skipped.includes(MIGRATION_FILE_002));

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

test('migration up (002) creates the Campaign Event Log catalog and constraints', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    const eventLogExists = await pool.query(
      "SELECT to_regclass('leasemind_app.campaign_event_log') IS NOT NULL AS exists"
    );
    assert.equal(eventLogExists.rows[0].exists, true);

    const streamHeadExists = await pool.query(
      "SELECT to_regclass('leasemind_app.campaign_stream_head') IS NOT NULL AS exists"
    );
    assert.equal(streamHeadExists.rows[0].exists, true);

    const uniqueConstraints = await pool.query(`
      SELECT conname FROM pg_constraint
       WHERE conrelid = 'leasemind_app.campaign_event_log'::regclass
         AND contype = 'u'
    `);
    assert.deepEqual(
      uniqueConstraints.rows.map(row => row.conname).sort(),
      ['campaign_event_log_idempotency_unique', 'campaign_event_log_sequence_unique']
    );

    const triggers = await pool.query(`
      SELECT tgname FROM pg_trigger
       WHERE tgrelid = 'leasemind_app.campaign_event_log'::regclass
         AND NOT tgisinternal
    `);
    assert.deepEqual(
      triggers.rows.map(row => row.tgname).sort(),
      ['campaign_event_log_reject_delete', 'campaign_event_log_reject_update']
    );

    const validPayload = JSON.stringify({ status: 'Created' });
    const validRow = {
      eventId: '11111111-1111-4111-8111-111111111111',
      campaignId: '00000000-0000-4000-8000-000000000fff',
      eventSequence: 1,
      eventType: 'campaign.status_recorded.v1',
      schemaVersion: 1,
      payload: validPayload,
      idempotencyKey: 'catalog-test-key',
      commandHash: 'a'.repeat(64),
      previousEventHash: GENESIS_EVENT_HASH,
      eventHash: 'b'.repeat(64)
    };
    const insertEventLogRow = (overrides: Partial<typeof validRow>) => {
      const row = { ...validRow, ...overrides };
      return pool.query(
        `INSERT INTO leasemind_app.campaign_event_log
           (event_id, campaign_id, event_sequence, event_type, schema_version, payload,
            idempotency_key, command_hash, previous_event_hash, event_hash, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())`,
        [
          row.eventId,
          row.campaignId,
          row.eventSequence,
          row.eventType,
          row.schemaVersion,
          row.payload,
          row.idempotencyKey,
          row.commandHash,
          row.previousEventHash,
          row.eventHash
        ]
      );
    };

    await assert.rejects(
      insertEventLogRow({ eventId: '11111111-1111-1111-8111-111111111111' }),
      /violates check constraint/,
      'event_id must be UUID v4'
    );
    await assert.rejects(
      insertEventLogRow({ campaignId: '11111111-1111-1111-1111-111111111111' }),
      /violates check constraint/,
      'campaign_id must be UUID v4/v7'
    );
    await assert.rejects(
      insertEventLogRow({ eventSequence: 0 }),
      /violates check constraint/,
      'event_sequence must be >= 1'
    );
    await assert.rejects(
      insertEventLogRow({ eventType: 'campaign.other_event.v1' }),
      /violates check constraint/,
      'event_type must be exactly campaign.status_recorded.v1'
    );
    await assert.rejects(
      insertEventLogRow({ schemaVersion: 2 }),
      /violates check constraint/,
      'schema_version must be exactly 1'
    );
    await assert.rejects(
      insertEventLogRow({ payload: '{"status":"Created","extra":1}' }),
      /violates check constraint/,
      'payload must not contain additional keys'
    );
    await assert.rejects(
      insertEventLogRow({ payload: '{"status":{"nested":true}}' }),
      /violates check constraint/,
      'payload.status must not be a nested object'
    );
    await assert.rejects(
      insertEventLogRow({ payload: '{"status":"NotAStatus"}' }),
      /violates check constraint/,
      'payload.status must be one of the 11 approved statuses'
    );
    await assert.rejects(
      insertEventLogRow({ commandHash: 'not-a-sha256' }),
      /violates check constraint/,
      'command_hash must be 64 lowercase hex characters'
    );

    const streamHeadInvalid = await pool.query(
      "SELECT to_regclass('leasemind_app.campaign_stream_head') IS NOT NULL AS exists"
    );
    assert.equal(streamHeadInvalid.rows[0].exists, true);
    await assert.rejects(
      pool.query(
        "INSERT INTO leasemind_app.campaign_stream_head (campaign_id, current_sequence, current_event_hash) VALUES ('00000000-0000-4000-8000-000000000ffc', -1, $1)",
        [GENESIS_EVENT_HASH]
      ),
      /violates check constraint/,
      'current_sequence must be >= 0'
    );
  } finally {
    await pool.end();
  }
});

test('re-running migration up is idempotent (no error, migration skipped)', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    const result = await migrateUp(pool);
    assert.deepEqual(result.applied, []);
    assert.ok(result.skipped.includes(MIGRATION_FILE_001));
    assert.ok(result.skipped.includes(MIGRATION_FILE_002));
  } finally {
    await pool.end();
  }
});

test('a checksum mismatch on an already-applied migration is rejected', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    const migrationPath = new URL('../migrations/001_campaign_current_state_projection.up.sql', import.meta.url);
    const realSql = await readFile(migrationPath, 'utf8');
    const realChecksum = createHash('sha256').update(realSql).digest('hex');

    await pool.query(
      "UPDATE leasemind_app.schema_migrations SET checksum = repeat('0', 64) WHERE filename = $1",
      [MIGRATION_FILE_001]
    );

    await assert.rejects(migrateUp(pool), /MIGRATION_CHECKSUM_MISMATCH/);

    // Restore the correct checksum so later tests (seed, API, down) proceed
    // against a consistent, correctly-tracked ledger. The row is fixed in
    // place, never deleted: up.sql is not safe to re-run against an
    // already-existing type/table (CREATE TYPE/CREATE TABLE, no IF NOT EXISTS).
    await pool.query('UPDATE leasemind_app.schema_migrations SET checksum = $1 WHERE filename = $2', [
      realChecksum,
      MIGRATION_FILE_001
    ]);

    const result = await migrateUp(pool);
    assert.deepEqual(result.applied, []);
    assert.ok(result.skipped.includes(MIGRATION_FILE_001));
  } finally {
    await pool.end();
  }
});

test('first append creates event, stream head and projection atomically', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    const result = await appendCampaignStatusEvent(pool, {
      campaignId: SCRATCH_CAMPAIGN_A,
      status: 'Created',
      idempotencyKey: 'scratch-a:first'
    });

    assert.equal(result.isReplay, false);
    assert.equal(result.eventSequence, '1');
    assert.equal(result.previousEventHash, GENESIS_EVENT_HASH);
    assert.equal(result.eventType, CAMPAIGN_EVENT_TYPE);
    assert.equal(result.schemaVersion, CAMPAIGN_EVENT_SCHEMA_VERSION);
    assert.match(result.eventId, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.match(result.eventHash, /^[0-9a-f]{64}$/);
    assert.ok(Date.now() - new Date(result.occurredAt).getTime() < 60_000, 'occurred_at should be recent');

    const eventRow = await pool.query(
      'SELECT event_sequence, payload FROM leasemind_app.campaign_event_log WHERE event_id = $1',
      [result.eventId]
    );
    assert.equal(eventRow.rows[0].event_sequence, '1');
    assert.deepEqual(eventRow.rows[0].payload, { status: 'Created' });

    const head = await pool.query(
      'SELECT current_sequence, current_event_hash FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1',
      [SCRATCH_CAMPAIGN_A]
    );
    assert.equal(head.rows[0].current_sequence, '1');
    assert.equal(head.rows[0].current_event_hash, result.eventHash);

    const projection = await pool.query(
      'SELECT status, aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [SCRATCH_CAMPAIGN_A]
    );
    assert.equal(projection.rows[0].status, 'Created');
    assert.equal(projection.rows[0].aggregate_version, '1');
  } finally {
    await pool.end();
  }
});

test('UPDATE on campaign_event_log is unconditionally rejected', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await assert.rejects(
      pool.query(
        "UPDATE leasemind_app.campaign_event_log SET event_type = 'campaign.status_recorded.v1' WHERE campaign_id = $1",
        [SCRATCH_CAMPAIGN_A]
      ),
      /CAMPAIGN_EVENT_LOG_IMMUTABLE/
    );
  } finally {
    await pool.end();
  }
});

test('DELETE on campaign_event_log is unconditionally rejected', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await assert.rejects(
      pool.query('DELETE FROM leasemind_app.campaign_event_log WHERE campaign_id = $1', [SCRATCH_CAMPAIGN_A]),
      /CAMPAIGN_EVENT_LOG_IMMUTABLE/
    );
    const stillThere = await pool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_event_log WHERE campaign_id = $1',
      [SCRATCH_CAMPAIGN_A]
    );
    assert.equal(stillThere.rows[0].count, 1);
  } finally {
    await pool.end();
  }
});

test('same idempotency key + same command replays the original event without a duplicate', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    const first = await appendCampaignStatusEvent(pool, {
      campaignId: SCRATCH_CAMPAIGN_A,
      status: 'Created',
      idempotencyKey: 'scratch-a:first'
    });
    assert.equal(first.isReplay, true);
    assert.equal(first.eventSequence, '1');

    const count = await pool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_event_log WHERE campaign_id = $1',
      [SCRATCH_CAMPAIGN_A]
    );
    assert.equal(count.rows[0].count, 1);
  } finally {
    await pool.end();
  }
});

test('same idempotency key + different status is rejected, leaving no partial writes', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await assert.rejects(
      appendCampaignStatusEvent(pool, {
        campaignId: SCRATCH_CAMPAIGN_A,
        status: 'Analyzing',
        idempotencyKey: 'scratch-a:first'
      }),
      /IDEMPOTENCY_KEY_CONFLICT/
    );

    const count = await pool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_event_log WHERE campaign_id = $1',
      [SCRATCH_CAMPAIGN_A]
    );
    assert.equal(count.rows[0].count, 1, 'no new event should have been created');

    const head = await pool.query(
      'SELECT current_sequence FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1',
      [SCRATCH_CAMPAIGN_A]
    );
    assert.equal(head.rows[0].current_sequence, '1', 'stream head must not advance');

    const projection = await pool.query(
      'SELECT status FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [SCRATCH_CAMPAIGN_A]
    );
    assert.equal(projection.rows[0].status, 'Created', 'projection must be unchanged');
  } finally {
    await pool.end();
  }
});

test('invalid campaign_id (malformed or forbidden UUID version) is rejected before writing anything', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    const invalidIds = [
      'not-a-uuid',
      '11111111-1111-1111-1111-111111111111', // v1
      'aaaaaaaa-aaaa-3aaa-aaaa-aaaaaaaaaaaa' // v3
    ];
    for (const invalidId of invalidIds) {
      await assert.rejects(
        appendCampaignStatusEvent(pool, {
          campaignId: invalidId,
          status: 'Created',
          idempotencyKey: 'invalid-id-test'
        }),
        /INVALID_CAMPAIGN_ID/,
        `campaign_id: ${invalidId}`
      );
    }
  } finally {
    await pool.end();
  }
});

test('unapproved status is rejected before writing anything', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await assert.rejects(
      appendCampaignStatusEvent(pool, {
        campaignId: SCRATCH_CAMPAIGN_C,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: 'NotAStatus' as any,
        idempotencyKey: 'scratch-c:invalid-status'
      }),
      /INVALID_CAMPAIGN_STATUS/
    );

    const count = await pool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_event_log WHERE campaign_id = $1',
      [SCRATCH_CAMPAIGN_C]
    );
    assert.equal(count.rows[0].count, 0);
  } finally {
    await pool.end();
  }
});

test('concurrent appends for the same campaign receive distinct sequential sequences without a race', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 12 });
  try {
    const attempts = 10;
    const results = await Promise.all(
      Array.from({ length: attempts }, (_, index) =>
        appendCampaignStatusEvent(pool, {
          campaignId: SCRATCH_CAMPAIGN_B,
          status: CAMPAIGN_STATUSES[index % CAMPAIGN_STATUSES.length],
          idempotencyKey: `scratch-b:concurrent:${index}`
        })
      )
    );

    const sequences = results.map(r => Number(r.eventSequence)).sort((a, b) => a - b);
    assert.deepEqual(sequences, Array.from({ length: attempts }, (_, i) => i + 1));

    const head = await pool.query(
      'SELECT current_sequence FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1',
      [SCRATCH_CAMPAIGN_B]
    );
    assert.equal(head.rows[0].current_sequence, String(attempts));

    const count = await pool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_event_log WHERE campaign_id = $1',
      [SCRATCH_CAMPAIGN_B]
    );
    assert.equal(count.rows[0].count, attempts);
  } finally {
    await pool.end();
  }
});

test('event_hash recomputes and matches; previous_event_hash forms a correct chain', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    const rows = await pool.query<{
      event_id: string;
      campaign_id: string;
      event_sequence: string;
      event_type: string;
      schema_version: number;
      payload: { status: string };
      idempotency_key: string;
      command_hash: string;
      previous_event_hash: string;
      event_hash: string;
      occurred_at: Date;
    }>(
      `SELECT event_id, campaign_id, event_sequence, event_type, schema_version, payload,
              idempotency_key, command_hash, previous_event_hash, event_hash, occurred_at
         FROM leasemind_app.campaign_event_log
        WHERE campaign_id = $1
        ORDER BY event_sequence ASC`,
      [SCRATCH_CAMPAIGN_B]
    );
    assert.equal(rows.rowCount, 10);

    for (const row of rows.rows) {
      const recomputed = computeEventHash({
        eventId: row.event_id,
        campaignId: row.campaign_id,
        eventSequence: row.event_sequence,
        eventType: row.event_type,
        schemaVersion: row.schema_version,
        payload: row.payload as { status: any },
        occurredAt: row.occurred_at.toISOString(),
        previousEventHash: row.previous_event_hash,
        idempotencyKey: row.idempotency_key,
        commandHash: row.command_hash
      });
      assert.equal(recomputed, row.event_hash, `event_hash mismatch at sequence ${row.event_sequence}`);
    }

    assert.equal(rows.rows[0].previous_event_hash, GENESIS_EVENT_HASH);
    for (let i = 1; i < rows.rows.length; i++) {
      assert.equal(
        rows.rows[i].previous_event_hash,
        rows.rows[i - 1].event_hash,
        `chain broken between sequence ${rows.rows[i - 1].event_sequence} and ${rows.rows[i].event_sequence}`
      );
    }
  } finally {
    await pool.end();
  }
});

test('rebuilding a single campaign restores its projection from the Event Log', { skip: !hasDatabase }, async () => {
  // Rebuild is a maintenance-path function (ADR-0005: "используется только
  // seed, append Campaign Event и projection rebuild"). Exercised here
  // through the real lmapp_maintainer connection, not the migrator owner --
  // migration 003 grants it exactly the SELECT/INSERT/UPDATE this test needs.
  const pool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  try {
    // Corrupt the derived projection directly; the Event Log itself cannot
    // be touched (immutable), so this proves rebuild reads from the log,
    // not from whatever the projection currently holds.
    await pool.query(
      "UPDATE leasemind_app.campaign_current_state_projection SET status = 'Paused', aggregate_version = 1 WHERE campaign_id = $1",
      [SCRATCH_CAMPAIGN_B]
    );

    const latestEvent = await pool.query<{ event_sequence: string; payload: { status: string }; occurred_at: Date }>(
      `SELECT event_sequence, payload, occurred_at
         FROM leasemind_app.campaign_event_log
        WHERE campaign_id = $1
        ORDER BY event_sequence DESC
        LIMIT 1`,
      [SCRATCH_CAMPAIGN_B]
    );

    await rebuildCampaignProjection(pool, SCRATCH_CAMPAIGN_B);

    const projection = await pool.query<{ status: string; aggregate_version: string; updated_at: Date }>(
      'SELECT status, aggregate_version::text AS aggregate_version, updated_at FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [SCRATCH_CAMPAIGN_B]
    );
    assert.equal(projection.rows[0].status, latestEvent.rows[0].payload.status);
    assert.equal(projection.rows[0].aggregate_version, latestEvent.rows[0].event_sequence);
    assert.equal(projection.rows[0].updated_at.toISOString(), latestEvent.rows[0].occurred_at.toISOString());
  } finally {
    await pool.end();
  }
});

test('cleanup: remove scratch campaigns from derived tables (Event Log rows remain, immutably)', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    const scratchIds = [SCRATCH_CAMPAIGN_A, SCRATCH_CAMPAIGN_B, SCRATCH_CAMPAIGN_C];
    await pool.query('DELETE FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = ANY($1)', [
      scratchIds
    ]);
    await pool.query('DELETE FROM leasemind_app.campaign_stream_head WHERE campaign_id = ANY($1)', [scratchIds]);

    const remaining = await pool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = ANY($1)',
      [scratchIds]
    );
    assert.equal(remaining.rows[0].count, 0);
  } finally {
    await pool.end();
  }
});

test('synthetic seed creates exactly 11 campaigns via 11 initial append events', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
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

    const seedIds = SYNTHETIC_CAMPAIGN_SEEDS.map(seed => seed.campaignId);
    const events = await pool.query(
      'SELECT campaign_id, event_sequence FROM leasemind_app.campaign_event_log WHERE campaign_id = ANY($1)',
      [seedIds]
    );
    assert.equal(events.rowCount, 11);
    assert.ok(events.rows.every(row => row.event_sequence === '1'));
  } finally {
    await pool.end();
  }
});

test('re-running the synthetic seed reuses idempotency keys and creates no new events', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    const result = await seedCampaigns(pool);
    assert.equal(result.inserted, 0);
    assert.equal(result.skipped, 11);

    const projectionCount = await pool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_current_state_projection'
    );
    assert.equal(projectionCount.rows[0].count, 11);

    const seedIds = SYNTHETIC_CAMPAIGN_SEEDS.map(seed => seed.campaignId);
    const eventCount = await pool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_event_log WHERE campaign_id = ANY($1)',
      [seedIds]
    );
    assert.equal(eventCount.rows[0].count, 11);
  } finally {
    await pool.end();
  }
});

test('rebuilding all campaigns restores correct projections for the 11 synthetic seed campaigns', { skip: !hasDatabase }, async () => {
  // rebuildAllCampaignProjections is exercised via the real lmapp_maintainer
  // connection (ADR-0005). lmapp_migrator is used only for the final
  // cleanup DELETE, which lmapp_maintainer intentionally cannot perform
  // (no DELETE/TRUNCATE) -- that DELETE is test setup/cleanup, not part of
  // the maintenance business path.
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const migratorPool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    const seedIds = SYNTHETIC_CAMPAIGN_SEEDS.map(seed => seed.campaignId);

    // Corrupt every seeded projection row so a correct rebuild is provable.
    await maintenancePool.query(
      "UPDATE leasemind_app.campaign_current_state_projection SET status = 'Failed', aggregate_version = 999 WHERE campaign_id = ANY($1)",
      [seedIds]
    );

    const rebuiltCount = await rebuildAllCampaignProjections(maintenancePool);
    assert.ok(rebuiltCount >= 11);

    for (const seed of SYNTHETIC_CAMPAIGN_SEEDS) {
      const row = await maintenancePool.query(
        'SELECT status, aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
        [seed.campaignId]
      );
      assert.equal(row.rows[0].status, seed.status, `campaign ${seed.campaignId} status after rebuild`);
      assert.equal(row.rows[0].aggregate_version, '1', `campaign ${seed.campaignId} aggregate_version after rebuild`);
    }

    // rebuildAllCampaignProjections also resurrects any scratch campaigns
    // still present in the Event Log; remove them again so the read-API
    // tests below see exactly the 11 synthetic campaigns.
    await migratorPool.query('DELETE FROM leasemind_app.campaign_current_state_projection WHERE campaign_id != ALL($1)', [
      seedIds
    ]);
    const finalCount = await migratorPool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_current_state_projection'
    );
    assert.equal(finalCount.rows[0].count, 11);
  } finally {
    await maintenancePool.end();
    await migratorPool.end();
  }
});

test('rebuild does not modify the Event Log', { skip: !hasDatabase }, async () => {
  // Same maintenance-path/migrator-cleanup split as the previous test.
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const migratorPool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    const before = await maintenancePool.query(
      'SELECT campaign_id, event_sequence, event_hash FROM leasemind_app.campaign_event_log ORDER BY campaign_id, event_sequence'
    );

    await rebuildAllCampaignProjections(maintenancePool);

    const after = await maintenancePool.query(
      'SELECT campaign_id, event_sequence, event_hash FROM leasemind_app.campaign_event_log ORDER BY campaign_id, event_sequence'
    );

    assert.deepEqual(after.rows, before.rows);

    // rebuildAllCampaignProjections resurrects any scratch campaigns still
    // present in the Event Log; remove them again so later read-API tests
    // see exactly the 11 synthetic campaigns.
    const seedIds = SYNTHETIC_CAMPAIGN_SEEDS.map(seed => seed.campaignId);
    await migratorPool.query('DELETE FROM leasemind_app.campaign_current_state_projection WHERE campaign_id != ALL($1)', [
      seedIds
    ]);
  } finally {
    await maintenancePool.end();
    await migratorPool.end();
  }
});

test('GET /api/v1/campaigns returns all 11 synthetic campaigns, sorted deterministically', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
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
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
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

// H2 (ADR-0009): the synthetic seed campaigns are created directly against
// campaign_current_state_projection, never through the Analysis-authorized
// launch command -- none of them has a campaign_subject_link_projection
// row. This is exactly the "legacy/unlinked Campaign" case the Campaign
// detail screen must present as a distinct, safe "unavailable" state, never
// as a pending post-launch Analysis.
test('GET /api/v1/campaigns/:campaignId returns analysis_context: null for a legacy/unlinked campaign, using only the existing lmapp_api_reader grants', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    const target = SYNTHETIC_CAMPAIGN_SEEDS[0];
    const response = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${target.campaignId}` });
    assert.equal(response.statusCode, 200, response.body);
    assert.deepEqual(response.json().analysis_context, null);
  } finally {
    await app.close();
  }
});

test('GET /api/v1/campaigns/:campaignId rejects malformed UUIDs with 400', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
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
    const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
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
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
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
    const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
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

test('migration down removes the entire app-foundation catalog (011 through 001)', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    // This file runs first (alphabetically) and its own "migration up"
    // above applies every pending migration in migrations/, not just
    // 001-004 -- 005/006/007 (ADR-0008, Technical Assignment) and 008-010
    // (ADR-0009, Analysis Snapshot) plus 011 (ADR-0010, Campaign Outcome)
    // exist in the repo now, so a full down from here always reverts all eleven. No
    // subject_linked event exists yet at this point in the suite (nothing
    // before this test launches a Campaign), so 006's down migration is
    // not blocked (contrast tests/technicalAssignment.test.ts and
    // tests/openapiContract.test.ts, whose own full-teardown attempts run
    // after a Campaign has been launched and are correctly rejected).
    const result = await migrateDown(pool);
    assert.deepEqual(result.reverted, [
      '011_campaign_outcome.down.sql',
      '010_evidence_dataset_revocation.down.sql',
      '009_post_launch_refresh_intent.down.sql',
      '008_analysis_snapshot.down.sql',
      '007_tenant_request_rent_rate.down.sql',
      '006_campaign_event_log_subject_linked_event_type.down.sql',
      '005_technical_assignment.down.sql',
      '004_campaign_command_grants.down.sql',
      '003_least_privilege_grants.down.sql',
      '002_campaign_event_log.down.sql',
      '001_campaign_current_state_projection.down.sql'
    ]);

    const schemaExists = await pool.query(
      "SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'leasemind_app') AS exists"
    );
    assert.equal(schemaExists.rows[0].exists, false);

    const tableExists = await pool.query(
      "SELECT to_regclass('leasemind_app.campaign_current_state_projection') IS NOT NULL AS exists"
    );
    assert.equal(tableExists.rows[0].exists, false);

    const eventLogExists = await pool.query(
      "SELECT to_regclass('leasemind_app.campaign_event_log') IS NOT NULL AS exists"
    );
    assert.equal(eventLogExists.rows[0].exists, false);

    const streamHeadExists = await pool.query(
      "SELECT to_regclass('leasemind_app.campaign_stream_head') IS NOT NULL AS exists"
    );
    assert.equal(streamHeadExists.rows[0].exists, false);
  } finally {
    await pool.end();
  }
});
