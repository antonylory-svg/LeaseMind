import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  explainTechnicalAssignmentError,
  explainMissingRequiredField
} from '../src/technicalAssignmentErrorMessages.js';
import { PROPERTY_FIELDS, TENANT_REQUEST_FIELDS } from '../src/technicalAssignmentFields.js';

const ALL_FIELDS = [...PROPERTY_FIELDS, ...TENANT_REQUEST_FIELDS];

// Every raw field_id and every TECHNICAL_ASSIGNMENT_* error code that can
// ever reach the frontend (apps/api/src/db/technicalAssignmentValidation.ts,
// apps/api/src/db/technicalAssignment.ts) -- used to assert none of them
// ever leaks into a user-facing message.
const ALL_FIELD_IDS = ALL_FIELDS.map(f => f.fieldId);
const ALL_CODES = [
  'TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING',
  'TECHNICAL_ASSIGNMENT_FIELD_TYPE_INVALID',
  'TECHNICAL_ASSIGNMENT_FIELD_VALUE_INVALID',
  'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
  'TECHNICAL_ASSIGNMENT_PERSONAL_DATA_FORBIDDEN',
  'TECHNICAL_ASSIGNMENT_SECRET_FORBIDDEN',
  'TECHNICAL_ASSIGNMENT_SCENARIO_IMMUTABLE',
  'TECHNICAL_ASSIGNMENT_STATE_INVALID'
];

function assertNoTechnicalLeak(message: string) {
  for (const code of ALL_CODES) {
    assert.ok(!message.includes(code), `message leaked error code ${code}: "${message}"`);
  }
  for (const fieldId of ALL_FIELD_IDS) {
    assert.ok(!message.includes(fieldId), `message leaked field_id ${fieldId}: "${message}"`);
  }
}

// --- The exact bug reported: any_legal_business combined with other allowed categories ---

test('the reported bug: any_legal_business + other allowed categories gets a specific Russian explanation, no raw field_id/code', () => {
  const payload = {
    property_allowed_business_categories: ['any_legal_business', 'cafe'],
    property_excluded_business_categories: [],
    property_target_tenant_categories: []
  };
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'property_allowed_business_categories',
    payload,
    PROPERTY_FIELDS
  );
  assert.match(result.message, /Любой законный вид деятельности/);
  assert.match(result.message, /Кафе/);
  assert.deepEqual(result.highlightFieldIds, ['property_allowed_business_categories']);
  assertNoTechnicalLeak(result.message);
});

test('any_legal_business + non-empty excluded categories names the excluded categories and highlights both fields', () => {
  const payload = {
    property_allowed_business_categories: ['any_legal_business'],
    property_excluded_business_categories: ['pharmacy'],
    property_target_tenant_categories: []
  };
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'property_allowed_business_categories',
    payload,
    PROPERTY_FIELDS
  );
  assert.match(result.message, /Аптека/);
  assert.deepEqual(result.highlightFieldIds.sort(), ['property_allowed_business_categories', 'property_excluded_business_categories'].sort());
  assertNoTechnicalLeak(result.message);
});

// 2026-08-03 fix: any_legal_business + a non-empty, non-conflicting target
// is now VALID (the wildcard covers every preferred category) -- this is no
// longer an error case. The `property_allowed_business_categories` conflict
// message must not mention target categories as a reason on their own
// anymore, only allowed/excluded ones.
test('the any_legal_business conflict message never blames target/preferred categories on their own (wildcard now covers them)', () => {
  const payload = {
    property_allowed_business_categories: ['any_legal_business'],
    property_excluded_business_categories: ['pharmacy'],
    property_target_tenant_categories: ['fitness']
  };
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'property_allowed_business_categories',
    payload,
    PROPERTY_FIELDS
  );
  assert.match(result.message, /Аптека/);
  assert.ok(!/Фитнес/.test(result.message), 'target categories must not be cited as a reason any_legal_business conflicts');
  assert.deepEqual(result.highlightFieldIds.sort(), ['property_allowed_business_categories', 'property_excluded_business_categories'].sort());
  assertNoTechnicalLeak(result.message);
});

// --- Allowed/excluded overlap ---

test('a category present in both allowed and excluded names that category and highlights both fields', () => {
  const payload = {
    property_allowed_business_categories: ['cafe', 'restaurant'],
    property_excluded_business_categories: ['restaurant']
  };
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'property_excluded_business_categories',
    payload,
    PROPERTY_FIELDS
  );
  assert.match(result.message, /Ресторан/);
  assert.deepEqual(result.highlightFieldIds.sort(), ['property_allowed_business_categories', 'property_excluded_business_categories'].sort());
  assertNoTechnicalLeak(result.message);
});

// --- Target not subset of allowed ---

test('a preferred tenant category outside the allowed list names that category and highlights both fields', () => {
  const payload = {
    property_allowed_business_categories: ['cafe'],
    property_target_tenant_categories: ['medical']
  };
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'property_target_tenant_categories',
    payload,
    PROPERTY_FIELDS
  );
  assert.match(result.message, /Медицина/);
  assert.deepEqual(result.highlightFieldIds.sort(), ['property_allowed_business_categories', 'property_target_tenant_categories'].sort());
  assertNoTechnicalLeak(result.message);
});

// --- "*_other" conditional fields (shared pattern, both directions, both scenarios) ---

test('"other" selected but the *_other field is empty asks to fill it in', () => {
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_REQUIRED_FIELD_MISSING',
    'property_business_category_other',
    {},
    PROPERTY_FIELDS
  );
  assert.match(result.message, /Иное/);
  assert.deepEqual(result.highlightFieldIds, ['property_business_category_other']);
  assertNoTechnicalLeak(result.message);
});

test('*_other field filled in without "other" selected asks to reconcile the two', () => {
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'request_property_type_other',
    {},
    TENANT_REQUEST_FIELDS
  );
  assert.match(result.message, /Иное/);
  assert.deepEqual(result.highlightFieldIds, ['request_property_type_other']);
  assertNoTechnicalLeak(result.message);
});

// --- Land-type conflict ---

test('a floor/height/entrance value set on a land-type object explains the land-type rule', () => {
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'property_ceiling_height_m',
    { property_type: 'land' },
    PROPERTY_FIELDS
  );
  assert.match(result.message, /земельного участка/);
  assert.ok(result.highlightFieldIds.includes('property_ceiling_height_m'));
  assertNoTechnicalLeak(result.message);
});

// --- floor > total_floors ---

test('floor above total floors names both numbers (property_type not land)', () => {
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'property_floor',
    { property_floor: 12, property_total_floors: 5 },
    PROPERTY_FIELDS
  );
  assert.match(result.message, /12/);
  assert.match(result.message, /5/);
  assert.deepEqual(result.highlightFieldIds.sort(), ['property_floor', 'property_total_floors'].sort());
  assertNoTechnicalLeak(result.message);
});

test('property_floor on a land-type object is explained as the land-type rule, not floor>total_floors (backend evaluates the land loop first)', () => {
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'property_floor',
    { property_type: 'land', property_floor: 12, property_total_floors: 5 },
    PROPERTY_FIELDS
  );
  assert.match(result.message, /земельного участка/);
  assert.ok(!/этажности здания/.test(result.message), 'should not use the floor>total_floors wording for a land-type object');
  assertNoTechnicalLeak(result.message);
});

// --- features conflicts ---

test('parking feature checked with zero parking spaces explains the specific conflict', () => {
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'property_features',
    { property_features: ['parking'], property_parking_spaces: 0 },
    PROPERTY_FIELDS
  );
  assert.match(result.message, /Парковка/);
  assert.deepEqual(result.highlightFieldIds.sort(), ['property_features', 'property_parking_spaces'].sort());
  assertNoTechnicalLeak(result.message);
});

test('loading_zone feature checked with loading_access=none explains the specific conflict', () => {
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'property_features',
    { property_features: ['loading_zone'], property_loading_access: 'none' },
    PROPERTY_FIELDS
  );
  assert.match(result.message, /огрузк/);
  assert.deepEqual(result.highlightFieldIds.sort(), ['property_features', 'property_loading_access'].sort());
  assertNoTechnicalLeak(result.message);
});

// --- TenantRequest cross-field rules ---

test('minimum area above maximum area names both numbers', () => {
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'request_area_min_sqm',
    { request_area_min_sqm: 200, request_area_max_sqm: 100 },
    TENANT_REQUEST_FIELDS
  );
  assert.match(result.message, /200/);
  assert.match(result.message, /100/);
  assert.deepEqual(result.highlightFieldIds.sort(), ['request_area_min_sqm', 'request_area_max_sqm'].sort());
  assertNoTechnicalLeak(result.message);
});

test('a feature required and excluded at the same time names that feature', () => {
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'request_excluded_features',
    { request_required_features: ['elevator'], request_excluded_features: ['elevator'] },
    TENANT_REQUEST_FIELDS
  );
  assert.match(result.message, /Лифт/);
  assert.deepEqual(result.highlightFieldIds.sort(), ['request_required_features', 'request_excluded_features'].sort());
  assertNoTechnicalLeak(result.message);
});

test('"any" floor option combined with other floor options explains the rule', () => {
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'request_floor_options',
    { request_floor_options: ['any', 'ground'] },
    TENANT_REQUEST_FIELDS
  );
  assert.match(result.message, /Любой этаж/);
  assert.deepEqual(result.highlightFieldIds, ['request_floor_options']);
  assertNoTechnicalLeak(result.message);
});

test('request_business_category = any_legal_business explains it is not allowed for a tenant search', () => {
  const result = explainTechnicalAssignmentError(
    'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT',
    'request_business_category',
    { request_business_category: 'any_legal_business' },
    TENANT_REQUEST_FIELDS
  );
  assert.match(result.message, /Любой законный вид деятельности/);
  assert.deepEqual(result.highlightFieldIds, ['request_business_category']);
  assertNoTechnicalLeak(result.message);
});

// --- Scenario-level errors (no field_id) ---

test('scenario-immutable and state-invalid produce field-less, technical-free messages', () => {
  const immutable = explainTechnicalAssignmentError('TECHNICAL_ASSIGNMENT_SCENARIO_IMMUTABLE', null, {}, PROPERTY_FIELDS);
  const stateInvalid = explainTechnicalAssignmentError('TECHNICAL_ASSIGNMENT_STATE_INVALID', null, {}, PROPERTY_FIELDS);
  assert.deepEqual(immutable.highlightFieldIds, []);
  assert.deepEqual(stateInvalid.highlightFieldIds, []);
  assertNoTechnicalLeak(immutable.message);
  assertNoTechnicalLeak(stateInvalid.message);
});

// --- Generic fallbacks for codes without a field-specific handler ---

test('generic fallback codes (invalid value, forbidden data, secret) stay technical-free and name the field label', () => {
  for (const code of [
    'TECHNICAL_ASSIGNMENT_FIELD_VALUE_INVALID',
    'TECHNICAL_ASSIGNMENT_FIELD_TYPE_INVALID',
    'TECHNICAL_ASSIGNMENT_PERSONAL_DATA_FORBIDDEN',
    'TECHNICAL_ASSIGNMENT_SECRET_FORBIDDEN'
  ]) {
    const result = explainTechnicalAssignmentError(code, 'property_additional_requirements', {}, PROPERTY_FIELDS);
    assert.match(result.message, /Дополнительные коммерческие условия/);
    assertNoTechnicalLeak(result.message);
  }
});

// --- Every field/code combination that can realistically occur stays technical-free ---

test('every (code, field_id) pair this module knows how to explain never leaks the raw field_id or code', () => {
  const payload = {
    property_allowed_business_categories: ['any_legal_business'],
    property_excluded_business_categories: ['cafe'],
    property_target_tenant_categories: ['cafe'],
    property_floor: 10,
    property_total_floors: 3,
    property_features: ['parking', 'loading_zone'],
    property_parking_spaces: 0,
    property_loading_access: 'none',
    property_type: 'land',
    request_area_min_sqm: 100,
    request_area_max_sqm: 50,
    request_required_features: ['elevator'],
    request_excluded_features: ['elevator'],
    request_floor_options: ['any', 'ground'],
    request_business_category: 'any_legal_business'
  };
  for (const fieldId of ALL_FIELD_IDS) {
    for (const code of ALL_CODES) {
      const fields = fieldId.startsWith('request_') ? TENANT_REQUEST_FIELDS : PROPERTY_FIELDS;
      const result = explainTechnicalAssignmentError(code, fieldId, payload, fields);
      assertNoTechnicalLeak(result.message);
    }
  }
});

// --- Missing-required-field messaging ---

test('explainMissingRequiredField gives the exact requested wording for property_allowed_business_categories', () => {
  assert.equal(
    explainMissingRequiredField('property_allowed_business_categories', 'Допустимые категории деятельности'),
    'Укажите хотя бы одну допустимую категорию арендатора.'
  );
});

test('explainMissingRequiredField falls back to the plain label for every other field', () => {
  assert.equal(explainMissingRequiredField('property_city', 'Город'), 'Город');
});

// --- Form data preserved after a save error (regression guard) ---
// No React DOM renderer is set up in this project's test suite; this
// verifies the actual guarantee ("form data preserved") the only way
// possible without one: handleSaveDraft's response-handling branches
// (success/invalid/network-error, everything after the save request is
// sent) must never call setFormValues, since that is the only state setter
// that could discard what the user typed. Before the request is sent,
// handleSaveDraft does call setFormValues once, to flush an uncommitted
// tag-input token (property_districts/request_districts/request_cities)
// into the outgoing payload -- that call only ever adds to formValues, is
// unconditional (not inside any failure branch), and runs before the
// network call even starts, so it cannot be part of a "failed save wiped my
// input" scenario. Scoping the assertion to the post-request portion of the
// body keeps the guard precise instead of banning the identifier outright.

test('handleSaveDraft never calls setFormValues in its response-handling branches (success/invalid/error)', () => {
  const source = readFileSync(fileURLToPath(new URL('../src/CampaignLaunchWizard.tsx', import.meta.url)), 'utf8');
  const start = source.indexOf('const handleSaveDraft = async () => {');
  assert.ok(start >= 0, 'handleSaveDraft not found in CampaignLaunchWizard.tsx');
  const end = source.indexOf('\n  };', start);
  assert.ok(end > start, 'could not find the end of handleSaveDraft');
  const body = source.slice(start, end);
  const awaitIndex = body.indexOf('await saveTechnicalAssignmentDraft(');
  assert.ok(awaitIndex >= 0, 'expected to find the save request inside handleSaveDraft');
  const responseHandling = body.slice(awaitIndex);
  assert.ok(
    !responseHandling.includes('setFormValues'),
    'handleSaveDraft must never call setFormValues after the save request is sent, or a failed save could discard user input'
  );
});
