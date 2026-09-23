import { createRoot } from 'react-dom/client';
import SyntheticMatchingFlowConsole from './SyntheticMatchingFlowConsole.js';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<SyntheticMatchingFlowConsole />);
}
