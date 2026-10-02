import type { CSSProperties } from 'react';
import {
  G43_BOUNDARY_MATRIX,
  G43_DISCLAIMER,
  G43_INDEPENDENT_BOUNDARIES,
  G43_MAPPING_RULES,
  G43_NON_DECISION_RESULT,
  G43_NON_REJECTION_BOUNDARY,
  G43_OPEN_CONTENT,
  G43_REGIONS,
  G43_SCOPE_LINE,
  G43_SIX_CONDITIONS,
  G43_SOURCE_BOUNDARY,
  G43_TERMINAL_LINE,
  G43_TERMINAL_TOKEN,
  G43_TITLE
} from './syntheticEligibilityToQualificationQualitativeMappingReferenceScenario.js';

const [SOURCE, MATRIX, SEPARATION, FAIL_CLOSED, OPEN, TERMINAL] = G43_REGIONS;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#164e63', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 78rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.3rem, 5vw, 2.55rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#a5f3fc', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #0891b2', borderRadius: '0.8rem', background: '#f8fafc', color: '#164e63', overflowWrap: 'anywhere' },
  warning: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #d97706', borderRadius: '0.8rem', background: '#fffbeb', color: '#451a03', overflowWrap: 'anywhere' },
  heading: { margin: '0 0 1rem', color: '#0e7490', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  subheading: { margin: '1.1rem 0 0.5rem', color: '#0e7490', fontSize: '0.95rem', letterSpacing: '0.03em', overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.64rem, 1.7vw, 0.9rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #64748b', padding: 'clamp(0.25rem, 1vw, 0.65rem)', textAlign: 'left', verticalAlign: 'top', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#cffafe', color: '#164e63', fontWeight: 800 },
  meaning: { background: '#ecfeff', color: '#164e63', fontWeight: 700 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #f59e0b', borderRadius: '0.8rem', background: '#155e75', color: '#fff', overflowWrap: 'anywhere' },
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
      <caption>Eligibility-to-Qualification qualitative mapping — policy-semantic mapping is not runtime representation approval</caption>
      <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Matrix row</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Frozen qualitative boundary</th></tr></thead>
      <tbody>{G43_BOUNDARY_MATRIX.map(row => <tr key={row.matrixRow}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{row.matrixRow}</th><td style={{ ...styles.cell, ...styles.meaning }}>{row.frozenBoundary}</td></tr>)}</tbody>
    </table>
  );
}

export default function SyntheticEligibilityToQualificationQualitativeMappingReference() {
  return (
    <main style={styles.page}><div style={styles.shell}>
      <h1 style={styles.title}>{G43_TITLE}</h1>
      <p style={styles.eyebrow}>{G43_DISCLAIMER}</p>
      <p style={styles.eyebrow}>{G43_SCOPE_LINE}</p>
      <section aria-label={SOURCE} style={styles.region}><h2 style={styles.heading}>{SOURCE}</h2><StaticList items={G43_SOURCE_BOUNDARY} /></section>
      <section aria-label={MATRIX} style={styles.region}><h2 style={styles.heading}>{MATRIX}</h2><BoundaryMatrix /></section>
      <section aria-label={SEPARATION} style={styles.region}><h2 style={styles.heading}>{SEPARATION}</h2><StaticList items={G43_MAPPING_RULES} /></section>
      <section aria-label={FAIL_CLOSED} style={styles.warning}><h2 style={styles.heading}>{FAIL_CLOSED}</h2><h3 style={styles.subheading}>ALL SIX CONDITIONS ARE CUMULATIVE</h3><StaticList items={G43_SIX_CONDITIONS} /><h3 style={styles.subheading}>NON-REJECTION SAFEGUARDS</h3><StaticList items={G43_NON_REJECTION_BOUNDARY} /></section>
      <section aria-label={OPEN} style={styles.region}><h2 style={styles.heading}>{OPEN}</h2><StaticList items={G43_OPEN_CONTENT} /><h3 style={styles.subheading}>INDEPENDENT QUALIFICATION BOUNDARIES</h3><StaticList items={G43_INDEPENDENT_BOUNDARIES} /></section>
      <section aria-label={TERMINAL} style={styles.terminal}><h2 style={styles.terminalTitle}>{TERMINAL}</h2><p style={styles.terminalLine}>{G43_NON_DECISION_RESULT}</p><p style={styles.terminalToken}>{G43_TERMINAL_TOKEN}</p><p style={styles.terminalLine}>{G43_TERMINAL_LINE}</p></section>
    </div></main>
  );
}
