import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SyntheticMatchingReadinessTrace from '../src/synthetic/SyntheticMatchingReadinessTrace.js';
import {
  SYNTHETIC_MATCHING_READINESS_TRACE_BOUNDARY_ADJACENT_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_BOUNDARY_ROWS,
  SYNTHETIC_MATCHING_READINESS_TRACE_DESIGN_TIME_REASONS,
  SYNTHETIC_MATCHING_READINESS_TRACE_DISCLAIMER,
  SYNTHETIC_MATCHING_READINESS_TRACE_FLOW_TOKENS_IN_ORDER,
  SYNTHETIC_MATCHING_READINESS_TRACE_GATE_ADJACENT_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_GATE_ROWS,
  SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_TOKEN,
  SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_LABELS,
  SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_REASON,
  SYNTHETIC_MATCHING_READINESS_TRACE_REASON_ADJACENT_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_REGIONS_IN_ORDER,
  SYNTHETIC_MATCHING_READINESS_TRACE_REGISTRY_COPY_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_SCOPE_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_TITLE
} from '../src/synthetic/syntheticMatchingReadinessTraceScenario.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.resolve(WEB_ROOT, '..', '..');
const HTML_PATH = path.join(WEB_ROOT, 'synthetic-matching-readiness-trace.html');
const SCENARIO_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticMatchingReadinessTraceScenario.ts');
const COMPONENT_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'SyntheticMatchingReadinessTrace.tsx');
const ENTRY_PATH = path.join(WEB_ROOT, 'src', 'synthetic', 'syntheticMatchingReadinessTraceEntry.tsx');
const ALLOWLIST_PATH = path.join(
  REPOSITORY_ROOT,
  '05_DEVELOPMENT',
  'matching-engine',
  'synthetic-matching-readiness-trace',
  'G17_FILE_ALLOWLIST_v1.0.json'
);

const FROZEN_ALLOWLIST_SHA256 = '06c8221de4691b7b78371bbc96ec8cc693cf6e266ab28f928ed11433697d49eb';

// The allowlist freezes exactly one synthetic data token for this package.
const FROZEN_DATA_VOCABULARY = ['SYNTHETIC_NO_MATCH_COMPUTED'];

// These three identifiers name governance gates in the authorization record. They are not
// scenario data tokens; they are displayed verbatim in the third region.
const FROZEN_GOVERNANCE_GATE_IDENTIFIERS = [
  'IMPLEMENTATION_READINESS_GATE',
  'SYNTHETIC_ACCEPTANCE_GATE',
  'PRODUCTION_LAUNCH_GATE'
];

const FORBIDDEN_STATUS_WORDS = [
  'PASS',
  'FAIL',
  'INELIGIBLE',
  'NEEDS_VERIFICATION',
  'HUMAN_REVIEW_REQUIRED',
  'QUALIFIED_HYPOTHESIS',
  'REJECTED_BY_MATCHING',
  'STALE'
];

const PRIOR_PAGE_COMPONENTS = [
  'SafePresentationSyntheticPreview',
  'safePresentationSyntheticDemoInput',
  'SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT',
  'SyntheticDealStoryDemo',
  'SyntheticDealStoryWalkthrough',
  'SyntheticDealStoryRehearsal',
  'SyntheticTestDealFlowHarness',
  'SyntheticMatchingFlowConsole',
  'SyntheticMatchReviewWorkspace',
  'SyntheticDealRehearsalBoard',
  'SyntheticDemoJourneyHub'
];

const READINESS_LABELS_IN_ORDER = [
  {
    label: 'READY_FOR_DRAFT',
    copy: 'DESIGN-TIME LABEL — NOT RUNTIME value_state, NOT AN APPROVED API/EVENT ENUM'
  },
  {
    label: 'READY_AS_CANDIDATE_ONLY',
    copy: 'CANDIDATE-ONLY — NO ACTIVATION, NO SCORING, NO ELIGIBILITY USE'
  },
  {
    label: 'BLOCKED_PENDING_DECISION',
    copy: 'BLOCKED RULE — NO COMPARISON RUN, NO PASS, NO FAIL, NO INELIGIBLE'
  },
  {
    label: 'EXCLUDED_FROM_V0_1',
    copy: 'EXCLUDED FROM v0.1 SCOPE — NOT ELIMINATION, NOT A NEGATIVE FACT'
  }
];

const DESIGN_TIME_REASONS_IN_ORDER = [
  'NO APPROVED ACTIVE RUNTIME COMPARISON EXECUTION',
  'NO APPROVED WEIGHTS OR THRESHOLDS',
  'NO APPROVED FEATURE VALUE CONTRACT',
  'NO APPROVED RUNTIME CARRIER OR DATA CONTRACT',
  'ALL THREE GOVERNANCE GATES REMAIN BLOCKED'
];

const GATE_ROWS_IN_ORDER = [
  'IMPLEMENTATION_READINESS_GATE — BLOCKED',
  'SYNTHETIC_ACCEPTANCE_GATE — BLOCKED',
  'PRODUCTION_LAUNCH_GATE — BLOCKED'
];

const BOUNDARY_ROWS_IN_ORDER = [
  'NOT A MATCH',
  'NOT A COMPARISON OR COMPATIBILITY RESULT',
  'NOT A SCORE OR CONFIDENCE',
  'NOT A QUALIFICATION, RISK OR ELIGIBILITY DECISION',
  'NOT A RANKING, RECOMMENDATION OR ROUTING',
  'NOT AN APPROVAL OR READINESS EVIDENCE',
  'NOT A RUNTIME TRACE, LOG, DIAGNOSTIC OR TELEMETRY',
  'NOT PRODUCTION APPROVED'
];

// Canonical LF-normalized SHA-256 for every prior G7-G16 text file this package could disturb.
const PRIOR_TEXT_SHA256: Record<string, string> = {
  'apps/web/src/synthetic/SafePresentationSyntheticPreview.tsx':
    '3cfd9f3c88ebfdd74a4f03679f6e8acf2f882d6ecfd29883eae16091e1d30e96',
  'apps/web/src/synthetic/safePresentationSyntheticDemoInput.ts':
    'e928bbc0cb10c8995e3c4b742005f8e1fd697c782f98580f99079d9972ddea45',
  'apps/web/synthetic-match-review-workspace.html':
    'f3c976ce0efe7b75d5bae0bd43a9fe69c5289f9ec9d8fefaa1a43fac7171e5a6',
  'apps/web/src/synthetic/syntheticMatchReviewWorkspaceScenario.ts':
    '4315d791ab828adbc3673b4bb707075c350c6fba26003a0fa2f0296cfd571958',
  'apps/web/src/synthetic/SyntheticMatchReviewWorkspace.tsx':
    'cd1529e58cca85bf2c5c45c5057c134b97c020a1a24045c23115aa09d0c0977c',
  'apps/web/src/synthetic/syntheticMatchReviewWorkspaceEntry.tsx':
    '3171c0085abfa1e8b31f7193219bea70f0ecf2c9cf37312966b4451583eb42d8',
  'apps/web/tests/syntheticMatchReviewWorkspace.test.ts':
    'db321a495afff115b4534081c73d18e08f9581637422a891cb972780c0c87d18',
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
  'apps/web/synthetic-demo-journey-hub.html':
    '6cf9e1243d683ca56ea81987de9bbcf5335c4816b9e0433d7bd46be37eb7eeb5',
  'apps/web/src/synthetic/syntheticDemoJourneyHubScenario.ts':
    'e84f53d4b74d5727627ba3ad49e7590ae575e61bbd6b6b44820cc344c34fc6c0',
  'apps/web/src/synthetic/SyntheticDemoJourneyHub.tsx':
    '8522aad436edac6a402074265d33dc4063cf635ce195dd4d07396636644a8bfa',
  'apps/web/src/synthetic/syntheticDemoJourneyHubEntry.tsx':
    '3fc559a1b07459ed0555e3c5bfd2d6a3ea4477b3474c98485617992bc4d373f8',
  'apps/web/tests/syntheticDemoJourneyHub.test.ts':
    '9d2fda3eb8e5db0b31e1d3b8db9229fd4422f84d925d135a154562eee647bc87'
};

// Exact-byte SHA-256 of the LF-only prior allowlists.
const PRIOR_ALLOWLIST_SHA256: Record<string, string> = {
  '05_DEVELOPMENT/matching-engine/synthetic-match-review-workspace/G14_FILE_ALLOWLIST_v1.0.json':
    '9c3bafee5592b7cb37434350ac9477d50a860f59330039aa4b4fff0d492069aa',
  '05_DEVELOPMENT/matching-engine/synthetic-deal-rehearsal-board/G15_FILE_ALLOWLIST_v1.0.json':
    '53addc8cb9c13a6fece1f8cc85b44cb332f86f56ccaa93d16ce3725c031651a2',
  '05_DEVELOPMENT/matching-engine/synthetic-demo-journey-hub/G16_FILE_ALLOWLIST_v1.0.json':
    'f7f552ce0487e9a961ee52b83f2ef8c78f4bcc3067add8a239f80fab6ec82a74'
};

test('scenario freezes the exact title, always-visible lines and the five all-at-once regions in order', () => {
  assert.equal(
    SYNTHETIC_MATCHING_READINESS_TRACE_TITLE,
    'SYNTHETIC MATCHING READINESS TRACE — NOT PRODUCTION APPROVED'
  );
  assert.equal(SYNTHETIC_MATCHING_READINESS_TRACE_DISCLAIMER, 'MANUAL DEV-ONLY TRACE — NO MATCH COMPUTED');
  assert.equal(
    SYNTHETIC_MATCHING_READINESS_TRACE_SCOPE_LINE,
    'DESIGN-TIME GOVERNANCE READINESS LABELS ONLY — NOT RUNTIME STATE, NOT AN APPROVAL, NOT A TRACE OF ANY EXECUTION'
  );
  assert.deepEqual(SYNTHETIC_MATCHING_READINESS_TRACE_REGIONS_IN_ORDER, [
    'READINESS LABEL SET — DESIGN-TIME ONLY',
    'WHY NO MATCH CAN BE COMPUTED — DESIGN-TIME REASONS',
    'GOVERNANCE GATE STATE — FROZEN RECORD COPY',
    'WHAT THIS TRACE IS NOT — FIXTURE COPY',
    'NON-OCCURRENCE RESULT'
  ]);
  assert.equal(
    SYNTHETIC_MATCHING_READINESS_TRACE_REGISTRY_COPY_LINE,
    'DESIGN-TIME REGISTRY COPY — NOT RUNTIME STATE'
  );
});

test('scenario freezes four readiness labels, one reason sub-type and never a fifth status', () => {
  assert.deepEqual(SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_LABELS, READINESS_LABELS_IN_ORDER);
  assert.deepEqual(
    SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_LABELS.map(item => item.label),
    ['READY_FOR_DRAFT', 'READY_AS_CANDIDATE_ONLY', 'BLOCKED_PENDING_DECISION', 'EXCLUDED_FROM_V0_1']
  );
  assert.equal(
    SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_REASON.value,
    'BLOCKED_PENDING_COMPATIBILITY_TABLE'
  );
  assert.equal(
    SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_REASON.copy,
    'readiness_reason SUBTYPE — NOT A FIFTH STATUS'
  );
  // The compatibility-table value is a reason sub-type and never a top-level readiness status.
  const topLevelLabels: readonly string[] = SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_LABELS.map(
    item => item.label
  );
  assert.equal(topLevelLabels.includes(SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_REASON.value), false);
  assert.equal(SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_REASON.copy.includes('FIFTH STATUS'), true);
  assert.equal(
    SYNTHETIC_MATCHING_READINESS_TRACE_REASON_ADJACENT_LINE,
    'PRE-AUTHORED DESIGN-TIME REASON — NOT COMPUTED'
  );
});

test('scenario freezes five design-time reasons, three BLOCKED gate rows and eight boundary rows', () => {
  assert.deepEqual(SYNTHETIC_MATCHING_READINESS_TRACE_DESIGN_TIME_REASONS, DESIGN_TIME_REASONS_IN_ORDER);
  assert.equal(
    SYNTHETIC_MATCHING_READINESS_TRACE_GATE_ADJACENT_LINE,
    'FROZEN AUTHORIZATION-RECORD COPY — THIS PAGE CHANGES NO GATE AND ADVANCES NO GATE'
  );
  assert.deepEqual(SYNTHETIC_MATCHING_READINESS_TRACE_GATE_ROWS, GATE_ROWS_IN_ORDER);
  assert.deepEqual(
    SYNTHETIC_MATCHING_READINESS_TRACE_GATE_ROWS.map(row => row.slice(0, row.indexOf(' — '))),
    FROZEN_GOVERNANCE_GATE_IDENTIFIERS
  );
  for (const row of SYNTHETIC_MATCHING_READINESS_TRACE_GATE_ROWS) {
    assert.ok(row.endsWith(' — BLOCKED'), row);
  }
  assert.deepEqual(SYNTHETIC_MATCHING_READINESS_TRACE_BOUNDARY_ROWS, BOUNDARY_ROWS_IN_ORDER);
  assert.equal(
    SYNTHETIC_MATCHING_READINESS_TRACE_BOUNDARY_ADJACENT_LINE,
    'FIXTURE COPY — NOT A STATUS CLAIM'
  );
  assert.equal(SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_TOKEN, 'SYNTHETIC_NO_MATCH_COMPUTED');
  assert.equal(
    SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_LINE,
    'NO MATCH COMPUTED — NO MATCH, COMPARISON, COMPATIBILITY, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, ELIGIBILITY, RECOMMENDATION OR ROUTING OCCURRED'
  );
});

test('scenario carries exactly the frozen non-occurrence data token and no new scenario token', () => {
  const source = read(SCENARIO_PATH);
  const stringLiterals = [...source.matchAll(/'([^']*)'/g)].map(match => match[1]).join('\n');
  const syntheticTokens = [
    ...new Set([...stringLiterals.matchAll(/SYNTHETIC_[A-Z0-9_]+/g)].map(match => match[0]))
  ].sort();

  assert.deepEqual(syntheticTokens, FROZEN_DATA_VOCABULARY);
  assert.deepEqual([...SYNTHETIC_MATCHING_READINESS_TRACE_FLOW_TOKENS_IN_ORDER], FROZEN_DATA_VOCABULARY);
  // The one identifier that begins with the synthetic prefix is composed from two adjacent
  // literals, so that single literal scan above still finds only the frozen data token.
  assert.equal(source.includes('SYNTHETIC_ACCEPTANCE_GATE'), false);
  assert.equal(source.includes("'SYNTHETIC' + '_ACCEPTANCE_GATE'"), true);
  // The frozen token appears in this module only as literal copy: the constant and the list.
  assert.equal([...source.matchAll(/'SYNTHETIC_NO_MATCH_COMPUTED'/g)].length, 2);
  assert.equal(source.includes('SCENARIO'), false);
  assert.doesNotMatch(source, /(?:weight|threshold|ttl|aggregate)\s*[:=]\s*\d/i);
  assert.doesNotMatch(source, /Date\.|Math\.|JSON\.parse|process\.env/);
  assert.doesNotMatch(source, /export default/);
});

test('initial render shows all five regions at once in fixed order with the terminal region last', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMatchingReadinessTrace));
  const regions = [...SYNTHETIC_MATCHING_READINESS_TRACE_REGIONS_IN_ORDER];

  assert.equal(occurrences(markup, '<section'), 5);
  assert.equal(occurrences(markup, 'aria-label="'), 5);
  assert.deepEqual([...markup.matchAll(/aria-label="([^"]+)"/g)].map(match => match[1]), regions);

  const positions = regions.map(region => markup.indexOf(`aria-label="${region}"`));
  for (const position of positions) {
    assert.ok(position >= 0);
  }
  for (let index = 1; index < positions.length; index += 1) {
    assert.ok(positions[index] > positions[index - 1], regions[index]);
  }

  // The terminal region is rendered beyond every earlier region and nothing follows it.
  const terminalMarkup = markup.slice(positions[4]);
  assert.equal(occurrences(terminalMarkup, '</section>'), 1);
  assert.equal(occurrences(terminalMarkup, '<section'), 0);
  assert.ok(
    terminalMarkup
      .trimEnd()
      .endsWith(`${SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_LINE}</p></section></div></main>`)
  );
  assert.equal(occurrences(terminalMarkup, SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_TOKEN), 1);
  for (const earlierRegion of regions.slice(0, 4)) {
    assert.equal(occurrences(terminalMarkup, earlierRegion), 0, earlierRegion);
  }
});

test('readiness region renders the four frozen labels, the reason sub-type and the registry copy in order', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMatchingReadinessTrace));
  const readinessRegion = regionSlice(markup, SYNTHETIC_MATCHING_READINESS_TRACE_REGIONS_IN_ORDER[0]);

  assert.equal(occurrences(markup, SYNTHETIC_MATCHING_READINESS_TRACE_TITLE), 1);
  assert.equal(occurrences(markup, SYNTHETIC_MATCHING_READINESS_TRACE_DISCLAIMER), 1);
  assert.equal(occurrences(markup, SYNTHETIC_MATCHING_READINESS_TRACE_SCOPE_LINE), 1);

  for (const item of READINESS_LABELS_IN_ORDER) {
    assert.equal(occurrences(readinessRegion, item.label), 1, item.label);
    assert.equal(occurrences(readinessRegion, item.copy), 1, item.copy);
  }
  assert.equal(occurrences(readinessRegion, SYNTHETIC_MATCHING_READINESS_TRACE_REGISTRY_COPY_LINE), 1);
  assert.deepEqual(
    [...readinessRegion.matchAll(/<p[^>]*>([A-Z0-9_]+)<\/p>/g)].map(match => match[1]),
    [
      'READY_FOR_DRAFT',
      'READY_AS_CANDIDATE_ONLY',
      'BLOCKED_PENDING_DECISION',
      'EXCLUDED_FROM_V0_1',
      'BLOCKED_PENDING_COMPATIBILITY_TABLE'
    ]
  );
});

test('reason, gate, boundary and terminal regions render their frozen copy exactly once each', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMatchingReadinessTrace));
  const reasonsRegion = regionSlice(markup, SYNTHETIC_MATCHING_READINESS_TRACE_REGIONS_IN_ORDER[1]);
  const gateRegion = regionSlice(markup, SYNTHETIC_MATCHING_READINESS_TRACE_REGIONS_IN_ORDER[2]);
  const boundaryRegion = regionSlice(markup, SYNTHETIC_MATCHING_READINESS_TRACE_REGIONS_IN_ORDER[3]);
  const terminalRegion = regionSlice(markup, SYNTHETIC_MATCHING_READINESS_TRACE_REGIONS_IN_ORDER[4]);

  for (const reason of DESIGN_TIME_REASONS_IN_ORDER) {
    assert.equal(occurrences(reasonsRegion, reason), 1, reason);
  }
  assert.equal(occurrences(reasonsRegion, SYNTHETIC_MATCHING_READINESS_TRACE_REASON_ADJACENT_LINE), 5);
  assert.deepEqual(
    [...reasonsRegion.matchAll(/<p[^>]*>([^<]+)<\/p>/g)]
      .map(match => match[1])
      .filter((_copy, index) => index % 2 === 0),
    DESIGN_TIME_REASONS_IN_ORDER
  );

  assert.deepEqual(
    [...gateRegion.matchAll(/<p[^>]*>([^<]+)<\/p>/g)].map(match => match[1]),
    [...GATE_ROWS_IN_ORDER, SYNTHETIC_MATCHING_READINESS_TRACE_GATE_ADJACENT_LINE]
  );

  assert.deepEqual(
    [...boundaryRegion.matchAll(/<p[^>]*>([^<]+)<\/p>/g)].map(match => match[1]),
    [...BOUNDARY_ROWS_IN_ORDER, SYNTHETIC_MATCHING_READINESS_TRACE_BOUNDARY_ADJACENT_LINE]
  );

  assert.deepEqual(
    [...terminalRegion.matchAll(/<p[^>]*>([^<]+)<\/p>/g)].map(match => match[1]),
    [
      SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_TOKEN,
      SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_LINE
    ]
  );
});

test('rendered copy keeps design-time readiness distinct from runtime state and any verdict', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMatchingReadinessTrace));

  assert.equal(occurrences(markup, 'value_state'), 1);
  const valueStateIndex = markup.indexOf('value_state');
  assert.ok(markup.slice(valueStateIndex - 40, valueStateIndex).includes('NOT RUNTIME'));
  for (const token of [
    'evidence_status',
    'processing_eligibility',
    'lawful_basis_status',
    'registry_readiness',
    'expected_output',
    'observed_output',
    'value_state_history'
  ]) {
    assert.equal(occurrences(markup, token), 0, token);
  }
  for (const word of FORBIDDEN_STATUS_WORDS) {
    assert.doesNotMatch(markup, new RegExp(`>\\s*${word}\\s*<`), word);
  }
  assert.equal(occurrences(markup, SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_REASON.copy), 1);
  // No visible text carries a percentage, a weight, a threshold, a ttl or an aggregate value;
  // those words and percentages occur only inside responsive CSS declarations, so the
  // attribute-free visible text form is what gets scanned.
  const visibleText = markup.replace(/<[^>]*>/g, ' ');
  assert.doesNotMatch(visibleText, /%/);
  assert.doesNotMatch(visibleText, /(?:weight|threshold|ttl|aggregate)\s*[:=]\s*\d/i);
  assert.doesNotMatch(visibleText, /SCENARIO/);
});

test('implementation carries no interaction, state, handler, live region, network or storage behaviour', () => {
  const sources = [read(HTML_PATH), read(SCENARIO_PATH), read(COMPONENT_PATH), read(ENTRY_PATH)];
  const forbiddenTokens = [
    'onClick',
    'onChange',
    'onInput',
    'onSubmit',
    'onKeyDown',
    'onKeyUp',
    'onBlur',
    'onFocus',
    'onPointer',
    'onMouse',
    'onTouch',
    'onScroll',
    'onLoad',
    'onError',
    'addEventListener',
    'removeEventListener',
    'dispatchEvent',
    'useState',
    'useEffect',
    'useReducer',
    'useRef',
    'useLayoutEffect',
    'useContext',
    'useSyncExternalStore',
    'aria-live',
    'role="button"',
    'contentEditable',
    'dangerouslySetInnerHTML',
    'fetch(',
    'XMLHttpRequest',
    'WebSocket',
    'EventSource',
    'sendBeacon',
    'localStorage',
    'sessionStorage',
    'indexedDB',
    'caches.',
    'document.cookie',
    'console.',
    'window.',
    'history.pushState',
    'location.hash',
    'URLSearchParams',
    'setTimeout',
    'setInterval',
    'setImmediate',
    'requestAnimationFrame',
    'Math.random',
    'getRandomValues',
    'transition:',
    'animation',
    'keyframes'
  ];
  for (const source of sources) {
    for (const token of forbiddenTokens) {
      assert.equal(source.includes(token), false, token);
    }
  }
  assert.doesNotMatch(read(HTML_PATH), /\son[a-z]+\s*=/i);
});

test('rendered page is one static document with one h1, five labelled regions, lists and zero controls', () => {
  const markup = renderToStaticMarkup(createElement(SyntheticMatchingReadinessTrace));

  assert.equal(occurrences(markup, '<main'), 1);
  assert.equal(occurrences(markup, '<h1'), 1);
  assert.equal(occurrences(markup, '<h2'), 5);
  assert.equal(occurrences(markup, '<ul'), 3);
  assert.equal(occurrences(markup, '<li'), 12);
  assert.equal(occurrences(markup, '<section'), 5);
  assert.equal(occurrences(markup, '</section>'), 5);
  assert.equal(occurrences(markup, '</main>'), 1);
  assert.equal(occurrences(markup, 'aria-label="'), 5);

  assert.equal(occurrences(markup, '<button'), 0);
  assert.equal(occurrences(markup, '<a '), 0);
  assert.equal(occurrences(markup, '<a>'), 0);
  assert.equal(occurrences(markup, '<form'), 0);
  assert.equal(occurrences(markup, '<input'), 0);
  assert.equal(occurrences(markup, '<select'), 0);
  assert.equal(occurrences(markup, '<textarea'), 0);
  assert.equal(occurrences(markup, 'aria-live'), 0);
  assert.equal(occurrences(markup, 'tabindex'), 0);
  assert.equal(occurrences(markup, 'contenteditable'), 0);
  assert.equal(occurrences(markup, 'role='), 0);
  assert.doesNotMatch(markup, /\son[a-z]+\s*=/i);
});

test('standalone page declares exactly one module script that boots only this trace entry', () => {
  const html = read(HTML_PATH);

  assert.match(html, /^<!doctype html>/);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<meta charset="UTF-8" \/>/);
  assert.equal(occurrences(html, '<script'), 1);
  assert.match(
    html,
    /<script type="module" src="\/src\/synthetic\/syntheticMatchingReadinessTraceEntry\.tsx"><\/script>/
  );
  assert.equal(occurrences(html, '<div id="root"></div>'), 1);
  assert.match(html, /<title>SYNTHETIC MATCHING READINESS TRACE — NOT PRODUCTION APPROVED<\/title>/);
  assert.equal(occurrences(html, '<link'), 0);
  assert.equal(html.includes('src/App'), false);
  assert.equal(html.includes('src/main'), false);
  assert.equal(html.includes('react'), false);
});

test('trace imports no prior g7-g16 component and links to no sibling page', () => {
  const component = read(COMPONENT_PATH);
  const entry = read(ENTRY_PATH);
  const html = read(HTML_PATH);
  const scenario = read(SCENARIO_PATH);

  for (const prior of PRIOR_PAGE_COMPONENTS) {
    assert.equal(component.includes(prior), false, prior);
    assert.equal(entry.includes(prior), false, prior);
    assert.equal(html.includes(prior), false, prior);
    assert.equal(scenario.includes(prior), false, prior);
  }

  assert.equal(occurrences(component, "from './"), 1);
  assert.match(component, /from '\.\/syntheticMatchingReadinessTraceScenario\.js'/);
  assert.equal(occurrences(component, "from 'react-dom"), 0);
  assert.equal(occurrences(entry, "from './"), 1);
  assert.match(entry, /from '\.\/SyntheticMatchingReadinessTrace\.js'/);
  assert.equal(occurrences(entry, "from 'react-dom/client'"), 1);
  assert.equal(occurrences(html, 'synthetic-matching-readiness-trace'), 0);
  assert.equal(component.includes('href='), false);

  for (const siblingPage of [
    'synthetic-demo-journey-hub',
    'synthetic-deal-rehearsal-board',
    'synthetic-match-review-workspace'
  ]) {
    assert.equal(html.includes(siblingPage), false, siblingPage);
    assert.equal(component.includes(siblingPage), false, siblingPage);
  }
  assert.match(scenario, /export const SYNTHETIC_MATCHING_READINESS_TRACE_REGIONS_IN_ORDER/);
});

test('closed g17 allowlist keeps nine paths, three blocked gates and one frozen data token', () => {
  const allowlist = JSON.parse(read(ALLOWLIST_PATH)) as {
    result_label: string;
    closed: boolean;
    no_new_scenario_token: boolean;
    no_scenario_line: boolean;
    frozen_data_vocabulary: string[];
    governance: Record<string, string>;
    allowed_paths: Array<{ path: string; state: string }>;
  };

  assert.equal(sha256(ALLOWLIST_PATH), FROZEN_ALLOWLIST_SHA256);
  assert.equal(allowlist.closed, true);
  assert.equal(allowlist.result_label, 'G17_SYNTHETIC_MATCHING_READINESS_TRACE_VERIFIED');
  assert.equal(allowlist.no_new_scenario_token, true);
  assert.equal(allowlist.no_scenario_line, true);
  assert.deepEqual(allowlist.frozen_data_vocabulary, FROZEN_DATA_VOCABULARY);
  assert.deepEqual(allowlist.governance, {
    gate_impact: 'NONE',
    implementation_readiness_gate: 'BLOCKED',
    synthetic_acceptance_gate: 'BLOCKED',
    production_launch_gate: 'BLOCKED'
  });
  assert.equal(allowlist.allowed_paths.length, 9);
  assert.deepEqual(
    allowlist.allowed_paths.filter(item => item.state === 'planned').map(item => item.path),
    [
      'apps/web/synthetic-matching-readiness-trace.html',
      'apps/web/src/synthetic/syntheticMatchingReadinessTraceScenario.ts',
      'apps/web/src/synthetic/SyntheticMatchingReadinessTrace.tsx',
      'apps/web/src/synthetic/syntheticMatchingReadinessTraceEntry.tsx',
      'apps/web/tests/syntheticMatchingReadinessTrace.test.ts',
      '05_DEVELOPMENT/matching-engine/synthetic-matching-readiness-trace/G17_MATCHING_READINESS_TRACE_VERIFICATION.json'
    ]
  );
  assert.deepEqual(
    allowlist.allowed_paths.filter(item => item.state === 'present').map(item => item.path),
    [
      '05_DEVELOPMENT/matching-engine/decisions/LeaseMind_MATCHING_G17_SYNTHETIC_MATCHING_READINESS_TRACE_AUTHORIZATION_v1.0.md',
      '05_DEVELOPMENT/matching-engine/synthetic-matching-readiness-trace/README.md',
      '05_DEVELOPMENT/matching-engine/synthetic-matching-readiness-trace/G17_FILE_ALLOWLIST_v1.0.json'
    ]
  );
  for (const item of allowlist.allowed_paths) {
    assert.equal(existsSync(path.join(REPOSITORY_ROOT, item.path)), true, item.path);
  }
});

test('default production entry points stay untouched and expose no g17 trace', () => {
  for (const file of ['index.html', 'src/App.tsx', 'src/main.tsx', 'vite.config.ts', 'package.json']) {
    const source = read(path.join(WEB_ROOT, file));
    assert.equal(source.includes('synthetic-matching-readiness-trace'), false, file);
    assert.equal(source.includes('SyntheticMatchingReadinessTrace'), false, file);
    assert.equal(source.includes('syntheticMatchingReadinessTrace'), false, file);
  }

  const viteConfiguration = read(path.join(WEB_ROOT, 'vite.config.ts'));
  assert.equal(viteConfiguration.includes('rollupOptions'), false);
  assert.equal(viteConfiguration.includes('input'), false);
  assert.equal(occurrences(read(path.join(WEB_ROOT, 'index.html')), 'synthetic'), 0);
});

test('prior g7-g16 packages and prior allowlists stay content-unchanged', () => {
  for (const [relativePath, expectedHash] of Object.entries(PRIOR_TEXT_SHA256)) {
    const absolutePath = path.join(REPOSITORY_ROOT, relativePath);
    assert.equal(existsSync(absolutePath), true, relativePath);
    assert.equal(sha256NormalizedText(absolutePath), expectedHash, relativePath);
  }
  for (const [relativePath, expectedHash] of Object.entries(PRIOR_ALLOWLIST_SHA256)) {
    const absolutePath = path.join(REPOSITORY_ROOT, relativePath);
    assert.equal(existsSync(absolutePath), true, relativePath);
    assert.equal(sha256(absolutePath), expectedHash, relativePath);
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

function sha256NormalizedText(filePath: string): string {
  const normalized = readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  return createHash('sha256').update(normalized, 'utf8').digest('hex');
}

function regionSlice(markup: string, region: string): string {
  const start = markup.indexOf(`aria-label="${region}"`);
  assert.notEqual(start, -1, region);
  const end = markup.indexOf('</section>', start);
  assert.notEqual(end, -1, region);
  return markup.slice(start, end);
}
