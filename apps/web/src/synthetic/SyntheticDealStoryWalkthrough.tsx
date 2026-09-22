import { useState } from 'react';
import SafePresentationSyntheticPreview from './SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from './safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_DEAL_STORY_WALKTHROUGH_SCENARIO,
  SYNTHETIC_DEAL_STORY_WALKTHROUGH_STEPS,
  SYNTHETIC_DEAL_STORY_WALKTHROUGH_TITLE,
  transitionSyntheticDealStoryWalkthrough,
  type SyntheticDealStoryWalkthroughStep
} from './syntheticDealStoryWalkthroughScenario.js';

export default function SyntheticDealStoryWalkthrough() {
  const [step, setStep] = useState<SyntheticDealStoryWalkthroughStep>(0);
  const current = SYNTHETIC_DEAL_STORY_WALKTHROUGH_STEPS[step];

  return (
    <main>
      <h1>{SYNTHETIC_DEAL_STORY_WALKTHROUGH_TITLE}</h1>
      <p>{SYNTHETIC_DEAL_STORY_WALKTHROUGH_SCENARIO}</p>
      <p aria-live="polite" aria-atomic="true">{current.progress}</p>
      <section>
        {current.lines.map(line => <p key={line}>{line}</p>)}
        {step === 2 ? <SafePresentationSyntheticPreview input={SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT} /> : null}
      </section>
      <nav aria-label="SYNTHETIC WALKTHROUGH NAVIGATION">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep(currentStep => transitionSyntheticDealStoryWalkthrough(currentStep, -1))}
        >
          BACK
        </button>
        <button
          type="button"
          disabled={step === 4}
          onClick={() => setStep(currentStep => transitionSyntheticDealStoryWalkthrough(currentStep, 1))}
        >
          NEXT
        </button>
      </nav>
    </main>
  );
}
