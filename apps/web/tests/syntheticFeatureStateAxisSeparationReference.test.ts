import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticFeatureStateAxisSeparationReference from '../src/synthetic/SyntheticFeatureStateAxisSeparationReference.js';
import {
  SYNTHETIC_FEATURE_STATE_AXIS_DISCLAIMER,
  SYNTHETIC_FEATURE_STATE_AXIS_DOMAINS,
  SYNTHETIC_FEATURE_STATE_AXIS_EXACT_ENUM_BOUNDARY,
  SYNTHETIC_FEATURE_STATE_AXIS_NON_COERCION,
  SYNTHETIC_FEATURE_STATE_AXIS_OPEN_CONTENT,
  SYNTHETIC_FEATURE_STATE_AXIS_REGIONS_IN_ORDER,
  SYNTHETIC_FEATURE_STATE_AXIS_SCOPE_LINE,
  SYNTHETIC_FEATURE_STATE_AXIS_SOURCE_BOUNDARY,
  SYNTHETIC_FEATURE_STATE_AXIS_TERMINAL_LINE,
  SYNTHETIC_FEATURE_STATE_AXIS_TERMINAL_TOKEN,
  SYNTHETIC_FEATURE_STATE_AXIS_TITLE
} from '../src/synthetic/syntheticFeatureStateAxisSeparationReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-feature-state-axis-separation-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticFeatureStateAxisSeparationReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticFeatureStateAxisSeparationReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticFeatureStateAxisSeparationReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-feature-state-axis-separation-reference', 'G24_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '485c16b2962d3fefd90ce33d202cfc4db8f6887d7558222a5727aac4b684e3db';

const EXPECTED_DOMAINS = [
  ['registry_readiness', 'FEATURE_SCHEMA_DESIGN_TIME_ONLY', ['READY_FOR_DRAFT', 'READY_AS_CANDIDATE_ONLY', 'BLOCKED_PENDING_DECISION', 'EXCLUDED_FROM_V0_1'], 'FOUR_EXISTING_DRAFT_VALUES_NOT_RUNTIME'],
  ['value_state', 'FEATURE_SCHEMA_INTERNAL_CANDIDATE_ONLY', ['PRESENT', 'NOT_APPLICABLE', 'UNKNOWN'], 'INCOMPLETE_NON_PUBLIC_RUNTIME_CANDIDATE_SET'],
  ['evidence_status', 'ARCHITECTURE_SECTION_13_SOURCE_NORMATIVE', ['UNVERIFIED', 'SOURCE_CONFIRMED', 'CONTENT_VERIFIED', 'CONFLICTING', 'STALE', 'REJECTED', 'HUMAN_REVIEW_REQUIRED'], 'EXACT_SEVEN_VALUE_ENUM_PRESERVED_WITHOUT_MAPPING'],
  ['lawful_basis_status', 'ARCHITECTURE_SECTION_11_SOURCE_NORMATIVE', ['ACTIVE', 'EXPIRED', 'REVOKED', 'TERMINATED', 'SUSPENDED', 'UNDER_REVIEW'], 'EXACT_SIX_VALUE_ENUM_PRESERVED_WITHOUT_MAPPING'],
  ['processing_eligibility', 'FEATURE_SCHEMA_INTERNAL_CANDIDATE_ONLY', ['ALLOWED', 'DATA_PROCESSING_BLOCKED'], 'INCOMPLETE_NON_PUBLIC_DERIVED_CANDIDATE_SET']
] as const;

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticFeatureStateAxisSeparationReference));
  for (const line of [SYNTHETIC_FEATURE_STATE_AXIS_TITLE, SYNTHETIC_FEATURE_STATE_AXIS_DISCLAIMER, SYNTHETIC_FEATURE_STATE_AXIS_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of SYNTHETIC_FEATURE_STATE_AXIS_REGIONS_IN_ORDER) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('five distinct status domains preserve exact authority, values and boundary status', () => {
  assert.equal(SYNTHETIC_FEATURE_STATE_AXIS_DOMAINS.length, 5);
  assert.deepEqual(SYNTHETIC_FEATURE_STATE_AXIS_DOMAINS.map(item => [item.statusDomain, item.authority, [...item.values], item.status]), EXPECTED_DOMAINS.map(item => [item[0], item[1], [...item[2]], item[3]]));
  assert.equal(new Set(SYNTHETIC_FEATURE_STATE_AXIS_DOMAINS.map(item => item.statusDomain)).size, 5);
});

test('surface has exactly one semantic five-row domain table', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticFeatureStateAxisSeparationReference));
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 6);
  for (const domain of SYNTHETIC_FEATURE_STATE_AXIS_DOMAINS) assert.equal(occurrences(markup, `>${domain.statusDomain}</th>`), 1, domain.statusDomain);
});

test('source boundary keeps qualitative readiness separate from exact row 18 content', () => {
  const copy = SYNTHETIC_FEATURE_STATE_AXIS_SOURCE_BOUNDARY.join('\n');
  assert.match(copy, /QUALITATIVE AXIS MODEL: READY_FOR_DRAFT — DESIGN-TIME ONLY/);
  assert.match(copy, /EXACT FEATURE SCHEMA ROW 18 CONTENT: BLOCKED_PENDING_DECISION — DESIGN-TIME ONLY/);
  assert.match(copy, /COEXIST WITHOUT RUNTIME READINESS OR CONTRACT APPROVAL/);
  assert.match(copy, /readiness_reason IS SUPPORTING DESIGN-TIME TEXT, NOT A FIFTH registry_readiness VALUE/);
});

test('exact source enums remain separated and lawful basis is not a FeatureValue axis', () => {
  const copy = SYNTHETIC_FEATURE_STATE_AXIS_EXACT_ENUM_BOUNDARY.join('\n');
  assert.match(copy, /EXACT SEVEN-VALUE ARCHITECTURE §13 ENUM WITHOUT MAPPING/);
  assert.match(copy, /EXACT SIX-VALUE ARCHITECTURE §11 ENUM WITHOUT MAPPING/);
  assert.match(copy, /lawful_basis_status IS A SOURCE REGISTRY DOMAIN — NOT A FeatureValue AXIS/);
});

test('non-coercion cases remain non-adverse and affected-use-only', () => {
  const copy = SYNTHETIC_FEATURE_STATE_AXIS_NON_COERCION.join('\n');
  for (const token of ['PRESENT IS A VALUE APPLICABILITY CANDIDATE ONLY', 'UNKNOWN AND NOT_APPLICABLE REMAIN DISTINCT AND NON-ADVERSE', 'STALE IS AN EVIDENCE STATE ONLY', 'AFFECTED GOVERNED USE ONLY', 'NO AXIS COLLAPSE, DEFAULT MAPPING, TRANSITION OR SILENT CASCADE']) assert.ok(copy.includes(token), token);
});

test('all frozen open contract categories remain explicit', () => {
  assert.equal(SYNTHETIC_FEATURE_STATE_AXIS_OPEN_CONTENT.length, 9);
  const copy = SYNTHETIC_FEATURE_STATE_AXIS_OPEN_CONTENT.join('\n');
  for (const token of ['FULL PUBLIC value_state ENUM', 'FULL PUBLIC processing_eligibility ENUM', 'SOURCE-TO-STATE MAPPINGS AND PRECEDENCE', 'RUNTIME CARRIER', 'PRODUCTION, RUNTIME, IMPLEMENTATION AND GATES']) assert.ok(copy.includes(token), token);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticFeatureStateAxisSeparationReference));
  assert.equal(occurrences(markup, SYNTHETIC_FEATURE_STATE_AXIS_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_FEATURE_STATE_AXIS_TERMINAL_LINE), 1);
  const start = markup.indexOf(`aria-label="${SYNTHETIC_FEATURE_STATE_AXIS_REGIONS_IN_ORDER[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticFeatureStateAxisSeparationReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no state machine, decisions, handlers, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /onSubmit\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateScore/, /evaluateEligibility/, /transitionState/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G24 scope', () => {
  const html = read(HTML_PATH); const entry = read(ENTRY_PATH); const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticFeatureStateAxisSeparationReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticFeatureStateAxisSeparationReference\.js'/);
  assert.match(component, /from '\.\/syntheticFeatureStateAxisSeparationReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as { closed: boolean; result_label: string; governance: Record<string, string>; allowed_paths: Array<{ state: string }>; reference: { status_domains: unknown[] } };
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G24_SYNTHETIC_FEATURE_STATE_AXIS_SEPARATION_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.status_domains.length, 5);
  assert.deepEqual(allowlist.governance, { governance_owner: 'Chief AI Architect + DEVELOPMENT + AI', feature_schema_artifact_owner: 'PRODUCT + LEGAL + AI', mandatory_approvers: 'PRODUCT + LEGAL', evidence_technical_procedure_owner: 'AI + DEVELOPMENT', evidence_owner_unilateral_authority: 'PROHIBITED', gate_impact: 'NONE', implementation_readiness_gate: 'BLOCKED', synthetic_acceptance_gate: 'BLOCKED', production_launch_gate: 'BLOCKED' });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
