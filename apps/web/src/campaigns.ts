/// <reference types="vite/client" />

export interface Campaign {
  campaign_id: string;
  status: string;
  aggregate_version: string;
  created_at: string;
  updated_at: string;
}

export type CampaignsState =
  | { kind: 'loading' }
  | { kind: 'empty' }
  | { kind: 'error' }
  | { kind: 'loaded'; campaigns: Campaign[] };

// Same-origin by default, matching api.ts -- proxied by Vite's dev server.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export async function fetchCampaigns(): Promise<CampaignsState> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns`);
    if (!response.ok) {
      return { kind: 'error' };
    }
    const body = (await response.json()) as { campaigns?: unknown };
    if (!Array.isArray(body.campaigns)) {
      return { kind: 'error' };
    }
    if (body.campaigns.length === 0) {
      return { kind: 'empty' };
    }
    return { kind: 'loaded', campaigns: body.campaigns as Campaign[] };
  } catch {
    return { kind: 'error' };
  }
}

/** Returns null on any error, 400 or 404 alike -- callers only need to know
 * whether a displayable Campaign came back. */
export async function fetchCampaignById(campaignId: string): Promise<Campaign | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${encodeURIComponent(campaignId)}`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as Campaign;
  } catch {
    return null;
  }
}
