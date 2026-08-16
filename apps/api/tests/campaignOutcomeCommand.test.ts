import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { buildApp } from '../src/app.js';
import { migrateUp } from '../src/db/migrate.js';
import { saveTechnicalAssignmentDraft } from '../src/db/technicalAssignment.js';
import { createOrReplayPreLaunchAnalysisSnapshot } from '../src/db/analysisSnapshot.js';
import { launchCampaignFromTechnicalAssignment, SUBJECT_LINKED_EVENT_TYPE } from '../src/db/launchCampaign.js';
import { appendCampaignStatusEvent, computeEventHash, GENESIS_EVENT_HASH } from '../src/db/campaignEvents.js';
import {
  CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED,
  CAMPAIGN_OUTCOME_CORRECTION_TARGET_STALE,
  CAMPAIGN_OUTCOME_EFFECTIVE_OUTCOME_ALREADY_EXISTS,
  CAMPAIGN_OUTCOME_IDEMPOTENCY_CONFLICT,
  CAMPAIGN_OUTCOME_NO_EFFECTIVE_OUTCOME,
  CAMPAIGN_OUTCOME_OPERATION_FAILED,
  CAMPAIGN_OUTCOME_SAME_CODE_REJECTED,
  CAMPAIGN_OUTCOME_STATE_INCONSISTENT,
  CAMPAIGN_OUTCOME_STATUS_NOT_ELIGIBLE,
  CAMPAIGN_OUTCOME_VERSION_CONFLICT,
  CampaignOutcomeError,
  dryRunCampaignOutcomeCommand,
  executeCampaignOutcomeCommand,
  OUTCOME_CODES,
  OUTCOME_CODE_TO_LIFECYCLE_STATUS,
  type CampaignOutcomeCommand
} from '../src/db/campaignOutcomes.js';
import {
  ANALYSIS_DATABASE_URL,
  API_DATABASE_URL,
  CAMPAIGN_OUTCOME_DATABASE_URL,
  COMMAND_DATABASE_URL,
  MAINTENANCE_DATABASE_URL,
  MIGRATION_DATABASE_URL,
  TA_DATABASE_URL,
  hasAnalysisDatabase,
  hasCampaignOutcomeDatabase
} from './testDatabaseUrls.js';

// Campaign Outcome command core (Sprint 6, second technical block). See
// 02_PRODUCT/CAMPAIGN_OUTCOMES.md v0.2 and
// 03_ARCHITECTURE/decisions/ADR-0010-campaign-outcome-implementation.md §5-9,
// §14 (acceptance coverage matrix CO-C-001..030, referenced throughout).
//
// Requires the full ADR-0009 launch machinery (Technical Assignment +
// pre-launch Analysis + launchCampaignFromTechnicalAssignment) to produce a
// genuinely launched Campaign with both required launch-proof sources
// (campaign.subject_linked.v1 event AND campaign_subject_link_projection
// row) -- exactly what a real caller would have. Gated on
// hasCampaignOutcomeDatabase && hasAnalysisDatabase.
//
// Every accepted `record`/`correct` here permanently and immutably writes
// campaign_outcome_event_log/campaign_outcome_idempotency_mapping rows --
// same discipline as campaignOutcomeDatabaseFoundation.test.ts: distinct
// fixtures per test, never reused, never cleaned up.

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
    property_region: 'Outcome Synthetic Region',
    property_city: 'Outcome Synthetic City',
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

interface LaunchedFixture {
  campaignId: string;
}

/** Produces a genuinely launched Campaign (status='Created') through the
 * real ADR-0008/0009 launch flow -- both launch-proof sources present and
 * consistent, exactly as a real caller would have. Mirrors the identical
 * pattern already established in postLaunchRefreshWorker.test.ts. */
async function createLaunchedFixture(
  taPool: pg.Pool,
  analysisPool: pg.Pool,
  commandPool: pg.Pool,
  prefix: string
): Promise<LaunchedFixture> {
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

/** A Campaign identity that has never been touched at all: no stream head,
 * no event, no projection of any kind. CO-C-003, both proof sources
 * absent. */
function neverLaunchedCampaignId(): string {
  return randomUUID();
}

/** Fabricates the "one launch-proof source present, the other absent"
 * mismatch (CO-C-003's defensive branch) directly at the SQL layer --
 * launchCampaignFromTechnicalAssignment always creates both atomically, so
 * this state can only arise from direct tampering, which is exactly what
 * this helper simulates for test purposes. campaign_event_log has no FK to
 * campaign_stream_head or to any property/tenant_request row, so a
 * standalone campaign.subject_linked.v1 event can be inserted without any
 * other object existing for this campaign_id. */
async function insertOrphanSubjectLinkedEvent(maintenancePool: pg.Pool, campaignId: string, idempotencyKey: string): Promise<string> {
  const eventId = randomUUID();
  const payload = {
    entity_type: 'Property' as const,
    entity_id: randomUUID(),
    source_technical_assignment_id: randomUUID(),
    source_schema_version: '1.0',
    source_revision: 1
  };
  const commandHash = 'c'.repeat(64);
  const occurredAt = new Date();
  const eventHash = computeEventHash({
    eventId,
    campaignId,
    eventSequence: '1',
    eventType: SUBJECT_LINKED_EVENT_TYPE,
    schemaVersion: 1,
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
     VALUES ($1, $2, 1, $3, 1, $4, $5, $6, $7, $8, $9)`,
    [eventId, campaignId, SUBJECT_LINKED_EVENT_TYPE, JSON.stringify(payload), idempotencyKey, commandHash, GENESIS_EVENT_HASH, eventHash, occurredAt]
  );
  return eventHash;
}

/** CO-C-003's defensive branch, the "head already exists" variant: unlike
 * insertOrphanSubjectLinkedEvent alone (which leaves campaign_stream_head
 * absent), this additionally creates a stream head consistent with the
 * orphan event, so runLockedCommand's `head.rowCount > 0` branch -- not the
 * `head.rowCount === 0` branch -- is what evaluates the launch-proof
 * mismatch. lmapp_maintainer has SELECT/INSERT/UPDATE on
 * campaign_stream_head (migration 003). */
async function createExistingHeadEventOnlyMismatch(maintenancePool: pg.Pool, campaignId: string, idempotencyKey: string): Promise<void> {
  const eventHash = await insertOrphanSubjectLinkedEvent(maintenancePool, campaignId, idempotencyKey);
  await maintenancePool.query(
    `INSERT INTO leasemind_app.campaign_stream_head (campaign_id, current_sequence, current_event_hash) VALUES ($1, 1, $2)`,
    [campaignId, eventHash]
  );
}

/** The mirror-image "head already exists" variant: a stream head created
 * (current_sequence = 0, genesis hash -- a legitimate state meaning "head
 * exists, nothing appended yet") alongside an orphan
 * campaign_subject_link_projection row, but never a subject_linked event. */
async function createExistingHeadProjectionOnlyMismatch(
  taPool: pg.Pool,
  commandPool: pg.Pool,
  maintenancePool: pg.Pool,
  campaignId: string,
  prefix: string
): Promise<void> {
  await insertOrphanSubjectLinkProjection(taPool, commandPool, campaignId, prefix);
  await maintenancePool.query(
    `INSERT INTO leasemind_app.campaign_stream_head (campaign_id, current_sequence, current_event_hash) VALUES ($1, 0, $2)`,
    [campaignId, GENESIS_EVENT_HASH]
  );
}

/** The mirror-image mismatch: a campaign_subject_link_projection row with
 * no corresponding campaign.subject_linked.v1 event anywhere. Requires a
 * real property row (FK), but never a stream head or event. */
async function insertOrphanSubjectLinkProjection(
  taPool: pg.Pool,
  commandPool: pg.Pool,
  campaignId: string,
  prefix: string
): Promise<void> {
  const assignment = await saveTechnicalAssignmentDraft(taPool, {
    idempotencyKey: key(`${prefix}-orphan-ta`),
    scenario: 'need_tenant',
    payload: propertyPayload()
  });
  await commandPool.query(
    `INSERT INTO leasemind_app.campaign_current_state_projection (campaign_id, status) VALUES ($1, 'Created')`,
    [campaignId]
  );
  await commandPool.query(
    `INSERT INTO leasemind_app.campaign_subject_link_projection (
       campaign_id, scenario, property_id, source_revision, source_schema_version,
       linked_at, authorization_contract_version
     ) VALUES ($1, 'need_tenant', $2, $3, '1.0', clock_timestamp(), 'legacy_v1')`,
    [campaignId, assignment.technical_assignment_id, assignment.revision]
  );
}

/** Canonical decimal string, never `number` -- see
 * CampaignOutcomeCommand.expectedCampaignVersion. */
async function currentVersion(pool: pg.Pool, campaignId: string): Promise<string> {
  const result = await pool.query<{ aggregate_version: string }>(
    'SELECT aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
    [campaignId]
  );
  return result.rows[0].aggregate_version;
}

/** Lossless decimal-string arithmetic via BigInt -- never Number(). */
function versionPlus(version: string, delta: number): string {
  return (BigInt(version) + BigInt(delta)).toString();
}

async function outcomeRowCount(pool: pg.Pool, campaignId: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    'SELECT count(*)::text AS count FROM leasemind_app.campaign_outcome_event_log WHERE campaign_id = $1',
    [campaignId]
  );
  return Number(result.rows[0].count);
}

function buildCommand(overrides: Partial<CampaignOutcomeCommand> & { campaignId: string; expectedCampaignVersion: string }): CampaignOutcomeCommand {
  return {
    action: 'record',
    outcomeCode: 'success_via_leasemind',
    idempotencyKey: key('co-cmd'),
    actorRef: OPERATOR_REF,
    confirmationAttested: true,
    execute: true,
    correctsOutcomeRecordId: null,
    correctionReasonCode: null,
    ...overrides
  };
}

async function assertRejects(promise: Promise<unknown>, expectedCode: string): Promise<void> {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof CampaignOutcomeError, `expected a CampaignOutcomeError, got ${String(error)}`);
    assert.equal(error.safeCode, expectedCode);
    return true;
  });
}

test('campaign outcome command core: migrations are ready', { skip: SKIP }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(pool);
  } finally {
    await pool.end();
  }
});

// ---------------------------------------------------------------------------
// Primitive composability: appendCampaignStatusEventOnClient inside an
// externally-managed transaction, and appendCampaignStatusEvent's preserved
// external contract (genesis + replay), regression-checked here since the
// outcome command core is the primitive's only other caller.
// ---------------------------------------------------------------------------

test('appendCampaignStatusEventOnClient composes atomically with an external transaction: a later failure rolls back its own writes too', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'primitive-rollback');
    const before = await currentVersion(commandPool, fixture.campaignId);

    const client = await commandPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `SELECT current_sequence FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1 FOR UPDATE`,
        [fixture.campaignId]
      );
      const { appendCampaignStatusEventOnClient } = await import('../src/db/campaignEvents.js');
      await appendCampaignStatusEventOnClient(client, {
        campaignId: fixture.campaignId,
        status: 'Analyzing',
        idempotencyKey: key('primitive-rollback-event')
      });
      // Deliberate failure after the append but before COMMIT -- proves the
      // primitive itself never commits or releases the client.
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }

    const after = await currentVersion(commandPool, fixture.campaignId);
    assert.equal(after, before, 'a rolled-back external transaction must leave the aggregate version unchanged');
    const status = await commandPool.query<{ status: string }>(
      'SELECT status FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(status.rows[0].status, 'Created', 'the rolled-back Analyzing transition must not be visible');
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end()]);
  }
});

test('appendCampaignStatusEventOnClient refuses to run without a pre-existing, already-locked stream head', { skip: SKIP }, async () => {
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 1 });
  try {
    const client = await commandPool.connect();
    try {
      await client.query('BEGIN');
      const { appendCampaignStatusEventOnClient } = await import('../src/db/campaignEvents.js');
      await assert.rejects(
        appendCampaignStatusEventOnClient(client, {
          campaignId: randomUUID(),
          status: 'Created',
          idempotencyKey: key('primitive-no-head')
        }),
        /CAMPAIGN_STREAM_HEAD_MISSING/
      );
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  } finally {
    await commandPool.end();
  }
});

// ---------------------------------------------------------------------------
// CO-C-003/CO-C-004/CO-C-028: launch-proof and status eligibility gates.
// ---------------------------------------------------------------------------

test('record succeeds for an active (Created), successfully-launched Campaign -- CO-C-003 is not tied to "still active"', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  const readerPool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 1 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'active-record');
    const version = await currentVersion(commandPool, fixture.campaignId);

    const command = buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version, outcomeCode: 'success_via_leasemind' });
    const result = await executeCampaignOutcomeCommand(writerPool, command);

    assert.equal(result.isReplay, false);
    assert.equal(result.record.outcomeSequence, '1');
    assert.equal(result.record.commandType, 'record');
    assert.equal(result.record.mappedLifecycleStatus, 'Completed');
    assert.equal(result.record.correctsOutcomeRecordId, null);
    assert.equal(result.record.confirmationMethod, 'user_attestation');

    const projection = await writerPool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(projection.rows[0].current_outcome_record_id, result.record.outcomeRecordId);

    const mapping = await writerPool.query(
      'SELECT outcome_record_id FROM leasemind_app.campaign_outcome_idempotency_mapping WHERE idempotency_key = $1',
      [command.idempotencyKey]
    );
    assert.equal(mapping.rows[0].outcome_record_id, result.record.outcomeRecordId);

    const campaignRow = await commandPool.query<{ status: string; aggregate_version: string }>(
      'SELECT status, aggregate_version::text AS aggregate_version FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(campaignRow.rows[0].status, 'Completed');
    assert.equal(campaignRow.rows[0].aggregate_version, versionPlus(version, 1), 'aggregate version must increase by exactly 1');

    const publicView = await readerPool.query(
      'SELECT outcome_code, is_corrected FROM leasemind_app.campaign_outcome_public_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.deepEqual(publicView.rows[0], { outcome_code: 'success_via_leasemind', is_corrected: false });
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end(), readerPool.end()]);
  }
});

for (const outcomeCode of OUTCOME_CODES) {
  test(`record maps ${outcomeCode} to ${OUTCOME_CODE_TO_LIFECYCLE_STATUS[outcomeCode]} (CO-C-005..009)`, { skip: SKIP }, async () => {
    const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
    const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
    const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
    const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
    try {
      const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, `map-${outcomeCode}`);
      const version = await currentVersion(commandPool, fixture.campaignId);
      const result = await executeCampaignOutcomeCommand(
        writerPool,
        buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version, outcomeCode })
      );
      assert.equal(result.record.mappedLifecycleStatus, OUTCOME_CODE_TO_LIFECYCLE_STATUS[outcomeCode]);
      const campaignRow = await commandPool.query<{ status: string }>(
        'SELECT status FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
        [fixture.campaignId]
      );
      assert.equal(campaignRow.rows[0].status, OUTCOME_CODE_TO_LIFECYCLE_STATUS[outcomeCode]);
    } finally {
      await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
    }
  });
}

test('record is rejected for a Paused Campaign, before any write (CO-C-004, the only status-based record rejection)', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'paused-record');
    await appendCampaignStatusEvent(maintenancePool, {
      campaignId: fixture.campaignId,
      status: 'Paused',
      idempotencyKey: key('paused-record-pause')
    });
    const version = await currentVersion(commandPool, fixture.campaignId);
    const before = await outcomeRowCount(writerPool, fixture.campaignId);

    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version })),
      CAMPAIGN_OUTCOME_STATUS_NOT_ELIGIBLE
    );

    const after = await outcomeRowCount(writerPool, fixture.campaignId);
    assert.equal(after, before, 'a rejected record must never write a row');
    const afterVersion = await currentVersion(commandPool, fixture.campaignId);
    assert.equal(afterVersion, version, 'a rejected record must never advance the Campaign version');
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), maintenancePool.end(), writerPool.end()]);
  }
});

test('record explicitly succeeds for a legacy Campaign already in a terminal status reached without ever going through outcome (CO-C-028, no automatic backfill)', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'legacy-terminal');
    await appendCampaignStatusEvent(maintenancePool, {
      campaignId: fixture.campaignId,
      status: 'Completed',
      idempotencyKey: key('legacy-terminal-completed')
    });
    const version = await currentVersion(commandPool, fixture.campaignId);

    const result = await executeCampaignOutcomeCommand(
      writerPool,
      buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version, outcomeCode: 'success_independently' })
    );
    assert.equal(result.isReplay, false);
    assert.equal(result.record.mappedLifecycleStatus, 'Completed');
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), maintenancePool.end(), writerPool.end()]);
  }
});

test('record is rejected for a Campaign that was never launched at all (CO-C-003, both proof sources absent)', { skip: SKIP }, async () => {
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const campaignId = neverLaunchedCampaignId();

    const dryRun = await dryRunCampaignOutcomeCommand(writerPool, buildCommand({ campaignId, expectedCampaignVersion: '1' }));
    assert.equal(dryRun.wouldSucceed, false);
    assert.equal(dryRun.safeErrorCode, CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED);
    assert.equal(dryRun.currentCampaignStatus, null);

    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId, expectedCampaignVersion: '1' })),
      CAMPAIGN_OUTCOME_CAMPAIGN_NOT_LAUNCHED
    );
  } finally {
    await writerPool.end();
  }
});

test('record is rejected as state-inconsistent when only the subject_linked event exists (launch-proof mismatch, mismatch kind 1)', { skip: SKIP }, async () => {
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const campaignId = neverLaunchedCampaignId();
    await insertOrphanSubjectLinkedEvent(maintenancePool, campaignId, key('orphan-event'));

    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId, expectedCampaignVersion: '1' })),
      CAMPAIGN_OUTCOME_STATE_INCONSISTENT
    );
  } finally {
    await Promise.all([maintenancePool.end(), writerPool.end()]);
  }
});

test('record is rejected as state-inconsistent when only the subject_link_projection row exists (launch-proof mismatch, mismatch kind 2)', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const campaignId = neverLaunchedCampaignId();
    await insertOrphanSubjectLinkProjection(taPool, commandPool, campaignId, 'orphan-projection');

    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId, expectedCampaignVersion: '1' })),
      CAMPAIGN_OUTCOME_STATE_INCONSISTENT
    );
  } finally {
    await Promise.all([taPool.end(), commandPool.end(), writerPool.end()]);
  }
});

// ---------------------------------------------------------------------------
// The same two mismatch kinds, but with campaign_stream_head already
// present -- runLockedCommand's `head.rowCount > 0` branch, not the
// `head.rowCount === 0` branch above. Structurally unreachable through any
// real application code path (launchCampaignFromTechnicalAssignment always
// creates the head and both proof sources atomically together), but the
// code re-checks the dual proof unconditionally after finding the head too
// (defense in depth) -- these tests exercise exactly that second check.
// ---------------------------------------------------------------------------

test('record is rejected as state-inconsistent when campaign_stream_head exists but only the subject_linked event does (existing-head mismatch, kind 1)', { skip: SKIP }, async () => {
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const campaignId = neverLaunchedCampaignId();
    await createExistingHeadEventOnlyMismatch(maintenancePool, campaignId, key('existing-head-event-only'));

    const dryRun = await dryRunCampaignOutcomeCommand(writerPool, buildCommand({ campaignId, expectedCampaignVersion: '1' }));
    assert.equal(dryRun.wouldSucceed, false);
    assert.equal(dryRun.safeErrorCode, CAMPAIGN_OUTCOME_STATE_INCONSISTENT);

    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId, expectedCampaignVersion: '1' })),
      CAMPAIGN_OUTCOME_STATE_INCONSISTENT
    );
    assert.equal(await outcomeRowCount(writerPool, campaignId), 0);
  } finally {
    await Promise.all([maintenancePool.end(), writerPool.end()]);
  }
});

test('record is rejected as state-inconsistent when campaign_stream_head exists but only the subject_link_projection row does (existing-head mismatch, kind 2)', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const campaignId = neverLaunchedCampaignId();
    await createExistingHeadProjectionOnlyMismatch(taPool, commandPool, maintenancePool, campaignId, 'existing-head-projection-only');

    const dryRun = await dryRunCampaignOutcomeCommand(writerPool, buildCommand({ campaignId, expectedCampaignVersion: '1' }));
    assert.equal(dryRun.wouldSucceed, false);
    assert.equal(dryRun.safeErrorCode, CAMPAIGN_OUTCOME_STATE_INCONSISTENT);

    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId, expectedCampaignVersion: '1' })),
      CAMPAIGN_OUTCOME_STATE_INCONSISTENT
    );
    assert.equal(await outcomeRowCount(writerPool, campaignId), 0);
  } finally {
    await Promise.all([taPool.end(), commandPool.end(), maintenancePool.end(), writerPool.end()]);
  }
});

// ---------------------------------------------------------------------------
// CO-C-014: optimistic version check.
// ---------------------------------------------------------------------------

test('record is rejected on a stale expected_campaign_version, with zero writes', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'version-conflict');
    const version = await currentVersion(commandPool, fixture.campaignId);
    const before = await outcomeRowCount(writerPool, fixture.campaignId);

    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: versionPlus(version, 5) })),
      CAMPAIGN_OUTCOME_VERSION_CONFLICT
    );

    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), before);
    assert.equal(await currentVersion(commandPool, fixture.campaignId), version);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

// ---------------------------------------------------------------------------
// Lossless expected_campaign_version at the database level, beyond
// Number.MAX_SAFE_INTEGER (9007199254740991). campaign_stream_head.current_sequence
// and campaign_current_state_projection.aggregate_version are both Postgres
// `bigint`, which the driver returns as strings -- this proves the whole
// chain (parse/hash/compare) stays lossless against a real value at that
// magnitude, not only in isolated unit arithmetic.
// ---------------------------------------------------------------------------

/** Directly overwrites the stream head and projection version for an
 * already-launched fixture -- lmapp_maintainer has UPDATE on both tables
 * (migration 003). Used only to reach a magnitude no real event count would
 * organically produce in a test run. */
async function setCampaignVersion(maintenancePool: pg.Pool, campaignId: string, version: string): Promise<void> {
  await maintenancePool.query(
    `UPDATE leasemind_app.campaign_stream_head SET current_sequence = $2, current_event_hash = $3 WHERE campaign_id = $1`,
    [campaignId, version, 'd'.repeat(64)]
  );
  await maintenancePool.query(
    `UPDATE leasemind_app.campaign_current_state_projection SET aggregate_version = $2 WHERE campaign_id = $1`,
    [campaignId, version]
  );
}

test('record succeeds with expected_campaign_version exactly 9007199254740992 (2^53, beyond Number.MAX_SAFE_INTEGER=9007199254740991)', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'huge-version-exact');
    const hugeVersion = '9007199254740992';
    await setCampaignVersion(maintenancePool, fixture.campaignId, hugeVersion);

    const result = await executeCampaignOutcomeCommand(
      writerPool,
      buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: hugeVersion })
    );
    assert.equal(result.isReplay, false);
    assert.equal(result.record.resultingCampaignAggregateVersion, versionPlus(hugeVersion, 1));
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), maintenancePool.end(), writerPool.end()]);
  }
});

test('record is rejected with a one-off different huge expected_campaign_version (9007199254740993 vs actual 9007199254740992) -- no Number precision collapse', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'huge-version-off-by-one');
    await setCampaignVersion(maintenancePool, fixture.campaignId, '9007199254740992');

    // Number('9007199254740992') === Number('9007199254740993') -- if the
    // comparison were ever routed through Number(), this would incorrectly
    // succeed instead of correctly conflicting.
    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: '9007199254740993' })),
      CAMPAIGN_OUTCOME_VERSION_CONFLICT
    );
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 0);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), maintenancePool.end(), writerPool.end()]);
  }
});

// ---------------------------------------------------------------------------
// UUID canonicalization end to end: a differently-cased campaign_id or
// corrects_outcome_record_id must never cause a spurious idempotency
// conflict or a false "stale target" rejection.
// ---------------------------------------------------------------------------

test('replaying the same command with campaign_id in a different case still replays the original record, not a conflict', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'case-replay');
    const version = await currentVersion(commandPool, fixture.campaignId);
    const command = buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version });
    const first = await executeCampaignOutcomeCommand(writerPool, command);
    assert.equal(first.isReplay, false);

    const replay = await executeCampaignOutcomeCommand(writerPool, { ...command, campaignId: command.campaignId.toUpperCase() });
    assert.equal(replay.isReplay, true, 'a differently-cased campaign_id for the same idempotency_key must still replay, not conflict');
    assert.equal(replay.record.outcomeRecordId, first.record.outcomeRecordId);
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 1);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('correcting with corrects_outcome_record_id in a different case than the stored (lowercase) value still succeeds, not a false stale-target rejection', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'case-correct-target');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    const record = await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'success_via_leasemind' }));
    // outcome_record_id as stored/returned by PostgreSQL is always lowercase.
    assert.equal(record.record.outcomeRecordId, record.record.outcomeRecordId.toLowerCase());

    const v2 = await currentVersion(commandPool, fixture.campaignId);
    const correction = await executeCampaignOutcomeCommand(writerPool, buildCommand({
      campaignId: fixture.campaignId,
      expectedCampaignVersion: v2,
      action: 'correct',
      outcomeCode: 'cancelled',
      // Deliberately uppercase -- must still match the lowercase stored value.
      correctsOutcomeRecordId: record.record.outcomeRecordId.toUpperCase(),
      correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
    }));
    assert.equal(correction.isReplay, false);
    assert.equal(correction.record.correctsOutcomeRecordId, record.record.outcomeRecordId);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

// ---------------------------------------------------------------------------
// CO-C-011/CO-C-012/CO-C-027: idempotency fast path, conflict, and durable
// mapping across a later correction.
// ---------------------------------------------------------------------------

test('same idempotency key replays the original record without a new write; a different command under the same key is a conflict', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'replay-conflict');
    const version = await currentVersion(commandPool, fixture.campaignId);
    const command = buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version });

    const first = await executeCampaignOutcomeCommand(writerPool, command);
    assert.equal(first.isReplay, false);

    const replay = await executeCampaignOutcomeCommand(writerPool, command);
    assert.equal(replay.isReplay, true);
    assert.equal(replay.record.outcomeRecordId, first.record.outcomeRecordId);
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 1, 'a replay must never create a second row');

    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, { ...command, outcomeCode: 'cancelled' }),
      CAMPAIGN_OUTCOME_IDEMPOTENCY_CONFLICT
    );
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 1, 'a conflicting reused key must never write');
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('the original idempotency key always replays the original record, even after a later correction supersedes it (CO-C-027)', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'old-key-replay');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    const recordCommand = buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'success_via_leasemind' });
    const recordResult = await executeCampaignOutcomeCommand(writerPool, recordCommand);

    const v2 = await currentVersion(commandPool, fixture.campaignId);
    const correctCommand = buildCommand({
      campaignId: fixture.campaignId,
      expectedCampaignVersion: v2,
      action: 'correct',
      outcomeCode: 'cancelled',
      correctsOutcomeRecordId: recordResult.record.outcomeRecordId,
      correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
    });
    const correctResult = await executeCampaignOutcomeCommand(writerPool, correctCommand);
    assert.notEqual(correctResult.record.outcomeRecordId, recordResult.record.outcomeRecordId);

    // Replay the ORIGINAL key: must still resolve to the original (now
    // superseded but still immutable) record, never the correction.
    const oldReplay = await executeCampaignOutcomeCommand(writerPool, recordCommand);
    assert.equal(oldReplay.isReplay, true);
    assert.equal(oldReplay.record.outcomeRecordId, recordResult.record.outcomeRecordId);
    assert.equal(oldReplay.record.outcomeCode, 'success_via_leasemind');

    // The public view, however, reflects only the current effective outcome.
    const readerPool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 1 });
    try {
      const publicView = await readerPool.query(
        'SELECT outcome_code, is_corrected FROM leasemind_app.campaign_outcome_public_projection WHERE campaign_id = $1',
        [fixture.campaignId]
      );
      assert.deepEqual(publicView.rows[0], { outcome_code: 'cancelled', is_corrected: true });
    } finally {
      await readerPool.end();
    }
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

// ---------------------------------------------------------------------------
// record / correct pairwise state-machine rules.
// ---------------------------------------------------------------------------

test('record is rejected when an effective outcome already exists', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'already-exists');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1 }));

    const v2 = await currentVersion(commandPool, fixture.campaignId);
    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v2, outcomeCode: 'cancelled' })),
      CAMPAIGN_OUTCOME_EFFECTIVE_OUTCOME_ALREADY_EXISTS
    );
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 1);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('correct is rejected as state-inconsistent for a non-terminal Campaign, even with a plausible-looking target', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    // Still 'Created' (non-terminal) -- correct requires a terminal Campaign
    // (Completed/Failed) before it even asks whether an effective outcome
    // exists (see the next test for that distinct case).
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'correct-non-terminal');
    const version = await currentVersion(commandPool, fixture.campaignId);
    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({
        campaignId: fixture.campaignId,
        expectedCampaignVersion: version,
        action: 'correct',
        outcomeCode: 'cancelled',
        correctsOutcomeRecordId: randomUUID(),
        correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
      })),
      CAMPAIGN_OUTCOME_STATE_INCONSISTENT
    );
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('correct is rejected when no effective outcome exists yet, even for an already-terminal Campaign', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    // A legacy-terminal Campaign (Completed via a direct status event, never
    // through outcome record) has no effective outcome to correct.
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'no-effective');
    await appendCampaignStatusEvent(maintenancePool, {
      campaignId: fixture.campaignId,
      status: 'Completed',
      idempotencyKey: key('no-effective-completed')
    });
    const version = await currentVersion(commandPool, fixture.campaignId);
    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({
        campaignId: fixture.campaignId,
        expectedCampaignVersion: version,
        action: 'correct',
        outcomeCode: 'cancelled',
        correctsOutcomeRecordId: randomUUID(),
        correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
      })),
      CAMPAIGN_OUTCOME_NO_EFFECTIVE_OUTCOME
    );
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), maintenancePool.end(), writerPool.end()]);
  }
});

test('correct is rejected when it targets a superseded (stale) record instead of the current effective outcome (CO-C-026)', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'stale-target');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    const record = await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'success_via_leasemind' }));

    const v2 = await currentVersion(commandPool, fixture.campaignId);
    await executeCampaignOutcomeCommand(writerPool, buildCommand({
      campaignId: fixture.campaignId,
      expectedCampaignVersion: v2,
      action: 'correct',
      outcomeCode: 'cancelled',
      correctsOutcomeRecordId: record.record.outcomeRecordId,
      correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
    }));

    const v3 = await currentVersion(commandPool, fixture.campaignId);
    const before = await outcomeRowCount(writerPool, fixture.campaignId);
    // Targets the now-superseded original record, not the current one.
    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({
        campaignId: fixture.campaignId,
        expectedCampaignVersion: v3,
        action: 'correct',
        outcomeCode: 'expired',
        correctsOutcomeRecordId: record.record.outcomeRecordId,
        correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
      })),
      CAMPAIGN_OUTCOME_CORRECTION_TARGET_STALE
    );
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), before);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('correct is rejected when the new outcome_code equals the current one, before any write (CO-C-030)', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'same-code');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    const record = await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'success_via_leasemind' }));

    const v2 = await currentVersion(commandPool, fixture.campaignId);
    const before = await outcomeRowCount(writerPool, fixture.campaignId);
    await assertRejects(
      executeCampaignOutcomeCommand(writerPool, buildCommand({
        campaignId: fixture.campaignId,
        expectedCampaignVersion: v2,
        action: 'correct',
        outcomeCode: 'success_via_leasemind',
        correctsOutcomeRecordId: record.record.outcomeRecordId,
        correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
      })),
      CAMPAIGN_OUTCOME_SAME_CODE_REJECTED
    );
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), before);
    assert.equal(await currentVersion(commandPool, fixture.campaignId), v2, 'Campaign version must not change on a rejected same-code correction');
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('correct on the current target succeeds, repoints the current projection, and flips the mapped lifecycle status', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'correct-flip');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    const record = await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'success_via_leasemind' }));
    assert.equal(record.record.mappedLifecycleStatus, 'Completed');

    const v2 = await currentVersion(commandPool, fixture.campaignId);
    const correction = await executeCampaignOutcomeCommand(writerPool, buildCommand({
      campaignId: fixture.campaignId,
      expectedCampaignVersion: v2,
      action: 'correct',
      outcomeCode: 'cancelled',
      correctsOutcomeRecordId: record.record.outcomeRecordId,
      correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
    }));
    assert.equal(correction.record.mappedLifecycleStatus, 'Failed');
    assert.equal(correction.record.outcomeSequence, '2');

    const pointer = await writerPool.query(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(pointer.rows[0].current_outcome_record_id, correction.record.outcomeRecordId);

    const v3 = await currentVersion(commandPool, fixture.campaignId);
    assert.equal(v3, versionPlus(v2, 1), 'aggregate version must increase by exactly 1 for the correction too');
    const campaignRow = await commandPool.query<{ status: string }>(
      'SELECT status FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(campaignRow.rows[0].status, 'Failed');
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('a correction that keeps the same mapped lifecycle status still creates a new status event and advances the version', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'same-status-event');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    const record = await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'success_via_leasemind' }));

    const v2 = await currentVersion(commandPool, fixture.campaignId);
    // success_via_leasemind -> success_independently: both map to
    // 'Completed'. The task requires a new status event even so.
    const correction = await executeCampaignOutcomeCommand(writerPool, buildCommand({
      campaignId: fixture.campaignId,
      expectedCampaignVersion: v2,
      action: 'correct',
      outcomeCode: 'success_independently',
      correctsOutcomeRecordId: record.record.outcomeRecordId,
      correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
    }));
    assert.equal(correction.record.mappedLifecycleStatus, 'Completed');

    const v3 = await currentVersion(commandPool, fixture.campaignId);
    assert.equal(v3, versionPlus(v2, 1), 'a same-lifecycle-status correction must still advance the Campaign version by exactly 1');

    const statusEvent = await commandPool.query<{ payload: { status: string }; idempotency_key: string; previous_event_hash: string; event_hash: string }>(
      `SELECT payload, idempotency_key, previous_event_hash, event_hash FROM leasemind_app.campaign_event_log
        WHERE campaign_id = $1 AND event_sequence = $2`,
      [fixture.campaignId, String(v3)]
    );
    assert.equal(statusEvent.rows[0].payload.status, 'Completed');
    assert.equal(statusEvent.rows[0].idempotency_key, `campaign-outcome:${correction.record.outcomeRecordId}:status`);

    const previousEvent = await commandPool.query<{ event_hash: string }>(
      `SELECT event_hash FROM leasemind_app.campaign_event_log WHERE campaign_id = $1 AND event_sequence = $2`,
      [fixture.campaignId, String(v2)]
    );
    assert.equal(statusEvent.rows[0].previous_event_hash, previousEvent.rows[0].event_hash, 'hash chain must be unbroken across the outcome-triggered status event');
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

// ---------------------------------------------------------------------------
// Real concurrency: same-key convergence and different-key serialization,
// both proving no deadlock.
// ---------------------------------------------------------------------------

test('concurrent execute calls with the identical idempotency key converge to exactly one row (no deadlock)', { skip: SKIP, timeout: 30_000 }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 5 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'parallel-same-key');
    const version = await currentVersion(commandPool, fixture.campaignId);
    const command = buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version });

    const [a, b] = await Promise.all([
      executeCampaignOutcomeCommand(writerPool, command),
      executeCampaignOutcomeCommand(writerPool, command)
    ]);

    assert.equal(a.record.outcomeRecordId, b.record.outcomeRecordId);
    assert.deepEqual([a.isReplay, b.isReplay].sort(), [false, true], 'exactly one call must have created the row, the other must have replayed it');
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 1);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('concurrent execute calls with different idempotency keys for the same Campaign serialize through the stream-head lock: exactly one wins, the loser sees a version conflict, no deadlock (CO-C-013)', { skip: SKIP, timeout: 30_000 }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 5 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'parallel-diff-key');
    const version = await currentVersion(commandPool, fixture.campaignId);
    const commandA = buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version, outcomeCode: 'success_via_leasemind' });
    const commandB = buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version, outcomeCode: 'cancelled' });

    const results = await Promise.allSettled([
      executeCampaignOutcomeCommand(writerPool, commandA),
      executeCampaignOutcomeCommand(writerPool, commandB)
    ]);

    const fulfilled = results.filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof executeCampaignOutcomeCommand>>> => r.status === 'fulfilled');
    const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    assert.equal(fulfilled.length, 1, 'exactly one concurrent record must win the race');
    assert.equal(rejected.length, 1, 'exactly one concurrent record must lose the race');
    assert.ok(rejected[0].reason instanceof CampaignOutcomeError);
    // The loser observed the same pre-race expected_campaign_version, which
    // is now stale because the winner already advanced it -- a genuine
    // optimistic-concurrency conflict, not a business-rule rejection.
    assert.equal((rejected[0].reason as CampaignOutcomeError).safeCode, CAMPAIGN_OUTCOME_VERSION_CONFLICT);
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 1);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

// ---------------------------------------------------------------------------
// Fault-injection/rollback probes at critical stages of the full outcome
// transaction. Test-only, never anything inside campaignOutcomes.ts itself.
//
// executeCampaignOutcomeCommand uses the pool two ways: `pool.query(...)`
// directly for the unlocked fast-path idempotency read, and
// `pool.connect()` once for the lock-holding client that runs the whole
// write transaction. Mutating the real pool's own `.connect` in place (an
// earlier version of this helper did that) is unsafe: node-postgres may
// hand the SAME underlying client object back on a later `.connect()` or
// reuse it inside `pool.query()`'s own internal connect/release cycle, so a
// client that was ever wrapped and not perfectly un-wrapped can be handed
// out again already wrapped -- observed as the whole test hanging past its
// timeout with the connection stuck.
//
// Instead this builds a throwaway proxy object with its own `.connect` and
// forwards `.query` straight to the real pool (bypassing any wrapping), so
// the fast-path read never touches a patched client at all. Every
// `.connect()` call wraps a freshly-obtained client's `.query` from
// scratch -- never a previously-wrapped one, since the real pool itself is
// never mutated and nothing is reused across calls. The wrapped query
// throws exactly once, for the first query whose SQL text matches
// faultOnSqlPattern, immediately restoring the client's true original query
// method before rejecting, so the same connection's later real ROLLBACK,
// advisory unlock and release all run unpatched and the connection returns
// to the real pool exactly as clean as if this helper had never run.
// ---------------------------------------------------------------------------

function withFaultInjection(pool: pg.Pool, faultOnSqlPattern: RegExp, faultMessage: string): pg.Pool {
  return {
    connect: async () => {
      const client = await pool.connect();
      const originalQuery = client.query.bind(client);
      const originalRelease = client.release.bind(client);
      const restore = (): void => {
        (client as unknown as { query: typeof originalQuery }).query = originalQuery;
        (client as unknown as { release: typeof originalRelease }).release = originalRelease;
      };
      (client as unknown as { query: (...args: unknown[]) => unknown }).query = (...args: unknown[]) => {
        const first = args[0] as string | { text?: string } | undefined;
        const text = typeof first === 'string' ? first : first?.text;
        if (text && faultOnSqlPattern.test(text)) {
          restore();
          return Promise.reject(new Error(faultMessage));
        }
        return (originalQuery as (...a: unknown[]) => unknown)(...args);
      };
      // Restore query AND release before ever handing the connection back to
      // the real pool -- if the fault pattern never matched (e.g. the
      // caller's transaction failed for an unrelated reason, or completed
      // without reaching the fault site), the client must not be returned
      // to the pool with a patched query still attached, or a later
      // pool.connect()/pool.query() could reuse an already-wrapped client.
      (client as unknown as { release: (...args: unknown[]) => unknown }).release = (...args: unknown[]) => {
        restore();
        return (originalRelease as (...a: unknown[]) => unknown)(...args);
      };
      return client;
    },
    query: pool.query.bind(pool),
    end: pool.end.bind(pool)
  } as unknown as pg.Pool;
}

test('fault injection: record fails after the lifecycle status event is appended but before the outcome log row is inserted -- zero partial state, retry succeeds', { skip: SKIP, timeout: 20_000 }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'fault-after-status-event');
    const version = await currentVersion(commandPool, fixture.campaignId);
    const command = buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version });

    await assert.rejects(
      executeCampaignOutcomeCommand(
        withFaultInjection(writerPool, /INSERT INTO leasemind_app\.campaign_outcome_event_log/, 'INJECTED_TEST_FAULT_AFTER_STATUS_EVENT'),
        command
      ),
      (error: unknown) => {
        assert.ok(error instanceof CampaignOutcomeError, `expected a CampaignOutcomeError, got ${String(error)}`);
        assert.equal(error.safeCode, CAMPAIGN_OUTCOME_OPERATION_FAILED);
        assert.doesNotMatch(error.message, /INJECTED_TEST_FAULT/, 'the injected raw message must never surface');
        return true;
      }
    );

    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 0, 'no outcome log row must survive');
    const mapping = await writerPool.query(
      'SELECT 1 FROM leasemind_app.campaign_outcome_idempotency_mapping WHERE idempotency_key = $1',
      [command.idempotencyKey]
    );
    assert.equal(mapping.rowCount, 0, 'no idempotency mapping must survive');
    const projection = await writerPool.query(
      'SELECT 1 FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(projection.rowCount, 0, 'no current outcome projection must survive');
    assert.equal(await currentVersion(commandPool, fixture.campaignId), version, 'Campaign version must be unchanged');
    const campaignRow = await commandPool.query<{ status: string }>(
      'SELECT status FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(campaignRow.rows[0].status, 'Created', 'lifecycle status must be unchanged');
    const eventCount = await commandPool.query<{ count: string }>(
      'SELECT count(*)::text AS count FROM leasemind_app.campaign_event_log WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(eventCount.rows[0].count, '2', 'only the original subject_linked + Created events remain -- the rolled-back status event never persists');

    // Retry without the fault succeeds normally.
    const retry = await executeCampaignOutcomeCommand(writerPool, command);
    assert.equal(retry.isReplay, false);
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 1);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('fault injection: record fails after the outcome log row is inserted but before the idempotency mapping is inserted -- zero partial state, retry succeeds', { skip: SKIP, timeout: 20_000 }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'fault-after-outcome-log');
    const version = await currentVersion(commandPool, fixture.campaignId);
    const command = buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version });

    await assert.rejects(
      executeCampaignOutcomeCommand(
        withFaultInjection(writerPool, /INSERT INTO leasemind_app\.campaign_outcome_idempotency_mapping/, 'INJECTED_TEST_FAULT_AFTER_OUTCOME_LOG'),
        command
      ),
      (error: unknown) => {
        assert.ok(error instanceof CampaignOutcomeError, `expected a CampaignOutcomeError, got ${String(error)}`);
        assert.equal(error.safeCode, CAMPAIGN_OUTCOME_OPERATION_FAILED);
        assert.doesNotMatch(error.message, /INJECTED_TEST_FAULT/, 'the injected raw message must never surface');
        return true;
      }
    );

    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 0, 'the outcome log INSERT itself must not survive, despite having "succeeded" mid-transaction');
    const mapping = await writerPool.query(
      'SELECT 1 FROM leasemind_app.campaign_outcome_idempotency_mapping WHERE idempotency_key = $1',
      [command.idempotencyKey]
    );
    assert.equal(mapping.rowCount, 0);
    const projection = await writerPool.query(
      'SELECT 1 FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(projection.rowCount, 0);
    assert.equal(await currentVersion(commandPool, fixture.campaignId), version, 'Campaign version must be unchanged');

    // Retry without the fault succeeds normally.
    const retry = await executeCampaignOutcomeCommand(writerPool, command);
    assert.equal(retry.isReplay, false);
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 1);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('fault injection: correct fails on the final current-projection repoint, after the correction row and mapping were already written -- the effective outcome stays the original record, retry succeeds', { skip: SKIP, timeout: 20_000 }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'fault-correction-repoint');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    const record = await executeCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'success_via_leasemind' }));

    const v2 = await currentVersion(commandPool, fixture.campaignId);
    const correctCommand = buildCommand({
      campaignId: fixture.campaignId,
      expectedCampaignVersion: v2,
      action: 'correct',
      outcomeCode: 'cancelled',
      correctsOutcomeRecordId: record.record.outcomeRecordId,
      correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
    });

    await assert.rejects(
      executeCampaignOutcomeCommand(
        withFaultInjection(writerPool, /UPDATE leasemind_app\.campaign_outcome_current_projection/, 'INJECTED_TEST_FAULT_ON_CORRECTION_REPOINT'),
        correctCommand
      ),
      (error: unknown) => {
        assert.ok(error instanceof CampaignOutcomeError, `expected a CampaignOutcomeError, got ${String(error)}`);
        assert.equal(error.safeCode, CAMPAIGN_OUTCOME_OPERATION_FAILED);
        assert.doesNotMatch(error.message, /INJECTED_TEST_FAULT/, 'the injected raw message must never surface');
        return true;
      }
    );

    // The correction's own row/mapping must not survive either -- one
    // atomic transaction, not two independent writes.
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), 1, 'only the original record row must remain');
    const mapping = await writerPool.query(
      'SELECT 1 FROM leasemind_app.campaign_outcome_idempotency_mapping WHERE idempotency_key = $1',
      [correctCommand.idempotencyKey]
    );
    assert.equal(mapping.rowCount, 0, 'the correction\'s idempotency mapping must not survive');
    const pointer = await writerPool.query<{ current_outcome_record_id: string }>(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(pointer.rows[0].current_outcome_record_id, record.record.outcomeRecordId, 'the effective outcome must still be the original record, never repointed');
    assert.equal(await currentVersion(commandPool, fixture.campaignId), v2, 'Campaign version must be unchanged by the failed correction');

    // Retry without the fault succeeds normally.
    const retry = await executeCampaignOutcomeCommand(writerPool, correctCommand);
    assert.equal(retry.isReplay, false);
    assert.equal(retry.record.mappedLifecycleStatus, 'Failed');
    const pointerAfterRetry = await writerPool.query<{ current_outcome_record_id: string }>(
      'SELECT current_outcome_record_id FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1',
      [fixture.campaignId]
    );
    assert.equal(pointerAfterRetry.rows[0].current_outcome_record_id, retry.record.outcomeRecordId);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

// ---------------------------------------------------------------------------
// Dry-run: provable read-only, zero mutation, and never a promise of a
// subsequent execute's outcome.
// ---------------------------------------------------------------------------

async function withQuerySpy<T>(pool: pg.Pool, fn: () => Promise<T>): Promise<{ result: T; queries: string[] }> {
  const queries: string[] = [];
  const originalConnect = pool.connect.bind(pool);
  // Narrow, test-only monkeypatch of the zero-argument promise form, which
  // is the only overload campaignOutcomes.ts ever calls.
  (pool as unknown as { connect: () => Promise<pg.PoolClient> }).connect = async () => {
    const client = await originalConnect();
    const originalQuery = client.query.bind(client);
    (client as unknown as { query: (...args: unknown[]) => unknown }).query = (...args: unknown[]) => {
      const first = args[0] as string | { text?: string } | undefined;
      const text = typeof first === 'string' ? first : first?.text;
      if (text) queries.push(text);
      return (originalQuery as (...a: unknown[]) => unknown)(...args);
    };
    return client;
  };
  try {
    const result = await fn();
    return { result, queries };
  } finally {
    pool.connect = originalConnect;
  }
}

test('dry-run issues no locking or write SQL at all: no FOR UPDATE/FOR SHARE, no advisory lock, no INSERT/UPDATE/DELETE/TRUNCATE, exactly one BEGIN READ ONLY and one ROLLBACK, zero COMMIT', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'dry-run-sql-proof');
    const version = await currentVersion(commandPool, fixture.campaignId);
    const command = buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version, execute: false });

    const { result, queries } = await withQuerySpy(writerPool, () => dryRunCampaignOutcomeCommand(writerPool, command));

    assert.equal(result.wouldSucceed, true);
    assert.ok(queries.length > 0);
    for (const sql of queries) {
      assert.doesNotMatch(sql, /for\s+update/i, sql);
      assert.doesNotMatch(sql, /for\s+share/i, sql);
      assert.doesNotMatch(sql, /pg_advisory/i, sql);
      assert.doesNotMatch(sql, /^\s*insert/i, sql);
      assert.doesNotMatch(sql, /^\s*update/i, sql);
      assert.doesNotMatch(sql, /^\s*delete/i, sql);
      assert.doesNotMatch(sql, /^\s*truncate/i, sql);
    }
    const beginReadOnly = queries.filter(q => /begin transaction read only/i.test(q));
    const rollbacks = queries.filter(q => /^\s*rollback\s*$/i.test(q));
    const commits = queries.filter(q => /^\s*commit\s*$/i.test(q));
    assert.equal(beginReadOnly.length, 1);
    assert.equal(rollbacks.length, 1);
    assert.equal(commits.length, 0);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('dry-run never mutates state, regardless of outcome', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'dry-run-no-mutate');
    const version = await currentVersion(commandPool, fixture.campaignId);
    const before = await outcomeRowCount(writerPool, fixture.campaignId);

    // A dry-run that WOULD succeed.
    await dryRunCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version, execute: false }));
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), before);
    assert.equal(await currentVersion(commandPool, fixture.campaignId), version);

    // A dry-run that would NOT succeed (stale version).
    const rejectedDryRun = await dryRunCampaignOutcomeCommand(writerPool, buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: versionPlus(version, 99), execute: false }));
    assert.equal(rejectedDryRun.wouldSucceed, false);
    assert.equal(rejectedDryRun.safeErrorCode, CAMPAIGN_OUTCOME_VERSION_CONFLICT);
    assert.equal(await outcomeRowCount(writerPool, fixture.campaignId), before);
    assert.equal(await currentVersion(commandPool, fixture.campaignId), version);
  } finally {
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

// ---------------------------------------------------------------------------
// Read model: GET /api/v1/campaigns/{campaignId} outcome_context
// (ADR-0010 §10, CAMPAIGN_OUTCOMES.md §11, CO-C-010/CO-C-022/CO-C-029).
// HTTP-level, against the real lmapp_api_reader connection (API_DATABASE_URL)
// and the safe leasemind_app.campaign_outcome_public_projection view.
// Exercised here rather than in openapiContract.test.ts/campaigns.test.ts
// because every fixture below permanently writes immutable outcome
// history -- same discipline as the rest of this file (see file header) --
// which must never contaminate the repository's shared, teardown-to-empty
// DB regression lifecycle.
// ---------------------------------------------------------------------------

test('GET /api/v1/campaigns/{campaignId}: outcome_context is null for a launched Campaign with no effective outcome yet', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const readerPool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 1 });
  const app = buildApp({ pool: readerPool, logger: false });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'read-model-null');
    const response = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${fixture.campaignId}` });
    assert.equal(response.statusCode, 200);
    const body = response.json();
    assert.equal(body.outcome_context, null);
    // status and outcome_context are read and asserted separately -- the
    // second assertion is not derived from the first.
    assert.equal(body.status, 'Created');
  } finally {
    await app.close();
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end()]);
  }
});

test('GET /api/v1/campaigns/{campaignId}: outcome_context returns exactly the four safe fields after a record, independent of lifecycle status', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  const readerPool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 1 });
  const app = buildApp({ pool: readerPool, logger: false });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'read-model-record');
    const version = await currentVersion(commandPool, fixture.campaignId);
    await executeCampaignOutcomeCommand(
      writerPool,
      buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: version, outcomeCode: 'success_via_leasemind' })
    );

    const response = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${fixture.campaignId}` });
    assert.equal(response.statusCode, 200);
    const body = response.json();

    assert.deepEqual(Object.keys(body.outcome_context).sort(), ['confirmation_method', 'is_corrected', 'outcome_code', 'recorded_at']);
    assert.equal(body.outcome_context.outcome_code, 'success_via_leasemind');
    assert.equal(body.outcome_context.confirmation_method, 'user_attestation');
    assert.equal(body.outcome_context.is_corrected, false);
    assert.match(body.outcome_context.recorded_at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

    // Lifecycle status (CO-C-005: success_via_leasemind -> Completed) is
    // checked as an entirely separate field -- the client (and this
    // assertion) must not derive one from the other (CO-C-010).
    assert.equal(body.status, 'Completed');

    // Raw operator/audit fields never appear anywhere in the response.
    const raw = JSON.stringify(body);
    for (const forbidden of ['operator_ref', 'correction_reason_code', 'outcome_record_id', 'outcome_sequence', 'mapped_lifecycle_status']) {
      assert.equal(raw.includes(forbidden), false, `response must never include ${forbidden}`);
    }
  } finally {
    await app.close();
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});

test('GET /api/v1/campaigns/{campaignId}: a correction is reflected on the very next read, is_corrected becomes true, and lifecycle status flips independently (CO-C-022, CO-C-029)', { skip: SKIP }, async () => {
  const taPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const analysisPool = new pg.Pool({ connectionString: ANALYSIS_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const writerPool = new pg.Pool({ connectionString: CAMPAIGN_OUTCOME_DATABASE_URL, max: 2 });
  const readerPool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 1 });
  const app = buildApp({ pool: readerPool, logger: false });
  try {
    const fixture = await createLaunchedFixture(taPool, analysisPool, commandPool, 'read-model-correct');
    const v1 = await currentVersion(commandPool, fixture.campaignId);
    const record = await executeCampaignOutcomeCommand(
      writerPool,
      buildCommand({ campaignId: fixture.campaignId, expectedCampaignVersion: v1, outcomeCode: 'success_via_leasemind' })
    );

    // Read #1: current server state before any correction -- a fresh HTTP
    // read, not a cached client value (CO-C-022).
    const firstRead = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${fixture.campaignId}` });
    assert.equal(firstRead.statusCode, 200);
    const firstBody = firstRead.json();
    assert.equal(firstBody.outcome_context.outcome_code, 'success_via_leasemind');
    assert.equal(firstBody.outcome_context.is_corrected, false);
    assert.equal(firstBody.status, 'Completed');

    const v2 = await currentVersion(commandPool, fixture.campaignId);
    await executeCampaignOutcomeCommand(writerPool, buildCommand({
      campaignId: fixture.campaignId,
      expectedCampaignVersion: v2,
      action: 'correct',
      outcomeCode: 'cancelled',
      correctsOutcomeRecordId: record.record.outcomeRecordId,
      correctionReasonCode: 'OUTCOME_CLASSIFICATION_CORRECTED'
    }));

    // Read #2: the server, not the client, is the source of truth --
    // re-reading the same URL now returns the corrected state, proving the
    // detail endpoint never serves a stale/cached snapshot (CO-C-022).
    const secondRead = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${fixture.campaignId}` });
    assert.equal(secondRead.statusCode, 200);
    const secondBody = secondRead.json();
    assert.equal(secondBody.outcome_context.outcome_code, 'cancelled');
    assert.equal(secondBody.outcome_context.is_corrected, true, 'CO-C-029: is_corrected must be true, with no reason code or record id exposed');
    assert.equal(secondBody.outcome_context.confirmation_method, 'user_attestation');
    assert.deepEqual(Object.keys(secondBody.outcome_context).sort(), ['confirmation_method', 'is_corrected', 'outcome_code', 'recorded_at']);
    // Lifecycle status flips Completed -> Failed atomically with the
    // correction (CO-C-024) -- read and asserted as its own field.
    assert.equal(secondBody.status, 'Failed');
    // Both timestamps come from the same wall clock and correction happens
    // strictly after the original record -- but PostgreSQL's internal
    // clock_timestamp() precision exceeds the millisecond precision the API
    // serializes to ISO 8601, so two genuinely distinct, correctly-ordered
    // transactions can legitimately round to the same millisecond.
    // notEqual on the raw strings would be flaky; the real invariant is
    // ordering, not distinctness.
    const firstRecordedAt = new Date(firstBody.outcome_context.recorded_at);
    const secondRecordedAt = new Date(secondBody.outcome_context.recorded_at);
    assert.equal(Number.isNaN(firstRecordedAt.getTime()), false, 'firstBody.outcome_context.recorded_at must parse as a date');
    assert.equal(Number.isNaN(secondRecordedAt.getTime()), false, 'secondBody.outcome_context.recorded_at must parse as a date');
    assert.ok(
      secondRecordedAt.getTime() >= firstRecordedAt.getTime(),
      'the correction must never be recorded before the original record'
    );

    const raw = JSON.stringify(secondBody);
    for (const forbidden of ['operator_ref', 'correction_reason_code', 'OUTCOME_CLASSIFICATION_CORRECTED', record.record.outcomeRecordId]) {
      assert.equal(raw.includes(forbidden), false, `response must never include ${forbidden}`);
    }
  } finally {
    await app.close();
    await Promise.all([taPool.end(), analysisPool.end(), commandPool.end(), writerPool.end()]);
  }
});
