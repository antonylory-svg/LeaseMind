import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSyntheticAnalysis,
  computeAnalysisInputFingerprint,
  deriveAnalysisStatus,
  prepareSyntheticAnalysis,
  type AnalysisSourceRow
} from '../src/analysisCalculation.js';

const BASE_TIME = new Date('2026-08-11T00:00:00.000Z');

function property(index: number, rate: number, overrides: AnalysisSourceRow = {}): AnalysisSourceRow {
  return {
    property_id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    revision: 1,
    lifecycle_status: 'ready_for_analysis',
    created_at: BASE_TIME,
    updated_at: BASE_TIME,
    property_type: 'office',
    property_country_code: 'RU',
    property_region: 'Synthetic Region',
    property_city: 'Synthetic City',
    property_districts: [],
    property_area_sqm: '100.00',
    property_condition: 'ready_to_use',
    property_monthly_rent_rub: rate * 100,
    property_operating_expenses_included: true,
    property_allowed_business_categories: ['office'],
    property_excluded_business_categories: [],
    ...overrides
  };
}

function tenantRequest(index: number, overrides: AnalysisSourceRow = {}): AnalysisSourceRow {
  return {
    tenant_request_id: `10000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    revision: 1,
    lifecycle_status: 'ready_for_analysis',
    created_at: BASE_TIME,
    updated_at: BASE_TIME,
    request_business_category: 'office',
    request_country_code: 'RU',
    request_region: 'Synthetic Region',
    request_cities: ['Synthetic City'],
    request_districts: [],
    request_property_types: ['office'],
    request_area_min_sqm: '50.00',
    request_area_max_sqm: '150.00',
    request_monthly_budget_max_rub: 250000,
    request_monthly_rent_rate_max_rub_per_sqm: null,
    request_budget_includes_operating_expenses: true,
    request_condition_options: ['ready_to_use'],
    ...overrides
  };
}

test('synthetic_ru_v1 Property analysis uses exact rates, nearest-rank percentiles and honest probability gating', () => {
  const subject = property(1, 1500);
  const properties = [subject, property(2, 1000), property(3, 1200), property(4, 1500), property(5, 1800), property(6, 2000)];
  const tenantRequests = [tenantRequest(1)];
  const preparation = prepareSyntheticAnalysis('need_tenant', subject, properties, tenantRequests);
  const results = calculateSyntheticAnalysis({
    scenario: 'need_tenant',
    subject,
    properties,
    tenantRequests,
    evidenceDatasetRevision: preparation.evidenceDatasetRevision
  });

  assert.equal(results.price_adequacy.metric_status, 'assessed');
  assert.deepEqual(results.price_adequacy.value, {
    subject_rate_rub_per_sqm_month: '1500.00',
    rate_basis: 'property_total_div_area',
    p25_rub_per_sqm_month: '1200.00',
    median_rub_per_sqm_month: '1500.00',
    p75_rub_per_sqm_month: '1800.00',
    classification: 'within_reference_range'
  });
  assert.equal(results.price_adequacy.sample_size, 5);
  assert.equal(results.price_adequacy.confidence, 'medium');
  assert.deepEqual(results.competition.value, {
    comparable_count: 5,
    population_scanned: 5,
    comparison_side: 'property_supply'
  });
  assert.equal(results.deal_probability_30d.metric_status, 'insufficient_data');
  assert.equal(results.deal_probability_30d.value, null);
  assert.deepEqual(results.deal_probability_30d.reason_codes, ['CALIBRATED_OUTCOME_HISTORY_REQUIRED']);
  assert.deepEqual(results.candidate_categories.value, {
    category_kind: 'tenant_business_category',
    items: [{ code: 'office', compatible_count: 1 }]
  });
});

test('TenantRequest analysis preserves explicit rate basis and stable category ordering', () => {
  const subject = tenantRequest(1, { request_monthly_rent_rate_max_rub_per_sqm: '1600.00' });
  const properties = [
    property(1, 1000), property(2, 1200), property(3, 1400),
    property(4, 1500, { property_type: 'retail_unit' }),
    property(5, 1600), property(6, 1800)
  ];
  const tenantRequests = [subject, tenantRequest(2), tenantRequest(3)];
  const preparation = prepareSyntheticAnalysis('need_property', subject, properties, tenantRequests);
  const results = calculateSyntheticAnalysis({
    scenario: 'need_property',
    subject,
    properties,
    tenantRequests,
    evidenceDatasetRevision: preparation.evidenceDatasetRevision
  });

  assert.equal(results.price_adequacy.metric_status, 'assessed');
  assert.equal(results.price_adequacy.value?.rate_basis, 'explicit_rate_cap');
  assert.equal(results.price_adequacy.value?.subject_rate_rub_per_sqm_month, '1600.00');
  assert.deepEqual(results.competition.value, {
    comparable_count: 2,
    population_scanned: 2,
    comparison_side: 'tenant_demand'
  });
  assert.deepEqual(results.candidate_categories.value, {
    category_kind: 'property_type',
    items: [{ code: 'office', compatible_count: 4 }]
  });
});

test('AS-C-007: derived TenantRequest rate uses budget/area_max and never writes back', () => {
  const subject = tenantRequest(1, {
    request_monthly_budget_max_rub: 240000,
    request_area_max_sqm: '120.00',
    request_monthly_rent_rate_max_rub_per_sqm: null
  });
  const properties = [
    property(1, 1500), property(2, 1600), property(3, 1700),
    property(4, 1800), property(5, 1900)
  ];
  const preparation = prepareSyntheticAnalysis('need_property', subject, properties, [subject]);
  const results = calculateSyntheticAnalysis({
    scenario: 'need_property',
    subject,
    properties,
    tenantRequests: [subject],
    evidenceDatasetRevision: preparation.evidenceDatasetRevision
  });

  assert.equal(results.price_adequacy.metric_status, 'assessed');
  assert.equal(results.price_adequacy.value?.subject_rate_rub_per_sqm_month, '2000.00');
  assert.equal(results.price_adequacy.value?.rate_basis, 'derived_budget_at_max_area');
  assert.equal(subject.request_monthly_rent_rate_max_rub_per_sqm, null);
});

test('AS-C-008/009: a small price sample is insufficient while zero competition is assessed', () => {
  const subject = tenantRequest(1, {
    request_monthly_budget_max_rub: 240000,
    request_area_max_sqm: '120.00',
    request_monthly_rent_rate_max_rub_per_sqm: null
  });
  const properties = [property(1, 1500), property(2, 1600), property(3, 1700), property(4, 1800)];
  const preparation = prepareSyntheticAnalysis('need_property', subject, properties, [subject]);
  const results = calculateSyntheticAnalysis({
    scenario: 'need_property',
    subject,
    properties,
    tenantRequests: [subject],
    evidenceDatasetRevision: preparation.evidenceDatasetRevision
  });

  assert.equal(results.price_adequacy.metric_status, 'insufficient_data');
  assert.equal(results.price_adequacy.value, null);
  assert.deepEqual(results.price_adequacy.reason_codes, ['REFERENCE_SAMPLE_TOO_SMALL']);
  assert.equal(results.competition.metric_status, 'assessed');
  assert.equal(results.competition.value?.comparable_count, 0);
  assert.equal(results.competition.value?.population_scanned, 0);
  assert.equal(subject.request_monthly_rent_rate_max_rub_per_sqm, null);
});

test('AS-C-011: tied candidate category counts are ordered by enum code', () => {
  const subject = tenantRequest(1, {
    request_property_types: ['warehouse', 'retail_unit', 'office']
  });
  const properties = [
    property(1, 1000, { property_type: 'warehouse' }),
    property(2, 1100, { property_type: 'office' }),
    property(3, 1200, { property_type: 'retail_unit' }),
    property(4, 1300, { property_type: 'warehouse' }),
    property(5, 1400, { property_type: 'office' }),
    property(6, 1500, { property_type: 'retail_unit' })
  ];
  const preparation = prepareSyntheticAnalysis('need_property', subject, properties, [subject]);
  const results = calculateSyntheticAnalysis({
    scenario: 'need_property',
    subject,
    properties,
    tenantRequests: [subject],
    evidenceDatasetRevision: preparation.evidenceDatasetRevision
  });

  assert.deepEqual(results.candidate_categories.value?.items, [
    { code: 'office', compatible_count: 2 },
    { code: 'retail_unit', compatible_count: 2 },
    { code: 'warehouse', compatible_count: 2 }
  ]);
});

test('AS-C-013: an otherwise successful result with no assessed metrics has insufficient_data status', () => {
  const subject = tenantRequest(1);
  const preparation = prepareSyntheticAnalysis('need_property', subject, [], [subject]);
  const results = calculateSyntheticAnalysis({
    scenario: 'need_property',
    subject,
    properties: [],
    tenantRequests: [subject],
    evidenceDatasetRevision: preparation.evidenceDatasetRevision
  });
  const allInsufficient = Object.fromEntries(
    Object.entries(results).map(([name, metric]) => [name, {
      ...metric,
      metric_status: 'insufficient_data',
      confidence: null,
      value: null
    }])
  ) as typeof results;

  assert.equal(deriveAnalysisStatus(allInsufficient), 'insufficient_data');
  assert.equal(deriveAnalysisStatus(results), 'completed');
});

test('input fingerprint excludes protected/free-text values and evidence revision is independent of row order', () => {
  const subject = property(1, 1500, {
    property_exact_address: 'Protected address A',
    property_additional_requirements: 'Free text A'
  });
  const changedProtectedValues = {
    ...subject,
    property_exact_address: 'Protected address B',
    property_additional_requirements: 'Free text B'
  };
  assert.equal(
    computeAnalysisInputFingerprint('need_tenant', subject),
    computeAnalysisInputFingerprint('need_tenant', changedProtectedValues)
  );

  const properties = [subject, property(2, 1200)];
  const requests = [tenantRequest(1), tenantRequest(2)];
  const forward = prepareSyntheticAnalysis('need_tenant', subject, properties, requests);
  const reversed = prepareSyntheticAnalysis('need_tenant', subject, [...properties].reverse(), [...requests].reverse());
  assert.equal(forward.evidenceDatasetRevision, reversed.evidenceDatasetRevision);
  assert.match(forward.evidenceDatasetRevision, /^[0-9a-f]{64}$/);
});
