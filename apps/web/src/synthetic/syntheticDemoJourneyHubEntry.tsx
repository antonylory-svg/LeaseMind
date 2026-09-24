import { createRoot } from 'react-dom/client';
import SyntheticDemoJourneyHub from './SyntheticDemoJourneyHub.js';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<SyntheticDemoJourneyHub />);
}
