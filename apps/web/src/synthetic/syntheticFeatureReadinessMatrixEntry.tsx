import { createRoot } from 'react-dom/client';
import SyntheticFeatureReadinessMatrix from './SyntheticFeatureReadinessMatrix.js';

const root = document.getElementById('root');

if (root) {
  createRoot(root).render(<SyntheticFeatureReadinessMatrix />);
}
