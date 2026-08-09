import { test } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  verifyRuntimeDatabasePrivileges,
  verifyRuntimeCommandPrivileges,
  verifyRuntimeTechnicalAssignmentPrivileges,
  DatabasePrivilegeViolation
} from '../src/dbPrivilegePolicy.js';
import { MIGRATOR_ROLE, MAINTAINER_ROLE, API_READER_ROLE, CAMPAIGN_WRITER_ROLE, TA_WRITER_ROLE } from '../src/db/provisionRoles.js';
import { migrateUp } from '../src/db/migrate.js';
import { appendCampaignStatusEvent, rebuildCampaignProjection, rebuildAllCampaignProjections } from '../src/db/campaignEvents.js';
import {
  MIGRATION_DATABASE_URL,
  MAINTENANCE_DATABASE_URL,
  API_DATABASE_URL,
  COMMAND_DATABASE_URL,
  TA_DATABASE_URL,
  BOOTSTRAP_DATABASE_URL,
  hasDatabase
} from './testDatabaseUrls.js';

// Positive + negative proof that the three constrained identities (ADR-0005)
// actually have -- and are actually restricted to -- exactly the privileges
// migration 003 grants. Requires role provisioning (npm run provision-roles)
// to have already run against the disposable database. This file does not
// assume anything about execution order relative to tests/campaigns.test.ts
// or tests/openapiContract.test.ts (each of which independently owns its own
// migration lifecycle) -- it re-applies migrate:up itself, idempotently, as
// its own first test.

const API_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

test('migration up (fresh) prepares the schema for privilege boundary verification', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(pool);
  } finally {
    await pool.end();
  }
});

// Dedicated proof that the maintenance-path functions (ADR-0005: "используется
// только seed, append Campaign Event и projection rebuild") are actually
// exercised through the real lmapp_maintainer connection -- not merely
// through lmapp_migrator's ownership-level access, which would pass even if
// migration 003's grants to lmapp_maintainer were wrong or missing.
const REBUILD_PROBE_CAMPAIGN = '00000000-0000-4000-9100-000000000001';

test('maintainer: append creates the synthetic campaign used for rebuild verification', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 1 });
  try {
    const result = await appendCampaignStatusEvent(pool, {
      campaignId: REBUILD_PROBE_CAMPAIGN,
      status: 'Created',
      idempotencyKey: 'db-privilege-boundary:rebuild-probe'
    });
    assert.equal(result.isReplay, false);
    assert.equal(result.status, 'Created');
  } finally {
    await pool.end();
  }
});

test('maintainer: rebuildCampaignProjection restores a corrupted projection via the real maintainer connection', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 1 });
  try {
    await pool.query(
      "UPDATE leasemind_app.campaign_current_state_projection SET status = 'Failed', aggregate_version = 999 WHERE campaign_id = $1",
      [REBUILD_PROBE_CAMPAIGN]
    );

    await rebuildCampaignProjection(pool, REBUILD_PROBE_CAMPAIGN);

    const row = await pool.query(
      'SELECT status, aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [REBUILD_PROBE_CAMPAIGN]
    );
    assert.equal(row.rows[0].status, 'Created', 'rebuild must restore the status from the Event Log');
    assert.equal(row.rows[0].aggregate_version, '1');
  } finally {
    await pool.end();
  }
});

test(
  'maintainer: rebuildAllCampaignProjections restores corrupted projections via the real maintainer connection, without modifying the Event Log',
  { skip: !hasDatabase },
  async () => {
    const pool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 1 });
    try {
      const before = await pool.query(
        'SELECT campaign_id, event_sequence, event_hash FROM leasemind_app.campaign_event_log ORDER BY campaign_id, event_sequence'
      );

      // Corrupt again so rebuildAll (not just rebuildCampaignProjection) is
      // independently proven to fix it via the same maintainer connection.
      await pool.query(
        "UPDATE leasemind_app.campaign_current_state_projection SET status = 'Paused', aggregate_version = 42 WHERE campaign_id = $1",
        [REBUILD_PROBE_CAMPAIGN]
      );

      const rebuiltCount = await rebuildAllCampaignProjections(pool);
      assert.ok(rebuiltCount >= 1);

      const row = await pool.query(
        'SELECT status, aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
        [REBUILD_PROBE_CAMPAIGN]
      );
      assert.equal(row.rows[0].status, 'Created');
      assert.equal(row.rows[0].aggregate_version, '1');

      const after = await pool.query(
        'SELECT campaign_id, event_sequence, event_hash FROM leasemind_app.campaign_event_log ORDER BY campaign_id, event_sequence'
      );
      assert.deepEqual(after.rows, before.rows, 'rebuildAllCampaignProjections must not modify the Event Log');
    } finally {
      await pool.end();
    }
  }
);

test('maintainer still has none of the forbidden privileges after performing append + rebuild', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(pool.query('DELETE FROM leasemind_app.campaign_current_state_projection'), /permission denied/);
    await assert.rejects(pool.query('TRUNCATE leasemind_app.campaign_current_state_projection'), /permission denied/);
    await assert.rejects(pool.query('CREATE TABLE leasemind_app.probe_after_rebuild (id int)'), /permission denied/);
    await assert.rejects(pool.query('SELECT 1 FROM leasemind_app.schema_migrations'), /permission denied/);
  } finally {
    await pool.end();
  }
});

test('cleanup: remove the rebuild-probe campaign projection (Event Log rows remain, immutably)', { skip: !hasDatabase }, async () => {
  // lmapp_maintainer has no DELETE (by design); this cleanup, like the
  // equivalent one in tests/campaigns.test.ts, requires lmapp_migrator and
  // is test housekeeping, not part of the maintenance business path -- it
  // keeps later files' "exactly 11 synthetic campaigns" assertions valid.
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 1 });
  try {
    await pool.query('DELETE FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1', [
      REBUILD_PROBE_CAMPAIGN
    ]);
    await pool.query('DELETE FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1', [REBUILD_PROBE_CAMPAIGN]);
  } finally {
    await pool.end();
  }
});

async function query(connectionString: string | undefined, sql: string, params: unknown[] = []): Promise<pg.QueryResult> {
  const pool = new pg.Pool({ connectionString, max: 1 });
  try {
    return await pool.query(sql, params);
  } finally {
    await pool.end();
  }
}

test('migration 003 grants exactly the expected privileges to each constrained role', { skip: !hasDatabase }, async () => {
  const projectionPrivileges = async (role: string) =>
    (
      await query(
        BOOTSTRAP_DATABASE_URL,
        `SELECT
           has_table_privilege($1, 'leasemind_app.campaign_current_state_projection', 'SELECT') AS sel,
           has_table_privilege($1, 'leasemind_app.campaign_current_state_projection', 'INSERT') AS ins,
           has_table_privilege($1, 'leasemind_app.campaign_current_state_projection', 'UPDATE') AS upd,
           has_table_privilege($1, 'leasemind_app.campaign_current_state_projection', 'DELETE') AS del`,
        [role]
      )
    ).rows[0];

  const apiReaderPriv = await projectionPrivileges(API_READER_ROLE);
  assert.deepEqual(apiReaderPriv, { sel: true, ins: false, upd: false, del: false });

  const maintainerPriv = await projectionPrivileges(MAINTAINER_ROLE);
  // SELECT is required by PostgreSQL for INSERT ... ON CONFLICT DO UPDATE,
  // confirmed empirically -- see 003_least_privilege_grants.up.sql.
  assert.deepEqual(maintainerPriv, { sel: true, ins: true, upd: true, del: false });

  const eventLogPriv = (
    await query(
      BOOTSTRAP_DATABASE_URL,
      `SELECT
         has_table_privilege($1, 'leasemind_app.campaign_event_log', 'SELECT') AS sel,
         has_table_privilege($1, 'leasemind_app.campaign_event_log', 'INSERT') AS ins,
         has_table_privilege($1, 'leasemind_app.campaign_event_log', 'UPDATE') AS upd,
         has_table_privilege($1, 'leasemind_app.campaign_event_log', 'DELETE') AS del`,
      [MAINTAINER_ROLE]
    )
  ).rows[0];
  assert.deepEqual(eventLogPriv, { sel: true, ins: true, upd: false, del: false });

  const apiReaderEventLog = (
    await query(BOOTSTRAP_DATABASE_URL, "SELECT has_table_privilege($1, 'leasemind_app.campaign_event_log', 'SELECT') AS sel", [
      API_READER_ROLE
    ])
  ).rows[0];
  assert.equal(apiReaderEventLog.sel, false);

  const ledgerAccess = (
    await query(
      BOOTSTRAP_DATABASE_URL,
      `SELECT
         has_table_privilege($1, 'leasemind_app.schema_migrations', 'SELECT') AS reader_sel,
         has_table_privilege($2, 'leasemind_app.schema_migrations', 'SELECT') AS maintainer_sel`,
      [API_READER_ROLE, MAINTAINER_ROLE]
    )
  ).rows[0];
  assert.equal(ledgerAccess.reader_sel, false);
  assert.equal(ledgerAccess.maintainer_sel, false);

  const executePriv = (
    await query(
      BOOTSTRAP_DATABASE_URL,
      "SELECT has_function_privilege($1, 'leasemind_app.reject_campaign_event_log_mutation()', 'EXECUTE') AS exec",
      [API_READER_ROLE]
    )
  ).rows[0];
  assert.equal(executePriv.exec, false, 'PUBLIC EXECUTE on the trigger function must have been revoked');
});

test('the runtime privilege check passes for the real API reader connection', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 1 });
  try {
    await assert.doesNotReject(verifyRuntimeDatabasePrivileges(pool));
  } finally {
    await pool.end();
  }
});

for (const [label, urlGetter] of [
  ['migrator', () => MIGRATION_DATABASE_URL],
  ['maintainer', () => MAINTENANCE_DATABASE_URL],
  ['campaign writer', () => COMMAND_DATABASE_URL],
  ['bootstrap/admin', () => BOOTSTRAP_DATABASE_URL]
] as const) {
  test(`the runtime privilege check rejects the ${label} connection`, { skip: !hasDatabase }, async () => {
    const pool = new pg.Pool({ connectionString: urlGetter(), max: 1 });
    try {
      await assert.rejects(verifyRuntimeDatabasePrivileges(pool), DatabasePrivilegeViolation);
    } finally {
      await pool.end();
    }
  });
}

test('API reader: INSERT/UPDATE/DELETE/TRUNCATE on the projection are all denied', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(
      pool.query(
        "INSERT INTO leasemind_app.campaign_current_state_projection (campaign_id, status) VALUES ('00000000-0000-4000-8000-000000000001', 'Created')"
      ),
      /permission denied/
    );
    await assert.rejects(
      pool.query("UPDATE leasemind_app.campaign_current_state_projection SET status = 'Failed'"),
      /permission denied/
    );
    await assert.rejects(pool.query('DELETE FROM leasemind_app.campaign_current_state_projection'), /permission denied/);
    await assert.rejects(pool.query('TRUNCATE leasemind_app.campaign_current_state_projection'), /permission denied/);
  } finally {
    await pool.end();
  }
});

test('API reader: any access to campaign_event_log is denied', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(pool.query('SELECT 1 FROM leasemind_app.campaign_event_log'), /permission denied/);
    await assert.rejects(
      pool.query(
        "INSERT INTO leasemind_app.campaign_event_log (event_id) VALUES ('11111111-1111-4111-8111-111111111111')"
      ),
      /permission denied/
    );
  } finally {
    await pool.end();
  }
});

test('API reader: any access to campaign_stream_head and schema_migrations is denied', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(pool.query('SELECT 1 FROM leasemind_app.campaign_stream_head'), /permission denied/);
    await assert.rejects(pool.query('SELECT 1 FROM leasemind_app.schema_migrations'), /permission denied/);
  } finally {
    await pool.end();
  }
});

test('API reader: CREATE TABLE/SCHEMA/TEMP are all denied', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(pool.query('CREATE TABLE leasemind_app.probe (id int)'), /permission denied/);
    await assert.rejects(pool.query('CREATE SCHEMA probe_schema'), /permission denied/);
    await assert.rejects(pool.query('CREATE TEMP TABLE probe_temp (id int)'), /permission denied/);
  } finally {
    await pool.end();
  }
});

test('API reader: SET ROLE to migrator or maintainer is denied', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(pool.query(`SET ROLE ${MIGRATOR_ROLE}`), /permission denied/);
    await assert.rejects(pool.query(`SET ROLE ${MAINTAINER_ROLE}`), /permission denied/);
  } finally {
    await pool.end();
  }
});

test('Maintainer: DDL is denied', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(pool.query('CREATE TABLE leasemind_app.probe (id int)'), /permission denied/);
    await assert.rejects(pool.query('ALTER TABLE leasemind_app.campaign_event_log ADD COLUMN probe int'), /must be owner/);
  } finally {
    await pool.end();
  }
});

test('Maintainer: CREATE ROLE/DATABASE are denied', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(pool.query('CREATE ROLE probe_role'), /permission denied/);
    await assert.rejects(pool.query('CREATE DATABASE probe_db'), /permission denied/);
  } finally {
    await pool.end();
  }
});

test('Maintainer: schema_migrations is inaccessible', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(pool.query('SELECT 1 FROM leasemind_app.schema_migrations'), /permission denied/);
  } finally {
    await pool.end();
  }
});

test('Maintainer: DELETE/TRUNCATE on application tables are denied', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(pool.query('DELETE FROM leasemind_app.campaign_current_state_projection'), /permission denied/);
    await assert.rejects(pool.query('TRUNCATE leasemind_app.campaign_current_state_projection'), /permission denied/);
    await assert.rejects(pool.query('DELETE FROM leasemind_app.campaign_event_log'), /permission denied|CAMPAIGN_EVENT_LOG_IMMUTABLE/);
    await assert.rejects(pool.query('TRUNCATE leasemind_app.campaign_event_log'), /permission denied/);
  } finally {
    await pool.end();
  }
});

// ---------------------------------------------------------------------------
// Campaign writer (ADR-0007): the dedicated command-boundary identity for
// POST /api/v1/campaigns. Same positive/negative shape as the maintainer
// probes above -- proves the real lmapp_campaign_writer connection can do
// exactly what apps/api/src/db/createCampaign.ts needs and nothing else.
// ---------------------------------------------------------------------------

const WRITER_PROBE_CAMPAIGN = '00000000-0000-4000-9200-000000000001';

test('campaign writer: can append a synthetic Created event through the real connection', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 1 });
  try {
    const result = await appendCampaignStatusEvent(pool, {
      campaignId: WRITER_PROBE_CAMPAIGN,
      status: 'Created',
      idempotencyKey: 'db-privilege-boundary:campaign-writer-probe'
    });
    assert.equal(result.isReplay, false);
    assert.equal(result.status, 'Created');
  } finally {
    await pool.end();
  }
});

test('campaign writer: DELETE/TRUNCATE/DDL/ledger access are all denied', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(pool.query('DELETE FROM leasemind_app.campaign_current_state_projection'), /permission denied/);
    await assert.rejects(pool.query('TRUNCATE leasemind_app.campaign_current_state_projection'), /permission denied/);
    await assert.rejects(
      pool.query('DELETE FROM leasemind_app.campaign_event_log'),
      /permission denied|CAMPAIGN_EVENT_LOG_IMMUTABLE/
    );
    await assert.rejects(pool.query('CREATE TABLE leasemind_app.probe_writer (id int)'), /permission denied/);
    await assert.rejects(pool.query('CREATE ROLE probe_writer_role'), /permission denied/);
    await assert.rejects(pool.query('SELECT 1 FROM leasemind_app.schema_migrations'), /permission denied/);
    await assert.rejects(pool.query(`SET ROLE ${MIGRATOR_ROLE}`), /permission denied/);
    await assert.rejects(pool.query(`SET ROLE ${MAINTAINER_ROLE}`), /permission denied/);
    await assert.rejects(pool.query(`SET ROLE ${API_READER_ROLE}`), /permission denied/);
  } finally {
    await pool.end();
  }
});

test('cleanup: remove the campaign-writer-probe campaign projection (Event Log rows remain, immutably)', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 1 });
  try {
    await pool.query('DELETE FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1', [
      WRITER_PROBE_CAMPAIGN
    ]);
    await pool.query('DELETE FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1', [WRITER_PROBE_CAMPAIGN]);
  } finally {
    await pool.end();
  }
});

test('migration 004 grants exactly the expected privileges to the campaign writer', { skip: !hasDatabase }, async () => {
  const priv = async (table: string) =>
    (
      await query(
        BOOTSTRAP_DATABASE_URL,
        `SELECT
           has_table_privilege($1, $2, 'SELECT') AS sel,
           has_table_privilege($1, $2, 'INSERT') AS ins,
           has_table_privilege($1, $2, 'UPDATE') AS upd,
           has_table_privilege($1, $2, 'DELETE') AS del`,
        [CAMPAIGN_WRITER_ROLE, table]
      )
    ).rows[0];

  assert.deepEqual(await priv('leasemind_app.campaign_event_log'), { sel: true, ins: true, upd: false, del: false });
  assert.deepEqual(await priv('leasemind_app.campaign_stream_head'), { sel: true, ins: true, upd: true, del: false });
  assert.deepEqual(await priv('leasemind_app.campaign_current_state_projection'), {
    sel: true,
    ins: true,
    upd: true,
    del: false
  });

  const ledgerAccess = (
    await query(
      BOOTSTRAP_DATABASE_URL,
      "SELECT has_table_privilege($1, 'leasemind_app.schema_migrations', 'SELECT') AS sel",
      [CAMPAIGN_WRITER_ROLE]
    )
  ).rows[0];
  assert.equal(ledgerAccess.sel, false);
});

test('the runtime command privilege check passes for the real campaign writer connection', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 1 });
  try {
    await assert.doesNotReject(verifyRuntimeCommandPrivileges(pool));
  } finally {
    await pool.end();
  }
});

// ---------------------------------------------------------------------------
// Technical Assignment writer (ADR-0008): the dedicated command-boundary
// identity for POST /api/v1/technical-assignments. Same positive/negative
// shape as the maintainer/campaign-writer probes above.
// ---------------------------------------------------------------------------

test('the runtime Technical Assignment privilege check passes for the real ta writer connection', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 1 });
  try {
    await assert.doesNotReject(verifyRuntimeTechnicalAssignmentPrivileges(pool));
  } finally {
    await pool.end();
  }
});

for (const [label, urlGetter] of [
  ['migrator', () => MIGRATION_DATABASE_URL],
  ['maintainer', () => MAINTENANCE_DATABASE_URL],
  ['api reader', () => API_DATABASE_URL],
  ['campaign writer', () => COMMAND_DATABASE_URL],
  ['bootstrap/admin', () => BOOTSTRAP_DATABASE_URL]
] as const) {
  test(`the runtime Technical Assignment privilege check rejects the ${label} connection`, { skip: !hasDatabase }, async () => {
    const pool = new pg.Pool({ connectionString: urlGetter(), max: 1 });
    try {
      await assert.rejects(verifyRuntimeTechnicalAssignmentPrivileges(pool), DatabasePrivilegeViolation);
    } finally {
      await pool.end();
    }
  });
}

test('the runtime command privilege check rejects the ta writer connection', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(verifyRuntimeCommandPrivileges(pool), DatabasePrivilegeViolation);
  } finally {
    await pool.end();
  }
});

test('the runtime API reader privilege check rejects the ta writer connection', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(verifyRuntimeDatabasePrivileges(pool), DatabasePrivilegeViolation);
  } finally {
    await pool.end();
  }
});

test('ta writer: can write Property, TenantRequest and the protected address table through the real connection', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 1 });
  const propertyId = '00000000-0000-4000-9300-000000000001';
  try {
    await pool.query(
      `INSERT INTO leasemind_app.property
         (property_id, idempotency_key, lifecycle_status, property_type, property_country_code, property_region,
          property_city, property_area_sqm, property_condition, property_available_from, property_monthly_rent_rub,
          property_operating_expenses_included, property_utilities_included, property_allowed_business_categories,
          property_deal_priority)
       VALUES ($1, 'db-privilege-boundary:ta-writer-probe', 'ready_for_analysis', 'office', 'RU', 'Region', 'City', 100,
               'ready_to_use', CURRENT_DATE + 10, 100000, true, true, ARRAY['office'], 'balanced')`,
      [propertyId]
    );
    await pool.query(
      `INSERT INTO leasemind_app.property_protected_address (property_id, exact_address) VALUES ($1, 'Synthetic address')`,
      [propertyId]
    );
    const row = await pool.query('SELECT exact_address FROM leasemind_app.property_protected_address WHERE property_id = $1', [propertyId]);
    assert.equal(row.rows[0].exact_address, 'Synthetic address');
  } finally {
    await pool.query('DELETE FROM leasemind_app.property_protected_address WHERE property_id = $1', [propertyId]).catch(() => {});
    await pool.query('DELETE FROM leasemind_app.property WHERE property_id = $1', [propertyId]).catch(() => {});
    await pool.end();
  }
});

test('ta writer: DELETE/TRUNCATE/DDL and Campaign Event Log access are all denied', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 1 });
  try {
    await assert.rejects(pool.query('DELETE FROM leasemind_app.property'), /permission denied/);
    await assert.rejects(pool.query('TRUNCATE leasemind_app.property'), /permission denied/);
    await assert.rejects(pool.query('DELETE FROM leasemind_app.tenant_request'), /permission denied/);
    await assert.rejects(pool.query('CREATE TABLE leasemind_app.probe_ta_writer (id int)'), /permission denied/);
    await assert.rejects(pool.query('SELECT 1 FROM leasemind_app.campaign_event_log'), /permission denied/);
    await assert.rejects(pool.query('SELECT 1 FROM leasemind_app.campaign_stream_head'), /permission denied/);
    await assert.rejects(pool.query('SELECT 1 FROM leasemind_app.campaign_current_state_projection'), /permission denied/);
    await assert.rejects(pool.query('SELECT 1 FROM leasemind_app.schema_migrations'), /permission denied/);
    await assert.rejects(pool.query(`SET ROLE ${MIGRATOR_ROLE}`), /permission denied/);
    await assert.rejects(pool.query(`SET ROLE ${MAINTAINER_ROLE}`), /permission denied/);
    await assert.rejects(pool.query(`SET ROLE ${API_READER_ROLE}`), /permission denied/);
    await assert.rejects(pool.query(`SET ROLE ${CAMPAIGN_WRITER_ROLE}`), /permission denied/);
  } finally {
    await pool.end();
  }
});

test('migration 005 grants exactly the expected privileges to the ta writer, campaign writer and api reader', { skip: !hasDatabase }, async () => {
  const query = async (connectionString: string | undefined, sql: string, params: unknown[] = []): Promise<pg.QueryResult> => {
    const pool = new pg.Pool({ connectionString, max: 1 });
    try {
      return await pool.query(sql, params);
    } finally {
      await pool.end();
    }
  };

  const priv = async (role: string, table: string) =>
    (
      await query(
        BOOTSTRAP_DATABASE_URL,
        `SELECT
           has_table_privilege($1, $2, 'SELECT') AS sel,
           has_table_privilege($1, $2, 'INSERT') AS ins,
           has_table_privilege($1, $2, 'UPDATE') AS upd,
           has_table_privilege($1, $2, 'DELETE') AS del`,
        [role, table]
      )
    ).rows[0];

  assert.deepEqual(await priv(TA_WRITER_ROLE, 'leasemind_app.property'), { sel: true, ins: true, upd: true, del: false });
  assert.deepEqual(await priv(TA_WRITER_ROLE, 'leasemind_app.tenant_request'), { sel: true, ins: true, upd: true, del: false });
  assert.deepEqual(await priv(TA_WRITER_ROLE, 'leasemind_app.property_protected_address'), { sel: true, ins: true, upd: true, del: false });

  assert.deepEqual(await priv(CAMPAIGN_WRITER_ROLE, 'leasemind_app.property'), { sel: true, ins: false, upd: false, del: false });
  assert.deepEqual(await priv(API_READER_ROLE, 'leasemind_app.property'), { sel: true, ins: false, upd: false, del: false });

  const columnUpd = (
    await query(
      BOOTSTRAP_DATABASE_URL,
      `SELECT
         has_column_privilege($1, 'leasemind_app.property', 'lifecycle_status', 'UPDATE') AS lifecycle_ok,
         has_column_privilege($1, 'leasemind_app.property', 'property_monthly_rent_rub', 'UPDATE') AS commercial_fact_forbidden`,
      [CAMPAIGN_WRITER_ROLE]
    )
  ).rows[0];
  assert.equal(columnUpd.lifecycle_ok, true, 'campaign writer must be able to update lifecycle_status');
  assert.equal(columnUpd.commercial_fact_forbidden, false, 'campaign writer must not be able to update a commercial-fact column');

  const protectedAddressAccess = (
    await query(
      BOOTSTRAP_DATABASE_URL,
      `SELECT
         has_table_privilege($1, 'leasemind_app.property_protected_address', 'SELECT') AS reader_sel,
         has_table_privilege($2, 'leasemind_app.property_protected_address', 'SELECT') AS writer_sel`,
      [API_READER_ROLE, CAMPAIGN_WRITER_ROLE]
    )
  ).rows[0];
  assert.equal(protectedAddressAccess.reader_sel, false);
  assert.equal(protectedAddressAccess.writer_sel, false);
});

for (const [label, urlGetter] of [
  ['migrator', () => MIGRATION_DATABASE_URL],
  ['maintainer', () => MAINTENANCE_DATABASE_URL],
  ['api reader', () => API_DATABASE_URL],
  ['bootstrap/admin', () => BOOTSTRAP_DATABASE_URL]
] as const) {
  test(`the runtime command privilege check rejects the ${label} connection`, { skip: !hasDatabase }, async () => {
    const pool = new pg.Pool({ connectionString: urlGetter(), max: 1 });
    try {
      await assert.rejects(verifyRuntimeCommandPrivileges(pool), DatabasePrivilegeViolation);
    } finally {
      await pool.end();
    }
  });
}

// ---------------------------------------------------------------------------
// Fail-closed startup probes: spawn the real server.ts with DATABASE_URL
// pointed at each wrong identity and prove the port never opens.
// ---------------------------------------------------------------------------

function buildChildEnv(databaseUrl: string, port: number): NodeJS.ProcessEnv {
  const base: NodeJS.ProcessEnv = { ...process.env };
  for (const key of Object.keys(base)) {
    if (key.startsWith('LEASEMIND_')) {
      delete base[key];
    }
  }
  base.HOST = '127.0.0.1';
  base.PORT = String(port);
  base.NODE_ENV = 'development';
  base.DATABASE_URL = databaseUrl;
  // Never actually reached: verifyRuntimeDatabasePrivileges on the wrong
  // read identity always fails first (see main() in server.ts), before
  // verifyRuntimeCommandPrivileges runs -- this only needs to be present so
  // loadCommandDatabaseUrl() doesn't throw its own, different error first.
  base.LEASEMIND_COMMAND_DATABASE_URL = COMMAND_DATABASE_URL;
  // Same reasoning as LEASEMIND_COMMAND_DATABASE_URL above, for the
  // Technical Assignment pool.
  base.LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL = TA_DATABASE_URL;
  base.LEASEMIND_RUNTIME_MODE = 'synthetic';
  base.LEASEMIND_PRODUCTION_LAUNCH_GATE = 'blocked';
  base.LEASEMIND_ALLOW_REAL_PII = 'false';
  base.LEASEMIND_ALLOW_REAL_PAYMENTS = 'false';
  base.LEASEMIND_ALLOW_PROTECTED_REVEAL = 'false';
  base.LEASEMIND_ALLOW_PRODUCTION_ADAPTERS = 'false';
  return base;
}

interface RunResult {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

function runServerOnce(env: NodeJS.ProcessEnv, timeoutMs = 8000): Promise<RunResult> {
  return new Promise(resolve => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
      cwd: API_ROOT,
      env,
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);
    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });
  });
}

async function isPortOpen(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: '127.0.0.1', port }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });
}

async function assertStartupBlocked(databaseUrl: string | undefined, port: number): Promise<RunResult> {
  const env = buildChildEnv(databaseUrl as string, port);
  const result = await runServerOnce(env);
  assert.equal(result.timedOut, false, 'process must exit promptly');
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /DATABASE_PRIVILEGE_VIOLATION/);
  const portOpen = await isPortOpen(port);
  assert.equal(portOpen, false, 'the port must never have been opened');
  return result;
}

// Same as buildChildEnv, but DATABASE_URL stays the correct API reader --
// only LEASEMIND_COMMAND_DATABASE_URL is wrong. Proves
// verifyRuntimeCommandPrivileges independently blocks startup, not merely
// that verifyRuntimeDatabasePrivileges happens to catch every case.
function buildCommandChildEnv(commandDatabaseUrl: string, port: number): NodeJS.ProcessEnv {
  const env = buildChildEnv(API_DATABASE_URL as string, port);
  env.LEASEMIND_COMMAND_DATABASE_URL = commandDatabaseUrl;
  return env;
}

async function assertCommandStartupBlocked(commandDatabaseUrl: string | undefined, port: number): Promise<RunResult> {
  const env = buildCommandChildEnv(commandDatabaseUrl as string, port);
  const result = await runServerOnce(env);
  assert.equal(result.timedOut, false, 'process must exit promptly');
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /DATABASE_PRIVILEGE_VIOLATION/);
  const portOpen = await isPortOpen(port);
  assert.equal(portOpen, false, 'the port must never have been opened');
  return result;
}

test('superuser/bootstrap DATABASE_URL blocks startup before the port opens', { skip: !hasDatabase }, async () => {
  await assertStartupBlocked(BOOTSTRAP_DATABASE_URL, 34580);
});

test('migrator DATABASE_URL blocks startup before the port opens', { skip: !hasDatabase }, async () => {
  await assertStartupBlocked(MIGRATION_DATABASE_URL, 34581);
});

test('maintainer DATABASE_URL blocks startup before the port opens', { skip: !hasDatabase }, async () => {
  await assertStartupBlocked(MAINTENANCE_DATABASE_URL, 34582);
});

test(
  'a valid API reader DATABASE_URL with a wrong LEASEMIND_COMMAND_DATABASE_URL (migrator) still blocks startup',
  { skip: !hasDatabase },
  async () => {
    await assertCommandStartupBlocked(MIGRATION_DATABASE_URL, 34590);
  }
);

test(
  'a valid API reader DATABASE_URL with a wrong LEASEMIND_COMMAND_DATABASE_URL (maintainer) still blocks startup',
  { skip: !hasDatabase },
  async () => {
    await assertCommandStartupBlocked(MAINTENANCE_DATABASE_URL, 34591);
  }
);

test(
  'a valid API reader DATABASE_URL with a wrong LEASEMIND_COMMAND_DATABASE_URL (the read-only API reader itself) still blocks startup',
  { skip: !hasDatabase },
  async () => {
    await assertCommandStartupBlocked(API_DATABASE_URL, 34592);
  }
);

test(
  'a valid API reader DATABASE_URL with a wrong LEASEMIND_COMMAND_DATABASE_URL (bootstrap/admin) still blocks startup',
  { skip: !hasDatabase },
  async () => {
    await assertCommandStartupBlocked(BOOTSTRAP_DATABASE_URL, 34593);
  }
);

// Same as buildCommandChildEnv, but only
// LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL is wrong -- proves
// verifyRuntimeTechnicalAssignmentPrivileges independently blocks startup.
function buildTaChildEnv(technicalAssignmentDatabaseUrl: string, port: number): NodeJS.ProcessEnv {
  const env = buildChildEnv(API_DATABASE_URL as string, port);
  env.LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL = technicalAssignmentDatabaseUrl;
  return env;
}

async function assertTaStartupBlocked(technicalAssignmentDatabaseUrl: string | undefined, port: number): Promise<RunResult> {
  const env = buildTaChildEnv(technicalAssignmentDatabaseUrl as string, port);
  const result = await runServerOnce(env);
  assert.equal(result.timedOut, false, 'process must exit promptly');
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /DATABASE_PRIVILEGE_VIOLATION/);
  const portOpen = await isPortOpen(port);
  assert.equal(portOpen, false, 'the port must never have been opened');
  return result;
}

test(
  'a valid API reader DATABASE_URL with a wrong LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL (migrator) still blocks startup',
  { skip: !hasDatabase },
  async () => {
    await assertTaStartupBlocked(MIGRATION_DATABASE_URL, 34594);
  }
);

test(
  'a valid API reader DATABASE_URL with a wrong LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL (maintainer) still blocks startup',
  { skip: !hasDatabase },
  async () => {
    await assertTaStartupBlocked(MAINTENANCE_DATABASE_URL, 34595);
  }
);

test(
  'a valid API reader DATABASE_URL with a wrong LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL (campaign writer) still blocks startup',
  { skip: !hasDatabase },
  async () => {
    await assertTaStartupBlocked(COMMAND_DATABASE_URL, 34596);
  }
);

test(
  'a valid API reader DATABASE_URL with a wrong LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL (bootstrap/admin) still blocks startup',
  { skip: !hasDatabase },
  async () => {
    await assertTaStartupBlocked(BOOTSTRAP_DATABASE_URL, 34597);
  }
);

test(
  'an underprivileged role without SELECT on the projection also blocks startup before the port opens',
  { skip: !hasDatabase },
  async () => {
    const scratchRole = 'lmapp_probe_underprivileged';
    const scratchPassword = 'synthetic-probe-underprivileged-password';
    const bootstrapPool = new pg.Pool({ connectionString: BOOTSTRAP_DATABASE_URL, max: 1 });
    const dbNameResult = await bootstrapPool.query<{ current_database: string }>('SELECT current_database()');
    const dbIdent = `"${dbNameResult.rows[0].current_database.replace(/"/g, '""')}"`;
    try {
      const existing = await bootstrapPool.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [scratchRole]);
      if (existing.rowCount === 0) {
        await bootstrapPool.query(`CREATE ROLE ${scratchRole}`);
      }
      await bootstrapPool.query(
        `ALTER ROLE ${scratchRole} WITH LOGIN PASSWORD '${scratchPassword}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT`
      );
      await bootstrapPool.query(`GRANT CONNECT ON DATABASE ${dbIdent} TO ${scratchRole}`);
      // Deliberately grant nothing else: no schema USAGE, no table SELECT.

      const scratchUrl = (BOOTSTRAP_DATABASE_URL as string).replace(
        /\/\/[^:]+:[^@]+@/,
        `//${scratchRole}:${scratchPassword}@`
      );
      await assertStartupBlocked(scratchUrl, 34583);
    } finally {
      // DROP ROLE fails while the role still holds any grant (even a plain
      // CONNECT), so the CONNECT grant above must be revoked first.
      await bootstrapPool.query(`REVOKE CONNECT ON DATABASE ${dbIdent} FROM ${scratchRole}`).catch(() => {});
      await bootstrapPool.query(`DROP ROLE IF EXISTS ${scratchRole}`).catch(() => {});
      await bootstrapPool.end();
    }
  }
);

test('fail-closed startup errors never leak credentials or a stack trace', { skip: !hasDatabase }, async () => {
  const result = await assertStartupBlocked(MIGRATION_DATABASE_URL, 34584);
  const migrationUrl = MIGRATION_DATABASE_URL as string;
  const passwordMatch = migrationUrl.match(/:\/\/[^:]+:([^@]+)@/);
  const password = passwordMatch ? passwordMatch[1] : undefined;
  assert.equal(result.stderr.includes(migrationUrl), false);
  if (password) {
    assert.equal(result.stderr.includes(password), false);
  }
  assert.equal(result.stderr.includes('at ') /* stack trace frame marker */, false);
  assert.equal(result.stderr.includes(MIGRATOR_ROLE), false);
});
