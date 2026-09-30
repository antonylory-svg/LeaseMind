import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticWeightPolicyQualitativeGovernanceReference from '../src/synthetic/SyntheticWeightPolicyQualitativeGovernanceReference.js';
import {
  G36_DISCLAIMER,
  G36_FAIL_CLOSED_AND_EVIDENCE,
  G36_GOVERNANCE_MATRIX,
  G36_NON_DECISION_RESULT,
  G36_OPEN_CONTENT,
  G36_PARAMETER_AND_AUTHORITY_BOUNDARY,
  G36_PROHIBITED_SURROGATES,
  G36_REGIONS,
  G36_ROLE_SEPARATION,
  G36_SCOPE_LINE,
  G36_SOURCE_BOUNDARY,
  G36_TERMINAL_LINE,
  G36_TERMINAL_TOKEN,
  G36_TITLE
} from '../src/synthetic/syntheticWeightPolicyQualitativeGovernanceReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-weight-policy-qualitative-governance-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticWeightPolicyQualitativeGovernanceReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticWeightPolicyQualitativeGovernanceReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticWeightPolicyQualitativeGovernanceReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-weight-policy-qualitative-governance-reference', 'G36_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = 'ac7976506d2fd239394a9a954dfed748ba1a1f60255f4b4048aba9853e5d8b65';

type G36Allowlist = {
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

const EXPECTED_TITLE = 'SYNTHETIC WEIGHT-POLICY QUALITATIVE GOVERNANCE REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — QUALITATIVE WEIGHT-POLICY GOVERNANCE AND EVIDENCE BOUNDARY ONLY';
const EXPECTED_SCOPE_LINE = 'NO WEIGHT, RATIO, FORMULA, NORMALIZATION, THRESHOLD, SEGMENT OVERRIDE, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = [
  'SOURCE AND STATUS BOUNDARY',
  'WEIGHT-POLICY QUALITATIVE MATRIX',
  'ROLE AND ARTIFACT-OWNER SEPARATION',
  'PARAMETER-FAMILY, GLOBAL-BASELINE, SEGMENT-OVERRIDE AND HARD-CONSTRAINT BOUNDARY',
  'OPEN EXACT CONTENT',
  'NON-DECISION RESULT'
] as const;
const EXPECTED_ROLES = [
  'XFR-D-M5 SUBSTANTIVE GOVERNANCE OWNER: AI + PRODUCT — SOURCE_NORMATIVE, ARCHITECTURE §37 QUESTION №3',
  'SCORING POLICY ARTIFACT OWNER: Chief AI Architect + PRODUCT — SEPARATELY SOURCE_NORMATIVE, ARCHITECTURE §52',
  'MANDATORY APPROVERS: Chief AI Architect + LEGAL + DEVELOPMENT — HUMAN-APPROVED DECISION-SPECIFIC ASSIGNMENT',
  'EVIDENCE/TECHNICAL-PROCEDURE OWNER: AI + DEVELOPMENT — NO UNILATERAL VALUE, EVIDENCE-SUFFICIENCY, POLICY, PRODUCTION, RELEASE, RUNTIME, IMPLEMENTATION OR GATE AUTHORITY',
  'G36 ASSIGNS NO NEW OWNER, MERGES NO ROLES, WIDENS NO AUTHORITY AND CREATES NO SELF-APPROVAL PATH'
] as const;

test('frozen title, permanent lines and six regions render independently in exact order', () => {
  assert.equal(G36_TITLE, EXPECTED_TITLE);
  assert.equal(G36_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G36_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G36_REGIONS, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticWeightPolicyQualitativeGovernanceReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one semantic twelve-row matrix matching the allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticWeightPolicyQualitativeGovernanceReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G36Allowlist;
  assert.deepEqual(G36_GOVERNANCE_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of G36_GOVERNANCE_MATRIX) assert.equal(occurrences(markup, `>${row.matrixRow}</th>`), 1, row.matrixRow);
});

test('source identity and every authority mapping remain exact and non-conflated', () => {
  const source = G36_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-M5 v1\.0 — PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(source, /MSP-02 \+ MSP-03 → XFR-D-M5/);
  assert.match(source, /BOTH SOURCE KEYS REMAIN PRIMARY_MERGED_MEMBER/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /REMAIN BLOCKED/);
  assert.deepEqual(G36_ROLE_SEPARATION, EXPECTED_ROLES);
});

test('parameter families, global authority, lawful membership and hard constraints stay separated', () => {
  assert.equal(G36_GOVERNANCE_MATRIX.length, 12);
  assert.equal(G36_PARAMETER_AND_AUTHORITY_BOUNDARY.length, 6);
  const boundary = G36_PARAMETER_AND_AUTHORITY_BOUNDARY.join('\n');
  for (const token of ['GLOBAL AND STARTING WEIGHTS', 'SEGMENT-SPECIFIC WEIGHTS', 'RECIPROCAL FIT ↔ DEAL FEASIBILITY', 'DOES NOT COLLAPSE', 'GLOBAL BASELINE IS SOLE SCORING AUTHORITY', 'VERSION/HASH-BOUND', 'EXPLICIT, SOURCE-AUTHORITATIVE, LAWFUL AND APPLICABLE', 'NEVER GUESSED', 'ACTIVATES NO OVERRIDE', 'HANDLED BEFORE SCORING', 'CANNOT BE SOFTENED OR COMPENSATED']) assert.ok(boundary.includes(token), token);
});

test('fail-closed, evidence, history, open content and prohibited surrogates remain explicit', () => {
  assert.equal(G36_FAIL_CLOSED_AND_EVIDENCE.length, 7);
  assert.equal(G36_OPEN_CONTENT.length, 10);
  assert.equal(G36_PROHIBITED_SURROGATES.length, 3);
  const failClosed = G36_FAIL_CLOSED_AND_EVIDENCE.join('\n');
  for (const token of ['BLOCKS ONLY THE AFFECTED', 'NO ZERO, EQUAL', 'AI-INFERRED DEFAULT', 'NEGATIVE FIT FACT', 'CANNOT COMPENSATE', 'PREREQUISITES, NOT APPROVALS', 'NEVER SILENTLY RECALCULATED', 'NO RESULT AUTOMATICALLY CHANGES']) assert.ok(failClosed.includes(token), token);
  const open = G36_OPEN_CONTENT.join('\n');
  for (const token of ['GLOBAL, STARTING', 'RATIO', 'MINIMUM-THRESHOLD VALUE', 'SEGMENT UNIVERSE', 'GLOBAL BASELINE', 'MUTUAL AGGREGATE', 'NUMERIC REPRESENTATION', 'DATASET', 'PRODUCTION-DATA AUTHORITY', 'RUNTIME']) assert.ok(open.includes(token), token);
  const surrogates = G36_PROHIBITED_SURROGATES.join('\n');
  for (const token of ['0.5/0.5', '100-CAMPAIGN', '40%', '25%', 'SUPPLY NO WEIGHT', 'REMAIN INDEPENDENT']) assert.ok(surrogates.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticWeightPolicyQualitativeGovernanceReference));
  assert.equal(occurrences(markup, G36_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G36_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G36_TERMINAL_LINE), 1);
  assert.match(G36_NON_DECISION_RESULT, /REMAINS PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(G36_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticWeightPolicyQualitativeGovernanceReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateWeight/, /computeScore/, /selectOverride/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G36 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticWeightPolicyQualitativeGovernanceReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticWeightPolicyQualitativeGovernanceReference\.js'/);
  assert.match(component, /from '\.\/syntheticWeightPolicyQualitativeGovernanceReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G36Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G36_SYNTHETIC_WEIGHT_POLICY_QUALITATIVE_GOVERNANCE_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 10);
  assert.equal(allowlist.reference.terminal_token, G36_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G36_TERMINAL_LINE);
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
