import { createRoot } from 'react-dom/client';
import SafePresentationSyntheticPreview from './SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from './safePresentationSyntheticDemoInput.js';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<SafePresentationSyntheticPreview input={SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT} />);
}
