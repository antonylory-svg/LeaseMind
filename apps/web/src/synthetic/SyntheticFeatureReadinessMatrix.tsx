import type { CSSProperties } from 'react';
import {
  SYNTHETIC_FEATURE_READINESS_MATRIX_CATEGORIES,
  SYNTHETIC_FEATURE_READINESS_MATRIX_CATEGORY_COPY,
  SYNTHETIC_FEATURE_READINESS_MATRIX_DISCLAIMER,
  SYNTHETIC_FEATURE_READINESS_MATRIX_FEATURE_IDS,
  SYNTHETIC_FEATURE_READINESS_MATRIX_MIXED_BOUNDARIES,
  SYNTHETIC_FEATURE_READINESS_MATRIX_PROHIBITED_INFERENCES,
  SYNTHETIC_FEATURE_READINESS_MATRIX_REASON,
  SYNTHETIC_FEATURE_READINESS_MATRIX_REGIONS_IN_ORDER,
  SYNTHETIC_FEATURE_READINESS_MATRIX_SAFEGUARDS,
  SYNTHETIC_FEATURE_READINESS_MATRIX_SCOPE_LINE,
  SYNTHETIC_FEATURE_READINESS_MATRIX_TERMINAL_LINE,
  SYNTHETIC_FEATURE_READINESS_MATRIX_TERMINAL_TOKEN,
  SYNTHETIC_FEATURE_READINESS_MATRIX_TITLE
} from './syntheticFeatureReadinessMatrixScenario.js';

const [CATEGORY_REGION, INDEX_REGION, MIXED_REGION, PROHIBITED_REGION, TERMINAL_REGION] =
  SYNTHETIC_FEATURE_READINESS_MATRIX_REGIONS_IN_ORDER;

const styles: Record<string, CSSProperties> = {
  page: {
    boxSizing: 'border-box',
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden',
    background: '#081421',
    color: '#f5f7fb',
    fontFamily: 'system-ui, sans-serif',
    padding: 'clamp(1rem, 4vw, 3rem)'
  },
  shell: { boxSizing: 'border-box', width: 'min(100%, 78rem)', margin: '0 auto' },
  title: {
    margin: '0 0 1rem',
    color: '#ffffff',
    fontSize: 'clamp(1.5rem, 5vw, 2.7rem)',
    lineHeight: 1.15,
    overflowWrap: 'anywhere'
  },
  eyebrow: {
    margin: '0.45rem 0',
    color: '#a9f0e4',
    fontWeight: 750,
    letterSpacing: '0.04em',
    overflowWrap: 'anywhere'
  },
  region: {
    boxSizing: 'border-box',
    minWidth: 0,
    marginTop: '1rem',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    border: '2px solid #43c3ae',
    borderRadius: '0.8rem',
    background: '#f7fafc',
    color: '#10243a',
    overflowWrap: 'anywhere'
  },
  regionTitle: {
    margin: '0 0 1rem',
    color: '#0b536b',
    fontSize: '1.05rem',
    letterSpacing: '0.03em',
    lineHeight: 1.4,
    overflowWrap: 'anywhere'
  },
  grid: {
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))',
    gap: '0.85rem',
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  item: {
    boxSizing: 'border-box',
    minWidth: 0,
    padding: '0.9rem',
    border: '2px solid #43c3ae',
    borderRadius: '0.7rem',
    background: '#eef6f5',
    overflowWrap: 'anywhere'
  },
  warningItem: {
    boxSizing: 'border-box',
    minWidth: 0,
    padding: '0.9rem',
    border: '2px solid #e6a52d',
    borderRadius: '0.7rem',
    background: '#fff7df',
    overflowWrap: 'anywhere'
  },
  label: {
    margin: 0,
    color: '#0b536b',
    fontWeight: 800,
    lineHeight: 1.4,
    overflowWrap: 'anywhere'
  },
  copy: { margin: '0.45rem 0 0', lineHeight: 1.5, overflowWrap: 'anywhere' },
  safeguard: { margin: '0.55rem 0', fontWeight: 700, lineHeight: 1.5, overflowWrap: 'anywhere' },
  terminal: {
    boxSizing: 'border-box',
    minWidth: 0,
    marginTop: '1rem',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    border: '2px solid #ffd166',
    borderRadius: '0.8rem',
    background: '#182c43',
    color: '#ffffff',
    overflowWrap: 'anywhere'
  },
  terminalTitle: { margin: '0 0 1rem', color: '#ffd166', fontSize: '1.05rem' },
  terminalToken: { margin: 0, color: '#ffd166', fontWeight: 800, overflowWrap: 'anywhere' },
  terminalLine: { margin: '0.75rem 0 0', fontWeight: 750, lineHeight: 1.5, overflowWrap: 'anywhere' }
};

export default function SyntheticFeatureReadinessMatrix() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>{SYNTHETIC_FEATURE_READINESS_MATRIX_TITLE}</h1>
        <p style={styles.eyebrow}>{SYNTHETIC_FEATURE_READINESS_MATRIX_DISCLAIMER}</p>
        <p style={styles.eyebrow}>{SYNTHETIC_FEATURE_READINESS_MATRIX_SCOPE_LINE}</p>

        <section aria-label={CATEGORY_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{CATEGORY_REGION}</h2>
          <ul style={styles.grid}>
            {SYNTHETIC_FEATURE_READINESS_MATRIX_CATEGORIES.map(category => (
              <li key={category} style={styles.item}>
                <p style={styles.label}>{category}</p>
                <p style={styles.copy}>{SYNTHETIC_FEATURE_READINESS_MATRIX_CATEGORY_COPY}</p>
              </li>
            ))}
          </ul>
          <div style={{ ...styles.warningItem, marginTop: '0.85rem' }}>
            <p style={styles.label}>{SYNTHETIC_FEATURE_READINESS_MATRIX_REASON.value}</p>
            <p style={styles.copy}>{SYNTHETIC_FEATURE_READINESS_MATRIX_REASON.copy}</p>
          </div>
        </section>

        <section aria-label={INDEX_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{INDEX_REGION}</h2>
          {SYNTHETIC_FEATURE_READINESS_MATRIX_SAFEGUARDS.map(item => (
            <p key={item} style={styles.safeguard}>{item}</p>
          ))}
          <ol style={styles.grid}>
            {SYNTHETIC_FEATURE_READINESS_MATRIX_FEATURE_IDS.map((featureId, index) => (
              <li key={featureId} style={styles.item}>
                <p style={styles.label}>{index + 1}. {featureId}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label={MIXED_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{MIXED_REGION}</h2>
          <ul style={styles.grid}>
            {SYNTHETIC_FEATURE_READINESS_MATRIX_MIXED_BOUNDARIES.map(item => (
              <li key={item.ordinal} style={styles.warningItem}>
                <p style={styles.label}>{item.ordinal}. {item.featureId}</p>
                <p style={styles.copy}>{item.copy}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label={PROHIBITED_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{PROHIBITED_REGION}</h2>
          {SYNTHETIC_FEATURE_READINESS_MATRIX_PROHIBITED_INFERENCES.map(item => (
            <p key={item} style={styles.safeguard}>{item}</p>
          ))}
        </section>

        <section aria-label={TERMINAL_REGION} style={styles.terminal}>
          <h2 style={styles.terminalTitle}>{TERMINAL_REGION}</h2>
          <p style={styles.terminalToken}>{SYNTHETIC_FEATURE_READINESS_MATRIX_TERMINAL_TOKEN}</p>
          <p style={styles.terminalLine}>{SYNTHETIC_FEATURE_READINESS_MATRIX_TERMINAL_LINE}</p>
        </section>
      </div>
    </main>
  );
}
