import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticEvidenceConfidenceMappingQualitativeBoundaryReference from '../src/synthetic/SyntheticEvidenceConfidenceMappingQualitativeBoundaryReference.js';
import {
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_CANONICAL_ENUM,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_DISCLAIMER,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_DISTINCT_LAYERS,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_EVIDENCE_BOUNDARY,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_EVIDENCE_PREREQUISITES,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_GOVERNANCE_MATRIX,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_MATRIX_SHARED_RULES,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_OPEN_CONTENT,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_PROHIBITED_SURROGATES,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_REGIONS_IN_ORDER,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_ROLE_SEPARATION,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_SCOPE_LINE,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_SOURCE_BOUNDARY,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TERMINAL_LINE,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TERMINAL_TOKEN,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TITLE
} from '../src/synthetic/syntheticEvidenceConfidenceMappingQualitativeBoundaryReferenceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-evidence-confidence-mapping-qualitative-boundary-reference.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticEvidenceConfidenceMappingQualitativeBoundaryReferenceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticEvidenceConfidenceMappingQualitativeBoundaryReference.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticEvidenceConfidenceMappingQualitativeBoundaryReferenceEntry.tsx');
const ALLOWLIST_PATH = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-evidence-confidence-mapping-qualitative-boundary-reference', 'G28_FILE_ALLOWLIST_v1.0.json');
const FROZEN_ALLOWLIST_SHA256 = '6a7d2a7de939e10fc276bc3666c120be777611dfc41e4f14ed1d5ddef91be766';

const EXPECTED_ROWS = ['EVIDENCE_CONFIDENCE_MAPPING_SCOPE', 'CANONICAL_ENUM_SOLE_AUTHORITY', 'SEMANTIC_LAYER_SEPARATION_NO_CONFLATION', 'NO_VALIDATION_OR_INFERENCE_PROMOTION', 'AFFECTED_USE_FAIL_CLOSED', 'NON_COMPENSATION_SEPARATE_SLICE_REPORTING', 'MINIMUM_EVIDENCE_PREREQUISITES', 'NO_AUTOMATIC_ACTION', 'DECISION_MEANING'] as const;

const EXPECTED_ENUM = ['UNVERIFIED', 'SOURCE_CONFIRMED', 'CONTENT_VERIFIED', 'CONFLICTING', 'STALE', 'REJECTED', 'HUMAN_REVIEW_REQUIRED'] as const;

type G28Allowlist = {
  closed: boolean;
  result_label: string;
  governance: Record<string, string>;
  allowed_paths: Array<{ state: string }>;
  reference: {
    html_title: string;
    always_visible_lines: string[];
    regions_in_order: string[];
    evidence_confidence_mapping_governance_matrix: Array<{ row: string; frozen: string }>;
    canonical_evidence_status_enum_in_order: string[];
    evidence_prerequisites: string[];
  };
};

test('frozen title, permanent lines and six regions render in exact order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticEvidenceConfidenceMappingQualitativeBoundaryReference));
  for (const line of [SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TITLE, SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_DISCLAIMER, SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_SCOPE_LINE]) assert.equal(occurrences(markup, `>${line}</`), 1, line);
  let previous = -1;
  for (const region of SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_REGIONS_IN_ORDER) { const position = markup.indexOf(`aria-label="${region}"`); assert.ok(position > previous, region); previous = position; }
  assert.equal(occurrences(markup, '<section'), 6);
  assert.equal(occurrences(markup, '<h1'), 1);
});

test('surface has exactly one semantic nine-row governance matrix', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticEvidenceConfidenceMappingQualitativeBoundaryReference));
  assert.deepEqual(SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_GOVERNANCE_MATRIX.map(row => row.governanceRow), [...EXPECTED_ROWS]);
  assert.equal(SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_GOVERNANCE_MATRIX.length, 9);
  assert.equal(occurrences(markup, '<table'), 1);
  assert.equal(occurrences(markup, '<tbody'), 1);
  assert.equal(occurrences(markup, '<tr'), 10);
  for (const row of EXPECTED_ROWS) assert.equal(occurrences(markup, `>${row}</th>`), 1, row);
});

test('source and status boundary stays textual and preserves partial decision status', () => {
  const copy = SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_SOURCE_BOUNDARY.join('\n');
  assert.match(copy, /XFR-D-019 v1\.0 — APPROVED PARTIALLY_RESOLVED_BOUNDARY/);
  assert.match(copy, /MSP-06 → XFR-D-019 — PRIMARY_STANDALONE/);
  assert.match(copy, /ROW №6 — EVIDENCE-STATUS → EVIDENCE CONFIDENCE CALIBRATION — REMAINS OPEN/);
  assert.match(copy, /102 SOURCE KEYS \/ 90 CANONICAL IDS — UNCHANGED/);
  assert.match(copy, /SCORING REGISTER ROWS: 18 — UNCHANGED; EVALUATION REGISTER ROWS: 17 — UNCHANGED/);
  assert.match(copy, /CODE PHASE WAS HUMAN-AUTHORIZED FOR THIS ISOLATED PACKAGE/);
  assert.match(copy, /PACKAGE VERIFICATION OPENS NO GOVERNANCE GATE/);
  assert.match(copy, /ALL EXACT EVIDENCE-STATUS MAPPING, TABLE, FUNCTION, NUMERIC VALUE, RANGE, DIRECTION, ORDER, HIERARCHY, DEFAULT, CALIBRATION, DATASET, STATISTICAL, POLICY, RUNTIME AND IMPLEMENTATION CONTENTS REMAIN OPEN/);
  assert.match(copy, /ALL THREE GOVERNANCE GATES REMAIN BLOCKED/);
});

test('governance rows preserve enum authority, separation, no-promotion, fail-closed and non-compensation semantics', () => {
  const byRow = new Map(SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_GOVERNANCE_MATRIX.map(row => [row.governanceRow, row.frozenBoundary]));
  assert.match(byRow.get('EVIDENCE_CONFIDENCE_MAPPING_SCOPE') ?? '', /remain OPEN/);
  assert.match(byRow.get('EVIDENCE_CONFIDENCE_MAPPING_SCOPE') ?? '', /no mapping table, function, numeric value, range, order, calibration or default is selected/);
  assert.match(byRow.get('CANONICAL_ENUM_SOLE_AUTHORITY') ?? '', /sole authority/);
  assert.match(byRow.get('CANONICAL_ENUM_SOLE_AUTHORITY') ?? '', /no eighth value/);
  assert.match(byRow.get('SEMANTIC_LAYER_SEPARATION_NO_CONFLATION') ?? '', /no layer may silently encode, replace or substitute for another/);
  assert.match(byRow.get('NO_VALIDATION_OR_INFERENCE_PROMOTION') ?? '', /never promotes canonical evidence_status or Evidence Confidence/);
  assert.match(byRow.get('AFFECTED_USE_FAIL_CLOSED') ?? '', /unrelated processing is not blocked/);
  assert.match(byRow.get('NON_COMPENSATION_SEPARATE_SLICE_REPORTING') ?? '', /compensate or mask/);
  assert.match(byRow.get('MINIMUM_EVIDENCE_PREREQUISITES') ?? '', /blocks approval fail closed/);
  assert.match(byRow.get('NO_AUTOMATIC_ACTION') ?? '', /automatically changes/);
  assert.match(byRow.get('DECISION_MEANING') ?? '', /is not an evidence_status → Evidence Confidence mapping table/);
  assert.match(SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_MATRIX_SHARED_RULES, /a missing applicable evidence category blocks future mapping approval fail closed/);
});

test('canonical evidence status enum is the exact closed seven-value set in order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticEvidenceConfidenceMappingQualitativeBoundaryReference));
  assert.equal(SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_CANONICAL_ENUM.length, 7);
  assert.deepEqual([...SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_CANONICAL_ENUM], [...EXPECTED_ENUM]);
  for (const value of EXPECTED_ENUM) assert.equal(occurrences(markup, `>${value}</li>`), 1, value);
});

test('role and approval separation is explicit and not conflated', () => {
  const copy = SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_ROLE_SEPARATION.join('\n');
  assert.equal(SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_ROLE_SEPARATION.length, 8);
  for (const token of ['Chief AI Architect + AI', 'Chief AI Architect + PRODUCT', 'PRODUCT + LEGAL + DEVELOPMENT', 'AI + DEVELOPMENT', 'Chief AI Architect + DEVELOPMENT + AI', 'PRODUCT + LEGAL', 'FULL SET', 'DOES NOT REPLACE SOURCE-DECISION OR ARTIFACT AUTHORITY']) assert.ok(copy.includes(token), token);
  assert.match(copy, /NO UNILATERAL MAPPING, NUMERIC VALUE, CALIBRATION, EVIDENCE-SUFFICIENCY, POLICY, PRODUCTION, RUNTIME, RELEASE OR IMPLEMENTATION AUTHORITY/);
});

test('all frozen evidence prerequisites and non-compensation semantics remain explicit', () => {
  assert.equal(SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_EVIDENCE_PREREQUISITES.length, 12);
  const prerequisites = SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_EVIDENCE_PREREQUISITES.join('\n');
  for (const token of ['EXACT CANDIDATE MAPPING SPECIFICATION', 'PROVEN ELIGIBILITY AND SOURCE AUTHORITY', 'LABEL-QUALITY, ADJUDICATION', 'XFR-D-057–XFR-D-060 AND XFR-D-062', 'STATISTICAL COMPARISON PROCEDURE', 'XFR-D-063/XFR-D-070', 'TUNING EVIDENCE SEPARATED', 'WITHOUT INVENTED THRESHOLDS', 'XFR-D-071', 'NOT HIDDEN BY AN AGGREGATE RESULT', 'DOWNSTREAM RISK/QUALIFICATION USE', 'IMMUTABLE LINKS TO FREEZE-TIME', 'SYNTHETIC-ONLY VERSUS PRODUCTION-DATA', 'FULL OWNER/APPROVER SET']) assert.ok(prerequisites.includes(token), token);
  const boundary = SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_EVIDENCE_BOUNDARY.join('\n');
  assert.match(boundary, /PREREQUISITES ONLY/);
  assert.match(boundary, /CANNOT COMPENSATE FOR ANOTHER MISSING, ADVERSE, INCOMPATIBLE, UNEVALUABLE OR INSUFFICIENT/);
  assert.match(boundary, /BLOCKS ONLY THE AFFECTED MAPPING-APPROVAL PROGRESSION/);
  assert.match(boundary, /UNRELATED PROCESSING IS NOT BLOCKED/);
  assert.match(boundary, /NEVER ACTIVATES A FALLBACK/);
  assert.match(boundary, /SYNTHETIC-ONLY EVIDENCE CANNOT ESTABLISH PRODUCTION APPLICABILITY OR READINESS/);
});

test('all frozen open categories, prohibited surrogates and distinct layers remain explicit', () => {
  assert.equal(SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_OPEN_CONTENT.length, 13);
  const copy = SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_OPEN_CONTENT.join('\n');
  for (const token of ['EVERY EXACT EVIDENCE-STATUS → EVIDENCE CONFIDENCE TABLE', 'MONOTONICITY, DEFAULT AND FALLBACK', 'REVOCATION AND USE PURPOSE', 'REQUIRED_EVIDENCE_LEVEL AND ELIGIBILITY SEMANTICS', 'XFR-D-M6', 'ZERO-ACTIVE-WEIGHT', 'UNCERTAINTY AND STATISTICAL TESTS', 'FROZEN MANIFEST', 'PRODUCTION-DATA APPLICABILITY', 'CANONICAL CARRIER', 'SCHEMA, API, DATABASE', 'ROLLBACK AND IMPLEMENTATION', 'MANIFEST APPROVAL', 'ALL GOVERNANCE GATES']) assert.ok(copy.includes(token), token);
  assert.equal(SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_PROHIBITED_SURROGATES.length, 3);
  assert.deepEqual([...SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_PROHIBITED_SURROGATES], ['PILOT CAP 100 CAMPAIGN', 'CAMPAIGN TO QUALIFIED 40 PERCENT', 'CAMPAIGN TO QUALIFIED 25 PERCENT']);
  assert.equal(SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_DISTINCT_LAYERS.length, 9);
  assert.deepEqual([...SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_DISTINCT_LAYERS], ['EVIDENCE STATUS', 'FEATURE AND VALUE-LEVEL EVIDENCE CONFIDENCE', 'FEATURE FIT', 'REQUIRED EVIDENCE LEVEL', 'OVERALL CONFIDENCE SCORE', 'HARD CONSTRAINT AND ELIGIBILITY', 'RISK', 'QUALIFICATION', 'LAWFUL AND PROCESSING ELIGIBILITY']);
});

test('terminal region is last and reports only non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticEvidenceConfidenceMappingQualitativeBoundaryReference));
  assert.equal(occurrences(markup, SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TERMINAL_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TERMINAL_LINE), 1);
  const start = markup.indexOf(`aria-label="${SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_REGIONS_IN_ORDER[5]}"`);
  assert.ok(start > 0);
  assert.equal(markup.indexOf('<section', start + 1), -1);
});

test('surface has semantic content and zero controls, links, live regions or hidden actions', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticEvidenceConfidenceMappingQualitativeBoundaryReference));
  assert.equal(occurrences(markup, '<main'), 1);
  assert.equal(occurrences(markup, '<table'), 1);
  const lower = markup.toLowerCase();
  for (const token of ['<button', '<input', '<select', '<textarea', '<form', '<a ', 'href=', 'tabindex=', 'aria-live', '<script', 'onclick=', 'onchange=', 'contenteditable', 'role="button"']) assert.equal(lower.includes(token), false, token);
});

test('authored modules contain no computation, interaction, network, storage, logging or motion', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)].join('\n');
  for (const pattern of [/useState\s*\(/, /useEffect\s*\(/, /useReducer\s*\(/, /onClick\s*=/, /onChange\s*=/, /fetch\s*\(/, /XMLHttpRequest/, /WebSocket/, /localStorage/, /sessionStorage/, /indexedDB/, /document\.cookie/, /console\./, /setTimeout\s*\(/, /setInterval\s*\(/, /Math\.random\s*\(/, /calculateScore/, /computeScore/, /mapEvidenceStatus/, /selectMapping/, /applyCalibration/, /animation\s*:/, /transition\s*:/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('authored modules stay isolated from runtime globals and event plumbing', () => {
  const sources = [read(SCENARIO_PATH), read(COMPONENT_PATH)].join('\n');
  for (const pattern of [/addEventListener/, /removeEventListener/, /window\./, /document\./, /location\./, /history\./, /navigator\./, /URLSearchParams/, /postMessage/, /eval\s*\(/, /new Function/, /innerHTML/, /dangerouslySetInnerHTML/]) assert.equal(pattern.test(sources), false, String(pattern));
});

test('standalone html and closed allowlist bind only the isolated G28 scope', () => {
  const html = read(HTML_PATH);
  const entry = read(ENTRY_PATH);
  const component = read(COMPONENT_PATH);
  assert.match(html, /syntheticEvidenceConfidenceMappingQualitativeBoundaryReferenceEntry\.tsx/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.equal(occurrences(html, '<title>SYNTHETIC EVIDENCE-CONFIDENCE MAPPING QUALITATIVE BOUNDARY REFERENCE — NOT PRODUCTION APPROVED</title>'), 1);
  assert.match(entry, /from '\.\/SyntheticEvidenceConfidenceMappingQualitativeBoundaryReference\.js'/);
  assert.match(component, /from '\.\/syntheticEvidenceConfidenceMappingQualitativeBoundaryReferenceScenario\.js'/);
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as G28Allowlist;
  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G28_SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_QUALITATIVE_BOUNDARY_REFERENCE_VERIFIED');
  assert.equal(allowlist.reference.html_title, SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TITLE);
  assert.deepEqual(allowlist.reference.always_visible_lines, [SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TITLE, SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_DISCLAIMER, SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_SCOPE_LINE]);
  assert.deepEqual(allowlist.reference.regions_in_order, [...SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_REGIONS_IN_ORDER]);
  assert.deepEqual(allowlist.reference.evidence_confidence_mapping_governance_matrix.map(item => item.row), [...EXPECTED_ROWS]);
  assert.deepEqual(allowlist.reference.canonical_evidence_status_enum_in_order, [...EXPECTED_ENUM]);
  assert.equal(allowlist.reference.evidence_prerequisites.length, 12);
  assert.deepEqual(allowlist.governance, {
    package_governance_owner: 'Chief AI Architect + DEVELOPMENT + AI',
    source_decision_governance_owner: 'Chief AI Architect + AI',
    scoring_policy_artifact_owner: 'Chief AI Architect + PRODUCT',
    source_decision_mandatory_approvers: 'PRODUCT + LEGAL + DEVELOPMENT',
    package_mandatory_approvers: 'PRODUCT + LEGAL',
    evidence_technical_procedure_owner: 'AI + DEVELOPMENT',
    evidence_owner_unilateral_authority: 'PROHIBITED',
    package_roles_versus_source_decision_roles: 'SEPARATE_NOT_CONFLATED',
    eventual_evidence_confidence_mapping_approval: 'ALL_FIVE_FUNCTIONS_CHIEF_AI_ARCHITECT_AI_PRODUCT_LEGAL_DEVELOPMENT_SAME_VERSION_HASH',
    gate_impact: 'NONE',
    implementation_readiness_gate: 'BLOCKED',
    synthetic_acceptance_gate: 'BLOCKED',
    production_launch_gate: 'BLOCKED'
  });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'present').length, 3);
  assert.equal(allowlist.allowed_paths.filter(item => item.state === 'planned').length, 6);
});

test('authored sources are LF-only UTF-8 without BOM', () => {
  for (const filePath of [HTML_PATH, SCENARIO_PATH, COMPONENT_PATH, ENTRY_PATH]) {
    const bytes = readFileSync(filePath);
    assert.equal(bytes.includes(0x0d), false, `${filePath}: CR byte`);
    assert.equal(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf, false, `${filePath}: BOM`);
  }
});

function read(filePath: string): string {
  return readFileSync(filePath, 'utf8');
}

function occurrences(source: string, needle: string): number {
  assert.notEqual(needle, '');
  return source.split(needle).length - 1;
}

function sha256(filePath: string): string {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}
