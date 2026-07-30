import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { migrateUp } from '../src/db/migrate.js';
import { API_DATABASE_URL, MIGRATION_DATABASE_URL, hasDatabase } from './testDatabaseUrls.js';

// End-to-end proof (real spawned process, not just the unit-level function)
// that the runtime safety gate runs before any PostgreSQL connection attempt
// and before the HTTP port is bound.

const API_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNREACHABLE_DATABASE_URL = 'postgres://synthetic:synthetic@127.0.0.1:1/synthetic';

function buildChildEnv(overrides: Record<string, string | undefined>): NodeJS.ProcessEnv {
  const base: NodeJS.ProcessEnv = { ...process.env };
  delete base.DATABASE_URL;
  for (const key of Object.keys(base)) {
    if (key.startsWith('LEASEMIND_')) {
      delete base[key];
    }
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete base[key];
    } else {
      base[key] = value;
    }
  }
  return base;
}

interface RunResult {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

function runServerOnce(env: NodeJS.ProcessEnv, timeoutMs = 8000): Promise<RunResult> {
  return new Promise(resolve => {
    const child = spawn(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
      cwd: API_ROOT,
      env,
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);
    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });
    child.on('close', code => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, timedOut });
    });
  });
}

async function isPortOpen(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: '127.0.0.1', port }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => resolve(false));
  });
}

test('runtime safety violation is reported before DATABASE_URL is ever validated (proves it runs before any DB step)', async () => {
  const env = buildChildEnv({
    HOST: '127.0.0.1',
    PORT: '0',
    NODE_ENV: 'development',
    LEASEMIND_RUNTIME_MODE: 'production'
    // DATABASE_URL intentionally omitted: if the gate ran after config
    // loading, this would instead fail with "Missing required environment
    // variable: DATABASE_URL" -- a different, distinguishable error.
  });

  const result = await runServerOnce(env);

  assert.equal(result.timedOut, false, 'process must exit promptly, not hang on a DB/port step');
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /RUNTIME_SAFETY_VIOLATION/);
  assert.equal(result.stderr.includes('DATABASE_URL'), false);
  assert.equal(result.stderr.includes('Missing required environment variable'), false);
});

test('the HTTP port is never bound when the runtime safety gate rejects the environment', async () => {
  const testPort = 34567;
  const env = buildChildEnv({
    HOST: '127.0.0.1',
    PORT: String(testPort),
    NODE_ENV: 'development',
    DATABASE_URL: UNREACHABLE_DATABASE_URL,
    LEASEMIND_PRODUCTION_LAUNCH_GATE: 'open'
  });

  const result = await runServerOnce(env);

  assert.equal(result.timedOut, false);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /RUNTIME_SAFETY_VIOLATION/);

  const portIsOpen = await isPortOpen(testPort);
  assert.equal(portIsOpen, false, 'the port must never have been opened');
});

test('spawned-process error output does not leak the synthetic DATABASE_URL credential marker', async () => {
  const env = buildChildEnv({
    HOST: '127.0.0.1',
    PORT: '34568',
    NODE_ENV: 'development',
    DATABASE_URL: UNREACHABLE_DATABASE_URL,
    LEASEMIND_ALLOW_REAL_PII: 'true'
  });

  const result = await runServerOnce(env);

  assert.equal(result.timedOut, false);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /RUNTIME_SAFETY_VIOLATION/);
  assert.equal(result.stderr.includes(UNREACHABLE_DATABASE_URL), false);
  assert.equal(result.stderr.includes('synthetic:synthetic'), false);
  assert.equal(result.stderr.includes('password'), false);
});

// This test requires a real, reachable, correctly-provisioned database:
// startup now also runs verifyRuntimeDatabasePrivileges() (ADR-0005) against
// a live pool, after the runtime safety gate and before app.listen(), so an
// unreachable DATABASE_URL would itself cause a (correct) startup refusal.
// It does not assume anything about execution order relative to
// tests/campaigns.test.ts or tests/openapiContract.test.ts (each of which
// independently owns its own migration lifecycle, including tearing the
// schema down at its own end) -- it re-applies migrate:up itself first.
test('migration up (fresh) prepares the schema for the safe-startup probe', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(pool);
  } finally {
    await pool.end();
  }
});

test(
  'the server starts normally (no runtime safety or database privilege violation) with a fully safe explicit environment',
  { skip: !hasDatabase },
  async () => {
    const testPort = 34569;
    const env = buildChildEnv({
      HOST: '127.0.0.1',
      PORT: String(testPort),
      NODE_ENV: 'development',
      DATABASE_URL: API_DATABASE_URL,
      LEASEMIND_RUNTIME_MODE: 'synthetic',
      LEASEMIND_PRODUCTION_LAUNCH_GATE: 'blocked',
      LEASEMIND_ALLOW_REAL_PII: 'false',
      LEASEMIND_ALLOW_REAL_PAYMENTS: 'false',
      LEASEMIND_ALLOW_PROTECTED_REVEAL: 'false',
      LEASEMIND_ALLOW_PRODUCTION_ADAPTERS: 'false'
    });

    const child = spawn(process.execPath, ['--import', 'tsx', 'src/server.ts'], {
      cwd: API_ROOT,
      env,
      windowsHide: true
    });
    let stderr = '';
    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    try {
      const opened = await new Promise<boolean>(resolve => {
        const deadline = Date.now() + 5000;
        const poll = async () => {
          if (await isPortOpen(testPort)) {
            resolve(true);
            return;
          }
          if (Date.now() > deadline) {
            resolve(false);
            return;
          }
          setTimeout(poll, 100);
        };
        void poll();
      });

      assert.equal(opened, true, 'server should bind the port when the environment is fully safe');
      assert.equal(stderr.includes('RUNTIME_SAFETY_VIOLATION'), false);
      assert.equal(stderr.includes('DATABASE_PRIVILEGE_VIOLATION'), false);
    } finally {
      child.kill();
    }
  }
);
