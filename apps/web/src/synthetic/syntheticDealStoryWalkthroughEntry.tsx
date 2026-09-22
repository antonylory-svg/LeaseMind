import { createRoot } from 'react-dom/client';
import SyntheticDealStoryWalkthrough from './SyntheticDealStoryWalkthrough.js';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<SyntheticDealStoryWalkthrough />);
}
