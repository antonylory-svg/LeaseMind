import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SafePresentationSyntheticPreview from '../src/synthetic/SafePresentationSyntheticPreview.js';
import SyntheticDealStoryWalkthrough from '../src/synthetic/SyntheticDealStoryWalkthrough.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from '../src/synthetic/safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_DEAL_STORY_WALKTHROUGH_SCENARIO,
  SYNTHETIC_DEAL_STORY_WALKTHROUGH_STEPS,
  SYNTHETIC_DEAL_STORY_WALKTHROUGH_TITLE,
  transitionSyntheticDealStoryWalkthrough,
  type SyntheticDealStoryWalkthroughStep
} from '../src/synthetic/syntheticDealStoryWalkthroughScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-deal-story-walkthrough.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDealStoryWalkthroughScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticDealStoryWalkthrough.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDealStoryWalkthroughEntry.tsx');

const read = (file: string) => readFileSync(file, 'utf8');
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');

function visibleLines(markup: string): string[] {
  return markup
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

test('walkthrough scenario freezes exactly five ordered panels and authorized copy', () => {
  assert.equal(SYNTHETIC_DEAL_STORY_WALKTHROUGH_TITLE, 'SYNTHETIC DEAL STORY WALKTHROUGH — NOT PRODUCTION APPROVED');
  assert.equal(SYNTHETIC_DEAL_STORY_WALKTHROUGH_SCENARIO, 'SCENARIO: SYNTHETIC_DEAL_STORY_A');
  assert.deepEqual(SYNTHETIC_DEAL_STORY_WALKTHROUGH_STEPS, [
    { progress: 'STEP 1 OF 5', lines: ['STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A'] },
    { progress: 'STEP 2 OF 5', lines: ['STEP 2 — SYNTHETIC_CAMPAIGN_PREVIEW_A'] },
    { progress: 'STEP 3 OF 5', lines: ['STEP 3 — SYNTHETIC_SAFE_PRESENTATION_A'] },
    { progress: 'STEP 4 OF 5', lines: ['STEP 4 — SYNTHETIC_HUMAN_CONTINUATION_REQUIRED'] },
    {
      progress: 'STEP 5 OF 5',
      lines: [
        'OUTCOME — SYNTHETIC_NO_DEAL_EXECUTED',
        'NO MATCH, SCORE, QUALIFICATION, RISK DECISION OR PRODUCTION APPROVAL OCCURRED'
      ]
    }
  ]);
});

test('pure transition moves one step and clamps both endpoints without wrap or skip', () => {
  const forward: SyntheticDealStoryWalkthroughStep[] = [0, 1, 2, 3, 4];
  const backward: SyntheticDealStoryWalkthroughStep[] = [4, 3, 2, 1, 0];

  assert.deepEqual(forward.map(step => transitionSyntheticDealStoryWalkthrough(step, 1)), [1, 2, 3, 4, 4]);
  assert.deepEqual(backward.map(step => transitionSyntheticDealStoryWalkthrough(step, -1)), [3, 2, 1, 0, 0]);
});

test('initial render is exact step one with two native controls in logical order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDealStoryWalkthrough));
  assert.deepEqual(visibleLines(markup), [
    'SYNTHETIC DEAL STORY WALKTHROUGH — NOT PRODUCTION APPROVED',
    'SCENARIO: SYNTHETIC_DEAL_STORY_A',
    'STEP 1 OF 5',
    'STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A',
    'BACK',
    'NEXT'
  ]);
  assert.match(markup, /<p aria-live="polite" aria-atomic="true">STEP 1 OF 5<\/p>/);
  assert.match(markup, /<nav aria-label="SYNTHETIC WALKTHROUGH NAVIGATION">/);
  assert.match(markup, /<button type="button" disabled="">BACK<\/button><button type="button">NEXT<\/button>/);
  assert.equal((markup.match(/<button\b/g) ?? []).length, 2);
});

test('step three reuses unchanged G7 component and exact unchanged G8 input', () => {
  const markup = renderToStaticMarkup(createElement(SafePresentationSyntheticPreview, {
    input: SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT
  }));
  assert.deepEqual(visibleLines(markup), [
    'SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED',
    'SYNTHETIC_HEADING',
    'SYNTHETIC_MESSAGE'
  ]);
  assert.equal(
    sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'SafePresentationSyntheticPreview.tsx')),
    '3cfd9f3c88ebfdd74a4f03679f6e8acf2f882d6ecfd29883eae16091e1d30e96'
  );
  assert.equal(
    sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'safePresentationSyntheticDemoInput.ts')),
    'e928bbc0cb10c8995e3c4b742005f8e1fd697c782f98580f99079d9972ddea45'
  );
});

test('standalone page binds only its isolated entry and exact title', () => {
  const html = read(HTML_PATH);
  assert.match(html, /<title>SYNTHETIC DEAL STORY WALKTHROUGH — NOT PRODUCTION APPROVED<\/title>/);
  assert.match(html, /<script type="module" src="\/src\/synthetic\/syntheticDealStoryWalkthroughEntry\.tsx"><\/script>/);
  assert.equal((html.match(/<script\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<button\b|<input\b|<select\b|<textarea\b|<form\b|<a\b/i);
});

test('implementation has no custom keyboard, network, persistence, logging, timer or URL state behavior', () => {
  const sources = [read(HTML_PATH), read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)];
  const forbidden = [
    'onKey', 'addEventListener', 'fetch(', 'XMLHttpRequest', 'WebSocket', 'localStorage',
    'sessionStorage', 'indexedDB', 'caches.', 'sendBeacon', 'console.', 'document.cookie',
    'URLSearchParams', 'window.location', 'location.hash', 'setTimeout', 'setInterval',
    'requestAnimationFrame', 'Math.random'
  ];
  for (const source of sources) {
    for (const token of forbidden) assert.equal(source.includes(token), false, token);
  }
});

test('closed allowlist and production roots keep G10 isolated', () => {
  const allowlistPath = path.join(
    REPOSITORY_ROOT,
    '05_DEVELOPMENT',
    'matching-engine',
    'synthetic-deal-story-walkthrough',
    'G10_FILE_ALLOWLIST_v1.0.json'
  );
  const allowlist = JSON.parse(read(allowlistPath)) as {
    allowed_paths: Array<{ path: string; state: string }>;
  };
  const planned = allowlist.allowed_paths.filter(item => item.state === 'planned').map(item => item.path);

  assert.equal(sha256(allowlistPath), 'aed2142f2a4c75d704b21b6146e8bc8cd45f63aa1ab57b75d7a63c74c67a5ba3');
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.deepEqual(planned, [
    'apps/web/synthetic-deal-story-walkthrough.html',
    'apps/web/src/synthetic/syntheticDealStoryWalkthroughScenario.ts',
    'apps/web/src/synthetic/SyntheticDealStoryWalkthrough.tsx',
    'apps/web/src/synthetic/syntheticDealStoryWalkthroughEntry.tsx',
    'apps/web/tests/syntheticDealStoryWalkthrough.test.ts',
    '05_DEVELOPMENT/matching-engine/synthetic-deal-story-walkthrough/G10_SYNTHETIC_DEAL_STORY_WALKTHROUGH_VERIFICATION.json'
  ]);

  for (const file of ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json']) {
    const source = read(path.join(WEB_ROOT, file));
    assert.equal(source.includes('synthetic-deal-story-walkthrough'), false, file);
    assert.equal(source.includes('SyntheticDealStoryWalkthrough'), false, file);
  }
});
