import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticBudgetBasisMismatchReference from '../src/synthetic/SyntheticBudgetBasisMismatchReference.js';
import {
  SYNTHETIC_BUDGET_BASIS_CASES,
  SYNTHETIC_BUDGET_BASIS_MISMATCH_BOUNDARY,
  SYNTHETIC_BUDGET_BASIS_OPEN_BOUNDARIES,
  SYNTHETIC_BUDGET_BASIS_REFERENCE_DISCLAIMER,
  SYNTHETIC_BUDGET_BASIS_REFERENCE_REGIONS_IN_ORDER,
  SYNTHETIC_BUDGET_BASIS_REFERENCE_SCOPE_LINE,
  SYNTHETIC_BUDGET_BASIS_REFERENCE_TITLE,
  SYNTHETIC_BUDGET_BASIS_SOURCE_BOUNDARY,
  SYNTHETIC_BUDGET_BASIS_TERMINAL_LINE,
  SYNTHETIC_BUDGET_BASIS_TERMINAL_TOKEN
} from '../src/synthetic/syntheticBudgetBasisMismatchReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-budget-basis-mismatch-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticBudgetBasisMismatchReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticBudgetBasisMismatchReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticBudgetBasisMismatchReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-budget-basis-mismatch-reference', 'G22_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '2942de606816d90afb77e77d4856df024ec045a33e8b8775e27ec1556e72842a';

test('frozen title, permanent lines and five regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticBudgetBasisMismatchReference));
  for (const line of [SYNTHETIC_BUDGET_BASIS_REFERENCE_TITLE, SYNTHETIC_BUDGET_BASIS_REFERENCE_DISCLAIMER, SYNTHETIC_BUDGET_BASIS_REFERENCE_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of SYNTHETIC_BUDGET_BASIS_REFERENCE_REGIONS_IN_ORDER) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 5);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('exactly four abstract basis cases preserve aligned and mismatch semantics', () => {
  assert.equal(SYNTHETIC_BUDGET_BASIS_CASES.length, 4);
  const aligned = SYNTHETIC_BUDGET_BASIS_CASES.filter(item => item.basisStatus === 'BASIS_ALIGNED');
  const mismatched = SYNTHETIC_BUDGET_BASIS_CASES.filter(item => item.basisStatus === 'BASIS_MISMATCH');
  assert.equal(aligned.length, 2);
  assert.equal(mismatched.length, 2);
  assert.deepEqual(aligned.map(item => [item.propertyOperatingExpensesIncluded, item.requestBudgetIncludesOperatingExpenses]), [['true', 'true'], ['false', 'false']]);
  assert.deepEqual(mismatched.map(item => [item.propertyOperatingExpensesIncluded, item.requestBudgetIncludesOperatingExpenses]), [['true', 'false'], ['false', 'true']]);
  for (const item of aligned) { assert.match(item.boundary, /NO COMPARISON HERE/); assert.match(item.notAResult, /NO AFFORDABILITY, COMPATIBILITY, FEATURE VALUE, PASS OR FAIL RESULT/); }
  for (const item of mismatched) { assert.match(item.boundary, /value_state = UNKNOWN — CALCULATION BLOCKED/); assert.match(item.notAResult, /NO PASS, FAIL, INCOMPATIBILITY, REJECTION OR INELIGIBLE/); }
});

test('surface has exactly one semantic four-case table', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticBudgetBasisMismatchReference));
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody><tr>'), 1);
  assert.equal(occurrences(markup, '<tr'), 5);
  assert.equal(occurrences(markup, '<tbody'), 1);
});

test('independent and open boundaries remain explicit without numeric invention', () => {
  const copy = [...SYNTHETIC_BUDGET_BASIS_SOURCE_BOUNDARY, ...SYNTHETIC_BUDGET_BASIS_MISMATCH_BOUNDARY, ...SYNTHETIC_BUDGET_BASIS_OPEN_BOUNDARIES].join('\n');
  for (const token of ['budget_fit REMAINS INDEPENDENT', 'rent_rate_fit REMAINS INDEPENDENT', 'XFR-D-003', 'MATCHING_QUALIFICATION_POLICY', 'EXACT RUNTIME REPRESENTATION OF UNKNOWN', 'FUTURE NUMERIC OPERATING-EXPENSE AMOUNT FIELD REMAINS OPEN', 'NO AMOUNT, NUMERIC FIELD, FORMULA, THRESHOLD, ROUNDING, SERIALIZATION']) assert.ok(copy.includes(token), token);
  for (const pattern of [/operatingExpenseAmount\s*[:=]\s*[-+]?\d/, /budgetMax\s*[:=]\s*[-+]?\d/, /effectiveRate\s*[:=]\s*[-+]?\d/, /Math\.(floor|ceil|round)\s*\(/, /evaluateBudget/, /calculateEffectiveRate/]) assert.equal(pattern.test(read(SCENARIO_PATH)), false, String(pattern));
});

test('terminal region is last and reports only non-computation', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticBudgetBasisMismatchReference));
  assert.equal(occurrences(markup, SYNTHETIC_BUDGET_BASIS_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_BUDGET_BASIS_TERMINAL_LINE), 1);
  const start = markup.indexOf(`aria-label="${SYNTHETIC_BUDGET_BASIS_REFERENCE_REGIONS_IN_ORDER[4]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticBudgetBasisMismatchReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no state, effects, handlers, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /onSubmit\s*=/, /onKeyDown\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and entry bind only the isolated g22 component', () => {
  const html = read(HTML_PATH); const entry = read(ENTRY_PATH); const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticBudgetBasisMismatchReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticBudgetBasisMismatchReference\.js'/);
  assert.match(component, /from '\.\/syntheticBudgetBasisMismatchReferenceScenario\.js'/);
  for (const prior of ['SyntheticFloorOptionBoundaryReference', 'SyntheticEntranceRequirementCompatibilityReference', 'SyntheticAccessModeCompatibilityReference', 'SyntheticFeatureReadinessMatrix']) { assert.equal(entry.includes(prior), false, prior); assert.equal(component.includes(prior), false, prior); }
});

test('closed allowlist matches exact g22 scope, cases and blocked gates', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as { closed: boolean; result_label: string; reference: { basis_cases: unknown[] }; governance: Record<string, string>; allowed_paths: Array<{ state: string }> };
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G22_SYNTHETIC_BUDGET_BASIS_MISMATCH_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.basis_cases.length, 4);
  assert.deepEqual(allowlist.governance, { gate_impact: 'NONE', implementation_readiness_gate: 'BLOCKED', synthetic_acceptance_gate: 'BLOCKED', production_launch_gate: 'BLOCKED' });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
});

test('created files contain no production linkage or prior-package import', () => {
  const sources = [read(HTML_PATH), read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const token of ['App.tsx', 'main.tsx', 'index.html', 'vite.config', 'package.json', 'synthetic-floor-option-boundary-reference', 'G21_']) assert.equal(sources.includes(token), false, token);
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
