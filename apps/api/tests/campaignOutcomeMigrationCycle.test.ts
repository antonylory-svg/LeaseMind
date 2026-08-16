import { test } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { migrateUp, migrateDown } from '../src/db/migrate.js';
import { MIGRATION_DATABASE_URL, hasDatabase } from './testDatabaseUrls.js';

// Dedicated full up -> down -> up -> down cycle for migration 011
// (Campaign Outcome database foundation, ADR-0010). Deliberately isolated
// into its own file/process invocation, run against its own disposable
// database that has NEVER had any campaign_outcome_* row inserted --
// campaignOutcomeDatabaseFoundation.test.ts intentionally inserts real rows
// into the two immutable tables (which then can never be deleted again, not
// even by the table owner -- that is the whole point of ADR-0010's
// fail-closed down.sql), so running a full migrateDown() cycle in the same
// database as that file would either destroy fixtures other test files
// depend on (migrateDown reverts the ENTIRE chain, 011 down to 001, not
// just 011) or hit the intentional non-empty guard. This file must only
// ever be run against a database provisioned and used for nothing else.

function pool(connectionString: string | undefined, max = 1): pg.Pool {
  return new pg.Pool({ connectionString, max });
}

// Opt-in only, even when hasDatabase is true: this test runs a full
// migrateDown() (the ENTIRE chain, 011 back to 001, not just 011) and
// requires that campaign_outcome_event_log/campaign_outcome_idempotency_mapping
// have never had a row inserted (they can never be emptied again once they
// do -- that is the intended behavior of ADR-0010's immutable tables). If
// this file ran automatically alongside campaignOutcomeDatabaseFoundation.test.ts
// under a single shared `npm test` invocation, whichever file happened to
// run first would make the other fail (either by tearing down fixtures the
// other file's later tests need, or by tripping the non-empty down-migration
// guard). Requiring this explicit flag keeps it out of the normal suite.
const RUN_MIGRATION_CYCLE_TEST = process.env.LEASEMIND_RUN_MIGRATION_CYCLE_TEST === 'true';

test('full migrate:up -> migrate:down -> migrate:up -> migrate:down cycle succeeds on an empty database, and repeated migrate:up is idempotent', { skip: !hasDatabase || !RUN_MIGRATION_CYCLE_TEST }, async () => {
  const migrationPool = pool(MIGRATION_DATABASE_URL, 2);
  try {
    const up1 = await migrateUp(migrationPool);
    assert.ok(
      up1.applied.includes('011_campaign_outcome.up.sql') || up1.skipped.includes('011_campaign_outcome.up.sql'),
      'migration 011 must apply (or already be applied) on the first up'
    );

    const objectsAfterUp1 = await migrationPool.query(
      `SELECT to_regclass('leasemind_app.campaign_outcome_event_log') AS event_log,
              to_regclass('leasemind_app.campaign_outcome_current_projection') AS projection,
              to_regclass('leasemind_app.campaign_outcome_idempotency_mapping') AS mapping,
              to_regclass('leasemind_app.campaign_outcome_public_projection') AS view`
    );
    assert.notEqual(objectsAfterUp1.rows[0].event_log, null);
    assert.notEqual(objectsAfterUp1.rows[0].projection, null);
    assert.notEqual(objectsAfterUp1.rows[0].mapping, null);
    assert.notEqual(objectsAfterUp1.rows[0].view, null);

    const down1 = await migrateDown(migrationPool);
    assert.ok(down1.reverted.includes('011_campaign_outcome.down.sql'), 'migration 011 down must run cleanly on empty outcome history');

    const objectsAfterDown1 = await migrationPool.query(
      `SELECT to_regclass('leasemind_app.campaign_outcome_event_log') AS event_log,
              to_regclass('leasemind_app.campaign_outcome_public_projection') AS view`
    );
    assert.equal(objectsAfterDown1.rows[0].event_log, null, 'campaign_outcome_event_log must be gone after down');
    assert.equal(objectsAfterDown1.rows[0].view, null, 'campaign_outcome_public_projection must be gone after down');

    const up2 = await migrateUp(migrationPool);
    assert.ok(up2.applied.includes('011_campaign_outcome.up.sql'), 'migration 011 must re-apply cleanly after a full down');

    const up3 = await migrateUp(migrationPool);
    assert.ok(up3.skipped.includes('011_campaign_outcome.up.sql'), 'a repeated migrate:up must be idempotent (skip, not re-apply)');

    const down2 = await migrateDown(migrationPool);
    assert.ok(down2.reverted.includes('011_campaign_outcome.down.sql'), 'migration 011 down must run cleanly a second time');

    // Leave the database in the "up" state for symmetry with every other
    // migration's expected steady state, and so a subsequent run of this
    // same test is itself idempotent.
    await migrateUp(migrationPool);
  } finally {
    await migrationPool.end();
  }
});
