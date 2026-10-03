import type { CSSProperties } from 'react';
import {
  G44_BOUNDARY_MATRIX,
  G44_DISCLAIMER,
  G44_INDEPENDENT_BOUNDARIES,
  G44_MULTI_CAUSE_SEPARATION,
  G44_NON_COMPENSATION,
  G44_NON_DECISION_RESULT,
  G44_OPEN_CONTENT,
  G44_PRECEDENCE_HIERARCHY,
  G44_REGIONS,
  G44_SCOPE_LINE,
  G44_SOURCE_BOUNDARY,
  G44_TERMINAL_LINE,
  G44_TERMINAL_TOKEN,
  G44_TITLE
} from './syntheticQualificationQualitativePrecedenceReferenceScenario.js';

const [SOURCE, HIERARCHY, NON_COMPENSATION, MULTI_CAUSE, OPEN, TERMINAL] = G44_REGIONS;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#14532d', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 78rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.3rem, 5vw, 2.55rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#bbf7d0', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #16a34a', borderRadius: '0.8rem', background: '#f8fafc', color: '#14532d', overflowWrap: 'anywhere' },
  warning: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #d97706', borderRadius: '0.8rem', background: '#fffbeb', color: '#451a03', overflowWrap: 'anywhere' },
  heading: { margin: '0 0 1rem', color: '#15803d', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  subheading: { margin: '1.1rem 0 0.5rem', color: '#15803d', fontSize: '0.95rem', letterSpacing: '0.03em', overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.64rem, 1.7vw, 0.9rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #64748b', padding: 'clamp(0.25rem, 1vw, 0.65rem)', textAlign: 'left', verticalAlign: 'top', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#dcfce7', color: '#14532d', fontWeight: 800 },
  meaning: { background: '#f0fdf4', color: '#14532d', fontWeight: 700 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #f59e0b', borderRadius: '0.8rem', background: '#166534', color: '#fff', overflowWrap: 'anywhere' },
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
      <caption>Qualification qualitative precedence — route hierarchy is not numeric severity or runtime algorithm approval</caption>
      <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Matrix row</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Frozen qualitative boundary</th></tr></thead>
      <tbody>{G44_BOUNDARY_MATRIX.map(row => <tr key={row.matrixRow}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{row.matrixRow}</th><td style={{ ...styles.cell, ...styles.meaning }}>{row.frozenBoundary}</td></tr>)}</tbody>
    </table>
  );
}

export default function SyntheticQualificationQualitativePrecedenceReference() {
  return (
    <main style={styles.page}><div style={styles.shell}>
      <h1 style={styles.title}>{G44_TITLE}</h1>
      <p style={styles.eyebrow}>{G44_DISCLAIMER}</p>
      <p style={styles.eyebrow}>{G44_SCOPE_LINE}</p>
      <section aria-label={SOURCE} style={styles.region}><h2 style={styles.heading}>{SOURCE}</h2><StaticList items={G44_SOURCE_BOUNDARY} /></section>
      <section aria-label={HIERARCHY} style={styles.region}><h2 style={styles.heading}>{HIERARCHY}</h2><StaticList items={G44_PRECEDENCE_HIERARCHY} /><h3 style={styles.subheading}>FROZEN QUALITATIVE BOUNDARY MATRIX</h3><BoundaryMatrix /></section>
      <section aria-label={NON_COMPENSATION} style={styles.warning}><h2 style={styles.heading}>{NON_COMPENSATION}</h2><StaticList items={G44_NON_COMPENSATION} /></section>
      <section aria-label={MULTI_CAUSE} style={styles.region}><h2 style={styles.heading}>{MULTI_CAUSE}</h2><StaticList items={G44_MULTI_CAUSE_SEPARATION} /></section>
      <section aria-label={OPEN} style={styles.region}><h2 style={styles.heading}>{OPEN}</h2><StaticList items={G44_OPEN_CONTENT} /><h3 style={styles.subheading}>INDEPENDENT QUALIFICATION BOUNDARIES</h3><StaticList items={G44_INDEPENDENT_BOUNDARIES} /></section>
      <section aria-label={TERMINAL} style={styles.terminal}><h2 style={styles.terminalTitle}>{TERMINAL}</h2><p style={styles.terminalLine}>{G44_NON_DECISION_RESULT}</p><p style={styles.terminalToken}>{G44_TERMINAL_TOKEN}</p><p style={styles.terminalLine}>{G44_TERMINAL_LINE}</p></section>
    </div></main>
  );
}
