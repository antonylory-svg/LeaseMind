import type pg from 'pg';
import { CAMPAIGN_STATUSES, type CampaignStatus } from './campaigns.js';

interface SyntheticCampaignSeed {
  campaignId: string;
  status: CampaignStatus;
}

// Deterministic synthetic identifiers only, exactly one Campaign per
// approved status (LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md section 5.3).
// Identity + status + technical fields only -- no PII, no free-form
// business fields.
export const SYNTHETIC_CAMPAIGN_SEEDS: readonly SyntheticCampaignSeed[] = CAMPAIGN_STATUSES.map(
  (status, index) => ({
    campaignId: `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
    status
  })
);

export interface SeedResult {
  inserted: number;
  skipped: number;
}

/** Idempotent: re-running never creates duplicates (campaign_id is the
 * primary key, conflicts are ignored rather than erroring or duplicating). */
export async function seedCampaigns(pool: pg.Pool): Promise<SeedResult> {
  let inserted = 0;
  let skipped = 0;

  for (const seed of SYNTHETIC_CAMPAIGN_SEEDS) {
    const result = await pool.query(
      `INSERT INTO leasemind_app.campaign_current_state_projection (campaign_id, status, aggregate_version)
       VALUES ($1, $2, 1)
       ON CONFLICT (campaign_id) DO NOTHING`,
      [seed.campaignId, seed.status]
    );
    if (result.rowCount && result.rowCount > 0) {
      inserted++;
    } else {
      skipped++;
    }
  }

  return { inserted, skipped };
}
