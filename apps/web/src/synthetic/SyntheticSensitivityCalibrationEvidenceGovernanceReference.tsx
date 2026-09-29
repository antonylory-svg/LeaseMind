import type { CSSProperties } from 'react';
import {
  G31_DISCLAIMER,
  G31_DISTINCT_LAYERS,
  G31_EVIDENCE_BOUNDARY,
  G31_EVIDENCE_GOVERNANCE_MATRIX,
  G31_EVIDENCE_PREREQUISITES,
  G31_FAIL_CLOSED,
  G31_INDEPENDENCE_PRESERVED,
  G31_NON_DECISION_RESULT,
  G31_OPEN_CONTENT,
  G31_PROHIBITED_INFERENCES,
  G31_REGIONS,
  G31_ROLE_SEPARATION,
  G31_SCOPE_LINE,
  G31_SOURCE_BOUNDARY,
  G31_TERMINAL_LINE,
  G31_TERMINAL_TOKEN,
  G31_TITLE
} from './syntheticSensitivityCalibrationEvidenceGovernanceReferenceScenario.js';

const [SOURCE, MATRIX, ROLES, EVIDENCE, OPEN, TERMINAL] = G31_REGIONS;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#111827', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 78rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.3rem, 5vw, 2.55rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#9be7d7', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #54c7b0', borderRadius: '0.8rem', background: '#f8fafc', color: '#17243a', overflowWrap: 'anywhere' },
  warning: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #d69e2e', borderRadius: '0.8rem', background: '#fff9e8', color: '#4a3510', overflowWrap: 'anywhere' },
  heading: { margin: '0 0 1rem', color: '#0b5c68', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  subheading: { margin: '1.1rem 0 0.5rem', color: '#0b5c68', fontSize: '0.95rem', letterSpacing: '0.03em', overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.64rem, 1.7vw, 0.9rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #718096', padding: 'clamp(0.25rem, 1vw, 0.65rem)', textAlign: 'left', verticalAlign: 'top', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#dff2ed', color: '#0b5c68', fontWeight: 800 },
  meaning: { background: '#eef3fb', color: '#23446c', fontWeight: 700 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #f6c453', borderRadius: '0.8rem', background: '#1d2d46', color: '#fff', overflowWrap: 'anywhere' },
  terminalTitle: { margin: '0 0 1rem', color: '#f6c453', fontSize: '1.05rem' },
  terminalToken: { margin: '0.75rem 0 0', color: '#f6c453', fontWeight: 800, overflowWrap: 'anywhere' },
  terminalLine: { margin: '0.75rem 0 0', fontWeight: 750, lineHeight: 1.5, overflowWrap: 'anywhere' }
};

function StaticList({ items }: { items: readonly string[] }) {
  return <ul style={styles.list}>{items.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>;
}

function EvidenceGovernanceMatrix() {
  return (
    <table style={styles.table}>
      <caption>Qualitative sensitivity/calibration evidence-governance boundary — no dataset, split, seed, sensitivity design, metric, calibration, target, threshold, statistic, result or tuning action</caption>
      <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Governance row</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Frozen qualitative boundary</th></tr></thead>
      <tbody>{G31_EVIDENCE_GOVERNANCE_MATRIX.map(row => <tr key={row.governanceRow}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{row.governanceRow}</th><td style={{ ...styles.cell, ...styles.meaning }}>{row.frozenBoundary}</td></tr>)}</tbody>
    </table>
  );
}

export default function SyntheticSensitivityCalibrationEvidenceGovernanceReference() {
  return (
    <main style={styles.page}><div style={styles.shell}>
      <h1 style={styles.title}>{G31_TITLE}</h1>
      <p style={styles.eyebrow}>{G31_DISCLAIMER}</p>
      <p style={styles.eyebrow}>{G31_SCOPE_LINE}</p>
      <section aria-label={SOURCE} style={styles.region}><h2 style={styles.heading}>{SOURCE}</h2><StaticList items={G31_SOURCE_BOUNDARY} /></section>
      <section aria-label={MATRIX} style={styles.region}><h2 style={styles.heading}>{MATRIX}</h2><EvidenceGovernanceMatrix /></section>
      <section aria-label={ROLES} style={styles.region}><h2 style={styles.heading}>{ROLES}</h2><StaticList items={G31_ROLE_SEPARATION} /></section>
      <section aria-label={EVIDENCE} style={styles.warning}><h2 style={styles.heading}>{EVIDENCE}</h2><StaticList items={G31_EVIDENCE_PREREQUISITES} /><StaticList items={G31_EVIDENCE_BOUNDARY} /><StaticList items={G31_FAIL_CLOSED} /></section>
      <section aria-label={OPEN} style={styles.region}><h2 style={styles.heading}>{OPEN}</h2><StaticList items={G31_OPEN_CONTENT} /><h3 style={styles.subheading}>DISTINCT LAYERS — UNCHANGED</h3><StaticList items={G31_DISTINCT_LAYERS} /><h3 style={styles.subheading}>PROHIBITED INFERENCES AND SURROGATES</h3><StaticList items={G31_PROHIBITED_INFERENCES} /><h3 style={styles.subheading}>INDEPENDENCE PRESERVED — NOT REOPENED, ABSORBED, SELECTED OR APPROVED</h3><StaticList items={G31_INDEPENDENCE_PRESERVED} /></section>
      <section aria-label={TERMINAL} style={styles.terminal}><h2 style={styles.terminalTitle}>{TERMINAL}</h2><p style={styles.terminalLine}>{G31_NON_DECISION_RESULT}</p><p style={styles.terminalToken}>{G31_TERMINAL_TOKEN}</p><p style={styles.terminalLine}>{G31_TERMINAL_LINE}</p></section>
    </div></main>
  );
}
