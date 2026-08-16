import type pg from 'pg';

// Exact 11 approved Campaign statuses. Source of truth:
// 03_ARCHITECTURE/ai-manager/LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md
// (Approved, Version 1.0, section 5.3). No additions, renames or removals.
export const CAMPAIGN_STATUSES = [
  'Created',
  'Analyzing',
  'Strategy Building',
  'Searching',
  'Qualifying',
  'Negotiating',
  'Viewing',
  'Deal Support',
  'Completed',
  'Paused',
  'Failed'
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export interface CampaignProjection {
  campaign_id: string;
  status: CampaignStatus;
  aggregate_version: string;
  created_at: string;
  updated_at: string;
}

// ADR-0009: the Technical Assignment / revision / scenario a Campaign was
// launched from -- read-only, server-owned context that lets the frontend
// ask for the current post_launch_refresh Analysis Snapshot
// (GET .../analysis-snapshots/current) without inventing a second read
// endpoint. null for any Campaign with no campaign_subject_link_projection
// row (legacy pre-ADR-0009 launches, or any future Campaign entry point
// that does not go through the Analysis-authorized launch command).
export interface CampaignAnalysisContext {
  technical_assignment_id: string;
  source_revision: number;
  scenario: 'need_tenant' | 'need_property';
}

// ADR-0010 §10, CAMPAIGN_OUTCOMES.md §11: detail-only, server-owned business
// outcome context. Sourced exclusively from the safe
// leasemind_app.campaign_outcome_public_projection view -- never from the
// three private campaign_outcome_* base tables, and never includes
// operator_ref, correction_reason_code, outcome_record_id,
// corrects_outcome_record_id, outcome_sequence,
// resulting_campaign_aggregate_version or mapped_lifecycle_status
// (redundant -- lifecycle status is this same response's own `status`
// field, read independently -- CO-C-010). null when no effective outcome
// exists yet. The outcome_code union is intentionally hardcoded here
// (mirrors CampaignAnalysisContext.scenario just above) rather than
// imported from the outcome command core (campaignOutcomes.ts) -- this read
// model stays fully decoupled from that write-only module.
export interface CampaignOutcomeContext {
  outcome_code:
    | 'success_via_leasemind'
    | 'success_independently'
    | 'success_via_broker'
    | 'cancelled'
    | 'expired';
  recorded_at: string;
  confirmation_method: 'user_attestation';
  is_corrected: boolean;
}

// Detail-only shape -- deliberately not merged into CampaignProjection so
// that GET /api/v1/campaigns (list) never gains these fields; only the
// single-Campaign GET needs them.
export interface CampaignDetail extends CampaignProjection {
  analysis_context: CampaignAnalysisContext | null;
  outcome_context: CampaignOutcomeContext | null;
}

interface CampaignRow {
  campaign_id: string;
  status: CampaignStatus;
  aggregate_version: string;
  created_at: Date;
  updated_at: Date;
}

interface CampaignDetailRow extends CampaignRow {
  technical_assignment_id: string | null;
  source_revision: number | null;
  scenario: 'need_tenant' | 'need_property' | null;
  outcome_code: CampaignOutcomeContext['outcome_code'] | null;
  outcome_recorded_at: Date | null;
  outcome_confirmation_method: 'user_attestation' | null;
  outcome_is_corrected: boolean | null;
}

const SELECT_COLUMNS =
  'campaign_id, status, aggregate_version::text AS aggregate_version, created_at, updated_at';

// campaign_subject_link_projection columns are exactly the four
// (campaign_id, scenario, technical_assignment_id, source_revision)
// lmapp_api_reader already has column-level SELECT on (ADR-0009 §12,
// migration 008) -- no new grant needed for this LEFT JOIN.
//
// campaign_outcome_public_projection exposes exactly the four safe columns
// documented on CampaignOutcomeContext above (ADR-0010 §10, migration
// 011) -- lmapp_api_reader already has SELECT on this view, no new grant
// needed. Never SELECT * against it and never join the three private
// campaign_outcome_* base tables directly.
const DETAIL_SELECT_COLUMNS = `
  c.campaign_id, c.status, c.aggregate_version::text AS aggregate_version, c.created_at, c.updated_at,
  l.technical_assignment_id, l.source_revision, l.scenario,
  o.outcome_code, o.recorded_at AS outcome_recorded_at,
  o.confirmation_method AS outcome_confirmation_method, o.is_corrected AS outcome_is_corrected`;

function toProjection(row: CampaignRow): CampaignProjection {
  return {
    campaign_id: row.campaign_id,
    status: row.status,
    aggregate_version: row.aggregate_version,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString()
  };
}

/** Stable, deterministic ordering by primary key -- never by insertion or wall-clock time. */
export async function listCampaigns(pool: pg.Pool): Promise<CampaignProjection[]> {
  const result = await pool.query<CampaignRow>(
    `SELECT ${SELECT_COLUMNS}
       FROM leasemind_app.campaign_current_state_projection
      ORDER BY campaign_id ASC`
  );
  return result.rows.map(toProjection);
}

/** campaignId must already be validated as UUID v4/v7 by the caller; this
 * function only ever executes a parameterized query. */
export async function getCampaignById(pool: pg.Pool, campaignId: string): Promise<CampaignProjection | null> {
  const result = await pool.query<CampaignRow>(
    `SELECT ${SELECT_COLUMNS}
       FROM leasemind_app.campaign_current_state_projection
      WHERE campaign_id = $1`,
    [campaignId]
  );
  const row = result.rows[0];
  return row ? toProjection(row) : null;
}

/** Detail-only read: the Campaign projection plus its analysis_context and
 * outcome_context, via LEFT JOINs so a legacy/unlinked Campaign (no
 * campaign_subject_link_projection row) or a Campaign with no effective
 * outcome yet (no campaign_outcome_public_projection row) still returns the
 * Campaign with the corresponding field null, not a missing row.
 *
 * A single SQL statement composing both LEFT JOINs is itself the "one
 * consistent snapshot" -- PostgreSQL evaluates one query as of one
 * snapshot, so campaign/analysis/outcome data in the returned row can never
 * straddle two different transactions the way two separate round-trip
 * queries against a shared connection could under concurrent writes. This
 * satisfies the same requirement a two-query
 * BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY / COMMIT wrapper would,
 * without the extra client-checkout/rollback/release bookkeeping.
 *
 * campaignId must already be validated as UUID v4/v7 by the caller; this
 * function only ever executes a parameterized query. */
export async function getCampaignDetailById(pool: pg.Pool, campaignId: string): Promise<CampaignDetail | null> {
  const result = await pool.query<CampaignDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
       FROM leasemind_app.campaign_current_state_projection c
       LEFT JOIN leasemind_app.campaign_subject_link_projection l ON l.campaign_id = c.campaign_id
       LEFT JOIN leasemind_app.campaign_outcome_public_projection o ON o.campaign_id = c.campaign_id
      WHERE c.campaign_id = $1`,
    [campaignId]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    ...toProjection(row),
    analysis_context: row.technical_assignment_id !== null
      ? {
          technical_assignment_id: row.technical_assignment_id,
          source_revision: row.source_revision as number,
          scenario: row.scenario as 'need_tenant' | 'need_property'
        }
      : null,
    // outcome_recorded_at/outcome_confirmation_method/outcome_is_corrected
    // come from the same LEFT JOIN row as outcome_code -- when outcome_code
    // is non-null the other three are guaranteed non-null too (they are
    // all columns of the same campaign_outcome_public_projection row).
    outcome_context: row.outcome_code !== null
      ? {
          outcome_code: row.outcome_code,
          recorded_at: row.outcome_recorded_at!.toISOString(),
          confirmation_method: row.outcome_confirmation_method!,
          is_corrected: row.outcome_is_corrected!
        }
      : null
  };
}
