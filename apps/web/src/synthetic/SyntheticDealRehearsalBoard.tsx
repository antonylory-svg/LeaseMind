import { useState, type CSSProperties } from 'react';
import SafePresentationSyntheticPreview from './SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from './safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ADJACENT_LINE,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ROWS,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_TITLE,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_WARNING,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_WARNING,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_CONTROLS_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_DISCLAIMER,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_DISPOSITION_GROUP_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_ROWS,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_TOKEN,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_PAIR_WARNING,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_REHEARSAL_CHOICES,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_RESET,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_SAFE_PRESENTATION_REGION_ARIA_LABEL,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_SELECTION_DISCLAIMER,
  SYNTHETIC_DEAL_REHEARSAL_BOARD_TITLE,
  type SyntheticDealRehearsalBoardRehearsalChoice
} from './syntheticDealRehearsalBoardScenario.js';

const FIXTURE_LABEL_NODE_INDEXES = [0, 1, 3];
const DISPOSITION_NODE_INDEX = 4;

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
    gap: '1rem',
    minWidth: 0
  },
  panel: {
    boxSizing: 'border-box',
    minWidth: 0,
    padding: 'clamp(0.85rem, 2.5vw, 1.25rem)',
    border: '2px solid #46c7b4',
    borderRadius: '0.8rem',
    background: '#f7fafc',
    color: '#10243a',
    overflowWrap: 'anywhere'
  },
  panelTitle: {
    margin: '0 0 0.75rem',
    color: '#0b536b',
    fontSize: '0.95rem',
    letterSpacing: '0.02em',
    lineHeight: 1.4,
    overflowWrap: 'anywhere'
  },
  panelLine: {
    margin: '0.5rem 0',
    fontWeight: 750,
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  },
  fixtureLabel: {
    margin: '0.35rem 0 0',
    color: '#0b536b',
    fontWeight: 800,
    letterSpacing: '0.03em',
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
  chainWarning: {
    margin: '0 0 1rem',
    color: '#0b536b',
    fontWeight: 800,
    lineHeight: 1.5,
    overflowWrap: 'anywhere'
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '1rem',
    minWidth: 0
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
    boxSizing: 'border-box',
    minHeight: '1.5rem',
    margin: '1rem 0 0',
    minWidth: 0
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

export default function SyntheticDealRehearsalBoard() {
  const [selection, setSelection] = useState<SyntheticDealRehearsalBoardRehearsalChoice | null>(null);

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_TITLE}</h1>
        <p style={styles.eyebrow}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_DISCLAIMER}</p>

        <section
          aria-label={SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.accessibleName}
          style={styles.coDisplay}
        >
          <h2 style={styles.regionTitle}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.accessibleName}</h2>
          <div style={styles.grid}>
            <section
              aria-label={SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.ownerSide.accessibleName}
              style={styles.panel}
            >
              <p style={styles.panelLine}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.ownerSide.line}</p>
            </section>
            <section
              aria-label={SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.tenantSide.accessibleName}
              style={styles.panel}
            >
              <p style={styles.panelLine}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_REGION.tenantSide.line}</p>
            </section>
          </div>
          <p style={styles.warning}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_CO_DISPLAY_WARNING}</p>
          <p style={styles.warning}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_PAIR_WARNING}</p>
        </section>

        <section aria-label={SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_REGION_ARIA_LABEL} style={styles.region}>
          <h2 style={styles.regionTitle}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_REGION_ARIA_LABEL}</h2>
          <p style={styles.chainWarning}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_WARNING}</p>
          <div style={styles.grid}>
            {SYNTHETIC_DEAL_REHEARSAL_BOARD_CHAIN_NODES.map((node, index) => (
              <section key={node.accessibleName} aria-label={node.accessibleName} style={styles.panel}>
                <h3 style={styles.panelTitle}>{node.accessibleName}</h3>
                {node.lines.map(line => <p key={line} style={styles.panelLine}>{line}</p>)}
                {FIXTURE_LABEL_NODE_INDEXES.includes(index) ? (
                  <p style={styles.fixtureLabel}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_LABEL}</p>
                ) : null}
                {index === DISPOSITION_NODE_INDEX ? (
                  <nav style={styles.controls} aria-label={SYNTHETIC_DEAL_REHEARSAL_BOARD_CONTROLS_ARIA_LABEL}>
                    <div
                      role="group"
                      aria-label={SYNTHETIC_DEAL_REHEARSAL_BOARD_DISPOSITION_GROUP_ARIA_LABEL}
                      style={styles.group}
                    >
                      {SYNTHETIC_DEAL_REHEARSAL_BOARD_REHEARSAL_CHOICES.map(choice => (
                        <button type="button" style={styles.button} key={choice} onClick={() => setSelection(choice)}>
                          {choice}
                        </button>
                      ))}
                    </div>
                    <button type="button" style={styles.resetButton} onClick={() => setSelection(null)}>
                      {SYNTHETIC_DEAL_REHEARSAL_BOARD_RESET}
                    </button>
                  </nav>
                ) : null}
                {index === DISPOSITION_NODE_INDEX ? (
                  <div style={styles.selectionRegion} aria-live="polite" aria-atomic="true">
                    {selection === null ? null : (
                      <>
                        <p style={styles.panelLine}>{selection}</p>
                        <p style={styles.warning}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_SELECTION_DISCLAIMER}</p>
                      </>
                    )}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </section>

        <section aria-label={SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_REGION_ARIA_LABEL} style={styles.region}>
          <h2 style={styles.regionTitle}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_REGION_ARIA_LABEL}</h2>
          {SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_ROWS.map(row => (
            <div key={row} style={styles.panel}>
              <p style={styles.panelLine}>{row}</p>
              <p style={styles.fixtureLabel}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_FIXTURE_LABEL}</p>
            </div>
          ))}
        </section>

        <section
          aria-label={SYNTHETIC_DEAL_REHEARSAL_BOARD_SAFE_PRESENTATION_REGION_ARIA_LABEL}
          style={styles.region}
        >
          <h2 style={styles.regionTitle}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_SAFE_PRESENTATION_REGION_ARIA_LABEL}</h2>
          <SafePresentationSyntheticPreview input={SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT} />
        </section>

        <section aria-label={SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_REGION_ARIA_LABEL} style={styles.region}>
          <h2 style={styles.regionTitle}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_TITLE}</h2>
          {SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ROWS.map(row => (
            <p key={row} style={styles.panelLine}>{row}</p>
          ))}
          <p style={styles.warning}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_BOUNDARY_PANEL_ADJACENT_LINE}</p>
        </section>

        <section
          aria-label={SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_REGION_ARIA_LABEL}
          style={styles.nonOccurrence}
        >
          <h2 style={styles.nonOccurrenceTitle}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_REGION_ARIA_LABEL}</h2>
          <p style={styles.nonOccurrenceToken}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE_TOKEN}</p>
          <p style={styles.nonOccurrenceLine}>{SYNTHETIC_DEAL_REHEARSAL_BOARD_NON_OCCURRENCE}</p>
        </section>
      </div>
    </main>
  );
}
