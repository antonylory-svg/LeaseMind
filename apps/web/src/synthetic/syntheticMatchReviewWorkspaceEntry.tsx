import { createRoot } from 'react-dom/client';
import SyntheticMatchReviewWorkspace from './SyntheticMatchReviewWorkspace.js';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<SyntheticMatchReviewWorkspace />);
}
