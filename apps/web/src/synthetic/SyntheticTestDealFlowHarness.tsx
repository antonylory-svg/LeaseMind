import { useState, type CSSProperties } from 'react';
import SafePresentationSyntheticPreview from './SafePresentationSyntheticPreview.js';
import { SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT } from './safePresentationSyntheticDemoInput.js';
import {
  SYNTHETIC_TEST_DEAL_FLOW_DISCLAIMER,
  SYNTHETIC_TEST_DEAL_FLOW_DISPOSITIONS,
  SYNTHETIC_TEST_DEAL_FLOW_SCENARIO,
  SYNTHETIC_TEST_DEAL_FLOW_STEPS,
  SYNTHETIC_TEST_DEAL_FLOW_TITLE,
  advanceSyntheticTestDealFlow,
  type SyntheticTestDealFlowDisposition,
  type SyntheticTestDealFlowStep
} from './syntheticTestDealFlowScenario.js';

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
    width: 'min(100%, 58rem)',
    margin: '0 auto',
    padding: 'clamp(1rem, 4vw, 2.5rem)',
    border: '2px solid #46c7b4',
    borderRadius: '1rem',
    background: '#10243a',
    boxShadow: '0 1rem 2.5rem rgba(0, 0, 0, 0.35)'
  },
  title: {
    margin: '0 0 1rem',
    color: '#ffffff',
    fontSize: 'clamp(1.5rem, 5vw, 2.6rem)',
    lineHeight: 1.15,
    overflowWrap: 'anywhere'
  },
  eyebrow: {
    margin: '0.45rem 0',
    color: '#b9f3ea',
    fontWeight: 700,
    letterSpacing: '0.04em',
    overflowWrap: 'anywhere'
  },
  progress: {
    margin: '2rem 0 0.75rem',
    color: '#ffd166',
    fontSize: '1rem',
    fontWeight: 800,
    letterSpacing: '0.08em'
  },
  panel: {
    boxSizing: 'border-box',
    minWidth: 0,
    padding: 'clamp(1rem, 3vw, 1.75rem)',
    borderRadius: '0.75rem',
    background: '#f7fafc',
    color: '#10243a',
    overflowWrap: 'anywhere'
  },
  line: {
    margin: '0.65rem 0',
    fontWeight: 750,
    lineHeight: 1.5
  },
  selection: {
    margin: '1.2rem 0 0',
    paddingTop: '1rem',
    borderTop: '1px solid #8095a8',
    fontWeight: 700
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginTop: '1.5rem'
  },
  group: {
    display: 'contents'
  },
  button: {
    boxSizing: 'border-box',
    minHeight: '2.75rem',
    maxWidth: '100%',
    padding: '0.7rem 1rem',
    border: '2px solid #ffffff',
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
  }
};

export default function SyntheticTestDealFlowHarness() {
  const [step, setStep] = useState<SyntheticTestDealFlowStep>(0);
  const [disposition, setDisposition] = useState<SyntheticTestDealFlowDisposition | null>(null);
  const current = SYNTHETIC_TEST_DEAL_FLOW_STEPS[step];

  const reset = () => {
    setDisposition(null);
    setStep(0);
  };

  const chooseDisposition = (choice: SyntheticTestDealFlowDisposition) => {
    setDisposition(choice);
    setStep(5);
  };

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>{SYNTHETIC_TEST_DEAL_FLOW_TITLE}</h1>
        <p style={styles.eyebrow}>{SYNTHETIC_TEST_DEAL_FLOW_SCENARIO}</p>
        <p style={styles.eyebrow}>{SYNTHETIC_TEST_DEAL_FLOW_DISCLAIMER}</p>

        <p style={styles.progress} aria-live="polite" aria-atomic="true">
          {current.progress}
        </p>
        <section style={styles.panel} aria-label={current.progress}>
          {current.lines.map(line => <p key={line} style={styles.line}>{line}</p>)}
          {step === 3 ? (
            <SafePresentationSyntheticPreview input={SAFE_PRESENTATION_SYNTHETIC_DEMO_INPUT} />
          ) : null}
          {step === 5 && disposition ? (
            <p style={styles.selection}>SELECTED DISPOSITION — {disposition}</p>
          ) : null}
        </section>

        <nav style={styles.controls} aria-label="SYNTHETIC TEST-DEAL FLOW CONTROLS">
          {step < 4 ? (
            <>
              <button type="button" style={styles.button} onClick={() => setStep(advanceSyntheticTestDealFlow)}>
                NEXT STEP
              </button>
              <button type="button" style={styles.resetButton} onClick={reset}>
                RESET HARNESS
              </button>
            </>
          ) : null}
          {step === 4 ? (
            <>
              <div role="group" aria-label="HUMAN REHEARSAL DISPOSITION" style={styles.group}>
                {SYNTHETIC_TEST_DEAL_FLOW_DISPOSITIONS.map(choice => (
                  <button type="button" style={styles.button} key={choice} onClick={() => chooseDisposition(choice)}>
                    {choice}
                  </button>
                ))}
              </div>
              <button type="button" style={styles.resetButton} onClick={reset}>
                RESET HARNESS
              </button>
            </>
          ) : null}
          {step === 5 ? (
            <button type="button" style={styles.resetButton} onClick={reset}>
              RESET HARNESS
            </button>
          ) : null}
        </nav>
      </div>
    </main>
  );
}
