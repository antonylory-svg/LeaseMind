import { test } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { migrateUp } from '../src/db/migrate.js';
import { provisionRoles } from '../src/db/provisionRoles.js';
import {
  MIGRATOR_ROLE,
  API_READER_ROLE,
  CAMPAIGN_WRITER_ROLE,
  TA_WRITER_ROLE,
  ANALYSIS_WRITER_ROLE,
  ANALYSIS_WORKER_ROLE,
  EVIDENCE_REVOCATION_WRITER_ROLE,
  CAMPAIGN_OUTCOME_WRITER_ROLE
} from '../src/db/provisionRoles.js';
import {
  verifyRuntimeCampaignOutcomePrivileges,
  verifyRuntimeCampaignOutcomeMaintainerPrivileges,
  DatabasePrivilegeViolation
} from '../src/dbPrivilegePolicy.js';
import { loadCampaignOutcomeDatabaseUrl } from '../src/config.js';
import { appendCampaignStatusEvent } from '../src/db/campaignEvents.js';
import {
  MIGRATION_DATABASE_URL,
  MAINTENANCE_DATABASE_URL,
  API_DATABASE_URL,
  COMMAND_DATABASE_URL,
  TA_DATABASE_URL,
  ANALYSIS_DATABASE_URL,
  ANALYSIS_WORKER_DATABASE_URL,
  EVIDENCE_REVOCATION_DATABASE_URL,
  CAMPAIGN_OUTCOME_DATABASE_URL,
  BOOTSTRAP_DATABASE_URL,
  hasCampaignOutcomeDatabase
} from './testDatabaseUrls.js';

// Database foundation + least-privilege identity for Campaign Outcome
// (Sprint 6). See 02_PRODUCT/CAMPAIGN_OUTCOMES.md v0.2 and
// 03_ARCHITECTURE/decisions/ADR-0010-campaign-outcome-implementation.md.
//
// This file proves migration 011 and the new lmapp_campaign_outcome_writer
// identity in isolation. It does NOT exercise the record/correct command
// flow (that lives in campaignOutcomes.ts, covered separately by
// campaignOutcomeCommand.test.ts) -- rows are inserted directly through the
// real CAMPAIGN_OUTCOME_DATABASE_URL connection, proving the grant contract
// itself, the same way the command module uses it.
//
// campaign_outcome_event_log and campaign_outcome_idempotency_mapping are
// genuinely immutable -- once a row is inserted here, it can never be
// deleted again, not even by the table owner (the BEFORE DELETE trigger
// fires for every role). Every fixture below uses a distinct, dedicated
// Campaign id so no test's fixture ever needs cleanup, and the
// down-migration fail-closed test at the end is expected to permanently
// leave this database's migration 011 objects non-empty -- this file must
// therefore never run against a database anything else depends on staying
// revertible. It also never runs a full migrate:down cycle -- see the
// separate campaignOutcomeMigrationCycle.test.ts for that, against its own
// dedicated, never-touched-by-data database.

function pool(connectionString: string | undefined, max = 1): pg.Pool {
  return new pg.Pool({ connectionString, max });
}

async function query(connectionString: string | undefined, sql: string, params: unknown[] = []): Promise<pg.QueryResult> {
  const p = pool(connectionString);
  try {
    return await p.query(sql, params);
  } finally {
    await p.end();
  }
}

const OPERATOR_REF = 'pilot-admin:11111111-1111-4111-8111-111111111111';
const FAKE_HASH_A = 'a'.repeat(64);
const FAKE_HASH_B = 'b'.repeat(64);

function uuidV4(campaignSuffix: string): string {
  return `00000000-0000-4000-9400-${campaignSuffix.padStart(12, '0')}`;
}

// ---------------------------------------------------------------------------
// 0. Migration + role provisioning idempotency.
// ---------------------------------------------------------------------------

/** Extracts the password segment of a postgres:// connection string. Test
 * infrastructure only -- application code never parses a connection string
 * this way (see ADR-0005: passwords are read once, from their own
 * environment variables, never echoed). */
function passwordFromConnectionString(connectionString: string | undefined): string {
  const match = (connectionString ?? '').match(/:\/\/[^:]+:([^@]+)@/);
  if (!match) {
    throw new Error('test connection string missing a password segment');
  }
  return match[1];
}

test('provision-roles is idempotent: running it twice with the real, already-configured passwords succeeds and converges to the same role attributes', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const bootstrapPool = pool(BOOTSTRAP_DATABASE_URL, 2);
  try {
    // Deliberately the REAL passwords already in effect for this database
    // (derived from the same connection strings every other test in this
    // suite uses) -- never synthetic throwaway values. provisionRoles()
    // unconditionally resets every one of the nine roles' passwords on each
    // call; passing anything other than the real, current passwords here
    // would corrupt every other test file's connections for the rest of
    // this shared database's lifetime, since there is no per-role scoping.
    const input = {
      migratorPassword: passwordFromConnectionString(MIGRATION_DATABASE_URL),
      maintainerPassword: passwordFromConnectionString(MAINTENANCE_DATABASE_URL),
      apiReaderPassword: passwordFromConnectionString(API_DATABASE_URL),
      campaignWriterPassword: passwordFromConnectionString(COMMAND_DATABASE_URL),
      taWriterPassword: passwordFromConnectionString(TA_DATABASE_URL),
      analysisWriterPassword: passwordFromConnectionString(ANALYSIS_DATABASE_URL),
      analysisWorkerPassword: passwordFromConnectionString(ANALYSIS_WORKER_DATABASE_URL),
      evidenceRevocationWriterPassword: passwordFromConnectionString(EVIDENCE_REVOCATION_DATABASE_URL),
      campaignOutcomeWriterPassword: passwordFromConnectionString(CAMPAIGN_OUTCOME_DATABASE_URL)
    };

    const first = await provisionRoles(bootstrapPool, input);
    assert.ok(first.provisioned.includes(CAMPAIGN_OUTCOME_WRITER_ROLE));

    const second = await provisionRoles(bootstrapPool, input);
    assert.deepEqual(second.provisioned, first.provisioned);

    const attrs = await bootstrapPool.query(
      `SELECT rolcanlogin, rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls, rolinherit
         FROM pg_roles WHERE rolname = $1`,
      [CAMPAIGN_OUTCOME_WRITER_ROLE]
    );
    assert.deepEqual(attrs.rows[0], {
      rolcanlogin: true,
      rolsuper: false,
      rolcreatedb: false,
      rolcreaterole: false,
      rolreplication: false,
      rolbypassrls: false,
      rolinherit: false
    });

    // Proves the "real passwords" premise above, not just role attributes:
    // the writer connection must still work after two re-provisioning runs.
    const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL, 1);
    try {
      await assert.doesNotReject(writerPool.query('SELECT 1'));
    } finally {
      await writerPool.end();
    }
  } finally {
    await bootstrapPool.end();
  }
});

test('migration 011 applies (fresh or already-applied) and repeated migrate:up stays idempotent', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const migrationPool = pool(MIGRATION_DATABASE_URL, 2);
  try {
    const first = await migrateUp(migrationPool);
    assert.ok(first.applied.includes('011_campaign_outcome.up.sql') || first.skipped.includes('011_campaign_outcome.up.sql'));

    const second = await migrateUp(migrationPool);
    assert.ok(second.skipped.includes('011_campaign_outcome.up.sql'), 'a second migrate:up must skip, not re-apply, migration 011');
    assert.equal(second.applied.includes('011_campaign_outcome.up.sql'), false);
  } finally {
    await migrationPool.end();
  }
});

// ---------------------------------------------------------------------------
// 1. Exact schema of the three objects and the public view.
// ---------------------------------------------------------------------------

test('campaign_outcome_event_log has exactly the expected columns, CHECK constraints, unique constraints and FKs', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const columns = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT column_name, is_nullable, data_type
       FROM information_schema.columns
      WHERE table_schema = 'leasemind_app' AND table_name = 'campaign_outcome_event_log'
      ORDER BY ordinal_position`
  );
  assert.deepEqual(
    columns.rows.map(r => r.column_name),
    [
      'outcome_record_id', 'campaign_id', 'outcome_sequence', 'command_type',
      'outcome_code', 'mapped_lifecycle_status', 'confirmation_method', 'operator_ref',
      'corrects_outcome_record_id', 'correction_reason_code', 'runtime_mode',
      'recorded_at', 'resulting_campaign_aggregate_version'
    ]
  );
  assert.equal(columns.rows.find(r => r.column_name === 'corrects_outcome_record_id')?.is_nullable, 'YES');
  assert.equal(columns.rows.find(r => r.column_name === 'correction_reason_code')?.is_nullable, 'YES');
  assert.equal(columns.rows.find(r => r.column_name === 'campaign_id')?.is_nullable, 'NO');

  const constraints = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT conname, contype FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
       JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'leasemind_app' AND t.relname = 'campaign_outcome_event_log'
      ORDER BY conname`
  );
  const names = constraints.rows.map(r => r.conname);
  for (const expected of [
    'campaign_outcome_event_log_mapping_valid',
    'campaign_outcome_event_log_correction_shape',
    'campaign_outcome_event_log_correction_not_self',
    'campaign_outcome_event_log_identity_unique',
    'campaign_outcome_event_log_sequence_unique',
    'campaign_outcome_event_log_sequence_shape',
    'campaign_outcome_event_log_correction_fk',
    'campaign_outcome_event_log_resulting_event_fk'
  ]) {
    assert.ok(names.includes(expected), `missing constraint ${expected}`);
  }

  const indexes = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT indexname, indexdef FROM pg_indexes
      WHERE schemaname = 'leasemind_app' AND tablename = 'campaign_outcome_event_log'`
  );
  const partialIndex = indexes.rows.find(r => r.indexname === 'campaign_outcome_event_log_one_record_per_campaign');
  assert.ok(partialIndex, 'partial unique index missing');
  assert.match(partialIndex.indexdef, /UNIQUE/i);
  assert.match(partialIndex.indexdef, /WHERE \(command_type = 'record'::text\)/);
});

test('campaign_outcome_current_projection has exactly three columns and the composite pointer FK', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const columns = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'leasemind_app' AND table_name = 'campaign_outcome_current_projection'
      ORDER BY ordinal_position`
  );
  assert.deepEqual(columns.rows.map(r => r.column_name), ['campaign_id', 'current_outcome_record_id', 'updated_at']);

  const fk = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT conname FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
       JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'leasemind_app' AND t.relname = 'campaign_outcome_current_projection'
        AND conname = 'campaign_outcome_current_projection_pointer_fk'`
  );
  assert.equal(fk.rowCount, 1);
});

test('campaign_outcome_idempotency_mapping has exactly five columns and the composite record FK', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const columns = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'leasemind_app' AND table_name = 'campaign_outcome_idempotency_mapping'
      ORDER BY ordinal_position`
  );
  assert.deepEqual(columns.rows.map(r => r.column_name), [
    'idempotency_key', 'command_hash', 'campaign_id', 'outcome_record_id', 'accepted_at'
  ]);

  const fk = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT conname FROM pg_constraint c
       JOIN pg_class t ON t.oid = c.conrelid
       JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'leasemind_app' AND t.relname = 'campaign_outcome_idempotency_mapping'
        AND conname = 'campaign_outcome_idempotency_mapping_record_fk'`
  );
  assert.equal(fk.rowCount, 1);

  const pk = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT a.attname FROM pg_index i
       JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
       JOIN pg_class t ON t.oid = i.indrelid
       JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'leasemind_app' AND t.relname = 'campaign_outcome_idempotency_mapping' AND i.indisprimary`
  );
  assert.deepEqual(pk.rows.map(r => r.attname), ['idempotency_key'], 'idempotency_key must be the (globally unique) primary key, not scoped by campaign_id');
});

test('campaign_outcome_public_projection is an owner-rights (security_invoker=false), security_barrier view with exactly the safe columns', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const view = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT c.reloptions, r.rolname AS owner
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       JOIN pg_roles r ON r.oid = c.relowner
      WHERE n.nspname = 'leasemind_app' AND c.relname = 'campaign_outcome_public_projection'`
  );
  assert.equal(view.rows[0].owner, MIGRATOR_ROLE);
  const options: string[] = view.rows[0].reloptions ?? [];
  assert.ok(options.includes('security_barrier=true'), `expected security_barrier=true, got ${JSON.stringify(options)}`);
  assert.equal(options.some((o: string) => o.startsWith('security_invoker=true')), false, 'view must NOT be security_invoker=true');

  const columns = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT column_name FROM information_schema.columns
      WHERE table_schema = 'leasemind_app' AND table_name = 'campaign_outcome_public_projection'
      ORDER BY ordinal_position`
  );
  assert.deepEqual(columns.rows.map(r => r.column_name), ['campaign_id', 'outcome_code', 'recorded_at', 'confirmation_method', 'is_corrected']);
});

test('reject_campaign_outcome_event_log_mutation and reject_campaign_outcome_idempotency_mapping_mutation cover UPDATE/DELETE/TRUNCATE', { skip: !hasCampaignOutcomeDatabase }, async () => {
  for (const table of ['campaign_outcome_event_log', 'campaign_outcome_idempotency_mapping']) {
    const triggers = await query(
      BOOTSTRAP_DATABASE_URL,
      `SELECT tgname, tgtype FROM pg_trigger t
         JOIN pg_class c ON c.oid = t.tgrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'leasemind_app' AND c.relname = $1 AND NOT t.tgisinternal`,
      [table]
    );
    assert.equal(triggers.rowCount, table === 'campaign_outcome_event_log' ? 4 : 3, `unexpected trigger count on ${table}`);
    const names = triggers.rows.map(r => r.tgname);
    assert.ok(names.some(n => n.endsWith('reject_update')));
    assert.ok(names.some(n => n.endsWith('reject_delete')));
    assert.ok(names.some(n => n.endsWith('reject_truncate')));
  }
});

// ---------------------------------------------------------------------------
// 2. Positive round-trip: record -> correct -> safe public read, through the
//    real lmapp_campaign_outcome_writer connection.
// ---------------------------------------------------------------------------

const CAMPAIGN_ROUNDTRIP = uuidV4('1');
const RECORD_ID = '11111111-1111-4111-8111-000000000001';
const CORRECT_ID = '11111111-1111-4111-8111-000000000002';

test('setup: append the Completed lifecycle event the roundtrip record will reference', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const maintenancePool = pool(MAINTENANCE_DATABASE_URL);
  try {
    const result = await appendCampaignStatusEvent(maintenancePool, {
      campaignId: CAMPAIGN_ROUNDTRIP,
      status: 'Completed',
      idempotencyKey: 'campaign-outcome-foundation:roundtrip:completed'
    });
    assert.equal(result.eventSequence, '1');
  } finally {
    await maintenancePool.end();
  }
});

test('writer: record creates the canonical row, the idempotency mapping and the current-projection pointer', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await writerPool.query(
      `INSERT INTO leasemind_app.campaign_outcome_event_log
         (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
          confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
          resulting_campaign_aggregate_version)
       VALUES ($1, $2, 1, 'record', 'success_via_leasemind', 'Completed', 'user_attestation', $3, NULL, NULL, 'synthetic', 1)`,
      [RECORD_ID, CAMPAIGN_ROUNDTRIP, OPERATOR_REF]
    );
    await writerPool.query(
      `INSERT INTO leasemind_app.campaign_outcome_idempotency_mapping (idempotency_key, command_hash, campaign_id, outcome_record_id)
       VALUES ($1, $2, $3, $4)`,
      ['campaign-outcome-foundation:roundtrip:record', FAKE_HASH_A, CAMPAIGN_ROUNDTRIP, RECORD_ID]
    );
    await writerPool.query(
      `INSERT INTO leasemind_app.campaign_outcome_current_projection (campaign_id, current_outcome_record_id)
       VALUES ($1, $2)`,
      [CAMPAIGN_ROUNDTRIP, RECORD_ID]
    );

    const row = await writerPool.query(
      'SELECT outcome_code, mapped_lifecycle_status FROM leasemind_app.campaign_outcome_event_log WHERE outcome_record_id = $1',
      [RECORD_ID]
    );
    assert.deepEqual(row.rows[0], { outcome_code: 'success_via_leasemind', mapped_lifecycle_status: 'Completed' });
  } finally {
    await writerPool.end();
  }
});

test('a second record for the same Campaign is rejected (insert-verification trigger)', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await assert.rejects(
      writerPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ('11111111-1111-4111-8111-000000000099', $1, 1, 'record', 'success_independently', 'Completed', 'user_attestation', $2, NULL, NULL, 'synthetic', 1)`,
        [CAMPAIGN_ROUNDTRIP, OPERATOR_REF]
      ),
      /CAMPAIGN_OUTCOME_STATE_INCONSISTENT/
    );
  } finally {
    await writerPool.end();
  }
});

test('setup: append the Failed lifecycle event the roundtrip correction will reference', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const maintenancePool = pool(MAINTENANCE_DATABASE_URL);
  try {
    const result = await appendCampaignStatusEvent(maintenancePool, {
      campaignId: CAMPAIGN_ROUNDTRIP,
      status: 'Failed',
      idempotencyKey: 'campaign-outcome-foundation:roundtrip:failed'
    });
    assert.equal(result.eventSequence, '2');
  } finally {
    await maintenancePool.end();
  }
});

test('writer: correct creates a new row referencing the prior one and repoints the current-projection', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await writerPool.query(
      `INSERT INTO leasemind_app.campaign_outcome_event_log
         (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
          confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
          resulting_campaign_aggregate_version)
       VALUES ($1, $2, 2, 'correct', 'cancelled', 'Failed', 'user_attestation', $3, $4, 'OUTCOME_CLASSIFICATION_CORRECTED', 'synthetic', 2)`,
      [CORRECT_ID, CAMPAIGN_ROUNDTRIP, OPERATOR_REF, RECORD_ID]
    );
    await writerPool.query(
      `INSERT INTO leasemind_app.campaign_outcome_idempotency_mapping (idempotency_key, command_hash, campaign_id, outcome_record_id)
       VALUES ($1, $2, $3, $4)`,
      ['campaign-outcome-foundation:roundtrip:correct', FAKE_HASH_B, CAMPAIGN_ROUNDTRIP, CORRECT_ID]
    );
    await writerPool.query(
      `UPDATE leasemind_app.campaign_outcome_current_projection SET current_outcome_record_id = $2, updated_at = clock_timestamp() WHERE campaign_id = $1`,
      [CAMPAIGN_ROUNDTRIP, CORRECT_ID]
    );

    const pointer = await writerPool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [CAMPAIGN_ROUNDTRIP]
    );
    assert.equal(pointer.rows[0].current_outcome_record_id, CORRECT_ID);

    // The old record row is untouched, still present, still immutable.
    const old = await writerPool.query(
      'SELECT outcome_code FROM leasemind_app.campaign_outcome_event_log WHERE outcome_record_id = $1',
      [RECORD_ID]
    );
    assert.equal(old.rows[0].outcome_code, 'success_via_leasemind');
  } finally {
    await writerPool.end();
  }
});

test('same-code correction is rejected', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await assert.rejects(
      writerPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ('11111111-1111-4111-8111-000000000098', $1, 3, 'correct', 'cancelled', 'Failed', 'user_attestation', $2, $3, 'OUTCOME_CLASSIFICATION_CORRECTED', 'synthetic', 2)`,
        [CAMPAIGN_ROUNDTRIP, OPERATOR_REF, CORRECT_ID]
      ),
      /CAMPAIGN_OUTCOME_STATE_INCONSISTENT/
    );
  } finally {
    await writerPool.end();
  }
});

test('correction referencing a superseded (stale) record instead of the current effective outcome is rejected', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await assert.rejects(
      writerPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ('11111111-1111-4111-8111-000000000097', $1, 3, 'correct', 'expired', 'Failed', 'user_attestation', $2, $3, 'OUTCOME_CLASSIFICATION_CORRECTED', 'synthetic', 2)`,
        [CAMPAIGN_ROUNDTRIP, OPERATOR_REF, RECORD_ID]
      ),
      /CAMPAIGN_OUTCOME_STATE_INCONSISTENT/
    );
  } finally {
    await writerPool.end();
  }
});

test('correction with a non-contiguous sequence is rejected', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const maintenancePool = pool(MAINTENANCE_DATABASE_URL);
  await appendCampaignStatusEvent(maintenancePool, {
    campaignId: CAMPAIGN_ROUNDTRIP,
    status: 'Failed',
    idempotencyKey: 'campaign-outcome-foundation:roundtrip:failed-again'
  });
  await maintenancePool.end();

  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await assert.rejects(
      writerPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ('11111111-1111-4111-8111-000000000096', $1, 5, 'correct', 'expired', 'Failed', 'user_attestation', $2, $3, 'OUTCOME_CLASSIFICATION_CORRECTED', 'synthetic', 3)`,
        [CAMPAIGN_ROUNDTRIP, OPERATOR_REF, CORRECT_ID]
      ),
      /CAMPAIGN_OUTCOME_STATE_INCONSISTENT/
    );
  } finally {
    await writerPool.end();
  }
});

test('public view exposes only safe fields and reflects the correction', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const readerPool = pool(API_DATABASE_URL);
  try {
    const row = await readerPool.query(
      'SELECT campaign_id, outcome_code, confirmation_method, is_corrected FROM leasemind_app.campaign_outcome_public_projection WHERE campaign_id = $1',
      [CAMPAIGN_ROUNDTRIP]
    );
    assert.deepEqual(row.rows[0], {
      campaign_id: CAMPAIGN_ROUNDTRIP,
      outcome_code: 'cancelled',
      confirmation_method: 'user_attestation',
      is_corrected: true
    });
  } finally {
    await readerPool.end();
  }
});

// ---------------------------------------------------------------------------
// 3. Sequence-shape CHECK, independent of the trigger.
// ---------------------------------------------------------------------------

const CAMPAIGN_SHAPE = uuidV4('2');

test('a record with outcome_sequence != 1 is rejected by the sequence-shape CHECK', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const maintenancePool = pool(MAINTENANCE_DATABASE_URL);
  await appendCampaignStatusEvent(maintenancePool, {
    campaignId: CAMPAIGN_SHAPE,
    status: 'Completed',
    idempotencyKey: 'campaign-outcome-foundation:shape:completed'
  });
  await maintenancePool.end();

  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await assert.rejects(
      writerPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ('11111111-1111-4111-8111-000000000095', $1, 2, 'record', 'success_via_leasemind', 'Completed', 'user_attestation', $2, NULL, NULL, 'synthetic', 1)`,
        [CAMPAIGN_SHAPE, OPERATOR_REF]
      ),
      /campaign_outcome_event_log_sequence_shape/
    );
  } finally {
    await writerPool.end();
  }
});

// ---------------------------------------------------------------------------
// 3b. campaign_outcome_event_log_mapping_valid and the mapped_lifecycle_status
// non-terminal CHECK, fired by real rejected INSERTs -- not just confirmed
// to exist via pg_constraint catalog introspection (section 1 above only
// checks the constraint NAME is present). Neither test disables or weakens
// the insert-verification trigger: each is deliberately constructed so the
// trigger's own check (linked lifecycle event status vs NEW.mapped_lifecycle_status)
// passes cleanly, isolating the failure to the CHECK constraint alone.
// ---------------------------------------------------------------------------

const CAMPAIGN_MAPPING_CHECK = uuidV4('10');
const CAMPAIGN_NON_TERMINAL_CHECK = uuidV4('11');

test('campaign_outcome_event_log_mapping_valid rejects a mismatched outcome_code/mapped_lifecycle_status pairing, even though the linked lifecycle event genuinely has status=Failed (isolating the CHECK from the insert-verification trigger, never disabled)', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const maintenancePool = pool(MAINTENANCE_DATABASE_URL);
  await appendCampaignStatusEvent(maintenancePool, {
    campaignId: CAMPAIGN_MAPPING_CHECK,
    status: 'Failed',
    idempotencyKey: 'campaign-outcome-foundation:mapping-check:failed'
  });
  await maintenancePool.end();

  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    const before = await writerPool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_outcome_event_log WHERE campaign_id = $1',
      [CAMPAIGN_MAPPING_CHECK]
    );

    // mapped_lifecycle_status='Failed' matches the real linked event exactly
    // (event_sequence=1, payload.status='Failed') -- the trigger's own
    // cross-check passes. Only campaign_outcome_event_log_mapping_valid can
    // reject this: outcome_code='success_via_leasemind' requires
    // mapped_lifecycle_status='Completed', never 'Failed'.
    await assert.rejects(
      writerPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ('11111111-1111-4111-8111-000000000010', $1, 1, 'record', 'success_via_leasemind', 'Failed', 'user_attestation', $2, NULL, NULL, 'synthetic', 1)`,
        [CAMPAIGN_MAPPING_CHECK, OPERATOR_REF]
      ),
      /violates check constraint "campaign_outcome_event_log_mapping_valid"/
    );

    const after = await writerPool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_outcome_event_log WHERE campaign_id = $1',
      [CAMPAIGN_MAPPING_CHECK]
    );
    assert.equal(after.rows[0].count, before.rows[0].count, 'no partial row must be written after the rejection');
  } finally {
    await writerPool.end();
  }
});

test('mapped_lifecycle_status is rejected for a non-terminal value (Paused), even though the linked lifecycle event genuinely has status=Paused', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const maintenancePool = pool(MAINTENANCE_DATABASE_URL);
  await appendCampaignStatusEvent(maintenancePool, {
    campaignId: CAMPAIGN_NON_TERMINAL_CHECK,
    status: 'Paused',
    idempotencyKey: 'campaign-outcome-foundation:non-terminal-check:paused'
  });
  await maintenancePool.end();

  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    const before = await writerPool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_outcome_event_log WHERE campaign_id = $1',
      [CAMPAIGN_NON_TERMINAL_CHECK]
    );

    // mapped_lifecycle_status='Paused' matches the real linked event exactly
    // (event_sequence=1, payload.status='Paused') -- the trigger's own
    // cross-check passes. No outcome_code can legally pair with a
    // non-terminal mapped_lifecycle_status at all (campaign_outcome_event_log_mapping_valid
    // structurally only allows Completed/Failed), so both that CHECK and
    // mapped_lifecycle_status's own base CHECK necessarily reject this row
    // together -- asserted generically rather than pinned to one name.
    await assert.rejects(
      writerPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ('11111111-1111-4111-8111-000000000011', $1, 1, 'record', 'cancelled', 'Paused', 'user_attestation', $2, NULL, NULL, 'synthetic', 1)`,
        [CAMPAIGN_NON_TERMINAL_CHECK, OPERATOR_REF]
      ),
      /violates check constraint/i
    );

    const after = await writerPool.query(
      'SELECT count(*)::int AS count FROM leasemind_app.campaign_outcome_event_log WHERE campaign_id = $1',
      [CAMPAIGN_NON_TERMINAL_CHECK]
    );
    assert.equal(after.rows[0].count, before.rows[0].count, 'no partial row must be written after the rejection');
  } finally {
    await writerPool.end();
  }
});

// ---------------------------------------------------------------------------
// 4. Cross-Campaign references are rejected (composite FKs).
// ---------------------------------------------------------------------------

const CAMPAIGN_XREF_OWNER = uuidV4('3');
const CAMPAIGN_XREF_OTHER = uuidV4('4');
const XREF_OWNER_RECORD_ID = '11111111-1111-4111-8111-000000000003';

test('setup: a genuine outcome record on a separate Campaign, used as a cross-Campaign probe target', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const maintenancePool = pool(MAINTENANCE_DATABASE_URL);
  await appendCampaignStatusEvent(maintenancePool, {
    campaignId: CAMPAIGN_XREF_OWNER,
    status: 'Completed',
    idempotencyKey: 'campaign-outcome-foundation:xref-owner:completed'
  });
  await maintenancePool.end();

  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await writerPool.query(
      `INSERT INTO leasemind_app.campaign_outcome_event_log
         (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
          confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
          resulting_campaign_aggregate_version)
       VALUES ($1, $2, 1, 'record', 'success_via_leasemind', 'Completed', 'user_attestation', $3, NULL, NULL, 'synthetic', 1)`,
      [XREF_OWNER_RECORD_ID, CAMPAIGN_XREF_OWNER, OPERATOR_REF]
    );
  } finally {
    await writerPool.end();
  }
});

test('idempotency mapping cannot reference an outcome_record_id belonging to a different Campaign', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await assert.rejects(
      writerPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_idempotency_mapping (idempotency_key, command_hash, campaign_id, outcome_record_id)
         VALUES ('campaign-outcome-foundation:xref:mapping', $1, $2, $3)`,
        [FAKE_HASH_A, CAMPAIGN_XREF_OTHER, XREF_OWNER_RECORD_ID]
      ),
      /foreign key|violates foreign key constraint/i
    );
  } finally {
    await writerPool.end();
  }
});

test('current projection cannot point at an outcome_record_id belonging to a different Campaign', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await assert.rejects(
      writerPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_current_projection (campaign_id, current_outcome_record_id)
         VALUES ($1, $2)`,
        [CAMPAIGN_XREF_OTHER, XREF_OWNER_RECORD_ID]
      ),
      /foreign key|violates foreign key constraint/i
    );
  } finally {
    await writerPool.end();
  }
});

test('a correction cannot reference another Campaign\'s outcome_record_id (caught by the insert-verification trigger)', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const maintenancePool = pool(MAINTENANCE_DATABASE_URL);
  await appendCampaignStatusEvent(maintenancePool, {
    campaignId: CAMPAIGN_XREF_OTHER,
    status: 'Completed',
    idempotencyKey: 'campaign-outcome-foundation:xref-other:completed'
  });
  await maintenancePool.end();

  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await assert.rejects(
      writerPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ('11111111-1111-4111-8111-000000000094', $1, 2, 'correct', 'cancelled', 'Failed', 'user_attestation', $2, $3, 'OUTCOME_CLASSIFICATION_CORRECTED', 'synthetic', 1)`,
        [CAMPAIGN_XREF_OTHER, OPERATOR_REF, XREF_OWNER_RECORD_ID]
      ),
      /CAMPAIGN_OUTCOME_STATE_INCONSISTENT/
    );
  } finally {
    await writerPool.end();
  }
});

test('layer isolation: with the insert-verification trigger disabled, the raw composite correction FK and the partial unique index still independently reject bad rows', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const migratorPool = pool(MIGRATION_DATABASE_URL, 1);
  try {
    await migratorPool.query('ALTER TABLE leasemind_app.campaign_outcome_event_log DISABLE TRIGGER campaign_outcome_event_log_verify_resulting_event');

    // Raw composite FK: corrects_outcome_record_id from a different Campaign,
    // no longer intercepted by the trigger's own current-pointer check.
    await assert.rejects(
      migratorPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ('11111111-1111-4111-8111-000000000093', $1, 2, 'correct', 'cancelled', 'Failed', 'user_attestation', $2, $3, 'OUTCOME_CLASSIFICATION_CORRECTED', 'synthetic', 1)`,
        [CAMPAIGN_XREF_OTHER, OPERATOR_REF, XREF_OWNER_RECORD_ID]
      ),
      /foreign key|violates foreign key constraint/i
    );

    // A second command_type='record' row is rejected by one of the two
    // independently catalog-verified uniqueness layers. PostgreSQL is free
    // to report either applicable unique index first because record rows
    // necessarily have outcome_sequence=1.
    // Campaign that already has one, no longer intercepted by the trigger's
    // own no-prior-history check.
    await assert.rejects(
      migratorPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ('11111111-1111-4111-8111-000000000092', $1, 1, 'record', 'success_independently', 'Completed', 'user_attestation', $2, NULL, NULL, 'synthetic', 1)`,
        [CAMPAIGN_ROUNDTRIP, OPERATOR_REF]
      ),
      /duplicate key value violates unique constraint "campaign_outcome_event_log_(one_record_per_campaign|sequence_unique)"/
    );
  } finally {
    await migratorPool.query('ALTER TABLE leasemind_app.campaign_outcome_event_log ENABLE TRIGGER campaign_outcome_event_log_verify_resulting_event').catch(() => {});
    await migratorPool.end();
  }
});

// ---------------------------------------------------------------------------
// 5. Immutability: UPDATE/DELETE/TRUNCATE denied, including for the owner.
// ---------------------------------------------------------------------------

test('writer: UPDATE/DELETE/TRUNCATE on both immutable tables are denied by grant', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await assert.rejects(
      writerPool.query(`UPDATE leasemind_app.campaign_outcome_event_log SET outcome_code = 'expired' WHERE outcome_record_id = $1`, [RECORD_ID]),
      /permission denied/
    );
    await assert.rejects(
      writerPool.query('DELETE FROM leasemind_app.campaign_outcome_event_log WHERE outcome_record_id = $1', [RECORD_ID]),
      /permission denied/
    );
    await assert.rejects(writerPool.query('TRUNCATE leasemind_app.campaign_outcome_event_log'), /permission denied/);
    await assert.rejects(
      writerPool.query(`UPDATE leasemind_app.campaign_outcome_idempotency_mapping SET command_hash = $1`, [FAKE_HASH_B]),
      /permission denied/
    );
    await assert.rejects(writerPool.query('DELETE FROM leasemind_app.campaign_outcome_idempotency_mapping'), /permission denied/);
    await assert.rejects(writerPool.query('TRUNCATE leasemind_app.campaign_outcome_idempotency_mapping'), /permission denied/);
  } finally {
    await writerPool.end();
  }
});

test('owner (lmapp_migrator): UPDATE/DELETE are rejected by trigger, TRUNCATE by statement-level trigger -- ownership does not bypass either', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const migratorPool = pool(MIGRATION_DATABASE_URL);
  try {
    await assert.rejects(
      migratorPool.query(`UPDATE leasemind_app.campaign_outcome_event_log SET outcome_code = 'expired' WHERE outcome_record_id = $1`, [RECORD_ID]),
      /CAMPAIGN_OUTCOME_EVENT_LOG_IMMUTABLE/
    );
    await assert.rejects(
      migratorPool.query('DELETE FROM leasemind_app.campaign_outcome_event_log WHERE outcome_record_id = $1', [RECORD_ID]),
      /CAMPAIGN_OUTCOME_EVENT_LOG_IMMUTABLE/
    );
    await assert.rejects(migratorPool.query('TRUNCATE leasemind_app.campaign_outcome_event_log CASCADE'), /CAMPAIGN_OUTCOME_EVENT_LOG_IMMUTABLE/);
    await assert.rejects(
      migratorPool.query(`UPDATE leasemind_app.campaign_outcome_idempotency_mapping SET command_hash = $1`, [FAKE_HASH_B]),
      /CAMPAIGN_OUTCOME_IDEMPOTENCY_MAPPING_IMMUTABLE/
    );
    await assert.rejects(migratorPool.query('DELETE FROM leasemind_app.campaign_outcome_idempotency_mapping'), /CAMPAIGN_OUTCOME_IDEMPOTENCY_MAPPING_IMMUTABLE/);
    await assert.rejects(migratorPool.query('TRUNCATE leasemind_app.campaign_outcome_idempotency_mapping'), /CAMPAIGN_OUTCOME_IDEMPOTENCY_MAPPING_IMMUTABLE/);
  } finally {
    await migratorPool.end();
  }
});

// ---------------------------------------------------------------------------
// 6. Grant boundary: writer's exact allowlist (positive + negative for every
//    other application identity), api reader's view-only access, maintainer's
//    rebuildable-projection-only access, and no other role gets anything.
// ---------------------------------------------------------------------------

test('the runtime Campaign Outcome privilege check passes for the real writer connection', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
  try {
    await assert.doesNotReject(verifyRuntimeCampaignOutcomePrivileges(writerPool));
  } finally {
    await writerPool.end();
  }
});

const OTHER_APPLICATION_CONNECTIONS: Array<[string, string | undefined]> = [
  ['migrator', MIGRATION_DATABASE_URL],
  ['maintainer', MAINTENANCE_DATABASE_URL],
  ['api reader', API_DATABASE_URL],
  ['campaign writer', COMMAND_DATABASE_URL],
  ['ta writer', TA_DATABASE_URL],
  ['analysis writer', ANALYSIS_DATABASE_URL],
  ['analysis worker', ANALYSIS_WORKER_DATABASE_URL],
  ['evidence revocation writer', EVIDENCE_REVOCATION_DATABASE_URL],
  ['bootstrap/admin', BOOTSTRAP_DATABASE_URL]
];

for (const [label, connectionString] of OTHER_APPLICATION_CONNECTIONS) {
  test(`the runtime Campaign Outcome privilege check rejects the ${label} connection`, { skip: !hasCampaignOutcomeDatabase }, async () => {
    const rolePool = pool(connectionString);
    try {
      await assert.rejects(verifyRuntimeCampaignOutcomePrivileges(rolePool), DatabasePrivilegeViolation);
    } finally {
      await rolePool.end();
    }
  });
}

test('writer: exact column-level allowlist confirmed via catalog introspection (no operator_ref/correction_reason_code/runtime_mode readback)', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const forbiddenSelect = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT
       has_column_privilege($1, 'leasemind_app.campaign_outcome_event_log', 'operator_ref', 'SELECT') AS operator_ref,
       has_column_privilege($1, 'leasemind_app.campaign_outcome_event_log', 'correction_reason_code', 'SELECT') AS correction_reason_code,
       has_column_privilege($1, 'leasemind_app.campaign_outcome_event_log', 'runtime_mode', 'SELECT') AS runtime_mode`,
    [CAMPAIGN_OUTCOME_WRITER_ROLE]
  );
  assert.deepEqual(forbiddenSelect.rows[0], { operator_ref: false, correction_reason_code: false, runtime_mode: false });

  const canInsertOperatorRef = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT has_column_privilege($1, 'leasemind_app.campaign_outcome_event_log', 'operator_ref', 'INSERT') AS ok`,
    [CAMPAIGN_OUTCOME_WRITER_ROLE]
  );
  assert.equal(canInsertOperatorRef.rows[0].ok, true);

  const viewAccess = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT has_table_privilege($1, 'leasemind_app.campaign_outcome_public_projection', 'SELECT') AS ok`,
    [CAMPAIGN_OUTCOME_WRITER_ROLE]
  );
  assert.equal(viewAccess.rows[0].ok, false, 'writer must not read the public view -- it reads the base tables directly');
});

test('API reader: can read the public view, cannot read any of the three base tables', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const readerPool = pool(API_DATABASE_URL);
  try {
    await assert.doesNotReject(readerPool.query('SELECT 1 FROM leasemind_app.campaign_outcome_public_projection LIMIT 1'));
    await assert.rejects(readerPool.query('SELECT 1 FROM leasemind_app.campaign_outcome_event_log'), /permission denied/);
    await assert.rejects(readerPool.query('SELECT 1 FROM leasemind_app.campaign_outcome_idempotency_mapping'), /permission denied/);
    await assert.rejects(readerPool.query('SELECT 1 FROM leasemind_app.campaign_outcome_current_projection'), /permission denied/);
  } finally {
    await readerPool.end();
  }
});

test('maintainer: can SELECT the rebuild-relevant event-log columns and fully manage the current projection, but cannot write the event log or touch the mapping at all', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const maintenancePool = pool(MAINTENANCE_DATABASE_URL);
  try {
    await assert.doesNotReject(
      maintenancePool.query(
        'SELECT outcome_record_id, campaign_id, outcome_sequence, outcome_code, mapped_lifecycle_status, resulting_campaign_aggregate_version FROM leasemind_app.campaign_outcome_event_log WHERE campaign_id = $1',
        [CAMPAIGN_ROUNDTRIP]
      )
    );
    await assert.rejects(
      maintenancePool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status, confirmation_method, operator_ref, runtime_mode, resulting_campaign_aggregate_version) VALUES ('11111111-1111-4111-8111-000000000091', $1, 9, 'record', 'expired', 'Failed', 'user_attestation', $2, 'synthetic', 1)`,
        [uuidV4('9'), OPERATOR_REF]
      ),
      /permission denied/
    );
    await assert.rejects(
      maintenancePool.query('SELECT 1 FROM leasemind_app.campaign_outcome_idempotency_mapping'),
      /permission denied/
    );

    // Full rebuild-style read/insert/update on the current projection.
    const rebuildCampaign = uuidV4('5');
    const rebuildRecordId = '11111111-1111-4111-8111-000000000005';
    const writerPool = pool(CAMPAIGN_OUTCOME_DATABASE_URL);
    const maintPoolForAppend = pool(MAINTENANCE_DATABASE_URL);
    try {
      await appendCampaignStatusEvent(maintPoolForAppend, {
        campaignId: rebuildCampaign,
        status: 'Completed',
        idempotencyKey: 'campaign-outcome-foundation:maintainer-rebuild:completed'
      });
      await writerPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ($1, $2, 1, 'record', 'success_via_leasemind', 'Completed', 'user_attestation', $3, NULL, NULL, 'synthetic', 1)`,
        [rebuildRecordId, rebuildCampaign, OPERATOR_REF]
      );
    } finally {
      await writerPool.end();
      await maintPoolForAppend.end();
    }

    await maintenancePool.query(
      `INSERT INTO leasemind_app.campaign_outcome_current_projection (campaign_id, current_outcome_record_id)
       VALUES ($1, $2) ON CONFLICT (campaign_id) DO UPDATE SET current_outcome_record_id = EXCLUDED.current_outcome_record_id, updated_at = clock_timestamp()`,
      [rebuildCampaign, rebuildRecordId]
    );
    const rebuilt = await maintenancePool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [rebuildCampaign]
    );
    assert.equal(rebuilt.rows[0].current_outcome_record_id, rebuildRecordId);
  } finally {
    await maintenancePool.end();
  }
});

// ---------------------------------------------------------------------------
// 6b. Maintenance/rebuild privilege gate (ADR-0010 §8/§12): the FULL
// lmapp_maintainer profile, not just the outcome-specific additions above --
// pre-existing Campaign-object grants (migration 003) needed for the
// coordinated stream-head lock/lifecycle rebuild, plus the exact
// column-level Campaign Outcome grants (migration 011), plus every negative
// boundary (no DELETE/TRUNCATE, zero access to the idempotency mapping, zero
// access to the public view, zero dangerous role membership). Actually
// called by the rebuild CLI (campaign-outcome-rebuild-cli.ts) before any
// lock/DML -- see campaignOutcomeRebuild.test.ts for that end-to-end proof.
// ---------------------------------------------------------------------------

test('the Campaign Outcome maintenance privilege check passes for the real maintainer connection', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const maintenancePool = pool(MAINTENANCE_DATABASE_URL);
  try {
    await assert.doesNotReject(verifyRuntimeCampaignOutcomeMaintainerPrivileges(maintenancePool));
  } finally {
    await maintenancePool.end();
  }
});

const OTHER_MAINTAINER_CONNECTIONS: Array<[string, string | undefined]> = [
  ['migrator', MIGRATION_DATABASE_URL],
  ['api reader', API_DATABASE_URL],
  ['campaign writer', COMMAND_DATABASE_URL],
  ['ta writer', TA_DATABASE_URL],
  ['analysis writer', ANALYSIS_DATABASE_URL],
  ['analysis worker', ANALYSIS_WORKER_DATABASE_URL],
  ['evidence revocation writer', EVIDENCE_REVOCATION_DATABASE_URL],
  ['campaign outcome writer', CAMPAIGN_OUTCOME_DATABASE_URL],
  ['bootstrap/admin', BOOTSTRAP_DATABASE_URL]
];

for (const [label, connectionString] of OTHER_MAINTAINER_CONNECTIONS) {
  test(`the Campaign Outcome maintenance privilege check rejects the ${label} connection`, { skip: !hasCampaignOutcomeDatabase }, async () => {
    const rolePool = pool(connectionString);
    try {
      await assert.rejects(verifyRuntimeCampaignOutcomeMaintainerPrivileges(rolePool), DatabasePrivilegeViolation);
    } finally {
      await rolePool.end();
    }
  });
}

test('no other application role has any Campaign Outcome write privilege', { skip: !hasCampaignOutcomeDatabase }, async () => {
  for (const [role] of [
    [API_READER_ROLE], [CAMPAIGN_WRITER_ROLE], [TA_WRITER_ROLE],
    [ANALYSIS_WRITER_ROLE], [ANALYSIS_WORKER_ROLE], [EVIDENCE_REVOCATION_WRITER_ROLE]
  ]) {
    const priv = await query(
      BOOTSTRAP_DATABASE_URL,
      `SELECT
         has_table_privilege($1, 'leasemind_app.campaign_outcome_event_log', 'INSERT') AS event_log_insert,
         has_table_privilege($1, 'leasemind_app.campaign_outcome_idempotency_mapping', 'INSERT') AS mapping_insert,
         has_table_privilege($1, 'leasemind_app.campaign_outcome_current_projection', 'INSERT') AS projection_insert`,
      [role]
    );
    assert.deepEqual(priv.rows[0], { event_log_insert: false, mapping_insert: false, projection_insert: false }, `role ${role} must have no Campaign Outcome write privilege`);
  }
});

test('PUBLIC has no privilege on any new object or trigger function', { skip: !hasCampaignOutcomeDatabase }, async () => {
  const priv = await query(
    BOOTSTRAP_DATABASE_URL,
    `SELECT
       EXISTS (
         SELECT 1
         FROM pg_class c
         JOIN pg_namespace n ON n.oid = c.relnamespace
         CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) acl
         WHERE n.nspname = 'leasemind_app'
           AND c.relname = ANY(ARRAY[
             'campaign_outcome_event_log',
             'campaign_outcome_idempotency_mapping',
             'campaign_outcome_current_projection',
             'campaign_outcome_public_projection'
           ])
           AND acl.grantee = 0
       ) AS object_privilege,
       EXISTS (
         SELECT 1
         FROM pg_proc p
         JOIN pg_namespace n ON n.oid = p.pronamespace
         CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
         WHERE n.nspname = 'leasemind_app'
           AND p.proname = ANY(ARRAY[
             'reject_campaign_outcome_event_log_mutation',
             'reject_campaign_outcome_idempotency_mapping_mutation',
             'verify_campaign_outcome_resulting_event'
           ])
           AND acl.grantee = 0
       ) AS function_privilege`
  );
  assert.deepEqual(priv.rows[0], {
    object_privilege: false,
    function_privilege: false
  });
});

// ---------------------------------------------------------------------------
// 7. down.sql fail-closed on non-empty outcome history.
// ---------------------------------------------------------------------------

test('migrate:down refuses to run while campaign_outcome_* history is non-empty', { skip: !hasCampaignOutcomeDatabase }, async () => {
  // Deliberately does not use migrateDown() (which would revert the entire
  // chain 011->001) -- it runs exactly 011_campaign_outcome.down.sql's own
  // guard, isolated, against the migrator connection, exactly as
  // migrate.ts would apply it as part of a full-chain migrateDown().
  const migratorPool = pool(MIGRATION_DATABASE_URL, 1);
  try {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
    const downSql = await fs.readFile(path.join(migrationsDir, '011_campaign_outcome.down.sql'), 'utf8');

    await assert.rejects(migratorPool.query(downSql), /CAMPAIGN_OUTCOME_DOWN_MIGRATION_BLOCKED/);

    // Confirm the guard aborted the whole statement -- no object was
    // actually dropped.
    const stillPresent = await migratorPool.query(
      `SELECT to_regclass('leasemind_app.campaign_outcome_event_log') AS t`
    );
    assert.notEqual(stillPresent.rows[0].t, null, 'campaign_outcome_event_log must still exist after the blocked down migration');
  } finally {
    await migratorPool.end();
  }
});

// ---------------------------------------------------------------------------
// 8. Configuration never leaks secrets.
// ---------------------------------------------------------------------------

test('loadCampaignOutcomeDatabaseUrl: missing variable throws a stable message with no leaked value', () => {
  assert.throws(
    () => loadCampaignOutcomeDatabaseUrl({}),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(error.message, 'Missing required environment variable: LEASEMIND_CAMPAIGN_OUTCOME_DATABASE_URL');
      assert.equal(error.message.includes('://'), false);
      return true;
    }
  );
});

test('loadCampaignOutcomeDatabaseUrl: returns exactly the configured value, unmodified', () => {
  const url = 'postgres://lmapp_campaign_outcome_writer:synthetic-only@127.0.0.1:5433/lmapp_dev';
  assert.equal(loadCampaignOutcomeDatabaseUrl({ LEASEMIND_CAMPAIGN_OUTCOME_DATABASE_URL: url }), url);
});
