import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticEntranceRequirementCompatibilityReference from '../src/synthetic/SyntheticEntranceRequirementCompatibilityReference.js';
import {
  SYNTHETIC_ENTRANCE_AXIS_BOUNDARIES,
  SYNTHETIC_ENTRANCE_PREFERENCE_AND_FAIL_CLOSED_BOUNDARIES,
  SYNTHETIC_ENTRANCE_PROPERTY_AXIS,
  SYNTHETIC_ENTRANCE_REQUEST_AXIS,
  SYNTHETIC_ENTRANCE_REQUIREMENT_MATRIX,
  SYNTHETIC_ENTRANCE_REQUIREMENT_REFERENCE_DISCLAIMER,
  SYNTHETIC_ENTRANCE_REQUIREMENT_REFERENCE_REGIONS_IN_ORDER,
  SYNTHETIC_ENTRANCE_REQUIREMENT_REFERENCE_SCOPE_LINE,
  SYNTHETIC_ENTRANCE_REQUIREMENT_REFERENCE_TITLE,
  SYNTHETIC_ENTRANCE_SOURCE_BOUNDARY,
  SYNTHETIC_ENTRANCE_TERMINAL_LINE,
  SYNTHETIC_ENTRANCE_TERMINAL_TOKEN
} from '../src/synthetic/syntheticEntranceRequirementCompatibilityReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-entrance-requirement-compatibility-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticEntranceRequirementCompatibilityReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticEntranceRequirementCompatibilityReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticEntranceRequirementCompatibilityReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-entrance-requirement-compatibility-reference', 'G20_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = 'f19668d1fa74078ff1fb7a1eae9ed7ad9fe8eadff97e03516d8e08bda3cbbe8e';

test('frozen title, permanent lines and five regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticEntranceRequirementCompatibilityReference));
  for (const line of [SYNTHETIC_ENTRANCE_REQUIREMENT_REFERENCE_TITLE, SYNTHETIC_ENTRANCE_REQUIREMENT_REFERENCE_DISCLAIMER, SYNTHETIC_ENTRANCE_REQUIREMENT_REFERENCE_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of SYNTHETIC_ENTRANCE_REQUIREMENT_REFERENCE_REGIONS_IN_ORDER) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 5);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('property and request axes are exact, distinct and source ordered', () => {
  assert.deepEqual(SYNTHETIC_ENTRANCE_PROPERTY_AXIS, ['separate_street', 'separate_yard', 'shared', 'loading_only', 'none']);
  assert.deepEqual(SYNTHETIC_ENTRANCE_REQUEST_AXIS, ['separate_required', 'separate_preferred', 'shared_allowed', 'no_preference']);
  assert.equal(new Set([...SYNTHETIC_ENTRANCE_PROPERTY_AXIS, ...SYNTHETIC_ENTRANCE_REQUEST_AXIS]).size, 9);
  const copy = SYNTHETIC_ENTRANCE_AXIS_BOUNDARIES.join('\n');
  for (const token of ['DISTINCT SOURCE ENUMS', 'NO SEPARATE-COVERS-SHARED', 'NO PHYSICAL ENTRANCE PROPERTY', 'NO LOADING_ONLY OR NONE PURPOSE']) assert.ok(copy.includes(token), token);
});

test('matrix is exact 5 by 4 with totals 13 compatible, 1 candidate and 6 verification', () => {
  assert.equal(SYNTHETIC_ENTRANCE_REQUIREMENT_MATRIX.length, 5);
  assert.ok(SYNTHETIC_ENTRANCE_REQUIREMENT_MATRIX.every(row => row.length === 4));
  const cells = SYNTHETIC_ENTRANCE_REQUIREMENT_MATRIX.flat();
  assert.equal(cells.length, 20);
  assert.equal(cells.filter(cell => cell === 'COMPATIBLE').length, 13);
  assert.equal(cells.filter(cell => cell === 'INCOMPATIBLE_CANDIDATE').length, 1);
  assert.equal(cells.filter(cell => cell === 'NEEDS_VERIFICATION').length, 6);
  assert.equal(SYNTHETIC_ENTRANCE_REQUIREMENT_MATRIX[2][0], 'INCOMPATIBLE_CANDIDATE');
});

test('six open cells remain exact and no additional cell is opened', () => {
  const openPairs: string[] = [];
  SYNTHETIC_ENTRANCE_REQUIREMENT_MATRIX.forEach((row, rowIndex) => row.forEach((status, columnIndex) => { if (status === 'NEEDS_VERIFICATION') openPairs.push(`${SYNTHETIC_ENTRANCE_PROPERTY_AXIS[rowIndex]} × ${SYNTHETIC_ENTRANCE_REQUEST_AXIS[columnIndex]}`); }));
  assert.deepEqual(openPairs, ['separate_street × shared_allowed', 'separate_yard × shared_allowed', 'loading_only × separate_required', 'loading_only × shared_allowed', 'none × separate_required', 'none × shared_allowed']);
});

test('preference and fail-closed copy preserve diagnostic separation and none versus absence', () => {
  const copy = [...SYNTHETIC_ENTRANCE_SOURCE_BOUNDARY, ...SYNTHETIC_ENTRANCE_PREFERENCE_AND_FAIL_CLOSED_BOUNDARIES].join('\n');
  for (const token of ['entrance_requirement_fit', 'separate_preferred IS A PREFERENCE', 'DOES NOT PROVE THE PREFERENCE IS SATISFIED', 'CONCEPT-LEVEL', 'NOT_APPLICABLE', 'UNKNOWN', 'DISTINCT FROM EXPLICIT none', 'INCOMPATIBLE_CANDIDATE IS NOT PASS, FAIL', 'automatic_ineligible_allowed = NO']) assert.ok(copy.includes(token), token);
});

test('terminal region is last and reports only non-computation', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticEntranceRequirementCompatibilityReference));
  assert.equal(occurrences(markup, SYNTHETIC_ENTRANCE_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_ENTRANCE_TERMINAL_LINE), 1);
  const start = markup.indexOf(`aria-label="${SYNTHETIC_ENTRANCE_REQUIREMENT_REFERENCE_REGIONS_IN_ORDER[4]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic table and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticEntranceRequirementCompatibilityReference));
  assert.equal(occurrences(markup, '<main'), 1);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<td'), 20);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no state, effects, handlers, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /onSubmit\s*=/, /onKeyDown\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and entry bind only the isolated g20 component', () => {
  const html = read(HTML_PATH); const entry = read(ENTRY_PATH); const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticEntranceRequirementCompatibilityReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticEntranceRequirementCompatibilityReference\.js'/);
  assert.match(component, /from '\.\/syntheticEntranceRequirementCompatibilityReferenceScenario\.js'/);
  for (const prior of ['SyntheticAccessModeCompatibilityReference', 'SyntheticFeatureReadinessMatrix', 'SyntheticMatchingReadinessTrace']) { assert.equal(entry.includes(prior), false, prior); assert.equal(component.includes(prior), false, prior); }
});

test('closed allowlist matches exact g20 scope, matrix and blocked gates', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as { closed: boolean; result_label: string; reference: { property_axis_values_in_order: string[]; request_axis_values_in_order: string[]; matrix_rows: Array<{ request_cells_in_axis_order: string[] }>; matrix_totals: Record<string, number> }; governance: Record<string, string>; allowed_paths: Array<{ state: string }> };
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G20_SYNTHETIC_ENTRANCE_REQUIREMENT_COMPATIBILITY_REFERENCE_VERIFIED');
  assert.deepEqual(allowlist.reference.property_axis_values_in_order, [...SYNTHETIC_ENTRANCE_PROPERTY_AXIS]);
  assert.deepEqual(allowlist.reference.request_axis_values_in_order, [...SYNTHETIC_ENTRANCE_REQUEST_AXIS]);
  assert.deepEqual(allowlist.reference.matrix_rows.map(row => row.request_cells_in_axis_order), SYNTHETIC_ENTRANCE_REQUIREMENT_MATRIX);
  assert.deepEqual(allowlist.reference.matrix_totals, { cells: 20, compatible: 13, incompatible_candidate: 1, needs_verification: 6 });
  assert.deepEqual(allowlist.governance, { gate_impact: 'NONE', implementation_readiness_gate: 'BLOCKED', synthetic_acceptance_gate: 'BLOCKED', production_launch_gate: 'BLOCKED' });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
});

test('production entry points expose no g20 page or component', () => {
  for (const file of ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json']) { const source = read(path.join(WEB_ROOT, file)); assert.equal(source.includes('synthetic-entrance-requirement-compatibility-reference'), false, file); assert.equal(source.includes('SyntheticEntranceRequirementCompatibilityReference'), false, file); assert.equal(source.includes('syntheticEntranceRequirementCompatibilityReference'), false, file); }
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
