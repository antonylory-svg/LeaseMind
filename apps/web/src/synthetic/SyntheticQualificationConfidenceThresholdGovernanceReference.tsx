import type { CSSProperties } from 'react';
import {
  G46_BOUNDARY_MATRIX,
  G46_DISCLAIMER,
  G46_INDEPENDENT_BOUNDARIES,
  G46_NON_DECISION_RESULT,
  G46_OPEN_CONTENT,
  G46_QUALIFICATION_BOUNDARY,
  G46_REGIONS,
  G46_ROLE_BOUNDARY,
  G46_SCOPE_LINE,
  G46_SEMANTIC_CALIBRATION_BOUNDARY,
  G46_SOURCE_BOUNDARY,
  G46_SURROGATE_GUARDRAILS,
  G46_TERMINAL_LINE,
  G46_TERMINAL_TOKEN,
  G46_TITLE
} from './syntheticQualificationConfidenceThresholdGovernanceReferenceScenario.js';

const [SOURCE, ROLES, SEMANTICS, QUALIFICATION, OPEN, TERMINAL] = G46_REGIONS;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#312e81', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 78rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.3rem, 5vw, 2.55rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#c7d2fe', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #4f46e5', borderRadius: '0.8rem', background: '#f8fafc', color: '#312e81', overflowWrap: 'anywhere' },
  warning: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #d97706', borderRadius: '0.8rem', background: '#fffbeb', color: '#451a03', overflowWrap: 'anywhere' },
  heading: { margin: '0 0 1rem', color: '#4338ca', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  subheading: { margin: '1.1rem 0 0.5rem', color: '#4338ca', fontSize: '0.95rem', letterSpacing: '0.03em', overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.64rem, 1.7vw, 0.9rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #64748b', padding: 'clamp(0.25rem, 1vw, 0.65rem)', textAlign: 'left', verticalAlign: 'top', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#e0e7ff', color: '#312e81', fontWeight: 800 },
  meaning: { background: '#eef2ff', color: '#312e81', fontWeight: 700 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #f59e0b', borderRadius: '0.8rem', background: '#3730a3', color: '#fff', overflowWrap: 'anywhere' },
  terminalTitle: { margin: '0 0 1rem', color: '#fde68a', fontSize: '1.05rem' },
  terminalToken: { margin: '0.75rem 0 0', color: '#fde68a', fontWeight: 800, overflowWrap: 'anywhere' },
  terminalLine: { margin: '0.75rem 0 0', fontWeight: 750, lineHeight: 1.5, overflowWrap: 'anywhere' }
};

function StaticList({ items }: { items: readonly string[] }) {
  return <ul style={styles.list}>{items.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>;
}

function BoundaryMatrix() {
  return (
    <table style={styles.table}>
      <caption>Qualification Confidence threshold governance — calibration evidence is not cutoff approval</caption>
      <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Matrix row</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Frozen governance boundary</th></tr></thead>
      <tbody>{G46_BOUNDARY_MATRIX.map(row => <tr key={row.matrixRow}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{row.matrixRow}</th><td style={{ ...styles.cell, ...styles.meaning }}>{row.frozenBoundary}</td></tr>)}</tbody>
    </table>
  );
}

export default function SyntheticQualificationConfidenceThresholdGovernanceReference() {
  return (
    <main style={styles.page}><div style={styles.shell}>
      <h1 style={styles.title}>{G46_TITLE}</h1>
      <p style={styles.eyebrow}>{G46_DISCLAIMER}</p>
      <p style={styles.eyebrow}>{G46_SCOPE_LINE}</p>
      <section aria-label={SOURCE} style={styles.region}><h2 style={styles.heading}>{SOURCE}</h2><StaticList items={G46_SOURCE_BOUNDARY} /></section>
      <section aria-label={ROLES} style={styles.region}><h2 style={styles.heading}>{ROLES}</h2><StaticList items={G46_ROLE_BOUNDARY} /></section>
      <section aria-label={SEMANTICS} style={styles.region}><h2 style={styles.heading}>{SEMANTICS}</h2><StaticList items={G46_SEMANTIC_CALIBRATION_BOUNDARY} /><h3 style={styles.subheading}>FROZEN GOVERNANCE MATRIX</h3><BoundaryMatrix /></section>
      <section aria-label={QUALIFICATION} style={styles.warning}><h2 style={styles.heading}>{QUALIFICATION}</h2><StaticList items={G46_QUALIFICATION_BOUNDARY} /></section>
      <section aria-label={OPEN} style={styles.region}><h2 style={styles.heading}>{OPEN}</h2><StaticList items={G46_SURROGATE_GUARDRAILS} /><h3 style={styles.subheading}>OPEN EXACT CONTENT</h3><StaticList items={G46_OPEN_CONTENT} /><h3 style={styles.subheading}>INDEPENDENT BOUNDARIES</h3><StaticList items={G46_INDEPENDENT_BOUNDARIES} /></section>
      <section aria-label={TERMINAL} style={styles.terminal}><h2 style={styles.terminalTitle}>{TERMINAL}</h2><p style={styles.terminalLine}>{G46_NON_DECISION_RESULT}</p><p style={styles.terminalToken}>{G46_TERMINAL_TOKEN}</p><p style={styles.terminalLine}>{G46_TERMINAL_LINE}</p></section>
    </div></main>
  );
}
