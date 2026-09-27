import type { CSSProperties } from 'react';
import {
  SYNTHETIC_FEATURE_STATE_AXIS_DISCLAIMER,
  SYNTHETIC_FEATURE_STATE_AXIS_DOMAINS,
  SYNTHETIC_FEATURE_STATE_AXIS_EXACT_ENUM_BOUNDARY,
  SYNTHETIC_FEATURE_STATE_AXIS_NON_COERCION,
  SYNTHETIC_FEATURE_STATE_AXIS_OPEN_CONTENT,
  SYNTHETIC_FEATURE_STATE_AXIS_REGIONS_IN_ORDER,
  SYNTHETIC_FEATURE_STATE_AXIS_SCOPE_LINE,
  SYNTHETIC_FEATURE_STATE_AXIS_SOURCE_BOUNDARY,
  SYNTHETIC_FEATURE_STATE_AXIS_TERMINAL_LINE,
  SYNTHETIC_FEATURE_STATE_AXIS_TERMINAL_TOKEN,
  SYNTHETIC_FEATURE_STATE_AXIS_TITLE
} from './syntheticFeatureStateAxisSeparationReferenceScenario.js';

const [SOURCE_REGION, DOMAINS_REGION, ENUMS_REGION, COERCION_REGION, OPEN_REGION, TERMINAL_REGION] =
  SYNTHETIC_FEATURE_STATE_AXIS_REGIONS_IN_ORDER;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#101827', color: '#f7fafc', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 76rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.3rem, 5vw, 2.55rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#8ee7d1', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #46bfa7', borderRadius: '0.8rem', background: '#f8fafc', color: '#17243a', overflowWrap: 'anywhere' },
  warning: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #d69e2e', borderRadius: '0.8rem', background: '#fff9e8', color: '#4a3510', overflowWrap: 'anywhere' },
  regionTitle: { margin: '0 0 1rem', color: '#0b5c68', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.65rem, 1.7vw, 0.9rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #718096', padding: 'clamp(0.25rem, 1vw, 0.65rem)', textAlign: 'left', verticalAlign: 'top', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#dff2ed', color: '#0b5c68', fontWeight: 800 },
  values: { background: '#eef3fb', color: '#23446c', fontWeight: 700 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #f6c453', borderRadius: '0.8rem', background: '#1d2d46', color: '#fff', overflowWrap: 'anywhere' },
  terminalTitle: { margin: '0 0 1rem', color: '#f6c453', fontSize: '1.05rem' },
  terminalToken: { margin: 0, color: '#f6c453', fontWeight: 800, overflowWrap: 'anywhere' },
  terminalLine: { margin: '0.75rem 0 0', fontWeight: 750, lineHeight: 1.5, overflowWrap: 'anywhere' }
};

function StaticList({ items }: { items: readonly string[] }) {
  return <ul style={styles.list}>{items.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>;
}

function DomainTable() {
  return (
    <table style={styles.table}>
      <caption>Five separate design-time or source-normative status domains — no runtime mapping</caption>
      <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Status domain</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Authority</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Values</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Boundary status</th></tr></thead>
      <tbody>{SYNTHETIC_FEATURE_STATE_AXIS_DOMAINS.map(domain => <tr key={domain.statusDomain}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{domain.statusDomain}</th><td style={styles.cell}>{domain.authority}</td><td style={{ ...styles.cell, ...styles.values }}>{domain.values.join(' | ')}</td><td style={styles.cell}>{domain.status}</td></tr>)}</tbody>
    </table>
  );
}

export default function SyntheticFeatureStateAxisSeparationReference() {
  return (
    <main style={styles.page}><div style={styles.shell}>
      <h1 style={styles.title}>{SYNTHETIC_FEATURE_STATE_AXIS_TITLE}</h1>
      <p style={styles.eyebrow}>{SYNTHETIC_FEATURE_STATE_AXIS_DISCLAIMER}</p>
      <p style={styles.eyebrow}>{SYNTHETIC_FEATURE_STATE_AXIS_SCOPE_LINE}</p>
      <section aria-label={SOURCE_REGION} style={styles.region}><h2 style={styles.regionTitle}>{SOURCE_REGION}</h2><StaticList items={SYNTHETIC_FEATURE_STATE_AXIS_SOURCE_BOUNDARY} /></section>
      <section aria-label={DOMAINS_REGION} style={styles.region}><h2 style={styles.regionTitle}>{DOMAINS_REGION}</h2><DomainTable /></section>
      <section aria-label={ENUMS_REGION} style={styles.region}><h2 style={styles.regionTitle}>{ENUMS_REGION}</h2><StaticList items={SYNTHETIC_FEATURE_STATE_AXIS_EXACT_ENUM_BOUNDARY} /></section>
      <section aria-label={COERCION_REGION} style={styles.warning}><h2 style={styles.regionTitle}>{COERCION_REGION}</h2><StaticList items={SYNTHETIC_FEATURE_STATE_AXIS_NON_COERCION} /></section>
      <section aria-label={OPEN_REGION} style={styles.region}><h2 style={styles.regionTitle}>{OPEN_REGION}</h2><StaticList items={SYNTHETIC_FEATURE_STATE_AXIS_OPEN_CONTENT} /></section>
      <section aria-label={TERMINAL_REGION} style={styles.terminal}><h2 style={styles.terminalTitle}>{TERMINAL_REGION}</h2><p style={styles.terminalToken}>{SYNTHETIC_FEATURE_STATE_AXIS_TERMINAL_TOKEN}</p><p style={styles.terminalLine}>{SYNTHETIC_FEATURE_STATE_AXIS_TERMINAL_LINE}</p></section>
    </div></main>
  );
}
