import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReference from '../src/synthetic/SyntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReference.js';
import {
  G40_AUTHORITY_SEPARATION,
  G40_BOUNDARY_MATRIX,
  G40_DISCLAIMER,
  G40_INDEPENDENT_BOUNDARIES,
  G40_NON_DECISION_RESULT,
  G40_NON_DISCLOSURE_BOUNDARY,
  G40_OPEN_CONTENT,
  G40_REGIONS,
  G40_SCOPE_LINE,
  G40_SOURCE_BOUNDARY,
  G40_TERMINAL_LINE,
  G40_TERMINAL_TOKEN,
  G40_TITLE
} from '../src/synthetic/syntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-dimension-score-internal-ownership-external-disclosure-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-dimension-score-internal-ownership-external-disclosure-boundary-reference', 'G40_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = 'd63e979f00afc85691e6658f214e078ad3d6f3a0e2b15847cae3254eba657993';

type G40Allowlist = {
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

const EXPECTED_TITLE = 'SYNTHETIC DIMENSION SCORE INTERNAL-OWNERSHIP / EXTERNAL-DISCLOSURE BOUNDARY REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — INTERNAL SCORING OWNERSHIP IS NOT EXTERNAL PRESENTATION AUTHORITY';
const EXPECTED_SCOPE_LINE = 'NO FIELD, SCORE VALUE, GRANULARITY, WORDING, DISCLOSURE, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = ['SOURCE AND STATUS BOUNDARY', 'INTERNAL OWNERSHIP / EXTERNAL DISCLOSURE MATRIX', 'SCORING AND SAFE PRESENTATION AUTHORITY SEPARATION', 'DIMENSION COMPONENT NON-DISCLOSURE BOUNDARY', 'OPEN EXACT CONTENT', 'NON-DECISION RESULT'] as const;

test('frozen title, permanent lines and six regions match the closed allowlist', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G40Allowlist;
  assert.equal(G40_TITLE, EXPECTED_TITLE);
  assert.equal(G40_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G40_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G40_REGIONS, EXPECTED_REGIONS);
  assert.equal(allowlist.reference.future_surface.title, EXPECTED_TITLE);
  assert.deepEqual(allowlist.reference.future_surface.permanent_lines, [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.future_surface.regions_in_order, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has one twelve-row matrix matching the closed allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G40Allowlist;
  assert.deepEqual(G40_BOUNDARY_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.equal(G40_BOUNDARY_MATRIX.length, 12);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of G40_BOUNDARY_MATRIX) assert.equal(occurrences(markup, `>${row.matrixRow}</th>`), 1, row.matrixRow);
});

test('source identity, partial status, internal scope and counts remain exact', () => {
  const source = G40_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-028 v1\.0 — PARTIALLY_RESOLVED_BOUNDARY, NEVER FULLY RESOLVED/);
  assert.match(source, /MSP-17 → XFR-D-028 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  for (const token of ['TENANT FIT', 'OWNER FIT', 'DEAL FEASIBILITY', 'INTERNAL\/AUDIT INTERPRETATION', 'EXTERNAL FIELD SELECTION', 'REMAIN BLOCKED']) assert.match(source, new RegExp(token), token);
});

test('Scoring and Safe Presentation authorities remain exact and non-conflated', () => {
  const roles = G40_AUTHORITY_SEPARATION.join('\n');
  for (const token of ['Chief AI Architect + PRODUCT', 'LEGAL + DEVELOPMENT', 'CONSULTED DOMAIN FUNCTION: AI', 'NO UNILATERAL AUTHORITY', 'PRODUCT + LEGAL', 'NOT TRANSFERRED', 'NO EVIDENCE-PROCEDURE OWNER', 'NO NAMED INDIVIDUAL', 'RBAC']) assert.ok(roles.includes(token), token);
});

test('component existence creates no disclosure and current siblings remain independent', () => {
  const boundary = G40_NON_DISCLOSURE_BOUNDARY.join('\n');
  for (const token of ['DO NOT AUTHORIZE THEIR EXTERNAL DISPLAY', 'NO RAW, NUMERIC, DERIVED', 'CANNOT BE GUESSED', 'NO NEGATIVE BUSINESS FACT', 'QUALIFICATION CHANGE', 'XFR-D-044', 'XFR-D-073', 'NO AUTHORITY IS TRANSFERRED']) assert.ok(boundary.includes(token), token);
  const independent = G40_INDEPENDENT_BOUNDARIES.join('\n');
  for (const token of ['XFR-D-072 v1.1', 'FIELD-ROW/ALLOWLIST', 'XFR-D-077 v1.1', 'CATALOG/CROSSWALK', 'XFR-D-078 v1.1', 'WORDING/MAPPING', 'WITHOUT REINTERPRETING HISTORY', 'NO SIBLING BOUNDARY IS REOPENED']) assert.ok(independent.includes(token), token);
});

test('all exact external presentation and implementation contents remain open', () => {
  assert.equal(G40_OPEN_CONTENT.length, 10);
  const open = G40_OPEN_CONTENT.join('\n');
  for (const token of ['PER-OBJECT-TYPE FIELDS', 'COMPONENT INCLUSION', 'GRANULARITY', 'WORDING', 'MAPPINGS', 'AUDIENCE', 'VERSION/HASH', 'DATASET', 'SCHEMA', 'SAFE PRESENTATION POLICY', 'RUNTIME', 'GATES']) assert.ok(open.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReference));
  assert.equal(occurrences(markup, G40_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G40_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G40_TERMINAL_LINE), 1);
  assert.match(G40_NON_DECISION_RESULT, /REMAINS PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(G40_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface is static and has no controls, links, live regions or active behavior', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateScore\s*\(/, /selectField\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G40 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticDimensionScoreInternalOwnershipExternalDisclosureBoundaryReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G40Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G40_SYNTHETIC_DIMENSION_SCORE_INTERNAL_OWNERSHIP_EXTERNAL_DISCLOSURE_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 10);
  assert.equal(allowlist.reference.terminal_token, G40_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G40_TERMINAL_LINE);
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
  assert.equal(allowlist.governance.evidence_procedure_owner_assigned_by_xfr_d_028, false);
  assert.equal(allowlist.governance.named_appointment_or_rbac_created, false);
  assert.equal(allowlist.governance.gate_impact, 'NONE');
  assert.equal(allowlist.governance.implementation_readiness_gate, 'BLOCKED');
  assert.equal(allowlist.governance.synthetic_acceptance_gate, 'BLOCKED');
  assert.equal(allowlist.governance.production_launch_gate, 'BLOCKED');
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
