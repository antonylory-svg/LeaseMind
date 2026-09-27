import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticHardConstraintLegalVerdictBoundaryReference from '../src/synthetic/SyntheticHardConstraintLegalVerdictBoundaryReference.js';
import {
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_AUTOMATIC_INELIGIBLE,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CANDIDATES,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CANDIDATE_STATUS,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CONFIRMED_RESTRICTION_BOUNDARY,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_DISCLAIMER,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_EVIDENCE_BOUNDARY,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_REGIONS_IN_ORDER,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_SCOPE_LINE,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_SOURCE_BOUNDARY,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TERMINAL_LINE,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TERMINAL_TOKEN,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TITLE
} from '../src/synthetic/syntheticHardConstraintLegalVerdictBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-hard-constraint-legal-verdict-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticHardConstraintLegalVerdictBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticHardConstraintLegalVerdictBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticHardConstraintLegalVerdictBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-hard-constraint-legal-verdict-boundary-reference', 'G23_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '1076ce5cf208ef34074a7541140075fb8291809f5a9f6ce9c8d4f2da5209990c';

const EXPECTED_FEATURE_IDS = [
  'property_type_membership', 'area_range_fit', 'budget_fit', 'rent_rate_fit',
  'business_category_allowed', 'condition_acceptability', 'timing_compatibility',
  'entrance_requirement_fit', 'required_features_present', 'excluded_features_absent',
  'loading_access_required_fit', 'power_min_fit', 'ceiling_height_min_fit',
  'parking_min_fit', 'access_mode_hard_fit', 'country_code_membership',
  'region_membership', 'city_membership', 'districts_membership', 'floor_option_fit'
] as const;

test('frozen title, permanent lines and five regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticHardConstraintLegalVerdictBoundaryReference));
  for (const line of [SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TITLE, SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_DISCLAIMER, SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_REGIONS_IN_ORDER) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 5);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('exact 20 Feature Schema candidates are preserved in source order', () => {
  assert.equal(SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CANDIDATES.length, 20);
  assert.deepEqual(SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CANDIDATES.map(item => item.ordinal), Array.from({ length: 20 }, (_, index) => index + 1));
  assert.deepEqual(SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CANDIDATES.map(item => item.featureId), EXPECTED_FEATURE_IDS);
  assert.equal(new Set(EXPECTED_FEATURE_IDS).size, 20);
});

test('surface has exactly one semantic 20-row candidate table', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticHardConstraintLegalVerdictBoundaryReference));
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody><tr>'), 1);
  assert.equal(occurrences(markup, '<tr'), 21);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, `>${SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CANDIDATE_STATUS} — NO FINAL LEGAL VERDICT</td>`), 20);
  assert.equal(occurrences(markup, `>${SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_AUTOMATIC_INELIGIBLE}</td>`), 20);
});

test('protected/proxy restriction remains candidate-use exclusion only', () => {
  const copy = SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CONFIRMED_RESTRICTION_BOUNDARY.join('\n');
  for (const token of ['UNCONDITIONALLY EXCLUDED FROM HARD CONSTRAINT ELIGIBILITY', 'CANDIDATE/USE ONLY', 'NEVER REJECTS OR MARKS A USER INELIGIBLE', 'LAWFUL BASIS CANNOT OVERRIDE']) assert.ok(copy.includes(token), token);
});

test('missing or conflicting evidence blocks promotion only and stays non-adverse', () => {
  const copy = SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_EVIDENCE_BOUNDARY.join('\n');
  assert.match(copy, /BLOCKS PROMOTION OF THE AFFECTED CANDIDATE ONLY/);
  assert.match(copy, /NO NEGATIVE FACT, FAILURE, REJECTION, EXCLUSION OR AUTOMATIC INELIGIBLE/);
  assert.match(copy, /EXACT VERDICTS, CLASSIFICATIONS, LAWFUL BASIS, COMPATIBILITY AND EVIDENCE SUFFICIENCY REMAIN OPEN/);
});

test('no verdict, eligibility evaluator or numeric decision mechanism is authored', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/issueVerdict/, /classifyCandidate/, /promoteCandidate/, /rejectUser/, /markIneligible/, /calculateScore/, /evaluateEligibility/, /Math\.(floor|ceil|round)\s*\(/, /threshold\s*[:=]\s*[-+]?\d/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticHardConstraintLegalVerdictBoundaryReference));
  assert.equal(occurrences(markup, SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TERMINAL_LINE), 1);
  const start = markup.indexOf(`aria-label="${SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_REGIONS_IN_ORDER[4]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticHardConstraintLegalVerdictBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no state, effects, handlers, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /onSubmit\s*=/, /onKeyDown\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and entry bind only the isolated G23 component', () => {
  const html = read(HTML_PATH); const entry = read(ENTRY_PATH); const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticHardConstraintLegalVerdictBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticHardConstraintLegalVerdictBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticHardConstraintLegalVerdictBoundaryReferenceScenario\.js'/);
  for (const prior of ['SyntheticBudgetBasisMismatchReference', 'SyntheticFloorOptionBoundaryReference', 'SyntheticAccessModeCompatibilityReference', 'SyntheticFeatureReadinessMatrix']) { assert.equal(entry.includes(prior), false, prior); assert.equal(component.includes(prior), false, prior); }
});

test('closed allowlist matches exact G23 scope, candidates and blocked gates', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as { closed: boolean; result_label: string; reference: { candidates: unknown[]; automatic_ineligible_allowed: string }; governance: Record<string, string>; allowed_paths: Array<{ state: string }> };
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G23_SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.candidates.length, 20);
  assert.equal(allowlist.reference.automatic_ineligible_allowed, 'NO');
  assert.deepEqual(allowlist.governance, { gate_impact: 'NONE', implementation_readiness_gate: 'BLOCKED', synthetic_acceptance_gate: 'BLOCKED', production_launch_gate: 'BLOCKED' });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
