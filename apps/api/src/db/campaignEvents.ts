import { createHash, randomUUID } from 'node:crypto';
import type pg from 'pg';
import { CAMPAIGN_STATUSES, type CampaignStatus } from './campaigns.js';
import { isUuidV4OrV7 } from '../uuid.js';

export const CAMPAIGN_EVENT_TYPE = 'campaign.status_recorded.v1' as const;
export const CAMPAIGN_EVENT_SCHEMA_VERSION = 1 as const;

// Domain separator for every hash computed in this module. Changing it would
// change every resulting hash -- treat it as part of the event format.
const DOMAIN_SEPARATOR = 'LEASEMIND_CAMPAIGN_EVENT_V1';

// previous_event_hash of the first event in a stream (no real predecessor).
export const GENESIS_EVENT_HASH = '0'.repeat(64);

const IDEMPOTENCY_UNIQUE_CONSTRAINT = 'campaign_event_log_idempotency_unique';

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/** Server-side hash of the requested command, independent of the idempotency
 * key -- used to distinguish a safe same-key replay from a same-key/
 * different-command conflict. */
export function computeCommandHash(campaignId: string, status: CampaignStatus): string {
  return sha256Hex(`${DOMAIN_SEPARATOR}|COMMAND|${campaignId}|${status}`);
}

export interface EventHashInput {
  eventId: string;
  campaignId: string;
  eventSequence: string;
  eventType: string;
  schemaVersion: number;
  // Widened to a generic payload (rather than { status: CampaignStatus })
  // so other additive event types (e.g. campaign.subject_linked.v1 in
  // apps/api/src/db/launchCampaign.ts) can reuse this same hash formula.
  // Runtime behavior is unchanged: JSON.stringify(payload) either way.
  payload: Record<string, unknown>;
  occurredAt: string;
  previousEventHash: string;
  idempotencyKey: string;
  commandHash: string;
}

/** Pure function, exported so tests (and any future caller) can
 * independently recompute and verify a stored event's hash using its own
 * stored fields, without duplicating the formula. */
export function computeEventHash(input: EventHashInput): string {
  return sha256Hex(
    [
      DOMAIN_SEPARATOR,
      'EVENT',
      input.eventId,
      input.campaignId,
      input.eventSequence,
      input.eventType,
      String(input.schemaVersion),
      JSON.stringify(input.payload),
      input.occurredAt,
      input.previousEventHash,
      input.idempotencyKey,
      input.commandHash
    ].join('|')
  );
}

export interface CampaignEvent {
  eventId: string;
  campaignId: string;
  eventSequence: string;
  eventType: typeof CAMPAIGN_EVENT_TYPE;
  schemaVersion: number;
  status: CampaignStatus;
  idempotencyKey: string;
  commandHash: string;
  previousEventHash: string;
  eventHash: string;
  occurredAt: string;
}

export interface AppendCampaignStatusEventInput {
  campaignId: string;
  status: CampaignStatus;
  idempotencyKey: string;
}

export interface AppendCampaignStatusEventResult extends CampaignEvent {
  isReplay: boolean;
}

interface EventRow {
  event_id: string;
  campaign_id: string;
  event_sequence: string;
  event_type: string;
  schema_version: number;
  payload: { status: CampaignStatus };
  idempotency_key: string;
  command_hash: string;
  previous_event_hash: string;
  event_hash: string;
  occurred_at: Date;
}

function toCampaignEvent(row: EventRow): CampaignEvent {
  return {
    eventId: row.event_id,
    campaignId: row.campaign_id,
    eventSequence: row.event_sequence,
    eventType: row.event_type as typeof CAMPAIGN_EVENT_TYPE,
    schemaVersion: row.schema_version,
    status: row.payload.status,
    idempotencyKey: row.idempotency_key,
    commandHash: row.command_hash,
    previousEventHash: row.previous_event_hash,
    eventHash: row.event_hash,
    occurredAt: row.occurred_at.toISOString()
  };
}

function isUniqueViolation(error: unknown, constraintName: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { code?: string }).code === '23505' &&
    (error as { constraint?: string }).constraint === constraintName
  );
}

async function rollbackSafely(client: pg.PoolClient): Promise<void> {
  await client.query('ROLLBACK').catch(() => {});
}

/**
 * The single internal path for adding a Campaign event and atomically
 * projecting it. Callers supply only campaign_id, status and
 * idempotency_key -- event_id, event_sequence, occurred_at,
 * previous_event_hash, event_hash, event_type, schema_version and
 * command_hash are always computed or assigned here, never accepted as
 * input. Not reachable from any HTTP route.
 */
export async function appendCampaignStatusEvent(
  pool: pg.Pool,
  input: AppendCampaignStatusEventInput
): Promise<AppendCampaignStatusEventResult> {
  const { campaignId, status, idempotencyKey } = input;

  if (!isUuidV4OrV7(campaignId)) {
    throw new Error(`INVALID_CAMPAIGN_ID: ${campaignId}`);
  }
  if (!CAMPAIGN_STATUSES.includes(status)) {
    throw new Error(`INVALID_CAMPAIGN_STATUS: ${status}`);
  }
  if (idempotencyKey.length === 0) {
    throw new Error('INVALID_IDEMPOTENCY_KEY: must not be empty');
  }

  const commandHash = computeCommandHash(campaignId, status);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query<EventRow>(
      `SELECT event_id, campaign_id, event_sequence, event_type, schema_version, payload,
              idempotency_key, command_hash, previous_event_hash, event_hash, occurred_at
         FROM leasemind_app.campaign_event_log
        WHERE campaign_id = $1 AND idempotency_key = $2`,
      [campaignId, idempotencyKey]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      const row = existing.rows[0];
      if (row.command_hash !== commandHash) {
        await rollbackSafely(client);
        throw new Error(
          'IDEMPOTENCY_KEY_CONFLICT: idempotency_key already used with a different command for this campaign'
        );
      }
      await client.query('COMMIT');
      return { ...toCampaignEvent(row), isReplay: true };
    }

    // Serialize appends for this campaign_id: create the stream head if
    // absent, then lock its row for the remainder of the transaction so a
    // concurrent append for the same campaign_id must wait for this one to
    // finish before it can read/assign the next sequence.
    await client.query(
      `INSERT INTO leasemind_app.campaign_stream_head (campaign_id, current_sequence, current_event_hash)
       VALUES ($1, 0, $2)
       ON CONFLICT (campaign_id) DO NOTHING`,
      [campaignId, GENESIS_EVENT_HASH]
    );
    const head = await client.query<{ current_sequence: string; current_event_hash: string }>(
      `SELECT current_sequence, current_event_hash
         FROM leasemind_app.campaign_stream_head
        WHERE campaign_id = $1
        FOR UPDATE`,
      [campaignId]
    );
    const currentSequence = BigInt(head.rows[0].current_sequence);
    const previousEventHash = head.rows[0].current_event_hash;
    const nextSequence = (currentSequence + 1n).toString();

    const timeResult = await client.query<{ now: Date }>('SELECT clock_timestamp() AS now');
    const occurredAt = timeResult.rows[0].now;
    const occurredAtIso = occurredAt.toISOString();

    const eventId = randomUUID();
    const payload = { status };

    const eventHash = computeEventHash({
      eventId,
      campaignId,
      eventSequence: nextSequence,
      eventType: CAMPAIGN_EVENT_TYPE,
      schemaVersion: CAMPAIGN_EVENT_SCHEMA_VERSION,
      payload,
      occurredAt: occurredAtIso,
      previousEventHash,
      idempotencyKey,
      commandHash
    });

    try {
      await client.query(
        `INSERT INTO leasemind_app.campaign_event_log
           (event_id, campaign_id, event_sequence, event_type, schema_version, payload,
            idempotency_key, command_hash, previous_event_hash, event_hash, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          eventId,
          campaignId,
          nextSequence,
          CAMPAIGN_EVENT_TYPE,
          CAMPAIGN_EVENT_SCHEMA_VERSION,
          JSON.stringify(payload),
          idempotencyKey,
          commandHash,
          previousEventHash,
          eventHash,
          occurredAt
        ]
      );
    } catch (error) {
      if (isUniqueViolation(error, IDEMPOTENCY_UNIQUE_CONSTRAINT)) {
        // Lost a concurrent race for the same (campaign_id, idempotency_key):
        // the other transaction's row now exists. Roll back and re-resolve
        // via the idempotency path instead of failing the caller.
        await rollbackSafely(client);
        return appendCampaignStatusEvent(pool, input);
      }
      throw error;
    }

    await client.query(
      `UPDATE leasemind_app.campaign_stream_head
          SET current_sequence = $2, current_event_hash = $3, updated_at = clock_timestamp()
        WHERE campaign_id = $1`,
      [campaignId, nextSequence, eventHash]
    );

    await client.query(
      `INSERT INTO leasemind_app.campaign_current_state_projection
         (campaign_id, status, aggregate_version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $4)
       ON CONFLICT (campaign_id) DO UPDATE
         SET status = EXCLUDED.status,
             aggregate_version = EXCLUDED.aggregate_version,
             updated_at = EXCLUDED.updated_at`,
      [campaignId, status, nextSequence, occurredAt]
    );

    await client.query('COMMIT');

    return {
      eventId,
      campaignId,
      eventSequence: nextSequence,
      eventType: CAMPAIGN_EVENT_TYPE,
      schemaVersion: CAMPAIGN_EVENT_SCHEMA_VERSION,
      status,
      idempotencyKey,
      commandHash,
      previousEventHash,
      eventHash,
      occurredAt: occurredAtIso,
      isReplay: false
    };
  } catch (error) {
    await rollbackSafely(client);
    throw error;
  } finally {
    client.release();
  }
}

/** Recomputes campaign_current_state_projection for one campaign from its
 * Event Log stream. Read-only with respect to campaign_event_log. A no-op
 * if the campaign has no events. */
export async function rebuildCampaignProjection(pool: pg.Pool, campaignId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const latest = await client.query<{ event_sequence: string; payload: { status: CampaignStatus }; occurred_at: Date }>(
      `SELECT event_sequence, payload, occurred_at
         FROM leasemind_app.campaign_event_log
        WHERE campaign_id = $1
        ORDER BY event_sequence DESC
        LIMIT 1`,
      [campaignId]
    );

    if (latest.rowCount === 0) {
      await client.query('ROLLBACK');
      return;
    }

    const first = await client.query<{ occurred_at: Date }>(
      `SELECT occurred_at
         FROM leasemind_app.campaign_event_log
        WHERE campaign_id = $1
        ORDER BY event_sequence ASC
        LIMIT 1`,
      [campaignId]
    );

    const latestRow = latest.rows[0];
    await client.query(
      `INSERT INTO leasemind_app.campaign_current_state_projection
         (campaign_id, status, aggregate_version, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (campaign_id) DO UPDATE
         SET status = EXCLUDED.status,
             aggregate_version = EXCLUDED.aggregate_version,
             created_at = EXCLUDED.created_at,
             updated_at = EXCLUDED.updated_at`,
      [campaignId, latestRow.payload.status, latestRow.event_sequence, first.rows[0].occurred_at, latestRow.occurred_at]
    );

    await client.query('COMMIT');
  } catch (error) {
    await rollbackSafely(client);
    throw error;
  } finally {
    client.release();
  }
}

/** Recomputes campaign_current_state_projection for every campaign_id that
 * has at least one event. Read-only with respect to campaign_event_log.
 * Returns the number of campaigns rebuilt. */
export async function rebuildAllCampaignProjections(pool: pg.Pool): Promise<number> {
  const result = await pool.query<{ campaign_id: string }>(
    'SELECT DISTINCT campaign_id FROM leasemind_app.campaign_event_log'
  );
  for (const row of result.rows) {
    await rebuildCampaignProjection(pool, row.campaign_id);
  }
  return result.rows.length;
}
