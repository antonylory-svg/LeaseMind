import type { CSSProperties } from 'react';
import {
  SYNTHETIC_BUDGET_BASIS_CASES,
  SYNTHETIC_BUDGET_BASIS_MISMATCH_BOUNDARY,
  SYNTHETIC_BUDGET_BASIS_OPEN_BOUNDARIES,
  SYNTHETIC_BUDGET_BASIS_REFERENCE_DISCLAIMER,
  SYNTHETIC_BUDGET_BASIS_REFERENCE_REGIONS_IN_ORDER,
  SYNTHETIC_BUDGET_BASIS_REFERENCE_SCOPE_LINE,
  SYNTHETIC_BUDGET_BASIS_REFERENCE_TITLE,
  SYNTHETIC_BUDGET_BASIS_SOURCE_BOUNDARY,
  SYNTHETIC_BUDGET_BASIS_TERMINAL_LINE,
  SYNTHETIC_BUDGET_BASIS_TERMINAL_TOKEN
} from './syntheticBudgetBasisMismatchReferenceScenario.js';

const [SOURCE_REGION, TABLE_REGION, MISMATCH_REGION, OPEN_REGION, TERMINAL_REGION] =
  SYNTHETIC_BUDGET_BASIS_REFERENCE_REGIONS_IN_ORDER;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#071522', color: '#f5f7fb', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 74rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.35rem, 5vw, 2.6rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#9ce8db', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #3fbca9', borderRadius: '0.8rem', background: '#f7fafc', color: '#10243a', overflowWrap: 'anywhere' },
  regionTitle: { margin: '0 0 1rem', color: '#0b536b', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.66rem, 1.8vw, 0.92rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #6f8999', padding: 'clamp(0.25rem, 1vw, 0.7rem)', textAlign: 'left', verticalAlign: 'top', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#dcefea', color: '#0b536b', fontWeight: 800 },
  aligned: { background: '#e7eef8', color: '#183d61', fontWeight: 700 },
  mismatch: { background: '#fff2c7', color: '#674700', fontWeight: 750 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #ffd166', borderRadius: '0.8rem', background: '#182c43', color: '#fff', overflowWrap: 'anywhere' },
  terminalTitle: { margin: '0 0 1rem', color: '#ffd166', fontSize: '1.05rem' },
  terminalToken: { margin: 0, color: '#ffd166', fontWeight: 800, overflowWrap: 'anywhere' },
  terminalLine: { margin: '0.75rem 0 0', fontWeight: 750, lineHeight: 1.5, overflowWrap: 'anywhere' }
};

function BasisTable() {
  return (
    <table style={styles.table}>
      <caption>Pre-authored qualitative basis reference — no source record and no comparison</caption>
      <thead>
        <tr>
          <th scope="col" style={{ ...styles.cell, ...styles.header }}>Property expenses included</th>
          <th scope="col" style={{ ...styles.cell, ...styles.header }}>Request budget includes expenses</th>
          <th scope="col" style={{ ...styles.cell, ...styles.header }}>Basis boundary</th>
          <th scope="col" style={{ ...styles.cell, ...styles.header }}>Explicit non-result</th>
        </tr>
      </thead>
      <tbody>
        {SYNTHETIC_BUDGET_BASIS_CASES.map(boundaryCase => (
          <tr key={`${boundaryCase.propertyOperatingExpensesIncluded}-${boundaryCase.requestBudgetIncludesOperatingExpenses}`}>
            <th scope="row" style={{ ...styles.cell, ...styles.header }}>{boundaryCase.propertyOperatingExpensesIncluded}</th>
            <td style={styles.cell}>{boundaryCase.requestBudgetIncludesOperatingExpenses}</td>
            <td style={{ ...styles.cell, ...(boundaryCase.basisStatus === 'BASIS_ALIGNED' ? styles.aligned : styles.mismatch) }}>{boundaryCase.basisStatus} — {boundaryCase.boundary}</td>
            <td style={styles.cell}>{boundaryCase.notAResult}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StaticList({ items }: { items: readonly string[] }) {
  return <ul style={styles.list}>{items.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>;
}

export default function SyntheticBudgetBasisMismatchReference() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>{SYNTHETIC_BUDGET_BASIS_REFERENCE_TITLE}</h1>
        <p style={styles.eyebrow}>{SYNTHETIC_BUDGET_BASIS_REFERENCE_DISCLAIMER}</p>
        <p style={styles.eyebrow}>{SYNTHETIC_BUDGET_BASIS_REFERENCE_SCOPE_LINE}</p>

        <section aria-label={SOURCE_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{SOURCE_REGION}</h2>
          <StaticList items={SYNTHETIC_BUDGET_BASIS_SOURCE_BOUNDARY} />
        </section>

        <section aria-label={TABLE_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{TABLE_REGION}</h2>
          <BasisTable />
        </section>

        <section aria-label={MISMATCH_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{MISMATCH_REGION}</h2>
          <StaticList items={SYNTHETIC_BUDGET_BASIS_MISMATCH_BOUNDARY} />
        </section>

        <section aria-label={OPEN_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{OPEN_REGION}</h2>
          <StaticList items={SYNTHETIC_BUDGET_BASIS_OPEN_BOUNDARIES} />
        </section>

        <section aria-label={TERMINAL_REGION} style={styles.terminal}>
          <h2 style={styles.terminalTitle}>{TERMINAL_REGION}</h2>
          <p style={styles.terminalToken}>{SYNTHETIC_BUDGET_BASIS_TERMINAL_TOKEN}</p>
          <p style={styles.terminalLine}>{SYNTHETIC_BUDGET_BASIS_TERMINAL_LINE}</p>
        </section>
      </div>
    </main>
  );
}
