import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticAccessModeCompatibilityReference from '../src/synthetic/SyntheticAccessModeCompatibilityReference.js';
import {
  SYNTHETIC_ACCESS_MODE_AXES,
  SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_DISCLAIMER,
  SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_REGIONS_IN_ORDER,
  SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_SCOPE_LINE,
  SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_TITLE,
  SYNTHETIC_ACCESS_MODE_FAIL_CLOSED_BOUNDARIES,
  SYNTHETIC_ACCESS_MODE_FLAT_ENUM_BOUNDARIES,
  SYNTHETIC_ACCESS_MODE_MATRIX,
  SYNTHETIC_ACCESS_MODE_SOURCE_BOUNDARY,
  SYNTHETIC_ACCESS_MODE_TERMINAL_LINE,
  SYNTHETIC_ACCESS_MODE_TERMINAL_TOKEN
} from '../src/synthetic/syntheticAccessModeCompatibilityReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-access-mode-compatibility-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticAccessModeCompatibilityReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticAccessModeCompatibilityReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticAccessModeCompatibilityReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-access-mode-compatibility-reference', 'G19_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '4a173bee48ef3c3b4eff285373bc0086f031e557c7ec8a64621c00d7f566d2ae';

test('frozen title, visible lines and five regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticAccessModeCompatibilityReference));
  for (const line of [SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_TITLE, SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_DISCLAIMER, SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_REGIONS_IN_ORDER) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 5);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('axes are exact, flat and repeated on both table dimensions', () => {
  assert.deepEqual(SYNTHETIC_ACCESS_MODE_AXES, ['business_hours', 'extended_hours', 'access_24_7', 'by_agreement']);
  const markup = renderToStaticMarkup(createElement(SyntheticAccessModeCompatibilityReference));
  for (const axis of SYNTHETIC_ACCESS_MODE_AXES) assert.equal(occurrences(markup, axis), 3, axis);
  assert.ok(SYNTHETIC_ACCESS_MODE_FLAT_ENUM_BOUNDARIES.includes('NO TOTAL OR PARTIAL ORDER'));
  assert.ok(SYNTHETIC_ACCESS_MODE_FLAT_ENUM_BOUNDARIES.some(item => item.includes('NO STRENGTH, WEAKNESS, NEGOTIABILITY')));
});

test('matrix is exact 4 by 4 with totals 3 compatible, 13 verification and zero incompatible', () => {
  assert.equal(SYNTHETIC_ACCESS_MODE_MATRIX.length, 4);
  assert.ok(SYNTHETIC_ACCESS_MODE_MATRIX.every(row => row.length === 4));
  const cells = SYNTHETIC_ACCESS_MODE_MATRIX.flat();
  assert.equal(cells.length, 16);
  assert.equal(cells.filter(cell => cell === 'COMPATIBLE').length, 3);
  assert.equal(cells.filter(cell => cell === 'NEEDS_VERIFICATION').length, 13);
  assert.equal(cells.includes('INCOMPATIBLE_CANDIDATE' as never), false);
  for (let index = 0; index < 4; index += 1) { assert.equal(SYNTHETIC_ACCESS_MODE_MATRIX[3][index], 'NEEDS_VERIFICATION'); assert.equal(SYNTHETIC_ACCESS_MODE_MATRIX[index][3], 'NEEDS_VERIFICATION'); }
});

test('source and fail-closed copy preserve row 15 and missing-value safeguards', () => {
  const copy = [...SYNTHETIC_ACCESS_MODE_SOURCE_BOUNDARY, ...SYNTHETIC_ACCESS_MODE_FAIL_CLOSED_BOUNDARIES].join('\n');
  for (const token of ['access_mode_hard_fit', 'BLOCKED_PENDING_DECISION', 'NOT_APPLICABLE', 'UNKNOWN', 'FINAL LEGAL VERDICT = NOT_APPROVED', 'automatic_ineligible_allowed = NO']) assert.ok(copy.includes(token), token);
});

test('terminal region is last and reports only non-computation', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticAccessModeCompatibilityReference));
  assert.equal(occurrences(markup, SYNTHETIC_ACCESS_MODE_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_ACCESS_MODE_TERMINAL_LINE), 1);
  const start = markup.indexOf(`aria-label="${SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_REGIONS_IN_ORDER[4]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic table and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticAccessModeCompatibilityReference));
  assert.equal(occurrences(markup, '<main'), 1);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<td'), 16);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no state, effects, handlers, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /onSubmit\s*=/, /onKeyDown\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and entry bind only the isolated g19 component', () => {
  const html = read(HTML_PATH); const entry = read(ENTRY_PATH); const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticAccessModeCompatibilityReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticAccessModeCompatibilityReference\.js'/);
  assert.match(component, /from '\.\/syntheticAccessModeCompatibilityReferenceScenario\.js'/);
  for (const prior of ['SyntheticFeatureReadinessMatrix', 'SyntheticMatchingReadinessTrace', 'SyntheticDemoJourneyHub']) { assert.equal(entry.includes(prior), false, prior); assert.equal(component.includes(prior), false, prior); }
});

test('closed allowlist matches exact g19 scope, matrix and blocked gates', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as { closed: boolean; result_label: string; reference: { axis_values_in_order: string[]; matrix_rows: Array<{ request_cells_in_axis_order: string[] }>; matrix_totals: Record<string, number> }; governance: Record<string, string>; allowed_paths: Array<{ state: string }> };
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G19_SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_VERIFIED');
  assert.deepEqual(allowlist.reference.axis_values_in_order, [...SYNTHETIC_ACCESS_MODE_AXES]);
  assert.deepEqual(allowlist.reference.matrix_rows.map(row => row.request_cells_in_axis_order), SYNTHETIC_ACCESS_MODE_MATRIX);
  assert.deepEqual(allowlist.reference.matrix_totals, { cells: 16, compatible: 3, needs_verification: 13, incompatible_candidate: 0 });
  assert.deepEqual(allowlist.governance, { gate_impact: 'NONE', implementation_readiness_gate: 'BLOCKED', synthetic_acceptance_gate: 'BLOCKED', production_launch_gate: 'BLOCKED' });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
});

test('production entry points expose no g19 page or component', () => {
  for (const file of ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json']) { const source = read(path.join(WEB_ROOT, file)); assert.equal(source.includes('synthetic-access-mode-compatibility-reference'), false, file); assert.equal(source.includes('SyntheticAccessModeCompatibilityReference'), false, file); assert.equal(source.includes('syntheticAccessModeCompatibilityReference'), false, file); }
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
