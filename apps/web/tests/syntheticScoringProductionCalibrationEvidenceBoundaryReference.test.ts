import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticScoringProductionCalibrationEvidenceBoundaryReference from '../src/synthetic/SyntheticScoringProductionCalibrationEvidenceBoundaryReference.js';
import {
  G38_DISCLAIMER,
  G38_EVIDENCE_BOUNDARY,
  G38_EVIDENCE_MATRIX,
  G38_NON_AUTHORIZATION,
  G38_NON_DECISION_RESULT,
  G38_OPEN_CONTENT,
  G38_REGIONS,
  G38_ROLE_SEPARATION,
  G38_SCOPE_LINE,
  G38_SOURCE_BOUNDARY,
  G38_TERMINAL_LINE,
  G38_TERMINAL_TOKEN,
  G38_TITLE
} from '../src/synthetic/syntheticScoringProductionCalibrationEvidenceBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-scoring-production-calibration-evidence-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticScoringProductionCalibrationEvidenceBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticScoringProductionCalibrationEvidenceBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticScoringProductionCalibrationEvidenceBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-scoring-production-calibration-evidence-boundary-reference', 'G38_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = 'c12b1f9a51e9a5bfdc69de26f9fd592ae765e98db86dee7f52e4d3cd4a1f6875';

type G38Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string>;
  allowed_paths: Array<{ path: string; state: string }>;
  reference: { matrix: Array<{ row: number; frozen: string }>; open_exact_content: string[]; terminal_token: string; terminal_line: string };
};

const EXPECTED_TITLE = 'SYNTHETIC SCORING PRODUCTION-CALIBRATION EVIDENCE BOUNDARY REFERENCE — NOT PRODUCTION APPROVED';
const EXPECTED_DISCLAIMER = 'MANUAL DEV-ONLY REFERENCE — SYNTHETIC-ONLY EVIDENCE DOES NOT ESTABLISH PRODUCTION CALIBRATION OR READINESS';
const EXPECTED_SCOPE_LINE = 'NO DATASET, METRIC, CALIBRATION PROCEDURE, ACCEPTANCE THRESHOLD, PRODUCTION-READINESS CRITERION, SCORING CANDIDATE, POLICY OR RUNTIME USE SELECTED';
const EXPECTED_REGIONS = ['SOURCE AND STATUS BOUNDARY', 'SYNTHETIC-TO-PRODUCTION EVIDENCE MATRIX', 'ROLE AND EVIDENCE-PROCEDURE SEPARATION', 'SYNTHETIC EVIDENCE, MIRRORED PRECEDENT AND NO-AUTOMATIC-APPROVAL BOUNDARY', 'OPEN EXACT CONTENT', 'NON-DECISION RESULT'] as const;

test('frozen title, permanent lines and six regions render in exact order', () => {
  assert.equal(G38_TITLE, EXPECTED_TITLE);
  assert.equal(G38_DISCLAIMER, EXPECTED_DISCLAIMER);
  assert.equal(G38_SCOPE_LINE, EXPECTED_SCOPE_LINE);
  assert.deepEqual(G38_REGIONS, EXPECTED_REGIONS);
  const markup = renderToStaticMarkup(createElement(SyntheticScoringProductionCalibrationEvidenceBoundaryReference));
  for (const line of [EXPECTED_TITLE, EXPECTED_DISCLAIMER, EXPECTED_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of EXPECTED_REGIONS) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has one twelve-row matrix matching the closed allowlist', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringProductionCalibrationEvidenceBoundaryReference));
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G38Allowlist;
  assert.deepEqual(G38_EVIDENCE_MATRIX.map(row => row.frozenBoundary), allowlist.reference.matrix.map(row => row.frozen));
  assert.equal(G38_EVIDENCE_MATRIX.length, 12);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tr'), 13);
  for (const row of G38_EVIDENCE_MATRIX) assert.equal(occurrences(markup, `>${row.matrixRow}</th>`), 1, row.matrixRow);
});

test('source identity, status, counts and all authority roles remain exact', () => {
  const source = G38_SOURCE_BOUNDARY.join('\n');
  assert.match(source, /XFR-D-026 v1\.0 — RESOLVED_EVIDENCE_BOUNDARY/);
  assert.match(source, /MSP-15 → XFR-D-026 — PRIMARY_STANDALONE/);
  assert.match(source, /102 SOURCE KEYS \/ 90 CANONICAL IDS/);
  assert.match(source, /REMAIN BLOCKED/);
  const roles = G38_ROLE_SEPARATION.join('\n');
  for (const token of ['Chief AI Architect + PRODUCT', 'LEGAL + DEVELOPMENT', 'CONSULTED DOMAIN FUNCTION: AI', 'AI + DEVELOPMENT', 'NOT GOVERNANCE CO-OWNERSHIP', 'NO UNILATERAL', 'NO SELF-APPROVAL']) assert.ok(roles.includes(token), token);
});

test('synthetic-only evidence and successful metrics create no production or approval claim', () => {
  const boundary = G38_EVIDENCE_BOUNDARY.join('\n');
  for (const token of ['CATEGORIES 1–4', 'DOES NOT BY ITSELF ESTABLISH PRODUCTION CALIBRATION', 'SUCCESSFUL SYNTHETIC EVALUATION', 'IS EVIDENCE ONLY', 'IS NOT MUTUAL AGGREGATE', 'MIRRORS MRP-C-013 AND MQP-C-019', 'WITHOUT SUPERSEDING', 'PRODUCTION EVIDENCE', 'NO AUTOMATIC POLICY', 'ARCHITECTURE §37 QUESTIONS №2 AND №3 REMAIN OPEN', 'DISTINCT']) assert.ok(boundary.includes(token), token);
});

test('all exact evidence, calibration, candidate, policy and runtime content remains open', () => {
  assert.equal(G38_OPEN_CONTENT.length, 10);
  const open = G38_OPEN_CONTENT.join('\n');
  for (const token of ['DATASET SIZE', 'LABEL QUALITY', 'METRIC DEFINITION', 'CALIBRATION PROCEDURE', 'ACCEPTANCE THRESHOLD', 'PRODUCTION-READINESS CRITERION', 'MUTUAL AGGREGATE FUNCTION', 'WEIGHTS', 'SCORING POLICY', 'RUNTIME']) assert.ok(open.includes(token), token);
  const nonAuthorization = G38_NON_AUTHORIZATION.join('\n');
  for (const token of ['NO EVALUATION PLAN', 'NO DATASET', 'NO RESULT AUTOMATICALLY CHANGES']) assert.ok(nonAuthorization.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringProductionCalibrationEvidenceBoundaryReference));
  assert.equal(occurrences(markup, G38_NON_DECISION_RESULT), 1);
  assert.equal(occurrences(markup, G38_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, G38_TERMINAL_LINE), 1);
  assert.match(G38_NON_DECISION_RESULT, /REMAINS RESOLVED_EVIDENCE_BOUNDARY/);
  assert.match(G38_NON_DECISION_RESULT, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
  const start = markup.indexOf(`aria-label="${EXPECTED_REGIONS[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringProductionCalibrationEvidenceBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculate\w*\s*\(/, /calibrate\w*\s*\(/, /computeScore\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G38 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticScoringProductionCalibrationEvidenceBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticScoringProductionCalibrationEvidenceBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticScoringProductionCalibrationEvidenceBoundaryReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G38Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G38_SYNTHETIC_SCORING_PRODUCTION_CALIBRATION_EVIDENCE_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.matrix.length, 12);
  assert.equal(allowlist.reference.open_exact_content.length, 10);
  assert.equal(allowlist.reference.terminal_token, G38_TERMINAL_TOKEN);
  assert.equal(allowlist.reference.terminal_line, G38_TERMINAL_LINE);
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
