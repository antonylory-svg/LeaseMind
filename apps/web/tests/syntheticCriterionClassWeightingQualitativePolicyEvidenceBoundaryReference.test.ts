import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReference from '../src/synthetic/SyntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReference.js';
import {
  G34_CLASS_AND_HARD_CONSTRAINT_BOUNDARY,
  G34_DISCLAIMER,
  G34_FAIL_CLOSED_AND_EVIDENCE,
  G34_NON_DECISION_RESULT,
  G34_OPEN_CONTENT,
  G34_POLICY_MATRIX,
  G34_PROHIBITED_SURROGATES,
  G34_REGIONS,
  G34_ROLE_SEPARATION,
  G34_SCOPE_LINE,
  G34_SOURCE_BOUNDARY,
  G34_TERMINAL_LINE,
  G34_TERMINAL_TOKEN,
  G34_TITLE
} from '../src/synthetic/syntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-criterion-class-weighting-qualitative-policy-evidence-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-criterion-class-weighting-qualitative-policy-evidence-boundary-reference', 'G34_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '6d5d5c82b0ca24ca378257e84858f45123af6fd48b12742ac9089eed2dbbe28d';

type G34Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: {
    matrix: Array<{ row: number; frozen: string }>;
    open_exact_content: string[];
    terminal_token: string;
    terminal_line: string;
  };
};

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReference));
  for (const line of [G34_TITLE, G34_DISCLAIMER, G34_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of G34_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one semantic twelve-row matrix matching the allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G34Allowlist;
  assert.deepEqual(G34_POLICY_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of G34_POLICY_MATRIX) assert.equal(occurrences(markup, `>${row.matrixRow}</th>`), 1, row.matrixRow);
});

test('source and role boundaries preserve XFR-D-025 authority exactly', () => {
  const source = G34_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-025 v1\.0 — PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(source, /MSP-13 → XFR-D-025 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /SCORING REGISTER: 18 ROWS/);
  assert.match(source, /EVALUATION REGISTER: 17 ROWS/);
  assert.match(source, /REMAIN BLOCKED/);
  const roles = G34_ROLE_SEPARATION.join('\n');
  for (const token of ['AI + PRODUCT', 'NOT SOURCE_NORMATIVE', 'Chief AI Architect + PRODUCT', 'Chief AI Architect + LEGAL + DEVELOPMENT', 'AI + DEVELOPMENT', 'NO UNILATERAL', 'XFR-D-M5', 'SOURCE_NORMATIVE']) assert.ok(roles.includes(token), token);
});

test('semantic, non-softening, fail-closed, open and surrogate boundaries remain explicit', () => {
  assert.equal(G34_POLICY_MATRIX.length, 12);
  assert.equal(G34_CLASS_AND_HARD_CONSTRAINT_BOUNDARY.length, 5);
  assert.equal(G34_FAIL_CLOSED_AND_EVIDENCE.length, 6);
  assert.equal(G34_OPEN_CONTENT.length, 8);
  assert.equal(G34_PROHIBITED_SURROGATES.length, 3);
  const semantic = G34_CLASS_AND_HARD_CONSTRAINT_BOUNDARY.join('\n');
  for (const token of ['MANDATORY, DESIRABLE, NEGOTIABLE AND INFORMATIONAL', 'NO NUMERIC OR ORDINAL HIERARCHY', 'HANDLED BEFORE SCORING', 'CANNOT BE SOFTENED', 'MANDATORY LABEL ALONE', 'DESIRABLE ABSENCE', 'SCENARIO-ONLY']) assert.ok(semantic.includes(token), token);
  const failClosed = G34_FAIL_CLOSED_AND_EVIDENCE.join('\n');
  for (const token of ['BLOCKS ONLY THE AFFECTED USE', 'NO DEFAULT', 'AI-INFERRED', 'NEGATIVE BUSINESS FACT', 'SEGMENT MEMBERSHIP CANNOT BE GUESSED', 'PREREQUISITES, NOT APPROVALS', 'NO RESULT AUTOMATICALLY CHANGES']) assert.ok(failClosed.includes(token), token);
  const open = G34_OPEN_CONTENT.join('\n');
  for (const token of ['ASSIGNMENTS', 'WEIGHTS', 'FORMULA', 'DENOMINATOR', 'DOUBLE-COUNTING', 'SEGMENT UNIVERSE', 'PRECISION', 'DATASET', 'PRODUCTION DATA', 'RUNTIME']) assert.ok(open.includes(token), token);
  const surrogates = G34_PROHIBITED_SURROGATES.join('\n');
  for (const token of ['0.5/0.5', '100-CAMPAIGN', '40%/25%', 'LIBRARY DEFAULT', 'CANNOT SUBSTITUTE']) assert.ok(surrogates.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReference));
  assert.equal(occurrences(markup, G34_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G34_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G34_TERMINAL_LINE), 1);
  assert.match(G34_NON_DECISION_RESULT, /REMAINS PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(G34_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${G34_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateWeight/, /assignWeight/, /computeScore/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G34 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticCriterionClassWeightingQualitativePolicyEvidenceBoundaryReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G34Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G34_SYNTHETIC_CRITERION_CLASS_WEIGHTING_QUALITATIVE_POLICY_EVIDENCE_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 8);
  assert.equal(allowlist.reference.terminal_token, G34_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G34_TERMINAL_LINE);
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
