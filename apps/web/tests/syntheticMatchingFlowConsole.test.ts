import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticMatchingFlowConsole from '../src/synthetic/SyntheticMatchingFlowConsole.js';
import SafePresentationSyntheticPreview from '../src/synthetic/SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from '../src/synthetic/safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_MATCHING_FLOW_CONSOLE_DISCLAIMER,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_DISPOSITIONS,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_NON_OCCURRENCE,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_RESET,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_SCENARIO,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_STAGE_NODES,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_TITLE
} from '../src/synthetic/syntheticMatchingFlowConsoleScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-matching-flow-console.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticMatchingFlowConsoleScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticMatchingFlowConsole.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticMatchingFlowConsoleEntry.tsx');

const read = (file: string) => readFileSync(file, 'utf8');
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');

test('scenario freezes exact simultaneous six-node copy and order', () => {
  assert.equal(SYNTHETIC_MATCHING_FLOW_CONSOLE_TITLE, 'SYNTHETIC MATCHING FLOW CONSOLE — NOT PRODUCTION APPROVED');
  assert.equal(SYNTHETIC_MATCHING_FLOW_CONSOLE_SCENARIO, 'SCENARIO: SYNTHETIC_MATCHING_FLOW_CONSOLE_A');
  assert.equal(SYNTHETIC_MATCHING_FLOW_CONSOLE_DISCLAIMER, 'MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION');
  assert.deepEqual(SYNTHETIC_MATCHING_FLOW_CONSOLE_STAGE_NODES.map(node => node.accessibleName), [
    'STAGE NODE 1 — TEST DEAL TOKEN',
    'STAGE NODE 2 — CAMPAIGN PREVIEW',
    'STAGE NODE 3 — FIXTURE PAIR',
    'STAGE NODE 4 — SAFE PRESENTATION',
    'STAGE NODE 5 — HUMAN REHEARSAL DISPOSITION',
    'STAGE NODE 6 — NON-OCCURRENCE RESULT'
  ]);
  assert.deepEqual(SYNTHETIC_MATCHING_FLOW_CONSOLE_STAGE_NODES[2].lines, [
    'SYNTHETIC_FIXTURE_PARTY_A + SYNTHETIC_FIXTURE_PARTY_B',
    'FIXTURE ONLY — NOT MATCHED OR RANKED'
  ]);
  assert.deepEqual(SYNTHETIC_MATCHING_FLOW_CONSOLE_DISPOSITIONS, ['CONTINUE REHEARSAL', 'HOLD REHEARSAL']);
  assert.equal(SYNTHETIC_MATCHING_FLOW_CONSOLE_RESET, 'RESET');
});

test('initial render shows all six panels, exact controls and current-render non-occurrence panel', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMatchingFlowConsole));
  const panelNames = [...markup.matchAll(/<section aria-label="(STAGE NODE [^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(panelNames, SYNTHETIC_MATCHING_FLOW_CONSOLE_STAGE_NODES.map(node => node.accessibleName));
  for (const node of SYNTHETIC_MATCHING_FLOW_CONSOLE_STAGE_NODES) {
    for (const line of node.lines) assert.match(markup, new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(markup, /<nav[^>]+aria-label="SYNTHETIC MATCHING FLOW CONSOLE CONTROLS"/);
  assert.match(markup, /role="group" aria-label="HUMAN REHEARSAL DISPOSITION"/);
  assert.match(markup, /aria-live="polite" aria-atomic="true"/);
  assert.equal((markup.match(/<button\b/g) ?? []).length, 3);
  assert.match(markup, /<button type="button"[^>]*>CONTINUE REHEARSAL<\/button><button type="button"[^>]*>HOLD REHEARSAL<\/button><\/div><button type="button"[^>]*>RESET<\/button>/);
  assert.match(markup, /SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED/);
  assert.match(markup, /SYNTHETIC_HEADING/);
  assert.match(markup, /SYNTHETIC_MESSAGE/);
  assert.match(markup, /CURRENT-RENDER NON-OCCURRENCE PANEL/);
  assert.match(markup, /CURRENT RENDER ONLY — NOT A LEDGER — NOT PERSISTENT/);
  assert.match(markup, new RegExp(SYNTHETIC_MATCHING_FLOW_CONSOLE_NON_OCCURRENCE));
});

test('stage node four reuses unchanged G7 component and unchanged G8 input', () => {
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

test('component keeps only transient disposition state and reset without progression', () => {
  const source = read(COMPONENT_PATH);
  assert.match(source, /useState<SyntheticMatchingFlowConsoleDisposition \| null>\(null\)/);
  assert.match(source, /onClick=\{\(\) => setDisposition\(choice\)\}/);
  assert.match(source, /onClick=\{\(\) => setDisposition\(null\)\}/);
  assert.doesNotMatch(source, /NEXT|BACK|stepper|setStep|currentPanel/);
  assert.doesNotMatch(source, /tabIndex|outline:\s*['"]none|onKey/);
});

test('standalone page binds only isolated entry and exact title', () => {
  const html = read(HTML_PATH);
  assert.match(html, /<title>SYNTHETIC MATCHING FLOW CONSOLE — NOT PRODUCTION APPROVED<\/title>/);
  assert.match(html, /<script type="module" src="\/src\/synthetic\/syntheticMatchingFlowConsoleEntry\.tsx"><\/script>/);
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

test('closed allowlist and production roots keep G13 isolated', () => {
  const allowlistPath = path.join(REPOSITORY_ROOT, '05_DEVELOPMENT', 'matching-engine', 'synthetic-matching-flow-console', 'G13_FILE_ALLOWLIST_v1.0.json');
  const allowlist = JSON.parse(read(allowlistPath)) as { allowed_paths: Array<{ path: string; state: string }> };
  const planned = allowlist.allowed_paths.filter(item => item.state === 'planned').map(item => item.path);
  assert.equal(sha256(allowlistPath), '293a762abe050c77db6a9aaab3d44c980e1b182259edc2dc758ae31d5bb8af67');
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.deepEqual(planned, [
    'apps/web/synthetic-matching-flow-console.html',
    'apps/web/src/synthetic/syntheticMatchingFlowConsoleScenario.ts',
    'apps/web/src/synthetic/SyntheticMatchingFlowConsole.tsx',
    'apps/web/src/synthetic/syntheticMatchingFlowConsoleEntry.tsx',
    'apps/web/tests/syntheticMatchingFlowConsole.test.ts',
    '05_DEVELOPMENT/matching-engine/synthetic-matching-flow-console/G13_SYNTHETIC_MATCHING_FLOW_CONSOLE_VERIFICATION.json'
  ]);
  for (const file of ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json']) {
    const source = read(path.join(WEB_ROOT, file));
    assert.equal(source.includes('synthetic-matching-flow-console'), false, file);
    assert.equal(source.includes('SyntheticMatchingFlowConsole'), false, file);
  }
});
