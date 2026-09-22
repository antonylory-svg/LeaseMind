import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SafePresentationSyntheticPreview from '../src/synthetic/SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from '../src/synthetic/safePresentationSyntheticDemoInput.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const HTML_PATH = path.join(WEB_ROOT, 'safe-presentation-synthetic-demo.html');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'safePresentationSyntheticDemoEntry.tsx');
const INPUT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'safePresentationSyntheticDemoInput.ts');
const G7_COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SafePresentationSyntheticPreview.tsx');
const G7_PROJECTOR_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'safePresentationSyntheticViewModel.ts');

const read = (file: string) => readFileSync(file, 'utf8');
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');

test('standalone HTML binds only the exact manual dev entry and exact title', () => {
  const html = read(HTML_PATH);
  assert.match(html, /<title>SYNTHETIC SAFE PRESENTATION DEMO — NOT PRODUCTION APPROVED<\/title>/);
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /<script type="module" src="\/src\/synthetic\/safePresentationSyntheticDemoEntry\.tsx"><\/script>/);
  assert.equal((html.match(/<script\b/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<button\b|<input\b|<select\b|<textarea\b|<a\b/i);
});

test('fixed input renders the exact G7 presentation contract with no additional visible copy', () => {
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

  assert.equal(
    renderToStaticMarkup(createElement(SafePresentationSyntheticPreview, {
      input: SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT
    })),
    '<section><p>SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED</p><h1>SYNTHETIC_HEADING</h1><p>SYNTHETIC_MESSAGE</p></section>'
  );
});

test('entry reuses the unchanged G7 component and the fixed input only', () => {
  const entry = read(ENTRY_PATH);
  assert.match(entry, /SafePresentationSyntheticPreview/);
  assert.match(entry, /SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT/);
  assert.match(entry, /document\.getElementById\('root'\)/);
  assert.doesNotMatch(entry, /window\.location|URLSearchParams|querySelector|addEventListener|onClick|onChange/);
});

test('G8 files contain no forbidden references or runtime capabilities', () => {
  const sources = [read(HTML_PATH), read(ENTRY_PATH), read(INPUT_PATH)];
  const forbidden = [
    'App.tsx',
    'main.tsx',
    'index.html',
    'vite.config',
    'fetch(',
    'XMLHttpRequest',
    'WebSocket',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'caches.',
    'sendBeacon',
    'console.',
    'document.cookie'
  ];
  for (const source of sources) {
    for (const token of forbidden) assert.equal(source.includes(token), false, token);
  }
});

test('production roots and Vite configuration do not reference the demo', () => {
  const productionRoots = [
    path.join(WEB_ROOT, 'index.html'),
    path.join(WEB_ROOT, 'src', 'App.tsx'),
    path.join(WEB_ROOT, 'src', 'main.tsx'),
    path.join(WEB_ROOT, 'vite.config.ts')
  ];
  for (const file of productionRoots) {
    const source = read(file);
    assert.equal(source.includes('safe-presentation-synthetic-demo'), false, file);
    assert.equal(source.includes('safePresentationSyntheticDemoEntry'), false, file);
    assert.equal(source.includes('safePresentationSyntheticDemoInput'), false, file);
  }

  const vite = read(path.join(WEB_ROOT, 'vite.config.ts'));
  assert.equal(vite.includes('rollupOptions'), false);
  assert.equal(vite.includes('input:'), false);
  assert.equal(read(path.join(WEB_ROOT, 'index.html')).includes('safePresentationSyntheticDemoEntry'), false);
});

test('G7 source remains byte-identical to the authorized baseline', () => {
  assert.equal(sha256(G7_COMPONENT_PATH), '3cfd9f3c88ebfdd74a4f03679f6e8acf2f882d6ecfd29883eae16091e1d30e96');
  assert.equal(sha256(G7_PROJECTOR_PATH), 'b3d866a0172e04b5a89106eeb7c210854d5103b9260f8cc4178659d8eb60214f');
});
