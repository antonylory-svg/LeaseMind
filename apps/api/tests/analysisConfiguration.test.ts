import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadAnalysisDatabaseUrl,
  loadAnalysisWorkerDatabaseUrl,
  loadEvidenceRevocationDatabaseUrl
} from '../src/config.js';
import {
  ANALYSIS_WRITER_ROLE,
  ANALYSIS_WORKER_ROLE,
  EVIDENCE_REVOCATION_WRITER_ROLE,
  POST_LAUNCH_REFRESH_OWNER_ROLE
} from '../src/db/provisionRoles.js';

const CONNECTIONS = {
  LEASEMIND_ANALYSIS_DATABASE_URL: 'postgresql://analysis-writer.invalid/db',
  LEASEMIND_ANALYSIS_WORKER_DATABASE_URL: 'postgresql://analysis-worker.invalid/db',
  LEASEMIND_EVIDENCE_REVOCATION_DATABASE_URL: 'postgresql://evidence-writer.invalid/db'
};

test('Analysis connection loaders use only their dedicated environment variables', () => {
  const env = { ...CONNECTIONS, DATABASE_URL: 'postgresql://wrong-fallback.invalid/db' };
  assert.equal(loadAnalysisDatabaseUrl(env), CONNECTIONS.LEASEMIND_ANALYSIS_DATABASE_URL);
  assert.equal(loadAnalysisWorkerDatabaseUrl(env), CONNECTIONS.LEASEMIND_ANALYSIS_WORKER_DATABASE_URL);
  assert.equal(loadEvidenceRevocationDatabaseUrl(env), CONNECTIONS.LEASEMIND_EVIDENCE_REVOCATION_DATABASE_URL);
});

for (const [name, loader] of [
  ['LEASEMIND_ANALYSIS_DATABASE_URL', loadAnalysisDatabaseUrl],
  ['LEASEMIND_ANALYSIS_WORKER_DATABASE_URL', loadAnalysisWorkerDatabaseUrl],
  ['LEASEMIND_EVIDENCE_REVOCATION_DATABASE_URL', loadEvidenceRevocationDatabaseUrl]
] as const) {
  test(`${name} has no DATABASE_URL fallback`, () => {
    assert.throws(
      () => loader({ DATABASE_URL: 'postgresql://must-not-be-used.invalid/db' }),
      new RegExp(`Missing required environment variable: ${name}`)
    );
  });
}

test('ADR-0009 role identities remain fixed and non-configurable', () => {
  assert.deepEqual(
    [
      ANALYSIS_WRITER_ROLE,
      ANALYSIS_WORKER_ROLE,
      EVIDENCE_REVOCATION_WRITER_ROLE,
      POST_LAUNCH_REFRESH_OWNER_ROLE
    ],
    [
      'lmapp_analysis_writer',
      'lmapp_analysis_worker',
      'lmapp_evidence_revocation_writer',
      'lmapp_post_launch_refresh_owner'
    ]
  );
});
