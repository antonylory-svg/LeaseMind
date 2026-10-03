import type { CSSProperties } from 'react';
import {
  G47_BOUNDARY_MATRIX,
  G47_DISCLAIMER,
  G47_EVIDENCE_FAIL_CLOSED_BOUNDARY,
  G47_INDEPENDENT_BOUNDARIES,
  G47_NON_DECISION_RESULT,
  G47_OPEN_CONTENT,
  G47_REGIONS,
  G47_ROLE_BOUNDARY,
  G47_SCOPE_LINE,
  G47_SEMANTIC_REPRESENTATION_BOUNDARY,
  G47_SOURCE_BOUNDARY,
  G47_SURROGATE_GUARDRAILS,
  G47_TERMINAL_LINE,
  G47_TERMINAL_TOKEN,
  G47_TITLE
} from './syntheticCriticalDataCompletenessThresholdRuleGovernanceReferenceScenario.js';

const [SOURCE, ROLES, SEMANTICS, EVIDENCE, OPEN, TERMINAL] = G47_REGIONS;

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
      <caption>Critical-data completeness threshold/rule governance — evidence prerequisites are not rule approval</caption>
      <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Matrix row</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Frozen governance boundary</th></tr></thead>
      <tbody>{G47_BOUNDARY_MATRIX.map(row => <tr key={row.matrixRow}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{row.matrixRow}</th><td style={{ ...styles.cell, ...styles.meaning }}>{row.frozenBoundary}</td></tr>)}</tbody>
    </table>
  );
}

export default function SyntheticCriticalDataCompletenessThresholdRuleGovernanceReference() {
  return (
    <main style={styles.page}><div style={styles.shell}>
      <h1 style={styles.title}>{G47_TITLE}</h1>
      <p style={styles.eyebrow}>{G47_DISCLAIMER}</p>
      <p style={styles.eyebrow}>{G47_SCOPE_LINE}</p>
      <section aria-label={SOURCE} style={styles.region}><h2 style={styles.heading}>{SOURCE}</h2><StaticList items={G47_SOURCE_BOUNDARY} /></section>
      <section aria-label={ROLES} style={styles.region}><h2 style={styles.heading}>{ROLES}</h2><StaticList items={G47_ROLE_BOUNDARY} /></section>
      <section aria-label={SEMANTICS} style={styles.region}><h2 style={styles.heading}>{SEMANTICS}</h2><StaticList items={G47_SEMANTIC_REPRESENTATION_BOUNDARY} /><h3 style={styles.subheading}>FROZEN GOVERNANCE MATRIX</h3><BoundaryMatrix /></section>
      <section aria-label={EVIDENCE} style={styles.warning}><h2 style={styles.heading}>{EVIDENCE}</h2><StaticList items={G47_EVIDENCE_FAIL_CLOSED_BOUNDARY} /></section>
      <section aria-label={OPEN} style={styles.region}><h2 style={styles.heading}>{OPEN}</h2><StaticList items={G47_SURROGATE_GUARDRAILS} /><h3 style={styles.subheading}>OPEN EXACT CONTENT</h3><StaticList items={G47_OPEN_CONTENT} /><h3 style={styles.subheading}>INDEPENDENT BOUNDARIES</h3><StaticList items={G47_INDEPENDENT_BOUNDARIES} /></section>
      <section aria-label={TERMINAL} style={styles.terminal}><h2 style={styles.terminalTitle}>{TERMINAL}</h2><p style={styles.terminalLine}>{G47_NON_DECISION_RESULT}</p><p style={styles.terminalToken}>{G47_TERMINAL_TOKEN}</p><p style={styles.terminalLine}>{G47_TERMINAL_LINE}</p></section>
    </div></main>
  );
}
