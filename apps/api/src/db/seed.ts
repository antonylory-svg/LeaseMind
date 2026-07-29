import type pg from 'pg';
import { CAMPAIGN_STATUSES, type CampaignStatus } from './campaigns.js';
import { appendCampaignStatusEvent } from './campaignEvents.js';

interface SyntheticCampaignSeed {
  campaignId: string;
  status: CampaignStatus;
  idempotencyKey: string;
}

// Deterministic synthetic identifiers only, exactly one Campaign per
// approved status (LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md section 5.3).
// Identity + status + technical fields only -- no PII, no free-form
// business fields.
export const SYNTHETIC_CAMPAIGN_SEEDS: readonly SyntheticCampaignSeed[] = CAMPAIGN_STATUSES.map(
  (status, index) => {
    const campaignId = `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`;
    return {
      campaignId,
      status,
      idempotencyKey: `synthetic-seed:${campaignId}:initial-status`
    };
  }
);

export interface SeedResult {
  inserted: number;
  skipped: number;
}

/** Idempotent: every synthetic Campaign is created only through the single
 * internal append path, using a fixed idempotency key per campaign. Re-running
 * replays the same key/command and never creates a new event or duplicate. */
export async function seedCampaigns(pool: pg.Pool): Promise<SeedResult> {
  let inserted = 0;
  let skipped = 0;

  for (const seed of SYNTHETIC_CAMPAIGN_SEEDS) {
    const result = await appendCampaignStatusEvent(pool, {
      campaignId: seed.campaignId,
      status: seed.status,
      idempotencyKey: seed.idempotencyKey
    });
    if (result.isReplay) {
      skipped++;
    } else {
      inserted++;
    }
  }

  return { inserted, skipped };
}
