import type { CSSProperties } from 'react';
import {
  SYNTHETIC_FLOOR_OPTION_APPROVED_CASES,
  SYNTHETIC_FLOOR_OPTION_OPEN_AND_INDEPENDENCE_BOUNDARIES,
  SYNTHETIC_FLOOR_OPTION_REFERENCE_DISCLAIMER,
  SYNTHETIC_FLOOR_OPTION_REFERENCE_REGIONS_IN_ORDER,
  SYNTHETIC_FLOOR_OPTION_REFERENCE_SCOPE_LINE,
  SYNTHETIC_FLOOR_OPTION_REFERENCE_TITLE,
  SYNTHETIC_FLOOR_OPTION_SOURCE_BOUNDARY,
  SYNTHETIC_FLOOR_OPTION_TERMINAL_LINE,
  SYNTHETIC_FLOOR_OPTION_TERMINAL_TOKEN
} from './syntheticFloorOptionBoundaryReferenceScenario.js';

const [SOURCE_REGION, WILDCARD_REGION, LAND_REGION, OPEN_REGION, TERMINAL_REGION] =
  SYNTHETIC_FLOOR_OPTION_REFERENCE_REGIONS_IN_ORDER;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#081421', color: '#f5f7fb', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 72rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.4rem, 5vw, 2.6rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#a9f0e4', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #43c3ae', borderRadius: '0.8rem', background: '#f7fafc', color: '#10243a', overflowWrap: 'anywhere' },
  regionTitle: { margin: '0 0 1rem', color: '#0b536b', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.72rem, 2vw, 0.95rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #6f8999', padding: 'clamp(0.3rem, 1.2vw, 0.75rem)', textAlign: 'left', verticalAlign: 'top', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#dcefea', color: '#0b536b', fontWeight: 800 },
  approved: { background: '#d9f3df', color: '#174c28', fontWeight: 700 },
  prohibited: { background: '#fff2c7', color: '#674700', fontWeight: 700 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #ffd166', borderRadius: '0.8rem', background: '#182c43', color: '#fff', overflowWrap: 'anywhere' },
  terminalTitle: { margin: '0 0 1rem', color: '#ffd166', fontSize: '1.05rem' },
  terminalToken: { margin: 0, color: '#ffd166', fontWeight: 800, overflowWrap: 'anywhere' },
  terminalLine: { margin: '0.75rem 0 0', fontWeight: 750, lineHeight: 1.5, overflowWrap: 'anywhere' }
};

function CasesTable() {
  return (
    <table style={styles.table}>
      <caption>Pre-authored qualitative governance boundary — no source record and no comparison</caption>
      <thead><tr><th scope="col" style={{ ...styles.cell, ...styles.header }}>Abstract source condition</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Approved boundary</th><th scope="col" style={{ ...styles.cell, ...styles.header }}>Explicitly not approved</th></tr></thead>
      <tbody>{SYNTHETIC_FLOOR_OPTION_APPROVED_CASES.map(boundaryCase => <tr key={boundaryCase.condition}><th scope="row" style={{ ...styles.cell, ...styles.header }}>{boundaryCase.condition}</th><td style={{ ...styles.cell, ...styles.approved }}>{boundaryCase.approvedBoundary}</td><td style={{ ...styles.cell, ...styles.prohibited }}>{boundaryCase.notApproved}</td></tr>)}</tbody>
    </table>
  );
}

function CaseSummary({ caseIndex }: { caseIndex: number }) {
  const boundaryCase = SYNTHETIC_FLOOR_OPTION_APPROVED_CASES[caseIndex];
  return <ul style={styles.list}><li style={styles.item}>{boundaryCase.condition}</li><li style={styles.item}>{boundaryCase.approvedBoundary}</li><li style={styles.item}>{boundaryCase.notApproved}</li></ul>;
}

export default function SyntheticFloorOptionBoundaryReference() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>{SYNTHETIC_FLOOR_OPTION_REFERENCE_TITLE}</h1>
        <p style={styles.eyebrow}>{SYNTHETIC_FLOOR_OPTION_REFERENCE_DISCLAIMER}</p>
        <p style={styles.eyebrow}>{SYNTHETIC_FLOOR_OPTION_REFERENCE_SCOPE_LINE}</p>

        <section aria-label={SOURCE_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{SOURCE_REGION}</h2>
          <ul style={styles.list}>{SYNTHETIC_FLOOR_OPTION_SOURCE_BOUNDARY.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>
          <CasesTable />
        </section>

        <section aria-label={WILDCARD_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{WILDCARD_REGION}</h2>
          <CaseSummary caseIndex={0} />
        </section>

        <section aria-label={LAND_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{LAND_REGION}</h2>
          <CaseSummary caseIndex={1} />
        </section>

        <section aria-label={OPEN_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{OPEN_REGION}</h2>
          <ul style={styles.list}>{SYNTHETIC_FLOOR_OPTION_OPEN_AND_INDEPENDENCE_BOUNDARIES.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>
        </section>

        <section aria-label={TERMINAL_REGION} style={styles.terminal}>
          <h2 style={styles.terminalTitle}>{TERMINAL_REGION}</h2>
          <p style={styles.terminalToken}>{SYNTHETIC_FLOOR_OPTION_TERMINAL_TOKEN}</p>
          <p style={styles.terminalLine}>{SYNTHETIC_FLOOR_OPTION_TERMINAL_LINE}</p>
        </section>
      </div>
    </main>
  );
}
