import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReference from '../src/synthetic/SyntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReference.js';
import {
  G29_DISCLAIMER,
  G29_DISTINCT_LAYERS,
  G29_EVIDENCE_BOUNDARY,
  G29_EVIDENCE_PREREQUISITES,
  G29_GOVERNANCE_MATRIX,
  G29_OPEN_CONTENT,
  G29_REGIONS,
  G29_ROLE_SEPARATION,
  G29_SCOPE_LINE,
  G29_SOURCE_BOUNDARY,
  G29_TERMINAL_LINE,
  G29_TERMINAL_TOKEN,
  G29_TITLE
} from '../src/synthetic/syntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-scoring-numeric-representation-deterministic-replay-qualitative-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-scoring-numeric-representation-deterministic-replay-qualitative-boundary-reference', 'G29_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '5dfaaad6dc2d30b35504098a27c01ec608ba3795bea5f4e87d62edae1e902a70';

const EXPECTED_ROWS = [
  'REPRESENTATION_SCOPE_AND_SEMANTIC_PRESERVATION',
  'CANDIDATE_NON_SELECTION_AND_NO_DEFAULT_AUTHORITY',
  'DETERMINISTIC_EXACT_VERSUS_BOUNDED_PROBABILISTIC_REPLAY_SEPARATION',
  'AFFECTED_CALCULATION_AND_REPLAY_FAIL_CLOSED',
  'VERSION_AND_HASH_DISCIPLINE',
  'PROSPECTIVE_ONLY_HISTORICAL_IMMUTABILITY_UNDER_XFR_D_023',
  'MINIMUM_REPRODUCIBILITY_EVIDENCE_PREREQUISITES',
  'NON_COMPENSATION_AND_SEPARATE_COMPONENT_REPORTING',
  'NO_AUTOMATIC_ACTION'
] as const;

type G29Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: {
    html_title: string;
    always_visible_lines: string[];
    regions_in_order: string[];
    scoring_numeric_representation_governance_matrix: Array<{ row: string; frozen: string }>;
    reproducibility_evidence_prerequisites: string[];
    terminal: { token: string; line: string; last_region: boolean };
  };
};

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReference));
  for (const line of [G29_TITLE, G29_DISCLAIMER, G29_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of G29_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one semantic nine-row governance matrix', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReference));
  assert.deepEqual(G29_GOVERNANCE_MATRIX.map(row => row.governanceRow), [...EXPECTED_ROWS]);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 10);
  for (const row of EXPECTED_ROWS) assert.equal(occurrences(markup, `>${row}</th>`), 1, row);
});

test('source and role boundaries preserve XFR-D-020 status and authority', () => {
  const source = G29_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-020 v1\.0 — APPROVED \/ PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(source, /MSP-07 → XFR-D-020 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /SCORING REGISTER: 18 ROWS/);
  assert.match(source, /EVALUATION REGISTER: 17 ROWS/);
  assert.match(source, /ALL THREE GOVERNANCE GATES|IMPLEMENTATION READINESS, SYNTHETIC ACCEPTANCE AND PRODUCTION LAUNCH REMAIN BLOCKED/);
  const roles = G29_ROLE_SEPARATION.join('\n');
  for (const token of ['DEVELOPMENT + AI', 'Chief AI Architect + PRODUCT', 'Chief AI Architect + PRODUCT + LEGAL', 'Chief AI Architect + DEVELOPMENT + AI', 'PRODUCT + LEGAL', 'NO UNILATERAL']) assert.ok(roles.includes(token), token);
});

test('evidence prerequisites, non-compensation and open content remain explicit', () => {
  assert.equal(G29_EVIDENCE_PREREQUISITES.length, 11);
  assert.equal(G29_GOVERNANCE_MATRIX.length, 9);
  assert.equal(G29_OPEN_CONTENT.length, 14);
  assert.equal(G29_DISTINCT_LAYERS.length, 14);
  const evidence = G29_EVIDENCE_BOUNDARY.join('\n');
  assert.match(evidence, /PREREQUISITES ONLY/);
  assert.match(evidence, /CANNOT COMPENSATE/);
  assert.match(evidence, /CANNOT BE HIDDEN/);
  const open = G29_OPEN_CONTENT.join('\n');
  for (const token of ['FLOATING-POINT', 'ROUNDING MODE', 'CANONICAL JSON', 'EVERY TOLERANCE', 'NAN', 'DATA CONTRACTS EXTENSION', 'XFR-D-M4', 'PRODUCTION-DATA USE']) assert.ok(open.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReference));
  assert.equal(occurrences(markup, G29_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G29_TERMINAL_LINE), 1);
  const start = markup.indexOf(`aria-label="${G29_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateScore/, /computeScore/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G29 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticScoringNumericRepresentationDeterministicReplayQualitativeBoundaryReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G29Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G29_SYNTHETIC_SCORING_NUMERIC_REPRESENTATION_DETERMINISTIC_REPLAY_QUALITATIVE_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.html_title, G29_TITLE);
  assert.deepEqual(allowlist.reference.always_visible_lines, [G29_TITLE, G29_DISCLAIMER, G29_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.regions_in_order, [...G29_REGIONS]);
  assert.deepEqual(allowlist.reference.scoring_numeric_representation_governance_matrix.map(item => item.row), [...EXPECTED_ROWS]);
  assert.deepEqual(
    allowlist.reference.scoring_numeric_representation_governance_matrix.map(item => item.frozen),
    G29_GOVERNANCE_MATRIX.map(item => item.frozenBoundary)
  );
  assert.equal(allowlist.reference.reproducibility_evidence_prerequisites.length, 11);
  assert.equal(allowlist.reference.terminal.token, G29_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal.line, G29_TERMINAL_LINE);
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
