import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { migrateUp } from '../src/db/migrate.js';
import {
  EVIDENCE_DATASET_ALREADY_REVOKED,
  EVIDENCE_REVOCATION_ARGUMENT_INVALID,
  EvidenceDatasetRevocationError,
  parseEvidenceDatasetRevocationArgs
} from '../src/db/evidenceDatasetRevocation.js';
import {
  ANALYSIS_DATABASE_URL,
  EVIDENCE_REVOCATION_DATABASE_URL,
  MIGRATION_DATABASE_URL,
  hasAnalysisDatabase
} from './testDatabaseUrls.js';

const TEST_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const RUNNING_COMPILED = path.basename(path.dirname(TEST_DIRECTORY)) === 'dist';
const API_ROOT = RUNNING_COMPILED ? path.join(TEST_DIRECTORY, '..', '..') : path.join(TEST_DIRECTORY, '..');
const REPOSITORY_ROOT = path.join(API_ROOT, '..', '..');
const CLI_ARGS = RUNNING_COMPILED
  ? ['dist/src/db/revoke-evidence-dataset-cli.js']
  : ['--import', 'tsx', 'src/db/revoke-evidence-dataset-cli.ts'];

interface CliResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

function revision(label: string): string {
  return createHash('sha256').update(`${label}:${Date.now()}:${Math.random()}`).digest('hex');
}

function runCli(args: string[], databaseUrl = EVIDENCE_REVOCATION_DATABASE_URL): Promise<CliResult> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    LEASEMIND_EVIDENCE_REVOCATION_DATABASE_URL: databaseUrl,
    LEASEMIND_RUNTIME_MODE: 'synthetic',
    LEASEMIND_PRODUCTION_LAUNCH_GATE: 'blocked',
    LEASEMIND_ALLOW_REAL_PII: 'false',
    LEASEMIND_ALLOW_REAL_PAYMENTS: 'false',
    LEASEMIND_ALLOW_PROTECTED_REVEAL: 'false',
    LEASEMIND_ALLOW_PRODUCTION_ADAPTERS: 'false'
  };
  return new Promise(resolve => {
    const child = spawn(process.execPath, [...CLI_ARGS, ...args], {
      cwd: API_ROOT,
      env,
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk.toString(); });
    child.stderr.on('data', chunk => { stderr += chunk.toString(); });
    child.on('close', code => resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() }));
  });
}

test('evidence revocation arguments are strict and complete', () => {
  const parsed = parseEvidenceDatasetRevocationArgs([
    '--evidence-dataset-revision', 'a'.repeat(64),
    '--reason-code', 'SOURCE_WITHDRAWN',
    '--actor-ref', 'ticket:LM-42',
    '--execute'
  ]);
  assert.deepEqual(parsed, {
    evidenceDatasetRevision: 'a'.repeat(64),
    reasonCode: 'SOURCE_WITHDRAWN',
    actorRef: 'ticket:LM-42',
    execute: true
  });

  for (const invalid of [
    [],
    ['--evidence-dataset-revision', 'A'.repeat(64), '--reason-code', 'SOURCE_WITHDRAWN', '--actor-ref', 'ticket:LM-42'],
    ['--evidence-dataset-revision', 'a'.repeat(64), '--reason-code', 'lowercase', '--actor-ref', 'ticket:LM-42'],
    ['--evidence-dataset-revision', 'a'.repeat(64), '--reason-code', 'SOURCE_WITHDRAWN', '--actor-ref', ''],
    ['--evidence-dataset-revision', 'a'.repeat(64), '--reason-code', 'SOURCE_WITHDRAWN', '--actor-ref', 'ticket:LM-42', '--unknown']
  ]) {
    assert.throws(
      () => parseEvidenceDatasetRevocationArgs(invalid),
      (error: unknown) => error instanceof EvidenceDatasetRevocationError
        && error.safeCode === EVIDENCE_REVOCATION_ARGUMENT_INVALID
    );
  }
});

test('evidence revocation CLI is exposed only as the dedicated operational entrypoint', async () => {
  const [rootPackageRaw, apiPackageRaw, cliSource] = await Promise.all([
    readFile(path.join(REPOSITORY_ROOT, 'package.json'), 'utf8'),
    readFile(path.join(API_ROOT, 'package.json'), 'utf8'),
    readFile(path.join(API_ROOT, 'src', 'db', 'revoke-evidence-dataset-cli.ts'), 'utf8')
  ]);
  const rootPackage = JSON.parse(rootPackageRaw);
  const apiPackage = JSON.parse(apiPackageRaw);
  assert.equal(
    rootPackage.scripts['revoke-evidence-dataset'],
    'npm run revoke-evidence-dataset --workspace apps/api --'
  );
  assert.equal(
    apiPackage.scripts['revoke-evidence-dataset'],
    'node --env-file-if-exists=.env --import tsx src/db/revoke-evidence-dataset-cli.ts'
  );
  assert.match(cliSource, /parseEvidenceDatasetRevocationArgs\(process\.argv\.slice\(2\)\)/);
  assert.match(cliSource, /loadEvidenceRevocationDatabaseUrl\(\)/);
  assert.match(cliSource, /verifyRuntimeEvidenceRevocationPrivileges\(pool\)/);
  assert.doesNotMatch(cliSource, /console\.(?:error|log)\(error/);
  assert.doesNotMatch(cliSource, /JSON\.stringify\(error/);
});

test('invalid CLI arguments fail before an unavailable database can be contacted', async () => {
  const result = await runCli(
    ['--evidence-dataset-revision', 'invalid'],
    'postgresql://invalid:invalid@127.0.0.1:1/unavailable'
  );
  assert.notEqual(result.code, 0);
  assert.equal(result.stdout, '');
  assert.deepEqual(JSON.parse(result.stderr), {
    event: 'evidence_dataset_revocation_failed',
    safe_error_code: EVIDENCE_REVOCATION_ARGUMENT_INVALID
  });
});

test('CLI dry-run is read-only; execute is append-only and duplicate execute fails', { skip: !hasAnalysisDatabase }, async () => {
  const migrationPool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  const evidencePool = new pg.Pool({ connectionString: EVIDENCE_REVOCATION_DATABASE_URL, max: 1 });
  const evidenceRevision = revision('evidence-cli');
  const commonArgs = [
    '--evidence-dataset-revision', evidenceRevision,
    '--reason-code', 'SYNTHETIC_SOURCE_WITHDRAWN',
    '--actor-ref', 'ticket:LM-SYNTHETIC-42'
  ];
  try {
    await migrateUp(migrationPool);
    const before = await evidencePool.query<{ count: string }>(
      'SELECT count(evidence_dataset_revision)::text AS count FROM leasemind_app.evidence_dataset_revocation'
    );

    const dryRun = await runCli(commonArgs);
    assert.equal(dryRun.code, 0, dryRun.stderr);
    assert.equal(dryRun.stderr, '');
    assert.deepEqual(JSON.parse(dryRun.stdout), {
      event: 'evidence_dataset_revocation_dry_run_completed',
      evidence_dataset_revision: evidenceRevision,
      reason_code: 'SYNTHETIC_SOURCE_WITHDRAWN',
      already_revoked: false
    });
    const afterDryRun = await evidencePool.query<{ count: string }>(
      'SELECT count(evidence_dataset_revision)::text AS count FROM leasemind_app.evidence_dataset_revocation'
    );
    assert.equal(afterDryRun.rows[0].count, before.rows[0].count);

    const executed = await runCli([...commonArgs, '--execute']);
    assert.equal(executed.code, 0, executed.stderr);
    assert.equal(executed.stderr, '');
    assert.deepEqual(JSON.parse(executed.stdout), {
      event: 'evidence_dataset_revoked',
      evidence_dataset_revision: evidenceRevision,
      reason_code: 'SYNTHETIC_SOURCE_WITHDRAWN'
    });
    assert.equal(executed.stdout.includes('ticket:LM-SYNTHETIC-42'), false);

    const afterExecute = await evidencePool.query<{ count: string }>(
      'SELECT count(evidence_dataset_revision)::text AS count FROM leasemind_app.evidence_dataset_revocation'
    );
    assert.equal(Number(afterExecute.rows[0].count), Number(before.rows[0].count) + 1);

    const duplicate = await runCli([...commonArgs, '--execute']);
    assert.notEqual(duplicate.code, 0);
    assert.equal(duplicate.stdout, '');
    assert.deepEqual(JSON.parse(duplicate.stderr), {
      event: 'evidence_dataset_revocation_failed',
      safe_error_code: EVIDENCE_DATASET_ALREADY_REVOKED
    });
  } finally {
    await Promise.all([migrationPool.end(), evidencePool.end()]);
  }
});

test('CLI privilege gate rejects an interchangeable Analysis writer connection', { skip: !hasAnalysisDatabase }, async () => {
  const result = await runCli([
    '--evidence-dataset-revision', revision('wrong-role'),
    '--reason-code', 'SYNTHETIC_WRONG_ROLE_PROBE',
    '--actor-ref', 'test:wrong-role'
  ], ANALYSIS_DATABASE_URL);
  assert.notEqual(result.code, 0);
  assert.equal(result.stdout, '');
  assert.deepEqual(JSON.parse(result.stderr), {
    event: 'evidence_dataset_revocation_failed',
    safe_error_code: 'DATABASE_PRIVILEGE_VIOLATION'
  });
});
