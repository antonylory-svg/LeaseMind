import { SYNTHETIC_DEAL_STORY_TOKENS } from './syntheticDealStoryScenario.js';
import {
  SYNTHETIC_DEAL_STORY_WALKTHROUGH_SCENARIO,
  SYNTHETIC_DEAL_STORY_WALKTHROUGH_STEPS,
  transitionSyntheticDealStoryWalkthrough,
  type SyntheticDealStoryWalkthroughDirection,
  type SyntheticDealStoryWalkthroughStep
} from './syntheticDealStoryWalkthroughScenario.js';

export const SYNTHETIC_DEAL_STORY_REHEARSAL_TITLE =
  'SYNTHETIC DEAL STORY REHEARSAL — NOT PRODUCTION APPROVED' as const;

export const SYNTHETIC_DEAL_STORY_REHEARSAL_SCENARIO =
  SYNTHETIC_DEAL_STORY_WALKTHROUGH_SCENARIO;

export const SYNTHETIC_DEAL_STORY_REHEARSAL_DISCLAIMER =
  'DISPLAY-ONLY REHEARSAL — NO WORKFLOW EXECUTION' as const;

export const SYNTHETIC_DEAL_STORY_REHEARSAL_SUMMARY_HEADING =
  'FIVE-STEP SYNTHETIC STORY' as const;

export const SYNTHETIC_DEAL_STORY_REHEARSAL_SUMMARY = [
  `STEP 1 — ${SYNTHETIC_DEAL_STORY_TOKENS.user} / ${SYNTHETIC_DEAL_STORY_TOKENS.need}`,
  `STEP 2 — ${SYNTHETIC_DEAL_STORY_TOKENS.campaignPreview}`,
  `STEP 3 — ${SYNTHETIC_DEAL_STORY_TOKENS.safePresentation}`,
  `STEP 4 — ${SYNTHETIC_DEAL_STORY_TOKENS.humanContinuation}`,
  `STEP 5 — ${SYNTHETIC_DEAL_STORY_TOKENS.outcome}`
] as const;

export const SYNTHETIC_DEAL_STORY_REHEARSAL_STEPS =
  SYNTHETIC_DEAL_STORY_WALKTHROUGH_STEPS;

export type SyntheticDealStoryRehearsalStep = SyntheticDealStoryWalkthroughStep;
export type SyntheticDealStoryRehearsalDirection = SyntheticDealStoryWalkthroughDirection;

export function transitionSyntheticDealStoryRehearsal(
  current: SyntheticDealStoryRehearsalStep,
  direction: SyntheticDealStoryRehearsalDirection
): SyntheticDealStoryRehearsalStep {
  return transitionSyntheticDealStoryWalkthrough(current, direction);
}
