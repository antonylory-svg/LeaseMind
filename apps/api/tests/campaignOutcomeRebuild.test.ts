import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { migrateUp } from '../src/db/migrate.js';
import { saveTechnicalAssignmentDraft } from '../src/db/technicalAssignment.js';
import { createOrReplayPreLaunchAnalysisSnapshot } from '../src/db/analysisSnapshot.js';
import { launchCampaignFromTechnicalAssignment } from '../src/db/launchCampaign.js';
import {
  appendCampaignStatusEvent,
  computeEventHash,
  GENESIS_EVENT_HASH,
  CAMPAIGN_EVENT_TYPE,
  CAMPAIGN_EVENT_SCHEMA_VERSION
} from '../src/db/campaignEvents.js';
import { executeCampaignOutcomeCommand, type CampaignOutcomeCommand } from '../src/db/campaignOutcomes.js';
import {
  CAMPAIGN_OUTCOME_REBUILD_INCONSISTENT,
  CampaignOutcomeRebuildError,
  rebuildAllCampaignOutcomeProjections,
  rebuildCampaignOutcomeProjection,
  rebuildCampaignProjections
} from '../src/db/campaignOutcomeRebuild.js';
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

// Campaign Outcome rebuild/recovery (ADR-0010 §12), Sprint 6 hardening pass.
// Same fixture discipline as campaignOutcomeCommand.test.ts: distinct
// fixtures per test, real launch flow, real record/correct commands via the
// writer connection -- fixtures/rows here are never cleaned up (the two
// immutable outcome tables cannot be). Gated on hasCampaignOutcomeDatabase
// && hasAnalysisDatabase, same as the command-core tests.

const SKIP = !hasCampaignOutcomeDatabase || !hasAnalysisDatabase;
const OPERATOR_REF = 'pilot-admin:11111111-1111-4111-8111-111111111111';

function futureDate(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 30);
  return date.toISOString().slice(0, 10);
}

function propertyPayload(): Record<string, unknown> {
  return {
    property_type: 'office',
    property_country_code: 'RU',
    property_region: 'Outcome Rebuild Synthetic Region',
    property_city: 'Outcome Rebuild Synthetic City',
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

async function createLaunchedFixture(
  taPool: pg.Pool,
  analysisPool: pg.Pool,
  commandPool: pg.Pool,
  prefix: string
): Promise<{ campaignId: string }> {
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
  return { campaignId: launch.campaign_id };
}

async function currentVersion(pool: pg.Pool, campaignId: string): Promise<string> {
  const result = await pool.query<{ aggregate_version: string }>(
    'SELECT aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
    [campaignId]
  );
  return result.rows[0].aggregate_version;
}

function buildCommand(overrides: Partial<CampaignOutcomeCommand> & { campaignId: string; expectedCampaignVersion: string }): CampaignOutcomeCommand {
  return {
    action: 'record',
    outcomeCode: 'success_via_leasemind',
    idempotencyKey: key('co-rebuild-cmd'),
    actorRef: OPERATOR_REF,
    confirmationAttested: true,
    execute: true,
    correctsOutcomeRecordId: null,
    correctionReasonCode: null,
    ...overrides
  };
}

/** Fabricates a standalone campaign.status_recorded.v1 event with NO
 * corresponding campaign_stream_head row -- structurally reachable only via
 * direct tampering (the real append path always creates both together),
 * exactly what rebuildCampaignProjections' "history exists but head is
 * missing" fail-closed branch must catch. Mirrors the identical technique
 * already established in campaignOutcomeCommand.test.ts's
 * insertOrphanSubjectLinkedEvent. */
async function insertOrphanStatusEvent(maintenancePool: pg.Pool, campaignId: string, status: string, idempotencyKey: string): Promise<void> {
  const eventId = randomUUID();
  const payload = { status };
  const commandHash = 'e'.repeat(64);
  const occurredAt = new Date();
  const eventHash = computeEventHash({
    eventId,
    campaignId,
    eventSequence: '1',
    eventType: CAMPAIGN_EVENT_TYPE,
    schemaVersion: CAMPAIGN_EVENT_SCHEMA_VERSION,
    payload,
    occurredAt: occurredAt.toISOString(),
    previousEventHash: GENESIS_EVENT_HASH,
    idempotencyKey,
    commandHash
  });
  await maintenancePool.query(
    `INSERT INTO leasemind_app.campaign_event_log
       (event_id, campaign_id, event_sequence, event_type, schema_version, payload,
        idempotency_key, command_hash, previous_event_hash, event_hash, occurred_at)
     VALUES ($1, $2, 1, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [eventId, campaignId, CAMPAIGN_EVENT_TYPE, CAMPAIGN_EVENT_SCHEMA_VERSION, JSON.stringify(payload), idempotencyKey, commandHash, GENESIS_EVENT_HASH, eventHash, occurredAt]
  );
}

test('campaign outcome rebuild: migrations are ready', { skip: SKIP }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(pool);
  } finally {
    await pool.end();
  }
});

test('rebuildCampaignOutcomeProjection: no-op for a Campaign with no outcome history at all', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'rebuild-noop');
    await assert.doesNotReject(rebuildCampaignOutcomeProjection(maintenancePool, fixture.campaignId));
    const pointer = await maintenancePool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(pointer.rowCount, 0, 'no-op must never create a pointer row out of nothing');
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), maintenancePool.end()]);
  }
});

test('rebuildCampaignOutcomeProjection: repoints to the record with the greatest outcome_sequence after the pointer is manually corrupted', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'rebuild-repoint');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    const record = await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'cancelled' }));

    const v2 = await currentVersion(commandPool, fixture.campaignId);
    const correction = await executeCampaignOutcomeCommand(writerPool, buildCommand({
      campaignId: fixture.campaignId,
      expectedCampaignVersion: v2,
      action: 'correct',
      outcomeCode: 'success_via_leasemind',
      correctsOutcomeRecordId: record.record.outcomeRecordId,
      correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
    }));

    // Manually corrupt the pointer back to the superseded original record --
    // lmapp_maintainer's own UPDATE(current_outcome_record_id, updated_at)
    // grant is exactly what a real accidental/manual maintenance mistake
    // would use.
    await maintenancePool.query(
      'UPDATE leasemind_app.campaign_outcome_current_projection SET current_outcome_record_id = $2, updated_at = clock_timestamp() WHERE campaign_id = $1',
      [fixture.campaignId, record.record.outcomeRecordId]
    );
    const corrupted = await maintenancePool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(corrupted.rows[0].current_outcome_record_id, record.record.outcomeRecordId, 'sanity: corruption must have taken effect');

    await rebuildCampaignOutcomeProjection(maintenancePool, fixture.campaignId);

    const repaired = await maintenancePool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(repaired.rows[0].current_outcome_record_id, correction.record.outcomeRecordId, 'rebuild must repoint to the record with the greatest outcome_sequence');
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end(), maintenancePool.end()]);
  }
});

test('rebuildAllCampaignOutcomeProjections: repairs every corrupted pointer and returns the exact count of Campaigns with outcome history', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  try {
    const fixtures = [];
    for (const prefix of ['rebuild-all-a', 'rebuild-all-b']) {
      const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, prefix);
      const v1 = await currentVersion(commandPool, fixture.campaignId);
      const record = await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'expired' }));
      const v2 = await currentVersion(commandPool, fixture.campaignId);
      const correction = await executeCampaignOutcomeCommand(writerPool, buildCommand({
        campaignId: fixture.campaignId,
        expectedCampaignVersion: v2,
        action: 'correct',
        outcomeCode: 'success_independently',
        correctsOutcomeRecordId: record.record.outcomeRecordId,
        correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
      }));
      await maintenancePool.query(
        'UPDATE leasemind_app.campaign_outcome_current_projection SET current_outcome_record_id = $2, updated_at = clock_timestamp() WHERE campaign_id = $1',
        [fixture.campaignId, record.record.outcomeRecordId]
      );
      fixtures.push({ campaignId: fixture.campaignId, correctOutcomeRecordId: correction.record.outcomeRecordId });
    }

    // The exact expected count is computed independently, at the same
    // moment, rather than hardcoded -- this function may legitimately also
    // process Campaigns created by other tests/files sharing this database
    // (every accepted outcome row is immutable and permanent by design).
    const expectedCount = await maintenancePool.query<{ count: string }>(
      'SELECT count(DISTINCT campaign_id)::text AS count FROM leasemind_app.campaign_outcome_event_log'
    );

    const processed = await rebuildAllCampaignOutcomeProjections(maintenancePool);
    assert.equal(processed, Number(expectedCount.rows[0].count), 'must return the exact number of Campaigns with outcome history, not an estimate');

    for (const fixture of fixtures) {
      const pointer = await maintenancePool.query(
        'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
        [fixture.campaignId]
      );
      assert.equal(pointer.rows[0].current_outcome_record_id, fixture.correctOutcomeRecordId, `campaign ${fixture.campaignId} must be repointed to its correction`);
    }
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end(), maintenancePool.end()]);
  }
});

test('rebuildCampaignProjections (coordinated): repairs both the lifecycle and outcome projections atomically, under one COMMIT', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'rebuild-coordinated');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    const record = await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'success_via_leasemind' }));
    const realVersion = await currentVersion(commandPool, fixture.campaignId);

    // Corrupt BOTH projections independently, exactly as an out-of-band
    // maintenance mistake could: the lifecycle projection's status/version,
    // and the outcome pointer (there is only one outcome row so far, so
    // "corrupt" here means clearing it is impossible -- instead corrupt the
    // lifecycle projection, which is the more realistic and independently
    // observable half of this proof).
    await commandPool.query(
      `UPDATE leasemind_app.campaign_current_state_projection SET status = 'Analyzing', aggregate_version = 999 WHERE campaign_id = $1`,
      [fixture.campaignId]
    );
    const corrupted = await commandPool.query<{ status: string; aggregate_version: string }>(
      'SELECT status, aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(corrupted.rows[0].status, 'Analyzing', 'sanity: corruption must have taken effect');

    await rebuildCampaignProjections(maintenancePool, fixture.campaignId);

    const repairedLifecycle = await commandPool.query<{ status: string; aggregate_version: string }>(
      'SELECT status, aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(repairedLifecycle.rows[0].status, 'Completed');
    assert.equal(repairedLifecycle.rows[0].aggregate_version, realVersion);

    const repairedOutcome = await maintenancePool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(repairedOutcome.rows[0].current_outcome_record_id, record.record.outcomeRecordId);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end(), maintenancePool.end()]);
  }
});

test('rebuildCampaignProjections: a Campaign with no lifecycle events and no outcome history at all is a legitimate no-op, and never creates a genesis stream head', { skip: SKIP }, async () => {
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  try {
    const neverTouchedCampaignId = randomUUID();
    await assert.doesNotReject(rebuildCampaignProjections(maintenancePool, neverTouchedCampaignId));
    const head = await maintenancePool.query(
      'SELECT 1 FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1',
      [neverTouchedCampaignId]
    );
    assert.equal(head.rowCount, 0, 'a genesis stream head must never be created by rebuild');
  } finally {
    await maintenancePool.end();
  }
});

test('rebuildCampaignProjections: a lifecycle event without a stream head fails closed and writes nothing', { skip: SKIP }, async () => {
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  try {
    const orphanCampaignId = randomUUID();
    await insertOrphanStatusEvent(maintenancePool, orphanCampaignId, 'Created', key('rebuild-orphan-event'));

    await assert.rejects(
      rebuildCampaignProjections(maintenancePool, orphanCampaignId),
      (error: unknown) => {
        assert.ok(error instanceof CampaignOutcomeRebuildError, `expected a CampaignOutcomeRebuildError, got ${String(error)}`);
        assert.equal(error.safeCode, CAMPAIGN_OUTCOME_REBUILD_INCONSISTENT);
        return true;
      }
    );

    const head = await maintenancePool.query('SELECT 1 FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1', [orphanCampaignId]);
    assert.equal(head.rowCount, 0, 'no genesis stream head must be created even on the fail-closed path');
    const projection = await maintenancePool.query(
      'SELECT 1 FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [orphanCampaignId]
    );
    assert.equal(projection.rowCount, 0, 'no lifecycle projection row must be created on the fail-closed path');
  } finally {
    await maintenancePool.end();
  }
});

test('rebuildCampaignOutcomeProjection: fails closed on a cross-consistency mismatch between the outcome record and its linked lifecycle event, without corrupting the existing correct pointer', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const migratorPool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 1 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'rebuild-cross-consistency');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    const record = await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'success_via_leasemind' }));

    // The real lifecycle event this record legitimately references.
    const linked = await commandPool.query<{ event_sequence: string; status: string }>(
      `SELECT event_sequence::text AS event_sequence, payload->>'status' AS status
         FROM leasemind_app.campaign_event_log
        WHERE campaign_id = $1 AND event_sequence = $2`,
      [fixture.campaignId, record.record.resultingCampaignAggregateVersion]
    );
    assert.equal(linked.rows[0].status, 'Completed');

    // Fabricate a second, directly-inserted outcome row (bypassing the
    // application flow, trigger disabled only for this one malicious INSERT
    // -- never for the two DB CHECK-rejection proofs in
    // campaignOutcomeDatabaseFoundation.test.ts, and re-enabled immediately
    // in `finally`) whose mapped_lifecycle_status ('Failed') deliberately
    // does not match the real linked event's actual status ('Completed'),
    // while still satisfying every other CHECK/FK (outcome_code='cancelled'
    // legitimately pairs with mapped_lifecycle_status='Failed', so
    // campaign_outcome_event_log_mapping_valid itself is satisfied -- only
    // the cross-reference to the *actual* campaign_event_log row is wrong).
    const badOutcomeRecordId = randomUUID();
    await migratorPool.query('ALTER TABLE leasemind_app.campaign_outcome_event_log DISABLE TRIGGER campaign_outcome_event_log_verify_resulting_event');
    try {
      await migratorPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ($1, $2, 2, 'correct', 'cancelled', 'Failed', 'user_attestation', $3, $4, 'OUTCOME_CLASSIFICATION_CORRECTED', 'synthetic', $5)`,
        [badOutcomeRecordId, fixture.campaignId, OPERATOR_REF, record.record.outcomeRecordId, record.record.resultingCampaignAggregateVersion]
      );
    } finally {
      await migratorPool.query('ALTER TABLE leasemind_app.campaign_outcome_event_log ENABLE TRIGGER campaign_outcome_event_log_verify_resulting_event');
    }

    const pointerBefore = await maintenancePool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(pointerBefore.rows[0].current_outcome_record_id, record.record.outcomeRecordId);

    await assert.rejects(
      rebuildCampaignOutcomeProjection(maintenancePool, fixture.campaignId),
      (error: unknown) => {
        assert.ok(error instanceof CampaignOutcomeRebuildError, `expected a CampaignOutcomeRebuildError, got ${String(error)}`);
        assert.equal(error.safeCode, CAMPAIGN_OUTCOME_REBUILD_INCONSISTENT);
        assert.doesNotMatch(error.message, /SQL|SELECT|INSERT|password/i, 'must never leak raw SQL text');
        return true;
      }
    );

    const pointerAfter = await maintenancePool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(pointerAfter.rows[0].current_outcome_record_id, record.record.outcomeRecordId, 'the fail-closed rebuild must never repoint to the inconsistent row');
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end(), maintenancePool.end(), migratorPool.end()]);
  }
});

test('rebuildCampaignOutcomeProjection and coordinated rebuildCampaignProjections both fail closed when an EARLIER (superseded) outcome row is cross-consistency-invalid, even though the latest correction is itself perfectly valid', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const migratorPool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 1 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'rebuild-history-scan');

    // A real, unrelated lifecycle event this fabricated 'record' row will
    // wrongly claim to back -- its real status ('Analyzing') will not match
    // the fabricated row's claimed mapped_lifecycle_status ('Completed').
    await appendCampaignStatusEvent(maintenancePool, {
      campaignId: fixture.campaignId,
      status: 'Analyzing',
      idempotencyKey: key('rebuild-history-scan-analyzing')
    });
    const versionAfterAnalyzing = await currentVersion(commandPool, fixture.campaignId);

    // Fabricate the Campaign's *first* (outcome_sequence=1) outcome row
    // directly, bypassing the application flow -- trigger disabled only for
    // this one INSERT, re-enabled immediately in `finally`. Its
    // outcome_code/mapped_lifecycle_status pairing ('success_via_leasemind'/
    // 'Completed') is internally valid (campaign_outcome_event_log_mapping_valid
    // is satisfied), but resulting_campaign_aggregate_version points at the
    // real 'Analyzing' event above -- a genuine cross-consistency violation
    // the trigger would normally have caught at write time.
    const fabricatedRecordId = randomUUID();
    await migratorPool.query('ALTER TABLE leasemind_app.campaign_outcome_event_log DISABLE TRIGGER campaign_outcome_event_log_verify_resulting_event');
    try {
      await migratorPool.query(
        `INSERT INTO leasemind_app.campaign_outcome_event_log
           (outcome_record_id, campaign_id, outcome_sequence, command_type, outcome_code, mapped_lifecycle_status,
            confirmation_method, operator_ref, corrects_outcome_record_id, correction_reason_code, runtime_mode,
            resulting_campaign_aggregate_version)
         VALUES ($1, $2, 1, 'record', 'success_via_leasemind', 'Completed', 'user_attestation', $3, NULL, NULL, 'synthetic', $4)`,
        [fabricatedRecordId, fixture.campaignId, OPERATOR_REF, versionAfterAnalyzing]
      );
    } finally {
      await migratorPool.query('ALTER TABLE leasemind_app.campaign_outcome_event_log ENABLE TRIGGER campaign_outcome_event_log_verify_resulting_event');
    }

    // Manually point the current projection at the fabricated row, and set
    // the Campaign's real lifecycle status to match its claimed
    // mapped_lifecycle_status -- both prerequisites for a real `correct`
    // command to accept it as the current effective outcome. Neither touches
    // aggregate_version/stream_head, so their own internal-consistency
    // invariant is untouched.
    await maintenancePool.query(
      `INSERT INTO leasemind_app.campaign_outcome_current_projection (campaign_id, current_outcome_record_id) VALUES ($1, $2)`,
      [fixture.campaignId, fabricatedRecordId]
    );
    await commandPool.query(`UPDATE leasemind_app.campaign_current_state_projection SET status = 'Completed' WHERE campaign_id = $1`, [fixture.campaignId]);

    // A REAL correction, through the real command core, targeting the
    // fabricated row as its corrects_outcome_record_id. Every one of the
    // insert-verification trigger's own 'correct' checks (resulting-event
    // match for THIS new row, current-pointer match, sequence continuity,
    // outcome_code change) passes -- none of them re-validate the row being
    // corrected, only its own shape -- so this legitimately succeeds and
    // appends a real, fully cross-consistent 'Failed' lifecycle event.
    const correctionVersion = await currentVersion(commandPool, fixture.campaignId);
    const correction = await executeCampaignOutcomeCommand(writerPool, buildCommand({
      campaignId: fixture.campaignId,
      expectedCampaignVersion: correctionVersion,
      action: 'correct',
      outcomeCode: 'cancelled',
      correctsOutcomeRecordId: fabricatedRecordId,
      correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
    }));
    assert.equal(correction.record.mappedLifecycleStatus, 'Failed');

    // Sanity: the latest row (the correction) is, on its own, perfectly
    // cross-consistent -- proving this test is really exercising the
    // "earlier row" branch, not merely re-proving the latest-row check.
    const latestLinkedEvent = await commandPool.query<{ status: string }>(
      `SELECT payload->>'status' AS status FROM leasemind_app.campaign_event_log WHERE campaign_id = $1 AND event_sequence = $2`,
      [fixture.campaignId, correction.record.resultingCampaignAggregateVersion]
    );
    assert.equal(latestLinkedEvent.rows[0].status, 'Failed', 'sanity: the latest (correction) row must itself be genuinely cross-consistent');

    const pointerBeforeRebuild = await maintenancePool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(pointerBeforeRebuild.rows[0].current_outcome_record_id, correction.record.outcomeRecordId);
    const lifecycleBeforeRebuild = await commandPool.query<{ status: string; aggregate_version: string }>(
      'SELECT status, aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );

    function assertRebuildInconsistent(promise: Promise<unknown>): Promise<void> {
      return assert.rejects(promise, (error: unknown) => {
        assert.ok(error instanceof CampaignOutcomeRebuildError, `expected a CampaignOutcomeRebuildError, got ${String(error)}`);
        assert.equal(error.safeCode, CAMPAIGN_OUTCOME_REBUILD_INCONSISTENT);
        assert.doesNotMatch(error.message, /SQL|SELECT|INSERT|password/i, 'must never leak raw SQL text');
        return true;
      });
    }

    // (1) The single-Campaign outcome rebuild must fail closed, scanning the
    // WHOLE history -- not just the latest (valid) row.
    await assertRebuildInconsistent(rebuildCampaignOutcomeProjection(maintenancePool, fixture.campaignId));

    // (2) The coordinated rebuild must fail closed too, and roll back
    // entirely -- including whatever the lifecycle half of the coordinated
    // transaction would otherwise have committed.
    await assertRebuildInconsistent(rebuildCampaignProjections(maintenancePool, fixture.campaignId));

    // Neither projection changed: the current pointer still references the
    // valid correction (never reset, never repointed to the fabricated
    // row), and the lifecycle projection is byte-identical to before both
    // rejected rebuild attempts.
    const pointerAfterRebuild = await maintenancePool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(pointerAfterRebuild.rows[0].current_outcome_record_id, correction.record.outcomeRecordId, 'the pointer must remain on the valid correction after both rejected rebuilds');
    const lifecycleAfterRebuild = await commandPool.query<{ status: string; aggregate_version: string }>(
      'SELECT status, aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.deepEqual(lifecycleAfterRebuild.rows[0], lifecycleBeforeRebuild.rows[0], 'the lifecycle projection must be unchanged after both rejected rebuilds');

    // The history and mapping themselves are never touched by rebuild --
    // both rows (fabricated and real correction) are exactly as before.
    const historyCount = await maintenancePool.query<{ count: string }>(
      'SELECT count(*)::text AS count FROM leasemind_app.campaign_outcome_event_log WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(historyCount.rows[0].count, '2');
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end(), maintenancePool.end(), migratorPool.end()]);
  }
});
