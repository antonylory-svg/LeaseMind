import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticSensitivityCalibrationEvidenceGovernanceReference from '../src/synthetic/SyntheticSensitivityCalibrationEvidenceGovernanceReference.js';
import {
  G31_DISCLAIMER,
  G31_DISTINCT_LAYERS,
  G31_EVIDENCE_BOUNDARY,
  G31_EVIDENCE_GOVERNANCE_MATRIX,
  G31_EVIDENCE_PREREQUISITES,
  G31_FAIL_CLOSED,
  G31_INDEPENDENCE_PRESERVED,
  G31_NON_DECISION_RESULT,
  G31_OPEN_CONTENT,
  G31_PROHIBITED_INFERENCES,
  G31_REGIONS,
  G31_ROLE_SEPARATION,
  G31_SCOPE_LINE,
  G31_SOURCE_BOUNDARY,
  G31_TERMINAL_LINE,
  G31_TERMINAL_TOKEN,
  G31_TITLE
} from '../src/synthetic/syntheticSensitivityCalibrationEvidenceGovernanceReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-sensitivity-calibration-evidence-governance-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticSensitivityCalibrationEvidenceGovernanceReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticSensitivityCalibrationEvidenceGovernanceReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticSensitivityCalibrationEvidenceGovernanceReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-sensitivity-calibration-evidence-governance-reference', 'G31_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '88223e5452b64d3cc6a04365e3284e5fdd5daeea7c28b7e2d122edbcc49c46d4';

const EXPECTED_ROWS = [
  'AUTHORITY_SPLIT_AND_NO_UNILATERAL_APPROVAL',
  'IMMUTABLE_CANDIDATE_AND_EVIDENCE_VERSION_HASH_BINDING',
  'ELIGIBILITY_LINEAGE_AND_FROZEN_COMPONENT_ATOMIC_ALLOCATION_NO_REROLL',
  'BASELINE_FIRST_AND_TUNING_FINAL_ISOLATION',
  'PREREGISTRATION_AND_COMPATIBLE_ONLY_COMPARISON',
  'FULL_SEPARATE_REPORTING_AND_NON_COMPENSATION',
  'SYNTHETIC_VERSUS_PRODUCTION_SCOPE_AND_NO_AUTOMATIC_ACTION',
  'PROHIBITED_SURROGATE_VALUES_AND_DEFAULTS',
  'INDEPENDENT_DECISIONS_PRESERVED_NOT_REOPENED_OR_ABSORBED',
  'PARTIALLY_RESOLVED_BOUNDARY_NEVER_FULLY_RESOLVED'
] as const;

const EXPECTED_ALLOWED_PATHS = [
  { path: '05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G31_SYNTHETIC_SENSITIVITY_CALIBRATION_EVIDENCE_GOVERNANCE_REFERENCE_AUTHORIZATION_v1.0.md', state: 'present' },
  { path: '05_DEVELOPMENT/matching-engine/synthetic-sensitivity-calibration-evidence-governance-reference/README.md', state: 'present' },
  { path: '05_DEVELOPMENT/matching-engine/synthetic-sensitivity-calibration-evidence-governance-reference/G31_FILE_ALLOWLIST_v1.0.json', state: 'present' },
  { path: 'apps/web/synthetic-sensitivity-calibration-evidence-governance-reference.html', state: 'planned' },
  { path: 'apps/web/src/synthetic/syntheticSensitivityCalibrationEvidenceGovernanceReferenceScenario.ts', state: 'planned' },
  { path: 'apps/web/src/synthetic/SyntheticSensitivityCalibrationEvidenceGovernanceReference.tsx', state: 'planned' },
  { path: 'apps/web/src/synthetic/syntheticSensitivityCalibrationEvidenceGovernanceReferenceEntry.tsx', state: 'planned' },
  { path: 'apps/web/tests/syntheticSensitivityCalibrationEvidenceGovernanceReference.test.ts', state: 'planned' },
  { path: '05_DEVELOPMENT/matching-engine/synthetic-sensitivity-calibration-evidence-governance-reference/G31_SENSITIVITY_CALIBRATION_EVIDENCE_GOVERNANCE_REFERENCE_VERIFICATION.json', state: 'planned' }
] as const;

type G31Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: {
    html_title: string;
    always_visible_lines: string[];
    regions_in_order: string[];
    matrix: Array<{ row: string; frozen: string }>;
    evidence_prerequisites: string[];
    open_exact_content: string[];
    terminal_token: string;
    terminal_line: string;
  };
};

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticSensitivityCalibrationEvidenceGovernanceReference));
  for (const line of [G31_TITLE, G31_DISCLAIMER, G31_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of G31_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one semantic ten-row evidence-governance matrix', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticSensitivityCalibrationEvidenceGovernanceReference));
  assert.deepEqual(G31_EVIDENCE_GOVERNANCE_MATRIX.map(row => row.governanceRow), [...EXPECTED_ROWS]);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 11);
  for (const row of EXPECTED_ROWS) assert.equal(occurrences(markup, `>${row}</th>`), 1, row);
});

test('source and role boundaries preserve XFR-D-022 status and authority', () => {
  const source = G31_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-022 v1\.0 — APPROVED \/ PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(source, /MSP-09 → XFR-D-022 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /SCORING REGISTER: 18 ROWS/);
  assert.match(source, /EVALUATION REGISTER: 17 ROWS/);
  assert.match(source, /ARCHITECTURE §34\.1/);
  assert.match(source, /PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(source, /IMPLEMENTATION READINESS, SYNTHETIC ACCEPTANCE AND PRODUCTION LAUNCH REMAIN BLOCKED/);
  assert.match(source, /NOT WIDENED/);
  const roles = G31_ROLE_SEPARATION.join('\n');
  for (const token of ['AI + DEVELOPMENT', 'Chief AI Architect + PRODUCT', 'Chief AI Architect + PRODUCT + LEGAL', 'NO UNILATERAL', 'NOT WIDENED', 'RETAINS ITS INDEPENDENT TARGET AUTHORITY', 'SOURCE_NORMATIVE']) assert.ok(roles.includes(token), token);
});

test('evidence prerequisites, non-compensation and open content remain explicit', () => {
  assert.equal(G31_EVIDENCE_PREREQUISITES.length, 11);
  assert.equal(G31_EVIDENCE_GOVERNANCE_MATRIX.length, 10);
  assert.equal(G31_OPEN_CONTENT.length, 11);
  assert.equal(G31_DISTINCT_LAYERS.length, 20);
  assert.equal(G31_PROHIBITED_INFERENCES.length, 16);
  assert.equal(G31_INDEPENDENCE_PRESERVED.length, 17);
  const evidence = G31_EVIDENCE_BOUNDARY.join('\n');
  assert.match(evidence, /PREREQUISITES ONLY/);
  assert.match(evidence, /CANNOT COMPENSATE/);
  assert.match(evidence, /FAIL CLOSED/);
  assert.match(evidence, /REPORTED SEPARATELY/);
  const failClosed = G31_FAIL_CLOSED.join('\n');
  for (const token of ['FAILS CLOSED', 'PROHIBITED', 'UNRELATED PROCESSING IS NOT BLOCKED', 'OPEN']) assert.ok(failClosed.includes(token), token);
  const open = G31_OPEN_CONTENT.join('\n');
  for (const token of ['EXACT DATASET IDENTITY', 'EXACT SENSITIVITY OBJECT', 'EXACT CALIBRATION METHOD', 'EXACT TARGET', 'EXACT UNCERTAINTY', 'PRODUCTION READINESS CRITERION', 'GATE APPROVALS']) assert.ok(open.includes(token), token);
  const layers = G31_DISTINCT_LAYERS.join('\n');
  for (const token of ['MATCH SCORE', 'EVIDENCE CONFIDENCE', 'RISK', 'QUALIFICATION STATUS', 'SAFE PRESENTATION', 'DETERMINISTIC REPLAY PROVES REPRODUCIBILITY ONLY']) assert.ok(layers.includes(token), token);
  const prohibited = G31_PROHIBITED_INFERENCES.join('\n');
  for (const token of ['NO DATASET', 'NO CALIBRATION METHOD', 'NO TARGET', 'NO PRODUCTION CALIBRATION', 'SECTION 34.1', 'NO AUTOMATIC']) assert.ok(prohibited.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticSensitivityCalibrationEvidenceGovernanceReference));
  assert.equal(occurrences(markup, G31_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G31_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G31_TERMINAL_LINE), 1);
  assert.equal(G31_NON_DECISION_RESULT.includes(G31_TERMINAL_LINE), false);
  assert.match(G31_NON_DECISION_RESULT, /REMAINS APPROVED AND PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(G31_NON_DECISION_RESULT, /NEVER FULLY RESOLVED/);
  const start = markup.indexOf(`aria-label="${G31_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticSensitivityCalibrationEvidenceGovernanceReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateSensitivity/, /computeCalibration/, /executeCalibration/, /tuneThreshold/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G31 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticSensitivityCalibrationEvidenceGovernanceReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticSensitivityCalibrationEvidenceGovernanceReference\.js'/);
  assert.match(component, /from '\.\/syntheticSensitivityCalibrationEvidenceGovernanceReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G31Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G31_SYNTHETIC_SENSITIVITY_CALIBRATION_EVIDENCE_GOVERNANCE_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.html_title, G31_TITLE);
  assert.deepEqual(allowlist.reference.always_visible_lines, [G31_TITLE, G31_DISCLAIMER, G31_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.regions_in_order, [...G31_REGIONS]);
  assert.deepEqual(allowlist.reference.matrix.map(item => item.row), [...EXPECTED_ROWS]);
  assert.deepEqual(allowlist.reference.matrix.map(item => item.frozen), G31_EVIDENCE_GOVERNANCE_MATRIX.map(item => item.frozenBoundary));
  assert.equal(allowlist.reference.evidence_prerequisites.length, 11);
  assert.equal(allowlist.reference.evidence_prerequisites.length, G31_EVIDENCE_PREREQUISITES.length);
  assert.equal(allowlist.reference.open_exact_content.length, 11);
  assert.equal(allowlist.reference.open_exact_content.length, G31_OPEN_CONTENT.length);
  assert.equal(allowlist.reference.terminal_token, G31_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G31_TERMINAL_LINE);
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
