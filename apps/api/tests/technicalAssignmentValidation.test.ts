import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePropertyCrossFieldRules, type PropertyPayload } from '../src/db/technicalAssignmentValidation.js';

// Targeted regression coverage for the 2026-08-03 any_legal_business fix:
// `any_legal_business` in property_allowed_business_categories is a
// wildcard covering every specific business category, so a preferred
// (property_target_tenant_categories) category no longer needs to also be
// duplicated into `allowed` when the wildcard is present. An explicit
// exclusion still wins over the wildcard. No DB needed -- this is a pure
// function (mirrors the style of runtimePolicy.test.ts).

function payload(overrides: Partial<PropertyPayload> = {}): PropertyPayload {
  return {
    property_allowed_business_categories: [],
    property_excluded_business_categories: [],
    property_target_tenant_categories: [],
    ...overrides
  };
}

// Rule 1: allowed=[any_legal_business], preferred=[non_food_retail], excluded=[] -> VALID
test('rule 1: any_legal_business wildcard covers a non-empty preferred category with no exclusions -- VALID', () => {
  const errors = validatePropertyCrossFieldRules(
    payload({
      property_allowed_business_categories: ['any_legal_business'],
      property_target_tenant_categories: ['non_food_retail']
    })
  );
  assert.deepEqual(errors, []);
});

// Rule 2: allowed=[any_legal_business], preferred=[non_food_retail], excluded=[non_food_retail] -> INVALID (explicit exclusion wins)
test('rule 2: an explicit exclusion still wins over the any_legal_business wildcard -- INVALID', () => {
  const errors = validatePropertyCrossFieldRules(
    payload({
      property_allowed_business_categories: ['any_legal_business'],
      property_target_tenant_categories: ['non_food_retail'],
      property_excluded_business_categories: ['non_food_retail']
    })
  );
  assert.ok(errors.length > 0);
  assert.equal(errors[0].code, 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT');
});

// Rule 3: allowed=[non_food_retail], preferred=[non_food_retail] -> VALID (no wildcard involved, unaffected by the fix)
test('rule 3: an explicitly allowed category matching the preferred category is VALID without any wildcard', () => {
  const errors = validatePropertyCrossFieldRules(
    payload({
      property_allowed_business_categories: ['non_food_retail'],
      property_target_tenant_categories: ['non_food_retail']
    })
  );
  assert.deepEqual(errors, []);
});

// Rule 4: preferred category neither explicitly allowed nor covered by the wildcard -> INVALID
test('rule 4: a preferred category absent from both allowed and any wildcard is INVALID', () => {
  const errors = validatePropertyCrossFieldRules(
    payload({
      property_allowed_business_categories: ['office'],
      property_target_tenant_categories: ['non_food_retail']
    })
  );
  assert.ok(errors.length > 0);
  assert.equal(errors[0].field_id, 'property_target_tenant_categories');
  assert.equal(errors[0].code, 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT');
});

// Rule 5: a category cannot be simultaneously preferred and excluded, with or without a wildcard
test('rule 5 (no wildcard): a category present in both allowed+preferred and excluded is INVALID', () => {
  const errors = validatePropertyCrossFieldRules(
    payload({
      property_allowed_business_categories: ['non_food_retail'],
      property_target_tenant_categories: ['non_food_retail'],
      property_excluded_business_categories: ['non_food_retail']
    })
  );
  assert.ok(errors.length > 0);
  assert.equal(errors[0].code, 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT');
});

test('rule 5 (with wildcard): a category simultaneously preferred and excluded is INVALID even though the wildcard would otherwise allow it', () => {
  const errors = validatePropertyCrossFieldRules(
    payload({
      property_allowed_business_categories: ['any_legal_business'],
      property_target_tenant_categories: ['non_food_retail'],
      property_excluded_business_categories: ['non_food_retail']
    })
  );
  assert.ok(errors.length > 0);
  assert.equal(errors[0].code, 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT');
});

// Rule 6: everything else must remain exactly as strict as before.

test('regression: any_legal_business combined with another explicit allowed category is still INVALID', () => {
  const errors = validatePropertyCrossFieldRules(
    payload({ property_allowed_business_categories: ['any_legal_business', 'cafe'] })
  );
  assert.ok(errors.length > 0);
  assert.equal(errors[0].field_id, 'property_allowed_business_categories');
});

test('regression: any_legal_business combined with a non-empty excluded list is still INVALID even with an empty target', () => {
  const errors = validatePropertyCrossFieldRules(
    payload({
      property_allowed_business_categories: ['any_legal_business'],
      property_excluded_business_categories: ['pharmacy']
    })
  );
  assert.ok(errors.length > 0);
  assert.equal(errors[0].field_id, 'property_allowed_business_categories');
});

test('regression: allowed/excluded overlap without any wildcard is still INVALID', () => {
  const errors = validatePropertyCrossFieldRules(
    payload({
      property_allowed_business_categories: ['cafe', 'restaurant'],
      property_excluded_business_categories: ['restaurant']
    })
  );
  assert.ok(errors.length > 0);
  assert.equal(errors[0].field_id, 'property_excluded_business_categories');
});

test('regression: an empty target alongside a lone any_legal_business allowed value stays VALID', () => {
  const errors = validatePropertyCrossFieldRules(payload({ property_allowed_business_categories: ['any_legal_business'] }));
  assert.deepEqual(errors, []);
});

test('regression: land-type field conflicts are unaffected by this fix', () => {
  const errors = validatePropertyCrossFieldRules(
    payload({
      property_allowed_business_categories: ['office'],
      property_type: 'land',
      property_floor: 3
    })
  );
  assert.ok(errors.some(e => e.field_id === 'property_floor' && e.code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT'));
});

test('regression: floor > total_floors is unaffected by this fix', () => {
  const errors = validatePropertyCrossFieldRules(
    payload({
      property_allowed_business_categories: ['office'],
      property_floor: 12,
      property_total_floors: 5
    })
  );
  assert.ok(errors.some(e => e.field_id === 'property_floor' && e.code === 'TECHNICAL_ASSIGNMENT_CROSS_FIELD_CONFLICT'));
});
