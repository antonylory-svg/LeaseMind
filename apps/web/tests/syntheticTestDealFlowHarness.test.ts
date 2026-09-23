import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SafePresentationSyntheticPreview from '../src/synthetic/SafePresentationSyntheticPreview.js';
import SyntheticTestDealFlowHarness from '../src/synthetic/SyntheticTestDealFlowHarness.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from '../src/synthetic/safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_TEST_DEAL_FLOW_DISCLAIMER,
  SYNTHETIC_TEST_DEAL_FLOW_DISPOSITIONS,
  SYNTHETIC_TEST_DEAL_FLOW_SCENARIO,
  SYNTHETIC_TEST_DEAL_FLOW_STEPS,
  SYNTHETIC_TEST_DEAL_FLOW_TITLE,
  advanceSyntheticTestDealFlow,
  type SyntheticTestDealFlowStep
} from '../src/synthetic/syntheticTestDealFlowScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-test-deal-flow-harness.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticTestDealFlowScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticTestDealFlowHarness.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticTestDealFlowEntry.tsx');

const read = (file: string) => readFileSync(file, 'utf8');
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');

function visibleLines(markup: string): string[] {
  return markup
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

test('scenario freezes exact six-step order, fixture warning, branches and shared terminal result', () => {
  assert.equal(SYNTHETIC_TEST_DEAL_FLOW_TITLE, 'SYNTHETIC TEST-DEAL FLOW HARNESS — NOT PRODUCTION APPROVED');
  assert.equal(SYNTHETIC_TEST_DEAL_FLOW_SCENARIO, 'SCENARIO: SYNTHETIC_TEST_DEAL_FLOW_A');
  assert.equal(SYNTHETIC_TEST_DEAL_FLOW_DISCLAIMER, 'MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION');
  assert.deepEqual(SYNTHETIC_TEST_DEAL_FLOW_STEPS.map(step => step.progress), [
    'STEP 1 OF 6', 'STEP 2 OF 6', 'STEP 3 OF 6', 'STEP 4 OF 6', 'STEP 5 OF 6', 'STEP 6 OF 6'
  ]);
  assert.deepEqual(SYNTHETIC_TEST_DEAL_FLOW_STEPS[2].lines, [
    'SYNTHETIC_FIXTURE_PARTY_A + SYNTHETIC_FIXTURE_PARTY_B',
    'FIXTURE ONLY — NOT MATCHED OR RANKED'
  ]);
  assert.deepEqual(SYNTHETIC_TEST_DEAL_FLOW_DISPOSITIONS, ['CONTINUE REHEARSAL', 'HOLD REHEARSAL']);
  assert.deepEqual(SYNTHETIC_TEST_DEAL_FLOW_STEPS[5].lines, [
    'SYNTHETIC_NO_DEAL_EXECUTED',
    'NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED'
  ]);
});

test('next transition moves exactly one step only through the disposition step', () => {
  const steps: SyntheticTestDealFlowStep[] = [0, 1, 2, 3, 4, 5];
  assert.deepEqual(steps.map(advanceSyntheticTestDealFlow), [1, 2, 3, 4, 4, 5]);
});

test('initial render shows only step one and exact native control order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticTestDealFlowHarness));
  assert.deepEqual(visibleLines(markup), [
    'SYNTHETIC TEST-DEAL FLOW HARNESS — NOT PRODUCTION APPROVED',
    'SCENARIO: SYNTHETIC_TEST_DEAL_FLOW_A',
    'MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION',
    'STEP 1 OF 6',
    'TEST DEAL TOKEN — SYNTHETIC_TEST_DEAL_A',
    'NEXT STEP',
    'RESET HARNESS'
  ]);
  assert.match(markup, /aria-live="polite" aria-atomic="true"/);
  assert.match(markup, /<nav[^>]+aria-label="SYNTHETIC TEST-DEAL FLOW CONTROLS"/);
  assert.match(markup, /<button type="button"[^>]*>NEXT STEP<\/button><button type="button"[^>]*>RESET HARNESS<\/button>/);
  assert.equal((markup.match(/<button\b/g) ?? []).length, 2);
  assert.doesNotMatch(markup, /STEP [2-6] OF 6|SYNTHETIC_NO_DEAL_EXECUTED|SELECTED DISPOSITION/);
});

test('step four contract reuses unchanged G7 component and unchanged G8 input', () => {
  const markup = renderToStaticMarkup(createElement(SafePresentationSyntheticPreview, {
    input: SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT
  }));
  assert.deepEqual(visibleLines(markup), [
    'SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED',
    'SYNTHETIC_HEADING',
    'SYNTHETIC_MESSAGE'
  ]);
  assert.match(read(COMPONENT_PATH), /SafePresentationSyntheticPreview input=\{SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT\}/);
  assert.equal(sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'SafePresentationSyntheticPreview.tsx')), '3cfd9f3c88ebfdd74a4f03679f6e8acf2f882d6ecfd29883eae16091e1d30e96');
  assert.equal(sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'safePresentationSyntheticDemoInput.ts')), 'e928bbc0cb10c8995e3c4b742005f8e1fd697c782f98580f99079d9972ddea45');
});

test('component freezes disposition group, common terminal state, reset and responsive local styling', () => {
  const source = read(COMPONENT_PATH);
  assert.match(source, /role="group" aria-label="HUMAN REHEARSAL DISPOSITION"/);
  assert.match(source, /setDisposition\(choice\);\s*setStep\(5\)/);
  assert.match(source, /setDisposition\(null\);\s*setStep\(0\)/);
  assert.match(source, /flexWrap: 'wrap'/);
  assert.match(source, /overflowX: 'hidden'/);
  assert.match(source, /overflowWrap: 'anywhere'/);
  assert.doesNotMatch(source, /tabIndex|outline:\s*['"]none|onKey/);
});

test('standalone page binds only isolated entry and exact title', () => {
  const html = read(HTML_PATH);
  assert.match(html, /<title>SYNTHETIC TEST-DEAL FLOW HARNESS — NOT PRODUCTION APPROVED<\/title>/);
  assert.match(html, /<script type="module" src="\/src\/synthetic\/syntheticTestDealFlowEntry\.tsx"><\/script>/);
  assert.equal((html.match(/<script\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<button\b|<input\b|<select\b|<textarea\b|<form\b|<a\b/i);
});

test('implementation contains no prohibited behavior or custom keyboard handling', () => {
  const sources = [read(HTML_PATH), read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)];
  const forbidden = [
    'onKey', 'addEventListener', 'fetch(', 'XMLHttpRequest', 'WebSocket', 'localStorage',
    'sessionStorage', 'indexedDB', 'caches.', 'sendBeacon', 'console.', 'document.cookie',
    'URLSearchParams', 'window.location', 'location.hash', 'setTimeout', 'setInterval',
    'requestAnimationFrame', 'Math.random', 'animation', 'transition:'
  ];
  for (const source of sources) {
    for (const token of forbidden) assert.equal(source.includes(token), false, token);
  }
});

test('closed allowlist and production roots keep G12 isolated', () => {
  const allowlistPath = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-test-deal-flow-harness', 'G12_FILE_ALLOWLIST_v1.0.json');
  const allowlist = JSON.parse(read(allowlistPath)) as { allowed_paths: Array<{ path: string; state: string }> };
  const planned = allowlist.allowed_paths.filter(item => item.state === 'planned').map(item => item.path);
  assert.equal(sha256(allowlistPath), '02851ef4d03fb8232f04c4917766750f0a5db7b53b99501d1cafe2580a7080a2');
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.deepEqual(planned, [
    'apps/web/synthetic-test-deal-flow-harness.html',
    'apps/web/src/synthetic/syntheticTestDealFlowScenario.ts',
    'apps/web/src/synthetic/SyntheticTestDealFlowHarness.tsx',
    'apps/web/src/synthetic/syntheticTestDealFlowEntry.tsx',
    'apps/web/tests/syntheticTestDealFlowHarness.test.ts',
    '05_DEVELOPMENT/matching-engine/synthetic-test-deal-flow-harness/G12_SYNTHETIC_TEST_DEAL_FLOW_HARNESS_VERIFICATION.json'
  ]);
  for (const file of ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json']) {
    const source = read(path.join(WEB_ROOT, file));
    assert.equal(source.includes('synthetic-test-deal-flow-harness'), false, file);
    assert.equal(source.includes('SyntheticTestDealFlowHarness'), false, file);
  }
});
