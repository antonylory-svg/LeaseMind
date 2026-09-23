import { createRoot } from 'react-dom/client';
import SyntheticTestDealFlowHarness from './SyntheticTestDealFlowHarness.js';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<SyntheticTestDealFlowHarness />);
}
