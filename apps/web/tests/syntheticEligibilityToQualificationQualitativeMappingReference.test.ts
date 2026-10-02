import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticEligibilityToQualificationQualitativeMappingReference from '../src/synthetic/SyntheticEligibilityToQualificationQualitativeMappingReference.js';
import {
  G43_BOUNDARY_MATRIX,
  G43_DISCLAIMER,
  G43_INDEPENDENT_BOUNDARIES,
  G43_MAPPING_RULES,
  G43_NON_DECISION_RESULT,
  G43_NON_REJECTION_BOUNDARY,
  G43_OPEN_CONTENT,
  G43_REGIONS,
  G43_SCOPE_LINE,
  G43_SIX_CONDITIONS,
  G43_SOURCE_BOUNDARY,
  G43_TERMINAL_LINE,
  G43_TERMINAL_TOKEN,
  G43_TITLE
} from '../src/synthetic/syntheticEligibilityToQualificationQualitativeMappingReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-eligibility-to-qualification-qualitative-mapping-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticEligibilityToQualificationQualitativeMappingReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticEligibilityToQualificationQualitativeMappingReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticEligibilityToQualificationQualitativeMappingReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-eligibility-to-qualification-qualitative-mapping-reference', 'G43_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '98c1878ab75c4525c0c6d7f2cb4884dd58ded2b772ec50b4ccd56247239f1941';

type G43Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string | boolean>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: {
    automatic_ineligible_conditions: string[];
    eligibility_results: string[];
    qualification_results: string[];
    future_surface: { title: string; permanent_lines: string[]; regions_in_order: string[] };
    matrix: Array<{ row: number; frozen: string }>;
    open_exact_content: string[];
    terminal_token: string;
    terminal_line: string;
  };
};

const EXPECTED_TITLE = 'SYNTHETIC ELIGIBILITY-TO-QUALIFICATION QUALITATIVE-MAPPING REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — QUALITATIVE MAPPING IS NOT RUNTIME REPRESENTATION OR POLICY APPROVAL';
const EXPECTED_SCOPE_LINE = 'NO NUMERIC THRESHOLD, ENUM, FIELD, CARRIER, REASON CODE, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = ['SOURCE AND STATUS BOUNDARY', 'QUALITATIVE MAPPING MATRIX', 'STAGE AND NAMESPACE SEPARATION', 'FAIL-CLOSED AND NON-REJECTION BOUNDARY', 'OPEN EXACT CONTENT', 'NON-DECISION RESULT'] as const;
const EXPECTED_QUALIFICATION_RESULTS = ['QUALIFIED_HYPOTHESIS', 'NEEDS_VERIFICATION', 'HUMAN_REVIEW_REQUIRED', 'REJECTED_BY_MATCHING'] as const;

test('frozen title, permanent lines and six regions match the closed allowlist', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G43Allowlist;
  assert.equal(G43_TITLE, EXPECTED_TITLE);
  assert.equal(G43_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G43_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G43_REGIONS, EXPECTED_REGIONS);
  assert.equal(allowlist.reference.future_surface.title, EXPECTED_TITLE);
  assert.deepEqual(allowlist.reference.future_surface.permanent_lines, [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.future_surface.regions_in_order, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticEligibilityToQualificationQualitativeMappingReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has one twelve-row matrix matching the closed allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticEligibilityToQualificationQualitativeMappingReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G43Allowlist;
  assert.deepEqual(G43_BOUNDARY_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.deepEqual(allowlist.reference.matrix.map(row => row.row), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(G43_BOUNDARY_MATRIX.length, 12);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of G43_BOUNDARY_MATRIX) assert.equal(occurrences(markup, `>${row.matrixRow}</th>`), 1, row.matrixRow);
});

test('source identity, status, scope and counts remain exact', () => {
  const source = G43_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-032 v1\.0 — APPROVED QUALITATIVE MAPPING — runtime representation and numeric thresholds remain OPEN/);
  assert.match(source, /MQP-03 → XFR-D-032 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /20 ROWS/);
  for (const token of ['ONE-WAY', 'DISTINCT STAGES', 'DISTINCT NAMESPACES', 'REMAIN BLOCKED']) assert.ok(source.includes(token), token);
});

test('four mapping rules preserve stage separation and do not invent qualification', () => {
  assert.equal(G43_MAPPING_RULES.length, 4);
  const rules = G43_MAPPING_RULES.join('\n');
  for (const token of ['INELIGIBLE → QUALIFICATION REJECTED_BY_MATCHING', 'ALL SIX', 'ELIGIBLE PERMITS CONTINUED CALCULATION', 'NEVER AUTOMATICALLY MEANS QUALIFIED_HYPOTHESIS', 'NEEDS_VERIFICATION → QUALIFICATION NEEDS_VERIFICATION', 'NEVER CREATES REJECTION', 'HUMAN_REVIEW_REQUIRED']) assert.ok(rules.includes(token), token);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G43Allowlist;
  assert.deepEqual(allowlist.reference.qualification_results, EXPECTED_QUALIFICATION_RESULTS);
  assert.equal(allowlist.reference.eligibility_results.length, 4);
});

test('all six automatic-ineligible conditions remain cumulative and accurate', () => {
  assert.equal(G43_SIX_CONDITIONS.length, 6);
  const conditions = G43_SIX_CONDITIONS.join('\n');
  for (const token of ['VERSIONED POLICY', 'NOT MODEL-INFERRED', 'CURRENT PERMITTED SOURCE', 'PROTECTED PERSONAL ATTRIBUTE', 'HIDDEN PROXY', 'SOURCE CONFLICT', 'LEGAL INTERPRETATION', 'REASON CODE', 'RULE VERSION', 'EVIDENCE REFERENCE', 'HUMAN REVIEW']) assert.ok(conditions.includes(token), token);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G43Allowlist;
  assert.equal(allowlist.reference.automatic_ineligible_conditions.length, 6);
  assert.equal(allowlist.governance.all_six_automatic_ineligible_conditions_required, true);
});

test('fail-closed safeguards prohibit unsupported rejection', () => {
  const safeguards = G43_NON_REJECTION_BOUNDARY.join('\n');
  for (const token of ['ANY ONE OF THE SIX CONDITIONS IS MISSING', 'REJECTED_BY_MATCHING IS PROHIBITED', 'MISSING OR UNKNOWN', 'NOT A NEGATIVE FACT', 'RISK SCORE', 'MODEL INFERENCE', 'STATISTICAL CORRELATION', 'DATA ABSENCE', 'NEEDS_VERIFICATION', 'ELIGIBLE NEVER BYPASSES']) assert.ok(safeguards.includes(token), token);
  const governance = (JSON.parse(read(ALLOWLIST_PATH)) as G43Allowlist).governance;
  assert.equal(governance.missing_unknown_as_negative, 'PROHIBITED');
  assert.equal(governance.eligible_as_automatic_qualified_hypothesis, 'PROHIBITED');
  assert.equal(governance.needs_verification_as_rejection, 'PROHIBITED');
  assert.equal(governance.risk_model_correlation_or_absence_as_rejection, 'PROHIBITED');
});

test('all exact contents remain open and sibling boundaries remain independent', () => {
  assert.equal(G43_OPEN_CONTENT.length, 9);
  const open = G43_OPEN_CONTENT.join('\n');
  for (const token of ['NUMERIC THRESHOLDS', 'RUNTIME ENUM', 'CARRIER SHAPE', 'SERIALIZATION', 'API, DB, EVENT', 'REASON-CODE CATALOG', 'COMPATIBILITY', 'EVIDENCE-REFERENCE', 'DATA CONTRACTS', 'IMPLEMENTATION', 'GATES']) assert.ok(open.includes(token), token);
  const siblings = G43_INDEPENDENT_BOUNDARIES.join('\n');
  for (const token of ['XFR-D-030', 'XFR-D-031', 'XFR-D-033', 'XFR-D-038', 'XFR-D-039 v1.1', 'XFR-D-040', 'XFR-D-041', 'XFR-D-043', 'XFR-D-044', 'XFR-D-055', 'NO SIBLING BOUNDARY IS REOPENED']) assert.ok(siblings.includes(token), token);
});

test('terminal region is last, static and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticEligibilityToQualificationQualitativeMappingReference));
  assert.equal(occurrences(markup, G43_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G43_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G43_TERMINAL_LINE), 1);
  assert.match(G43_NON_DECISION_RESULT, /RUNTIME REPRESENTATION AND NUMERIC THRESHOLDS REMAIN OPEN/);
  assert.match(G43_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculate\w*\s*\(/, /select\w*\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G43 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticEligibilityToQualificationQualitativeMappingReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticEligibilityToQualificationQualitativeMappingReference\.js'/);
  assert.match(component, /from '\.\/syntheticEligibilityToQualificationQualitativeMappingReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G43Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G43_SYNTHETIC_ELIGIBILITY_TO_QUALIFICATION_QUALITATIVE_MAPPING_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 9);
  assert.equal(allowlist.reference.terminal_token, G43_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G43_TERMINAL_LINE);
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
  assert.equal(allowlist.governance.stage_or_namespace_merging, 'PROHIBITED');
  assert.equal(allowlist.governance.gate_impact, 'NONE');
  assert.equal(allowlist.governance.implementation_readiness_gate, 'BLOCKED');
  assert.equal(allowlist.governance.synthetic_acceptance_gate, 'BLOCKED');
  assert.equal(allowlist.governance.production_launch_gate, 'BLOCKED');
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
