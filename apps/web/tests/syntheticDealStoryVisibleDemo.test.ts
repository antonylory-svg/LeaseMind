import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticDealStoryDemo from '../src/synthetic/SyntheticDealStoryDemo.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from '../src/synthetic/safePresentationSyntheticDemoInput.js';
import { SYNTHETIC_DEAL_STORY_TOKENS } from '../src/synthetic/syntheticDealStoryScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-deal-story-demo.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDealStoryScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticDealStoryDemo.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDealStoryDemoEntry.tsx');

const EXPECTED_VISIBLE_LINES = [
  'SYNTHETIC DEAL STORY — NOT PRODUCTION APPROVED',
  'SCENARIO: SYNTHETIC_DEAL_STORY_A',
  'STEP 1 — SYNTHETIC_USER_A / SYNTHETIC_NEED_A',
  'STEP 2 — SYNTHETIC_CAMPAIGN_PREVIEW_A',
  'STEP 3 — SYNTHETIC_SAFE_PRESENTATION_A',
  'SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED',
  'SYNTHETIC_HEADING',
  'SYNTHETIC_MESSAGE',
  'STEP 4 — SYNTHETIC_HUMAN_CONTINUATION_REQUIRED',
  'OUTCOME — SYNTHETIC_NO_DEAL_EXECUTED',
  'NO MATCH, SCORE, QUALIFICATION, RISK DECISION OR PRODUCTION APPROVAL OCCURRED'
] as const;

const read = (file: string) => readFileSync(file, 'utf8');
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');

function visibleLines(markup: string): string[] {
  return markup
    .replace(/<[^>]+>/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

test('fixed scenario contains exactly the seven authorized abstract tokens', () => {
  assert.deepEqual(SYNTHETIC_DEAL_STORY_TOKENS, {
    scenario: 'SYNTHETIC_DEAL_STORY_A',
    user: 'SYNTHETIC_USER_A',
    need: 'SYNTHETIC_NEED_A',
    campaignPreview: 'SYNTHETIC_CAMPAIGN_PREVIEW_A',
    safePresentation: 'SYNTHETIC_SAFE_PRESENTATION_A',
    humanContinuation: 'SYNTHETIC_HUMAN_CONTINUATION_REQUIRED',
    outcome: 'SYNTHETIC_NO_DEAL_EXECUTED'
  });
  assert.equal(Object.keys(SYNTHETIC_DEAL_STORY_TOKENS).length, 7);
});

test('rendered demo has exactly the authorized 11 visible lines in order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDealStoryDemo));
  assert.deepEqual(visibleLines(markup), EXPECTED_VISIBLE_LINES);
  assert.equal(visibleLines(markup).length, 11);
});

test('standalone manual dev page binds only the exact entry and title', () => {
  const html = read(HTML_PATH);
  assert.match(html, /<title>SYNTHETIC DEAL STORY DEMO — NOT PRODUCTION APPROVED<\/title>/);
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /<script type="module" src="\/src\/synthetic\/syntheticDealStoryDemoEntry\.tsx"><\/script>/);
  assert.equal((html.match(/<script\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<button\b|<input\b|<select\b|<textarea\b|<form\b|<a\b/i);
});

test('G9 reuses the unchanged G7 component and unchanged G8 input', () => {
  assert.deepEqual(SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT, {
    recipient: 'SYNTHETIC_RECIPIENT_A',
    audience: 'SYNTHETIC_AUDIENCE_A',
    purpose: 'SYNTHETIC_PURPOSE_STATIC_RENDER_TEST',
    locale: 'x-leasemind-synthetic',
    heading: 'SYNTHETIC_HEADING',
    message: 'SYNTHETIC_MESSAGE',
    stale: false,
    revoked: false,
    hash_matches: true,
    binding_matches: true
  });

  assert.match(read(COMPONENT_PATH), /SafePresentationSyntheticPreview input=\{SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT\}/);
  assert.equal(
    sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'SafePresentationSyntheticPreview.tsx')),
    '3cfd9f3c88ebfdd74a4f03679f6e8acf2f882d6ecfd29883eae16091e1d30e96'
  );
  assert.equal(
    sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'safePresentationSyntheticViewModel.ts')),
    'b3d866a0172e04b5a89106eeb7c210854d5103b9260f8cc4178659d8eb60214f'
  );
  assert.equal(
    sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'safePresentationSyntheticDemoInput.ts')),
    'e928bbc0cb10c8995e3c4b742005f8e1fd697c782f98580f99079d9972ddea45'
  );
});

test('G9 implementation contains none of the prohibited behavior', () => {
  const sources = [read(HTML_PATH), read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)];
  const forbidden = [
    'fetch(',
    'XMLHttpRequest',
    'WebSocket',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'caches.',
    'sendBeacon',
    'console.',
    'document.cookie',
    'URLSearchParams',
    'window.location',
    'querySelector',
    'addEventListener',
    'onClick',
    'onChange'
  ];
  for (const source of sources) {
    for (const token of forbidden) assert.equal(source.includes(token), false, token);
  }
});

test('production roots are unchanged and default production build excludes G9', () => {
  const unchangedRoots = new Map([
    [path.join(WEB_ROOT, 'index.html'), '1667fd70d3fc5917af1483825596d52c30898d723ccc40253e88fff10181501d'],
    [path.join(WEB_ROOT, 'src', 'App.tsx'), 'fe83b04ec53a60390d1952534acabe4bdb854c5f547e0dd7f87fa3971aa20c21'],
    [path.join(WEB_ROOT, 'src', 'main.tsx'), '1070e131737963119be2db58c80b8d738d1eaa670f8509965d5dac62bd8675b8'],
    [path.join(WEB_ROOT, 'vite.config.ts'), '5255c6a9ee853b5b4a39fe555a519fccd887247ff9daf1e7fd0aa72b7895b3c1'],
    [path.join(WEB_ROOT, 'package.json'), 'b3cce19967ce20abda0f6c9eb81f34ec3111bad5a920746eb470b90c2cfe3fb1'],
    [path.join(REPOSITORY_ROOT, 'package.json'), 'ff635666b33a75063909bb4d85bd60939b2bb569e669e9d801acba0b5961ee2b']
  ]);

  for (const [file, expectedHash] of unchangedRoots) {
    assert.equal(sha256(file), expectedHash, file);
    assert.equal(read(file).includes('synthetic-deal-story-demo'), false, file);
    assert.equal(read(file).includes('syntheticDealStoryDemoEntry'), false, file);
  }

  const vite = read(path.join(WEB_ROOT, 'vite.config.ts'));
  assert.equal(vite.includes('rollupOptions'), false);
  assert.equal(vite.includes('input:'), false);
});

test('frozen allowlist is unchanged and contains exactly the six G9 planned paths', () => {
  const allowlistPath = path.join(
    REPOSITORY_ROOT,
    '05_DEVELOPMENT',
    'matching-engine',
    'synthetic-deal-story-visible-demo',
    'G9_FILE_ALLOWLIST_v1.0.json'
  );
  const allowlist = JSON.parse(read(allowlistPath)) as {
    allowed_paths: Array<{ path: string; state: string }>;
  };
  const planned = allowlist.allowed_paths.filter(item => item.state === 'planned').map(item => item.path);

  assert.equal(sha256(allowlistPath), '45fba78599108ed604ab8f87862f77c3f3cc7659417bc241ca9cf5f925d281a9');
  assert.deepEqual(planned, [
    'apps/web/synthetic-deal-story-demo.html',
    'apps/web/src/synthetic/syntheticDealStoryScenario.ts',
    'apps/web/src/synthetic/SyntheticDealStoryDemo.tsx',
    'apps/web/src/synthetic/syntheticDealStoryDemoEntry.tsx',
    'apps/web/tests/syntheticDealStoryVisibleDemo.test.ts',
    '05_DEVELOPMENT/matching-engine/synthetic-deal-story-visible-demo/G9_SYNTHETIC_DEAL_STORY_VISIBLE_DEMO_VERIFICATION.json'
  ]);
});
