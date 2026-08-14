/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

export type AnalysisStatus = 'pending' | 'completed' | 'insufficient_data' | 'failed';
export type AnalysisFreshnessReason = 'revision_changed' | 'campaign_mismatch' | 'evidence_revoked' | null;
export type AnalysisConfidence = 'low' | 'medium' | 'high' | null;

export interface AnalysisMetric<TValue extends Record<string, unknown> = Record<string, unknown>> {
  metric_status: 'assessed' | 'insufficient_data';
  confidence: AnalysisConfidence;
  value: TValue | null;
  sample_size: number;
  evidence: {
    method: string;
    filters_applied: string[];
    dataset_revision: string | null;
  };
  reason_codes: string[];
  assumptions: string[];
}

export interface PriceAdequacyValue extends Record<string, unknown> {
  subject_rate_rub_per_sqm_month: string;
  rate_basis: 'property_total_div_area' | 'explicit_rate_cap' | 'derived_budget_at_max_area';
  p25_rub_per_sqm_month: string;
  median_rub_per_sqm_month: string;
  p75_rub_per_sqm_month: string;
  classification: 'below_reference_range' | 'within_reference_range' | 'above_reference_range';
}

export interface CompetitionValue extends Record<string, unknown> {
  comparable_count: number;
  population_scanned: number;
  comparison_side: 'property_supply' | 'tenant_demand';
}

export interface CandidateCategoriesValue extends Record<string, unknown> {
  category_kind: 'tenant_business_category' | 'property_type';
  items: Array<{ code: string; compatible_count: number }>;
}

export interface AnalysisResults {
  price_adequacy: AnalysisMetric<PriceAdequacyValue>;
  competition: AnalysisMetric<CompetitionValue>;
  deal_probability_30d: AnalysisMetric;
  candidate_categories: AnalysisMetric<CandidateCategoriesValue>;
}

export interface AnalysisSnapshot {
  schema_version: '1.0';
  analysis_snapshot_id: string;
  technical_assignment_id: string;
  source_revision: number;
  scenario: 'need_tenant' | 'need_property';
  analysis_kind: 'pre_launch' | 'post_launch_refresh';
  campaign_id: string | null;
  calculation_attempt: number;
  status: AnalysisStatus;
  freshness_status: 'current' | 'stale';
  freshness_reason: AnalysisFreshnessReason;
  method_version: 'synthetic_ru_v1';
  market_context: {
    country_code: 'RU';
    currency: 'RUB';
    locale: 'ru-RU';
    area_unit: 'sqm';
    rent_period: 'month';
  };
  input_fingerprint: string;
  evidence_dataset_revision: string | null;
  evidence_as_of: string | null;
  generated_at: string | null;
  created_at: string;
  failure: null | {
    code: 'ANALYSIS_DATASET_UNAVAILABLE' | 'ANALYSIS_GENERATION_FAILED';
    retryable: boolean;
  };
  results: AnalysisResults | null;
}

export interface AnalysisApiFailure {
  code: string;
  retryable: boolean;
}

export type CreateAnalysisResult =
  | { kind: 'snapshot'; snapshot: AnalysisSnapshot; created: boolean }
  | { kind: 'rejected'; error: AnalysisApiFailure }
  | { kind: 'error' };

export type FetchAnalysisResult =
  | { kind: 'snapshot'; snapshot: AnalysisSnapshot }
  | { kind: 'not_found' }
  | { kind: 'rejected'; error: AnalysisApiFailure }
  | { kind: 'error' };

async function readFailure(response: Response): Promise<AnalysisApiFailure | null> {
  try {
    const body = (await response.json()) as { code?: unknown; retryable?: unknown };
    if (typeof body.code !== 'string' || typeof body.retryable !== 'boolean') return null;
    return { code: body.code, retryable: body.retryable };
  } catch {
    return null;
  }
}

/** Creates the first pre-launch attempt or an explicit retry. The caller
 * owns idempotency-key reuse after a lost response; no key is generated in
 * this transport helper. */
export async function createPreLaunchAnalysisSnapshot(
  idempotencyKey: string,
  technicalAssignmentId: string,
  expectedRevision: number,
  retryOfAnalysisSnapshotId: string | null
): Promise<CreateAnalysisResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analysis-snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        technical_assignment_id: technicalAssignmentId,
        expected_revision: expectedRevision,
        analysis_kind: 'pre_launch',
        campaign_id: null,
        retry_of_analysis_snapshot_id: retryOfAnalysisSnapshotId
      })
    });
    if (response.status === 200 || response.status === 201 || response.status === 202) {
      return {
        kind: 'snapshot',
        snapshot: (await response.json()) as AnalysisSnapshot,
        created: response.status === 201 || response.status === 202
      };
    }
    const failure = await readFailure(response);
    return failure ? { kind: 'rejected', error: failure } : { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

export async function fetchCurrentPreLaunchAnalysisSnapshot(
  technicalAssignmentId: string,
  revision: number
): Promise<FetchAnalysisResult> {
  try {
    const query = new URLSearchParams({ revision: String(revision), analysis_kind: 'pre_launch' });
    const response = await fetch(
      `${API_BASE_URL}/api/v1/technical-assignments/${encodeURIComponent(technicalAssignmentId)}/analysis-snapshots/current?${query}`
    );
    if (response.status === 200) return { kind: 'snapshot', snapshot: (await response.json()) as AnalysisSnapshot };
    if (response.status === 404) return { kind: 'not_found' };
    const failure = await readFailure(response);
    return failure ? { kind: 'rejected', error: failure } : { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

/** Campaign detail (PRODUCT §15.3): the current post_launch_refresh
 * Snapshot for this Campaign, read the same way as the pre-launch current
 * read -- a 404 here means the durable worker has not created the initial
 * attempt yet (within its 15-minute SLA), not an error; the caller must
 * show a safe waiting state, never create a Snapshot from a GET. */
export async function fetchCurrentPostLaunchRefreshAnalysisSnapshot(
  technicalAssignmentId: string,
  revision: number,
  campaignId: string
): Promise<FetchAnalysisResult> {
  try {
    const query = new URLSearchParams({
      revision: String(revision),
      analysis_kind: 'post_launch_refresh',
      campaign_id: campaignId
    });
    const response = await fetch(
      `${API_BASE_URL}/api/v1/technical-assignments/${encodeURIComponent(technicalAssignmentId)}/analysis-snapshots/current?${query}`
    );
    if (response.status === 200) return { kind: 'snapshot', snapshot: (await response.json()) as AnalysisSnapshot };
    if (response.status === 404) return { kind: 'not_found' };
    const failure = await readFailure(response);
    return failure ? { kind: 'rejected', error: failure } : { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

/** Explicit user retry of a terminal failed+retryable post_launch_refresh
 * attempt only (PRODUCT §11.1/§15.3) -- the server rejects any other use of
 * this command for analysis_kind=post_launch_refresh (ANALYSIS_RETRY_NOT_ALLOWED
 * if there is no current attempt to retry). The caller owns idempotency-key
 * generation, exactly like createPreLaunchAnalysisSnapshot. */
export async function createPostLaunchRefreshRetry(
  idempotencyKey: string,
  technicalAssignmentId: string,
  expectedRevision: number,
  campaignId: string,
  retryOfAnalysisSnapshotId: string
): Promise<CreateAnalysisResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analysis-snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        technical_assignment_id: technicalAssignmentId,
        expected_revision: expectedRevision,
        analysis_kind: 'post_launch_refresh',
        campaign_id: campaignId,
        retry_of_analysis_snapshot_id: retryOfAnalysisSnapshotId
      })
    });
    if (response.status === 200 || response.status === 201 || response.status === 202) {
      return {
        kind: 'snapshot',
        snapshot: (await response.json()) as AnalysisSnapshot,
        created: response.status === 201 || response.status === 202
      };
    }
    const failure = await readFailure(response);
    return failure ? { kind: 'rejected', error: failure } : { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

export async function fetchAnalysisSnapshotById(analysisSnapshotId: string): Promise<FetchAnalysisResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analysis-snapshots/${encodeURIComponent(analysisSnapshotId)}`);
    if (response.status === 200) return { kind: 'snapshot', snapshot: (await response.json()) as AnalysisSnapshot };
    if (response.status === 404) return { kind: 'not_found' };
    const failure = await readFailure(response);
    return failure ? { kind: 'rejected', error: failure } : { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}
