import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticLawfulBasisProjectionBoundaryReference from '../src/synthetic/SyntheticLawfulBasisProjectionBoundaryReference.js';
import {
  SYNTHETIC_LAWFUL_BASIS_ENUM_BOUNDARY,
  SYNTHETIC_LAWFUL_BASIS_FAIL_CLOSED_BOUNDARY,
  SYNTHETIC_LAWFUL_BASIS_OPEN_CONTENT,
  SYNTHETIC_LAWFUL_BASIS_PROJECTION_DISCLAIMER,
  SYNTHETIC_LAWFUL_BASIS_PROJECTION_MATRIX,
  SYNTHETIC_LAWFUL_BASIS_PROJECTION_REGIONS_IN_ORDER,
  SYNTHETIC_LAWFUL_BASIS_PROJECTION_SCOPE_LINE,
  SYNTHETIC_LAWFUL_BASIS_PROJECTION_SOURCE_BOUNDARY,
  SYNTHETIC_LAWFUL_BASIS_PROJECTION_TITLE,
  SYNTHETIC_LAWFUL_BASIS_STATUS_VALUES,
  SYNTHETIC_LAWFUL_BASIS_TERMINAL_LINE,
  SYNTHETIC_LAWFUL_BASIS_TERMINAL_TOKEN
} from '../src/synthetic/syntheticLawfulBasisProjectionBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-lawful-basis-projection-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticLawfulBasisProjectionBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticLawfulBasisProjectionBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticLawfulBasisProjectionBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-lawful-basis-projection-boundary-reference', 'G25_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '69e7dac2b7306cff5d9a88677e8c3f60c58973b6890b0f84d1a0fb0ce2852231';

const EXPECTED_STATUSES = ['ACTIVE', 'EXPIRED', 'REVOKED', 'TERMINATED', 'SUSPENDED', 'UNDER_REVIEW'] as const;
const EXPECTED_BOUNDARIES = ['Source ownership', 'Purpose and scope', 'Version', 'Invalidation', 'Existing contracts', 'Decision meaning'] as const;

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticLawfulBasisProjectionBoundaryReference));
  for (const line of [SYNTHETIC_LAWFUL_BASIS_PROJECTION_TITLE, SYNTHETIC_LAWFUL_BASIS_PROJECTION_DISCLAIMER, SYNTHETIC_LAWFUL_BASIS_PROJECTION_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of SYNTHETIC_LAWFUL_BASIS_PROJECTION_REGIONS_IN_ORDER) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('sole-writer matrix preserves exactly six qualitative rows', () => {
  assert.deepEqual(SYNTHETIC_LAWFUL_BASIS_PROJECTION_MATRIX.map(row => row.boundary), EXPECTED_BOUNDARIES);
  const source = SYNTHETIC_LAWFUL_BASIS_PROJECTION_MATRIX[0];
  assert.equal(source.sourceAuthority, 'Lawful Basis/Consent Registry');
  assert.match(source.explicitProhibition, /No create, extend, restore, replace, amend or reinterpret/);
  const existing = SYNTHETIC_LAWFUL_BASIS_PROJECTION_MATRIX[4];
  assert.equal(existing.permittedFuturePosture, 'Context only');
  assert.match(existing.explicitProhibition, /No import into Matching by analogy/);
});

test('surface has exactly one semantic six-row matrix', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticLawfulBasisProjectionBoundaryReference));
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 7);
  for (const boundary of EXPECTED_BOUNDARIES) assert.equal(occurrences(markup, `>${boundary}</th>`), 1, boundary);
});

test('exact six-value source enum is preserved without mapping or transition', () => {
  assert.deepEqual(SYNTHETIC_LAWFUL_BASIS_STATUS_VALUES, EXPECTED_STATUSES);
  assert.equal(new Set(SYNTHETIC_LAWFUL_BASIS_STATUS_VALUES).size, 6);
  const copy = SYNTHETIC_LAWFUL_BASIS_ENUM_BOUNDARY.join('\n');
  assert.match(copy, /NO CONTRACT MAPPING, ORDERING, EQUIVALENCE, SEVERITY, TRANSITION OR STATE MACHINE/);
  assert.match(copy, /ACTIVE DOES NOT APPROVE A FEATURE, USE, MATCHING CONTRACT OR RUNTIME/);
  assert.match(copy, /NON-ACTIVE DOES NOT CREATE A NEGATIVE BUSINESS FACT OR AUTOMATIC INELIGIBLE/);
});

test('source boundary preserves partial resolution and future read-only posture', () => {
  const copy = SYNTHETIC_LAWFUL_BASIS_PROJECTION_SOURCE_BOUNDARY.join('\n');
  assert.match(copy, /XFR-D-016 v1\.0 — APPROVED PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(copy, /FS-19 → XFR-D-016 — PRIMARY_STANDALONE/);
  assert.match(copy, /SOLE WRITER/);
  assert.match(copy, /PURPOSE-BOUND, SCOPE-COMPATIBLE, VERSIONED AND READ-ONLY/);
  assert.match(copy, /NO IMPORT BY ANALOGY/);
});

test('unusable projection remains affected-use-only and non-adverse', () => {
  const copy = SYNTHETIC_LAWFUL_BASIS_FAIL_CLOSED_BOUNDARY.join('\n');
  for (const token of ['MISSING, UNKNOWN, STALE, EXPIRED, REVOKED, TERMINATED, SUSPENDED, UNDER-REVIEW, INVALIDATED, VERSION-MISMATCHED OR PURPOSE-MISMATCHED', 'AFFECTED GOVERNED USE', 'NO NEGATIVE FACT', 'NO GUESSED STATUS', 'PROJECTION PRESENCE IS NOT A LAWFUL-BASIS DETERMINATION']) assert.ok(copy.includes(token), token);
});

test('all twelve frozen open contract categories remain explicit', () => {
  assert.equal(SYNTHETIC_LAWFUL_BASIS_OPEN_CONTENT.length, 12);
  const copy = SYNTHETIC_LAWFUL_BASIS_OPEN_CONTENT.join('\n');
  for (const token of ['EXACT PROJECTION CONTENT', 'MAPPING OF THE SIX-VALUE SOURCE ENUM', 'RUNTIME CARRIER', 'TTL, CACHE, REFRESH', 'DATA CONTRACT EXTENSION', 'PROTECTED/PROXY CLASSIFICATION', 'PRODUCTION, RUNTIME, IMPLEMENTATION AND GATES']) assert.ok(copy.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticLawfulBasisProjectionBoundaryReference));
  assert.equal(occurrences(markup, SYNTHETIC_LAWFUL_BASIS_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_LAWFUL_BASIS_TERMINAL_LINE), 1);
  const start = markup.indexOf(`aria-label="${SYNTHETIC_LAWFUL_BASIS_PROJECTION_REGIONS_IN_ORDER[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticLawfulBasisProjectionBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no contract execution, decisions, handlers, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /writeLawfulBasis/, /mapLawfulBasisStatus/, /transitionState/, /evaluateEligibility/, /calculateScore/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G25 scope', () => {
  const html = read(HTML_PATH); const entry = read(ENTRY_PATH); const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticLawfulBasisProjectionBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticLawfulBasisProjectionBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticLawfulBasisProjectionBoundaryReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as { closed: boolean; result_label: string; governance: Record<string, string>; allowed_paths: Array<{ state: string }>; reference: { source_enum: { values: string[] }; sole_writer_and_read_only_consumption_matrix: unknown[] } };
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G25_SYNTHETIC_LAWFUL_BASIS_PROJECTION_BOUNDARY_REFERENCE_VERIFIED');
  assert.deepEqual(allowlist.reference.source_enum.values, EXPECTED_STATUSES);
  assert.equal(allowlist.reference.sole_writer_and_read_only_consumption_matrix.length, 6);
  assert.deepEqual(allowlist.governance, { governance_owner: 'Chief AI Architect + DEVELOPMENT + LEGAL', feature_schema_artifact_owner: 'PRODUCT + LEGAL + AI', mandatory_approvers: 'PRODUCT + AI', evidence_technical_procedure_owner: 'AI + DEVELOPMENT', evidence_owner_unilateral_authority: 'PROHIBITED', gate_impact: 'NONE', implementation_readiness_gate: 'BLOCKED', synthetic_acceptance_gate: 'BLOCKED', production_launch_gate: 'BLOCKED' });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
