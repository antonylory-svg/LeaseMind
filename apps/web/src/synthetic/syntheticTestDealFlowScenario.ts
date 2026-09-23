export const SYNTHETIC_TEST_DEAL_FLOW_TITLE =
  'SYNTHETIC TEST-DEAL FLOW HARNESS — NOT PRODUCTION APPROVED' as const;

export const SYNTHETIC_TEST_DEAL_FLOW_SCENARIO =
  'SCENARIO: SYNTHETIC_TEST_DEAL_FLOW_A' as const;

export const SYNTHETIC_TEST_DEAL_FLOW_DISCLAIMER =
  'MANUAL DEV-ONLY REHEARSAL — NO DEAL EXECUTION' as const;

export const SYNTHETIC_TEST_DEAL_FLOW_STEPS = [
  {
    progress: 'STEP 1 OF 6',
    lines: ['TEST DEAL TOKEN — SYNTHETIC_TEST_DEAL_A']
  },
  {
    progress: 'STEP 2 OF 6',
    lines: [
      'CAMPAIGN PREVIEW — SYNTHETIC_CAMPAIGN_PREVIEW_A',
      'PREVIEW ONLY — NOT LAUNCHED'
    ]
  },
  {
    progress: 'STEP 3 OF 6',
    lines: [
      'SYNTHETIC_FIXTURE_PARTY_A + SYNTHETIC_FIXTURE_PARTY_B',
      'FIXTURE ONLY — NOT MATCHED OR RANKED'
    ]
  },
  {
    progress: 'STEP 4 OF 6',
    lines: ['SAFE PRESENTATION — SYNTHETIC_SAFE_PRESENTATION_A']
  },
  {
    progress: 'STEP 5 OF 6',
    lines: ['HUMAN REHEARSAL DISPOSITION REQUIRED']
  },
  {
    progress: 'STEP 6 OF 6',
    lines: [
      'SYNTHETIC_NO_DEAL_EXECUTED',
      'NO MATCH, SCORE, CONFIDENCE, QUALIFICATION, RISK, RANKING, CONTACT, DEAL OR OUTCOME OCCURRED'
    ]
  }
] as const;

export const SYNTHETIC_TEST_DEAL_FLOW_DISPOSITIONS = [
  'CONTINUE REHEARSAL',
  'HOLD REHEARSAL'
] as const;

export type SyntheticTestDealFlowStep = 0 | 1 | 2 | 3 | 4 | 5;
export type SyntheticTestDealFlowDisposition =
  (typeof SYNTHETIC_TEST_DEAL_FLOW_DISPOSITIONS)[number];

export function advanceSyntheticTestDealFlow(
  current: SyntheticTestDealFlowStep
): SyntheticTestDealFlowStep {
  if (current >= 4) return current;
  return (current + 1) as SyntheticTestDealFlowStep;
}
