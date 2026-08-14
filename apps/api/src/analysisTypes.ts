export const ANALYSIS_SCHEMA_VERSION = '1.0' as const;
export const ANALYSIS_METHOD_VERSION = 'synthetic_ru_v1' as const;

export type AnalysisKind = 'pre_launch' | 'post_launch_refresh';
export type AnalysisScenario = 'need_tenant' | 'need_property';
export type AnalysisStatus = 'pending' | 'completed' | 'insufficient_data' | 'failed';
export type AnalysisFreshnessStatus = 'current' | 'stale';
export type AnalysisFreshnessReason = 'revision_changed' | 'campaign_mismatch' | 'evidence_revoked' | null;
export type AnalysisConfidence = 'low' | 'medium' | 'high' | null;
export type AnalysisMetricStatus = 'assessed' | 'insufficient_data';

export interface AnalysisMetricEvidence {
  method: string;
  filters_applied: string[];
  dataset_revision: string | null;
}

export interface AnalysisMetric<TValue extends Record<string, unknown> = Record<string, unknown>> {
  metric_status: AnalysisMetricStatus;
  confidence: AnalysisConfidence;
  value: TValue | null;
  sample_size: number;
  evidence: AnalysisMetricEvidence;
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

export interface AnalysisFailure {
  code: 'ANALYSIS_DATASET_UNAVAILABLE' | 'ANALYSIS_GENERATION_FAILED';
  retryable: boolean;
}

export interface AnalysisSnapshotEnvelope {
  schema_version: typeof ANALYSIS_SCHEMA_VERSION;
  analysis_snapshot_id: string;
  technical_assignment_id: string;
  source_revision: number;
  scenario: AnalysisScenario;
  analysis_kind: AnalysisKind;
  campaign_id: string | null;
  calculation_attempt: number;
  status: AnalysisStatus;
  freshness_status: AnalysisFreshnessStatus;
  freshness_reason: AnalysisFreshnessReason;
  method_version: typeof ANALYSIS_METHOD_VERSION;
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
  failure: AnalysisFailure | null;
  results: AnalysisResults | null;
}

export const ANALYSIS_ERROR_CODES = [
  'ANALYSIS_SNAPSHOT_NOT_FOUND',
  'ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_FOUND',
  'ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_READY',
  'ANALYSIS_REVISION_CONFLICT',
  'ANALYSIS_KIND_INVALID',
  'ANALYSIS_CAMPAIGN_REQUIRED',
  'ANALYSIS_CAMPAIGN_MISMATCH',
  'ANALYSIS_MARKET_UNSUPPORTED',
  'ANALYSIS_DATASET_UNAVAILABLE',
  'ANALYSIS_GENERATION_FAILED',
  'ANALYSIS_IDEMPOTENCY_CONFLICT',
  'ANALYSIS_RETRY_NOT_ALLOWED',
  'ANALYSIS_RETRY_TARGET_MISMATCH'
] as const;

export type AnalysisErrorCode = (typeof ANALYSIS_ERROR_CODES)[number];

const SAFE_MESSAGES: Record<AnalysisErrorCode, string> = {
  ANALYSIS_SNAPSHOT_NOT_FOUND: 'Analysis Snapshot was not found.',
  ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_FOUND: 'Technical Assignment was not found.',
  ANALYSIS_TECHNICAL_ASSIGNMENT_NOT_READY: 'Technical Assignment is not ready for Analysis.',
  ANALYSIS_REVISION_CONFLICT: 'Technical Assignment revision has changed.',
  ANALYSIS_KIND_INVALID: 'Analysis kind and Campaign reference are inconsistent.',
  ANALYSIS_CAMPAIGN_REQUIRED: 'Campaign is required for post-launch Analysis.',
  ANALYSIS_CAMPAIGN_MISMATCH: 'Campaign does not match the Technical Assignment revision.',
  ANALYSIS_MARKET_UNSUPPORTED: 'No approved Analysis method exists for this market.',
  ANALYSIS_DATASET_UNAVAILABLE: 'The Analysis evidence dataset is temporarily unavailable.',
  ANALYSIS_GENERATION_FAILED: 'Analysis generation failed safely.',
  ANALYSIS_IDEMPOTENCY_CONFLICT: 'Idempotency key was already used for another Analysis command.',
  ANALYSIS_RETRY_NOT_ALLOWED: 'A new Analysis attempt is not allowed for the current state.',
  ANALYSIS_RETRY_TARGET_MISMATCH: 'Analysis retry target does not match the current failed attempt.'
};

export class AnalysisRequestError extends Error {
  constructor(
    readonly code: AnalysisErrorCode,
    readonly httpStatus: 400 | 404 | 409 | 503,
    readonly retryable: boolean
  ) {
    super(SAFE_MESSAGES[code]);
    this.name = 'AnalysisRequestError';
  }
}

export interface AnalysisErrorResponse {
  code: AnalysisErrorCode;
  message: string;
  request_id: string;
  retryable: boolean;
}
