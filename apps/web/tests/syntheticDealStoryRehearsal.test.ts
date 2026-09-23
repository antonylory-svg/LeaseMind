import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SafePresentationSyntheticPreview from '../src/synthetic/SafePresentationSyntheticPreview.js';
import SyntheticDealStoryRehearsal from '../src/synthetic/SyntheticDealStoryRehearsal.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from '../src/synthetic/safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_DEAL_STORY_REHEARSAL_DISCLAIMER,
  SYNTHETIC_DEAL_STORY_REHEARSAL_SCENARIO,
  SYNTHETIC_DEAL_STORY_REHEARSAL_STEPS,
  SYNTHETIC_DEAL_STORY_REHEARSAL_SUMMARY,
  SYNTHETIC_DEAL_STORY_REHEARSAL_SUMMARY_HEADING,
  SYNTHETIC_DEAL_STORY_REHEARSAL_TITLE,
  transitionSyntheticDealStoryRehearsal,
  type SyntheticDealStoryRehearsalStep
} from '../src/synthetic/syntheticDealStoryRehearsalScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-deal-story-rehearsal.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDealStoryRehearsalScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticDealStoryRehearsal.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDealStoryRehearsalEntry.tsx');

const read = (file: string) => readFileSync(file, 'utf8');
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');

function visibleLines(markup: string): string[] {
  return markup
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

test('rehearsal freezes exact title, disclaimer, summary and unchanged G10 panels', () => {
  assert.equal(SYNTHETIC_DEAL_STORY_REHEARSAL_TITLE, 'SYNTHETIC DEAL STORY REHEARSAL — NOT PRODUCTION APPROVED');
  assert.equal(SYNTHETIC_DEAL_STORY_REHEARSAL_SCENARIO, 'SCENARIO: SYNTHETIC_DEAL_STORY_A');
  assert.equal(SYNTHETIC_DEAL_STORY_REHEARSAL_DISCLAIMER, 'DISPLAY-ONLY REHEARSAL — NO WORKFLOW EXECUTION');
  assert.equal(SYNTHETIC_DEAL_STORY_REHEARSAL_SUMMARY_HEADING, 'FIVE-STEP SYNTHETIC STORY');
  assert.deepEqual(SYNTHETIC_DEAL_STORY_REHEARSAL_SUMMARY, [
    'STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A',
    'STEP 2 — SYNTHETIC_CAMPAIGN_PREVIEW_A',
    'STEP 3 — SYNTHETIC_SAFE_PRESENTATION_A',
    'STEP 4 — SYNTHETIC_HUMAN_CONTINUATION_REQUIRED',
    'STEP 5 — SYNTHETIC_NO_DEAL_EXECUTED'
  ]);
  assert.deepEqual(SYNTHETIC_DEAL_STORY_REHEARSAL_STEPS.map(step => step.progress), [
    'STEP 1 OF 5', 'STEP 2 OF 5', 'STEP 3 OF 5', 'STEP 4 OF 5', 'STEP 5 OF 5'
  ]);
});

test('pure transition moves one clamped step without wrap or skip', () => {
  const forward: SyntheticDealStoryRehearsalStep[] = [0, 1, 2, 3, 4];
  const backward: SyntheticDealStoryRehearsalStep[] = [4, 3, 2, 1, 0];
  assert.deepEqual(forward.map(step => transitionSyntheticDealStoryRehearsal(step, 1)), [1, 2, 3, 4, 4]);
  assert.deepEqual(backward.map(step => transitionSyntheticDealStoryRehearsal(step, -1)), [3, 2, 1, 0, 0]);
});

test('initial render has persistent summary, one current item and exactly three controls', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDealStoryRehearsal));
  assert.deepEqual(visibleLines(markup), [
    'SYNTHETIC DEAL STORY REHEARSAL — NOT PRODUCTION APPROVED',
    'SCENARIO: SYNTHETIC_DEAL_STORY_A',
    'DISPLAY-ONLY REHEARSAL — NO WORKFLOW EXECUTION',
    'FIVE-STEP SYNTHETIC STORY',
    'STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A',
    'STEP 2 — SYNTHETIC_CAMPAIGN_PREVIEW_A',
    'STEP 3 — SYNTHETIC_SAFE_PRESENTATION_A',
    'STEP 4 — SYNTHETIC_HUMAN_CONTINUATION_REQUIRED',
    'STEP 5 — SYNTHETIC_NO_DEAL_EXECUTED',
    'STEP 1 OF 5',
    'STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A',
    'BACK', 'NEXT', 'RESTART'
  ]);
  assert.match(markup, /<ol aria-label="SYNTHETIC STORY STEP SUMMARY">/);
  assert.equal((markup.match(/aria-current="step"/g) ?? []).length, 1);
  assert.match(markup, /<p aria-live="polite" aria-atomic="true">STEP 1 OF 5<\/p>/);
  assert.match(markup, /<nav aria-label="SYNTHETIC REHEARSAL NAVIGATION">/);
  assert.match(markup, /<button type="button" disabled="">BACK<\/button><button type="button">NEXT<\/button><button type="button" disabled="">RESTART<\/button>/);
  assert.equal((markup.match(/<button\b/g) ?? []).length, 3);
});

test('step three source reuses unchanged G7 output and exact G8 input', () => {
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

test('standalone page binds only isolated entry and exact title', () => {
  const html = read(HTML_PATH);
  assert.match(html, /<title>SYNTHETIC DEAL STORY REHEARSAL — NOT PRODUCTION APPROVED<\/title>/);
  assert.match(html, /<script type="module" src="\/src\/synthetic\/syntheticDealStoryRehearsalEntry\.tsx"><\/script>/);
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

test('closed allowlist and production roots keep G11 isolated', () => {
  const allowlistPath = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-deal-story-rehearsal', 'G11_FILE_ALLOWLIST_v1.0.json');
  const allowlist = JSON.parse(read(allowlistPath)) as { allowed_paths: Array<{ path: string; state: string }> };
  const planned = allowlist.allowed_paths.filter(item => item.state === 'planned').map(item => item.path);
  assert.equal(sha256(allowlistPath), '8b59e5fd0e901e06efd26e0ab9391710334a323cdec1b11f236671070e80d023');
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.deepEqual(planned, [
    'apps/web/synthetic-deal-story-rehearsal.html',
    'apps/web/src/synthetic/syntheticDealStoryRehearsalScenario.ts',
    'apps/web/src/synthetic/SyntheticDealStoryRehearsal.tsx',
    'apps/web/src/synthetic/syntheticDealStoryRehearsalEntry.tsx',
    'apps/web/tests/syntheticDealStoryRehearsal.test.ts',
    '05_DEVELOPMENT/matching-engine/synthetic-deal-story-rehearsal/G11_SYNTHETIC_DEAL_STORY_REHEARSAL_VERIFICATION.json'
  ]);
  for (const file of ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json']) {
    const source = read(path.join(WEB_ROOT, file));
    assert.equal(source.includes('synthetic-deal-story-rehearsal'), false, file);
    assert.equal(source.includes('SyntheticDealStoryRehearsal'), false, file);
  }
});
