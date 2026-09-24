import type { CSSProperties } from 'react';
import SafePresentationSyntheticPreview from './SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from './safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ADJACENT_LINE,
  SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_REGION_ARIA_LABEL,
  SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ROWS,
  SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_TITLE,
  SYNTHETIC_DEMO_JOURNEY_HUB_CHAIN_WARNING,
  SYNTHETIC_DEMO_JOURNEY_HUB_DISCLAIMER,
  SYNTHETIC_DEMO_JOURNEY_HUB_ENTRIES,
  SYNTHETIC_DEMO_JOURNEY_HUB_JOURNEY_REGION_ARIA_LABEL,
  SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE,
  SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_REGION_ARIA_LABEL,
  SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_TOKEN,
  SYNTHETIC_DEMO_JOURNEY_HUB_SAFE_PRESENTATION_REGION_ARIA_LABEL,
  SYNTHETIC_DEMO_JOURNEY_HUB_TITLE
} from './syntheticDemoJourneyHubScenario.js';

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
  chainWarning: {
    margin: '0 0 1rem',
    color: '#0b536b',
    fontWeight: 800,
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  },
  entryList: {
    boxSizing: 'border-box',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))',
    gap: '1rem',
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  entry: {
    boxSizing: 'border-box',
    minWidth: 0,
    padding: 'clamp(0.85rem, 2.5vw, 1.25rem)',
    border: '2px solid #46c7b4',
    borderRadius: '0.8rem',
    background: '#eef6f5',
    color: '#10243a',
    overflowWrap: 'anywhere'
  },
  entryLabel: {
    margin: '0 0 0.5rem',
    color: '#0b536b',
    fontSize: '0.85rem',
    fontWeight: 800,
    letterSpacing: '0.06em',
    lineHeight: 1.4,
    overflowWrap: 'anywhere'
  },
  entryTitle: {
    margin: '0 0 0.5rem',
    fontWeight: 750,
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  },
  entryPath: {
    margin: 0,
    color: '#0b536b',
    fontWeight: 700,
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  },
  anchor: {
    boxSizing: 'border-box',
    color: '#0b536b',
    fontWeight: 800,
    textDecoration: 'underline',
    overflowWrap: 'anywhere'
  },
  panelLine: {
    margin: '0.5rem 0',
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

export default function SyntheticDemoJourneyHub() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>{SYNTHETIC_DEMO_JOURNEY_HUB_TITLE}</h1>
        <p style={styles.eyebrow}>{SYNTHETIC_DEMO_JOURNEY_HUB_DISCLAIMER}</p>

        <section aria-label={SYNTHETIC_DEMO_JOURNEY_HUB_JOURNEY_REGION_ARIA_LABEL} style={styles.region}>
          <h2 style={styles.regionTitle}>{SYNTHETIC_DEMO_JOURNEY_HUB_JOURNEY_REGION_ARIA_LABEL}</h2>
          <p style={styles.chainWarning}>{SYNTHETIC_DEMO_JOURNEY_HUB_CHAIN_WARNING}</p>
          <ol style={styles.entryList}>
            {SYNTHETIC_DEMO_JOURNEY_HUB_ENTRIES.map(entry => (
              <li key={entry.entryLabel} style={styles.entry}>
                <p style={styles.entryLabel}>{entry.entryLabel}</p>
                <p style={styles.entryTitle}>
                  <a href={entry.devPath} style={styles.anchor}>{entry.pageTitle}</a>
                </p>
                <p style={styles.entryPath}>{entry.devPath}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-label={SYNTHETIC_DEMO_JOURNEY_HUB_SAFE_PRESENTATION_REGION_ARIA_LABEL}
          style={styles.region}
        >
          <h2 style={styles.regionTitle}>{SYNTHETIC_DEMO_JOURNEY_HUB_SAFE_PRESENTATION_REGION_ARIA_LABEL}</h2>
          <SafePresentationSyntheticPreview input={SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT} />
        </section>

        <section aria-label={SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_REGION_ARIA_LABEL} style={styles.region}>
          <h2 style={styles.regionTitle}>{SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_TITLE}</h2>
          {SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ROWS.map(row => (
            <p key={row} style={styles.panelLine}>{row}</p>
          ))}
          <p style={styles.warning}>{SYNTHETIC_DEMO_JOURNEY_HUB_BOUNDARY_PANEL_ADJACENT_LINE}</p>
        </section>

        <section
          aria-label={SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_REGION_ARIA_LABEL}
          style={styles.nonOccurrence}
        >
          <h2 style={styles.nonOccurrenceTitle}>{SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_REGION_ARIA_LABEL}</h2>
          <p style={styles.nonOccurrenceToken}>{SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE_TOKEN}</p>
          <p style={styles.nonOccurrenceLine}>{SYNTHETIC_DEMO_JOURNEY_HUB_NON_OCCURRENCE}</p>
        </section>
      </div>
    </main>
  );
}

