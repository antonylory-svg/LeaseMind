import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticMutualAggregateQualitativeBoundaryReference from '../src/synthetic/SyntheticMutualAggregateQualitativeBoundaryReference.js';
import {
  SYNTHETIC_MUTUAL_AGGREGATE_CANDIDATE_BOUNDARY,
  SYNTHETIC_MUTUAL_AGGREGATE_CANDIDATES,
  SYNTHETIC_MUTUAL_AGGREGATE_DISCLAIMER,
  SYNTHETIC_MUTUAL_AGGREGATE_EVIDENCE_BOUNDARY,
  SYNTHETIC_MUTUAL_AGGREGATE_EVIDENCE_PREREQUISITES,
  SYNTHETIC_MUTUAL_AGGREGATE_MATRIX,
  SYNTHETIC_MUTUAL_AGGREGATE_OPEN_CONTENT,
  SYNTHETIC_MUTUAL_AGGREGATE_REGIONS_IN_ORDER,
  SYNTHETIC_MUTUAL_AGGREGATE_SCOPE_LINE,
  SYNTHETIC_MUTUAL_AGGREGATE_SOURCE_BOUNDARY,
  SYNTHETIC_MUTUAL_AGGREGATE_TERMINAL_LINE,
  SYNTHETIC_MUTUAL_AGGREGATE_TERMINAL_TOKEN,
  SYNTHETIC_MUTUAL_AGGREGATE_TITLE
} from '../src/synthetic/syntheticMutualAggregateQualitativeBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-mutual-aggregate-qualitative-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticMutualAggregateQualitativeBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticMutualAggregateQualitativeBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticMutualAggregateQualitativeBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-mutual-aggregate-qualitative-boundary-reference', 'G26_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = 'ff2f3196237168e61e96d626835be76ec22722e3ca96dcff0a949d567f1f9341';

const EXPECTED_ROWS = ['TENANT_FIT', 'OWNER_FIT', 'TWO_INPUT_STRUCTURE', 'ANTI_MASKING', 'HARD_CONSTRAINT_PRECEDENCE', 'EVIDENCE_NON_COMPENSATION', 'DECISION_MEANING'] as const;

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMutualAggregateQualitativeBoundaryReference));
  for (const line of [SYNTHETIC_MUTUAL_AGGREGATE_TITLE, SYNTHETIC_MUTUAL_AGGREGATE_DISCLAIMER, SYNTHETIC_MUTUAL_AGGREGATE_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of SYNTHETIC_MUTUAL_AGGREGATE_REGIONS_IN_ORDER) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one semantic seven-row qualitative matrix', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMutualAggregateQualitativeBoundaryReference));
  assert.deepEqual(SYNTHETIC_MUTUAL_AGGREGATE_MATRIX.map(row => row.boundary), EXPECTED_ROWS);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 8);
  for (const row of EXPECTED_ROWS) assert.equal(occurrences(markup, `>${row}</th>`), 1, row);
});

test('source structure stays textual and preserves partial decision status', () => {
  const copy = SYNTHETIC_MUTUAL_AGGREGATE_SOURCE_BOUNDARY.join('\n');
  assert.match(copy, /XFR-D-017 v1\.0 — APPROVED PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(copy, /MSP-01 → XFR-D-017 — PRIMARY_STANDALONE/);
  assert.match(copy, /Reciprocal Fit = Mutual Aggregate\(Tenant Fit, Owner Fit\)/);
  assert.match(copy, /SEPARATE ATTRIBUTABLE INPUTS/);
  assert.match(copy, /ALL EXACT CONTENT REMAIN OPEN/);
});

test('bilateral anti-masking, precedence and non-compensation remain qualitative', () => {
  const byName = new Map(SYNTHETIC_MUTUAL_AGGREGATE_MATRIX.map(row => [row.boundary, row]));
  assert.match(byName.get('ANTI_MASKING')?.frozenQualitativeMeaning ?? '', /High Tenant Fit cannot mask critically low Owner Fit, and high Owner Fit cannot mask critically low Tenant Fit/);
  assert.match(byName.get('ANTI_MASKING')?.explicitProhibition ?? '', /no threshold, tolerance or number/i);
  assert.match(byName.get('HARD_CONSTRAINT_PRECEDENCE')?.explicitProhibition ?? '', /cannot restore or compensate/);
  assert.match(byName.get('EVIDENCE_NON_COMPENSATION')?.explicitProhibition ?? '', /cannot hide/);
});

test('harmonic and geometric are symmetric candidates with no decision or permanent exhaustiveness', () => {
  assert.deepEqual(SYNTHETIC_MUTUAL_AGGREGATE_CANDIDATES, [
    { name: 'HARMONIC', status: 'DECISION_CANDIDATE_FOR_REVIEW' },
    { name: 'GEOMETRIC', status: 'DECISION_CANDIDATE_FOR_REVIEW' }
  ]);
  const copy = SYNTHETIC_MUTUAL_AGGREGATE_CANDIDATE_BOUNDARY.join('\n');
  assert.match(copy, /NEITHER CANDIDATE IS SELECTED, RECOMMENDED, ORDERED, PREFERRED, DEFAULTED, USED AS FALLBACK OR REJECTED/);
  assert.match(copy, /NOT DECLARED PERMANENTLY EXHAUSTIVE/);
  assert.match(copy, /NO FORMULA, MATHEMATICAL OPERATOR, NUMERIC EXAMPLE/);
});

test('all frozen evidence prerequisites and affected-approval-only fail-closed semantics remain explicit', () => {
  assert.equal(SYNTHETIC_MUTUAL_AGGREGATE_EVIDENCE_PREREQUISITES.length, 12);
  const prerequisites = SYNTHETIC_MUTUAL_AGGREGATE_EVIDENCE_PREREQUISITES.join('\n');
  for (const token of ['CANDIDATE POLICY VERSION, HASH', 'LABEL ELIGIBILITY/ADJUDICATION', 'FALSE-EXCLUSION, FALSE-ELIGIBILITY', 'TUNING/FINAL ISOLATION', 'COMPATIBLE COMPARISON', 'PROTECTED/PROXY AND FAIRNESS', 'SYNTHETIC-ONLY VERSUS PRODUCTION-DATA']) assert.ok(prerequisites.includes(token), token);
  const boundary = SYNTHETIC_MUTUAL_AGGREGATE_EVIDENCE_BOUNDARY.join('\n');
  assert.match(boundary, /PREREQUISITES ONLY/);
  assert.match(boundary, /AFFECTED FUNCTION-APPROVAL PROGRESSION/);
  assert.match(boundary, /NO NUMERIC ZERO, NEGATIVE FACT, PASS, FAIL, WINNER, INELIGIBLE/);
});

test('all twelve frozen open categories remain explicit', () => {
  assert.equal(SYNTHETIC_MUTUAL_AGGREGATE_OPEN_CONTENT.length, 12);
  const copy = SYNTHETIC_MUTUAL_AGGREGATE_OPEN_CONTENT.join('\n');
  for (const token of ['HARMONIC VERSUS GEOMETRIC SELECTION', 'EXACT FORMULA REPRESENTATION', 'SCALE, PRECISION', 'NUMERATOR, DENOMINATOR', 'HYPOTHESES, TESTS', 'EVIDENCE SUFFICIENCY', 'RUNTIME CARRIER', 'PRODUCTION, RUNTIME, IMPLEMENTATION AND GATES']) assert.ok(copy.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMutualAggregateQualitativeBoundaryReference));
  assert.equal(occurrences(markup, SYNTHETIC_MUTUAL_AGGREGATE_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_MUTUAL_AGGREGATE_TERMINAL_LINE), 1);
  const start = markup.indexOf(`aria-label="${SYNTHETIC_MUTUAL_AGGREGATE_REGIONS_IN_ORDER[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMutualAggregateQualitativeBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateMutualAggregate/, /computeScore/, /selectFunction/, /evaluateEligibility/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G26 scope', () => {
  const html = read(HTML_PATH); const entry = read(ENTRY_PATH); const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticMutualAggregateQualitativeBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticMutualAggregateQualitativeBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticMutualAggregateQualitativeBoundaryReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as { closed: boolean; result_label: string; governance: Record<string, string>; allowed_paths: Array<{ state: string }>; reference: { source_structure: string; two_input_and_anti_masking_matrix: unknown[]; candidates: Array<{ name: string; status: string; selected: boolean }> } };
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G26_SYNTHETIC_MUTUAL_AGGREGATE_QUALITATIVE_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.source_structure, 'Reciprocal Fit = Mutual Aggregate(Tenant Fit, Owner Fit)');
  assert.equal(allowlist.reference.two_input_and_anti_masking_matrix.length, 7);
  assert.deepEqual(allowlist.reference.candidates.map(({ name, status, selected }) => ({ name, status, selected })), [
    { name: 'HARMONIC', status: 'DECISION_CANDIDATE_FOR_REVIEW', selected: false },
    { name: 'GEOMETRIC', status: 'DECISION_CANDIDATE_FOR_REVIEW', selected: false }
  ]);
  assert.deepEqual(allowlist.governance, { governance_owner: 'Chief AI Architect + DEVELOPMENT + AI', scoring_policy_artifact_owner: 'Chief AI Architect + PRODUCT', substantive_governance_owner: 'AI + PRODUCT', xfr_mandatory_approvers: 'Chief AI Architect + LEGAL + DEVELOPMENT', package_mandatory_approvers: 'PRODUCT + LEGAL', evidence_technical_procedure_owner: 'AI + DEVELOPMENT', evidence_owner_unilateral_authority: 'PROHIBITED', eventual_function_approval: 'ALL_FIVE_FUNCTIONS_SAME_VERSION_HASH', gate_impact: 'NONE', implementation_readiness_gate: 'BLOCKED', synthetic_acceptance_gate: 'BLOCKED', production_launch_gate: 'BLOCKED' });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
