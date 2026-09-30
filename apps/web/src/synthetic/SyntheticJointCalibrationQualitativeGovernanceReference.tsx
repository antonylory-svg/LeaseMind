import type { CSSProperties } from 'react';
import {
  G37_DISCLAIMER,
  G37_EXACT_EVIDENCE_STATUS_ENUM,
  G37_GOVERNANCE_MATRIX,
  G37_INDEPENDENT_BOUNDARIES,
  G37_NON_DECISION_RESULT,
  G37_OPEN_CONTENT,
  G37_REGIONS,
  G37_ROLE_SEPARATION,
  G37_SCOPE_LINE,
  G37_SEMANTIC_AND_FAIL_CLOSED_BOUNDARY,
  G37_SOURCE_BOUNDARY,
  G37_TERMINAL_LINE,
  G37_TERMINAL_TOKEN,
  G37_TITLE
} from './syntheticJointCalibrationQualitativeGovernanceReferenceScenario.js';

const [SOURCE, MATRIX, ROLES, BOUNDARY, OPEN, TERMINAL] = G37_REGIONS;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#111827', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 78rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.3rem, 5vw, 2.55rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#a7f3d0', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #34d399', borderRadius: '0.8rem', background: '#f8fafc', color: '#17243a', overflowWrap: 'anywhere' },
  warning: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #d69e2e', borderRadius: '0.8rem', background: '#fff9e8', color: '#4a3510', overflowWrap: 'anywhere' },
  heading: { margin: '0 0 1rem', color: '#065f46', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  subheading: { margin: '1.1rem 0 0.5rem', color: '#065f46', fontSize: '0.95rem', letterSpacing: '0.03em', overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.64rem, 1.7vw, 0.9rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #718096', padding: 'clamp(0.25rem, 1vw, 0.65rem)', textAlign: 'left', verticalAlign: 'top', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#dff7ed', color: '#065f46', fontWeight: 800 },
  meaning: { background: '#eef3fb', color: '#23446c', fontWeight: 700 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #f6c453', borderRadius: '0.8rem', background: '#1d2d46', color: '#fff', overflowWrap: 'anywhere' },
  terminalTitle: { margin: '0 0 1rem', color: '#f6c453', fontSize: '1.05rem' },
  terminalToken: { margin: '0.75rem 0 0', color: '#f6c453', fontWeight: 800, overflowWrap: 'anywhere' },
  terminalLine: { margin: '0.75rem 0 0', fontWeight: 750, lineHeight: 1.5, overflowWrap: 'anywhere' }
};

function StaticList({ items }: { items: readonly string[] }) {
  return <ul style={styles.list}>{items.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>;
}

function GovernanceMatrix() {
  return (
    <table style={styles.table}>
      <caption>Qualitative joint-calibration governance boundary — no mapping, function, order, value, range, calibration, policy or runtime use</caption>
      <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Matrix row</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Frozen qualitative boundary</th></tr></thead>
      <tbody>{G37_GOVERNANCE_MATRIX.map(row => <tr key={row.matrixRow}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{row.matrixRow}</th><td style={{ ...styles.cell, ...styles.meaning }}>{row.frozenBoundary}</td></tr>)}</tbody>
    </table>
  );
}

export default function SyntheticJointCalibrationQualitativeGovernanceReference() {
  return (
    <main style={styles.page}><div style={styles.shell}>
      <h1 style={styles.title}>{G37_TITLE}</h1>
      <p style={styles.eyebrow}>{G37_DISCLAIMER}</p>
      <p style={styles.eyebrow}>{G37_SCOPE_LINE}</p>
      <section aria-label={SOURCE} style={styles.region}><h2 style={styles.heading}>{SOURCE}</h2><StaticList items={G37_SOURCE_BOUNDARY} /></section>
      <section aria-label={MATRIX} style={styles.region}><h2 style={styles.heading}>{MATRIX}</h2><GovernanceMatrix /></section>
      <section aria-label={ROLES} style={styles.region}><h2 style={styles.heading}>{ROLES}</h2><StaticList items={G37_ROLE_SEPARATION} /></section>
      <section aria-label={BOUNDARY} style={styles.warning}><h2 style={styles.heading}>{BOUNDARY}</h2><h3 style={styles.subheading}>EXACT CATEGORICAL EVIDENCE STATUS ENUM</h3><StaticList items={G37_EXACT_EVIDENCE_STATUS_ENUM} /><h3 style={styles.subheading}>SEMANTIC, FAIL-CLOSED, EVIDENCE AND HISTORICAL BOUNDARY</h3><StaticList items={G37_SEMANTIC_AND_FAIL_CLOSED_BOUNDARY} /></section>
      <section aria-label={OPEN} style={styles.region}><h2 style={styles.heading}>{OPEN}</h2><StaticList items={G37_OPEN_CONTENT} /><h3 style={styles.subheading}>INDEPENDENT BOUNDARIES</h3><StaticList items={G37_INDEPENDENT_BOUNDARIES} /></section>
      <section aria-label={TERMINAL} style={styles.terminal}><h2 style={styles.terminalTitle}>{TERMINAL}</h2><p style={styles.terminalLine}>{G37_NON_DECISION_RESULT}</p><p style={styles.terminalToken}>{G37_TERMINAL_TOKEN}</p><p style={styles.terminalLine}>{G37_TERMINAL_LINE}</p></section>
    </div></main>
  );
}
