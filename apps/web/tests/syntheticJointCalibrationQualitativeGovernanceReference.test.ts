import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticJointCalibrationQualitativeGovernanceReference from '../src/synthetic/SyntheticJointCalibrationQualitativeGovernanceReference.js';
import {
  G37_DISCLAIMER,
  G37_EXACT_EVIDENCE_STATUS_ENUM,
  G37_GOVERNANCE_MATRIX,
  G37_INDEPENDENT_BOUNDARIES,
  G37_NON_DECISION_RESULT,
  G37_OPEN_CONTENT,
  G37_REGIONS,
  G37_ROLE_SEPARATION,
  G37_SCOPE_LINE,
  G37_SEMANTIC_AND_FAIL_CLOSED_BOUNDARY,
  G37_SOURCE_BOUNDARY,
  G37_TERMINAL_LINE,
  G37_TERMINAL_TOKEN,
  G37_TITLE
} from '../src/synthetic/syntheticJointCalibrationQualitativeGovernanceReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-joint-calibration-qualitative-governance-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticJointCalibrationQualitativeGovernanceReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticJointCalibrationQualitativeGovernanceReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticJointCalibrationQualitativeGovernanceReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-joint-calibration-qualitative-governance-reference', 'G37_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = 'deac7521544d605a617ee7afb828b3cd27ad25f8120192cb0a11a34e337eeced';

type G37Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: { matrix: Array<{ row: number; frozen: string }>; open_exact_content: string[]; terminal_token: string; terminal_line: string };
};

const EXPECTED_TITLE = 'SYNTHETIC JOINT-CALIBRATION QUALITATIVE GOVERNANCE REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — QUALITATIVE FEATURE FIT ↔ EVIDENCE CONFIDENCE GOVERNANCE AND EVIDENCE BOUNDARY ONLY';
const EXPECTED_SCOPE_LINE = 'NO MAPPING, FUNCTION, ORDER, VALUE, RANGE, CALIBRATION, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = ['SOURCE AND STATUS BOUNDARY', 'JOINT-CALIBRATION QUALITATIVE MATRIX', 'ROLE AND ARTIFACT-OWNER SEPARATION', 'SEMANTIC, ENUM, FAIL-CLOSED AND NON-COMPENSATION BOUNDARY', 'OPEN EXACT CONTENT', 'NON-DECISION RESULT'] as const;
const EXPECTED_ENUM = ['UNVERIFIED', 'SOURCE_CONFIRMED', 'CONTENT_VERIFIED', 'CONFLICTING', 'STALE', 'REJECTED', 'HUMAN_REVIEW_REQUIRED'] as const;

test('frozen title, permanent lines and six regions render independently in exact order', () => {
  assert.equal(G37_TITLE, EXPECTED_TITLE);
  assert.equal(G37_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G37_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G37_REGIONS, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticJointCalibrationQualitativeGovernanceReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one twelve-row matrix matching the closed allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticJointCalibrationQualitativeGovernanceReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G37Allowlist;
  assert.deepEqual(G37_GOVERNANCE_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.equal(G37_GOVERNANCE_MATRIX.length, 12);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of G37_GOVERNANCE_MATRIX) assert.equal(occurrences(markup, `>${row.matrixRow}</th>`), 1, row.matrixRow);
});

test('source identity and authority roles remain exact and non-conflated', () => {
  const source = G37_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-M6 v1\.0 — PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(source, /FS-12 \+ MSP-12 → XFR-D-M6/);
  assert.match(source, /BOTH SOURCE KEYS REMAIN PRIMARY_MERGED_MEMBER/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /REMAIN BLOCKED/);
  const roles = G37_ROLE_SEPARATION.join('\n');
  for (const token of ['Chief AI Architect + AI', 'NOT SOURCE_NORMATIVE', 'Chief AI Architect + PRODUCT', 'PRODUCT + LEGAL + AI', 'AI + DEVELOPMENT', 'PRODUCT + LEGAL + DEVELOPMENT', 'NO UNILATERAL', 'NO SELF-APPROVAL']) assert.ok(roles.includes(token), token);
});

test('exact seven-value evidence-status enum remains categorical and unordered', () => {
  assert.deepEqual(G37_EXACT_EVIDENCE_STATUS_ENUM, EXPECTED_ENUM);
  const boundary = G37_SEMANTIC_AND_FAIL_CLOSED_BOUNDARY.join('\n');
  for (const token of ['SEVEN-VALUE', 'CATEGORICAL', 'NO APPROVED NUMERIC ORDER', 'HIERARCHY', 'RANK', 'DIRECTION', 'DEFAULT']) assert.ok(boundary.includes(token), token);
});

test('semantic separation, closed candidate, fail-closed and non-compensation remain explicit', () => {
  const boundary = G37_SEMANTIC_AND_FAIL_CLOSED_BOUNDARY.join('\n');
  for (const token of ['FEATURE FIT', 'FEATURE WEIGHT', 'REQUIRED EVIDENCE LEVEL', 'OVERALL CONFIDENCE', 'HARD CONSTRAINT/ELIGIBILITY', 'MUST BE CLOSED', 'VERSION/HASH-BOUND', 'BLOCKS ONLY THE AFFECTED', 'NO ZERO, ONE, MIDPOINT', 'EVIDENCE PROMOTION', 'NEGATIVE-FIT COERCION', 'DOUBLE-COUNTING ANALYSIS', 'NON-COMPENSATION', 'PREREQUISITES, NOT APPROVALS', 'NEVER SILENTLY RECALCULATED', 'NO RESULT AUTOMATICALLY CHANGES']) assert.ok(boundary.includes(token), token);
});

test('open content and independent boundaries approve no range, mapping, policy or runtime use', () => {
  assert.equal(G37_OPEN_CONTENT.length, 10);
  const open = G37_OPEN_CONTENT.join('\n');
  for (const token of ['MAPPING TABLE', 'NUMERIC ORDER', '[0,1]', 'MULTIPLICATION', 'FEATURE WEIGHT', 'DATASET', 'METRIC', 'PRECISION', 'PRODUCTION-DATA AUTHORITY', 'RUNTIME']) assert.ok(open.includes(token), token);
  const independent = G37_INDEPENDENT_BOUNDARIES.join('\n');
  for (const token of ['[0,1]', 'NOT AN APPROVED RANGE', 'SUPPLY NO XFR-D-M6 MAPPING', 'NO CONFIDENCE', 'PRESENTATION AUTHORITY']) assert.ok(independent.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticJointCalibrationQualitativeGovernanceReference));
  assert.equal(occurrences(markup, G37_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G37_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G37_TERMINAL_LINE), 1);
  assert.match(G37_NON_DECISION_RESULT, /REMAINS PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(G37_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticJointCalibrationQualitativeGovernanceReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculate/, /calibrate/, /computeScore/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G37 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticJointCalibrationQualitativeGovernanceReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticJointCalibrationQualitativeGovernanceReference\.js'/);
  assert.match(component, /from '\.\/syntheticJointCalibrationQualitativeGovernanceReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G37Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G37_SYNTHETIC_JOINT_CALIBRATION_QUALITATIVE_GOVERNANCE_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 10);
  assert.equal(allowlist.reference.terminal_token, G37_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G37_TERMINAL_LINE);
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
  assert.equal(allowlist.governance.gate_impact, 'NONE');
  assert.equal(allowlist.governance.implementation_readiness_gate, 'BLOCKED');
  assert.equal(allowlist.governance.synthetic_acceptance_gate, 'BLOCKED');
  assert.equal(allowlist.governance.production_launch_gate, 'BLOCKED');
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
