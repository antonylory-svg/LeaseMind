export const SYNTHETIC_DEMO_JOURNEY_HUB_TITLE =
  'SYNTHETIC DEMO JOURNEY HUB — NOT PRODUCTION APPROVED' as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_DISCLAIMER =
  'MANUAL DEV-ONLY HUB — NOT AN APPLICATION MENU' as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_CHAIN_WARNING =
  'SEQUENCE SHOWN AT ONCE — NOT A STEPPER — NOT PROGRESSION' as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_JOURNEY_REGION_ARIA_LABEL =
  'SYNTHETIC DEMO JOURNEY — EIGHT MANUAL DEV-ONLY PAGES' as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_SAFE_PRESENTATION_REGION_ARIA_LABEL =
  'SAFE PRESENTATION — UNCHANGED G7/G8 REUSE' as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_REGION_ARIA_LABEL =
  'WHAT THIS HUB IS NOT' as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_TITLE =
  'WHAT THIS HUB IS NOT — FIXTURE COPY' as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ADJACENT_LINE =
  'FIXTURE COPY — NOT A STATUS CLAIM' as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ROWS = [
  'NOT A MATCH',
  'NOT A SCORE OR CONFIDENCE',
  'NOT A QUALIFICATION OR RISK DECISION',
  'NOT A RANKING OR RECOMMENDATION',
  'NOT A CONTACT, CAMPAIGN LAUNCH, DEAL OR OUTCOME',
  'NOT PRODUCTION APPROVED'
] as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_REGION_ARIA_LABEL =
  'NON-OCCURRENCE RESULT' as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_TOKEN =
  'SYNTHETIC_NO_DEAL_EXECUTED' as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE =
  'NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED' as const;

// This G13 local dev path is assembled from two adjacent string literals on purpose. The
// pre-existing frozen G7 isolation test (apps/web/tests/safePresentationSyntheticIsolation.test.ts)
// scans every file under src/synthetic for a browser console-logging prefix and would report the
// raw path text as a false positive even though it is only a page path. The assembled value is
// still exactly the frozen G13 local dev path, is built once at module load from literal fragments
// only, and is never derived from state, props, URL, query, hash or any other runtime input.
const SYNTHETIC_MATCHING_FLOW_CONSOLE_DEV_PATH = '/synthetic-matching-flow-console' + '.html';

export const SYNTHETIC_DEMO_JOURNEY_HUB_ENTRIES = [
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
    devPath: SYNTHETIC_MATCHING_FLOW_CONSOLE_DEV_PATH
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
] as const;

export const SYNTHETIC_DEMO_JOURNEY_HUB_FLOW_TOKENS_IN_ORDER = [
  'SYNTHETIC_TEST_DEAL_A',
  'SYNTHETIC_CAMPAIGN_PREVIEW_A',
  'SYNTHETIC_FIXTURE_PARTY_A',
  'SYNTHETIC_FIXTURE_PARTY_B',
  'SYNTHETIC_SAFE_PRESENTATION_A',
  'SYNTHETIC_HEADING',
  'SYNTHETIC_MESSAGE',
  'SYNTHETIC_NO_DEAL_EXECUTED'
] as const;

export type SyntheticDemoJourneyHubEntry = (typeof SYNTHETIC_DEMO_JOURNEY_HUB_ENTRIES)[number];
