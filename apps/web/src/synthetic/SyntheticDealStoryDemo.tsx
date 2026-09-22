import SafePresentationSyntheticPreview from './SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from './safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_DEAL_STORY_PREFIX_LINES,
  SYNTHETIC_DEAL_STORY_SUFFIX_LINES
} from './syntheticDealStoryScenario.js';

export default function SyntheticDealStoryDemo() {
  return (
    <main>
      {SYNTHETIC_DEAL_STORY_PREFIX_LINES.map(line => <p key={line}>{line}</p>)}
      <SafePresentationSyntheticPreview input={SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT} />
      {SYNTHETIC_DEAL_STORY_SUFFIX_LINES.map(line => <p key={line}>{line}</p>)}
    </main>
  );
}
