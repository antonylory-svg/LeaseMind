import type { CSSProperties } from 'react';
import {
  G41_BOUNDARY_MATRIX,
  G41_DISCLAIMER,
  G41_INDEPENDENT_BOUNDARIES,
  G41_NON_CONFLATION_BOUNDARY,
  G41_NON_DECISION_RESULT,
  G41_OPEN_CONTENT,
  G41_REGIONS,
  G41_ROLE_SEPARATION,
  G41_SCOPE_LINE,
  G41_SOURCE_BOUNDARY,
  G41_TERMINAL_LINE,
  G41_TERMINAL_TOKEN,
  G41_TITLE
} from './syntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReferenceScenario.js';

const [SOURCE, MATRIX, ROLES, NON_CONFLATION, OPEN, TERMINAL] = G41_REGIONS;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#172554', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 78rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.3rem, 5vw, 2.55rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#bfdbfe', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #2563eb', borderRadius: '0.8rem', background: '#f8fafc', color: '#172554', overflowWrap: 'anywhere' },
  warning: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #d97706', borderRadius: '0.8rem', background: '#fffbeb', color: '#451a03', overflowWrap: 'anywhere' },
  heading: { margin: '0 0 1rem', color: '#1d4ed8', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  subheading: { margin: '1.1rem 0 0.5rem', color: '#1d4ed8', fontSize: '0.95rem', letterSpacing: '0.03em', overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.64rem, 1.7vw, 0.9rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #64748b', padding: 'clamp(0.25rem, 1vw, 0.65rem)', textAlign: 'left', verticalAlign: 'top', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#dbeafe', color: '#1e3a8a', fontWeight: 800 },
  meaning: { background: '#eff6ff', color: '#1e3a8a', fontWeight: 700 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #f59e0b', borderRadius: '0.8rem', background: '#1e3a8a', color: '#fff', overflowWrap: 'anywhere' },
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
      <caption>Qualification Policy artifact-owner governance assignment — role assignment is not Policy approval</caption>
      <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Matrix row</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Frozen qualitative boundary</th></tr></thead>
      <tbody>{G41_BOUNDARY_MATRIX.map(row => <tr key={row.matrixRow}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{row.matrixRow}</th><td style={{ ...styles.cell, ...styles.meaning }}>{row.frozenBoundary}</td></tr>)}</tbody>
    </table>
  );
}

export default function SyntheticQualificationPolicyArtifactOwnerGovernanceAssignmentReference() {
  return (
    <main style={styles.page}><div style={styles.shell}>
      <h1 style={styles.title}>{G41_TITLE}</h1>
      <p style={styles.eyebrow}>{G41_DISCLAIMER}</p>
      <p style={styles.eyebrow}>{G41_SCOPE_LINE}</p>
      <section aria-label={SOURCE} style={styles.region}><h2 style={styles.heading}>{SOURCE}</h2><StaticList items={G41_SOURCE_BOUNDARY} /></section>
      <section aria-label={MATRIX} style={styles.region}><h2 style={styles.heading}>{MATRIX}</h2><BoundaryMatrix /></section>
      <section aria-label={ROLES} style={styles.region}><h2 style={styles.heading}>{ROLES}</h2><StaticList items={G41_ROLE_SEPARATION} /></section>
      <section aria-label={NON_CONFLATION} style={styles.warning}><h2 style={styles.heading}>{NON_CONFLATION}</h2><StaticList items={G41_NON_CONFLATION_BOUNDARY} /></section>
      <section aria-label={OPEN} style={styles.region}><h2 style={styles.heading}>{OPEN}</h2><StaticList items={G41_OPEN_CONTENT} /><h3 style={styles.subheading}>INDEPENDENT QUALIFICATION BOUNDARIES</h3><StaticList items={G41_INDEPENDENT_BOUNDARIES} /></section>
      <section aria-label={TERMINAL} style={styles.terminal}><h2 style={styles.terminalTitle}>{TERMINAL}</h2><p style={styles.terminalLine}>{G41_NON_DECISION_RESULT}</p><p style={styles.terminalToken}>{G41_TERMINAL_TOKEN}</p><p style={styles.terminalLine}>{G41_TERMINAL_LINE}</p></section>
    </div></main>
  );
}
