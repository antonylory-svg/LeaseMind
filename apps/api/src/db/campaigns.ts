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

interface CampaignRow {
  campaign_id: string;
  status: CampaignStatus;
  aggregate_version: string;
  created_at: Date;
  updated_at: Date;
}

const SELECT_COLUMNS =
  'campaign_id, status, aggregate_version::text AS aggregate_version, created_at, updated_at';

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
