import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticCriticalConflictingEvidenceQualitativeCriticalityReference from '../src/synthetic/SyntheticCriticalConflictingEvidenceQualitativeCriticalityReference.js';
import {
  G48_BOUNDARY_MATRIX,
  G48_CRITICALITY_BOUNDARY,
  G48_DISCLAIMER,
  G48_INDEPENDENT_BOUNDARIES,
  G48_NONCRITICAL_BOUNDARY,
  G48_NON_DECISION_RESULT,
  G48_OPEN_CONTENT,
  G48_OUTCOME_CLASSES,
  G48_PRECEDENCE_BOUNDARY,
  G48_REGIONS,
  G48_ROLE_BOUNDARY,
  G48_SCOPE_LINE,
  G48_SOURCE_BOUNDARY,
  G48_SURROGATE_GUARDRAILS,
  G48_TERMINAL_LINE,
  G48_TERMINAL_TOKEN,
  G48_TITLE
} from '../src/synthetic/syntheticCriticalConflictingEvidenceQualitativeCriticalityReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-critical-conflicting-evidence-qualitative-criticality-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticCriticalConflictingEvidenceQualitativeCriticalityReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticCriticalConflictingEvidenceQualitativeCriticalityReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticCriticalConflictingEvidenceQualitativeCriticalityReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-critical-conflicting-evidence-qualitative-criticality-reference', 'G48_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '9f0a60b95cfdbf4bbfe50ef4e0cca188015e27907ff1700e84ee3e87e92c68b5';

type G48Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string | boolean>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: {
    criticality_outcome_classes: string[];
    future_surface: { title: string; permanent_lines: string[]; regions_in_order: string[] };
    matrix: Array<{ row: number; frozen: string }>;
    open_exact_content: string[];
    terminal_token: string;
    terminal_line: string;
  };
};

const EXPECTED_TITLE = 'SYNTHETIC CRITICAL CONFLICTING-EVIDENCE QUALITATIVE-CRITICALITY REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — OUTCOME-SENSITIVE CRITICALITY IS NOT NUMERIC THRESHOLD, CRITICAL-FIELD CATALOG OR RUNTIME CLASSIFIER APPROVAL';
const EXPECTED_SCOPE_LINE = 'NO NUMERIC THRESHOLD, EXHAUSTIVE CRITICAL-FIELD CATALOG, SEVERITY SCALE, RUNTIME CLASSIFIER, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = ['SOURCE AND STATUS BOUNDARY', 'OUTCOME-SENSITIVE CRITICALITY BOUNDARY', 'QUALIFICATION PRECEDENCE AND HUMAN-REVIEW BOUNDARY', 'NONCRITICAL CONFLICT PRESERVATION AND NON-NEGATIVE BOUNDARY', 'OPEN EXACT CONTENT', 'NON-DECISION RESULT'] as const;

test('frozen title, permanent lines and six regions match the closed allowlist', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G48Allowlist;
  assert.equal(G48_TITLE, EXPECTED_TITLE);
  assert.equal(G48_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G48_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G48_REGIONS, EXPECTED_REGIONS);
  assert.equal(allowlist.reference.future_surface.title, EXPECTED_TITLE);
  assert.deepEqual(allowlist.reference.future_surface.permanent_lines, [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.future_surface.regions_in_order, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticCriticalConflictingEvidenceQualitativeCriticalityReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
});

test('surface has one twelve-row matrix matching the closed allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticCriticalConflictingEvidenceQualitativeCriticalityReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G48Allowlist;
  assert.deepEqual(G48_BOUNDARY_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.deepEqual(allowlist.reference.matrix.map(row => row.row), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(G48_BOUNDARY_MATRIX.length, 12);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
});

test('source identity, qualitative status, counts and blocked gates remain exact', () => {
  const source = G48_SOURCE_BOUNDARY.join('\n');
  for (const token of ['XFR-D-037 v1.0 — RESOLVED_QUALITATIVE_BOUNDARY', 'MQP-10 → XFR-D-037 — PRIMARY_STANDALONE', '102 SOURCE KEYS / 90 CANONICAL IDS', '20 ROWS', 'REMAIN BLOCKED']) assert.ok(source.includes(token), token);
});

test('roles and change control remain exact and non-unilateral', () => {
  const roles = G48_ROLE_BOUNDARY.join('\n');
  for (const token of ['Chief AI Architect + PRODUCT', 'LEGAL + DEVELOPMENT', 'AI — WITHOUT UNILATERAL', 'NEW VERSIONED RECORD', 'SUPERSEDES', 'CI RESULT', 'COMMIT OR MERGE']) assert.ok(roles.includes(token), token);
  const governance = (JSON.parse(read(ALLOWLIST_PATH)) as G48Allowlist).governance;
  assert.equal(governance.consulted_function_unilateral_approval, 'PROHIBITED');
  assert.equal(governance.automatic_action, 'PROHIBITED');
});

test('all five outcome-sensitive criticality classes remain exact', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G48Allowlist;
  assert.equal(G48_OUTCOME_CLASSES.length, 5);
  assert.deepEqual(G48_OUTCOME_CLASSES, [
    'ELIGIBILITY RESULT',
    'ANY OF THE FOUR QUALIFICATION RESULTS',
    'A HARD CONSTRAINT OR MANDATORY ARCHITECTURE SECTION 18.1 CONDITION',
    'A PROTECTED-ATTRIBUTE / PROXY, LAWFUL-BASIS, AUTHORITY OR OTHER LEGAL / RIGHTS BOUNDARY',
    'SAFE PRESENTATION OR SUBSEQUENT DISCLOSURE ADMISSIBILITY'
  ]);
  assert.equal(allowlist.reference.criticality_outcome_classes.length, 5);
  const boundary = G48_CRITICALITY_BOUNDARY.join('\n');
  for (const token of ['OUTCOME-SENSITIVE', 'NOT A FIELD CATALOG', 'DOES NOT SELECT ONE VERSION AS TRUTH', 'CANNOT SUBSTITUTE']) assert.ok(boundary.includes(token), token);
});

test('human-review routing stays under XFR-D-033 precedence and non-compensation', () => {
  const boundary = G48_PRECEDENCE_BOUNDARY.join('\n');
  for (const token of ['HUMAN_REVIEW_REQUIRED', 'XFR-D-033', 'INELIGIBLE', 'HIGHER PRECEDENCE', 'DOES NOT DELETE', 'NOT A QUEUE ITEM', 'CANNOT COMPENSATE']) assert.ok(boundary.includes(token), token);
});

test('noncritical conflict preserves evidence and remains non-negative', () => {
  const boundary = G48_NONCRITICAL_BOUNDARY.join('\n');
  for (const token of ['PRESERVES ALL CONFLICTING VERSIONS', 'EVIDENCE REFERENCES', 'REDUCES CONFIDENCE', 'NOT A NEGATIVE FACT', 'NO AUTOMATIC REJECTION', 'NO AUTOMATIC ROUTE', 'SEPARATELY APPROVED']) assert.ok(boundary.includes(token), token);
});

test('surrogates are prohibited while exact content remains open', () => {
  const guardrails = G48_SURROGATE_GUARDRAILS.join('\n');
  for (const token of ['SEVERITY SCORE', 'NUMERIC CUTOFF', 'CRITICAL-DATA MEMBERSHIP', 'EVIDENCE STATUS', 'CONFIDENCE CUTOFF', 'UI LABEL', 'IMPLEMENTATION DEFAULT', 'NO RUNTIME CLASSIFIER', 'NO PRODUCTION CLASSIFIER']) assert.ok(guardrails.includes(token), token);
  assert.equal(G48_OPEN_CONTENT.length, 8);
  const open = G48_OPEN_CONTENT.join('\n');
  for (const token of ['NUMERIC THRESHOLD', 'CRITICAL-FIELD CATALOG', 'CONFLICT DETECTION', 'PROOF STANDARD', 'MULTIPLE-CONFLICT', 'CONFIDENCE REDUCTION FORMULA', 'REVIEWER APPOINTMENT', 'QUALIFICATION POLICY', 'RUNTIME', 'GATES']) assert.ok(open.includes(token), token);
});

test('independent boundaries remain separate and no sibling is absorbed', () => {
  const siblings = G48_INDEPENDENT_BOUNDARIES.join('\n');
  for (const token of ['XFR-D-033', 'XFR-D-040', 'XFR-D-038', 'XFR-D-041', 'XFR-D-043', 'XFR-D-034', 'XFR-D-035', 'XFR-D-036', 'XFR-D-045', 'XFR-D-044', 'NO SIBLING BOUNDARY IS REOPENED']) assert.ok(siblings.includes(token), token);
});

test('terminal region is last, static and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticCriticalConflictingEvidenceQualitativeCriticalityReference));
  for (const value of [G48_NON_DECISION_RESULT, G48_TERMINAL_TOKEN, G48_TERMINAL_LINE]) assert.equal(occurrences(markup, value), 1, value);
  assert.match(G48_NON_DECISION_RESULT, /RESOLVED_QUALITATIVE_BOUNDARY/);
  assert.match(G48_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /WebSocket/, /localStorage/, /sessionStorage/, /console\./, /setTimeout\s*\(/, /Math\.random\s*\(/, /calculate\w*\s*\(/, /select\w*\s*\(/, /sort\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G48 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticCriticalConflictingEvidenceQualitativeCriticalityReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticCriticalConflictingEvidenceQualitativeCriticalityReference\.js'/);
  assert.match(component, /from '\.\/syntheticCriticalConflictingEvidenceQualitativeCriticalityReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G48Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G48_SYNTHETIC_CRITICAL_CONFLICTING_EVIDENCE_QUALITATIVE_CRITICALITY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 8);
  assert.equal(allowlist.reference.terminal_token, G48_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G48_TERMINAL_LINE);
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
  assert.equal(allowlist.governance.numeric_or_catalog_surrogate, 'PROHIBITED');
  assert.equal(allowlist.governance.gate_impact, 'NONE');
  assert.equal(allowlist.governance.implementation_readiness_gate, 'BLOCKED');
  assert.equal(allowlist.governance.synthetic_acceptance_gate, 'BLOCKED');
  assert.equal(allowlist.governance.production_launch_gate, 'BLOCKED');
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
