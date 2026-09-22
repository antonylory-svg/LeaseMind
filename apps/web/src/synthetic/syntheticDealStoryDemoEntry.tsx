import { createRoot } from 'react-dom/client';
import SyntheticDealStoryDemo from './SyntheticDealStoryDemo.js';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<SyntheticDealStoryDemo />);
}
