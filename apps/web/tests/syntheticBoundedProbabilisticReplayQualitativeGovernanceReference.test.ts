import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticBoundedProbabilisticReplayQualitativeGovernanceReference from '../src/synthetic/SyntheticBoundedProbabilisticReplayQualitativeGovernanceReference.js';
import {
  G35_DISCLAIMER,
  G35_FAIL_CLOSED_AND_EVIDENCE,
  G35_GOVERNANCE_MATRIX,
  G35_NON_DECISION_RESULT,
  G35_OPEN_CONTENT,
  G35_PROHIBITED_SURROGATES,
  G35_REGIONS,
  G35_REPLAY_SEPARATION,
  G35_ROLE_SEPARATION,
  G35_SCOPE_LINE,
  G35_SOURCE_BOUNDARY,
  G35_TERMINAL_LINE,
  G35_TERMINAL_TOKEN,
  G35_TITLE
} from '../src/synthetic/syntheticBoundedProbabilisticReplayQualitativeGovernanceReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-bounded-probabilistic-replay-qualitative-governance-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticBoundedProbabilisticReplayQualitativeGovernanceReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticBoundedProbabilisticReplayQualitativeGovernanceReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticBoundedProbabilisticReplayQualitativeGovernanceReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-bounded-probabilistic-replay-qualitative-governance-reference', 'G35_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '737ffb265583d701fc5519f2b08027c38820eca36a772d6283180dc55d7693cf';

type G35Allowlist = {
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

const EXPECTED_TITLE =
  'SYNTHETIC BOUNDED PROBABILISTIC REPLAY QUALITATIVE GOVERNANCE REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER =
  'MANUAL DEV-ONLY REFERENCE — QUALITATIVE REPLAY GOVERNANCE AND EVIDENCE BOUNDARY ONLY';
const EXPECTED_SCOPE_LINE =
  'NO REPLAY TOLERANCE, ERROR METRIC, REASON INVARIANT, MODE SELECTION, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = [
  'SOURCE AND STATUS BOUNDARY',
  'REPLAY-GOVERNANCE QUALITATIVE MATRIX',
  'ROLE AND ARTIFACT-OWNER SEPARATION',
  'DETERMINISTIC, RECORDED AND BOUNDED REPLAY SEPARATION',
  'OPEN EXACT CONTENT',
  'NON-DECISION RESULT'
] as const;
const EXPECTED_ROLE_SEPARATION = [
  'XFR-D-M4 GOVERNANCE OWNER: DEVELOPMENT + AI — HUMAN-APPROVED CANDIDATE-DERIVED AND NOT SOURCE_NORMATIVE',
  'EVALUATION PLAN ARTIFACT OWNER: AI + DEVELOPMENT',
  'RISK POLICY ARTIFACT OWNER: Chief AI Architect + LEGAL',
  'QUALIFICATION POLICY ARTIFACT OWNER: Chief AI Architect + PRODUCT',
  'SCORING POLICY ARTIFACT OWNER: Chief AI Architect + PRODUCT',
  'MANDATORY APPROVERS: Chief AI Architect + PRODUCT + LEGAL',
  'EVIDENCE/TECHNICAL-PROCEDURE OWNER: DEVELOPMENT + AI — NO UNILATERAL TOLERANCE, INVARIANT, POLICY, PRODUCTION, RUNTIME, RELEASE, IMPLEMENTATION OR GATE AUTHORITY',
  'ONE MERGED QUESTION DOES NOT MERGE ARTIFACT OWNERS, AND G35 ASSIGNS NO NEW OWNER OR WIDENS ANY AUTHORITY'
] as const;

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticBoundedProbabilisticReplayQualitativeGovernanceReference));
  assert.equal(G35_TITLE, EXPECTED_TITLE);
  assert.equal(G35_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G35_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G35_REGIONS, EXPECTED_REGIONS);
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one semantic twelve-row matrix matching the allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticBoundedProbabilisticReplayQualitativeGovernanceReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G35Allowlist;
  assert.deepEqual(G35_GOVERNANCE_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of G35_GOVERNANCE_MATRIX) assert.equal(occurrences(markup, `>${row.matrixRow}</th>`), 1, row.matrixRow);
});

test('source and role boundaries preserve XFR-D-M4 merged authority exactly', () => {
  const source = G35_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-M4 v1\.0 — PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(source, /EP-10 \+ MRP-11 \+ MQP-15 \+ MSP-14 → XFR-D-M4/);
  assert.match(source, /PRIMARY_MERGED_MEMBER/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /REMAIN BLOCKED/);
  assert.deepEqual(G35_ROLE_SEPARATION, EXPECTED_ROLE_SEPARATION);
});

test('exact, recorded and bounded replay separation remains explicit', () => {
  assert.equal(G35_GOVERNANCE_MATRIX.length, 12);
  assert.equal(G35_REPLAY_SEPARATION.length, 6);
  const replay = G35_REPLAY_SEPARATION.join('\n');
  for (const token of ['EXACT-ONLY', 'NO EPSILON', 'SEVERITY-1', 'EXACT SAVED NON-PERSONAL RESPONSE ARTIFACT', 'IMMUTABLE PROVENANCE', 'REMAIN DISTINCT', 'ADVISORY-ONLY', 'NEW AUDIT EVENT', 'NEVER MUTATES']) assert.ok(replay.includes(token), token);
  assert.match(replay, /SCHEMA, RETENTION, ACCESS, COMPATIBILITY AND LAWFUL HANDLING REMAIN OPEN/);
});

test('fail-closed, non-compensation, open content and surrogate boundaries remain explicit', () => {
  assert.equal(G35_FAIL_CLOSED_AND_EVIDENCE.length, 7);
  assert.equal(G35_OPEN_CONTENT.length, 10);
  assert.equal(G35_PROHIBITED_SURROGATES.length, 3);
  const failClosed = G35_FAIL_CLOSED_AND_EVIDENCE.join('\n');
  for (const token of ['BLOCKS ONLY THE AFFECTED USE', 'NO ZERO', 'AI-INFERRED', 'NEGATIVE BUSINESS FACT', 'CANNOT HIDE', 'CANNOT COMPENSATE', 'PREREQUISITES, NOT APPROVAL', 'NO RESULT AUTOMATICALLY CHANGES']) assert.ok(failClosed.includes(token), token);
  const open = G35_OPEN_CONTENT.join('\n');
  for (const token of ['TOLERANCE VALUE', 'ERROR METRICS', 'REASON-CODE INVARIANT', 'SELECTION OR FALLBACK', 'AGGREGATION', 'RECORDED-ARTIFACT SCHEMA', 'DATASET', 'UNCERTAINTY', 'REPRESENTATION', 'PRODUCTION DATA', 'RUNTIME']) assert.ok(open.includes(token), token);
  const surrogates = G35_PROHIBITED_SURROGATES.join('\n');
  for (const token of ['LIBRARY OR PLATFORM DEFAULT', 'AGGREGATE CLOSENESS', 'CANNOT SUBSTITUTE', 'REMAIN INDEPENDENT']) assert.ok(surrogates.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticBoundedProbabilisticReplayQualitativeGovernanceReference));
  assert.equal(occurrences(markup, G35_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G35_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G35_TERMINAL_LINE), 1);
  assert.match(G35_NON_DECISION_RESULT, /REMAINS PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(G35_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${G35_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticBoundedProbabilisticReplayQualitativeGovernanceReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateTolerance/, /computeError/, /selectReplayMode/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G35 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticBoundedProbabilisticReplayQualitativeGovernanceReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticBoundedProbabilisticReplayQualitativeGovernanceReference\.js'/);
  assert.match(component, /from '\.\/syntheticBoundedProbabilisticReplayQualitativeGovernanceReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G35Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G35_SYNTHETIC_BOUNDED_PROBABILISTIC_REPLAY_QUALITATIVE_GOVERNANCE_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 10);
  assert.equal(allowlist.reference.terminal_token, G35_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G35_TERMINAL_LINE);
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
