import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticScoringSegmentOverrideQualitativeBoundaryReference from '../src/synthetic/SyntheticScoringSegmentOverrideQualitativeBoundaryReference.js';
import {
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_DISCLAIMER,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_DISTINCT_LAYERS,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_EVIDENCE_BOUNDARY,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_EVIDENCE_PREREQUISITES,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_GOVERNANCE_MATRIX,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_MATRIX_SHARED_RULES,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_OPEN_CONTENT,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_PROHIBITED_SURROGATES,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_REGIONS_IN_ORDER,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_ROLE_SEPARATION,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_SCOPE_LINE,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_SOURCE_BOUNDARY,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_TERMINAL_LINE,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_TERMINAL_TOKEN,
  SYNTHETIC_SCORING_SEGMENT_OVERRIDE_TITLE
} from '../src/synthetic/syntheticScoringSegmentOverrideQualitativeBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-scoring-segment-override-qualitative-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticScoringSegmentOverrideQualitativeBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticScoringSegmentOverrideQualitativeBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticScoringSegmentOverrideQualitativeBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-scoring-segment-override-qualitative-boundary-reference', 'G27_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '2318fe4eaa3283d011d1c5f1bcdffdca1d8ea39268aa8466f24c94d42406e3f4';

const EXPECTED_ROWS = ['SEGMENT_OVERRIDE_SCOPE', 'GLOBAL_BASELINE_SOLE_AUTHORITY', 'EXPLICIT_LAWFUL_MEMBERSHIP_NO_INFERENCE', 'NON_WEAKENING_NON_DISCRIMINATION_NON_COMPENSATION', 'MINIMUM_EVIDENCE_CATEGORIES', 'AFFECTED_USE_FAIL_CLOSED', 'NO_AUTOMATIC_ACTION', 'DECISION_MEANING'] as const;

type G27Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string>;
  allowed_paths: Array<{ state: string }>;
  reference: {
    html_title: string;
    always_visible_lines: string[];
    regions_in_order: string[];
    segment_override_governance_matrix: Array<{ row: string; frozen: string }>;
    evidence_prerequisites: string[];
  };
};

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringSegmentOverrideQualitativeBoundaryReference));
  for (const line of [SYNTHETIC_SCORING_SEGMENT_OVERRIDE_TITLE, SYNTHETIC_SCORING_SEGMENT_OVERRIDE_DISCLAIMER, SYNTHETIC_SCORING_SEGMENT_OVERRIDE_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of SYNTHETIC_SCORING_SEGMENT_OVERRIDE_REGIONS_IN_ORDER) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one semantic eight-row governance matrix', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringSegmentOverrideQualitativeBoundaryReference));
  assert.deepEqual(SYNTHETIC_SCORING_SEGMENT_OVERRIDE_GOVERNANCE_MATRIX.map(row => row.governanceRow), [...EXPECTED_ROWS]);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 9);
  for (const row of EXPECTED_ROWS) assert.equal(occurrences(markup, `>${row}</th>`), 1, row);
});

test('source and status boundary stays textual and preserves partial decision status', () => {
  const copy = SYNTHETIC_SCORING_SEGMENT_OVERRIDE_SOURCE_BOUNDARY.join('\n');
  assert.match(copy, /XFR-D-018 v1\.0 — APPROVED PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(copy, /MSP-04 → XFR-D-018 — PRIMARY_STANDALONE/);
  assert.match(copy, /QUESTION №3 REMAINS OPEN/);
  assert.match(copy, /102 SOURCE KEYS \/ 90 CANONICAL IDS — UNCHANGED/);
  assert.match(copy, /SCORING REGISTER ROWS: 18 — UNCHANGED/);
  assert.match(copy, /CODE PHASE WAS HUMAN-AUTHORIZED FOR THIS ISOLATED PACKAGE/);
  assert.match(copy, /PACKAGE VERIFICATION OPENS NO GOVERNANCE GATE/);
  assert.match(copy, /ALL EXACT SEGMENT, MEMBERSHIP, LAWFUL BASIS, BASELINE\/OVERRIDE, WEIGHT, THRESHOLD, DATA, STATISTICAL, RUNTIME AND IMPLEMENTATION CONTENTS REMAIN OPEN/);
  assert.match(copy, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
});

test('governance rows preserve baseline authority, no-inference, no-weakening and fail-closed semantics', () => {
  const byRow = new Map(SYNTHETIC_SCORING_SEGMENT_OVERRIDE_GOVERNANCE_MATRIX.map(row => [row.governanceRow, row.frozenBoundary]));
  assert.match(byRow.get('GLOBAL_BASELINE_SOLE_AUTHORITY') ?? '', /sole authority/);
  assert.match(byRow.get('GLOBAL_BASELINE_SOLE_AUTHORITY') ?? '', /approves neither baseline nor override/);
  assert.match(byRow.get('EXPLICIT_LAWFUL_MEMBERSHIP_NO_INFERENCE') ?? '', /never guessed, AI-inferred, heuristic-derived, proxy-imputed or carried over/);
  assert.match(byRow.get('NON_WEAKENING_NON_DISCRIMINATION_NON_COMPENSATION') ?? '', /weaken treatment, discriminate/);
  assert.match(byRow.get('NON_WEAKENING_NON_DISCRIMINATION_NON_COMPENSATION') ?? '', /compensate or mask/);
  assert.match(byRow.get('MINIMUM_EVIDENCE_CATEGORIES') ?? '', /blocks future override approval fail closed/);
  assert.match(byRow.get('AFFECTED_USE_FAIL_CLOSED') ?? '', /unrelated processing is not blocked/);
  assert.match(byRow.get('AFFECTED_USE_FAIL_CLOSED') ?? '', /no guessed, zero, default, adverse or negative outcome/);
  assert.match(byRow.get('NO_AUTOMATIC_ACTION') ?? '', /automatically changes/);
  assert.match(byRow.get('DECISION_MEANING') ?? '', /is not a segment universe/);
  assert.match(SYNTHETIC_SCORING_SEGMENT_OVERRIDE_MATRIX_SHARED_RULES, /a missing applicable evidence category blocks future override approval fail closed/);
});

test('role and approval separation remains explicit and non-merged', () => {
  const copy = SYNTHETIC_SCORING_SEGMENT_OVERRIDE_ROLE_SEPARATION.join('\n');
  assert.equal(SYNTHETIC_SCORING_SEGMENT_OVERRIDE_ROLE_SEPARATION.length, 8);
  for (const token of ['AI + PRODUCT', 'Chief AI Architect + PRODUCT', 'Chief AI Architect + LEGAL + DEVELOPMENT', 'AI + DEVELOPMENT', 'Chief AI Architect + DEVELOPMENT + AI', 'PRODUCT + LEGAL', 'FULL SET', 'DOES NOT REPLACE SOURCE-DECISION OR ARTIFACT AUTHORITY']) assert.ok(copy.includes(token), token);
  assert.match(copy, /NO UNILATERAL SEGMENT, MEMBERSHIP, LAWFUL-BASIS, VALUE, EVIDENCE-SUFFICIENCY, POLICY, PRODUCTION, RUNTIME, RELEASE OR IMPLEMENTATION AUTHORITY/);
});

test('all frozen evidence prerequisites and non-compensation semantics remain explicit', () => {
  assert.equal(SYNTHETIC_SCORING_SEGMENT_OVERRIDE_EVIDENCE_PREREQUISITES.length, 14);
  const prerequisites = SYNTHETIC_SCORING_SEGMENT_OVERRIDE_EVIDENCE_PREREQUISITES.join('\n');
  for (const token of ['PROPOSED SEGMENT UNIVERSE', 'PROPOSED MEMBERSHIP SOURCE', 'PROTECTED/PROXY CLASSIFICATION', 'GLOBAL-BASELINE POLICY VERSION/HASH', 'OVERRIDE DELTA AND SCOPE', 'DATASET SEGMENT-COVERAGE EVIDENCE', 'LABEL ELIGIBILITY, ADJUDICATION', 'TARGET/TOLERANCE CONTENTS', 'TUNING-VERSUS-UNTOUCHED-FINAL SEPARATION', 'STATISTICAL COMPARISON PROCEDURE', 'NON-COMPENSATION ANALYSIS', 'DRIFT AND POST-FREEZE', 'SYNTHETIC-ONLY VERSUS PRODUCTION-DATA', 'FULL OWNER/APPROVER SET']) assert.ok(prerequisites.includes(token), token);
  const boundary = SYNTHETIC_SCORING_SEGMENT_OVERRIDE_EVIDENCE_BOUNDARY.join('\n');
  assert.match(boundary, /PREREQUISITES ONLY/);
  assert.match(boundary, /CANNOT COMPENSATE FOR ANOTHER MISSING, ADVERSE, INCOMPATIBLE, UNEVALUABLE OR INSUFFICIENT/);
  assert.match(boundary, /BLOCKS ONLY THE AFFECTED SEGMENT-OVERRIDE APPROVAL PROGRESSION/);
  assert.match(boundary, /UNRELATED PROCESSING IS NOT BLOCKED/);
  assert.match(boundary, /NEVER ACTIVATES A FALLBACK/);
});

test('all nine frozen open categories and layer boundaries remain explicit', () => {
  assert.equal(SYNTHETIC_SCORING_SEGMENT_OVERRIDE_OPEN_CONTENT.length, 9);
  const copy = SYNTHETIC_SCORING_SEGMENT_OVERRIDE_OPEN_CONTENT.join('\n');
  for (const token of ['EVERY EXACT SEGMENT, INTERSECTION, MEMBERSHIP AND LAWFUL-BASIS CLASSIFICATION', 'BASELINE AND OVERRIDE POLICY, VERSION, HASH, PRIORITY AND OVERLAP', 'EVERY WEIGHT, THRESHOLD, FORMULA, DELTA AND TOLERANCE', 'UNCERTAINTY DEFINITION', 'THE STATISTICAL METHOD', 'DATASET, MANIFEST, LINEAGE, RUN, RESULT AND VERDICT', 'PRODUCTION AUTHORITY AND APPLICABILITY', 'RBAC, RUNTIME, MONITORING, ROLLBACK AND IMPLEMENTATION', 'EVERY GOVERNANCE GATE']) assert.ok(copy.includes(token), token);
  assert.equal(SYNTHETIC_SCORING_SEGMENT_OVERRIDE_PROHIBITED_SURROGATES.length, 3);
  assert.equal(SYNTHETIC_SCORING_SEGMENT_OVERRIDE_DISTINCT_LAYERS.length, 8);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringSegmentOverrideQualitativeBoundaryReference));
  assert.equal(occurrences(markup, SYNTHETIC_SCORING_SEGMENT_OVERRIDE_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_SCORING_SEGMENT_OVERRIDE_TERMINAL_LINE), 1);
  const start = markup.indexOf(`aria-label="${SYNTHETIC_SCORING_SEGMENT_OVERRIDE_REGIONS_IN_ORDER[5]}"`);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links or live regions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticScoringSegmentOverrideQualitativeBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live']) assert.equal(markup.toLowerCase().includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateScore/, /computeScore/, /selectSegment/, /evaluateSegment/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G27 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticScoringSegmentOverrideQualitativeBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(entry, /from '\.\/SyntheticScoringSegmentOverrideQualitativeBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticScoringSegmentOverrideQualitativeBoundaryReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G27Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G27_SYNTHETIC_SCORING_SEGMENT_OVERRIDE_QUALITATIVE_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.html_title, SYNTHETIC_SCORING_SEGMENT_OVERRIDE_TITLE);
  assert.deepEqual(allowlist.reference.always_visible_lines, [SYNTHETIC_SCORING_SEGMENT_OVERRIDE_TITLE, SYNTHETIC_SCORING_SEGMENT_OVERRIDE_DISCLAIMER, SYNTHETIC_SCORING_SEGMENT_OVERRIDE_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.regions_in_order, [...SYNTHETIC_SCORING_SEGMENT_OVERRIDE_REGIONS_IN_ORDER]);
  assert.deepEqual(allowlist.reference.segment_override_governance_matrix.map(item => item.row), [...EXPECTED_ROWS]);
  assert.equal(allowlist.reference.evidence_prerequisites.length, 14);
  assert.deepEqual(allowlist.governance, {
    governance_owner: 'Chief AI Architect + DEVELOPMENT + AI',
    scoring_policy_artifact_owner: 'Chief AI Architect + PRODUCT',
    substantive_governance_owner: 'AI + PRODUCT',
    xfr_mandatory_approvers: 'Chief AI Architect + LEGAL + DEVELOPMENT',
    package_mandatory_approvers: 'PRODUCT + LEGAL',
    evidence_technical_procedure_owner: 'AI + DEVELOPMENT',
    evidence_owner_unilateral_authority: 'PROHIBITED',
    eventual_segment_override_approval: 'ALL_FIVE_FUNCTIONS_SAME_VERSION_HASH',
    gate_impact: 'NONE',
    implementation_readiness_gate: 'BLOCKED',
    synthetic_acceptance_gate: 'BLOCKED',
    production_launch_gate: 'BLOCKED'
  });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
});

function read(filePath: string): string { return readFileSync(filePath, 'utf8'); }
function occurrences(source: string, needle: string): number { assert.notEqual(needle, ''); return source.split(needle).length - 1; }
function sha256(filePath: string): string { return createHash('sha256').update(readFileSync(filePath)).digest('hex'); }
