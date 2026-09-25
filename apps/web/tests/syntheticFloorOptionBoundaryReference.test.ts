import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticFloorOptionBoundaryReference from '../src/synthetic/SyntheticFloorOptionBoundaryReference.js';
import {
  SYNTHETIC_FLOOR_OPTION_APPROVED_CASES,
  SYNTHETIC_FLOOR_OPTION_OPEN_AND_INDEPENDENCE_BOUNDARIES,
  SYNTHETIC_FLOOR_OPTION_REFERENCE_DISCLAIMER,
  SYNTHETIC_FLOOR_OPTION_REFERENCE_REGIONS_IN_ORDER,
  SYNTHETIC_FLOOR_OPTION_REFERENCE_SCOPE_LINE,
  SYNTHETIC_FLOOR_OPTION_REFERENCE_TITLE,
  SYNTHETIC_FLOOR_OPTION_SOURCE_BOUNDARY,
  SYNTHETIC_FLOOR_OPTION_TERMINAL_LINE,
  SYNTHETIC_FLOOR_OPTION_TERMINAL_TOKEN
} from '../src/synthetic/syntheticFloorOptionBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-floor-option-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticFloorOptionBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticFloorOptionBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticFloorOptionBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-floor-option-boundary-reference', 'G21_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '89af48757daf357f8da9271c892076d0b531347e8a3e5153dd46bf15b4395e96';

test('frozen title, permanent lines and five regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticFloorOptionBoundaryReference));
  for (const line of [SYNTHETIC_FLOOR_OPTION_REFERENCE_TITLE, SYNTHETIC_FLOOR_OPTION_REFERENCE_DISCLAIMER, SYNTHETIC_FLOOR_OPTION_REFERENCE_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of SYNTHETIC_FLOOR_OPTION_REFERENCE_REGIONS_IN_ORDER) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 5);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('exactly two approved cases preserve wildcard and land non-conflation', () => {
  assert.equal(SYNTHETIC_FLOOR_OPTION_APPROVED_CASES.length, 2);
  const [wildcardCase, landCase] = SYNTHETIC_FLOOR_OPTION_APPROVED_CASES;
  assert.equal(wildcardCase.condition, 'request_floor_options = [any]');
  for (const token of ['PRESENT AND UNRESTRICTED', 'NO FLOOR COMPARISON', 'NO DERIVED value_state', 'NOT NOT_APPLICABLE', 'NO PASS, FAIL']) assert.ok(`${wildcardCase.approvedBoundary}\n${wildcardCase.notApproved}`.includes(token), token);
  assert.equal(landCase.condition, 'property_type = land AND STRUCTURALLY REQUIRED property_floor = null');
  for (const token of ['FLOOR FEATURE value_state = NOT_APPLICABLE', 'NOT PASS', 'property_type_membership RESULT']) assert.ok(`${landCase.approvedBoundary}\n${landCase.notApproved}`.includes(token), token);
});

test('independent property type and two independent open follow-ups remain explicit', () => {
  const copy = SYNTHETIC_FLOOR_OPTION_OPEN_AND_INDEPENDENCE_BOUNDARIES.join('\n');
  for (const token of ['property_type_membership REMAINS INDEPENDENT', 'NUMERIC-TO-CATEGORY CONVENTION', 'EXACT DERIVED WILDCARD value_state', 'TWO OPEN FOLLOW-UPS ARE INDEPENDENT', 'NEITHER IS A PREREQUISITE']) assert.ok(copy.includes(token), token);
});

test('blocked row and fail-closed safeguards remain visible', () => {
  const copy = [...SYNTHETIC_FLOOR_OPTION_SOURCE_BOUNDARY, ...SYNTHETIC_FLOOR_OPTION_OPEN_AND_INDEPENDENCE_BOUNDARIES].join('\n');
  for (const token of ['floor_option_fit', 'BLOCKED_PENDING_DECISION', 'BLOCKED_PENDING_COMPATIBILITY_TABLE', 'required_evidence_level', 'FINAL LEGAL VERDICT = NOT_APPROVED', 'automatic_ineligible_allowed = NO', 'CANDIDATE value_state = UNKNOWN', 'AUTOMATIC INELIGIBLE']) assert.ok(copy.includes(token), token);
});

test('surface contains no invented numeric mapping, compatibility matrix or evaluator', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticFloorOptionBoundaryReference));
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody><tr>'), 1);
  assert.equal(occurrences(markup, '<tr'), 3);
  assert.equal(occurrences(markup, '<td'), 4);
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH)].join('\n');
  for (const pattern of [/property_floor\s*[<>]=?\s*[-+]?\d/, /property_total_floors\s*[<>]=?\s*[-+]?\d/, /Math\.(floor|ceil|round)\s*\(/, /compatibilityMatrix/, /evaluateFloor/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('terminal region is last and reports only non-computation', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticFloorOptionBoundaryReference));
  assert.equal(occurrences(markup, SYNTHETIC_FLOOR_OPTION_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_FLOOR_OPTION_TERMINAL_LINE), 1);
  const start = markup.indexOf(`aria-label="${SYNTHETIC_FLOOR_OPTION_REFERENCE_REGIONS_IN_ORDER[4]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticFloorOptionBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no state, effects, handlers, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /onSubmit\s*=/, /onKeyDown\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and entry bind only the isolated g21 component', () => {
  const html = read(HTML_PATH); const entry = read(ENTRY_PATH); const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticFloorOptionBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticFloorOptionBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticFloorOptionBoundaryReferenceScenario\.js'/);
  for (const prior of ['SyntheticEntranceRequirementCompatibilityReference', 'SyntheticAccessModeCompatibilityReference', 'SyntheticFeatureReadinessMatrix', 'SyntheticMatchingReadinessTrace']) { assert.equal(entry.includes(prior), false, prior); assert.equal(component.includes(prior), false, prior); }
});

test('closed allowlist matches exact g21 scope, cases and blocked gates', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as { closed: boolean; result_label: string; reference: { approved_cases: unknown[]; independent_open_followups: string[] }; governance: Record<string, string>; allowed_paths: Array<{ state: string }> };
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G21_SYNTHETIC_FLOOR_OPTION_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.approved_cases.length, 2);
  assert.equal(allowlist.reference.independent_open_followups.length, 2);
  assert.deepEqual(allowlist.governance, { gate_impact: 'NONE', implementation_readiness_gate: 'BLOCKED', synthetic_acceptance_gate: 'BLOCKED', production_launch_gate: 'BLOCKED' });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
});

test('production entry points expose no g21 page or component', () => {
  for (const file of ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json']) { const source = read(path.join(WEB_ROOT, file)); assert.equal(source.includes('synthetic-floor-option-boundary-reference'), false, file); assert.equal(source.includes('SyntheticFloorOptionBoundaryReference'), false, file); assert.equal(source.includes('syntheticFloorOptionBoundaryReference'), false, file); }
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
