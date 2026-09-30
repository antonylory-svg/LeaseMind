import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticPriorityScoreQualitativePolicyEvidenceBoundaryReference from '../src/synthetic/SyntheticPriorityScoreQualitativePolicyEvidenceBoundaryReference.js';
import {
  G33_DISCLAIMER,
  G33_FAIL_CLOSED_AND_EVIDENCE,
  G33_INDEPENDENCE_PRESERVED,
  G33_NON_COMPENSATION_AND_AUTHORITY,
  G33_NON_DECISION_RESULT,
  G33_OPEN_CONTENT,
  G33_ORDERING_AND_INPUT_SEPARATION,
  G33_POLICY_MATRIX,
  G33_REGIONS,
  G33_ROLE_SEPARATION,
  G33_SCOPE_LINE,
  G33_SOURCE_BOUNDARY,
  G33_TERMINAL_LINE,
  G33_TERMINAL_TOKEN,
  G33_TITLE
} from '../src/synthetic/syntheticPriorityScoreQualitativePolicyEvidenceBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-priority-score-qualitative-policy-evidence-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticPriorityScoreQualitativePolicyEvidenceBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticPriorityScoreQualitativePolicyEvidenceBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticPriorityScoreQualitativePolicyEvidenceBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-priority-score-qualitative-policy-evidence-boundary-reference', 'G33_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '92a8e111f277be8bb35f2f67944306e20365ef65d17544e55c073a9b0ffbbdd1';

const EXPECTED_ROWS = [
  'OPTIONAL_INTERNAL_ORDERING_ONLY_NO_REQUIREMENT_ACTIVATION_FALLBACK_OR_PRESENTATION',
  'EXACT_QUALITATIVE_INPUT_ALLOWLIST_MATCH_CONFIDENCE_RISK_ONLY',
  'SEPARATE_SOURCE_AUTHORITY_VERSION_HASH_PROVENANCE_AND_AUDIT_VISIBILITY',
  'NO_DERIVATION_SUBSTITUTION_REWRITE_RELABEL_OR_HIDDEN_NORMALIZATION',
  'NO_SILENT_IMPORT_OF_BROADER_RANKING_CONSIDERATIONS_XFR_D_021_INDEPENDENT',
  'NON_COMPENSATION_OF_INSUFFICIENT_CONFIDENCE_OR_HIGH_RISK',
  'AUTHORITY_PRESERVATION_NO_OVERRIDE_OF_PREREQUISITES',
  'AFFECTED_USE_FAIL_CLOSED_WITHOUT_DEFAULTS_OR_NEGATIVE_FACTS',
  'IMMUTABLE_EVIDENCE_AND_REPRODUCIBILITY_PREREQUISITES',
  'SYNTHETIC_ONLY_EVIDENCE_CREATES_NO_PRODUCTION_CLAIM',
  'NO_AUTOMATIC_ACTION_REQUIRES_SEPARATE_CONTROLLED_APPROVAL',
  'PARTIALLY_RESOLVED_BOUNDARY_EXACT_CONTENT_OPEN_AND_NO_FULL_RESOLUTION'
] as const;

const EXPECTED_ALLOWED_PATHS = [
  { path: '05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G33_SYNTHETIC_PRIORITY_SCORE_QUALITATIVE_POLICY_EVIDENCE_BOUNDARY_REFERENCE_AUTHORIZATION_v1.0.md', state: 'present' },
  { path: '05_DEVELOPMENT/matching-engine/synthetic-priority-score-qualitative-policy-evidence-boundary-reference/README.md', state: 'present' },
  { path: '05_DEVELOPMENT/matching-engine/synthetic-priority-score-qualitative-policy-evidence-boundary-reference/G33_FILE_ALLOWLIST_v1.0.json', state: 'present' },
  { path: 'apps/web/synthetic-priority-score-qualitative-policy-evidence-boundary-reference.html', state: 'planned' },
  { path: 'apps/web/src/synthetic/syntheticPriorityScoreQualitativePolicyEvidenceBoundaryReferenceScenario.ts', state: 'planned' },
  { path: 'apps/web/src/synthetic/SyntheticPriorityScoreQualitativePolicyEvidenceBoundaryReference.tsx', state: 'planned' },
  { path: 'apps/web/src/synthetic/syntheticPriorityScoreQualitativePolicyEvidenceBoundaryReferenceEntry.tsx', state: 'planned' },
  { path: 'apps/web/tests/syntheticPriorityScoreQualitativePolicyEvidenceBoundaryReference.test.ts', state: 'planned' },
  { path: '05_DEVELOPMENT/matching-engine/synthetic-priority-score-qualitative-policy-evidence-boundary-reference/G33_PRIORITY_SCORE_QUALITATIVE_POLICY_EVIDENCE_BOUNDARY_REFERENCE_VERIFICATION.json', state: 'planned' }
] as const;

type G33Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: {
    html_title: string;
    always_visible_lines: string[];
    regions_in_order: string[];
    matrix: Array<{ row: string; frozen: string }>;
    open_exact_content: string[];
    terminal_token: string;
    terminal_line: string;
  };
};

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticPriorityScoreQualitativePolicyEvidenceBoundaryReference));
  for (const line of [G33_TITLE, G33_DISCLAIMER, G33_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of G33_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one semantic twelve-row policy matrix', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticPriorityScoreQualitativePolicyEvidenceBoundaryReference));
  assert.deepEqual(G33_POLICY_MATRIX.map(row => row.matrixRow), [...EXPECTED_ROWS]);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of EXPECTED_ROWS) assert.equal(occurrences(markup, `>${row}</th>`), 1, row);
});

test('source and role boundaries preserve XFR-D-024 v1.1 status and authority', () => {
  const source = G33_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-024 v1\.1 — PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(source, /MSP-11 → XFR-D-024 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /SCORING REGISTER: 18 ROWS/);
  assert.match(source, /EVALUATION REGISTER: 17 ROWS/);
  assert.match(source, /ARCHITECTURE §15\.6/);
  assert.match(source, /§24/);
  assert.match(source, /REMAIN BLOCKED/);
  assert.match(source, /WITHOUT UNILATERAL AUTHORITY/);
  const roles = G33_ROLE_SEPARATION.join('\n');
  for (const token of ['Chief AI Architect + PRODUCT', 'LEGAL + DEVELOPMENT', 'NO UNILATERAL', 'SOURCE_NORMATIVE', 'XFR-D-021', 'XFR-D-063', 'NO NEW OWNER']) assert.ok(roles.includes(token), token);
});

test('ordering, input separation, non-compensation, fail-closed and open content remain explicit', () => {
  assert.equal(G33_POLICY_MATRIX.length, 12);
  assert.equal(G33_ROLE_SEPARATION.length, 9);
  assert.equal(G33_ORDERING_AND_INPUT_SEPARATION.length, 7);
  assert.equal(G33_NON_COMPENSATION_AND_AUTHORITY.length, 4);
  assert.equal(G33_FAIL_CLOSED_AND_EVIDENCE.length, 6);
  assert.equal(G33_OPEN_CONTENT.length, 11);
  assert.equal(G33_INDEPENDENCE_PRESERVED.length, 13);
  const ordering = G33_ORDERING_AND_INPUT_SEPARATION.join('\n');
  for (const token of ['REMAINS OPTIONAL', 'INTERNAL ORDERING SIGNAL', 'MATCH SCORE, CONFIDENCE SCORE AND RISK SCORE', 'SEPARATELY FOR AUDIT', 'HIDDEN NORMALIZATION', 'XFR-D-021', 'NO FALLBACK IS INVENTED']) assert.ok(ordering.includes(token), token);
  const nonCompensation = G33_NON_COMPENSATION_AND_AUTHORITY.join('\n');
  for (const token of ['NEVER COMPENSATES INSUFFICIENT OR LOW CONFIDENCE', 'SOURCE-DEFINED HIGH RISK', 'CANNOT BYPASS, WEAKEN OR COMPENSATE', 'NO ROUTING, LEGAL, BUSINESS OR PRESENTATION AUTHORITY']) assert.ok(nonCompensation.includes(token), token);
  const failClosed = G33_FAIL_CLOSED_AND_EVIDENCE.join('\n');
  for (const token of ['SEPARATELY APPROVED PRIORITY SCORE POLICY/VERSION/HASH', 'NEVER REPLACED BY ZERO', 'FAIL CLOSED', 'NEGATIVE BUSINESS FACT', 'REPRODUCIBILITY', 'PREREQUISITES, NOT APPROVALS', 'SYNTHETIC-ONLY EVIDENCE']) assert.ok(failClosed.includes(token), token);
  const open = G33_OPEN_CONTENT.join('\n');
  for (const token of ['WHETHER AND WHEN PRIORITY SCORE IS ACTIVATED FOR ANY USE', 'SIGNS/DIRECTIONS', 'NORMALIZATION', 'THRESHOLDS', 'TIE-BREAKS', 'XFR-D-063 AND XFR-D-070', 'RISK FORMULA', 'EVALUATION RUN', 'RBAC', 'GATE APPROVALS']) assert.ok(open.includes(token), token);
  const independence = G33_INDEPENDENCE_PRESERVED.join('\n');
  for (const token of ['§15.6', '§24', '§49', 'XFR-D-021', 'XFR-D-063', 'XFR-D-068']) assert.ok(independence.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticPriorityScoreQualitativePolicyEvidenceBoundaryReference));
  assert.equal(occurrences(markup, G33_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G33_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G33_TERMINAL_LINE), 1);
  assert.equal(G33_NON_DECISION_RESULT.includes(G33_TERMINAL_LINE), false);
  assert.equal(G33_NON_DECISION_RESULT.includes(G33_TERMINAL_TOKEN), false);
  assert.match(G33_NON_DECISION_RESULT, /REMAINS PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(G33_NON_DECISION_RESULT, /NOT A FULL RESOLUTION OF EXACT CONTENT/);
  const start = markup.indexOf(`aria-label="${G33_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});


test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticPriorityScoreQualitativePolicyEvidenceBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculatePriorityScore/, /computePriorityScore/, /executePriorityScore/, /selectFormula/, /assignWeight/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G33 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticPriorityScoreQualitativePolicyEvidenceBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticPriorityScoreQualitativePolicyEvidenceBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticPriorityScoreQualitativePolicyEvidenceBoundaryReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G33Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G33_SYNTHETIC_PRIORITY_SCORE_QUALITATIVE_POLICY_EVIDENCE_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.html_title, G33_TITLE);
  assert.deepEqual(allowlist.reference.always_visible_lines, [G33_TITLE, G33_DISCLAIMER, G33_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.regions_in_order, [...G33_REGIONS]);
  assert.deepEqual(allowlist.reference.matrix.map(item => item.row), [...EXPECTED_ROWS]);
  assert.deepEqual(allowlist.reference.matrix.map(item => item.frozen), G33_POLICY_MATRIX.map(item => item.frozenBoundary));
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 11);
  assert.equal(allowlist.reference.open_exact_content.length, G33_OPEN_CONTENT.length);
  assert.equal(allowlist.reference.terminal_token, G33_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G33_TERMINAL_LINE);
  assert.deepEqual(allowlist.allowed_paths, [...EXPECTED_ALLOWED_PATHS]);
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
  assert.deepEqual(
    allowlist.allowed_paths.filter(item => item.state === 'planned').map(item => item.path),
    [...EXPECTED_ALLOWED_PATHS].filter(item => item.state === 'planned').map(item => item.path)
  );
  assert.equal(allowlist.governance.gate_impact, 'NONE');
  assert.equal(allowlist.governance.implementation_readiness_gate, 'BLOCKED');
  assert.equal(allowlist.governance.synthetic_acceptance_gate, 'BLOCKED');
  assert.equal(allowlist.governance.production_launch_gate, 'BLOCKED');
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
