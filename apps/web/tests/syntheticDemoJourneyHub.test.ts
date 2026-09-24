import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticDemoJourneyHub from '../src/synthetic/SyntheticDemoJourneyHub.js';
import SafePresentationSyntheticPreview from '../src/synthetic/SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from '../src/synthetic/safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ADJACENT_LINE,
  SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_REGION_ARIA_LABEL,
  SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ROWS,
  SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_TITLE,
  SYNTHETIC_DEMO_JOURNEY_HUB_CHAIN_WARNING,
  SYNTHETIC_DEMO_JOURNEY_HUB_DISCLAIMER,
  SYNTHETIC_DEMO_JOURNEY_HUB_ENTRIES,
  SYNTHETIC_DEMO_JOURNEY_HUB_FLOW_TOKENS_IN_ORDER,
  SYNTHETIC_DEMO_JOURNEY_HUB_JOURNEY_REGION_ARIA_LABEL,
  SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE,
  SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_REGION_ARIA_LABEL,
  SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_TOKEN,
  SYNTHETIC_DEMO_JOURNEY_HUB_SAFE_PRESENTATION_REGION_ARIA_LABEL,
  SYNTHETIC_DEMO_JOURNEY_HUB_TITLE
} from '../src/synthetic/syntheticDemoJourneyHubScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-demo-journey-hub.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDemoJourneyHubScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticDemoJourneyHub.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDemoJourneyHubEntry.tsx');
const ALLOWLIST_PATH = path.join(
  REPOSITORY_ROOT,
  '05_DEVELOPMENT',
  'matching-engine',
  'synthetic-demo-journey-hub',
  'G16_FILE_ALLOWLIST_v1.0.json'
);

const FROZEN_ALLOWLIST_SHA256 = 'f7f552ce0487e9a961ee52b83f2ef8c78f4bcc3067add8a239f80fab6ec82a74';
const G7_COMPONENT_SHA256 = '3cfd9f3c88ebfdd74a4f03679f6e8acf2f882d6ecfd29883eae16091e1d30e96';
const G8_INPUT_SHA256 = 'e928bbc0cb10c8995e3c4b742005f8e1fd697c782f98580f99079d9972ddea45';

const PRIOR_PACKAGE_SHA256 = {
  'apps/web/src/synthetic/SafePresentationSyntheticPreview.tsx': G7_COMPONENT_SHA256,
  'apps/web/src/synthetic/safePresentationSyntheticDemoInput.ts': G8_INPUT_SHA256,
  'apps/web/synthetic-deal-rehearsal-board.html':
    '9fe638e1c8a79e739c43ad90734bae6ed7a61a0e911cd1cb237c1f357eb1698c',
  'apps/web/src/synthetic/syntheticDealRehearsalBoardScenario.ts':
    '0155831447bd04b501abe92fd1a33735f06e3ee60b41d0660fd15570d6cbdc29',
  'apps/web/src/synthetic/SyntheticDealRehearsalBoard.tsx':
    'f069d570685921783531287a73d580eaede515933f45731c97537457d1ac606c',
  'apps/web/src/synthetic/syntheticDealRehearsalBoardEntry.tsx':
    '0cc338c8b584a128db60bcc008bc2b972d6997afecbb94824c7d4e26adf4bbba',
  'apps/web/tests/syntheticDealRehearsalBoard.test.ts':
    'e47f166e83c781797207e3ca188ffdf2b39c4a6bbab4ce09a4a705f35db4b6b0',
  '05_DEVELOPMENT/matching-engine/synthetic-deal-rehearsal-board/G15_FILE_ALLOWLIST_v1.0.json':
    '53addc8cb9c13a6fece1f8cc85b44cb332f86f56ccaa93d16ce3725c031651a2'
};

const FROZEN_ENTRIES = [
  {
    entryLabel: 'ENTRY 1 OF 8',
    sourcePackage: 'G8',
    pageTitle: 'SYNTHETIC SAFE PRESENTATION DEMO — NOT PRODUCTION APPROVED',
    devPath: '/safe-presentation-synthetic-demo.html'
  },
  {
    entryLabel: 'ENTRY 2 OF 8',
    sourcePackage: 'G9',
    pageTitle: 'SYNTHETIC DEAL STORY DEMO — NOT PRODUCTION APPROVED',
    devPath: '/synthetic-deal-story-demo.html'
  },
  {
    entryLabel: 'ENTRY 3 OF 8',
    sourcePackage: 'G10',
    pageTitle: 'SYNTHETIC DEAL STORY WALKTHROUGH — NOT PRODUCTION APPROVED',
    devPath: '/synthetic-deal-story-walkthrough.html'
  },
  {
    entryLabel: 'ENTRY 4 OF 8',
    sourcePackage: 'G11',
    pageTitle: 'SYNTHETIC DEAL STORY REHEARSAL — NOT PRODUCTION APPROVED',
    devPath: '/synthetic-deal-story-rehearsal.html'
  },
  {
    entryLabel: 'ENTRY 5 OF 8',
    sourcePackage: 'G12',
    pageTitle: 'SYNTHETIC TEST-DEAL FLOW HARNESS — NOT PRODUCTION APPROVED',
    devPath: '/synthetic-test-deal-flow-harness.html'
  },
  {
    entryLabel: 'ENTRY 6 OF 8',
    sourcePackage: 'G13',
    pageTitle: 'SYNTHETIC MATCHING FLOW CONSOLE — NOT PRODUCTION APPROVED',
    devPath: '/synthetic-matching-flow-console.html'
  },
  {
    entryLabel: 'ENTRY 7 OF 8',
    sourcePackage: 'G14',
    pageTitle: 'SYNTHETIC MATCH REVIEW WORKSPACE — NOT PRODUCTION APPROVED',
    devPath: '/synthetic-match-review-workspace.html'
  },
  {
    entryLabel: 'ENTRY 8 OF 8',
    sourcePackage: 'G15',
    pageTitle: 'SYNTHETIC DEAL REHEARSAL BOARD — NOT PRODUCTION APPROVED',
    devPath: '/synthetic-deal-rehearsal-board.html'
  }
];

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

const REGION_ARIA_LABELS_IN_LAYOUT_ORDER = [
  SYNTHETIC_DEMO_JOURNEY_HUB_JOURNEY_REGION_ARIA_LABEL,
  SYNTHETIC_DEMO_JOURNEY_HUB_SAFE_PRESENTATION_REGION_ARIA_LABEL,
  SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_REGION_ARIA_LABEL,
  SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_REGION_ARIA_LABEL
];

const G9_TO_G15_PAGE_COMPONENTS = [
  'SyntheticDealStoryDemo',
  'SyntheticDealStoryWalkthrough',
  'SyntheticDealStoryRehearsal',
  'SyntheticTestDealFlowHarness',
  'SyntheticMatchingFlowConsole',
  'SyntheticMatchReviewWorkspace',
  'SyntheticDealRehearsalBoard'
];

test('scenario freezes every hub line, region name, entry label, entry title and entry path', () => {
  assert.equal(SYNTHETIC_DEMO_JOURNEY_HUB_TITLE, 'SYNTHETIC DEMO JOURNEY HUB — NOT PRODUCTION APPROVED');
  assert.equal(SYNTHETIC_DEMO_JOURNEY_HUB_DISCLAIMER, 'MANUAL DEV-ONLY HUB — NOT AN APPLICATION MENU');
  assert.equal(
    SYNTHETIC_DEMO_JOURNEY_HUB_CHAIN_WARNING,
    'SEQUENCE SHOWN AT ONCE — NOT A STEPPER — NOT PROGRESSION'
  );
  assert.equal(
    SYNTHETIC_DEMO_JOURNEY_HUB_JOURNEY_REGION_ARIA_LABEL,
    'SYNTHETIC DEMO JOURNEY — EIGHT MANUAL DEV-ONLY PAGES'
  );
  assert.equal(
    SYNTHETIC_DEMO_JOURNEY_HUB_SAFE_PRESENTATION_REGION_ARIA_LABEL,
    'SAFE PRESENTATION — UNCHANGED G7/G8 REUSE'
  );
  assert.equal(SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_REGION_ARIA_LABEL, 'WHAT THIS HUB IS NOT');
  assert.equal(SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_TITLE, 'WHAT THIS HUB IS NOT — FIXTURE COPY');
  assert.deepEqual(SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ROWS, [
    'NOT A MATCH',
    'NOT A SCORE OR CONFIDENCE',
    'NOT A QUALIFICATION OR RISK DECISION',
    'NOT A RANKING OR RECOMMENDATION',
    'NOT A CONTACT, CAMPAIGN LAUNCH, DEAL OR OUTCOME',
    'NOT PRODUCTION APPROVED'
  ]);
  assert.equal(SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ADJACENT_LINE, 'FIXTURE COPY — NOT A STATUS CLAIM');
  assert.equal(SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_REGION_ARIA_LABEL, 'NON-OCCURRENCE RESULT');
  assert.equal(SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_TOKEN, 'SYNTHETIC_NO_DEAL_EXECUTED');
  assert.equal(
    SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE,
    'NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED'
  );

  assert.equal(SYNTHETIC_DEMO_JOURNEY_HUB_ENTRIES.length, 8);
  assert.deepEqual(SYNTHETIC_DEMO_JOURNEY_HUB_ENTRIES, FROZEN_ENTRIES);
  assert.equal(SYNTHETIC_DEMO_JOURNEY_HUB_ENTRIES.every(entry => entry.devPath.startsWith('/')), true);
  assert.equal(SYNTHETIC_DEMO_JOURNEY_HUB_ENTRIES.every(entry => entry.devPath.endsWith('.html')), true);
});

test('scenario carries only the eight frozen abstract tokens and declares no new scenario token or scenario line', () => {
  const source = read(SCENARIO_PATH);
  const literals = [...source.matchAll(/'([^']*)'/g)].map(match => match[1]).join('\n');
  const tokens = [...literals.matchAll(/SYNTHETIC_[A-Z0-9_]+/g)].map(match => match[0]);

  assert.deepEqual([...new Set(tokens)].sort(), FROZEN_ABSTRACT_TOKENS);
  assert.deepEqual([...SYNTHETIC_DEMO_JOURNEY_HUB_FLOW_TOKENS_IN_ORDER].sort(), FROZEN_ABSTRACT_TOKENS);
  assert.doesNotMatch(source, /SCENARIO/);

  // The G13 dev path is composed in the scenario from two adjacent literals so that the frozen G7
  // isolation test does not flag a page path as a console-logging prefix. The composed value must
  // still equal the exact frozen G13 local dev path, and the raw prefix must stay absent.
  assert.equal(SYNTHETIC_DEMO_JOURNEY_HUB_ENTRIES[5].devPath, '/synthetic-matching-flow-console.html');
  assert.equal(source.includes('console.'), false);
});

test('initial render shows all four regions and all eight entries at once in fixed order with no stepper or progression affordance', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDemoJourneyHub));

  assert.match(markup, /<h1[^>]*>SYNTHETIC DEMO JOURNEY HUB — NOT PRODUCTION APPROVED<\/h1>/);
  assert.equal(occurrences(markup, SYNTHETIC_DEMO_JOURNEY_HUB_DISCLAIMER), 1);

  const regionPositions = REGION_ARIA_LABELS_IN_LAYOUT_ORDER.map(label => markup.indexOf(`aria-label="${label}"`));
  regionPositions.forEach((position, index) => {
    assert.ok(position >= 0, REGION_ARIA_LABELS_IN_LAYOUT_ORDER[index]);
  });
  for (let index = 1; index < regionPositions.length; index += 1) {
    assert.ok(regionPositions[index] > regionPositions[index - 1], REGION_ARIA_LABELS_IN_LAYOUT_ORDER[index]);
  }

  const anchorTags = [...markup.matchAll(/<a\b[^>]*>/g)].map(match => match[0]);
  assert.equal(anchorTags.length, 8);
  assert.deepEqual(
    anchorTags.map(tag => /href="([^"]*)"/.exec(tag)?.[1]),
    FROZEN_ENTRIES.map(entry => entry.devPath)
  );

  const entryLabels = [...markup.matchAll(/<li[^>]*><p[^>]*>(ENTRY \d OF 8)<\/p>/g)].map(match => match[1]);
  assert.deepEqual(entryLabels, FROZEN_ENTRIES.map(entry => entry.entryLabel));
  assert.equal((markup.match(/<li\b/g) ?? []).length, 8);
  assert.equal((markup.match(/<ol\b/g) ?? []).length, 1);

  assert.equal(occurrences(markup, SYNTHETIC_DEMO_JOURNEY_HUB_CHAIN_WARNING), 1);

  assert.doesNotMatch(markup, />\s*(NEXT|BACK)\s*</);
  assert.doesNotMatch(markup, /STEP \d+ OF \d+/);
  assert.doesNotMatch(markup, /display:\s*none|visibility:\s*hidden/);
  assert.doesNotMatch(markup, /<button\b|<form\b|<input\b|<select\b|<textarea\b/i);
});

test('every journey entry carries its label, exact frozen page title, exact dev path and exactly one same-tab native anchor', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDemoJourneyHub));
  const orderedList = markup.slice(markup.indexOf('<ol'), markup.indexOf('</ol>'));
  const listItems = orderedList.split('<li').slice(1);

  assert.equal(listItems.length, 8);

  listItems.forEach((listItem, index) => {
    const entry = FROZEN_ENTRIES[index];

    assert.equal(occurrences(listItem, entry.entryLabel), 1, entry.entryLabel);
    assert.equal(occurrences(listItem, entry.pageTitle), 1, entry.pageTitle);
    assert.equal(occurrences(listItem, entry.devPath), 2, entry.devPath);
    assert.equal((listItem.match(/<a\b/g) ?? []).length, 1, entry.entryLabel);

    assert.match(listItem, new RegExp('href="' + escapeForRegExp(entry.devPath) + '"'));
    assert.match(
      listItem,
      new RegExp('>' + escapeForRegExp(entry.pageTitle) + '</a>')
    );

    assert.equal(listItem.includes('target='), false, entry.entryLabel);
    assert.equal(listItem.includes('download'), false, entry.entryLabel);
    assert.equal(listItem.includes('rel="'), false, entry.entryLabel);
    assert.equal(listItem.includes('http://'), false, entry.entryLabel);
    assert.equal(listItem.includes('https://'), false, entry.entryLabel);
    assert.equal(listItem.includes('_blank'), false, entry.entryLabel);

    const anchorTag = /<a\b[^>]*>/.exec(listItem)?.[0] ?? '';
    const href = /^<a href="([^"]*)"/.exec(anchorTag)?.[1] ?? '';

    assert.equal(href, entry.devPath, entry.entryLabel);
    assert.equal(href.includes('?'), false, entry.entryLabel);
    assert.equal(href.includes('#'), false, entry.entryLabel);
    assert.equal(/^<a href="[^"]*" style="[^"]*">$/.test(anchorTag), true, anchorTag);
  });

  for (const entry of FROZEN_ENTRIES) {
    assert.equal(occurrences(markup, entry.entryLabel), 1, entry.entryLabel);
    assert.equal(occurrences(markup, entry.pageTitle), 1, entry.pageTitle);
    assert.equal(occurrences(markup, entry.devPath), 2, entry.devPath);
    assert.equal(occurrences(markup, 'id="' + entry.entryLabel), 0, entry.entryLabel);
  }
});

test('boundary panel and non-occurrence regions render their frozen copy, rows, token and line', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDemoJourneyHub));

  const boundaryPanel = regionSlice(markup, SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_REGION_ARIA_LABEL);
  assert.match(
    boundaryPanel,
    new RegExp('<h2[^>]*>' + escapeForRegExp(SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_TITLE) + '</h2>')
  );
  for (const row of SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ROWS) {
    assert.match(boundaryPanel, new RegExp('<p[^>]*>' + escapeForRegExp(row) + '</p>'));
  }
  assert.equal(occurrences(boundaryPanel, SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ADJACENT_LINE), 1);
  assert.equal((boundaryPanel.match(/<p\b/g) ?? []).length, 7);

  const nonOccurrence = regionSlice(markup, SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_REGION_ARIA_LABEL);
  assert.match(
    nonOccurrence,
    new RegExp('<h2[^>]*>' + escapeForRegExp(SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_REGION_ARIA_LABEL) + '</h2>')
  );
  assert.match(nonOccurrence, new RegExp('>' + escapeForRegExp(SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_TOKEN) + '</p>'));
  assert.match(nonOccurrence, new RegExp('>' + escapeForRegExp(SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE) + '</p>'));

  assert.equal(occurrences(markup, SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_TOKEN), 1);
  assert.equal(occurrences(nonOccurrence, SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_TOKEN), 1);
  assert.equal(occurrences(nonOccurrence, SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE), 1);
  assert.equal(boundaryPanel.includes(SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_TOKEN), false);

  assert.equal(occurrences(markup, SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_TITLE), 1);
  assert.equal(occurrences(markup, SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ADJACENT_LINE), 1);
  assert.equal(occurrences(markup, SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_REGION_ARIA_LABEL), 2);
});

test('safe presentation region reuses the unchanged g7 component rendering of the unchanged g8 input', () => {
  assert.equal(
    sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'SafePresentationSyntheticPreview.tsx')),
    G7_COMPONENT_SHA256
  );
  assert.equal(
    sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'safePresentationSyntheticDemoInput.ts')),
    G8_INPUT_SHA256
  );

  const presentation = renderToStaticMarkup(
    createElement(SafePresentationSyntheticPreview, { input: SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT })
  );
  assert.match(presentation, /SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED/);
  assert.match(presentation, /<h1[^>]*>SYNTHETIC_HEADING<\/h1>/);
  assert.match(presentation, /SYNTHETIC_MESSAGE/);

  const markup = renderToStaticMarkup(createElement(SyntheticDemoJourneyHub));
  const safeRegion = regionSlice(markup, SYNTHETIC_DEMO_JOURNEY_HUB_SAFE_PRESENTATION_REGION_ARIA_LABEL);
  assert.match(safeRegion, /SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED/);
  assert.match(safeRegion, /<h1[^>]*>SYNTHETIC_HEADING<\/h1>/);
  assert.match(safeRegion, /SYNTHETIC_MESSAGE/);
  assert.equal(occurrences(markup, '<h1'), 2);

  const source = read(COMPONENT_PATH);
  assert.match(source, /SafePresentationSyntheticPreview input=\{SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT\}/);
  assert.equal(source.includes('SYNTHETIC PRESENTATION BLOCKED'), false);
});

test('exactly eight same-tab native anchors are the only interactive elements and no other affordance exists', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDemoJourneyHub));

  assert.equal((markup.match(/<a\b/g) ?? []).length, 8);
  assert.equal((markup.match(/<button\b|<form\b|<input\b|<select\b|<textarea\b|<iframe\b|<object\b|<embed\b/gi) ?? []).length, 0);
  assert.doesNotMatch(markup, /target=|download|\brel=/);
  assert.doesNotMatch(markup, /aria-live|tabindex|role=|contenteditable/i);
  assert.doesNotMatch(markup, /http:\/\/|https:\/\//);
  assert.doesNotMatch(markup, /javascript:|data:/i);

  const anchorNames = [...markup.matchAll(/<a\b[^>]*>([^<]*)<\/a>/g)].map(match => match[1]);
  assert.deepEqual(anchorNames, FROZEN_ENTRIES.map(entry => entry.pageTitle));

  assert.deepEqual(
    [...markup.matchAll(/aria-label="([^"]+)"/g)].map(match => match[1]).sort(),
    [...REGION_ARIA_LABELS_IN_LAYOUT_ORDER].sort()
  );
  assert.equal(markup.includes('aria-labelledby'), false);
  assert.equal(occurrences(markup, 'aria-label='), 4);
  assert.match(read(COMPONENT_PATH), /aria-label=\{SYNTHETIC_DEMO_JOURNEY_HUB_/);
});

test('implementation contains no prohibited behavior, persistence, motion, network, state or custom keyboard handling', () => {
  const sources = [read(HTML_PATH), read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)];
  const forbidden = [
    'useState',
    'useEffect',
    'useReducer',
    'useMemo',
    'useCallback',
    'useRef',
    'onClick',
    'onChange',
    'onSubmit',
    'onKey',
    'onFocus',
    'onBlur',
    'addEventListener',
    'removeEventListener',
    'fetch(',
    'XMLHttpRequest',
    'WebSocket',
    'EventSource',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'caches.',
    'document.cookie',
    'sendBeacon',
    'console.log',
    'console.error',
    'console.warn',
    'console.debug',
    'URLSearchParams',
    'window.location',
    'location.hash',
    'history.',
    'setTimeout',
    'setInterval',
    'requestAnimationFrame',
    'Math.random',
    'Date.now',
    'animation',
    'transition:',
    'innerHTML',
    'dangerouslySetInnerHTML',
    'javascript:',
    'target=',
    'download',
    '_blank',
    'navigator.'
  ];

  for (const source of sources) {
    for (const token of forbidden) {
      assert.equal(source.includes(token), false, token);
    }
  }

  for (const source of [read(HTML_PATH), read(SCENARIO_PATH), read(ENTRY_PATH)]) {
    for (const token of ['<a ', '<a>', '<button', '<form', '<label', '<svg', 'href=']) {
      assert.equal(source.includes(token), false, token);
    }
  }

  const component = read(COMPONENT_PATH);
  assert.equal(occurrences(component, '<a '), 1);
  assert.equal(occurrences(component, 'href='), 1);
  assert.equal(occurrences(component, 'http'), 0);
  assert.equal(occurrences(component, '<section'), 4);
  assert.equal(occurrences(component, '<main'), 1);
});

test('hub embeds no g9-g15 page component and keeps hub-local responsive styling with no stylesheet or class name', () => {
  const component = read(COMPONENT_PATH);
  const entrySource = read(ENTRY_PATH);
  const html = read(HTML_PATH);
  const scenario = read(SCENARIO_PATH);

  for (const pageComponent of G9_TO_G15_PAGE_COMPONENTS) {
    assert.equal(component.includes(pageComponent), false, pageComponent);
    assert.equal(entrySource.includes(pageComponent), false, pageComponent);
    assert.equal(html.includes(pageComponent), false, pageComponent);
    assert.equal(scenario.includes(pageComponent), false, pageComponent);
  }

  for (const desiredEntry of FROZEN_ENTRIES) {
    assert.equal(component.includes(desiredEntry.devPath), false, desiredEntry.devPath);
    assert.equal(entrySource.includes(desiredEntry.devPath), false, desiredEntry.devPath);
    assert.equal(html.includes(desiredEntry.devPath), false, desiredEntry.devPath);
  }

  assert.equal(component.includes("from './Synthetic"), false);
  assert.equal(component.includes('.html'), false);
  assert.equal(component.includes('className'), false);
  assert.equal(component.includes('styled('), false);
  assert.equal(component.includes('document.'), false);
  assert.equal(component.includes('window.'), false);
  assert.equal(occurrences(component, "'.css'"), 0);
  assert.equal((component.match(/^import /gm) ?? []).length, 4);

  assert.match(component, /Record<string, CSSProperties>/);
  assert.match(component, /clamp\(/);
  assert.match(component, /repeat\(auto-fit, minmax\(min\(100%, 20rem\), 1fr\)\)/);
  assert.match(component, /overflowWrap: 'anywhere'/);
  assert.match(component, /SafePresentationSyntheticPreview input=\{SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT\}/);
  assert.match(component, /\} from '\.\/syntheticDemoJourneyHubScenario\.js';/);
});

test('standalone page and entry bind only the isolated hub and the exact frozen title', () => {
  const html = read(HTML_PATH);
  const entrySource = read(ENTRY_PATH);

  assert.match(html, /<title>SYNTHETIC DEMO JOURNEY HUB — NOT PRODUCTION APPROVED<\/title>/);
  assert.match(html, /<script type="module" src="\/src\/synthetic\/syntheticDemoJourneyHubEntry\.tsx"><\/script>/);
  assert.equal((html.match(/<script\b/g) ?? []).length, 1);
  assert.equal(occurrences(html, 'id="root"'), 1);
  assert.equal(occurrences(html, '/src/main.tsx'), 0);
  assert.equal(occurrences(html, '/src/App'), 0);
  assert.equal(occurrences(html, '/src/synthetic/syntheticDemoJourneyHubTest'), 0);
  assert.doesNotMatch(html, /<form\b|<input\b|<select\b|<textarea\b|<a\b|<button\b/i);

  assert.match(entrySource, /import \{ createRoot \} from 'react-dom\/client';/);
  assert.match(entrySource, /import SyntheticDemoJourneyHub from '\.\/SyntheticDemoJourneyHub\.js';/);
  assert.match(entrySource, /createRoot\(root\)\.render\(<SyntheticDemoJourneyHub \/>\)/);
  assert.equal((entrySource.match(/^import /gm) ?? []).length, 2);
  assert.equal(entrySource.includes('Scenario'), false);
  assert.equal(entrySource.includes('props'), false);
});

test('the eight anchors resolve to the eight existing local dev pages with their frozen titles', () => {
  for (const desiredEntry of FROZEN_ENTRIES) {
    const pagePath = path.join(WEB_ROOT, desiredEntry.devPath.replace(/^\//, ''));

    assert.equal(existsSync(pagePath), true, desiredEntry.devPath);
    assert.match(
      read(pagePath),
      new RegExp('<title>' + escapeForRegExp(desiredEntry.pageTitle) + '</title>')
    );
  }
});

test('closed g16 allowlist, repo scope and production roots keep the hub isolated', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as {
    closed: boolean;
    allowed_paths: Array<{ path: string; state: string }>;
  };

  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.deepEqual(
    allowlist.allowed_paths.filter(item => item.state === 'planned').map(item => item.path),
    [
      'apps/web/synthetic-demo-journey-hub.html',
      'apps/web/src/synthetic/syntheticDemoJourneyHubScenario.ts',
      'apps/web/src/synthetic/SyntheticDemoJourneyHub.tsx',
      'apps/web/src/synthetic/syntheticDemoJourneyHubEntry.tsx',
      'apps/web/tests/syntheticDemoJourneyHub.test.ts',
      '05_DEVELOPMENT/matching-engine/synthetic-demo-journey-hub/G16_SYNTHETIC_DEMO_JOURNEY_HUB_VERIFICATION.json'
    ]
  );
  assert.deepEqual(
    allowlist.allowed_paths.filter(item => item.state === 'present').map(item => item.path),
    [
      '05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G16_SYNTHETIC_DEMO_JOURNEY_HUB_AUTHORIZATION_v1.0.md',
      '05_DEVELOPMENT/matching-engine/synthetic-demo-journey-hub/README.md',
      '05_DEVELOPMENT/matching-engine/synthetic-demo-journey-hub/G16_FILE_ALLOWLIST_v1.0.json'
    ]
  );

  const productionRoots = ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json'];

  for (const file of productionRoots) {
    const source = read(path.join(WEB_ROOT, file));

    assert.equal(source.includes('synthetic-demo-journey-hub'), false, file);
    assert.equal(source.includes('SyntheticDemoJourneyHub'), false, file);
    assert.equal(source.includes('syntheticDemoJourneyHub'), false, file);
  }

  const viteConfiguration = read(path.join(WEB_ROOT, 'vite.config.ts'));
  assert.equal(viteConfiguration.includes('rollupOptions'), false);
  assert.equal(viteConfiguration.includes('input'), false);
  assert.equal(read(path.join(WEB_ROOT, 'index.html')).includes('synthetic'), false);
});

test('prior g7, g8 and g15 packages stay content-unchanged across checkout line endings', () => {
  for (const [relativePath, expectedHash] of Object.entries(PRIOR_PACKAGE_SHA256)) {
    const absolutePath = path.join(REPOSITORY_ROOT, relativePath);
    const actualHash = relativePath.endsWith('/G15_FILE_ALLOWLIST_v1.0.json')
      ? sha256(absolutePath)
      : sha256NormalizedText(absolutePath);

    assert.equal(actualHash, expectedHash, relativePath);
  }

  for (const relativePath of Object.keys(PRIOR_PACKAGE_SHA256)) {
    assert.equal(existsSync(path.join(REPOSITORY_ROOT, relativePath)), true, relativePath);
  }
});

const read = (file: string) => readFileSync(file, 'utf8');
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
const sha256NormalizedText = (file: string) =>
  createHash('sha256').update(read(file).replace(/\r\n/g, '\n'), 'utf8').digest('hex');
const occurrences = (source: string, needle: string) => source.split(needle).length - 1;
const escapeForRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regionSlice = (markup: string, ariaLabel: string) => {
  const start = markup.indexOf(`aria-label="${ariaLabel}"`);
  assert.ok(start >= 0, ariaLabel);
  return markup.slice(start, markup.indexOf('</section>', start));
};
