import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticDealRehearsalBoard from '../src/synthetic/SyntheticDealRehearsalBoard.js';
import SafePresentationSyntheticPreview from '../src/synthetic/SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from '../src/synthetic/safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ADJACENT_LINE,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ROWS,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_TITLE,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_WARNING,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_WARNING,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CONTROLS_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_DISCLAIMER,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_DISPOSITION_GROUP_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_ROWS,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_FLOW_TOKENS_IN_ORDER,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_TOKEN,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_PAIR_WARNING,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_REHEARSAL_CHOICES,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_RESET,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_SAFE_PRESENTATION_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_SELECTION_DISCLAIMER,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_TITLE
} from '../src/synthetic/syntheticDealRehearsalBoardScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-deal-rehearsal-board.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDealRehearsalBoardScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticDealRehearsalBoard.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticDealRehearsalBoardEntry.tsx');
const ALLOWLIST_PATH = path.join(
  REPOSITORY_ROOT,
  '05_DEVELOPMENT',
  'matching-engine',
  'synthetic-deal-rehearsal-board',
  'G15_FILE_ALLOWLIST_v1.0.json'
);

const FROZEN_ALLOWLIST_SHA256 = '53addc8cb9c13a6fece1f8cc85b44cb332f86f56ccaa93d16ce3725c031651a2';
const G7_COMPONENT_SHA256 = '3cfd9f3c88ebfdd74a4f03679f6e8acf2f882d6ecfd29883eae16091e1d30e96';
const G8_INPUT_SHA256 = 'e928bbc0cb10c8995e3c4b742005f8e1fd697c782f98580f99079d9972ddea45';

const G11_TO_G14_PAGE_COMPONENTS = [
  'SyntheticDealStoryDemo',
  'SyntheticDealStoryWalkthrough',
  'SyntheticDealStoryRehearsal',
  'SyntheticTestDealFlowHarness',
  'SyntheticMatchingFlowConsole',
  'SyntheticMatchReviewWorkspace'
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
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.accessibleName,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_SAFE_PRESENTATION_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_REGION_ARIA_LABEL
];

const EXPECTED_ARIA_LABELS = [
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CONTROLS_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.accessibleName,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.ownerSide.accessibleName,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.tenantSide.accessibleName,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_DISPOSITION_GROUP_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_SAFE_PRESENTATION_REGION_ARIA_LABEL,
  ...SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES.map(node => node.accessibleName)
];

const BOARD_COPY_IN_LAYOUT_ORDER = [
  SYNTHETIC_DEAL_REHEARSAL_BOARD_TITLE,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_DISCLAIMER,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.ownerSide.line,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.tenantSide.line,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_WARNING,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_PAIR_WARNING,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_WARNING,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[0].accessibleName,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[0].lines[0],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[1].accessibleName,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[1].lines[0],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[1].lines[1],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[2].accessibleName,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[2].lines[0],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[3].accessibleName,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[3].lines[0],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[4].accessibleName,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[4].lines[0],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[5].accessibleName,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[5].lines[0],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES[5].lines[1],
  'SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED',
  'SYNTHETIC_HEADING',
  'SYNTHETIC_MESSAGE',
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_TITLE,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ROWS[0],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ROWS[1],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ROWS[2],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ROWS[3],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ROWS[4],
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ADJACENT_LINE
];

test('scenario freezes exact board copy, warnings, boundary panel rows and rehearsal controls', () => {
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_TITLE, 'SYNTHETIC DEAL REHEARSAL BOARD — NOT PRODUCTION APPROVED');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_DISCLAIMER, 'MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_WARNING, 'SEQUENCE SHOWN AT ONCE — NOT A STEPPER — NOT PROGRESSION');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_WARNING, 'CO-DISPLAY ONLY — NOT COMPARED OR MATCHED');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_PAIR_WARNING, 'FIXTURE ONLY — NOT MATCHED OR RANKED');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_LABEL, 'PRE-AUTHORED SYNTHETIC FIXTURE — NOT COMPUTED');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_SELECTION_DISCLAIMER, 'UI REHEARSAL SELECTION ONLY — NOT APPROVAL');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_CONTROLS_ARIA_LABEL, 'SYNTHETIC DEAL REHEARSAL BOARD CONTROLS');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_DISPOSITION_GROUP_ARIA_LABEL, 'HUMAN REHEARSAL DISPOSITION');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.accessibleName, 'OWNER-SIDE NEED AND TENANT-SIDE CANDIDATE');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.ownerSide.accessibleName, 'OWNER-SIDE NEED');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.ownerSide.line, 'OWNER-SIDE NEED — SYNTHETIC_FIXTURE_PARTY_A');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.tenantSide.accessibleName, 'TENANT-SIDE CANDIDATE');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.tenantSide.line, 'TENANT-SIDE CANDIDATE — SYNTHETIC_FIXTURE_PARTY_B');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_REGION_ARIA_LABEL, 'END-TO-END REHEARSAL CHAIN — SHOWN AT ONCE');
  assert.deepEqual(
    SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES.map(node => node.accessibleName),
    [
      'STAGE NODE 1 — TEST DEAL TOKEN',
      'STAGE NODE 2 — CAMPAIGN PREVIEW',
      'STAGE NODE 3 — FIXTURE PAIR',
      'STAGE NODE 4 — SAFE PRESENTATION',
      'STAGE NODE 5 — HUMAN REHEARSAL DISPOSITION',
      'STAGE NODE 6 — NON-OCCURRENCE RESULT'
    ]
  );
  assert.deepEqual(
    SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES.map(node => [...node.lines]),
    [
      ['TEST DEAL TOKEN — SYNTHETIC_TEST_DEAL_A'],
      ['CAMPAIGN PREVIEW — SYNTHETIC_CAMPAIGN_PREVIEW_A', 'PREVIEW ONLY — NOT LAUNCHED'],
      ['SYNTHETIC_FIXTURE_PARTY_A + SYNTHETIC_FIXTURE_PARTY_B', 'FIXTURE ONLY — NOT MATCHED OR RANKED'],
      ['SAFE PRESENTATION — SYNTHETIC_SAFE_PRESENTATION_A'],
      ['HUMAN REHEARSAL DISPOSITION REQUIRED'],
      [
        'SYNTHETIC_NO_DEAL_EXECUTED',
        'NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED'
      ]
    ]
  );
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_REGION_ARIA_LABEL, 'PRE-AUTHORED SYNTHETIC FIXTURE');
  assert.deepEqual(
    SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_ROWS,
    [
      'TEST DEAL TOKEN — SYNTHETIC_TEST_DEAL_A',
      'CAMPAIGN PREVIEW — SYNTHETIC_CAMPAIGN_PREVIEW_A',
      'SAFE PRESENTATION — SYNTHETIC_SAFE_PRESENTATION_A'
    ]
  );
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_SAFE_PRESENTATION_REGION_ARIA_LABEL, 'SAFE PRESENTATION');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_REGION_ARIA_LABEL, 'WHAT THIS BOARD IS NOT');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_TITLE, 'WHAT THIS BOARD IS NOT — FIXTURE COPY');
  assert.deepEqual(
    SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ROWS,
    [
      'NOT A MATCH',
      'NOT A SCORE OR CONFIDENCE',
      'NOT A QUALIFICATION OR RISK DECISION',
      'NOT A RANKING OR RECOMMENDATION',
      'NOT A CONTACT, CAMPAIGN LAUNCH, DEAL OR OUTCOME',
      'NOT PRODUCTION APPROVED'
    ]
  );
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ADJACENT_LINE, 'FIXTURE COPY — NOT A STATUS CLAIM');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_REGION_ARIA_LABEL, 'NON-OCCURRENCE RESULT');
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_TOKEN, 'SYNTHETIC_NO_DEAL_EXECUTED');
  assert.equal(
    SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE,
    'NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED'
  );
  assert.deepEqual(SYNTHETIC_DEAL_REHEARSAL_BOARD_REHEARSAL_CHOICES, ['REHEARSE INTEREST', 'REHEARSE HOLD']);
  assert.equal(SYNTHETIC_DEAL_REHEARSAL_BOARD_RESET, 'RESET');
});

test('scenario carries only the eight frozen abstract tokens and declares no new scenario token or scenario line', () => {
  const source = read(SCENARIO_PATH);
  const literals = [...source.matchAll(/'([^']*)'/g)].map(match => match[1]).join('\n');
  const tokens = [...literals.matchAll(/SYNTHETIC_[A-Z0-9_]+/g)].map(match => match[0]);

  assert.deepEqual([...new Set(tokens)].sort(), FROZEN_ABSTRACT_TOKENS);
  assert.deepEqual([...SYNTHETIC_DEAL_REHEARSAL_BOARD_FLOW_TOKENS_IN_ORDER].sort(), FROZEN_ABSTRACT_TOKENS);
  assert.doesNotMatch(source, /SCENARIO/);
});

test('initial render shows all six regions at once in fixed order with no stepper or progression affordance', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDealRehearsalBoard));

  assert.match(markup, /<h1[^>]*>SYNTHETIC DEAL REHEARSAL BOARD — NOT PRODUCTION APPROVED<\/h1>/);
  assert.equal(occurrences(markup, SYNTHETIC_DEAL_REHEARSAL_BOARD_DISCLAIMER), 1);

  const regionPositions = REGION_ARIA_LABELS_IN_LAYOUT_ORDER.map(label => markup.indexOf(`aria-label="${label}"`));
  regionPositions.forEach((position, index) => {
    assert.ok(position >= 0, REGION_ARIA_LABELS_IN_LAYOUT_ORDER[index]);
  });
  for (let index = 1; index < regionPositions.length; index += 1) {
    assert.ok(
      regionPositions[index] > regionPositions[index - 1],
      REGION_ARIA_LABELS_IN_LAYOUT_ORDER[index]
    );
  }

  const nodeNames = [...markup.matchAll(/<section aria-label="(STAGE NODE [^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(nodeNames, SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES.map(node => node.accessibleName));

  const copyPositions = BOARD_COPY_IN_LAYOUT_ORDER.map(copy => markup.indexOf(copy));
  copyPositions.forEach((position, index) => assert.ok(position >= 0, BOARD_COPY_IN_LAYOUT_ORDER[index]));
  for (let index = 1; index < copyPositions.length; index += 1) {
    assert.ok(copyPositions[index] > copyPositions[index - 1], BOARD_COPY_IN_LAYOUT_ORDER[index]);
  }

  assert.doesNotMatch(markup, />\s*(NEXT|BACK)\s*</);
  assert.doesNotMatch(markup, /STEP \d+ OF \d+/);
  assert.doesNotMatch(markup, /<form\b|<input\b|<select\b|<textarea\b|<a\b/i);
});

test('initial render carries both co-display warnings, the chain warning, fixture rows, boundary panel and the non-occurrence result', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDealRehearsalBoard));

  assert.equal(occurrences(markup, SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_WARNING), 1);
  assert.equal(occurrences(markup, SYNTHETIC_DEAL_REHEARSAL_BOARD_PAIR_WARNING), 2);
  assert.equal(occurrences(markup, SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_WARNING), 1);
  assert.equal(occurrences(markup, SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_LABEL), 6);

  const fixtureRegion = regionSlice(markup, SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_REGION_ARIA_LABEL);
  assert.equal(occurrences(fixtureRegion, SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_LABEL), 3);
  for (const row of SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_ROWS) {
    assert.match(
      fixtureRegion,
      new RegExp(
        '<p[^>]*>' + escapeForRegExp(row) + '</p><p[^>]*>'
        + escapeForRegExp(SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_LABEL) + '</p>'
      )
    );
  }

  assert.equal(occurrences(markup, SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_TOKEN), 2);
  assert.equal(occurrences(markup, SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE), 2);

  const boundaryPanel = regionSlice(markup, SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_REGION_ARIA_LABEL);
  assert.match(
    boundaryPanel,
    new RegExp('<h2[^>]*>' + escapeForRegExp(SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_TITLE) + '</h2>')
  );
  for (const row of SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ROWS) {
    assert.match(boundaryPanel, new RegExp('<p[^>]*>' + escapeForRegExp(row) + '</p>'));
  }
  assert.equal(occurrences(boundaryPanel, SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ADJACENT_LINE), 1);

  assert.match(markup, /SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED/);
  assert.match(markup, /SYNTHETIC_HEADING/);
  assert.match(markup, /SYNTHETIC_MESSAGE/);
  assert.match(read(COMPONENT_PATH), /SafePresentationSyntheticPreview input=\{SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT\}/);
});

test('native controls, accessible names and the single live region match the frozen contract', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticDealRehearsalBoard));

  assert.match(markup, /<nav[^>]+aria-label="SYNTHETIC DEAL REHEARSAL BOARD CONTROLS"/);
  assert.match(markup, /role="group" aria-label="HUMAN REHEARSAL DISPOSITION"/);
  assert.equal(occurrences(markup, 'aria-live="polite" aria-atomic="true"'), 1);
  assert.equal((markup.match(/<button\b/g) ?? []).length, 3);
  assert.match(
    markup,
    /<button type="button"[^>]*>REHEARSE INTEREST<\/button><button type="button"[^>]*>REHEARSE HOLD<\/button><\/div><button type="button"[^>]*>RESET<\/button>/
  );
  assert.deepEqual(
    [...markup.matchAll(/aria-label="([^"]+)"/g)].map(match => match[1]).sort(),
    [...EXPECTED_ARIA_LABELS].sort()
  );
  assert.equal(occurrences(markup, SYNTHETIC_DEAL_REHEARSAL_BOARD_SELECTION_DISCLAIMER), 0);
});

test('component keeps only transient in-memory rehearsal selection with reset and never a stepper', () => {
  const source = read(COMPONENT_PATH);

  assert.match(source, /useState<SyntheticDealRehearsalBoardRehearsalChoice \| null>\(null\)/);
  assert.match(source, /onClick=\{\(\) => setSelection\(choice\)\}/);
  assert.match(source, /onClick=\{\(\) => setSelection\(null\)\}/);
  assert.match(source, /selection === null \? null :/);
  assert.match(source, /aria-live="polite" aria-atomic="true"/);
  assert.doesNotMatch(source, /\b(NEXT|BACK|STEPPER|SETSTEP|CURRENT_PANEL|PROGRESSION)\b/i);
  assert.doesNotMatch(source, /tabIndex|outline:\s*['"]none|onKey/);
});

test('standalone page binds only the isolated entry and the exact frozen title', () => {
  const html = read(HTML_PATH);

  assert.match(html, /<title>SYNTHETIC DEAL REHEARSAL BOARD — NOT PRODUCTION APPROVED<\/title>/);
  assert.match(html, /<script type="module" src="\/src\/synthetic\/syntheticDealRehearsalBoardEntry\.tsx"><\/script>/);
  assert.equal((html.match(/<script\b/g) ?? []).length, 1);
  assert.equal(occurrences(html, '/src/main.tsx'), 0);
  assert.equal(occurrences(html, '/src/App'), 0);
  assert.doesNotMatch(html, /<form\b|<input\b|<select\b|<textarea\b|<a\b/i);
});

test('board embeds no g11-g14 page component and reuses the unchanged g7 component with the unchanged g8 input', () => {
  const component = read(COMPONENT_PATH);
  const entry = read(ENTRY_PATH);
  const html = read(HTML_PATH);

  for (const pageComponent of G11_TO_G14_PAGE_COMPONENTS) {
    assert.equal(component.includes(pageComponent), false, pageComponent);
    assert.equal(entry.includes(pageComponent), false, pageComponent);
    assert.equal(html.includes(pageComponent), false, pageComponent);
  }

  assert.equal(sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'SafePresentationSyntheticPreview.tsx')), G7_COMPONENT_SHA256);
  assert.equal(sha256(path.join(WEB_ROOT, 'src', 'synthetic', 'safePresentationSyntheticDemoInput.ts')), G8_INPUT_SHA256);

  const presentation = renderToStaticMarkup(
    createElement(SafePresentationSyntheticPreview, { input: SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT })
  );
  assert.match(presentation, /SYNTHETIC REFERENCE — NOT PRODUCTION APPROVED/);
  assert.match(presentation, /<h1[^>]*>SYNTHETIC_HEADING<\/h1>/);
  assert.match(presentation, /SYNTHETIC_MESSAGE/);
});

test('implementation contains no prohibited behavior, persistence, motion, network or custom keyboard handling', () => {
  const sources = [read(HTML_PATH), read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)];
  const forbidden = [
    'onKey',
    'addEventListener',
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
    'location.hash',
    'setTimeout',
    'setInterval',
    'requestAnimationFrame',
    'Math.random',
    'animation',
    'transition:',
    '<form',
    '<input',
    '<select',
    '<textarea',
    '<a ',
    'tabIndex'
  ];

  for (const source of sources) {
    for (const token of forbidden) {
      assert.equal(source.includes(token), false, token);
    }
  }
});

test('closed g15 allowlist, repo scope and production roots keep the board isolated', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as {
    allowed_paths: Array<{ path: string; state: string }>;
  };

  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.deepEqual(
    allowlist.allowed_paths.filter(item => item.state === 'planned').map(item => item.path),
    [
      'apps/web/synthetic-deal-rehearsal-board.html',
      'apps/web/src/synthetic/syntheticDealRehearsalBoardScenario.ts',
      'apps/web/src/synthetic/SyntheticDealRehearsalBoard.tsx',
      'apps/web/src/synthetic/syntheticDealRehearsalBoardEntry.tsx',
      'apps/web/tests/syntheticDealRehearsalBoard.test.ts',
      '05_DEVELOPMENT/matching-engine/synthetic-deal-rehearsal-board/G15_DEAL_REHEARSAL_BOARD_VERIFICATION.json'
    ]
  );
  assert.deepEqual(
    allowlist.allowed_paths.filter(item => item.state === 'present').map(item => item.path),
    [
      '05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G15_SYNTHETIC_DEAL_REHEARSAL_BOARD_AUTHORIZATION_v1.0.md',
      '05_DEVELOPMENT/matching-engine/synthetic-deal-rehearsal-board/README.md',
      '05_DEVELOPMENT/matching-engine/synthetic-deal-rehearsal-board/G15_FILE_ALLOWLIST_v1.0.json'
    ]
  );

  for (const file of ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json']) {
    const source = read(path.join(WEB_ROOT, file));
    assert.equal(source.includes('synthetic-deal-rehearsal-board'), false, file);
    assert.equal(source.includes('SyntheticDealRehearsalBoard'), false, file);
  }
});

const read = (file: string) => readFileSync(file, 'utf8');
const sha256 = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex');
const occurrences = (source: string, needle: string) => source.split(needle).length - 1;
const escapeForRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regionSlice = (markup: string, ariaLabel: string) => {
  const start = markup.indexOf(`aria-label="${ariaLabel}"`);
  assert.ok(start >= 0, ariaLabel);
  return markup.slice(start, markup.indexOf('</section>', start));
};

