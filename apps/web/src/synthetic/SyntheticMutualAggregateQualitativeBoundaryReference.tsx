import type { CSSProperties } from 'react';
import {
  SYNTHETIC_MUTUAL_AGGREGATE_CANDIDATE_BOUNDARY,
  SYNTHETIC_MUTUAL_AGGREGATE_CANDIDATES,
  SYNTHETIC_MUTUAL_AGGREGATE_DISCLAIMER,
  SYNTHETIC_MUTUAL_AGGREGATE_EVIDENCE_BOUNDARY,
  SYNTHETIC_MUTUAL_AGGREGATE_EVIDENCE_PREREQUISITES,
  SYNTHETIC_MUTUAL_AGGREGATE_MATRIX,
  SYNTHETIC_MUTUAL_AGGREGATE_OPEN_CONTENT,
  SYNTHETIC_MUTUAL_AGGREGATE_REGIONS_IN_ORDER,
  SYNTHETIC_MUTUAL_AGGREGATE_SCOPE_LINE,
  SYNTHETIC_MUTUAL_AGGREGATE_SOURCE_BOUNDARY,
  SYNTHETIC_MUTUAL_AGGREGATE_TERMINAL_LINE,
  SYNTHETIC_MUTUAL_AGGREGATE_TERMINAL_TOKEN,
  SYNTHETIC_MUTUAL_AGGREGATE_TITLE
} from './syntheticMutualAggregateQualitativeBoundaryReferenceScenario.js';

const [SOURCE_REGION, MATRIX_REGION, CANDIDATES_REGION, EVIDENCE_REGION, OPEN_REGION, TERMINAL_REGION] =
  SYNTHETIC_MUTUAL_AGGREGATE_REGIONS_IN_ORDER;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#111827', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 78rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.3rem, 5vw, 2.55rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#9be7d7', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #54c7b0', borderRadius: '0.8rem', background: '#f8fafc', color: '#17243a', overflowWrap: 'anywhere' },
  warning: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #d69e2e', borderRadius: '0.8rem', background: '#fff9e8', color: '#4a3510', overflowWrap: 'anywhere' },
  regionTitle: { margin: '0 0 1rem', color: '#0b5c68', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  candidates: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))', gap: '0.75rem', margin: '0 0 1rem', padding: 0, listStyle: 'none' },
  candidate: { padding: '0.8rem', border: '2px solid #0b5c68', borderRadius: '0.5rem', background: '#eef3fb', textAlign: 'center', fontWeight: 800, overflowWrap: 'anywhere' },
  candidateStatus: { display: 'block', marginTop: '0.4rem', color: '#23446c', fontSize: '0.85rem' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.64rem, 1.7vw, 0.9rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #718096', padding: 'clamp(0.25rem, 1vw, 0.65rem)', textAlign: 'left', verticalAlign: 'top', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#dff2ed', color: '#0b5c68', fontWeight: 800 },
  meaning: { background: '#eef3fb', color: '#23446c', fontWeight: 700 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #f6c453', borderRadius: '0.8rem', background: '#1d2d46', color: '#fff', overflowWrap: 'anywhere' },
  terminalTitle: { margin: '0 0 1rem', color: '#f6c453', fontSize: '1.05rem' },
  terminalToken: { margin: 0, color: '#f6c453', fontWeight: 800, overflowWrap: 'anywhere' },
  terminalLine: { margin: '0.75rem 0 0', fontWeight: 750, lineHeight: 1.5, overflowWrap: 'anywhere' }
};

function StaticList({ items }: { items: readonly string[] }) {
  return <ul style={styles.list}>{items.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>;
}

function QualitativeMatrix() {
  return (
    <table style={styles.table}>
      <caption>Qualitative two-input, anti-masking and non-compensation boundary — no function or computation</caption>
      <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Boundary</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Frozen qualitative meaning</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Explicit prohibition</th></tr></thead>
      <tbody>{SYNTHETIC_MUTUAL_AGGREGATE_MATRIX.map(row => <tr key={row.boundary}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{row.boundary}</th><td style={{ ...styles.cell, ...styles.meaning }}>{row.frozenQualitativeMeaning}</td><td style={styles.cell}>{row.explicitProhibition}</td></tr>)}</tbody>
    </table>
  );
}

export default function SyntheticMutualAggregateQualitativeBoundaryReference() {
  return (
    <main style={styles.page}><div style={styles.shell}>
      <h1 style={styles.title}>{SYNTHETIC_MUTUAL_AGGREGATE_TITLE}</h1>
      <p style={styles.eyebrow}>{SYNTHETIC_MUTUAL_AGGREGATE_DISCLAIMER}</p>
      <p style={styles.eyebrow}>{SYNTHETIC_MUTUAL_AGGREGATE_SCOPE_LINE}</p>
      <section aria-label={SOURCE_REGION} style={styles.region}><h2 style={styles.regionTitle}>{SOURCE_REGION}</h2><StaticList items={SYNTHETIC_MUTUAL_AGGREGATE_SOURCE_BOUNDARY} /></section>
      <section aria-label={MATRIX_REGION} style={styles.region}><h2 style={styles.regionTitle}>{MATRIX_REGION}</h2><QualitativeMatrix /></section>
      <section aria-label={CANDIDATES_REGION} style={styles.region}><h2 style={styles.regionTitle}>{CANDIDATES_REGION}</h2><ul style={styles.candidates}>{SYNTHETIC_MUTUAL_AGGREGATE_CANDIDATES.map(candidate => <li key={candidate.name} style={styles.candidate}>{candidate.name}<span style={styles.candidateStatus}>{candidate.status}</span></li>)}</ul><StaticList items={SYNTHETIC_MUTUAL_AGGREGATE_CANDIDATE_BOUNDARY} /></section>
      <section aria-label={EVIDENCE_REGION} style={styles.warning}><h2 style={styles.regionTitle}>{EVIDENCE_REGION}</h2><StaticList items={SYNTHETIC_MUTUAL_AGGREGATE_EVIDENCE_PREREQUISITES} /><StaticList items={SYNTHETIC_MUTUAL_AGGREGATE_EVIDENCE_BOUNDARY} /></section>
      <section aria-label={OPEN_REGION} style={styles.region}><h2 style={styles.regionTitle}>{OPEN_REGION}</h2><StaticList items={SYNTHETIC_MUTUAL_AGGREGATE_OPEN_CONTENT} /></section>
      <section aria-label={TERMINAL_REGION} style={styles.terminal}><h2 style={styles.terminalTitle}>{TERMINAL_REGION}</h2><p style={styles.terminalToken}>{SYNTHETIC_MUTUAL_AGGREGATE_TERMINAL_TOKEN}</p><p style={styles.terminalLine}>{SYNTHETIC_MUTUAL_AGGREGATE_TERMINAL_LINE}</p></section>
    </div></main>
  );
}
