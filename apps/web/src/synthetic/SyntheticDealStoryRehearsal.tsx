import { useState } from 'react';
import SafePresentationSyntheticPreview from './SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from './safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_DEAL_STORY_REHEARSAL_DISCLAIMER,
  SYNTHETIC_DEAL_STORY_REHEARSAL_SCENARIO,
  SYNTHETIC_DEAL_STORY_REHEARSAL_STEPS,
  SYNTHETIC_DEAL_STORY_REHEARSAL_SUMMARY,
  SYNTHETIC_DEAL_STORY_REHEARSAL_SUMMARY_HEADING,
  SYNTHETIC_DEAL_STORY_REHEARSAL_TITLE,
  transitionSyntheticDealStoryRehearsal,
  type SyntheticDealStoryRehearsalStep
} from './syntheticDealStoryRehearsalScenario.js';

export default function SyntheticDealStoryRehearsal() {
  const [step, setStep] = useState<SyntheticDealStoryRehearsalStep>(0);
  const current = SYNTHETIC_DEAL_STORY_REHEARSAL_STEPS[step];

  return (
    <main>
      <h1>{SYNTHETIC_DEAL_STORY_REHEARSAL_TITLE}</h1>
      <p>{SYNTHETIC_DEAL_STORY_REHEARSAL_SCENARIO}</p>
      <p>{SYNTHETIC_DEAL_STORY_REHEARSAL_DISCLAIMER}</p>
      <section>
        <h2>{SYNTHETIC_DEAL_STORY_REHEARSAL_SUMMARY_HEADING}</h2>
        <ol aria-label="SYNTHETIC STORY STEP SUMMARY">
          {SYNTHETIC_DEAL_STORY_REHEARSAL_SUMMARY.map((line, index) => (
            <li key={line} aria-current={index === step ? 'step' : undefined}>{line}</li>
          ))}
        </ol>
      </section>
      <p aria-live="polite" aria-atomic="true">{current.progress}</p>
      <section>
        {current.lines.map(line => <p key={line}>{line}</p>)}
        {step === 2 ? <SafePresentationSyntheticPreview input={SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT} /> : null}
      </section>
      <nav aria-label="SYNTHETIC REHEARSAL NAVIGATION">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep(currentStep => transitionSyntheticDealStoryRehearsal(currentStep, -1))}
        >
          BACK
        </button>
        <button
          type="button"
          disabled={step === 4}
          onClick={() => setStep(currentStep => transitionSyntheticDealStoryRehearsal(currentStep, 1))}
        >
          NEXT
        </button>
        <button type="button" disabled={step === 0} onClick={() => setStep(0)}>
          RESTART
        </button>
      </nav>
    </main>
  );
}
