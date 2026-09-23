import { useState, type CSSProperties } from 'react';
import SafePresentationSyntheticPreview from './SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from './safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_MATCHING_FLOW_CONSOLE_DISCLAIMER,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_DISPOSITIONS,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_NON_OCCURRENCE,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_RESET,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_SCENARIO,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_STAGE_NODES,
  SYNTHETIC_MATCHING_FLOW_CONSOLE_TITLE,
  type SyntheticMatchingFlowConsoleDisposition
} from './syntheticMatchingFlowConsoleScenario.js';

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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 19rem), 1fr))',
    gap: '1rem',
    marginTop: '2rem'
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
  panelTitle: {
    margin: '0 0 1rem',
    color: '#0b536b',
    fontSize: '1rem',
    lineHeight: 1.35
  },
  line: {
    margin: '0.65rem 0',
    fontWeight: 750,
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
  selection: {
    minHeight: '1.5rem',
    margin: '1rem 0 0',
    fontWeight: 800
  },
  nonOccurrence: {
    boxSizing: 'border-box',
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
    fontSize: '1rem',
    lineHeight: 1.35
  }
};

export default function SyntheticMatchingFlowConsole() {
  const [disposition, setDisposition] = useState<SyntheticMatchingFlowConsoleDisposition | null>(null);

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>{SYNTHETIC_MATCHING_FLOW_CONSOLE_TITLE}</h1>
        <p style={styles.eyebrow}>{SYNTHETIC_MATCHING_FLOW_CONSOLE_SCENARIO}</p>
        <p style={styles.eyebrow}>{SYNTHETIC_MATCHING_FLOW_CONSOLE_DISCLAIMER}</p>

        <div style={styles.grid}>
          {SYNTHETIC_MATCHING_FLOW_CONSOLE_STAGE_NODES.map((node, index) => (
            <section key={node.accessibleName} aria-label={node.accessibleName} style={styles.panel}>
              <h2 style={styles.panelTitle}>{node.accessibleName}</h2>
              {node.lines.map(line => <p key={line} style={styles.line}>{line}</p>)}
              {index === 3 ? (
                <SafePresentationSyntheticPreview input={SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT} />
              ) : null}
              {index === 4 ? (
                <nav style={styles.controls} aria-label="SYNTHETIC MATCHING FLOW CONSOLE CONTROLS">
                  <div role="group" aria-label="HUMAN REHEARSAL DISPOSITION" style={styles.group}>
                    {SYNTHETIC_MATCHING_FLOW_CONSOLE_DISPOSITIONS.map(choice => (
                      <button type="button" style={styles.button} key={choice} onClick={() => setDisposition(choice)}>
                        {choice}
                      </button>
                    ))}
                  </div>
                  <button type="button" style={styles.resetButton} onClick={() => setDisposition(null)}>
                    {SYNTHETIC_MATCHING_FLOW_CONSOLE_RESET}
                  </button>
                </nav>
              ) : null}
              {index === 4 ? (
                <p style={styles.selection} aria-live="polite" aria-atomic="true">
                  {disposition}
                </p>
              ) : null}
            </section>
          ))}
        </div>

        <section aria-label="CURRENT-RENDER NON-OCCURRENCE PANEL" style={styles.nonOccurrence}>
          <h2 style={styles.nonOccurrenceTitle}>CURRENT-RENDER NON-OCCURRENCE PANEL</h2>
          <p style={styles.line}>CURRENT RENDER ONLY — NOT A LEDGER — NOT PERSISTENT</p>
          <p style={styles.line}>{SYNTHETIC_MATCHING_FLOW_CONSOLE_NON_OCCURRENCE}</p>
        </section>
      </div>
    </main>
  );
}
