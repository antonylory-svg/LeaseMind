import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile, rm, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolveCtEvidence} from './evidence_matrix.mjs';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));
const embeddedLib = fileURLToPath(new URL('../node_modules/@embedded-postgres/linux-x64/native/lib/', import.meta.url));
const shim = `/tmp/leasemind-nonroot-shim-${process.pid}.so`;
const useExternalDatabase = Boolean(process.env.DATABASE_URL);
const rawDatabaseUrl = process.env.DATABASE_URL ?? '';
const scrubSecrets = text => {
  let scrubbed = String(text ?? '');
  if (rawDatabaseUrl) {
    scrubbed = scrubbed.split(rawDatabaseUrl).join('[DATABASE_URL redacted]');
  }
  return scrubbed.replace(/postgres(?:ql)?:\/\/[^\s"']+/gi, '[connection string redacted]');
};
const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: packageRoot,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    ...options
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed (exit ${result.status})\n` +
      `${scrubSecrets(result.stdout)}\n${scrubSecrets(result.stderr)}`
    );
  }
  if (!result.stdout || !result.stdout.trim()) {
    throw new Error(
      `${command} ${args.join(' ')} produced no stdout despite exit code 0\n` +
      `stderr: ${scrubSecrets(result.stderr).slice(0, 2000)}`
    );
  }
  return result;
};
const parseJsonOutput = (label, text) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} did not return valid JSON on stdout: ${error.message}`);
  }
};

let report;
try {
  const contract = run(process.execPath, ['tests/run_contract_suite.mjs']);
  const evidenceSelf = run(process.execPath, ['tests/run_evidence_self_tests.mjs']);

  let postgres;
  if (useExternalDatabase) {
    postgres = run(process.execPath, ['tests/run_postgres_suite.mjs']);
  } else if (process.platform !== 'linux') {
    throw new Error(
      'PostgreSQL suite requires an external disposable database on this platform: ' +
      'set DATABASE_URL to a disposable PostgreSQL 15+ instance (for example a local ' +
      'Docker container) and re-run. The Linux embedded-cluster path (gcc + LD_PRELOAD ' +
      'non-root shim) is only supported on Linux.'
    );
  } else {
    run('gcc', ['-shared', '-fPIC', '-ldl', '-o', shim, 'tests/local_postgres_nonroot_shim.c']);
    postgres = run(process.execPath, ['tests/run_postgres_suite.mjs'], {
      env: {
        ...process.env,
        HOME: '/tmp',
        LD_PRELOAD: shim,
        LD_LIBRARY_PATH: [embeddedLib, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')
      }
    });
  }
  const sourceManifest = await readFile(new URL('../manifest.sha256', import.meta.url), 'utf8')
    .catch(() => '');
  const contractOutput=parseJsonOutput('tests/run_contract_suite.mjs', contract.stdout);
  const postgresOutput=parseJsonOutput('tests/run_postgres_suite.mjs', postgres.stdout);
  const selfOutput=parseJsonOutput('tests/run_evidence_self_tests.mjs', evidenceSelf.stdout);
  const resolvedCt=resolveCtEvidence(contractOutput.results,postgresOutput.results);
  const unresolved=resolvedCt.filter(item=>item.status!=='PASS');
  if(unresolved.length) {
    throw new Error(`CT evidence unresolved: ${JSON.stringify(unresolved)}`);
  }
  report = {
    suite: 'LeaseMind Matching Data Contracts Offline Suite',
    contract_version: '1.0',
    architecture_version: '1.1',
    executed_at: new Date().toISOString(),
    synthetic_data_only: true,
    production_adapters_used: false,
    status: 'PASS',
    validators: contractOutput.validators,
    evidence_policy: {
      rule: 'CT PASS requires every exact dependency to exist and PASS and every semantic evidence requirement to match',
      missing_dependency: 'NOT_RUN',
      failing_dependency: 'BLOCKED',
      missing_or_undersized_semantic_evidence: 'BLOCKED',
      runner_self_tests: selfOutput.results
    },
    contract_tests: resolvedCt,
    raw_contract_assertions: contractOutput.results,
    postgres: {
      version: useExternalDatabase
        ? '15+ external disposable instance via DATABASE_URL'
        : '18.4 embedded disposable cluster',
      lifecycle: 'up → catalog/behavior assertions → down → empty post-down catalog',
      tests: postgresOutput.results,
      stderr_log_sha256: createHash('sha256').update(postgres.stderr).digest('hex')
    },
    source_manifest_sha256: createHash('sha256').update(sourceManifest).digest('hex')
  };
  await writeFile(new URL('../synthetic_verification_report.json', import.meta.url),
    `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(new URL('../postgres_execution.log', import.meta.url), scrubSecrets(postgres.stderr));
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} finally {
  await rm(shim, {force: true});
}
