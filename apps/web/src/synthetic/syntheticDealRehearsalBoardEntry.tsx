import { createRoot } from 'react-dom/client';
import SyntheticDealRehearsalBoard from './SyntheticDealRehearsalBoard.js';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<SyntheticDealRehearsalBoard />);
}
