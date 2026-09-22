import { SYNTHETIC_DEAL_STORY_TOKENS } from './syntheticDealStoryScenario.js';

export const SYNTHETIC_DEAL_STORY_WALKTHROUGH_TITLE =
  'SYNTHETIC DEAL STORY WALKTHROUGH — NOT PRODUCTION APPROVED' as const;

export const SYNTHETIC_DEAL_STORY_WALKTHROUGH_SCENARIO =
  `SCENARIO: ${SYNTHETIC_DEAL_STORY_TOKENS.scenario}` as const;

export const SYNTHETIC_DEAL_STORY_WALKTHROUGH_STEPS = [
  {
    progress: 'STEP 1 OF 5',
    lines: [`STEP 1 — ${SYNTHETIC_DEAL_STORY_TOKENS.user} / ${SYNTHETIC_DEAL_STORY_TOKENS.need}`]
  },
  {
    progress: 'STEP 2 OF 5',
    lines: [`STEP 2 — ${SYNTHETIC_DEAL_STORY_TOKENS.campaignPreview}`]
  },
  {
    progress: 'STEP 3 OF 5',
    lines: [`STEP 3 — ${SYNTHETIC_DEAL_STORY_TOKENS.safePresentation}`]
  },
  {
    progress: 'STEP 4 OF 5',
    lines: [`STEP 4 — ${SYNTHETIC_DEAL_STORY_TOKENS.humanContinuation}`]
  },
  {
    progress: 'STEP 5 OF 5',
    lines: [
      `OUTCOME — ${SYNTHETIC_DEAL_STORY_TOKENS.outcome}`,
      'NO MATCH, SCORE, QUALIFICATION, RISK DECISION OR PRODUCTION APPROVAL OCCURRED'
    ]
  }
] as const;

export type SyntheticDealStoryWalkthroughStep = 0 | 1 | 2 | 3 | 4;
export type SyntheticDealStoryWalkthroughDirection = -1 | 1;

export function transitionSyntheticDealStoryWalkthrough(
  current: SyntheticDealStoryWalkthroughStep,
  direction: SyntheticDealStoryWalkthroughDirection
): SyntheticDealStoryWalkthroughStep {
  return Math.min(4, Math.max(0, current + direction)) as SyntheticDealStoryWalkthroughStep;
}
