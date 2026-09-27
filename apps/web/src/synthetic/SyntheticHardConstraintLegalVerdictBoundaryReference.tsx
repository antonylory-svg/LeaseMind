import type { CSSProperties } from 'react';
import {
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_AUTOMATIC_INELIGIBLE,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CANDIDATES,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CANDIDATE_STATUS,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CONFIRMED_RESTRICTION_BOUNDARY,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_DISCLAIMER,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_EVIDENCE_BOUNDARY,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_REGIONS_IN_ORDER,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_SCOPE_LINE,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_SOURCE_BOUNDARY,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TERMINAL_LINE,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TERMINAL_TOKEN,
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TITLE
} from './syntheticHardConstraintLegalVerdictBoundaryReferenceScenario.js';

const [SOURCE_REGION, CANDIDATE_REGION, RESTRICTION_REGION, EVIDENCE_REGION, TERMINAL_REGION] =
  SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_REGIONS_IN_ORDER;

const styles: Record<string, CSSProperties> = {
  page: { boxSizing: 'border-box', minHeight: '100vh', width: '100%', overflowX: 'hidden', background: '#101827', color: '#f7fafc', fontFamily: 'system-ui, sans-serif', padding: 'clamp(1rem, 4vw, 3rem)' },
  shell: { boxSizing: 'border-box', width: 'min(100%, 76rem)', margin: '0 auto', minWidth: 0 },
  title: { margin: '0 0 1rem', color: '#fff', fontSize: 'clamp(1.3rem, 5vw, 2.55rem)', lineHeight: 1.15, overflowWrap: 'anywhere' },
  eyebrow: { margin: '0.45rem 0', color: '#8ee7d1', fontWeight: 750, letterSpacing: '0.04em', overflowWrap: 'anywhere' },
  region: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #46bfa7', borderRadius: '0.8rem', background: '#f8fafc', color: '#17243a', overflowWrap: 'anywhere' },
  warningRegion: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(0.75rem, 3vw, 1.5rem)', border: '2px solid #d69e2e', borderRadius: '0.8rem', background: '#fff9e8', color: '#4a3510', overflowWrap: 'anywhere' },
  regionTitle: { margin: '0 0 1rem', color: '#0b5c68', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.4, overflowWrap: 'anywhere' },
  list: { margin: 0, paddingLeft: '1.25rem' },
  item: { margin: '0.55rem 0', fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' },
  table: { boxSizing: 'border-box', borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', minWidth: 0, fontSize: 'clamp(0.68rem, 1.8vw, 0.92rem)' },
  cell: { boxSizing: 'border-box', border: '1px solid #718096', padding: 'clamp(0.25rem, 1vw, 0.65rem)', textAlign: 'left', verticalAlign: 'top', overflowWrap: 'anywhere', wordBreak: 'break-word' },
  header: { background: '#dff2ed', color: '#0b5c68', fontWeight: 800 },
  candidate: { background: '#eef3fb', color: '#23446c', fontWeight: 700 },
  terminal: { boxSizing: 'border-box', minWidth: 0, marginTop: '1rem', padding: 'clamp(1rem, 3vw, 1.5rem)', border: '2px solid #f6c453', borderRadius: '0.8rem', background: '#1d2d46', color: '#fff', overflowWrap: 'anywhere' },
  terminalTitle: { margin: '0 0 1rem', color: '#f6c453', fontSize: '1.05rem' },
  terminalToken: { margin: 0, color: '#f6c453', fontWeight: 800, overflowWrap: 'anywhere' },
  terminalLine: { margin: '0.75rem 0 0', fontWeight: 750, lineHeight: 1.5, overflowWrap: 'anywhere' }
};

function CandidateTable() {
  return (
    <table style={styles.table}>
      <caption>Pre-authored Feature Schema §5.1 candidate inventory — no verdict or eligibility action</caption>
      <thead>
        <tr>
          <th scope="col" style={{ ...styles.cell, ...styles.header }}>№</th>
          <th scope="col" style={{ ...styles.cell, ...styles.header }}>feature_id</th>
          <th scope="col" style={{ ...styles.cell, ...styles.header }}>Current candidate status</th>
          <th scope="col" style={{ ...styles.cell, ...styles.header }}>Automatic INELIGIBLE allowed</th>
        </tr>
      </thead>
      <tbody>
        {SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CANDIDATES.map(candidate => (
          <tr key={candidate.featureId}>
            <th scope="row" style={{ ...styles.cell, ...styles.header }}>{candidate.ordinal}</th>
            <td style={styles.cell}>{candidate.featureId}</td>
            <td style={{ ...styles.cell, ...styles.candidate }}>{SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CANDIDATE_STATUS} — NO FINAL LEGAL VERDICT</td>
            <td style={styles.cell}>{SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_AUTOMATIC_INELIGIBLE}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StaticList({ items }: { items: readonly string[] }) {
  return <ul style={styles.list}>{items.map(item => <li key={item} style={styles.item}>{item}</li>)}</ul>;
}

export default function SyntheticHardConstraintLegalVerdictBoundaryReference() {
  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <h1 style={styles.title}>{SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TITLE}</h1>
        <p style={styles.eyebrow}>{SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_DISCLAIMER}</p>
        <p style={styles.eyebrow}>{SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_SCOPE_LINE}</p>

        <section aria-label={SOURCE_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{SOURCE_REGION}</h2>
          <StaticList items={SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_SOURCE_BOUNDARY} />
        </section>

        <section aria-label={CANDIDATE_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{CANDIDATE_REGION}</h2>
          <CandidateTable />
        </section>

        <section aria-label={RESTRICTION_REGION} style={styles.warningRegion}>
          <h2 style={styles.regionTitle}>{RESTRICTION_REGION}</h2>
          <StaticList items={SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_CONFIRMED_RESTRICTION_BOUNDARY} />
        </section>

        <section aria-label={EVIDENCE_REGION} style={styles.region}>
          <h2 style={styles.regionTitle}>{EVIDENCE_REGION}</h2>
          <StaticList items={SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_EVIDENCE_BOUNDARY} />
        </section>

        <section aria-label={TERMINAL_REGION} style={styles.terminal}>
          <h2 style={styles.terminalTitle}>{TERMINAL_REGION}</h2>
          <p style={styles.terminalToken}>{SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TERMINAL_TOKEN}</p>
          <p style={styles.terminalLine}>{SYNTHETIC_HARD_CONSTRAINT_LEGAL_VERDICT_TERMINAL_LINE}</p>
        </section>
      </div>
    </main>
  );
}

