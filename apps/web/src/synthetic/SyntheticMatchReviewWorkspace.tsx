import { useState, type CSSProperties } from 'react';
import SafePresentationSyntheticPreview from './SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from './safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_CO_DISPLAY_WARNING,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_CONTROLS_ARIA_LABEL,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISCLAIMER,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISPOSITION_GROUP_ARIA_LABEL,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISPOSITION_REQUIRED,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_LABEL,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_ROWS,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE_TOKEN,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_OWNER_SIDE,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_PAIR_WARNING,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_REHEARSAL_CHOICES,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_RESET,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_SELECTION_DISCLAIMER,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_TENANT_SIDE,
  SYNTHETIC_MATCH_REVIEW_WORKSPACE_TITLE,
  type SyntheticMatchReviewWorkspaceRehearsalChoice
} from './syntheticMatchReviewWorkspaceScenario.js';

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
  coDisplay: {
    boxSizing: 'border-box',
    minWidth: 0,
    marginTop: '1rem',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    border: '2px solid #7fe3d3',
    borderRadius: '0.8rem',
    background: '#0d2136',
    overflowWrap: 'anywhere'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 19rem), 1fr))',
    gap: '1rem'
  },
  panel: {
    boxSizing: 'border-box',
    minWidth: 0,
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    border: '2px solid #46c7b4',
    borderRadius: '0.8rem',
    background: '#f7fafc',
    color: '#10243a',
    overflowWrap: 'anywhere'
  },
  panelLine: {
    margin: 0,
    color: '#0b536b',
    fontSize: '1rem',
    fontWeight: 800,
    lineHeight: 1.5
  },
  rowLine: {
    margin: '0.5rem 0',
    fontWeight: 750,
    lineHeight: 1.5
  },
  fixtureLabel: {
    margin: '0.35rem 0 0',
    color: '#0b536b',
    fontWeight: 800,
    letterSpacing: '0.03em',
    lineHeight: 1.5
  },
  warning: {
    margin: '0.75rem 0 0',
    color: '#0b536b',
    fontWeight: 800,
    lineHeight: 1.5
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '1rem'
  },
  group: {
    display: 'contents'
  },
  button: {
    boxSizing: 'border-box',
    minHeight: '2.75rem',
    maxWidth: '100%',
    padding: '0.7rem 1rem',
    border: '2px solid #10243a',
    borderRadius: '0.45rem',
    background: '#146b8c',
    color: '#ffffff',
    font: 'inherit',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'normal'
  },
  resetButton: {
    boxSizing: 'border-box',
    minHeight: '2.75rem',
    maxWidth: '100%',
    padding: '0.7rem 1rem',
    border: '2px solid #ffffff',
    borderRadius: '0.45rem',
    background: '#4c3b70',
    color: '#ffffff',
    font: 'inherit',
    fontWeight: 800,
    cursor: 'pointer',
    whiteSpace: 'normal'
  },
  selectionRegion: {
    minHeight: '1.5rem',
    margin: '1rem 0 0'
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
  nonOccurrenceToken: {
    margin: 0,
    color: '#ffd166',
    fontSize: '1rem',
    fontWeight: 800,
    lineHeight: 1.35
  },
  nonOccurrenceLine: {
    margin: '0.75rem 0 0',
    fontWeight: 750,
    lineHeight: 1.5
  }
};

export default function SyntheticMatchReviewWorkspace() {
  const [selection, setSelection] = useState<SyntheticMatchReviewWorkspaceRehearsalChoice | null>(null);

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_TITLE}</h1>
        <p style={styles.eyebrow}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISCLAIMER}</p>

        <section style={styles.region}>
          <p style={styles.rowLine}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_ROWS[0]}</p>
          <p style={styles.fixtureLabel}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_LABEL}</p>
        </section>

        <section style={styles.region}>
          <p style={styles.rowLine}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_ROWS[1]}</p>
          <p style={styles.fixtureLabel}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_LABEL}</p>
        </section>

        <section style={styles.coDisplay}>
          <div style={styles.grid}>
            <section aria-label={SYNTHETIC_MATCH_REVIEW_WORKSPACE_OWNER_SIDE.accessibleName} style={styles.panel}>
              <p style={styles.panelLine}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_OWNER_SIDE.line}</p>
            </section>
            <section aria-label={SYNTHETIC_MATCH_REVIEW_WORKSPACE_TENANT_SIDE.accessibleName} style={styles.panel}>
              <p style={styles.panelLine}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_TENANT_SIDE.line}</p>
            </section>
          </div>
          <p style={styles.warning}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_CO_DISPLAY_WARNING}</p>
          <p style={styles.warning}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_PAIR_WARNING}</p>
        </section>

        <section style={styles.region}>
          <p style={styles.rowLine}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_ROWS[2]}</p>
          <p style={styles.fixtureLabel}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_FIXTURE_LABEL}</p>
          <SafePresentationSyntheticPreview input={SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT} />
        </section>

        <section style={styles.region}>
          <p style={styles.rowLine}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISPOSITION_REQUIRED}</p>
          <nav style={styles.controls} aria-label={SYNTHETIC_MATCH_REVIEW_WORKSPACE_CONTROLS_ARIA_LABEL}>
            <div role="group" aria-label={SYNTHETIC_MATCH_REVIEW_WORKSPACE_DISPOSITION_GROUP_ARIA_LABEL} style={styles.group}>
              {SYNTHETIC_MATCH_REVIEW_WORKSPACE_REHEARSAL_CHOICES.map(choice => (
                <button type="button" style={styles.button} key={choice} onClick={() => setSelection(choice)}>
                  {choice}
                </button>
              ))}
            </div>
            <button type="button" style={styles.resetButton} onClick={() => setSelection(null)}>
              {SYNTHETIC_MATCH_REVIEW_WORKSPACE_RESET}
            </button>
          </nav>
          <div style={styles.selectionRegion} aria-live="polite" aria-atomic="true">
            {selection === null ? null : (
              <>
                <p style={styles.rowLine}>{selection}</p>
                <p style={styles.warning}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_SELECTION_DISCLAIMER}</p>
              </>
            )}
          </div>
        </section>

        <section style={styles.nonOccurrence}>
          <p style={styles.nonOccurrenceToken}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE_TOKEN}</p>
          <p style={styles.nonOccurrenceLine}>{SYNTHETIC_MATCH_REVIEW_WORKSPACE_NON_OCCURRENCE}</p>
        </section>
      </div>
    </main>
  );
}
