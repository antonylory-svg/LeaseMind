import type { CSSProperties } from 'react';
import {
  SYNTHETIC_ACCESS_MODE_AXES,
  SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_DISCLAIMER,
  SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_REGIONS_IN_ORDER,
  SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_SCOPE_LINE,
  SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_TITLE,
  SYNTHETIC_ACCESS_MODE_FAIL_CLOSED_BOUNDARIES,
  SYNTHETIC_ACCESS_MODE_FLAT_ENUM_BOUNDARIES,
  SYNTHETIC_ACCESS_MODE_MATRIX,
  SYNTHETIC_ACCESS_MODE_SOURCE_BOUNDARY,
  SYNTHETIC_ACCESS_MODE_TERMINAL_LINE,
  SYNTHETIC_ACCESS_MODE_TERMINAL_TOKEN
} from './syntheticAccessModeCompatibilityReferenceScenario.js';

const [SOURCE_REGION, AXES_REGION, MATRIX_REGION, FAIL_CLOSED_REGION, TERMINAL_REGION] =
  SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_REGIONS_IN_ORDER;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#081421', color: '#f5f7fb', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 78rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.45rem, 5vw, 2.65rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#a9f0e4', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.8rem, 3vw, 1.5rem)', border: '2px solid #43c3ae', borderRadius: '0.8rem', background: '#f7fafc', color: '#10243a', overflowWrap: 'anywhere' },
  regionTitle: { margin: '0 0 1rem', color: '#0b536b', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.55rem, 2vw, 0.9rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #6f8999', padding: 'clamp(0.2rem, 1vw, 0.55rem)', textAlign: 'center', verticalAlign: 'middle', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#dcefea', color: '#0b536b', fontWeight: 800 },
  compatible: { background: '#d9f3df', color: '#174c28', fontWeight: 800 },
  verification: { background: '#fff2c7', color: '#674700', fontWeight: 800 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #ffd166', borderRadius: '0.8rem', background: '#182c43', color: '#fff', overflowWrap: 'anywhere' },
  terminalTitle: { margin: '0 0 1rem', color: '#ffd166', fontSize: '1.05rem' },
  terminalToken: { margin: 0, color: '#ffd166', fontWeight: 800, overflowWrap: 'anywhere' },
  terminalLine: { margin: '0.75rem 0 0', fontWeight: 750, lineHeight: 1.5, overflowWrap: 'anywhere' }
};

export default function SyntheticAccessModeCompatibilityReference() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>{SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_TITLE}</h1>
        <p style={styles.eyebrow}>{SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_DISCLAIMER}</p>
        <p style={styles.eyebrow}>{SYNTHETIC_ACCESS_MODE_COMPATIBILITY_REFERENCE_SCOPE_LINE}</p>

        <section aria-label={SOURCE_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{SOURCE_REGION}</h2>
          <ul style={styles.list}>{SYNTHETIC_ACCESS_MODE_SOURCE_BOUNDARY.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>
        </section>

        <section aria-label={AXES_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{AXES_REGION}</h2>
          <ol style={styles.list}>{SYNTHETIC_ACCESS_MODE_AXES.map(item => <li key={item} style={styles.item}>{item}</li>)}</ol>
          <ul style={styles.list}>{SYNTHETIC_ACCESS_MODE_FLAT_ENUM_BOUNDARIES.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>
        </section>

        <section aria-label={MATRIX_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{MATRIX_REGION}</h2>
          <table style={styles.table}>
            <caption>Property-side rows by TenantRequest-side columns — pre-authored reference copy</caption>
            <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Property \ Request</th>{SYNTHETIC_ACCESS_MODE_AXES.map(axis => <th key={axis} scope="col" style={{ ...styles.cell, ...styles.header }}>{axis}</th>)}</tr></thead>
            <tbody>{SYNTHETIC_ACCESS_MODE_AXES.map((propertyAxis, rowIndex) => <tr key={propertyAxis}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{propertyAxis}</th>{SYNTHETIC_ACCESS_MODE_MATRIX[rowIndex].map((status, columnIndex) => <td key={`${propertyAxis}-${SYNTHETIC_ACCESS_MODE_AXES[columnIndex]}`} style={{ ...styles.cell, ...(status === 'COMPATIBLE' ? styles.compatible : styles.verification) }}>{status}</td>)}</tr>)}</tbody>
          </table>
        </section>

        <section aria-label={FAIL_CLOSED_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{FAIL_CLOSED_REGION}</h2>
          <ul style={styles.list}>{SYNTHETIC_ACCESS_MODE_FAIL_CLOSED_BOUNDARIES.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>
        </section>

        <section aria-label={TERMINAL_REGION} style={styles.terminal}>
          <h2 style={styles.terminalTitle}>{TERMINAL_REGION}</h2>
          <p style={styles.terminalToken}>{SYNTHETIC_ACCESS_MODE_TERMINAL_TOKEN}</p>
          <p style={styles.terminalLine}>{SYNTHETIC_ACCESS_MODE_TERMINAL_LINE}</p>
        </section>
      </div>
    </main>
  );
}
