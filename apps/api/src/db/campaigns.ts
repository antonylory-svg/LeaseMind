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

// Detail-only shape -- deliberately not merged into CampaignProjection so
// that GET /api/v1/campaigns (list) never gains this field; only the
// single-Campaign GET needs it.
export interface CampaignDetail extends CampaignProjection {
  analysis_context: CampaignAnalysisContext | null;
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
}

const SELECT_COLUMNS =
  'campaign_id, status, aggregate_version::text AS aggregate_version, created_at, updated_at';

// campaign_subject_link_projection columns are exactly the four
// (campaign_id, scenario, technical_assignment_id, source_revision)
// lmapp_api_reader already has column-level SELECT on (ADR-0009 §12,
// migration 008) -- no new grant needed for this LEFT JOIN.
const DETAIL_SELECT_COLUMNS = `
  c.campaign_id, c.status, c.aggregate_version::text AS aggregate_version, c.created_at, c.updated_at,
  l.technical_assignment_id, l.source_revision, l.scenario`;

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

/** Detail-only read: the Campaign projection plus its analysis_context, via
 * a LEFT JOIN so a legacy/unlinked Campaign (no campaign_subject_link_projection
 * row) still returns the Campaign with analysis_context: null, not a missing
 * row. campaignId must already be validated as UUID v4/v7 by the caller;
 * this function only ever executes a parameterized query. */
export async function getCampaignDetailById(pool: pg.Pool, campaignId: string): Promise<CampaignDetail | null> {
  const result = await pool.query<CampaignDetailRow>(
    `SELECT ${DETAIL_SELECT_COLUMNS}
       FROM leasemind_app.campaign_current_state_projection c
       LEFT JOIN leasemind_app.campaign_subject_link_projection l ON l.campaign_id = c.campaign_id
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
      : null
  };
}
