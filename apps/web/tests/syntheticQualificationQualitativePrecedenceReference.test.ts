import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticQualificationQualitativePrecedenceReference from '../src/synthetic/SyntheticQualificationQualitativePrecedenceReference.js';
import {
  G44_BOUNDARY_MATRIX,
  G44_DISCLAIMER,
  G44_INDEPENDENT_BOUNDARIES,
  G44_MULTI_CAUSE_SEPARATION,
  G44_NON_COMPENSATION,
  G44_NON_DECISION_RESULT,
  G44_OPEN_CONTENT,
  G44_PRECEDENCE_HIERARCHY,
  G44_REGIONS,
  G44_SCOPE_LINE,
  G44_SOURCE_BOUNDARY,
  G44_TERMINAL_LINE,
  G44_TERMINAL_TOKEN,
  G44_TITLE
} from '../src/synthetic/syntheticQualificationQualitativePrecedenceReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-qualification-qualitative-precedence-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticQualificationQualitativePrecedenceReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticQualificationQualitativePrecedenceReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticQualificationQualitativePrecedenceReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-qualification-qualitative-precedence-reference', 'G44_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = 'f3c2a97512f1562c8f8587aeadb67fdf2518c020620a5bcdab2693d4a8ec0155';

type G44Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string | boolean>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: {
    precedence_hierarchy: string[];
    future_surface: { title: string; permanent_lines: string[]; regions_in_order: string[] };
    matrix: Array<{ row: number; frozen: string }>;
    open_exact_content: string[];
    terminal_token: string;
    terminal_line: string;
  };
};

const EXPECTED_TITLE = 'SYNTHETIC QUALIFICATION QUALITATIVE-PRECEDENCE REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — QUALITATIVE PRECEDENCE IS NOT NUMERIC SEVERITY, REASON-CATALOG ORDER OR RUNTIME ALGORITHM APPROVAL';
const EXPECTED_SCOPE_LINE = 'NO NUMERIC THRESHOLD, SEVERITY REGISTRY, REASON-CATALOG ORDER, RUNTIME ALGORITHM, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = ['SOURCE AND STATUS BOUNDARY', 'QUALITATIVE PRECEDENCE HIERARCHY', 'NON-COMPENSATION BOUNDARY', 'MULTI-CAUSE AND PRIMARY-REASON SEPARATION', 'OPEN EXACT CONTENT', 'NON-DECISION RESULT'] as const;

test('frozen title, permanent lines and six regions match the closed allowlist', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G44Allowlist;
  assert.equal(G44_TITLE, EXPECTED_TITLE);
  assert.equal(G44_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G44_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G44_REGIONS, EXPECTED_REGIONS);
  assert.equal(allowlist.reference.future_surface.title, EXPECTED_TITLE);
  assert.deepEqual(allowlist.reference.future_surface.permanent_lines, [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.future_surface.regions_in_order, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationQualitativePrecedenceReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has one twelve-row matrix matching the closed allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationQualitativePrecedenceReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G44Allowlist;
  assert.deepEqual(G44_BOUNDARY_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.deepEqual(allowlist.reference.matrix.map(row => row.row), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(G44_BOUNDARY_MATRIX.length, 12);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of G44_BOUNDARY_MATRIX) assert.equal(occurrences(markup, `>${row.matrixRow}</th>`), 1, row.matrixRow);
});

test('source identity, status, scope, counts and roles remain exact', () => {
  const source = G44_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-033 v1\.0 — APPROVED QUALITATIVE PRECEDENCE — numeric thresholds and reason catalog remain OPEN/);
  assert.match(source, /MQP-04 → XFR-D-033 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /20 ROWS/);
  for (const token of ['DETERMINISTIC FAIL-CLOSED', 'Chief AI Architect + PRODUCT', 'LEGAL + DEVELOPMENT', 'AI REMAINS CONSULTED', 'REMAIN BLOCKED']) assert.ok(source.includes(token), token);
});

test('four-level hierarchy, complete evidence and STALE orthogonality remain exact', () => {
  assert.equal(G44_PRECEDENCE_HIERARCHY.length, 5);
  const hierarchy = G44_PRECEDENCE_HIERARCHY.join('\n');
  for (const token of ['1 — CONFIRMED ELIGIBILITY INELIGIBLE', 'COMPLETE SIX-PART', 'REJECTED_BY_MATCHING', '2 — MANDATORY HUMAN-REVIEW', 'HUMAN_REVIEW_REQUIRED', '3 — UNRESOLVED VERIFICATION', 'NEEDS_VERIFICATION', '4 — QUALIFIED_HYPOTHESIS', 'ALL THREE HIGHER CLASSES ARE ABSENT', 'ARCHITECTURE §18.1', 'STALE REMAINS ORTHOGONAL', 'NOT A ROUTING RESULT OR FIFTH']) assert.ok(hierarchy.includes(token), token);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G44Allowlist;
  assert.equal(allowlist.reference.precedence_hierarchy.length, 4);
  assert.equal(allowlist.governance.stale_authority, 'XFR-D-038');
});

test('non-compensation prohibits favorable-signal overrides', () => {
  const boundary = G44_NON_COMPENSATION.join('\n');
  for (const token of ['SCORE CANNOT', 'RANK CANNOT', 'CONFIDENCE CANNOT', 'OTHER FAVORABLE SIGNAL', 'HARD-CONSTRAINT FAILURE', 'MANDATORY HUMAN REVIEW', 'UNRESOLVED REQUIRED VERIFICATION', 'CAUSE COUNT', 'DOES NOT CREATE A NUMERIC SEVERITY', 'NO LOWER CLASS', 'QUALIFIED_HYPOTHESIS']) assert.ok(boundary.includes(token), token);
  const governance = (JSON.parse(read(ALLOWLIST_PATH)) as G44Allowlist).governance;
  assert.equal(governance.favorable_signal_compensation, 'PROHIBITED');
});

test('all causes remain while route and primary-reason authority stay separate', () => {
  const separation = G44_MULTI_CAUSE_SEPARATION.join('\n');
  for (const token of ['SELECTS ONE FINAL ROUTE', 'NEVER DELETES OTHER APPLICABLE CAUSES', 'EVIDENCE REFERENCES', 'XFR-D-040', 'SAME-CLASS SEMANTIC ORDER', 'REMAIN OPEN', 'IDENTIFIER', 'SQL', 'NO SEMANTIC PRIORITY', 'MULTIPLICITY', 'XFR-D-039 v1.1', 'DOES NOT RECALCULATE THE ROUTE']) assert.ok(separation.includes(token), token);
  const governance = (JSON.parse(read(ALLOWLIST_PATH)) as G44Allowlist).governance;
  assert.equal(governance.all_causes_preserved, true);
  assert.equal(governance.primary_reason_authority, 'XFR-D-040');
  assert.equal(governance.incidental_order_as_semantic_priority, 'PROHIBITED');
});

test('all exact contents remain open and sibling boundaries remain independent', () => {
  assert.equal(G44_OPEN_CONTENT.length, 9);
  const open = G44_OPEN_CONTENT.join('\n');
  for (const token of ['NUMERIC THRESHOLDS', 'SEVERITY REGISTRY', 'REASON-CATALOG', 'SAME-CLASS', 'RUNTIME PRECEDENCE ALGORITHM', 'ENUM, FIELD, CARRIER', 'COMPATIBILITY', 'EVIDENCE, PROVENANCE', 'DATA CONTRACTS', 'IMPLEMENTATION', 'GATES']) assert.ok(open.includes(token), token);
  const siblings = G44_INDEPENDENT_BOUNDARIES.join('\n');
  for (const token of ['XFR-D-032', 'XFR-D-038', 'XFR-D-039 v1.1', 'XFR-D-040', 'XFR-D-041', 'XFR-D-043', 'XFR-D-044', 'XFR-D-055', 'XFR-D-M2', 'NO SIBLING BOUNDARY IS REOPENED']) assert.ok(siblings.includes(token), token);
});

test('terminal region is last, static and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationQualitativePrecedenceReference));
  assert.equal(occurrences(markup, G44_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G44_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G44_TERMINAL_LINE), 1);
  assert.match(G44_NON_DECISION_RESULT, /NUMERIC THRESHOLDS AND REASON CATALOG REMAIN OPEN/);
  assert.match(G44_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculate\w*\s*\(/, /select\w*\s*\(/, /sort\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G44 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticQualificationQualitativePrecedenceReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticQualificationQualitativePrecedenceReference\.js'/);
  assert.match(component, /from '\.\/syntheticQualificationQualitativePrecedenceReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G44Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G44_SYNTHETIC_QUALIFICATION_QUALITATIVE_PRECEDENCE_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 9);
  assert.equal(allowlist.reference.terminal_token, G44_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G44_TERMINAL_LINE);
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
