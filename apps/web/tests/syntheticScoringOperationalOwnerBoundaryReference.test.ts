import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticScoringOperationalOwnerBoundaryReference from '../src/synthetic/SyntheticScoringOperationalOwnerBoundaryReference.js';
import {
  G39_DISCLAIMER,
  G39_INDEPENDENT_BOUNDARIES,
  G39_NON_DECISION_RESULT,
  G39_OPEN_CONTENT,
  G39_OWNER_MATRIX,
  G39_PROCESS_BOUNDARY,
  G39_REGIONS,
  G39_ROLE_SEPARATION,
  G39_SCOPE_LINE,
  G39_SOURCE_BOUNDARY,
  G39_TERMINAL_LINE,
  G39_TERMINAL_TOKEN,
  G39_TITLE
} from '../src/synthetic/syntheticScoringOperationalOwnerBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-scoring-operational-owner-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticScoringOperationalOwnerBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticScoringOperationalOwnerBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticScoringOperationalOwnerBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-scoring-operational-owner-boundary-reference', 'G39_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = 'c4ff5d195a486a99da4ba39ea875586aeba01cf6a959dc6c57b674099676cc04';

type G39Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: { matrix: Array<{ row: number; frozen: string }>; open_exact_content: string[]; terminal_token: string; terminal_line: string };
};

const EXPECTED_TITLE = 'SYNTHETIC SCORING OPERATIONAL-OWNER BOUNDARY REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — ARCHITECTURE §30.3 ROLE SEPARATION ONLY';
const EXPECTED_SCOPE_LINE = 'NO PROCEDURE, ADJUDICATION, QUORUM, DATASET, METRIC, THRESHOLD, SCORING POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = ['SOURCE AND STATUS BOUNDARY', 'OPERATIONAL-OWNER QUALITATIVE MATRIX', 'ROLE AND PROCESS-LAYER SEPARATION', 'STEPS 1–3, STEP 6 REVIEW AND STEP 7 APPROVAL BOUNDARY', 'OPEN EXACT CONTENT', 'NON-DECISION RESULT'] as const;

test('frozen title, permanent lines and six regions render in exact order', () => {
  assert.equal(G39_TITLE, EXPECTED_TITLE);
  assert.equal(G39_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G39_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G39_REGIONS, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticScoringOperationalOwnerBoundaryReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has one twelve-row matrix matching the closed allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringOperationalOwnerBoundaryReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G39Allowlist;
  assert.deepEqual(G39_OWNER_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.equal(G39_OWNER_MATRIX.length, 12);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of G39_OWNER_MATRIX) assert.equal(occurrences(markup, `>${row.matrixRow}</th>`), 1, row.matrixRow);
});

test('source identity, status and inventory counts remain exact', () => {
  const source = G39_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-027 v1\.0 — RESOLVED_QUALITATIVE_BOUNDARY/);
  assert.match(source, /MSP-16 → XFR-D-027 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /REMAIN BLOCKED/);
});

test('all role mappings and authority bases remain exact and non-conflated', () => {
  const roles = G39_ROLE_SEPARATION.join('\n');
  for (const token of ['Chief AI Architect + PRODUCT', 'CANDIDATE ASSIGNMENT', 'AI + DEVELOPMENT', 'CANDIDATE-BY-ANALOGY', 'TECHNICAL EXECUTOR/STEWARD', 'STEP 6 REVIEWER: Chief AI Architect', 'SOURCE-NORMATIVE', 'NOT SELF-REVIEWER', 'PRODUCT + LEGAL', 'LEGAL + DEVELOPMENT', 'CONSULTED DOMAIN FUNCTION: AI', 'WITHOUT UNILATERAL AUTHORITY']) assert.ok(roles.includes(token), token);
});

test('process layers prohibit self-review, authority transfer and invented appointments', () => {
  const boundary = G39_PROCESS_BOUNDARY.join('\n');
  for (const token of ['DOES NOT CREATE OPERATIONAL EXECUTION AUTHORITY', 'DOES NOT CREATE GOVERNANCE', 'SELF-REVIEW', 'DOES NOT BECOME RECORD-LEVEL APPROVAL', 'NO NAMED INDIVIDUAL', 'RBAC ASSIGNMENT', 'NO ROLE REPLACES']) assert.ok(boundary.includes(token), token);
});

test('exact procedures and independent decision contents remain open', () => {
  assert.equal(G39_OPEN_CONTENT.length, 10);
  const open = G39_OPEN_CONTENT.join('\n');
  for (const token of ['ADJUDICATION', 'QUORUM', 'REVIEWER QUALIFICATIONS', 'DATASET SOURCE', 'LABEL QUALITY', 'OFFLINE EVALUATION METRICS', 'XFR-D-018', 'XFR-D-021', 'ARCHITECTURE §37', 'RUNTIME']) assert.ok(open.includes(token), token);
  const independent = G39_INDEPENDENT_BOUNDARIES.join('\n');
  for (const token of ['PARTIALLY_RESOLVED_BOUNDARY', 'EXACT CONTENT REMAINS OPEN', 'QUESTIONS №2 AND №3', 'NO FUNCTION, WEIGHT, THRESHOLD OR VALUE', 'OWNER ASSIGNMENT CREATES NO DATASET']) assert.ok(independent.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringOperationalOwnerBoundaryReference));
  assert.equal(occurrences(markup, G39_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G39_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G39_TERMINAL_LINE), 1);
  assert.match(G39_NON_DECISION_RESULT, /REMAINS RESOLVED_QUALITATIVE_BOUNDARY/);
  assert.match(G39_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface is static and has no controls, links, live regions or active behavior', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringOperationalOwnerBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /assignOwner\s*\(/, /executeStep\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G39 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticScoringOperationalOwnerBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticScoringOperationalOwnerBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticScoringOperationalOwnerBoundaryReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G39Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G39_SYNTHETIC_SCORING_OPERATIONAL_OWNER_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 10);
  assert.equal(allowlist.reference.terminal_token, G39_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G39_TERMINAL_LINE);
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
