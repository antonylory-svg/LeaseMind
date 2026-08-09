import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseDecimalInput,
  formatDecimalForDisplay,
  resolveBooleanChoice,
  booleanChoiceFromValue,
  computeMissingRequiredFields,
  isReadyForAnalysis,
  computeTotalRentFromRate,
  computeRatePerSqmFromTotal,
  formatThousands,
  addStringArrayToken,
  removeStringArrayToken,
  splitStringArrayInput,
  hydrateDecimalState
} from '../src/technicalAssignmentFormLogic.js';
import { PROPERTY_FIELDS, TENANT_REQUEST_FIELDS, fieldsForScenario } from '../src/technicalAssignmentFields.js';

// Real backend bounds (apps/api/src/db/technicalAssignmentValidation.ts),
// mirrored here only for the test -- never invented independently.
const CEILING_HEIGHT_LIMITS = { min: 1.8, max: 30, decimals: 2 };
const POWER_KW_LIMITS = { min: 0, max: 10000, decimals: 2 };

test('parseDecimalInput: "3.5" and "3,5" both produce the numeric value 3.5', () => {
  assert.deepEqual(parseDecimalInput('3.5', CEILING_HEIGHT_LIMITS), { kind: 'value', value: 3.5 });
  assert.deepEqual(parseDecimalInput('3,5', CEILING_HEIGHT_LIMITS), { kind: 'value', value: 3.5 });
});

test('parseDecimalInput: empty input is "empty", not an error', () => {
  assert.deepEqual(parseDecimalInput('', CEILING_HEIGHT_LIMITS), { kind: 'empty' });
  assert.deepEqual(parseDecimalInput('   ', CEILING_HEIGHT_LIMITS), { kind: 'empty' });
});

test('parseDecimalInput: rejects letters', () => {
  assert.equal(parseDecimalInput('abc', CEILING_HEIGHT_LIMITS).kind, 'invalid');
  assert.equal(parseDecimalInput('3.5m', CEILING_HEIGHT_LIMITS).kind, 'invalid');
});

test('parseDecimalInput: rejects multiple separators', () => {
  assert.equal(parseDecimalInput('3.5.5', CEILING_HEIGHT_LIMITS).kind, 'invalid');
  assert.equal(parseDecimalInput('3,5,5', CEILING_HEIGHT_LIMITS).kind, 'invalid');
  assert.equal(parseDecimalInput('3.5,5', CEILING_HEIGHT_LIMITS).kind, 'invalid');
});

test('parseDecimalInput: rejects negative values (no sign accepted)', () => {
  assert.equal(parseDecimalInput('-3.5', CEILING_HEIGHT_LIMITS).kind, 'invalid');
});

test('parseDecimalInput: rejects zero and values below the real backend minimum (1.8 for ceiling height)', () => {
  assert.equal(parseDecimalInput('0', CEILING_HEIGHT_LIMITS).kind, 'invalid');
  assert.equal(parseDecimalInput('1', CEILING_HEIGHT_LIMITS).kind, 'invalid');
});

test('parseDecimalInput: rejects values above the real backend maximum', () => {
  assert.equal(parseDecimalInput('50', CEILING_HEIGHT_LIMITS).kind, 'invalid');
});

test('parseDecimalInput: rejects more fractional digits than the field allows', () => {
  assert.equal(parseDecimalInput('3.555', CEILING_HEIGHT_LIMITS).kind, 'invalid');
});

test('parseDecimalInput: does not invent a blanket "reject zero" rule -- 0 is valid where the real spec allows it (power_kw min is 0)', () => {
  assert.deepEqual(parseDecimalInput('0', POWER_KW_LIMITS), { kind: 'value', value: 0 });
});

test('formatDecimalForDisplay: renders the Russian comma convention', () => {
  assert.equal(formatDecimalForDisplay(3.5), '3,5');
  assert.equal(formatDecimalForDisplay(100), '100');
});

test('boolean tri-state: no answer stays unresolved (undefined), never silently false', () => {
  assert.equal(resolveBooleanChoice(null), undefined);
  assert.equal(booleanChoiceFromValue(undefined), null);
});

test('boolean tri-state: explicit "Да"/"Нет" resolve to true/false', () => {
  assert.equal(resolveBooleanChoice('yes'), true);
  assert.equal(resolveBooleanChoice('no'), false);
  assert.equal(booleanChoiceFromValue(true), 'yes');
  assert.equal(booleanChoiceFromValue(false), 'no');
});

test('computeMissingRequiredFields: an unanswered required boolean is reported as missing', () => {
  const payload: Record<string, unknown> = {
    property_type: 'office',
    property_country_code: 'RU',
    property_region: 'Синтетический регион',
    property_city: 'Синтетический город',
    property_area_sqm: 100,
    property_condition: 'ready_to_use',
    property_available_from: '2026-09-01',
    property_monthly_rent_rub: 150000,
    property_allowed_business_categories: ['office'],
    property_deal_priority: 'balanced'
    // property_operating_expenses_included and property_utilities_included intentionally absent
  };
  const missing = computeMissingRequiredFields(PROPERTY_FIELDS, payload);
  const missingIds = missing.map(f => f.fieldId).sort();
  assert.deepEqual(missingIds, ['property_operating_expenses_included', 'property_utilities_included']);
});

test('computeMissingRequiredFields: a full payload (including explicit false booleans) reports nothing missing, and the UI gate activates', () => {
  const payload: Record<string, unknown> = {
    property_type: 'office',
    property_country_code: 'RU',
    property_region: 'Синтетический регион',
    property_city: 'Синтетический город',
    property_area_sqm: 100,
    property_condition: 'ready_to_use',
    property_available_from: '2026-09-01',
    property_monthly_rent_rub: 150000,
    property_operating_expenses_included: false,
    property_utilities_included: true,
    property_allowed_business_categories: ['office'],
    property_deal_priority: 'balanced'
  };
  assert.deepEqual(computeMissingRequiredFields(PROPERTY_FIELDS, payload), []);
  assert.equal(isReadyForAnalysis('ready_for_analysis'), true);
  assert.equal(isReadyForAnalysis('draft'), false);
  assert.equal(isReadyForAnalysis(undefined), false);
});

// ---------------------------------------------------------------------------
// Rent display: "Ставка за м²" vs "Общая сумма" -- same underlying
// property_monthly_rent_rub, formulas fixed: total = rate * area, rate = total / area.
// ---------------------------------------------------------------------------

test('rent mode "Ставка за м²": rate x area produces the exact total rent, rounded to whole rubles', () => {
  // 4000 ₽/м²/мес x 100 м² = 400 000 ₽/мес
  assert.equal(computeTotalRentFromRate(4000, 100), 400000);
  assert.equal(formatThousands(computeTotalRentFromRate(4000, 100)), '400 000');
});

test('rent mode "Общая сумма": total / area produces the exact rate per sqm', () => {
  // 400 000 ₽/мес / 100 м² = 4000 ₽/м²/мес
  assert.equal(computeRatePerSqmFromTotal(400000, 100), 4000);
  assert.equal(formatThousands(computeRatePerSqmFromTotal(400000, 100)), '4 000');
});

test('rent formulas are exact inverses of each other for a round-trip value', () => {
  const rate = 4000;
  const area = 100;
  const total = computeTotalRentFromRate(rate, area);
  assert.equal(computeRatePerSqmFromTotal(total, area), rate);
});

test('tenant rate mode derives the backward-compatible total from the maximum requested area', () => {
  // 4 000 ₽/м²/мес x maximum 150 м² = 600 000 ₽/мес.
  const derivedBudget = computeTotalRentFromRate(4000, 150);
  assert.equal(derivedBudget, 600000);
  assert.equal(computeRatePerSqmFromTotal(derivedBudget, 150), 4000);
});

test('formatThousands: Russian thousands grouping with a non-breaking space', () => {
  assert.equal(formatThousands(400000), '400 000');
  assert.equal(formatThousands(4000), '4 000');
  assert.equal(formatThousands(999), '999');
});

test('rent rate input accepts both "4000" and "4000,50" via the shared decimal parser', () => {
  const RATE_LIMITS = { min: 1, max: 100000000, decimals: 2 };
  assert.deepEqual(parseDecimalInput('4000', RATE_LIMITS), { kind: 'value', value: 4000 });
  assert.deepEqual(parseDecimalInput('4000,5', RATE_LIMITS), { kind: 'value', value: 4000.5 });
  assert.equal(parseDecimalInput('4000abc', RATE_LIMITS).kind, 'invalid');
});

// ---------------------------------------------------------------------------
// Multi-value tag input (property_districts / request_districts / request_cities)
// ---------------------------------------------------------------------------

test('addStringArrayToken: adds a trimmed, non-empty, not-yet-present value', () => {
  assert.deepEqual(addStringArrayToken([], '  Центральный округ  '), ['Центральный округ']);
  assert.deepEqual(addStringArrayToken(['Центральный округ'], 'Северный округ'), ['Центральный округ', 'Северный округ']);
});

test('addStringArrayToken: never adds an empty (or whitespace-only) value', () => {
  assert.deepEqual(addStringArrayToken(['Центральный округ'], ''), ['Центральный округ']);
  assert.deepEqual(addStringArrayToken(['Центральный округ'], '   '), ['Центральный округ']);
});

test('addStringArrayToken: never adds an exact duplicate of an existing value', () => {
  assert.deepEqual(addStringArrayToken(['Центральный округ'], 'Центральный округ'), ['Центральный округ']);
  assert.deepEqual(addStringArrayToken(['Центральный округ'], '  Центральный округ  '), ['Центральный округ']);
});

test('removeStringArrayToken: removes exactly the matching value, leaves the rest and order intact', () => {
  assert.deepEqual(removeStringArrayToken(['A', 'B', 'C'], 'B'), ['A', 'C']);
  assert.deepEqual(removeStringArrayToken(['A'], 'not-present'), ['A']);
});

test('splitStringArrayInput: no comma yet -- still typing, values is null and nothing is committed', () => {
  const result = splitStringArrayInput(['Центральный округ'], 'Севе');
  assert.equal(result.values, null);
  assert.equal(result.draft, 'Севе');
});

test('splitStringArrayInput: a trailing comma commits the segment and clears the draft', () => {
  const result = splitStringArrayInput([], 'Центральный округ,');
  assert.deepEqual(result.values, ['Центральный округ']);
  assert.equal(result.draft, '');
});

test('splitStringArrayInput: multiple comma-separated segments in one paste all commit, remainder becomes the draft', () => {
  const result = splitStringArrayInput([], 'Центральный округ, Северный округ, Юго-За');
  assert.deepEqual(result.values, ['Центральный округ', 'Северный округ']);
  assert.equal(result.draft, ' Юго-За');
});

test('splitStringArrayInput: a duplicate segment is not added twice', () => {
  const result = splitStringArrayInput(['Центральный округ'], 'Центральный округ,Северный округ,');
  assert.deepEqual(result.values, ['Центральный округ', 'Северный округ']);
});

// ---------------------------------------------------------------------------
// Restore after reload / return to an old tab (Sprint 4 defect 1)
// ---------------------------------------------------------------------------

test('fieldsForScenario: need_tenant maps to PROPERTY_FIELDS, need_property maps to TENANT_REQUEST_FIELDS', () => {
  assert.equal(fieldsForScenario('need_tenant'), PROPERTY_FIELDS);
  assert.equal(fieldsForScenario('need_property'), TENANT_REQUEST_FIELDS);
});

test('hydrateDecimalState: rebuilds rawText (Russian comma) for decimal fields present in the payload', () => {
  const result = hydrateDecimalState(PROPERTY_FIELDS, { property_area_sqm: 120.5, property_ceiling_height_m: 3.5 });
  assert.deepEqual(result.property_area_sqm, { rawText: '120,5', invalid: false, touched: true });
  assert.deepEqual(result.property_ceiling_height_m, { rawText: '3,5', invalid: false, touched: true });
});

test('hydrateDecimalState: a decimal field absent from the payload is omitted, not defaulted to 0', () => {
  const result = hydrateDecimalState(PROPERTY_FIELDS, { property_area_sqm: 100 });
  assert.ok(!('property_ceiling_height_m' in result));
  assert.ok(!('property_power_kw' in result));
});

test('hydrateDecimalState: non-decimal fields in the payload are ignored', () => {
  const result = hydrateDecimalState(PROPERTY_FIELDS, { property_area_sqm: 100, property_type: 'office', property_floor: 2 });
  assert.deepEqual(Object.keys(result), ['property_area_sqm']);
});
