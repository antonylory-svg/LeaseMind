import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticMatchReviewWorkspace from '../src/synthetic/SyntheticMatchReviewWorkspace.js';
import SafePresentationSyntheticPreview from '../src/synthetic/SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from '../src/synthetic/safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_CO_DISPLAY_WARNING,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_CONTROLS_ARIA_LABEL,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISCLAIMER,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISPOSITION_GROUP_ARIA_LABEL,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISPOSITION_REQUIRED,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_LABEL,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_ROWS,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_FLOW_TOKENS_IN_ORDER,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE_TOKEN,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_OWNER_SIDE,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_PAIR_WARNING,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_REHEARSAL_CHOICES,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_RESET,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_SELECTION_DISCLAIMER,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_TENANT_SIDE,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_TITLE
} from '../src/synthetic/syntheticMatchReviewWorkspaceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-match-review-workspace.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticMatchReviewWorkspaceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticMatchReviewWorkspace.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticMatchReviewWorkspaceEntry.tsx');
const ALLOWLIST_PATH = path.join(
  REPOSITORY_ROOT,
  '05_DEVELOPMENT',
  'matching-engine',
  'synthetic-match-review-workspace',
  'G14_FILE_ALLOWLIST_v1.0.json'
);

const FROZEN_ABSTRACT_TOKENS = [
  'SYNTHETIC_CAMPAIGN_PREVIEW_A',
  'SYNTHETIC_FIXTURE_PARTY_A',
  'SYNTHETIC_FIXTURE_PARTY_B',
  'SYNTHETIC_HEADING',
  'SYNTHETIC_MESSAGE',
  'SYNTHETIC_NO_DEAL_EXECUTED',
  'SYNTHETIC_SAFE_PRESENTATION_A',
  'SYNTHETIC_TEST_DEAL_A'
];

const CO_DISPLAY_COPY_IN_FLOW_ORDER = [
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_ROWS[0],
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_ROWS[1],
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_OWNER_SIDE.line,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_TENANT_SIDE.line,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_CO_DISPLAY_WARNING,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_PAIR_WARNING,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_ROWS[2],
  'SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED',
  'SYNTHETIC_HEADING',
  'SYNTHETIC_MESSAGE',
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISPOSITION_REQUIRED,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE_TOKEN,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE
];


test('scenario freezes exact two-sided copy, pre-authored fixture rows and preserved g13 flow order', () => {
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_TITLE, 'SYNTHETIC MATCH REVIEW WORKSPACE — NOT PRODUCTION APPROVED');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISCLAIMER, 'MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_CO_DISPLAY_WARNING, 'CO-DISPLAY ONLY — NOT COMPARED OR MATCHED');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_PAIR_WARNING, 'FIXTURE ONLY — NOT MATCHED OR RANKED');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_LABEL, 'PRE-AUTHORED SYNTHETIC FIXTURE — NOT COMPUTED');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_SELECTION_DISCLAIMER, 'UI REHEARSAL SELECTION ONLY — NOT APPROVAL');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISPOSITION_REQUIRED, 'HUMAN REHEARSAL DISPOSITION REQUIRED');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_CONTROLS_ARIA_LABEL, 'SYNTHETIC MATCH REVIEW WORKSPACE CONTROLS');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISPOSITION_GROUP_ARIA_LABEL, 'HUMAN REHEARSAL DISPOSITION');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_OWNER_SIDE.accessibleName, 'OWNER-SIDE NEED');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_OWNER_SIDE.line, 'OWNER-SIDE NEED — SYNTHETIC_FIXTURE_PARTY_A');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_TENANT_SIDE.accessibleName, 'TENANT-SIDE CANDIDATE');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_TENANT_SIDE.line, 'TENANT-SIDE CANDIDATE — SYNTHETIC_FIXTURE_PARTY_B');
  assert.deepEqual(SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_ROWS, [
    'TEST DEAL TOKEN — SYNTHETIC_TEST_DEAL_A',
    'CAMPAIGN PREVIEW — SYNTHETIC_CAMPAIGN_PREVIEW_A',
    'SAFE PRESENTATION — SYNTHETIC_SAFE_PRESENTATION_A'
  ]);
  assert.deepEqual(SYNTHETIC_MATCH_REVIEW_WORKSPACE_REHEARSAL_CHOICES, ['REHEARSE INTEREST', 'REHEARSE HOLD']);
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_RESET, 'RESET');
  assert.equal(SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE_TOKEN, 'SYNTHETIC_NO_DEAL_EXECUTED');
  assert.equal(
    SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE,
    'NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED'
  );
  assert.deepEqual(SYNTHETIC_MATCH_REVIEW_WORKSPACE_FLOW_TOKENS_IN_ORDER, [
    'SYNTHETIC_TEST_DEAL_A',
    'SYNTHETIC_CAMPAIGN_PREVIEW_A',
    'SYNTHETIC_FIXTURE_PARTY_A',
    'SYNTHETIC_FIXTURE_PARTY_B',
    'SYNTHETIC_SAFE_PRESENTATION_A',
    'SYNTHETIC_HEADING',
    'SYNTHETIC_MESSAGE',
    'SYNTHETIC_NO_DEAL_EXECUTED'
  ]);
});

test('scenario carries only the eight frozen abstract tokens and no new scenario token', () => {
  const source = read(SCENARIO_PATH);
  const literals = [...source.matchAll(/'([^']*)'/g)].map(match => match[1]).join('\n');
  const tokens = [...literals.matchAll(/SYNTHETIC_[A-Z0-9_]+/g)].map(match => match[0]);
  assert.deepEqual([...new Set(tokens)].sort(), FROZEN_ABSTRACT_TOKENS);
  assert.deepEqual([...SYNTHETIC_MATCH_REVIEW_WORKSPACE_FLOW_TOKENS_IN_ORDER].sort(), FROZEN_ABSTRACT_TOKENS);
  assert.doesNotMatch(source, /SCENARIO/);
});

test('initial render co-displays both sides with adjacent warnings, fixture rows, g7 reuse and non-occurrence', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMatchReviewWorkspace));

  assert.match(markup, /<h1[^>]*>SYNTHETIC MATCH REVIEW WORKSPACE — NOT PRODUCTION APPROVED<\/h1>/);
  assert.equal(occurrences(markup, SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISCLAIMER), 1);

  assert.match(markup, /<section aria-label="OWNER-SIDE NEED"[^>]*><p[^>]*>OWNER-SIDE NEED — SYNTHETIC_FIXTURE_PARTY_A<\/p><\/section>/);
  assert.match(markup, /<section aria-label="TENANT-SIDE CANDIDATE"[^>]*><p[^>]*>TENANT-SIDE CANDIDATE — SYNTHETIC_FIXTURE_PARTY_B<\/p><\/section>/);
  assert.equal(occurrences(markup, SYNTHETIC_MATCH_REVIEW_WORKSPACE_CO_DISPLAY_WARNING), 1);
  assert.equal(occurrences(markup, SYNTHETIC_MATCH_REVIEW_WORKSPACE_PAIR_WARNING), 1);

  const ordered = CO_DISPLAY_COPY_IN_FLOW_ORDER.map(copy => markup.indexOf(copy));
  ordered.forEach((position, index) => assert.ok(position >= 0, CO_DISPLAY_COPY_IN_FLOW_ORDER[index]));
  for (let index = 1; index < ordered.length; index += 1) {
    assert.ok(ordered[index] > ordered[index - 1], CO_DISPLAY_COPY_IN_FLOW_ORDER[index]);
  }

  for (const row of SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_ROWS) assert.equal(occurrences(markup, row), 1, row);
  assert.equal(occurrences(markup, SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_LABEL), 3);

  assert.match(markup, /SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED/);
  assert.match(markup, /SYNTHETIC_HEADING/);
  assert.match(markup, /SYNTHETIC_MESSAGE/);

  assert.match(markup, /<nav[^>]+aria-label="SYNTHETIC MATCH REVIEW WORKSPACE CONTROLS"/);
  assert.match(markup, /role="group" aria-label="HUMAN REHEARSAL DISPOSITION"/);
  assert.match(markup, /aria-live="polite" aria-atomic="true"/);
  assert.equal((markup.match(/<button\b/g) ?? []).length, 3);
  assert.match(
    markup,
    /<button type="button"[^>]*>REHEARSE INTEREST<\/button><button type="button"[^>]*>REHEARSE HOLD<\/button><\/div><button type="button"[^>]*>RESET<\/button>/
  );
  assert.deepEqual([...markup.matchAll(/aria-label="([^"]+)"/g)].map(match => match[1]).sort(), [
    'HUMAN REHEARSAL DISPOSITION',
    'OWNER-SIDE NEED',
    'SYNTHETIC MATCH REVIEW WORKSPACE CONTROLS',
    'TENANT-SIDE CANDIDATE'
  ]);
  assert.equal(occurrences(markup, SYNTHETIC_MATCH_REVIEW_WORKSPACE_SELECTION_DISCLAIMER), 0);

  assert.equal(occurrences(markup, SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE_TOKEN), 1);
  assert.equal(occurrences(markup, SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE), 1);
  assert.doesNotMatch(markup, />\s*(NEXT|BACK)\s*</);
  assert.doesNotMatch(markup, /STEP \d+ OF \d+/);
  assert.doesNotMatch(markup, /<form|<input|<select|<textarea|<a\b/i);
});

test('component keeps only transient in-memory rehearsal selection with reset and never a stepper', () => {
  const source = read(COMPONENT_PATH);
  assert.match(source, /useState<SyntheticMatchReviewWorkspaceRehearsalChoice \| null>\(null\)/);
  assert.match(source, /onClick=\{\(\) => setSelection\(choice\)\}/);
  assert.match(source, /onClick=\{\(\) => setSelection\(null\)\}/);
  assert.match(source, /selection === null \? null :/);
  assert.match(source, /aria-live="polite" aria-atomic="true"/);
  assert.doesNotMatch(source, /NEXT|BACK|stepper|setStep|currentPanel/);
  assert.doesNotMatch(source, /tabIndex|outline:\s*['"]none|onKey/);
});

test('standalone page binds only isolated entry and exact title', () => {
  const html = read(HTML_PATH);
  assert.match(html, /<title>SYNTHETIC MATCH REVIEW WORKSPACE — NOT PRODUCTION APPROVED<\/title>/);
  assert.match(html, /<script type="module" src="\/src\/synthetic\/syntheticMatchReviewWorkspaceEntry\.tsx"><\/script>/);
  assert.equal((html.match(/<script\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<button\b|<input\b|<select\b|<textarea\b|<form\b|<a\b/i);
});

test('implementation contains no prohibited behavior, persistence, motion or custom keyboard handling', () => {
  const sources = [read(HTML_PATH), read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)];
  const forbidden = [
    'onKey', 'addEventListener', 'fetch(', 'XMLHttpRequest', 'WebSocket', 'localStorage',
    'sessionStorage', 'indexedDB', 'caches.', 'sendBeacon', 'console.', 'document.cookie',
    'URLSearchParams', 'window.location', 'location.hash', 'setTimeout', 'setInterval',
    'requestAnimationFrame', 'Math.random', 'animation', 'transition:', '<form', '<input',
    '<select', '<textarea', '<a '
  ];
  for (const source of sources) {
    for (const token of forbidden) assert.equal(source.includes(token), false, token);
  }
});

test('closed allowlist and production roots keep G14 isolated', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as { allowed_paths: Array<{ path: string; state: string }> };
  assert.equal(sha256(ALLOWLIST_PATH), '9c3bafee5592b7cb37434350ac9477d50a860f59330039aa4b4fff0d492069aa');
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.deepEqual(allowlist.allowed_paths.filter(item => item.state === 'planned').map(item => item.path), [
    'apps/web/synthetic-match-review-workspace.html',
    'apps/web/src/synthetic/syntheticMatchReviewWorkspaceScenario.ts',
    'apps/web/src/synthetic/SyntheticMatchReviewWorkspace.tsx',
    'apps/web/src/synthetic/syntheticMatchReviewWorkspaceEntry.tsx',
    'apps/web/tests/syntheticMatchReviewWorkspace.test.ts',
    '05_DEVELOPMENT/matching-engine/synthetic-match-review-workspace/G14_SYNTHETIC_MATCH_REVIEW_WORKSPACE_VERIFICATION.json'
  ]);
  assert.deepEqual(allowlist.allowed_paths.filter(item => item.state === 'present').map(item => item.path), [
    '05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G14_SYNTHETIC_MATCH_REVIEW_WORKSPACE_AUTHORIZATION_v1.0.md',
    '05_DEVELOPMENT/matching-engine/synthetic-match-review-workspace/README.md',
    '05_DEVELOPMENT/matching-engine/synthetic-match-review-workspace/G14_FILE_ALLOWLIST_v1.0.json'
  ]);
  for (const file of ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json']) {
    const source = read(path.join(WEB_ROOT, file));
    assert.equal(source.includes('synthetic-match-review-workspace'), false, file);
    assert.equal(source.includes('SyntheticMatchReviewWorkspace'), false, file);
  }
});

test('unchanged g7 component and unchanged g8 input render the preserved safe presentation', () => {
  const markup = renderToStaticMarkup(createElement(SafePresentationSyntheticPreview, {
    input: SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT
  }));
  assert.match(markup, /SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED/);
  assert.match(markup, /SYNTHETIC_HEADING/);
  assert.match(markup, /SYNTHETIC_MESSAGE/);
  assert.match(read(COMPONENT_PATH), /SafePresentationSyntheticPreview input=\{SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT\}/);
  assert.equal(sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'SafePresentationSyntheticPreview.tsx')), '3cfd9f3c88ebfdd74a4f03679f6e8acf2f882d6ecfd29883eae16091e1d30e96');
  assert.equal(sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'safePresentationSyntheticDemoInput.ts')), 'e928bbc0cb10c8995e3c4b742005f8e1fd697c782f98580f99079d9972ddea45');
});

const read = (file: string) => readFileSync(file, 'utf8');
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
const occurrences = (source: string, needle: string) => source.split(needle).length - 1;
const escapeForRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
