/// <reference types="vite/client" />

export interface Campaign {
  campaign_id: string;
  status: string;
  aggregate_version: string;
  created_at: string;
  updated_at: string;
}

// ADR-0009: server-owned, read-only context letting the Campaign detail
// screen ask the existing GET .../analysis-snapshots/current endpoint for
// the current post_launch_refresh Snapshot. null for a legacy/unlinked
// Campaign (no campaign_subject_link_projection row) -- never treated as
// "analysis pending", always its own distinct safe state.
export interface CampaignAnalysisContext {
  technical_assignment_id: string;
  source_revision: number;
  scenario: 'need_tenant' | 'need_property';
}

// ADR-0010 §10, CAMPAIGN_OUTCOMES.md §11: detail-only, server-owned business
// outcome context. Only the four safe machine fields the API contract
// allows -- never operator_ref, correction_reason_code, record ids,
// sequence/version outcome history or any other internal field. null when
// no effective outcome has been recorded yet.
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

export interface CampaignDetail extends Campaign {
  analysis_context: CampaignAnalysisContext | null;
  outcome_context: CampaignOutcomeContext | null;
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
 * whether a displayable Campaign came back. The detail response always
 * includes analysis_context (null for a legacy/unlinked Campaign) and
 * outcome_context (null when no effective business outcome has been
 * recorded yet). Always fetched fresh from the server -- no client cache,
 * so a reload/new tab always reflects current server state (CO-C-022). */
export async function fetchCampaignById(campaignId: string): Promise<CampaignDetail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns/${encodeURIComponent(campaignId)}`);
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as CampaignDetail;
  } catch {
    return null;
  }
}
