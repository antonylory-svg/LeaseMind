import type pg from 'pg';
import type { AnalysisScenario, AnalysisStatus } from '../analysisTypes.js';
import {
  createOrReplayInitialPostLaunchAnalysisSnapshot,
  executePendingPostLaunchAnalysisSnapshot,
  type PostLaunchRefreshIdentity
} from './analysisSnapshot.js';

export const POST_LAUNCH_REFRESH_CLAIM_LIMIT = 1;
export const POST_LAUNCH_REFRESH_LEASE_RENEWAL_MS = 45_000;

export interface PostLaunchRefreshClaim extends PostLaunchRefreshIdentity {
  currentAnalysisSnapshotId: string | null;
  executionClaimCount: number;
  launchedAt: Date;
  slaDeadlineAt: Date;
}

export interface PostLaunchRefreshSlaBreachEvent {
  campaignId: string;
  analysisSnapshotId: string;
}

export interface PostLaunchRefreshCycleResult {
  claimed: number;
  completed: number;
  failed: number;
  slaBreachesMarked: number;
  slaBreachEvents: PostLaunchRefreshSlaBreachEvent[];
}

interface ClaimRow {
  campaign_id: string;
  property_id: string | null;
  tenant_request_id: string | null;
  technical_assignment_id: string;
  scenario: AnalysisScenario;
  source_revision: number;
  current_analysis_snapshot_id: string | null;
  execution_claim_count: number;
  launched_at: Date;
  sla_deadline_at: Date;
}

function claimFromRow(row: ClaimRow): PostLaunchRefreshClaim {
  return {
    campaignId: row.campaign_id,
    propertyId: row.property_id,
    tenantRequestId: row.tenant_request_id,
    technicalAssignmentId: row.technical_assignment_id,
    scenario: row.scenario,
    sourceRevision: row.source_revision,
    currentAnalysisSnapshotId: row.current_analysis_snapshot_id,
    executionClaimCount: row.execution_claim_count,
    launchedAt: row.launched_at,
    slaDeadlineAt: row.sla_deadline_at
  };
}

export async function claimPostLaunchRefreshIntents(
  pool: pg.Pool,
  workerId: string,
  limit = POST_LAUNCH_REFRESH_CLAIM_LIMIT
): Promise<PostLaunchRefreshClaim[]> {
  const result = await pool.query<ClaimRow>(
    `SELECT * FROM leasemind_app.claim_post_launch_refresh_intent($1, $2)`,
    [workerId, limit]
  );
  return result.rows.map(claimFromRow);
}

export async function renewPostLaunchRefreshLease(
  pool: pg.Pool,
  workerId: string,
  claim: PostLaunchRefreshClaim
): Promise<void> {
  await pool.query(
    `SELECT leasemind_app.renew_post_launch_refresh_intent_lease($1, $2, $3)`,
    [claim.campaignId, workerId, claim.executionClaimCount]
  );
}

export async function markPostLaunchRefreshSlaBreach(
  pool: pg.Pool,
  campaignId: string
): Promise<boolean> {
  const result = await pool.query<{ marked: boolean }>(
    `SELECT leasemind_app.mark_post_launch_refresh_intent_sla_breach($1) AS marked`,
    [campaignId]
  );
  return result.rows[0]?.marked === true;
}

async function finalizePostLaunchRefreshIntent(
  pool: pg.Pool,
  workerId: string,
  claim: PostLaunchRefreshClaim,
  analysisSnapshotId: string,
  status: AnalysisStatus
): Promise<'completed' | 'failed'> {
  if (status === 'completed' || status === 'insufficient_data') {
    await pool.query(
      `SELECT leasemind_app.complete_post_launch_refresh_intent($1, $2, $3, $4)`,
      [claim.campaignId, workerId, claim.executionClaimCount, analysisSnapshotId]
    );
    return 'completed';
  }
  if (status === 'failed') {
    await pool.query(
      `SELECT leasemind_app.fail_post_launch_refresh_intent($1, $2, $3, $4)`,
      [claim.campaignId, workerId, claim.executionClaimCount, analysisSnapshotId]
    );
    return 'failed';
  }
  throw new Error('POST_LAUNCH_REFRESH_EXECUTION_NOT_TERMINAL');
}

interface LeaseHeartbeat {
  stop(): Promise<void>;
  assertOwned(): void;
}

function startLeaseHeartbeat(
  pool: pg.Pool,
  workerId: string,
  claim: PostLaunchRefreshClaim,
  intervalMs: number
): LeaseHeartbeat {
  let lost = false;
  let inFlight: Promise<void> | null = null;
  const timer = setInterval(() => {
    if (lost || inFlight !== null) return;
    inFlight = renewPostLaunchRefreshLease(pool, workerId, claim)
      .catch(() => {
        lost = true;
      })
      .finally(() => {
        inFlight = null;
      });
  }, intervalMs);
  timer.unref();

  return {
    async stop(): Promise<void> {
      clearInterval(timer);
      await inFlight;
    },
    assertOwned(): void {
      if (lost) throw new Error('POST_LAUNCH_REFRESH_INTENT_FENCING_STALE');
    }
  };
}

export async function processPostLaunchRefreshClaim(
  pool: pg.Pool,
  workerId: string,
  claim: PostLaunchRefreshClaim,
  leaseRenewalMs = POST_LAUNCH_REFRESH_LEASE_RENEWAL_MS
): Promise<{ terminalStatus: 'completed' | 'failed'; slaBreachesMarked: number; analysisSnapshotId: string }> {
  let slaBreachesMarked = await markPostLaunchRefreshSlaBreach(pool, claim.campaignId) ? 1 : 0;
  await renewPostLaunchRefreshLease(pool, workerId, claim);
  const heartbeat = startLeaseHeartbeat(pool, workerId, claim, leaseRenewalMs);

  try {
    const analysisSnapshotId = claim.currentAnalysisSnapshotId ?? (
      await createOrReplayInitialPostLaunchAnalysisSnapshot(pool, claim)
    ).analysisSnapshotId;
    const execution = await executePendingPostLaunchAnalysisSnapshot(pool, analysisSnapshotId);

    await heartbeat.stop();
    heartbeat.assertOwned();
    await renewPostLaunchRefreshLease(pool, workerId, claim);
    if (await markPostLaunchRefreshSlaBreach(pool, claim.campaignId)) slaBreachesMarked += 1;
    const terminalStatus = await finalizePostLaunchRefreshIntent(
      pool,
      workerId,
      claim,
      analysisSnapshotId,
      execution.status
    );
    if (await markPostLaunchRefreshSlaBreach(pool, claim.campaignId)) slaBreachesMarked += 1;
    return { terminalStatus, slaBreachesMarked, analysisSnapshotId };
  } finally {
    await heartbeat.stop();
  }
}

export async function runPostLaunchRefreshWorkerCycle(
  pool: pg.Pool,
  workerId: string,
  claimLimit = POST_LAUNCH_REFRESH_CLAIM_LIMIT
): Promise<PostLaunchRefreshCycleResult> {
  const claims = await claimPostLaunchRefreshIntents(pool, workerId, claimLimit);
  const result: PostLaunchRefreshCycleResult = {
    claimed: claims.length,
    completed: 0,
    failed: 0,
    slaBreachesMarked: 0,
    slaBreachEvents: []
  };
  for (const claim of claims) {
    const processed = await processPostLaunchRefreshClaim(pool, workerId, claim);
    result[processed.terminalStatus] += 1;
    result.slaBreachesMarked += processed.slaBreachesMarked;
    // markPostLaunchRefreshSlaBreach is backed by the DB's irreversible
    // `sla_breach_reported_at IS NULL` guard (migration 009), so it can
    // return true at most once, ever, for a given intent -- ...Marked is
    // therefore 0 or 1 here, never more, and this event list carries at
    // most one entry per claim regardless of how many worker cycles
    // (across process restarts) eventually observe the breach.
    if (processed.slaBreachesMarked > 0) {
      result.slaBreachEvents.push({
        campaignId: claim.campaignId,
        analysisSnapshotId: processed.analysisSnapshotId
      });
    }
  }
  return result;
}
