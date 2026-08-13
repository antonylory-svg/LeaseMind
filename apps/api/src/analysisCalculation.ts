import { createHash } from 'node:crypto';
import type {
  AnalysisConfidence,
  AnalysisMetric,
  AnalysisResults,
  AnalysisScenario,
  AnalysisStatus,
  CandidateCategoriesValue,
  CompetitionValue,
  PriceAdequacyValue
} from './analysisTypes.js';

export function deriveAnalysisStatus(
  results: AnalysisResults
): Extract<AnalysisStatus, 'completed' | 'insufficient_data'> {
  return Object.values(results).some(metric => metric.metric_status === 'assessed')
    ? 'completed'
    : 'insufficient_data';
}

export type AnalysisSourceRow = Record<string, unknown>;

export interface AnalysisPreparation {
  inputFingerprint: string;
  evidenceDatasetRevision: string;
}

export interface SyntheticAnalysisInput {
  scenario: AnalysisScenario;
  subject: AnalysisSourceRow;
  properties: AnalysisSourceRow[];
  tenantRequests: AnalysisSourceRow[];
  evidenceDatasetRevision: string;
}

interface Rate {
  numerator: bigint;
  denominator: bigint;
  entityId: string;
}

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function normalizedText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.normalize('NFKC').trim().toLocaleLowerCase('und');
  return normalized.length > 0 ? normalized : null;
}

function normalizedArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizedText).filter((item): item is string => item !== null);
}

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, canonicalize(item)])
    );
  }
  if (typeof value === 'string') return value.normalize('NFKC').trim();
  return value;
}

function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

function timestamp(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  throw new Error('invalid evidence timestamp');
}

function positiveInteger(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error('invalid positive integer');
  return parsed;
}

function rowId(row: AnalysisSourceRow, scenario: AnalysisScenario): string {
  const value = scenario === 'need_tenant' ? row.property_id : row.tenant_request_id;
  if (typeof value !== 'string') throw new Error('invalid analysis source id');
  return value;
}

function isEligible(row: AnalysisSourceRow): boolean {
  return row.lifecycle_status === 'ready_for_analysis' || row.lifecycle_status === 'campaign_started';
}

export function computeAnalysisInputFingerprint(
  scenario: AnalysisScenario,
  subject: AnalysisSourceRow
): string {
  const fingerprintInput = Object.fromEntries(
    Object.entries(subject).filter(([key]) =>
      key !== 'idempotency_key'
      && !key.includes('exact_address')
      && !key.endsWith('additional_requirements')
    )
  );
  return sha256Hex(canonicalJson({ scenario, subject: fingerprintInput }));
}

export function prepareSyntheticAnalysis(
  scenario: AnalysisScenario,
  subject: AnalysisSourceRow,
  properties: AnalysisSourceRow[],
  tenantRequests: AnalysisSourceRow[]
): AnalysisPreparation {
  const evidenceRows = [
    ...properties.filter(isEligible).map(row => ({
      entity_type: 'Property',
      entity_id: rowId(row, 'need_tenant'),
      revision: positiveInteger(row.revision),
      updated_at: timestamp(row.updated_at)
    })),
    ...tenantRequests.filter(isEligible).map(row => ({
      entity_type: 'TenantRequest',
      entity_id: rowId(row, 'need_property'),
      revision: positiveInteger(row.revision),
      updated_at: timestamp(row.updated_at)
    }))
  ].sort((left, right) =>
    left.entity_type.localeCompare(right.entity_type)
    || left.entity_id.localeCompare(right.entity_id)
  );

  return {
    inputFingerprint: computeAnalysisInputFingerprint(scenario, subject),
    evidenceDatasetRevision: sha256Hex(canonicalJson(evidenceRows))
  };
}

function decimalToScaled(value: unknown, scale: number): bigint | null {
  if (value === null || value === undefined || value === '') return null;
  const raw = String(value).trim();
  const match = /^([0-9]+)(?:\.([0-9]+))?$/.exec(raw);
  if (!match) return null;
  const fraction = (match[2] ?? '').padEnd(scale, '0');
  if (fraction.length > scale && /[1-9]/.test(fraction.slice(scale))) return null;
  return BigInt(match[1]) * 10n ** BigInt(scale) + BigInt(fraction.slice(0, scale) || '0');
}

function propertyRate(row: AnalysisSourceRow): Rate | null {
  const rent = decimalToScaled(row.property_monthly_rent_rub, 0);
  const area = decimalToScaled(row.property_area_sqm, 2);
  if (rent === null || area === null || rent <= 0n || area <= 0n) return null;
  return {
    numerator: rent * 100n,
    denominator: area,
    entityId: typeof row.property_id === 'string' ? row.property_id : ''
  };
}

function tenantRequestRate(row: AnalysisSourceRow): { rate: Rate | null; basis: PriceAdequacyValue['rate_basis'] } {
  const explicitRate = decimalToScaled(row.request_monthly_rent_rate_max_rub_per_sqm, 2);
  if (explicitRate !== null && explicitRate > 0n) {
    return {
      rate: {
        numerator: explicitRate,
        denominator: 100n,
        entityId: typeof row.tenant_request_id === 'string' ? row.tenant_request_id : ''
      },
      basis: 'explicit_rate_cap'
    };
  }
  const budget = decimalToScaled(row.request_monthly_budget_max_rub, 0);
  const maximumArea = decimalToScaled(row.request_area_max_sqm, 2);
  if (budget === null || maximumArea === null || budget <= 0n || maximumArea <= 0n) {
    return { rate: null, basis: 'derived_budget_at_max_area' };
  }
  return {
    rate: {
      numerator: budget * 100n,
      denominator: maximumArea,
      entityId: typeof row.tenant_request_id === 'string' ? row.tenant_request_id : ''
    },
    basis: 'derived_budget_at_max_area'
  };
}

function compareRateValues(left: Rate, right: Rate): number {
  const compared = left.numerator * right.denominator - right.numerator * left.denominator;
  if (compared < 0n) return -1;
  if (compared > 0n) return 1;
  return 0;
}

function compareRates(left: Rate, right: Rate): number {
  const compared = compareRateValues(left, right);
  if (compared !== 0) return compared;
  return left.entityId.localeCompare(right.entityId);
}

function formatRate(rate: Rate): string {
  const scaled = (rate.numerator * 100n * 2n + rate.denominator) / (rate.denominator * 2n);
  const whole = scaled / 100n;
  const fraction = String(scaled % 100n).padStart(2, '0');
  return `${whole}.${fraction}`;
}

function confidence(sampleSize: number): Exclude<AnalysisConfidence, null> {
  if (sampleSize >= 20) return 'high';
  if (sampleSize >= 5) return 'medium';
  return 'low';
}

function sameText(left: unknown, right: unknown): boolean {
  const normalizedLeft = normalizedText(left);
  const normalizedRight = normalizedText(right);
  return normalizedLeft !== null && normalizedLeft === normalizedRight;
}

function includesText(values: unknown, candidate: unknown): boolean {
  const normalizedCandidate = normalizedText(candidate);
  return normalizedCandidate !== null && normalizedArray(values).includes(normalizedCandidate);
}

function arraysOverlap(left: unknown, right: unknown): boolean {
  const leftValues = normalizedArray(left);
  const rightValues = new Set(normalizedArray(right));
  return leftValues.some(value => rightValues.has(value));
}

function districtsCompatible(left: unknown, right: unknown): boolean {
  const leftValues = normalizedArray(left);
  const rightValues = normalizedArray(right);
  return leftValues.length === 0 || rightValues.length === 0 || arraysOverlap(leftValues, rightValues);
}

function booleanCompatible(left: unknown, right: unknown): boolean {
  return typeof left === 'boolean' && typeof right === 'boolean' && left === right;
}

function comparablePropertyForProperty(subject: AnalysisSourceRow, candidate: AnalysisSourceRow): boolean {
  const subjectArea = decimalToScaled(subject.property_area_sqm, 2);
  const candidateArea = decimalToScaled(candidate.property_area_sqm, 2);
  return isEligible(candidate)
    && candidate.property_id !== subject.property_id
    && sameText(candidate.property_country_code, subject.property_country_code)
    && sameText(candidate.property_region, subject.property_region)
    && sameText(candidate.property_city, subject.property_city)
    && sameText(candidate.property_type, subject.property_type)
    && subjectArea !== null && candidateArea !== null
    && candidateArea * 2n >= subjectArea && candidateArea <= subjectArea * 2n
    && booleanCompatible(candidate.property_operating_expenses_included, subject.property_operating_expenses_included)
    && districtsCompatible(candidate.property_districts, subject.property_districts);
}

function comparablePropertyForRequest(subject: AnalysisSourceRow, candidate: AnalysisSourceRow): boolean {
  const minimumArea = decimalToScaled(subject.request_area_min_sqm, 2);
  const maximumArea = decimalToScaled(subject.request_area_max_sqm, 2);
  const candidateArea = decimalToScaled(candidate.property_area_sqm, 2);
  return isEligible(candidate)
    && sameText(candidate.property_country_code, subject.request_country_code)
    && sameText(candidate.property_region, subject.request_region)
    && includesText(subject.request_cities, candidate.property_city)
    && includesText(subject.request_property_types, candidate.property_type)
    && minimumArea !== null && maximumArea !== null && candidateArea !== null
    && candidateArea >= minimumArea && candidateArea <= maximumArea
    && booleanCompatible(candidate.property_operating_expenses_included, subject.request_budget_includes_operating_expenses)
    && includesText(subject.request_condition_options, candidate.property_condition)
    && districtsCompatible(candidate.property_districts, subject.request_districts);
}

function comparableTenantDemand(subject: AnalysisSourceRow, candidate: AnalysisSourceRow): boolean {
  const subjectMin = decimalToScaled(subject.request_area_min_sqm, 2);
  const subjectMax = decimalToScaled(subject.request_area_max_sqm, 2);
  const candidateMin = decimalToScaled(candidate.request_area_min_sqm, 2);
  const candidateMax = decimalToScaled(candidate.request_area_max_sqm, 2);
  return isEligible(candidate)
    && candidate.tenant_request_id !== subject.tenant_request_id
    && sameText(candidate.request_country_code, subject.request_country_code)
    && sameText(candidate.request_region, subject.request_region)
    && arraysOverlap(candidate.request_cities, subject.request_cities)
    && arraysOverlap(candidate.request_property_types, subject.request_property_types)
    && sameText(candidate.request_business_category, subject.request_business_category)
    && subjectMin !== null && subjectMax !== null && candidateMin !== null && candidateMax !== null
    && subjectMin <= candidateMax && candidateMin <= subjectMax;
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false;
  return !Array.isArray(value) || value.length > 0;
}

function unsupportedFiltersPresent(scenario: AnalysisScenario, subject: AnalysisSourceRow): boolean {
  const fields = scenario === 'need_tenant'
    ? [
        'property_target_tenant_categories', 'property_power_kw', 'property_ceiling_height_m',
        'property_features', 'property_parking_spaces', 'property_loading_access',
        'property_access_mode', 'property_min_lease_months'
      ]
    : [
        'request_location_priorities', 'request_min_lease_months', 'request_power_min_kw',
        'request_ceiling_height_min_m', 'request_entrance_requirement', 'request_floor_options',
        'request_parking_min_spaces', 'request_loading_access_required', 'request_access_mode',
        'request_required_features', 'request_excluded_features'
      ];
  return fields.some(field => hasValue(subject[field]));
}

function assumptionsFor(scenario: AnalysisScenario, subject: AnalysisSourceRow): string[] {
  return unsupportedFiltersPresent(scenario, subject) ? ['UNSUPPORTED_FILTERS_PRESENT'] : [];
}

function assessedMetric<TValue extends Record<string, unknown>>(
  value: TValue,
  sampleSize: number,
  method: string,
  filters: string[],
  datasetRevision: string,
  assumptions: string[]
): AnalysisMetric<TValue> {
  return {
    metric_status: 'assessed',
    confidence: assumptions.length > 0 ? 'low' : confidence(sampleSize),
    value,
    sample_size: sampleSize,
    evidence: { method, filters_applied: filters, dataset_revision: datasetRevision },
    reason_codes: [],
    assumptions
  };
}

function insufficientMetric<TValue extends Record<string, unknown>>(
  sampleSize: number,
  method: string,
  filters: string[],
  datasetRevision: string,
  reasonCode: string,
  assumptions: string[] = []
): AnalysisMetric<TValue> {
  return {
    metric_status: 'insufficient_data',
    confidence: null,
    value: null,
    sample_size: sampleSize,
    evidence: { method, filters_applied: filters, dataset_revision: datasetRevision },
    reason_codes: [reasonCode],
    assumptions
  };
}

function categoryMetric(
  scenario: AnalysisScenario,
  subject: AnalysisSourceRow,
  comparableProperties: AnalysisSourceRow[],
  tenantRequests: AnalysisSourceRow[],
  datasetRevision: string,
  assumptions: string[]
): AnalysisMetric<CandidateCategoriesValue> {
  const counts = new Map<string, number>();
  const filters = scenario === 'need_tenant'
    ? ['same_country', 'same_region', 'requested_city', 'requested_property_type', 'area_compatible', 'budget_compatible', 'business_category_allowed']
    : ['same_country', 'same_region', 'requested_city', 'requested_property_type', 'area_within_requested_range', 'rate_cap_compatible', 'total_budget_compatible'];

  if (scenario === 'need_tenant') {
    const subjectRate = propertyRate(subject);
    const allowed = normalizedArray(subject.property_allowed_business_categories);
    const excluded = new Set(normalizedArray(subject.property_excluded_business_categories));
    const subjectRent = decimalToScaled(subject.property_monthly_rent_rub, 0);
    for (const request of tenantRequests.filter(isEligible)) {
      const category = normalizedText(request.request_business_category);
      const requestBudget = decimalToScaled(request.request_monthly_budget_max_rub, 0);
      const explicitRate = decimalToScaled(request.request_monthly_rent_rate_max_rub_per_sqm, 2);
      const explicitRateValue: Rate | null = explicitRate === null ? null : { numerator: explicitRate, denominator: 100n, entityId: '' };
      const compatible = category !== null
        && sameText(request.request_country_code, subject.property_country_code)
        && sameText(request.request_region, subject.property_region)
        && includesText(request.request_cities, subject.property_city)
        && includesText(request.request_property_types, subject.property_type)
        && decimalToScaled(request.request_area_min_sqm, 2) !== null
        && decimalToScaled(request.request_area_max_sqm, 2) !== null
        && decimalToScaled(subject.property_area_sqm, 2) !== null
        && decimalToScaled(subject.property_area_sqm, 2)! >= decimalToScaled(request.request_area_min_sqm, 2)!
        && decimalToScaled(subject.property_area_sqm, 2)! <= decimalToScaled(request.request_area_max_sqm, 2)!
        && subjectRent !== null && requestBudget !== null && requestBudget >= subjectRent
        && (explicitRateValue === null || (subjectRate !== null && compareRateValues(explicitRateValue, subjectRate) >= 0))
        && (allowed.includes('any_legal_business') || allowed.includes(category))
        && !excluded.has(category);
      if (compatible) counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  } else {
    const requestBudget = decimalToScaled(subject.request_monthly_budget_max_rub, 0);
    const explicitRate = decimalToScaled(subject.request_monthly_rent_rate_max_rub_per_sqm, 2);
    const explicitRateValue: Rate | null = explicitRate === null ? null : { numerator: explicitRate, denominator: 100n, entityId: '' };
    for (const property of comparableProperties) {
      const type = normalizedText(property.property_type);
      const rent = decimalToScaled(property.property_monthly_rent_rub, 0);
      const rate = propertyRate(property);
      const compatible = type !== null
        && rent !== null && requestBudget !== null && rent <= requestBudget
        && (explicitRateValue === null || (rate !== null && compareRateValues(rate, explicitRateValue) <= 0));
      if (compatible) counts.set(type, (counts.get(type) ?? 0) + 1);
    }
  }

  const items = [...counts.entries()]
    .sort(([leftCode, leftCount], [rightCode, rightCount]) => rightCount - leftCount || leftCode.localeCompare(rightCode))
    .slice(0, 3)
    .map(([code, compatible_count]) => ({ code, compatible_count }));
  const sampleSize = [...counts.values()].reduce((sum, count) => sum + count, 0);
  if (items.length === 0) {
    return insufficientMetric(
      sampleSize,
      'synthetic_ru_v1.compatible_category_aggregation',
      filters,
      datasetRevision,
      'NO_COMPATIBLE_SYNTHETIC_RECORDS',
      assumptions
    );
  }
  return assessedMetric(
    {
      category_kind: scenario === 'need_tenant' ? 'tenant_business_category' : 'property_type',
      items
    },
    sampleSize,
    'synthetic_ru_v1.compatible_category_aggregation',
    filters,
    datasetRevision,
    assumptions
  );
}

export function calculateSyntheticAnalysis(input: SyntheticAnalysisInput): AnalysisResults {
  const { scenario, subject, properties, tenantRequests, evidenceDatasetRevision } = input;
  const assumptions = assumptionsFor(scenario, subject);
  const comparableProperties = scenario === 'need_tenant'
    ? properties.filter(candidate => comparablePropertyForProperty(subject, candidate))
    : properties.filter(candidate => comparablePropertyForRequest(subject, candidate));

  const subjectRateResult = scenario === 'need_tenant'
    ? { rate: propertyRate(subject), basis: 'property_total_div_area' as const }
    : tenantRequestRate(subject);
  if (!subjectRateResult.rate) throw new Error('required structured rate input is missing');

  const referenceRates = comparableProperties
    .map(propertyRate)
    .filter((rate): rate is Rate => rate !== null)
    .sort(compareRates);

  const priceFilters = scenario === 'need_tenant'
    ? ['same_country', 'same_region', 'same_city', 'same_property_type', 'area_50_to_200_percent', 'operating_expenses_compatible', 'structured_district_overlap_when_present']
    : ['same_country', 'same_region', 'requested_city', 'requested_property_type', 'area_within_requested_range', 'operating_expenses_compatible', 'requested_condition', 'structured_district_overlap_when_present'];

  let priceAdequacy: AnalysisMetric<PriceAdequacyValue>;
  if (referenceRates.length < 5) {
    priceAdequacy = insufficientMetric(
      referenceRates.length,
      'synthetic_ru_v1.nearest_rank_rate_reference',
      priceFilters,
      evidenceDatasetRevision,
      'REFERENCE_SAMPLE_TOO_SMALL',
      assumptions
    );
  } else {
    const p25 = referenceRates[Math.ceil(referenceRates.length / 4) - 1];
    const median = referenceRates[Math.ceil(referenceRates.length / 2) - 1];
    const p75 = referenceRates[Math.ceil((referenceRates.length * 3) / 4) - 1];
    const classification = compareRateValues(subjectRateResult.rate, p25) < 0
      ? 'below_reference_range'
      : compareRateValues(subjectRateResult.rate, p75) > 0
        ? 'above_reference_range'
        : 'within_reference_range';
    priceAdequacy = assessedMetric(
      {
        subject_rate_rub_per_sqm_month: formatRate(subjectRateResult.rate),
        rate_basis: subjectRateResult.basis,
        p25_rub_per_sqm_month: formatRate(p25),
        median_rub_per_sqm_month: formatRate(median),
        p75_rub_per_sqm_month: formatRate(p75),
        classification
      },
      referenceRates.length,
      'synthetic_ru_v1.nearest_rank_rate_reference',
      priceFilters,
      evidenceDatasetRevision,
      assumptions
    );
  }

  const eligibleProperties = properties.filter(row => isEligible(row) && row.property_id !== subject.property_id);
  const eligibleTenantRequests = tenantRequests.filter(row => isEligible(row) && row.tenant_request_id !== subject.tenant_request_id);
  const competitionMatches = scenario === 'need_tenant'
    ? comparableProperties
    : eligibleTenantRequests.filter(candidate => comparableTenantDemand(subject, candidate));
  const competition = assessedMetric<CompetitionValue>(
    {
      comparable_count: competitionMatches.length,
      population_scanned: scenario === 'need_tenant' ? eligibleProperties.length : eligibleTenantRequests.length,
      comparison_side: scenario === 'need_tenant' ? 'property_supply' : 'tenant_demand'
    },
    competitionMatches.length,
    'synthetic_ru_v1.full_scan_comparable_count',
    scenario === 'need_tenant'
      ? priceFilters
      : ['same_country', 'same_region', 'city_overlap', 'property_type_overlap', 'area_range_overlap', 'business_category_match'],
    evidenceDatasetRevision,
    assumptions
  );

  const dealProbability = insufficientMetric(
    0,
    'synthetic_ru_v1.calibrated_outcome_history_gate',
    ['non_synthetic_terminal_outcome_history'],
    evidenceDatasetRevision,
    'CALIBRATED_OUTCOME_HISTORY_REQUIRED'
  );

  const candidateCategories = categoryMetric(
    scenario,
    subject,
    comparableProperties,
    tenantRequests,
    evidenceDatasetRevision,
    assumptions
  );

  return {
    price_adequacy: priceAdequacy,
    competition,
    deal_probability_30d: dealProbability,
    candidate_categories: candidateCategories
  };
}
