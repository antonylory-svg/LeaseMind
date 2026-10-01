import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReference from '../src/synthetic/SyntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReference.js';
import {
  G41_BOUNDARY_MATRIX,
  G41_DISCLAIMER,
  G41_INDEPENDENT_BOUNDARIES,
  G41_NON_CONFLATION_BOUNDARY,
  G41_NON_DECISION_RESULT,
  G41_OPEN_CONTENT,
  G41_REGIONS,
  G41_ROLE_SEPARATION,
  G41_SCOPE_LINE,
  G41_SOURCE_BOUNDARY,
  G41_TERMINAL_LINE,
  G41_TERMINAL_TOKEN,
  G41_TITLE
} from '../src/synthetic/syntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-qualification-policy-artifact-owner-governance-assignment-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-qualification-policy-artifact-owner-governance-assignment-reference', 'G41_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '94b59fbc168725852711fad791d6f352d0da8b7a709db8d4e85faa5f838df89c';

type G41Allowlist = {
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

const EXPECTED_TITLE = 'SYNTHETIC QUALIFICATION POLICY ARTIFACT-OWNER GOVERNANCE-ASSIGNMENT REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — ROLE ASSIGNMENT IS NOT POLICY APPROVAL';
const EXPECTED_SCOPE_LINE = 'NO THRESHOLD, PRECEDENCE, REASON CATALOG, ROUTING RULE, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = ['SOURCE AND STATUS BOUNDARY', 'ARTIFACT-OWNER GOVERNANCE MATRIX', 'OWNER / APPROVER / CONSULTED ROLE SEPARATION', 'TECHNICAL-WRITER AND THRESHOLD-OWNER NON-CONFLATION', 'OPEN EXACT CONTENT', 'NON-DECISION RESULT'] as const;

test('frozen title, permanent lines and six regions match the closed allowlist', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G41Allowlist;
  assert.equal(G41_TITLE, EXPECTED_TITLE);
  assert.equal(G41_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G41_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G41_REGIONS, EXPECTED_REGIONS);
  assert.equal(allowlist.reference.future_surface.title, EXPECTED_TITLE);
  assert.deepEqual(allowlist.reference.future_surface.permanent_lines, [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.future_surface.regions_in_order, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has one twelve-row matrix matching the closed allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G41Allowlist;
  assert.deepEqual(G41_BOUNDARY_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.equal(G41_BOUNDARY_MATRIX.length, 12);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of G41_BOUNDARY_MATRIX) assert.equal(occurrences(markup, `>${row.matrixRow}</th>`), 1, row.matrixRow);
});

test('source identity, status, scope and counts remain exact', () => {
  const source = G41_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-030 v1\.0 — APPROVED GOVERNANCE ASSIGNMENT — POLICY NOT APPROVED/);
  assert.match(source, /MQP-01 → XFR-D-030 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /20 ROWS/);
  for (const token of ['ARTIFACT OWNER', 'MANDATORY APPROVERS', 'CONSULTED FUNCTION', 'ALL EXACT ROUTING CONTENT', 'REMAIN BLOCKED']) assert.ok(source.includes(token), token);
});

test('owner, approver and consulted roles remain exact and non-unilateral', () => {
  const roles = G41_ROLE_SEPARATION.join('\n');
  for (const token of ['Chief AI Architect + PRODUCT', 'LEGAL', 'DEVELOPMENT', 'CONSULTED DOMAIN FUNCTION: AI', 'NO UNILATERAL AUTHORITY', 'NO EVIDENCE-PROCEDURE OWNER', 'NO NAMED PERSON', 'RBAC GRANT', 'NO PARTY MAY APPROVE']) assert.ok(roles.includes(token), token);
});

test('technical identity and limited threshold authority never become whole-Policy ownership', () => {
  const boundary = G41_NON_CONFLATION_BOUNDARY.join('\n');
  for (const token of ['FILENAME', 'TECHNICAL WRITER', 'RUNTIME COMPONENT', 'ARCHITECTURE §37 QUESTION №8', 'RISK→ROUTING THRESHOLD', 'NOT THE WHOLE QUALIFICATION POLICY', 'NO DEFAULT THRESHOLD', 'CANNOT BE GUESSED', 'IS NOT POLICY APPROVAL']) assert.ok(boundary.includes(token), token);
});

test('all exact Policy and operational contents remain open and siblings independent', () => {
  assert.equal(G41_OPEN_CONTENT.length, 10);
  const open = G41_OPEN_CONTENT.join('\n');
  for (const token of ['VERSION, HASH', 'FOUR ROUTING-RESULT', 'THRESHOLDS', 'PRECEDENCE', 'REASON CATALOGS', 'HUMAN-REVIEW', 'PROTECTED/PROXY', 'TTL', 'DATASET', 'SCHEMA', 'IMPLEMENTATION', 'GATES']) assert.ok(open.includes(token), token);
  const siblings = G41_INDEPENDENT_BOUNDARIES.join('\n');
  for (const token of ['XFR-D-031', 'XFR-D-032', 'XFR-D-033', 'XFR-D-M2', 'INDEPENDENT', 'NO SIBLING BOUNDARY IS REOPENED']) assert.ok(siblings.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReference));
  assert.equal(occurrences(markup, G41_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G41_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G41_TERMINAL_LINE), 1);
  assert.match(G41_NON_DECISION_RESULT, /POLICY NOT APPROVED/);
  assert.match(G41_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface is static and has no controls, links, live regions or active behavior', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculate\w*\s*\(/, /select\w*\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G41 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReference\.js'/);
  assert.match(component, /from '\.\/syntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G41Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G41_SYNTHETIC_QUALIFICATION_POLICY_ARTIFACT_OWNER_GOVERNANCE_ASSIGNMENT_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 10);
  assert.equal(allowlist.reference.terminal_token, G41_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G41_TERMINAL_LINE);
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
  assert.equal(allowlist.governance.evidence_procedure_owner_assigned_by_xfr_d_030, false);
  assert.equal(allowlist.governance.named_appointment_or_rbac_created, false);
  assert.equal(allowlist.governance.gate_impact, 'NONE');
  assert.equal(allowlist.governance.implementation_readiness_gate, 'BLOCKED');
  assert.equal(allowlist.governance.synthetic_acceptance_gate, 'BLOCKED');
  assert.equal(allowlist.governance.production_launch_gate, 'BLOCKED');
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
