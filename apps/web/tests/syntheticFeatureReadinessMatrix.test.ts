import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticFeatureReadinessMatrix from '../src/synthetic/SyntheticFeatureReadinessMatrix.js';
import {
  SYNTHETIC_FEATURE_READINESS_MATRIX_CATEGORIES,
  SYNTHETIC_FEATURE_READINESS_MATRIX_CATEGORY_COPY,
  SYNTHETIC_FEATURE_READINESS_MATRIX_DISCLAIMER,
  SYNTHETIC_FEATURE_READINESS_MATRIX_FEATURE_IDS,
  SYNTHETIC_FEATURE_READINESS_MATRIX_MIXED_BOUNDARIES,
  SYNTHETIC_FEATURE_READINESS_MATRIX_PROHIBITED_INFERENCES,
  SYNTHETIC_FEATURE_READINESS_MATRIX_REASON,
  SYNTHETIC_FEATURE_READINESS_MATRIX_REGIONS_IN_ORDER,
  SYNTHETIC_FEATURE_READINESS_MATRIX_SAFEGUARDS,
  SYNTHETIC_FEATURE_READINESS_MATRIX_SCOPE_LINE,
  SYNTHETIC_FEATURE_READINESS_MATRIX_TERMINAL_LINE,
  SYNTHETIC_FEATURE_READINESS_MATRIX_TERMINAL_TOKEN,
  SYNTHETIC_FEATURE_READINESS_MATRIX_TITLE
} from '../src/synthetic/syntheticFeatureReadinessMatrixScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-feature-readiness-matrix.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticFeatureReadinessMatrixScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticFeatureReadinessMatrix.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticFeatureReadinessMatrixEntry.tsx');
const ALLOWLIST_PATH = path.join(
  REPOSITORY_ROOT,
  '05_DEVELOPMENT',
  'matching-engine',
  'synthetic-feature-readiness-matrix',
  'G18_FILE_ALLOWLIST_v1.0.json'
);

const FROZEN_ALLOWLIST_SHA256 = '2c71dc9ef7108664c1ccd1f230076621f9b8944b939cae3ae82ac2be99d397da';

const EXPECTED_FEATURE_IDS = [
  'property_type_membership',
  'area_range_fit',
  'budget_fit',
  'rent_rate_fit',
  'business_category_allowed',
  'condition_acceptability',
  'timing_compatibility',
  'entrance_requirement_fit',
  'required_features_present',
  'excluded_features_absent',
  'loading_access_required_fit',
  'power_min_fit',
  'ceiling_height_min_fit',
  'parking_min_fit',
  'access_mode_hard_fit',
  'country_code_membership',
  'region_membership',
  'city_membership',
  'districts_membership',
  'floor_option_fit'
];

const EXPECTED_MIXED_ORDINALS = [4, 8, 15, 17, 18, 19, 20];

test('frozen title, disclaimers and five regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticFeatureReadinessMatrix));
  assert.equal(occurrences(markup, SYNTHETIC_FEATURE_READINESS_MATRIX_TITLE), 1);
  assert.equal(occurrences(markup, SYNTHETIC_FEATURE_READINESS_MATRIX_DISCLAIMER), 1);
  assert.equal(occurrences(markup, SYNTHETIC_FEATURE_READINESS_MATRIX_SCOPE_LINE), 1);

  let previous = -1;
  for (const region of SYNTHETIC_FEATURE_READINESS_MATRIX_REGIONS_IN_ORDER) {
    const position = markup.indexOf(`aria-label="${region}"`);
    assert.ok(position > previous, region);
    previous = position;
  }
  assert.equal(occurrences(markup, '<section'), 5);
  assert.equal(occurrences(markup, '<h1'), 1);
  assert.equal(occurrences(markup, '<h2'), 5);
});

test('category region exposes exactly four design-time statuses and one subtype reason', () => {
  assert.deepEqual(SYNTHETIC_FEATURE_READINESS_MATRIX_CATEGORIES, [
    'READY_FOR_DRAFT',
    'READY_AS_CANDIDATE_ONLY',
    'BLOCKED_PENDING_DECISION',
    'EXCLUDED_FROM_V0_1'
  ]);
  assert.equal(SYNTHETIC_FEATURE_READINESS_MATRIX_REASON.value, 'BLOCKED_PENDING_COMPATIBILITY_TABLE');
  assert.match(SYNTHETIC_FEATURE_READINESS_MATRIX_REASON.copy, /NOT A FIFTH STATUS/);

  const markup = renderToStaticMarkup(createElement(SyntheticFeatureReadinessMatrix));
  const region = regionSlice(markup, SYNTHETIC_FEATURE_READINESS_MATRIX_REGIONS_IN_ORDER[0]);
  for (const category of SYNTHETIC_FEATURE_READINESS_MATRIX_CATEGORIES) {
    const expectedOccurrences = category === 'BLOCKED_PENDING_DECISION' ? 2 : 1;
    assert.equal(occurrences(region, category), expectedOccurrences, category);
  }
  assert.equal(occurrences(region, SYNTHETIC_FEATURE_READINESS_MATRIX_CATEGORY_COPY), 4);
  assert.equal(occurrences(region, SYNTHETIC_FEATURE_READINESS_MATRIX_REASON.value), 1);
});

test('candidate index contains the exact twenty feature ids in source order without row statuses', () => {
  assert.deepEqual(SYNTHETIC_FEATURE_READINESS_MATRIX_FEATURE_IDS, EXPECTED_FEATURE_IDS);
  assert.equal(new Set(SYNTHETIC_FEATURE_READINESS_MATRIX_FEATURE_IDS).size, 20);

  const markup = renderToStaticMarkup(createElement(SyntheticFeatureReadinessMatrix));
  const region = regionSlice(markup, SYNTHETIC_FEATURE_READINESS_MATRIX_REGIONS_IN_ORDER[1]);
  const listStart = region.indexOf('<ol');
  const listEnd = region.indexOf('</ol>', listStart);
  assert.notEqual(listStart, -1);
  assert.notEqual(listEnd, -1);
  const indexList = region.slice(listStart, listEnd);
  let previous = -1;
  for (const [index, featureId] of EXPECTED_FEATURE_IDS.entries()) {
    const position = indexList.indexOf(`${index + 1}. ${featureId}`);
    assert.ok(position > previous, featureId);
    previous = position;
  }
  assert.equal(occurrences(indexList, '<li'), 20);
  for (const category of SYNTHETIC_FEATURE_READINESS_MATRIX_CATEGORIES) {
    assert.equal(indexList.includes(category), false, category);
  }
  assert.equal(indexList.includes(SYNTHETIC_FEATURE_READINESS_MATRIX_REASON.value), false);
});

test('all-candidate safeguards remain explicit and non-authorizing', () => {
  assert.deepEqual(SYNTHETIC_FEATURE_READINESS_MATRIX_SAFEGUARDS, [
    'ALL 20 ARE DESIGN-TIME ELIGIBILITY_HARD_CONSTRAINT_CANDIDATES — NOT APPROVED RUNTIME RULES',
    'FINAL LEGAL VERDICT IS NOT APPROVED FOR ANY OF THE 20',
    'required_evidence_level REMAINS BLOCKED_PENDING_DECISION FOR ALL 20',
    'automatic_ineligible_allowed = NO FOR ALL 20'
  ]);
  const markup = renderToStaticMarkup(createElement(SyntheticFeatureReadinessMatrix));
  for (const safeguard of SYNTHETIC_FEATURE_READINESS_MATRIX_SAFEGUARDS) {
    assert.equal(occurrences(markup, safeguard), 1, safeguard);
  }
});

test('mixed boundaries are exact, closed and never flattened', () => {
  assert.deepEqual(SYNTHETIC_FEATURE_READINESS_MATRIX_MIXED_BOUNDARIES.map(item => item.ordinal), EXPECTED_MIXED_ORDINALS);
  assert.equal(SYNTHETIC_FEATURE_READINESS_MATRIX_MIXED_BOUNDARIES.length, 7);
  assert.match(SYNTHETIC_FEATURE_READINESS_MATRIX_MIXED_BOUNDARIES[0].copy, /EXACT NUMERIC REPRESENTATION REMAINS BLOCKED/);
  for (const ordinal of [8, 15, 20]) {
    const row = SYNTHETIC_FEATURE_READINESS_MATRIX_MIXED_BOUNDARIES.find(item => item.ordinal === ordinal);
    assert.ok(row);
    assert.match(row.copy, /OVERALL BLOCKED_PENDING_DECISION/);
    assert.match(row.copy, /(?:DOES NOT|DO NOT) FLATTEN THE ROW TO READY/);
  }
  for (const ordinal of [17, 18, 19]) {
    const row = SYNTHETIC_FEATURE_READINESS_MATRIX_MIXED_BOUNDARIES.find(item => item.ordinal === ordinal);
    assert.ok(row);
    assert.match(row.copy, /^READY_AS_CANDIDATE_ONLY/);
    assert.match(row.copy, /NOT ACTIVE RUNTIME COMPARISON/);
  }
});

test('terminal region is last and reports only non-computation', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticFeatureReadinessMatrix));
  const terminal = regionSlice(markup, SYNTHETIC_FEATURE_READINESS_MATRIX_REGIONS_IN_ORDER[4]);
  assert.equal(occurrences(markup, SYNTHETIC_FEATURE_READINESS_MATRIX_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_FEATURE_READINESS_MATRIX_TERMINAL_LINE), 1);
  assert.ok(terminal.includes(SYNTHETIC_FEATURE_READINESS_MATRIX_TERMINAL_TOKEN));
  assert.ok(terminal.includes(SYNTHETIC_FEATURE_READINESS_MATRIX_TERMINAL_LINE));
  const terminalStart = markup.indexOf(`aria-label="${SYNTHETIC_FEATURE_READINESS_MATRIX_REGIONS_IN_ORDER[4]}"`);
  assert.equal(markup.indexOf('<section', terminalStart + 1), -1);
});

test('rendered surface has zero controls, links, focus management or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticFeatureReadinessMatrix));
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) {
    assert.equal(markup.toLowerCase().includes(token), false, token);
  }
  assert.equal(occurrences(markup, '<main'), 1);
  assert.equal(occurrences(markup, '<ol'), 1);
});

test('authored modules contain no state, effects, handlers, network, storage or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [
    /useState\s*\(/,
    /useEffect\s*\(/,
    /useReducer\s*\(/,
    /useContext\s*\(/,
    /onClick\s*=/,
    /onChange\s*=/,
    /onSubmit\s*=/,
    /onKeyDown\s*=/,
    /fetch\s*\(/,
    /XMLHttpRequest/,
    /WebSocket/,
    /localStorage/,
    /sessionStorage/,
    /document\.cookie/,
    /console\./,
    /setTimeout\s*\(/,
    /setInterval\s*\(/,
    /Math\.random\s*\(/,
    /animation\s*:/,
    /transition\s*:/
  ]) {
    assert.equal(pattern.test(sources), false, String(pattern));
  }
});

test('prohibited inference copy denies runtime and outcome claims', () => {
  assert.equal(SYNTHETIC_FEATURE_READINESS_MATRIX_PROHIBITED_INFERENCES.length, 7);
  const markup = renderToStaticMarkup(createElement(SyntheticFeatureReadinessMatrix));
  for (const item of SYNTHETIC_FEATURE_READINESS_MATRIX_PROHIBITED_INFERENCES) {
    assert.equal(occurrences(markup, item), 1, item);
  }
  assert.equal(markup.includes('Property A'), false);
  assert.equal(markup.includes('Tenant A'), false);
});

test('standalone html and entry bind only the isolated g18 component', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticFeatureReadinessMatrixEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticFeatureReadinessMatrix\.js'/);
  assert.match(component, /from '\.\/syntheticFeatureReadinessMatrixScenario\.js'/);
  for (const prior of [
    'SyntheticMatchReviewWorkspace',
    'SyntheticDealRehearsalBoard',
    'SyntheticDemoJourneyHub',
    'SyntheticMatchingReadinessTrace'
  ]) {
    assert.equal(entry.includes(prior), false, prior);
    assert.equal(component.includes(prior), false, prior);
  }
});

test('closed allowlist matches the exact g18 scope, vocabulary and blocked gates', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as {
    closed: boolean;
    result_label: string;
    matrix: {
      registry_readiness_values: string[];
      hard_constraint_candidate_feature_ids_in_order: string[];
      named_mixed_boundaries: Array<{ ordinal: number; feature_id: string; copy: string }>;
    };
    governance: Record<string, string>;
    allowed_paths: Array<{ path: string; state: string }>;
  };
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G18_SYNTHETIC_FEATURE_READINESS_MATRIX_VERIFIED');
  assert.deepEqual(allowlist.matrix.registry_readiness_values, [...SYNTHETIC_FEATURE_READINESS_MATRIX_CATEGORIES]);
  assert.deepEqual(allowlist.matrix.hard_constraint_candidate_feature_ids_in_order, EXPECTED_FEATURE_IDS);
  assert.deepEqual(allowlist.matrix.named_mixed_boundaries.map(item => item.ordinal), EXPECTED_MIXED_ORDINALS);
  assert.deepEqual(allowlist.governance, {
    gate_impact: 'NONE',
    implementation_readiness_gate: 'BLOCKED',
    synthetic_acceptance_gate: 'BLOCKED',
    production_launch_gate: 'BLOCKED'
  });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
});

test('production entry points expose no g18 page or component', () => {
  for (const file of ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json']) {
    const source = read(path.join(WEB_ROOT, file));
    assert.equal(source.includes('synthetic-feature-readiness-matrix'), false, file);
    assert.equal(source.includes('SyntheticFeatureReadinessMatrix'), false, file);
    assert.equal(source.includes('syntheticFeatureReadinessMatrix'), false, file);
  }
});

function read(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

function occurrences(source: string, needle: string): number {
  assert.notEqual(needle, '');
  return source.split(needle).length - 1;
}

function sha256(filePath: string): string {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function regionSlice(markup: string, region: string): string {
  const start = markup.indexOf(`aria-label="${region}"`);
  assert.notEqual(start, -1, region);
  const end = markup.indexOf('</section>', start);
  assert.notEqual(end, -1, region);
  return markup.slice(start, end);
}

assert.equal(existsSync(HTML_PATH), true);
