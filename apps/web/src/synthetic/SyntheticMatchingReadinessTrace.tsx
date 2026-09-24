import type { CSSProperties } from 'react';
import {
  SYNTHETIC_MATCHING_READINESS_TRACE_BOUNDARY_ADJACENT_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_BOUNDARY_ROWS,
  SYNTHETIC_MATCHING_READINESS_TRACE_DESIGN_TIME_REASONS,
  SYNTHETIC_MATCHING_READINESS_TRACE_DISCLAIMER,
  SYNTHETIC_MATCHING_READINESS_TRACE_GATE_ADJACENT_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_GATE_ROWS,
  SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_TOKEN,
  SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_LABELS,
  SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_REASON,
  SYNTHETIC_MATCHING_READINESS_TRACE_REASON_ADJACENT_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_REGIONS_IN_ORDER,
  SYNTHETIC_MATCHING_READINESS_TRACE_REGISTRY_COPY_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_SCOPE_LINE,
  SYNTHETIC_MATCHING_READINESS_TRACE_TITLE
} from './syntheticMatchingReadinessTraceScenario.js';

const [
  READINESS_LABEL_SET_REGION,
  DESIGN_TIME_REASONS_REGION,
  GOVERNANCE_GATE_STATE_REGION,
  BOUNDARY_REGION,
  NON_OCCURRENCE_REGION
] = SYNTHETIC_MATCHING_READINESS_TRACE_REGIONS_IN_ORDER;

const styles: Record<string, CSSProperties> = {
  page: {
    boxSizing: 'border-box',
    minHeight: '100vh',
    width: '100%',
    overflowX: 'hidden',
    background: '#07111f',
    color: '#f5f7fb',
    fontFamily: 'system-ui, sans-serif',
    padding: 'clamp(1rem, 4vw, 3rem)'
  },
  shell: {
    boxSizing: 'border-box',
    width: 'min(100%, 76rem)',
    margin: '0 auto'
  },
  title: {
    margin: '0 0 1rem',
    color: '#ffffff',
    fontSize: 'clamp(1.5rem, 5vw, 2.7rem)',
    lineHeight: 1.15,
    overflowWrap: 'anywhere'
  },
  eyebrow: {
    margin: '0.45rem 0',
    color: '#b9f3ea',
    fontWeight: 750,
    letterSpacing: '0.04em',
    overflowWrap: 'anywhere'
  },
  region: {
    boxSizing: 'border-box',
    minWidth: 0,
    marginTop: '1rem',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    border: '2px solid #46c7b4',
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
  list: {
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 18rem), 1fr))',
    gap: '1rem',
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  item: {
    boxSizing: 'border-box',
    minWidth: 0,
    padding: 'clamp(0.85rem, 2.5vw, 1.25rem)',
    border: '2px solid #46c7b4',
    borderRadius: '0.8rem',
    background: '#eef6f5',
    color: '#10243a',
    overflowWrap: 'anywhere'
  },
  subreason: {
    boxSizing: 'border-box',
    minWidth: 0,
    marginTop: '1rem',
    padding: 'clamp(0.85rem, 2.5vw, 1.25rem)',
    border: '2px solid #ffd166',
    borderRadius: '0.8rem',
    background: '#fff7e0',
    color: '#10243a',
    overflowWrap: 'anywhere'
  },
  itemLabel: {
    margin: 0,
    color: '#0b536b',
    fontWeight: 800,
    letterSpacing: '0.03em',
    lineHeight: 1.4,
    overflowWrap: 'anywhere'
  },
  itemCopy: {
    margin: '0.5rem 0 0',
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  },
  panelLine: {
    margin: '0 0 0.5rem',
    fontWeight: 750,
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  },
  warning: {
    margin: '0.75rem 0 0',
    color: '#0b536b',
    fontWeight: 800,
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  },
  nonOccurrence: {
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
  nonOccurrenceTitle: {
    margin: '0 0 1rem',
    color: '#ffd166',
    fontSize: '1.05rem',
    letterSpacing: '0.03em',
    lineHeight: 1.4,
    overflowWrap: 'anywhere'
  },
  nonOccurrenceToken: {
    margin: 0,
    color: '#ffd166',
    fontSize: '1rem',
    fontWeight: 800,
    lineHeight: 1.35,
    overflowWrap: 'anywhere'
  },
  nonOccurrenceLine: {
    margin: '0.75rem 0 0',
    fontWeight: 750,
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  }
};

export default function SyntheticMatchingReadinessTrace() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>{SYNTHETIC_MATCHING_READINESS_TRACE_TITLE}</h1>
        <p style={styles.eyebrow}>{SYNTHETIC_MATCHING_READINESS_TRACE_DISCLAIMER}</p>
        <p style={styles.eyebrow}>{SYNTHETIC_MATCHING_READINESS_TRACE_SCOPE_LINE}</p>

        <section aria-label={READINESS_LABEL_SET_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{READINESS_LABEL_SET_REGION}</h2>
          <ul style={styles.list}>
            {SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_LABELS.map(item => (
              <li key={item.label} style={styles.item}>
                <p style={styles.itemLabel}>{item.label}</p>
                <p style={styles.itemCopy}>{item.copy}</p>
              </li>
            ))}
          </ul>
          <div style={styles.subreason}>
            <p style={styles.itemLabel}>{SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_REASON.value}</p>
            <p style={styles.itemCopy}>{SYNTHETIC_MATCHING_READINESS_TRACE_READINESS_REASON.copy}</p>
          </div>
          <p style={styles.warning}>{SYNTHETIC_MATCHING_READINESS_TRACE_REGISTRY_COPY_LINE}</p>
        </section>

        <section aria-label={DESIGN_TIME_REASONS_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{DESIGN_TIME_REASONS_REGION}</h2>
          <ul style={styles.list}>
            {SYNTHETIC_MATCHING_READINESS_TRACE_DESIGN_TIME_REASONS.map(reason => (
              <li key={reason} style={styles.item}>
                <p style={styles.itemLabel}>{reason}</p>
                <p style={styles.itemCopy}>{SYNTHETIC_MATCHING_READINESS_TRACE_REASON_ADJACENT_LINE}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label={GOVERNANCE_GATE_STATE_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{GOVERNANCE_GATE_STATE_REGION}</h2>
          <ul style={styles.list}>
            {SYNTHETIC_MATCHING_READINESS_TRACE_GATE_ROWS.map(row => (
              <li key={row} style={styles.item}>
                <p style={styles.itemLabel}>{row}</p>
              </li>
            ))}
          </ul>
          <p style={styles.warning}>{SYNTHETIC_MATCHING_READINESS_TRACE_GATE_ADJACENT_LINE}</p>
        </section>

        <section aria-label={BOUNDARY_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{BOUNDARY_REGION}</h2>
          {SYNTHETIC_MATCHING_READINESS_TRACE_BOUNDARY_ROWS.map(row => (
            <p key={row} style={styles.panelLine}>
              {row}
            </p>
          ))}
          <p style={styles.warning}>{SYNTHETIC_MATCHING_READINESS_TRACE_BOUNDARY_ADJACENT_LINE}</p>
        </section>

        <section aria-label={NON_OCCURRENCE_REGION} style={styles.nonOccurrence}>
          <h2 style={styles.nonOccurrenceTitle}>{NON_OCCURRENCE_REGION}</h2>
          <p style={styles.nonOccurrenceToken}>{SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_TOKEN}</p>
          <p style={styles.nonOccurrenceLine}>{SYNTHETIC_MATCHING_READINESS_TRACE_NON_OCCURRENCE_LINE}</p>
        </section>
      </div>
    </main>
  );
}
