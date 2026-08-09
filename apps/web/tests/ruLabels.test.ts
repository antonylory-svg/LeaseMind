import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROPERTY_FIELDS, TENANT_REQUEST_FIELDS } from '../src/technicalAssignmentFields.js';
import { SCENARIO_LABELS, LIFECYCLE_STATUS_LABELS, CAMPAIGN_STATUS_LABELS, FLOOR_OPTION_LABELS, ruLabel } from '../src/ruLabels.js';

// Exact 11 approved Campaign statuses -- mirrored from
// apps/api/src/db/campaigns.ts CAMPAIGN_STATUSES (source of truth:
// LeaseMind_AI_MANAGER_ARCHITECTURE_v1.0.md section 5.3). apps/web cannot
// import across the workspace boundary, so this list is duplicated here
// only to verify localization coverage -- it is never used to validate or
// transform data.
const CAMPAIGN_STATUSES = [
  'Created',
  'Analyzing',
  'Strategy Building',
  'Searching',
  'Qualifying',
  'Negotiating',
  'Viewing',
  'Deal Support',
  'Completed',
  'Paused',
  'Failed'
];

test('every enum/enum_array option on every Technical Assignment field has a Russian label', () => {
  const allFields = [...PROPERTY_FIELDS, ...TENANT_REQUEST_FIELDS];
  const missing: string[] = [];
  for (const field of allFields) {
    if (field.kind !== 'enum' && field.kind !== 'enum_array') continue;
    assert.ok(field.optionLabels, `${field.fieldId} is ${field.kind} but has no optionLabels`);
    for (const opt of field.options ?? []) {
      const label = field.optionLabels?.[opt];
      if (!label || label === opt) {
        missing.push(`${field.fieldId}.${opt}`);
      }
    }
  }
  assert.deepEqual(missing, []);
});

test('translating an option label never changes the underlying raw value stored in `options`', () => {
  const typeField = PROPERTY_FIELDS.find(f => f.fieldId === 'property_type');
  assert.ok(typeField?.options?.includes('office'));
  assert.equal(typeField?.optionLabels?.office, 'Офис');
  // the raw value the API/DB actually receives is unchanged by localization
  assert.ok(typeField?.options?.every(opt => /^[a-z_0-9]+$/.test(opt)));
});

test('scenario labels cover both need_tenant and need_property', () => {
  assert.equal(ruLabel(SCENARIO_LABELS, 'need_tenant'), 'Мне нужен арендатор');
  assert.equal(ruLabel(SCENARIO_LABELS, 'need_property'), 'Мне нужно помещение');
});

test('lifecycle_status labels cover draft, ready_for_analysis and campaign_started', () => {
  assert.equal(LIFECYCLE_STATUS_LABELS.draft, 'Черновик');
  assert.equal(LIFECYCLE_STATUS_LABELS.ready_for_analysis, 'Готово к анализу');
  assert.ok(LIFECYCLE_STATUS_LABELS.campaign_started && LIFECYCLE_STATUS_LABELS.campaign_started !== 'campaign_started');
});

test('every Campaign process status has a Russian label', () => {
  const missing = CAMPAIGN_STATUSES.filter(status => !CAMPAIGN_STATUS_LABELS[status] || CAMPAIGN_STATUS_LABELS[status] === status);
  assert.deepEqual(missing, []);
});

test('ruLabel falls back to the raw value only for values genuinely absent from a dictionary', () => {
  assert.equal(ruLabel(SCENARIO_LABELS, 'unknown_scenario_value'), 'unknown_scenario_value');
});

test('request_floor_options labels match the PRODUCT-confirmed wording (2026-08-02)', () => {
  assert.deepEqual(FLOOR_OPTION_LABELS, {
    basement: 'Подвальный этаж',
    semi_basement: 'Цокольный этаж',
    ground: '1-й этаж',
    first: '2-й этаж',
    upper: '3-й этаж и выше',
    any: 'Любой этаж'
  });
});
