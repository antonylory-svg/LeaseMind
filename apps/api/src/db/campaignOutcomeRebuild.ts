import type pg from 'pg';
import { rebuildCampaignProjectionOnClient } from './campaignEvents.js';

// Campaign Outcome rebuild/recovery (ADR-0010 §12). Maintenance-only:
// callers use the lmapp_maintainer connection (LEASEMIND_MAINTENANCE_DATABASE_URL),
// never the campaign_outcome_writer connection the command core
// (campaignOutcomes.ts) uses, and never any HTTP route. campaign_outcome_event_log
// and campaign_outcome_idempotency_mapping are read-only source-of-truth
// here -- this module never writes to either (lmapp_maintainer holds no
// write grant on either, migration 011). The only mutable target is
// campaign_outcome_current_projection, and only ever via INSERT/UPDATE of
// its pointer column -- never DELETE, which this role does not have either.

export const CAMPAIGN_OUTCOME_REBUILD_INCONSISTENT = 'CAMPAIGN_OUTCOME_REBUILD_INCONSISTENT';

export class CampaignOutcomeRebuildError extends Error {
  constructor(public readonly safeCode: string) {
    super(safeCode);
    this.name = 'CampaignOutcomeRebuildError';
  }
}

async function rollbackSafely(client: pg.PoolClient): Promise<void> {
  await client.query('ROLLBACK').catch(() => {});
}

/** Transaction-aware core: recomputes campaign_outcome_current_projection's
 * pointer for one Campaign from campaign_outcome_event_log -- the record
 * with the greatest outcome_sequence, record/correct equally eligible
 * (ADR-0010 §3/§12). Runs entirely on an already-open client; the caller
 * owns the transaction. */
async function rebuildCampaignOutcomeProjectionOnClient(client: pg.PoolClient, campaignId: string): Promise<void> {
  const latest = await client.query<{
    outcome_record_id: string;
    mapped_lifecycle_status: string;
    resulting_campaign_aggregate_version: string;
  }>(
    `SELECT outcome_record_id, mapped_lifecycle_status,
            resulting_campaign_aggregate_version::text AS resulting_campaign_aggregate_version
       FROM leasemind_app.campaign_outcome_event_log
      WHERE campaign_id = $1
      ORDER BY outcome_sequence DESC
      LIMIT 1`,
    [campaignId]
  );

  if (latest.rowCount === 0) {
    // The composite FK on campaign_outcome_current_projection already makes
    // a pointer row without a backing log row structurally impossible. This
    // defensive re-check exists only so an otherwise-unreachable orphan
    // fails closed instead of being silently ignored -- rebuild never
    // DELETEs this table (lmapp_maintainer holds no DELETE grant on it at
    // all, so this is also the only way such a row could ever be cleared).
    const orphanPointer = await client.query(
      `SELECT 1 FROM leasemind_app.campaign_outcome_current_projection WHERE campaign_id = $1`,
      [campaignId]
    );
    if (orphanPointer.rowCount && orphanPointer.rowCount > 0) {
      throw new CampaignOutcomeRebuildError(CAMPAIGN_OUTCOME_REBUILD_INCONSISTENT);
    }
    return;
  }

  const row = latest.rows[0];

  // Cross-consistency (ADR-0010 §12) over the Campaign's ENTIRE outcome
  // history, not only the latest row: every campaign_outcome_event_log row
  // for this campaign_id must reference a real campaign_event_log row of
  // the same campaign_id at event_sequence = resulting_campaign_aggregate_version,
  // typed campaign.status_recorded.v1, whose payload.status equals that
  // row's own mapped_lifecycle_status -- including already-superseded rows
  // a correction has moved past. The insert-verification trigger
  // (verify_campaign_outcome_resulting_event) already guaranteed this
  // pairing for each row at its own write time -- re-confirmed here rather
  // than assumed, since that trigger cannot retroactively police a direct
  // lmapp_migrator-level mutation of campaign_event_log made after any of
  // these rows was inserted. One bounded anti-join with LIMIT 1 -- a single
  // query regardless of how many rows the history contains, never N+1.
  const inconsistentRow = await client.query(
    `SELECT 1
       FROM leasemind_app.campaign_outcome_event_log o
       LEFT JOIN leasemind_app.campaign_event_log e
         ON e.campaign_id = o.campaign_id AND e.event_sequence = o.resulting_campaign_aggregate_version
      WHERE o.campaign_id = $1
        AND (
          e.event_id IS NULL
          OR e.event_type <> 'campaign.status_recorded.v1'
          OR (e.payload->>'status') IS DISTINCT FROM o.mapped_lifecycle_status
        )
      LIMIT 1`,
    [campaignId]
  );
  if (inconsistentRow.rowCount && inconsistentRow.rowCount > 0) {
    throw new CampaignOutcomeRebuildError(CAMPAIGN_OUTCOME_REBUILD_INCONSISTENT);
  }

  await client.query(
    `INSERT INTO leasemind_app.campaign_outcome_current_projection (campaign_id, current_outcome_record_id)
     VALUES ($1, $2)
     ON CONFLICT (campaign_id) DO UPDATE
       SET current_outcome_record_id = EXCLUDED.current_outcome_record_id,
           updated_at = clock_timestamp()`,
    [campaignId, row.outcome_record_id]
  );
}

/** Public entry point: rebuilds one Campaign's outcome current-projection
 * pointer, in its own transaction. No-op if the Campaign has no outcome
 * history (and no orphan pointer -- see above). Fails closed, never
 * deletes, on any detected cross-consistency violation. */
export async function rebuildCampaignOutcomeProjection(pool: pg.Pool, campaignId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await rebuildCampaignOutcomeProjectionOnClient(client, campaignId);
    await client.query('COMMIT');
  } catch (error) {
    await rollbackSafely(client);
    throw error;
  } finally {
    client.release();
  }
}

/** Rebuilds every Campaign that has at least one campaign_outcome_event_log
 * row. Returns the exact number of Campaigns processed -- never an estimate
 * or the count of rows touched. */
export async function rebuildAllCampaignOutcomeProjections(pool: pg.Pool): Promise<number> {
  const result = await pool.query<{ campaign_id: string }>(
    'SELECT DISTINCT campaign_id FROM leasemind_app.campaign_outcome_event_log'
  );
  for (const row of result.rows) {
    await rebuildCampaignOutcomeProjection(pool, row.campaign_id);
  }
  return result.rows.length;
}

/** Coordinated rebuild of BOTH the lifecycle projection
 * (campaign_current_state_projection) and the outcome current-projection
 * for one Campaign, under the same campaign_stream_head row lock that
 * already serializes every record/correct/lifecycle-append writer for this
 * Campaign (ADR-0010 §6) -- so the two projections are never observed
 * externally as rebuilt from two different, unrelated states. One
 * pg.PoolClient, one transaction, one COMMIT. Never creates a genesis
 * campaign_stream_head row (the same rule the outcome command core itself
 * follows, ADR-0010 §5.2 step 8). */
export async function rebuildCampaignProjections(pool: pg.Pool, campaignId: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const head = await client.query<{ current_sequence: string }>(
      `SELECT current_sequence FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1 FOR UPDATE`,
      [campaignId]
    );

    if (head.rowCount === 0) {
      // A missing stream head is a legitimate no-op only when nothing else
      // references this campaign_id either. If any lifecycle or outcome
      // history exists without a stream head, that is an impossible state
      // and must fail closed, not be silently skipped.
      const hasLifecycleHistory = await client.query(
        `SELECT 1 FROM leasemind_app.campaign_event_log WHERE campaign_id = $1 LIMIT 1`,
        [campaignId]
      );
      const hasOutcomeHistory = await client.query(
        `SELECT 1 FROM leasemind_app.campaign_outcome_event_log WHERE campaign_id = $1 LIMIT 1`,
        [campaignId]
      );
      if ((hasLifecycleHistory.rowCount ?? 0) > 0 || (hasOutcomeHistory.rowCount ?? 0) > 0) {
        throw new CampaignOutcomeRebuildError(CAMPAIGN_OUTCOME_REBUILD_INCONSISTENT);
      }
      await client.query('COMMIT');
      return;
    }

    await rebuildCampaignProjectionOnClient(client, campaignId);
    await rebuildCampaignOutcomeProjectionOnClient(client, campaignId);

    await client.query('COMMIT');
  } catch (error) {
    await rollbackSafely(client);
    throw error;
  } finally {
    client.release();
  }
}
