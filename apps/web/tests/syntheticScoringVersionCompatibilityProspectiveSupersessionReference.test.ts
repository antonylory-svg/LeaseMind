import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticScoringVersionCompatibilityProspectiveSupersessionReference from '../src/synthetic/SyntheticScoringVersionCompatibilityProspectiveSupersessionReference.js';
import {
  G32_BREAKING_BASELINE,
  G32_COMPATIBILITY_MATRIX,
  G32_DISCLAIMER,
  G32_FAIL_CLOSED,
  G32_INDEPENDENCE_PRESERVED,
  G32_NON_DECISION_RESULT,
  G32_OPEN_CONTENT,
  G32_REGIONS,
  G32_ROLE_SEPARATION,
  G32_SCOPE_LINE,
  G32_SOURCE_BOUNDARY,
  G32_TERMINAL_LINE,
  G32_TERMINAL_TOKEN,
  G32_TITLE
} from '../src/synthetic/syntheticScoringVersionCompatibilityProspectiveSupersessionReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-scoring-version-compatibility-prospective-supersession-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticScoringVersionCompatibilityProspectiveSupersessionReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticScoringVersionCompatibilityProspectiveSupersessionReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticScoringVersionCompatibilityProspectiveSupersessionReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-scoring-version-compatibility-prospective-supersession-reference', 'G32_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = 'fc444155fdea210d6d92f23ef01e1edae2a482be7066d71e421c28f89397b45e';

const EXPECTED_ROWS = [
  'PROSPECTIVE_ONLY_SUPERSESSION_AND_IMMUTABLE_HISTORICAL_RESULTS',
  'NON_EXHAUSTIVE_BREAKING_BASELINE',
  'FAIL_CLOSED_CLASSIFICATION_OF_ALL_OTHER_CHANGES',
  'BREAKING_REQUIRES_NEW_SCORING_POLICY_VERSION_AND_CONSISTENT_BUNDLE_SNAPSHOT',
  'UNCHANGED_COMPONENT_VERSIONS_REMAIN_INDEPENDENT_NOT_FORCE_INCREMENTED',
  'INACTIVE_CANDIDATE_POTENTIALLY_ADDITIVE_ONLY_WITH_EXPLICIT_REVIEW_BEFORE_ACTIVATION',
  'NO_FUNCTION_DIMENSION_WEIGHT_THRESHOLD_VALUE_SEMVER_TOLERANCE_SERIALIZATION_OR_RUNTIME_REPRESENTATION_SELECTED',
  'INDEPENDENTLY_OPEN_BOUNDARIES_PRESERVED_NOT_RESOLVED',
  'INDEPENDENT_DECISIONS_PRESERVED_NOT_REOPENED_OR_ABSORBED',
  'RESOLVED_QUALITATIVE_BOUNDARY_EXACT_CONTENT_STILL_OPEN_AND_NO_AUTOMATIC_ACTION'
] as const;

const EXPECTED_ALLOWED_PATHS = [
  { path: '05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G32_SYNTHETIC_SCORING_VERSION_COMPATIBILITY_PROSPECTIVE_SUPERSESSION_REFERENCE_AUTHORIZATION_v1.0.md', state: 'present' },
  { path: '05_DEVELOPMENT/matching-engine/synthetic-scoring-version-compatibility-prospective-supersession-reference/README.md', state: 'present' },
  { path: '05_DEVELOPMENT/matching-engine/synthetic-scoring-version-compatibility-prospective-supersession-reference/G32_FILE_ALLOWLIST_v1.0.json', state: 'present' },
  { path: 'apps/web/synthetic-scoring-version-compatibility-prospective-supersession-reference.html', state: 'planned' },
  { path: 'apps/web/src/synthetic/syntheticScoringVersionCompatibilityProspectiveSupersessionReferenceScenario.ts', state: 'planned' },
  { path: 'apps/web/src/synthetic/SyntheticScoringVersionCompatibilityProspectiveSupersessionReference.tsx', state: 'planned' },
  { path: 'apps/web/src/synthetic/syntheticScoringVersionCompatibilityProspectiveSupersessionReferenceEntry.tsx', state: 'planned' },
  { path: 'apps/web/tests/syntheticScoringVersionCompatibilityProspectiveSupersessionReference.test.ts', state: 'planned' },
  { path: '05_DEVELOPMENT/matching-engine/synthetic-scoring-version-compatibility-prospective-supersession-reference/G32_SCORING_VERSION_COMPATIBILITY_PROSPECTIVE_SUPERSESSION_REFERENCE_VERIFICATION.json', state: 'planned' }
] as const;

type G32Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: {
    html_title: string;
    always_visible_lines: string[];
    regions_in_order: string[];
    matrix: Array<{ row: string; frozen: string }>;
    open_exact_content: string[];
    terminal_token: string;
    terminal_line: string;
  };
};

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringVersionCompatibilityProspectiveSupersessionReference));
  for (const line of [G32_TITLE, G32_DISCLAIMER, G32_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of G32_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one semantic ten-row compatibility matrix', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringVersionCompatibilityProspectiveSupersessionReference));
  assert.deepEqual(G32_COMPATIBILITY_MATRIX.map(row => row.matrixRow), [...EXPECTED_ROWS]);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 11);
  for (const row of EXPECTED_ROWS) assert.equal(occurrences(markup, `>${row}</th>`), 1, row);
});

test('source and role boundaries preserve XFR-D-023 status and authority', () => {
  const source = G32_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-023 v1\.0 — RESOLVED_QUALITATIVE_BOUNDARY/);
  assert.match(source, /MSP-10 → XFR-D-023 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /SCORING REGISTER: 18 ROWS/);
  assert.match(source, /EVALUATION REGISTER: 17 ROWS/);
  assert.match(source, /ARCHITECTURE §33/);
  assert.match(source, /§49/);
  assert.match(source, /REMAIN BLOCKED/);
  assert.match(source, /WITHOUT UNILATERAL AUTHORITY/);
  const roles = G32_ROLE_SEPARATION.join('\n');
  for (const token of ['Chief AI Architect + PRODUCT', 'LEGAL + DEVELOPMENT', 'NO UNILATERAL', 'NOT WIDENED', 'SOURCE_NORMATIVE', 'XFR-D-063', 'NO NEW OWNER']) assert.ok(roles.includes(token), token);
});

test('breaking baseline, fail-closed classification and open content remain explicit', () => {
  assert.equal(G32_COMPATIBILITY_MATRIX.length, 10);
  assert.equal(G32_ROLE_SEPARATION.length, 9);
  assert.equal(G32_OPEN_CONTENT.length, 11);
  assert.equal(G32_BREAKING_BASELINE.length, 8);
  assert.equal(G32_FAIL_CLOSED.length, 6);
  assert.equal(G32_INDEPENDENCE_PRESERVED.length, 15);
  const baseline = G32_BREAKING_BASELINE.join('\n');
  for (const token of ['ACTIVE MUTUAL AGGREGATE FUNCTION CHANGE', 'MEASUREMENT DIMENSION ADD OR REMOVE', 'WEIGHT ALREADY AFFECTING ACTIVE ARITHMETIC', 'NON-EXHAUSTIVE', 'scoring_policy_version', 'REPRODUCIBILITY-BUNDLE SNAPSHOT', 'NOT FORCE-INCREMENTED', 'POTENTIALLY ADDITIVE ONLY', 'EXPLICIT REVIEW']) assert.ok(baseline.includes(token), token);
  const failClosed = G32_FAIL_CLOSED.join('\n');
  for (const token of ['FAIL-CLOSED', 'EXPLICIT GOVERNANCE CLASSIFICATION', 'DEFAULTS FAIL-CLOSED TO BREAKING', 'NEVER RETROACTIVELY', 'DISTINCT FROM BOUNDED REPLAY TOLERANCE', 'OPEN']) assert.ok(failClosed.includes(token), token);
  const open = G32_OPEN_CONTENT.join('\n');
  for (const token of ['SEMANTIC-VERSIONING SCHEME', 'BOUNDED REPLAY TOLERANCE', 'SERIALIZATION', 'RUNTIME VERSION-BUNDLE REPRESENTATION', 'MUTUAL AGGREGATE FUNCTION', 'WEIGHT VALUES', 'MATCH SCORE COMBINATION RULE', 'GATE APPROVALS']) assert.ok(open.includes(token), token);
  const independence = G32_INDEPENDENCE_PRESERVED.join('\n');
  for (const token of ['ARCHITECTURE §33', '§49', 'FEATURE SCHEMA §9', 'XFR-D-017', 'XFR-D-063']) assert.ok(independence.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringVersionCompatibilityProspectiveSupersessionReference));
  assert.equal(occurrences(markup, G32_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G32_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G32_TERMINAL_LINE), 1);
  assert.equal(G32_NON_DECISION_RESULT.includes(G32_TERMINAL_LINE), false);
  assert.equal(G32_NON_DECISION_RESULT.includes(G32_TERMINAL_TOKEN), false);
  assert.match(G32_NON_DECISION_RESULT, /REMAINS RESOLVED_QUALITATIVE_BOUNDARY/);
  assert.match(G32_NON_DECISION_RESULT, /NOT A FULL RESOLUTION OF EXACT CONTENT/);
  const start = markup.indexOf(`aria-label="${G32_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringVersionCompatibilityProspectiveSupersessionReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateCompatibility/, /computeSupersession/, /executeSupersession/, /bumpVersion/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G32 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticScoringVersionCompatibilityProspectiveSupersessionReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticScoringVersionCompatibilityProspectiveSupersessionReference\.js'/);
  assert.match(component, /from '\.\/syntheticScoringVersionCompatibilityProspectiveSupersessionReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G32Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G32_SYNTHETIC_SCORING_VERSION_COMPATIBILITY_PROSPECTIVE_SUPERSESSION_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.html_title, G32_TITLE);
  assert.deepEqual(allowlist.reference.always_visible_lines, [G32_TITLE, G32_DISCLAIMER, G32_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.regions_in_order, [...G32_REGIONS]);
  assert.deepEqual(allowlist.reference.matrix.map(item => item.row), [...EXPECTED_ROWS]);
  assert.deepEqual(allowlist.reference.matrix.map(item => item.frozen), G32_COMPATIBILITY_MATRIX.map(item => item.frozenBoundary));
  assert.equal(allowlist.reference.matrix.length, 10);
  assert.equal(allowlist.reference.open_exact_content.length, 11);
  assert.equal(allowlist.reference.open_exact_content.length, G32_OPEN_CONTENT.length);
  assert.equal(allowlist.reference.terminal_token, G32_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G32_TERMINAL_LINE);
  assert.deepEqual(allowlist.allowed_paths, [...EXPECTED_ALLOWED_PATHS]);
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
  assert.deepEqual(
    allowlist.allowed_paths.filter(item => item.state === 'planned').map(item => item.path),
    [...EXPECTED_ALLOWED_PATHS].filter(item => item.state === 'planned').map(item => item.path)
  );
  assert.equal(allowlist.governance.gate_impact, 'NONE');
  assert.equal(allowlist.governance.implementation_readiness_gate, 'BLOCKED');
  assert.equal(allowlist.governance.synthetic_acceptance_gate, 'BLOCKED');
  assert.equal(allowlist.governance.production_launch_gate, 'BLOCKED');
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
