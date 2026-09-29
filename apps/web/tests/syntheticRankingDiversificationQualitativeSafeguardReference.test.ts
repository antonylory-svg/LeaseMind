import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticRankingDiversificationQualitativeSafeguardReference from '../src/synthetic/SyntheticRankingDiversificationQualitativeSafeguardReference.js';
import {
  G30_DISCLAIMER,
  G30_DISTINCT_LAYERS,
  G30_EVIDENCE_BOUNDARY,
  G30_EVIDENCE_PREREQUISITES,
  G30_FAIL_CLOSED,
  G30_INDEPENDENCE_PRESERVED,
  G30_NON_DECISION_RESULT,
  G30_OPEN_CONTENT,
  G30_PROHIBITED_INFERENCES,
  G30_RANKING_GOVERNANCE_MATRIX,
  G30_REGIONS,
  G30_ROLE_SEPARATION,
  G30_SCOPE_LINE,
  G30_SOURCE_BOUNDARY,
  G30_TERMINAL_LINE,
  G30_TERMINAL_TOKEN,
  G30_TITLE
} from '../src/synthetic/syntheticRankingDiversificationQualitativeSafeguardReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-ranking-diversification-qualitative-safeguard-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticRankingDiversificationQualitativeSafeguardReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticRankingDiversificationQualitativeSafeguardReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticRankingDiversificationQualitativeSafeguardReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-ranking-diversification-qualitative-safeguard-reference', 'G30_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = 'acdc15195f914dfa8c35d25541597ede2243118a3b4144de1067ccdc8be2175b';

const EXPECTED_ROWS = [
  'INPUT_SEPARATION_AND_SEMANTIC_PRESERVATION',
  'HARD_CONSTRAINT_PRECEDENCE_AND_NON_COMPENSATION',
  'LOW_CONFIDENCE_NON_PROMOTION_AND_RISK_NON_MASKING',
  'DIVERSIFICATION_ONLY_AFTER_SEPARATELY_APPROVED_MINIMUM_QUALITY',
  'CANDIDATE_NON_SELECTION_AND_NO_DEFAULT_AUTHORITY',
  'INTERNAL_RANKING_CREATES_NO_CATALOG_OR_DISCLOSURE_AUTHORITY',
  'AFFECTED_RANKING_FAIL_CLOSED_WITHOUT_UNRELATED_BLOCK',
  'VERSION_HASH_BINDING_AND_PROSPECTIVE_HISTORICAL_IMMUTABILITY_UNDER_XFR_D_023',
  'MINIMUM_RANKING_EVIDENCE_PREREQUISITES_AND_SEPARATE_REPORTING',
  'NO_AUTOMATIC_ACTION'
] as const;

type G30Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: {
    html_title: string;
    always_visible_lines: string[];
    regions_in_order: string[];
    ranking_diversification_qualitative_safeguard_matrix: Array<{ row: string; frozen: string }>;
    ranking_evidence_prerequisites: string[];
    independent_open_boundaries: string[];
    distinct_layers: string[];
    prohibited_inferences: string[];
    terminal: { token: string; line: string; last_region: boolean };
  };
};

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticRankingDiversificationQualitativeSafeguardReference));
  for (const line of [G30_TITLE, G30_DISCLAIMER, G30_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of G30_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one semantic ten-row governance matrix', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticRankingDiversificationQualitativeSafeguardReference));
  assert.deepEqual(G30_RANKING_GOVERNANCE_MATRIX.map(row => row.governanceRow), [...EXPECTED_ROWS]);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 11);
  for (const row of EXPECTED_ROWS) assert.equal(occurrences(markup, `>${row}</th>`), 1, row);
});

test('source and role boundaries preserve XFR-D-021 status and authority', () => {
  const source = G30_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-021 v1\.0 — APPROVED \/ PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(source, /MSP-08 → XFR-D-021 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /SCORING REGISTER: 18 ROWS/);
  assert.match(source, /EVALUATION REGISTER: 17 ROWS/);
  assert.match(source, /ARCHITECTURE §30\.3/);
  assert.match(source, /ARCHITECTURE §34\.2/);
  assert.match(source, /ARCHITECTURE §49/);
  assert.match(source, /PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(source, /IMPLEMENTATION READINESS, SYNTHETIC ACCEPTANCE AND PRODUCTION LAUNCH REMAIN BLOCKED/);
  const roles = G30_ROLE_SEPARATION.join('\n');
  for (const token of ['Chief AI Architect + PRODUCT', 'LEGAL + DEVELOPMENT', 'AI + DEVELOPMENT', 'NO UNILATERAL', 'AI CONSULTED', 'NOT WIDENED']) assert.ok(roles.includes(token), token);
});

test('evidence prerequisites, non-compensation and open content remain explicit', () => {
  assert.equal(G30_EVIDENCE_PREREQUISITES.length, 11);
  assert.equal(G30_RANKING_GOVERNANCE_MATRIX.length, 10);
  assert.equal(G30_OPEN_CONTENT.length, 25);
  assert.equal(G30_DISTINCT_LAYERS.length, 16);
  assert.equal(G30_PROHIBITED_INFERENCES.length, 16);
  assert.equal(G30_INDEPENDENCE_PRESERVED.length, 12);
  const evidence = G30_EVIDENCE_BOUNDARY.join('\n');
  assert.match(evidence, /PREREQUISITES ONLY/);
  assert.match(evidence, /CANNOT COMPENSATE/);
  assert.match(evidence, /FAIL CLOSED/);
  assert.match(evidence, /REPORTED SEPARATELY/);
  const failClosed = G30_FAIL_CLOSED.join('\n');
  for (const token of ['FAILS CLOSED', 'PROHIBITED', 'UNRELATED PROCESSING IS NOT BLOCKED', 'OPEN']) assert.ok(failClosed.includes(token), token);
  const open = G30_OPEN_CONTENT.join('\n');
  for (const token of ['EXACT RANKING ALGORITHM', 'EXACT TIE-BREAK', 'EXACT K', 'EXACT MINIMUM-QUALITY RULE AND VALUE', 'EXACT DIVERSITY DEFINITION', 'EXACT TOLERANCE', 'PRODUCTION APPLICABILITY', 'CONTROLLED ARTIFACT MANIFEST APPROVAL']) assert.ok(open.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticRankingDiversificationQualitativeSafeguardReference));
  assert.equal(occurrences(markup, G30_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G30_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G30_TERMINAL_LINE), 1);
  assert.equal(G30_NON_DECISION_RESULT.includes(G30_TERMINAL_LINE), false);
  const start = markup.indexOf(`aria-label="${G30_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticRankingDiversificationQualitativeSafeguardReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateRank/, /computeRank/, /rankCandidates/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G30 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticRankingDiversificationQualitativeSafeguardReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticRankingDiversificationQualitativeSafeguardReference\.js'/);
  assert.match(component, /from '\.\/syntheticRankingDiversificationQualitativeSafeguardReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G30Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G30_SYNTHETIC_RANKING_DIVERSIFICATION_QUALITATIVE_SAFEGUARD_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.html_title, G30_TITLE);
  assert.deepEqual(allowlist.reference.always_visible_lines, [G30_TITLE, G30_DISCLAIMER, G30_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.regions_in_order, [...G30_REGIONS]);
  assert.deepEqual(allowlist.reference.ranking_diversification_qualitative_safeguard_matrix.map(item => item.row), [...EXPECTED_ROWS]);
  assert.deepEqual(
    allowlist.reference.ranking_diversification_qualitative_safeguard_matrix.map(item => item.frozen),
    G30_RANKING_GOVERNANCE_MATRIX.map(item => item.frozenBoundary)
  );
  assert.equal(allowlist.reference.ranking_evidence_prerequisites.length, 11);
  assert.equal(allowlist.reference.ranking_evidence_prerequisites.length, G30_EVIDENCE_PREREQUISITES.length);
  assert.equal(allowlist.reference.independent_open_boundaries.length, 24);
  assert.equal(allowlist.reference.distinct_layers.length, G30_DISTINCT_LAYERS.length);
  assert.equal(allowlist.reference.prohibited_inferences.length, G30_PROHIBITED_INFERENCES.length);
  assert.equal(allowlist.reference.terminal.token, G30_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal.line, G30_TERMINAL_LINE);
  assert.equal(allowlist.reference.terminal.last_region, true);
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
