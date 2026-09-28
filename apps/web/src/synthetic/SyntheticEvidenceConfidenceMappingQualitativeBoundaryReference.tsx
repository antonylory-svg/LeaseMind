import type { CSSProperties } from 'react';
import {
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_CANONICAL_ENUM,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_DISCLAIMER,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_DISTINCT_LAYERS,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_EVIDENCE_BOUNDARY,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_EVIDENCE_PREREQUISITES,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_GOVERNANCE_MATRIX,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_MATRIX_SHARED_RULES,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_OPEN_CONTENT,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_PROHIBITED_SURROGATES,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_REGIONS_IN_ORDER,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_ROLE_SEPARATION,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_SCOPE_LINE,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_SOURCE_BOUNDARY,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TERMINAL_LINE,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TERMINAL_TOKEN,
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TITLE
} from './syntheticEvidenceConfidenceMappingQualitativeBoundaryReferenceScenario.js';

const [SOURCE_REGION, MATRIX_REGION, ROLES_REGION, EVIDENCE_REGION, OPEN_REGION, TERMINAL_REGION] =
  SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_REGIONS_IN_ORDER;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#111827', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 78rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.3rem, 5vw, 2.55rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#9be7d7', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #54c7b0', borderRadius: '0.8rem', background: '#f8fafc', color: '#17243a', overflowWrap: 'anywhere' },
  warning: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #d69e2e', borderRadius: '0.8rem', background: '#fff9e8', color: '#4a3510', overflowWrap: 'anywhere' },
  regionTitle: { margin: '0 0 1rem', color: '#0b5c68', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  subTitle: { margin: '1.1rem 0 0.5rem', color: '#0b5c68', fontSize: '0.95rem', letterSpacing: '0.03em', overflowWrap: 'anywhere' },
  note: { margin: '0 0 1rem', padding: '0.75rem', border: '1px solid #0b5c68', borderRadius: '0.5rem', background: '#eef3fb', color: '#23446c', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
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

function GovernanceMatrix() {
  return (
    <table style={styles.table}>
      <caption>Qualitative evidence-confidence mapping governance boundary — no evidence-status mapping, table, function, numeric value, range, order, hierarchy, default, calibration or confidence score</caption>
      <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Governance row</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Frozen qualitative boundary</th></tr></thead>
      <tbody>{SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_GOVERNANCE_MATRIX.map(row => <tr key={row.governanceRow}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{row.governanceRow}</th><td style={{ ...styles.cell, ...styles.meaning }}>{row.frozenBoundary}</td></tr>)}</tbody>
    </table>
  );
}

export default function SyntheticEvidenceConfidenceMappingQualitativeBoundaryReference() {
  return (
    <main style={styles.page}><div style={styles.shell}>
      <h1 style={styles.title}>{SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TITLE}</h1>
      <p style={styles.eyebrow}>{SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_DISCLAIMER}</p>
      <p style={styles.eyebrow}>{SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_SCOPE_LINE}</p>
      <section aria-label={SOURCE_REGION} style={styles.region}><h2 style={styles.regionTitle}>{SOURCE_REGION}</h2><StaticList items={SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_SOURCE_BOUNDARY} /></section>
      <section aria-label={MATRIX_REGION} style={styles.region}><h2 style={styles.regionTitle}>{MATRIX_REGION}</h2><p style={styles.note}>{SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_MATRIX_SHARED_RULES}</p><GovernanceMatrix /><h3 style={styles.subTitle}>CANONICAL EVIDENCE STATUS ENUM — EXACT SEVEN VALUES IN ARCHITECTURE §13 ORDER</h3><p style={styles.note}>The enum is the sole authority and carries no numeric meaning, ordering, hierarchy, monotonicity, strength, rank or implied default; no eighth value may be added, renamed or inferred.</p><StaticList items={SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_CANONICAL_ENUM} /></section>
      <section aria-label={ROLES_REGION} style={styles.region}><h2 style={styles.regionTitle}>{ROLES_REGION}</h2><StaticList items={SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_ROLE_SEPARATION} /></section>
      <section aria-label={EVIDENCE_REGION} style={styles.warning}><h2 style={styles.regionTitle}>{EVIDENCE_REGION}</h2><StaticList items={SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_EVIDENCE_PREREQUISITES} /><StaticList items={SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_EVIDENCE_BOUNDARY} /></section>
      <section aria-label={OPEN_REGION} style={styles.region}><h2 style={styles.regionTitle}>{OPEN_REGION}</h2><StaticList items={SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_OPEN_CONTENT} /><h3 style={styles.subTitle}>PROHIBITED SURROGATES</h3><StaticList items={SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_PROHIBITED_SURROGATES} /><h3 style={styles.subTitle}>DISTINCT LAYERS — UNCHANGED</h3><StaticList items={SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_DISTINCT_LAYERS} /></section>
      <section aria-label={TERMINAL_REGION} style={styles.terminal}><h2 style={styles.terminalTitle}>{TERMINAL_REGION}</h2><p style={styles.terminalToken}>{SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TERMINAL_TOKEN}</p><p style={styles.terminalLine}>{SYNTHETIC_EVIDENCE_CONFIDENCE_MAPPING_TERMINAL_LINE}</p></section>
    </div></main>
  );
}
