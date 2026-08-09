import { createHash, randomUUID } from 'node:crypto';
import type pg from 'pg';
import { CAMPAIGN_EVENT_TYPE, CAMPAIGN_EVENT_SCHEMA_VERSION, GENESIS_EVENT_HASH, computeEventHash } from './campaignEvents.js';
import { deriveCampaignIdFromIdempotencyKey } from './createCampaign.js';
import { isValidContactsGateEvidence } from './contactsGate.js';
import type { Scenario } from './technicalAssignment.js';

// Atomic Campaign launch from a ready Technical Assignment. See
// 03_ARCHITECTURE/decisions/ADR-0008-technical-assignment-implementation.md
// section 1. Runs on the lmapp_campaign_writer pool, which has SELECT
// (read-only) on property/tenant_request in addition to its existing
// event_log/stream_head/projection grants (migration 005) -- enough to
// verify Technical Assignment state and perform the whole launch as one
// transaction, without switching database roles mid-transaction.

export const SUBJECT_LINKED_EVENT_TYPE = 'campaign.subject_linked.v1' as const;
const SUBJECT_LINKED_SCHEMA_VERSION = 1 as const;
const DOMAIN_SEPARATOR = 'LEASEMIND_CAMPAIGN_LAUNCH_V1';

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function computeLaunchCommandHash(campaignId: string, technicalAssignmentId: string, expectedRevision: number): string {
  return sha256Hex(`${DOMAIN_SEPARATOR}|COMMAND|${campaignId}|${technicalAssignmentId}|${expectedRevision}`);
}

export class TechnicalAssignmentNotFoundError extends Error {
  constructor() {
    super('TECHNICAL_ASSIGNMENT_STATE_INVALID');
    this.name = 'TechnicalAssignmentNotFoundError';
  }
}

export class TechnicalAssignmentAnalysisRequiredError extends Error {
  constructor() {
    super('TECHNICAL_ASSIGNMENT_ANALYSIS_REQUIRED');
    this.name = 'TechnicalAssignmentAnalysisRequiredError';
  }
}

export class TechnicalAssignmentAnalysisStaleError extends Error {
  constructor() {
    super('TECHNICAL_ASSIGNMENT_ANALYSIS_STALE');
    this.name = 'TechnicalAssignmentAnalysisStaleError';
  }
}

export class ContactsGateRequiredError extends Error {
  constructor() {
    super('TECHNICAL_ASSIGNMENT_CONTACTS_GATE_REQUIRED');
    this.name = 'ContactsGateRequiredError';
  }
}

export class LaunchIdempotencyConflictError extends Error {
  constructor() {
    super('TECHNICAL_ASSIGNMENT_REVISION_CONFLICT');
    this.name = 'LaunchIdempotencyConflictError';
  }
}

export interface LaunchCampaignInput {
  idempotencyKey: string;
  technicalAssignmentId: string;
  expectedRevision: number;
  contactsGateEvidence: unknown;
}

export interface LaunchCampaignResult {
  campaign_id: string;
  status: 'Created';
  aggregate_version: string;
  created_at: string;
  updated_at: string;
  isReplay: boolean;
}

interface TaRow {
  id: string;
  scenario: Scenario;
  lifecycle_status: string;
  revision: number;
}

async function lockTechnicalAssignment(client: pg.PoolClient, technicalAssignmentId: string): Promise<TaRow | null> {
  const property = await client.query<{ property_id: string; lifecycle_status: string; revision: number }>(
    'SELECT property_id, lifecycle_status, revision FROM leasemind_app.property WHERE property_id = $1 FOR UPDATE',
    [technicalAssignmentId]
  );
  if (property.rowCount && property.rowCount > 0) {
    const row = property.rows[0];
    return { id: row.property_id, scenario: 'need_tenant', lifecycle_status: row.lifecycle_status, revision: row.revision };
  }
  const tenantRequest = await client.query<{ tenant_request_id: string; lifecycle_status: string; revision: number }>(
    'SELECT tenant_request_id, lifecycle_status, revision FROM leasemind_app.tenant_request WHERE tenant_request_id = $1 FOR UPDATE',
    [technicalAssignmentId]
  );
  if (tenantRequest.rowCount && tenantRequest.rowCount > 0) {
    const row = tenantRequest.rows[0];
    return { id: row.tenant_request_id, scenario: 'need_property', lifecycle_status: row.lifecycle_status, revision: row.revision };
  }
  return null;
}

/**
 * One atomic transaction: lock + verify the Technical Assignment
 * (lifecycle_status=ready_for_analysis, revision matches what the caller
 * last saw, Contacts Gate evidence present), append the provenance event
 * (campaign.subject_linked.v1, sequence N) followed by the status event
 * (campaign.status_recorded.v1 status=Created, sequence N+1 -- kept last
 * so tests/db/campaignEvents.ts's rebuildCampaignProjection, which reads
 * the latest event by sequence and expects payload.status, needs no
 * change), update the projection, and mark the Technical Assignment
 * campaign_started. Any failure rolls back every one of these writes.
 */
export async function launchCampaignFromTechnicalAssignment(pool: pg.Pool, input: LaunchCampaignInput): Promise<LaunchCampaignResult> {
  const campaignId = deriveCampaignIdFromIdempotencyKey(input.idempotencyKey);
  const commandHash = computeLaunchCommandHash(campaignId, input.technicalAssignmentId, input.expectedRevision);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existingEvent = await client.query<{ command_hash: string; occurred_at: Date }>(
      `SELECT command_hash, occurred_at FROM leasemind_app.campaign_event_log
        WHERE campaign_id = $1 AND idempotency_key = $2 AND event_type = $3`,
      [campaignId, input.idempotencyKey, CAMPAIGN_EVENT_TYPE]
    );
    if (existingEvent.rowCount && existingEvent.rowCount > 0) {
      if (existingEvent.rows[0].command_hash !== commandHash) {
        await client.query('ROLLBACK');
        throw new LaunchIdempotencyConflictError();
      }
      const projection = await client.query<{ aggregate_version: string; created_at: Date; updated_at: Date }>(
        `SELECT aggregate_version::text AS aggregate_version, created_at, updated_at
           FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1`,
        [campaignId]
      );
      await client.query('COMMIT');
      const row = projection.rows[0];
      return {
        campaign_id: campaignId,
        status: 'Created',
        aggregate_version: row.aggregate_version,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString(),
        isReplay: true
      };
    }

    if (!isValidContactsGateEvidence(input.contactsGateEvidence)) {
      await client.query('ROLLBACK');
      throw new ContactsGateRequiredError();
    }

    const ta = await lockTechnicalAssignment(client, input.technicalAssignmentId);
    if (!ta) {
      await client.query('ROLLBACK');
      throw new TechnicalAssignmentNotFoundError();
    }
    if (ta.lifecycle_status !== 'ready_for_analysis') {
      await client.query('ROLLBACK');
      throw new TechnicalAssignmentAnalysisRequiredError();
    }
    if (ta.revision !== input.expectedRevision) {
      await client.query('ROLLBACK');
      throw new TechnicalAssignmentAnalysisStaleError();
    }

    await client.query(
      `INSERT INTO leasemind_app.campaign_stream_head (campaign_id, current_sequence, current_event_hash)
       VALUES ($1, 0, $2)
       ON CONFLICT (campaign_id) DO NOTHING`,
      [campaignId, GENESIS_EVENT_HASH]
    );
    const head = await client.query<{ current_sequence: string; current_event_hash: string }>(
      `SELECT current_sequence, current_event_hash FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1 FOR UPDATE`,
      [campaignId]
    );
    let currentSequence = BigInt(head.rows[0].current_sequence);
    let previousEventHash = head.rows[0].current_event_hash;

    const timeResult = await client.query<{ now: Date }>('SELECT clock_timestamp() AS now');
    const occurredAt = timeResult.rows[0].now;
    const occurredAtIso = occurredAt.toISOString();

    // Event 1 (sequence N): provenance link, doc 9.1.4 / 10. Uses a distinct
    // derived idempotency_key value from the status event below: the
    // pre-existing UNIQUE (campaign_id, idempotency_key) constraint
    // (002_campaign_event_log.up.sql) allows only one row per pair, and
    // both events in this transaction share one campaign_id -- verified
    // empirically. The replay lookup above matches on
    // (campaign_id, idempotency_key, event_type = CAMPAIGN_EVENT_TYPE), so
    // this derived key is never used for replay detection.
    const entityType = ta.scenario === 'need_tenant' ? 'Property' : 'TenantRequest';
    const linkIdempotencyKey = `${input.idempotencyKey}:subject_linked`;
    const linkSequence = (currentSequence + 1n).toString();
    const linkEventId = randomUUID();
    const linkPayload = {
      entity_type: entityType,
      entity_id: ta.id,
      source_technical_assignment_id: input.technicalAssignmentId,
      source_schema_version: '1.0',
      source_revision: input.expectedRevision
    };
    const linkEventHash = computeEventHash({
      eventId: linkEventId,
      campaignId,
      eventSequence: linkSequence,
      eventType: SUBJECT_LINKED_EVENT_TYPE,
      schemaVersion: SUBJECT_LINKED_SCHEMA_VERSION,
      payload: linkPayload,
      occurredAt: occurredAtIso,
      previousEventHash,
      idempotencyKey: linkIdempotencyKey,
      commandHash
    });
    await client.query(
      `INSERT INTO leasemind_app.campaign_event_log
         (event_id, campaign_id, event_sequence, event_type, schema_version, payload,
          idempotency_key, command_hash, previous_event_hash, event_hash, occurred_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        linkEventId,
        campaignId,
        linkSequence,
        SUBJECT_LINKED_EVENT_TYPE,
        SUBJECT_LINKED_SCHEMA_VERSION,
        JSON.stringify(linkPayload),
        linkIdempotencyKey,
        commandHash,
        previousEventHash,
        linkEventHash,
        occurredAt
      ]
    );
    currentSequence = BigInt(linkSequence);
    previousEventHash = linkEventHash;

    // Event 2 (sequence N+1): status Created -- always the latest event in
    // the stream, matching what rebuildCampaignProjection expects.
    const statusSequence = (currentSequence + 1n).toString();
    const statusEventId = randomUUID();
    const statusPayload = { status: 'Created' as const };
    const statusEventHash = computeEventHash({
      eventId: statusEventId,
      campaignId,
      eventSequence: statusSequence,
      eventType: CAMPAIGN_EVENT_TYPE,
      schemaVersion: CAMPAIGN_EVENT_SCHEMA_VERSION,
      payload: statusPayload,
      occurredAt: occurredAtIso,
      previousEventHash,
      idempotencyKey: input.idempotencyKey,
      commandHash
    });
    await client.query(
      `INSERT INTO leasemind_app.campaign_event_log
         (event_id, campaign_id, event_sequence, event_type, schema_version, payload,
          idempotency_key, command_hash, previous_event_hash, event_hash, occurred_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        statusEventId,
        campaignId,
        statusSequence,
        CAMPAIGN_EVENT_TYPE,
        CAMPAIGN_EVENT_SCHEMA_VERSION,
        JSON.stringify(statusPayload),
        input.idempotencyKey,
        commandHash,
        previousEventHash,
        statusEventHash,
        occurredAt
      ]
    );

    await client.query(
      `UPDATE leasemind_app.campaign_stream_head
          SET current_sequence = $2, current_event_hash = $3, updated_at = clock_timestamp()
        WHERE campaign_id = $1`,
      [campaignId, statusSequence, statusEventHash]
    );

    await client.query(
      `INSERT INTO leasemind_app.campaign_current_state_projection
         (campaign_id, status, aggregate_version, created_at, updated_at)
       VALUES ($1, 'Created', $2, $3, $3)
       ON CONFLICT (campaign_id) DO UPDATE
         SET status = EXCLUDED.status,
             aggregate_version = EXCLUDED.aggregate_version,
             updated_at = EXCLUDED.updated_at`,
      [campaignId, statusSequence, occurredAt]
    );

    const table = ta.scenario === 'need_tenant' ? 'leasemind_app.property' : 'leasemind_app.tenant_request';
    const idColumn = ta.scenario === 'need_tenant' ? 'property_id' : 'tenant_request_id';
    await client.query(`UPDATE ${table} SET lifecycle_status = 'campaign_started', updated_at = clock_timestamp() WHERE ${idColumn} = $1`, [
      ta.id
    ]);

    await client.query('COMMIT');

    return {
      campaign_id: campaignId,
      status: 'Created',
      aggregate_version: statusSequence,
      created_at: occurredAtIso,
      updated_at: occurredAtIso,
      isReplay: false
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
