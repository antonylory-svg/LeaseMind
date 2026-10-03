import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticMinimumMutualFitThresholdGovernanceReference from '../src/synthetic/SyntheticMinimumMutualFitThresholdGovernanceReference.js';
import {
  G45_BOUNDARY_MATRIX,
  G45_DISCLAIMER,
  G45_GUARDRAILS,
  G45_INDEPENDENT_BOUNDARIES,
  G45_NON_DECISION_RESULT,
  G45_OPEN_CONTENT,
  G45_QUALIFICATION_BOUNDARY,
  G45_REGIONS,
  G45_ROLE_BOUNDARY,
  G45_SCOPE_LINE,
  G45_SOURCE_BOUNDARY,
  G45_TERMINAL_LINE,
  G45_TERMINAL_TOKEN,
  G45_TITLE
} from '../src/synthetic/syntheticMinimumMutualFitThresholdGovernanceReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-minimum-mutual-fit-threshold-governance-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticMinimumMutualFitThresholdGovernanceReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticMinimumMutualFitThresholdGovernanceReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticMinimumMutualFitThresholdGovernanceReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-minimum-mutual-fit-threshold-governance-reference', 'G45_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = 'd8598e134249cdb1cddb413240397750c132c150f80e54aa7473b9a295fc5c76';

type G45Allowlist = {
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

const EXPECTED_TITLE = 'SYNTHETIC MINIMUM MUTUAL-FIT THRESHOLD GOVERNANCE REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — GOVERNANCE AND EVIDENCE PREREQUISITES ARE NOT THRESHOLD APPROVAL';
const EXPECTED_SCOPE_LINE = 'NO MUTUAL-FIT OBJECT, FUNCTION, COMPARATOR, NUMERIC VALUE, DATASET, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = ['SOURCE AND STATUS BOUNDARY', 'ROLE AND AUTHORITY SEPARATION', 'QUALIFICATION-ONLY AND NON-COMPENSATION BOUNDARY', 'NO-SURROGATE / NO-DEFAULT AND FAIL-CLOSED BOUNDARY', 'OPEN EXACT CONTENT', 'NON-DECISION RESULT'] as const;

test('frozen title, permanent lines and six regions match the closed allowlist', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G45Allowlist;
  assert.equal(G45_TITLE, EXPECTED_TITLE);
  assert.equal(G45_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G45_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G45_REGIONS, EXPECTED_REGIONS);
  assert.equal(allowlist.reference.future_surface.title, EXPECTED_TITLE);
  assert.deepEqual(allowlist.reference.future_surface.permanent_lines, [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.future_surface.regions_in_order, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticMinimumMutualFitThresholdGovernanceReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
});

test('surface has one twelve-row matrix matching the closed allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMinimumMutualFitThresholdGovernanceReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G45Allowlist;
  assert.deepEqual(G45_BOUNDARY_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.deepEqual(allowlist.reference.matrix.map(row => row.row), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(G45_BOUNDARY_MATRIX.length, 12);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
});

test('source identities, partial status, counts and blocked gates remain exact', () => {
  const source = G45_SOURCE_BOUNDARY.join('\n');
  for (const token of ['XFR-D-034 v1.0 — PARTIALLY_RESOLVED_BOUNDARY', 'MQP-05 → XFR-D-034 — PRIMARY_STANDALONE', 'MSP-05 → XFR-D-034 — SECONDARY_BOUNDARY_REFERENCE', '102 SOURCE KEYS / 90 CANONICAL IDS', '20 ROWS', '18 ROWS', 'REMAIN BLOCKED']) assert.ok(source.includes(token), token);
});

test('roles and future approval authority remain exact and non-unilateral', () => {
  const roles = G45_ROLE_BOUNDARY.join('\n');
  for (const token of ['Chief AI Architect + PRODUCT', 'LEGAL + AI + DEVELOPMENT', 'AI + DEVELOPMENT', 'NO UNILATERAL', 'ALL FIVE FUNCTIONS', 'SAME VERSION / HASH', 'NO EVIDENCE PACKAGE', 'CI RESULT', 'COMMIT OR MERGE']) assert.ok(roles.includes(token), token);
  const governance = (JSON.parse(read(ALLOWLIST_PATH)) as G45Allowlist).governance;
  assert.equal(governance.evidence_owner_unilateral_approval, 'PROHIBITED');
  assert.equal(governance.automatic_action, 'PROHIBITED');
});

test('Qualification-only authority, evidence prerequisites and non-compensation stay frozen', () => {
  const boundary = G45_QUALIFICATION_BOUNDARY.join('\n');
  for (const token of ['ONLY QUALIFICATION PROGRESSION', 'MATCH SCORE', 'PRIORITY SCORE', 'RISK', 'HARD CONSTRAINT', 'MSP-05', 'SCORING HAS NO AUTHORITY', 'XFR-D-045', 'XFR-F1', 'BASELINE FIRST', 'FROZEN MANIFEST', 'TUNING / FINAL ISOLATION', 'NON-COMPENSATING']) assert.ok(boundary.includes(token), token);
});

test('surrogates and defaults are prohibited and fail closed affects only governed progression', () => {
  const guardrails = G45_GUARDRAILS.join('\n');
  for (const token of ['SCALE ENDPOINT', 'PILOT KPI', 'CONVERSION TARGET', 'CONVENTIONAL PERCENTAGE', 'ZERO', 'MIDPOINT', 'PRIOR', 'MODEL OUTPUT', 'IMPLEMENTATION DEFAULT', 'ONLY FOR THE AFFECTED QUALIFICATION PROGRESSION', 'NO NEGATIVE FACT', 'INELIGIBLE', 'NO PRODUCTION THRESHOLD']) assert.ok(guardrails.includes(token), token);
  const governance = (JSON.parse(read(ALLOWLIST_PATH)) as G45Allowlist).governance;
  assert.equal(governance.surrogate_or_hidden_default, 'PROHIBITED');
});

test('all exact threshold, evidence, policy and runtime contents remain open', () => {
  assert.equal(G45_OPEN_CONTENT.length, 8);
  const open = G45_OPEN_CONTENT.join('\n');
  for (const token of ['DEFINITION, OBJECT', 'FUNCTION, FORMULA', 'COMPARATOR, VALUE', 'PRECISION', 'TOLERANCE', 'XFR-F1', 'NUMERATOR', 'DENOMINATOR', 'STATISTICAL PROCEDURE', 'DATASET', 'POLICY', 'RBAC', 'SCHEMA', 'RUNTIME AND IMPLEMENTATION']) assert.ok(open.includes(token), token);
  const siblings = G45_INDEPENDENT_BOUNDARIES.join('\n');
  for (const token of ['XFR-D-035', 'XFR-D-036', 'XFR-D-M2', 'XFR-D-045', 'XFR-D-061', 'XFR-D-057', 'XFR-D-071', 'NO SIBLING BOUNDARY IS REOPENED']) assert.ok(siblings.includes(token), token);
});

test('terminal region is last, static and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMinimumMutualFitThresholdGovernanceReference));
  for (const value of [G45_NON_DECISION_RESULT, G45_TERMINAL_TOKEN, G45_TERMINAL_LINE]) assert.equal(occurrences(markup, value), 1, value);
  assert.match(G45_NON_DECISION_RESULT, /PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(G45_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /WebSocket/, /localStorage/, /sessionStorage/, /console\./, /setTimeout\s*\(/, /Math\.random\s*\(/, /calculate\w*\s*\(/, /select\w*\s*\(/, /sort\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G45 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticMinimumMutualFitThresholdGovernanceReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticMinimumMutualFitThresholdGovernanceReference\.js'/);
  assert.match(component, /from '\.\/syntheticMinimumMutualFitThresholdGovernanceReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G45Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G45_SYNTHETIC_MINIMUM_MUTUAL_FIT_THRESHOLD_GOVERNANCE_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 8);
  assert.equal(allowlist.reference.terminal_token, G45_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G45_TERMINAL_LINE);
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
