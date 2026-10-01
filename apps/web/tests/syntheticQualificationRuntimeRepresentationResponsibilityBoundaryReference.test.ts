import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticQualificationRuntimeRepresentationResponsibilityBoundaryReference from '../src/synthetic/SyntheticQualificationRuntimeRepresentationResponsibilityBoundaryReference.js';
import {
  G42_BOUNDARY_MATRIX,
  G42_DISCLAIMER,
  G42_INDEPENDENT_BOUNDARIES,
  G42_NON_CONFLATION_BOUNDARY,
  G42_NON_DECISION_RESULT,
  G42_OPEN_REPRESENTATION,
  G42_REGIONS,
  G42_RESPONSIBILITY_SEPARATION,
  G42_SCOPE_LINE,
  G42_SOURCE_BOUNDARY,
  G42_TERMINAL_LINE,
  G42_TERMINAL_TOKEN,
  G42_TITLE
} from '../src/synthetic/syntheticQualificationRuntimeRepresentationResponsibilityBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-qualification-runtime-representation-responsibility-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticQualificationRuntimeRepresentationResponsibilityBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticQualificationRuntimeRepresentationResponsibilityBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticQualificationRuntimeRepresentationResponsibilityBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-qualification-runtime-representation-responsibility-boundary-reference', 'G42_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '3d584951d3c7a788201d4c9efedd7851d7b31fe7cb785e5994bf37febe68fece';

type G42Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string | boolean>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: {
    source_normative_results: string[];
    future_surface: { title: string; permanent_lines: string[]; regions_in_order: string[] };
    matrix: Array<{ row: number; frozen: string }>;
    open_exact_representation: string[];
    terminal_token: string;
    terminal_line: string;
  };
};

const EXPECTED_TITLE = 'SYNTHETIC QUALIFICATION RUNTIME-REPRESENTATION RESPONSIBILITY-BOUNDARY REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — RESPONSIBILITY ASSIGNMENT IS NOT RUNTIME REPRESENTATION APPROVAL';
const EXPECTED_SCOPE_LINE = 'NO FIELD, ENUM, CARRIER, API, EVENT, COMPATIBILITY STRATEGY, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = ['SOURCE AND STATUS BOUNDARY', 'RESPONSIBILITY SPLIT MATRIX', 'SEMANTIC OWNER / SCHEMA STEWARD / REVIEW SEPARATION', 'GATESTATE AND FIFTH-RESULT NON-CONFLATION', 'OPEN EXACT REPRESENTATION', 'NON-DECISION RESULT'] as const;
const EXPECTED_RESULTS = ['QUALIFIED_HYPOTHESIS', 'NEEDS_VERIFICATION', 'HUMAN_REVIEW_REQUIRED', 'REJECTED_BY_MATCHING'] as const;

test('frozen title, permanent lines and six regions match the closed allowlist', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G42Allowlist;
  assert.equal(G42_TITLE, EXPECTED_TITLE);
  assert.equal(G42_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G42_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G42_REGIONS, EXPECTED_REGIONS);
  assert.equal(allowlist.reference.future_surface.title, EXPECTED_TITLE);
  assert.deepEqual(allowlist.reference.future_surface.permanent_lines, [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.future_surface.regions_in_order, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationRuntimeRepresentationResponsibilityBoundaryReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has one twelve-row matrix matching the closed allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationRuntimeRepresentationResponsibilityBoundaryReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G42Allowlist;
  assert.deepEqual(G42_BOUNDARY_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.equal(G42_BOUNDARY_MATRIX.length, 12);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of G42_BOUNDARY_MATRIX) assert.equal(occurrences(markup, `>${row.matrixRow}</th>`), 1, row.matrixRow);
});

test('source identity, status, scope and counts remain exact', () => {
  const source = G42_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-031 v1\.0 — APPROVED RESPONSIBILITY BOUNDARY — exact runtime representation remains OPEN/);
  assert.match(source, /MQP-02 → XFR-D-031 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /20 ROWS/);
  for (const token of ['SEMANTIC OWNER', 'TECHNICAL SCHEMA STEWARD', 'APPLICABLE REVIEW', 'REMAIN OPEN', 'REMAIN BLOCKED']) assert.ok(source.includes(token), token);
});

test('semantic owner, technical steward and review responsibilities remain exact', () => {
  const roles = G42_RESPONSIBILITY_SEPARATION.join('\n');
  for (const token of ['Chief AI Architect + PRODUCT', 'DEVELOPMENT', 'WITHOUT UNILATERAL SEMANTIC AUTHORITY', 'MANDATORY Chief AI Architect REVIEW', 'LEGAL REVIEW', 'RIGHTS-AFFECTING ROUTING', 'NO EVIDENCE-PROCEDURE OWNER', 'NO NAMED PERSON', 'RBAC GRANT']) assert.ok(roles.includes(token), token);
});

test('four semantic results, GateState and fifth-result boundaries remain exact', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G42Allowlist;
  assert.deepEqual(allowlist.reference.source_normative_results, EXPECTED_RESULTS);
  const boundary = G42_NON_CONFLATION_BOUNDARY.join('\n');
  for (const token of EXPECTED_RESULTS) assert.ok(boundary.includes(token), token);
  for (const token of ['DO NOT BY THEMSELVES APPROVE AN ENUM', 'GateState', 'NOT AUTOMATICALLY REUSED', 'CANNOT ADD A FIFTH RESULT', 'CANNOT BE GUESSED', 'NO REPRESENTATION GAP CREATES A DEFAULT ROUTE']) assert.ok(boundary.includes(token), token);
});

test('all exact representation contents remain open and siblings independent', () => {
  assert.equal(G42_OPEN_REPRESENTATION.length, 10);
  const open = G42_OPEN_REPRESENTATION.join('\n');
  for (const token of ['FIELD NAME', 'CARRIER OBJECT SHAPE', 'SERIALIZATION', 'API, DB, EVENT', 'COMPATIBILITY', 'MAPPING', 'GateState', 'REPLAY', 'SAFE PRESENTATION', 'DATA CONTRACTS', 'IMPLEMENTATION', 'GATES']) assert.ok(open.includes(token), token);
  const siblings = G42_INDEPENDENT_BOUNDARIES.join('\n');
  for (const token of ['XFR-D-030', 'XFR-D-032', 'XFR-D-033', 'XFR-D-038', 'XFR-D-039 v1.1', 'XFR-D-040', 'XFR-D-041', 'XFR-D-043', 'XFR-D-044', 'XFR-D-055', 'XFR-D-M2', 'NO SIBLING BOUNDARY IS REOPENED']) assert.ok(siblings.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationRuntimeRepresentationResponsibilityBoundaryReference));
  assert.equal(occurrences(markup, G42_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G42_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G42_TERMINAL_LINE), 1);
  assert.match(G42_NON_DECISION_RESULT, /EXACT RUNTIME REPRESENTATION REMAINS OPEN/);
  assert.match(G42_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface is static and has no controls, links, live regions or active behavior', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationRuntimeRepresentationResponsibilityBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculate\w*\s*\(/, /select\w*\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G42 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticQualificationRuntimeRepresentationResponsibilityBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticQualificationRuntimeRepresentationResponsibilityBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticQualificationRuntimeRepresentationResponsibilityBoundaryReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G42Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G42_SYNTHETIC_QUALIFICATION_RUNTIME_REPRESENTATION_RESPONSIBILITY_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_representation.length, 10);
  assert.equal(allowlist.reference.terminal_token, G42_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G42_TERMINAL_LINE);
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
  assert.equal(allowlist.governance.evidence_procedure_owner_assigned_by_xfr_d_031, false);
  assert.equal(allowlist.governance.named_appointment_or_rbac_created, false);
  assert.equal(allowlist.governance.gate_state_automatic_reuse, 'PROHIBITED');
  assert.equal(allowlist.governance.fifth_result_creation, 'PROHIBITED');
  assert.equal(allowlist.governance.gate_impact, 'NONE');
  assert.equal(allowlist.governance.implementation_readiness_gate, 'BLOCKED');
  assert.equal(allowlist.governance.synthetic_acceptance_gate, 'BLOCKED');
  assert.equal(allowlist.governance.production_launch_gate, 'BLOCKED');
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
