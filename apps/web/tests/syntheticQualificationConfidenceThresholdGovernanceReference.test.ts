import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticQualificationConfidenceThresholdGovernanceReference from '../src/synthetic/SyntheticQualificationConfidenceThresholdGovernanceReference.js';
import {
  G46_BOUNDARY_MATRIX,
  G46_DISCLAIMER,
  G46_INDEPENDENT_BOUNDARIES,
  G46_NON_DECISION_RESULT,
  G46_OPEN_CONTENT,
  G46_QUALIFICATION_BOUNDARY,
  G46_REGIONS,
  G46_ROLE_BOUNDARY,
  G46_SCOPE_LINE,
  G46_SEMANTIC_CALIBRATION_BOUNDARY,
  G46_SOURCE_BOUNDARY,
  G46_SURROGATE_GUARDRAILS,
  G46_TERMINAL_LINE,
  G46_TERMINAL_TOKEN,
  G46_TITLE
} from '../src/synthetic/syntheticQualificationConfidenceThresholdGovernanceReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-qualification-confidence-threshold-governance-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticQualificationConfidenceThresholdGovernanceReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticQualificationConfidenceThresholdGovernanceReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticQualificationConfidenceThresholdGovernanceReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-qualification-confidence-threshold-governance-reference', 'G46_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '234d501154183c3f85636abf3dff2ae41e06679373b9dca9135f35409d1074f4';

type G46Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string | boolean>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: {
    future_surface: { title: string; permanent_lines: string[]; regions_in_order: string[] };
    matrix: Array<{ row: number; frozen: string }>;
    open_exact_content: string[];
    terminal_token: string;
    terminal_line: string;
  };
};

const EXPECTED_TITLE = 'SYNTHETIC QUALIFICATION CONFIDENCE THRESHOLD GOVERNANCE REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — CONFIDENCE GOVERNANCE AND CALIBRATION EVIDENCE ARE NOT CUTOFF APPROVAL';
const EXPECTED_SCOPE_LINE = 'NO CONFIDENCE DEFINITION, CALIBRATION, COMPARATOR, NUMERIC CUTOFF, DATASET, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = ['SOURCE AND STATUS BOUNDARY', 'ROLE AND AUTHORITY SEPARATION', 'CONFIDENCE SEMANTIC AND CALIBRATION SEPARATION', 'QUALIFICATION-ONLY / NON-COMPENSATION / FAIL-CLOSED BOUNDARY', 'NO-SURROGATE / NO-DEFAULT AND OPEN EXACT CONTENT', 'NON-DECISION RESULT'] as const;

test('frozen title, permanent lines and six regions match the closed allowlist', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G46Allowlist;
  assert.equal(G46_TITLE, EXPECTED_TITLE);
  assert.equal(G46_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G46_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G46_REGIONS, EXPECTED_REGIONS);
  assert.equal(allowlist.reference.future_surface.title, EXPECTED_TITLE);
  assert.deepEqual(allowlist.reference.future_surface.permanent_lines, [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.future_surface.regions_in_order, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationConfidenceThresholdGovernanceReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
});

test('surface has one twelve-row matrix matching the closed allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationConfidenceThresholdGovernanceReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G46Allowlist;
  assert.deepEqual(G46_BOUNDARY_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.deepEqual(allowlist.reference.matrix.map(row => row.row), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(G46_BOUNDARY_MATRIX.length, 12);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
});

test('source identity, partial status, counts and blocked gates remain exact', () => {
  const source = G46_SOURCE_BOUNDARY.join('\n');
  for (const token of ['XFR-D-035 v1.0 — PARTIALLY_RESOLVED_BOUNDARY', 'MQP-06 → XFR-D-035 — PRIMARY_STANDALONE', '102 SOURCE KEYS / 90 CANONICAL IDS', '20 ROWS', 'REMAIN BLOCKED']) assert.ok(source.includes(token), token);
});

test('roles and future approval authority remain exact and non-unilateral', () => {
  const roles = G46_ROLE_BOUNDARY.join('\n');
  for (const token of ['Chief AI Architect + PRODUCT', 'LEGAL + AI + DEVELOPMENT', 'AI + DEVELOPMENT', 'NO UNILATERAL', 'NEW VERSIONED XFR-D-035', 'VERSION / HASH BUNDLE', 'CI RESULT', 'COMMIT OR MERGE']) assert.ok(roles.includes(token), token);
  const governance = (JSON.parse(read(ALLOWLIST_PATH)) as G46Allowlist).governance;
  assert.equal(governance.evidence_owner_unilateral_approval, 'PROHIBITED');
  assert.equal(governance.automatic_action, 'PROHIBITED');
});

test('Confidence semantics stay separate and calibration remains prerequisite not cutoff', () => {
  const boundary = G46_SEMANTIC_CALIBRATION_BOUNDARY.join('\n');
  for (const token of ['RELIABILITY, NOT PAIR ATTRACTIVENESS', 'EVIDENCE_STATUS', 'REQUIRED_EVIDENCE_LEVEL', 'MODEL PROBABILITY', 'AI SELF-CONFIDENCE', 'MATCH SCORE', 'RISK SCORE', 'UNKNOWN', 'ABSTENTION', 'XFR-D-063', 'PREREQUISITE', 'IS NOT THE CUTOFF']) assert.ok(boundary.includes(token), token);
  const governance = (JSON.parse(read(ALLOWLIST_PATH)) as G46Allowlist).governance;
  assert.equal(governance.calibration_as_cutoff, 'PROHIBITED');
  assert.equal(governance.cross_semantic_mapping, 'NOT_APPROVED');
});

test('Qualification-only authority, evidence prerequisites, non-compensation and fail closed stay frozen', () => {
  const boundary = G46_QUALIFICATION_BOUNDARY.join('\n');
  for (const token of ['ONLY AFFECTED QUALIFICATION PROGRESSION', 'MATCH SCORE', 'PRIORITY SCORE', 'HARD CONSTRAINT', 'XFR-D-045', 'XFR-F1', 'BASELINE FIRST', 'FROZEN MANIFEST', 'TUNING / UNTOUCHED-FINAL ISOLATION', 'NON-COMPENSATING', 'NO NEGATIVE FACT', 'NO AUTOMATIC ROUTE']) assert.ok(boundary.includes(token), token);
});

test('surrogates and defaults are prohibited while exact content remains open', () => {
  const guardrails = G46_SURROGATE_GUARDRAILS.join('\n');
  for (const token of ['MODEL PROBABILITY', 'MIDPOINT', 'PERCENTILE', 'PRIOR-VERSION CUTOFF', 'CALIBRATION TARGET', 'PILOT KPI', 'UI BAND', 'IMPLEMENTATION DEFAULT', 'NO ORDERING', 'NO PRODUCTION CUTOFF']) assert.ok(guardrails.includes(token), token);
  assert.equal(G46_OPEN_CONTENT.length, 8);
  const open = G46_OPEN_CONTENT.join('\n');
  for (const token of ['FORMULA', 'QUALIFICATION APPLICABILITY', 'CALIBRATION DEFINITION', 'COMPARATOR, VALUE', 'PRECISION', 'BAND', 'XFR-F1', 'STATISTICAL', 'POLICY', 'RUNTIME AND IMPLEMENTATION']) assert.ok(open.includes(token), token);
});

test('independent boundaries remain separate and no sibling is absorbed', () => {
  const siblings = G46_INDEPENDENT_BOUNDARIES.join('\n');
  for (const token of ['XFR-D-034', 'XFR-D-036', 'XFR-D-M1', 'XFR-D-M6', 'XFR-D-045', 'XFR-D-063', 'XFR-D-069', 'XFR-D-M2', 'XFR-D-057', 'XFR-D-071', 'NO SIBLING BOUNDARY IS REOPENED']) assert.ok(siblings.includes(token), token);
});

test('terminal region is last, static and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationConfidenceThresholdGovernanceReference));
  for (const value of [G46_NON_DECISION_RESULT, G46_TERMINAL_TOKEN, G46_TERMINAL_LINE]) assert.equal(occurrences(markup, value), 1, value);
  assert.match(G46_NON_DECISION_RESULT, /PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(G46_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /WebSocket/, /localStorage/, /sessionStorage/, /console\./, /setTimeout\s*\(/, /Math\.random\s*\(/, /calculate\w*\s*\(/, /select\w*\s*\(/, /sort\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G46 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticQualificationConfidenceThresholdGovernanceReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticQualificationConfidenceThresholdGovernanceReference\.js'/);
  assert.match(component, /from '\.\/syntheticQualificationConfidenceThresholdGovernanceReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G46Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G46_SYNTHETIC_QUALIFICATION_CONFIDENCE_THRESHOLD_GOVERNANCE_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 8);
  assert.equal(allowlist.reference.terminal_token, G46_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G46_TERMINAL_LINE);
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
  assert.equal(allowlist.governance.surrogate_or_hidden_default, 'PROHIBITED');
  assert.equal(allowlist.governance.gate_impact, 'NONE');
  assert.equal(allowlist.governance.implementation_readiness_gate, 'BLOCKED');
  assert.equal(allowlist.governance.synthetic_acceptance_gate, 'BLOCKED');
  assert.equal(allowlist.governance.production_launch_gate, 'BLOCKED');
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
