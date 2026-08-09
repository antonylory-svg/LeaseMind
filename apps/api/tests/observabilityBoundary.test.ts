import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Writable } from 'node:stream';
import pino from 'pino';
import pg from 'pg';
import { buildApp } from '../src/app.js';
import { migrateUp, migrateDown } from '../src/db/migrate.js';
import { seedCampaigns, SYNTHETIC_CAMPAIGN_SEEDS } from '../src/db/seed.js';
import {
  genReqId,
  safeRoute,
  SafeLogController,
  loggerOptions,
  UNMATCHED_ROUTE
} from '../src/observability/logging.js';
import {
  MIGRATION_DATABASE_URL,
  MAINTENANCE_DATABASE_URL,
  API_DATABASE_URL,
  COMMAND_DATABASE_URL,
  TA_DATABASE_URL,
  hasDatabase
} from './testDatabaseUrls.js';

// Secure application observability boundary -- see
// 03_ARCHITECTURE/decisions/ADR-0006-secure-application-observability-boundary.md.
//
// This file owns its own migration/seed/teardown lifecycle, independent of
// the other test files (safe because package.json runs test files
// sequentially via --test-concurrency=1).
//
// All log capture here is purely in-memory (a Writable collecting chunks, or
// a spawned child process's stdout/stderr accumulated in a string) -- no
// runtime log file is ever written to disk or the repository.

const API_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const UNREACHABLE_DATABASE_URL = 'postgres://lmapp_synthetic:synthetic-dev-only-password@127.0.0.1:1/synthetic';

const PINO_BASELINE_FIELDS = new Set(['level', 'time', 'pid', 'hostname', 'reqId']);
const APP_ALLOWLIST = new Set(['event', 'request_id', 'method', 'route', 'status_code', 'duration_ms', 'safe_error_code']);

function assertOnlyAllowlistedFields(entry: Record<string, unknown>): void {
  for (const key of Object.keys(entry)) {
    assert.ok(
      PINO_BASELINE_FIELDS.has(key) || APP_ALLOWLIST.has(key),
      `log field not in the approved allowlist: ${key} (entry: ${JSON.stringify(entry)})`
    );
  }
}

function assertValidRequestId(value: unknown): void {
  assert.equal(typeof value, 'string');
  assert.match(value as string, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
}

function makeCapturingStream(): { stream: Writable; raw: () => string; lines: () => Record<string, unknown>[] } {
  let raw = '';
  const stream = new Writable({
    write(chunk, _enc, cb) {
      raw += chunk.toString();
      cb();
    }
  });
  return {
    stream,
    raw: () => raw,
    lines: () =>
      raw
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => JSON.parse(line) as Record<string, unknown>)
  };
}

// ---------------------------------------------------------------------------
// Unit-level tests: the observability primitives in isolation.
// ---------------------------------------------------------------------------

test('genReqId returns a fresh, unique, valid UUID on every call (never derived from any header)', () => {
  const ids = Array.from({ length: 200 }, () => genReqId());
  assert.equal(new Set(ids).size, 200, 'every generated id must be unique');
  for (const id of ids) {
    assertValidRequestId(id);
  }
});

test('safeRoute returns the registered route template when a route matched', () => {
  const fakeRequest = { routeOptions: { url: '/api/v1/campaigns/:campaignId' } };
  assert.equal(safeRoute(fakeRequest as never), '/api/v1/campaigns/:campaignId');
});

test('safeRoute falls back to the fixed UNMATCHED placeholder, never the raw URL', () => {
  assert.equal(safeRoute({ routeOptions: undefined } as never), UNMATCHED_ROUTE);
  assert.equal(safeRoute({ routeOptions: { url: '' } } as never), UNMATCHED_ROUTE);
  const hostile = {
    get routeOptions(): never {
      throw new Error('hostile getter');
    }
  };
  assert.equal(safeRoute(hostile as never), UNMATCHED_ROUTE);
});

test('SafeLogController.incomingRequest/requestCompleted emit only allowlisted fields and share one request_id', () => {
  const { stream, lines } = makeCapturingStream();
  const logger = pino(loggerOptions as never, stream);
  const controller = new SafeLogController();
  const fakeRequest = {
    id: 'unit-test-request-id',
    method: 'GET',
    routeOptions: { url: '/api/v1/campaigns' },
    safeErrorCode: null as string | null,
    log: logger,
    headers: { authorization: 'must-never-be-read-or-logged' }
  };
  const fakeReply = { statusCode: 200, elapsedTime: 12.4 };

  controller.incomingRequest(fakeRequest as never);
  fakeRequest.safeErrorCode = 'DATABASE_UNAVAILABLE';
  fakeReply.statusCode = 503;
  controller.requestCompleted(null, fakeRequest as never, fakeReply as never);

  const entries = lines();
  assert.equal(entries.length, 2);
  for (const entry of entries) assertOnlyAllowlistedFields(entry);
  assert.equal(entries[0].event, 'request_started');
  assert.equal(entries[1].event, 'request_completed');
  assert.equal(entries[0].request_id, entries[1].request_id, 'both events of one request must share one request_id');
  assert.equal(entries[1].status_code, 503);
  assert.equal(entries[1].safe_error_code, 'DATABASE_UNAVAILABLE');
  assert.equal(entries[1].duration_ms, 12);
  assert.equal(JSON.stringify(entries).includes('must-never-be-read-or-logged'), false);
});

test('SafeLogController.defaultErrorLog never serializes the raw error object, message, or stack', () => {
  const { stream, lines } = makeCapturingStream();
  const logger = pino(loggerOptions as never, stream);
  const controller = new SafeLogController();
  const fakeRequest = {
    id: 'unit-test-request-id-2',
    method: 'GET',
    routeOptions: { url: '/api/v1/campaigns' },
    safeErrorCode: null,
    log: logger
  };
  const fakeReply = { statusCode: 500, elapsedTime: 3.1 };
  const realError = new Error('unit-test-raw-error-marker DATABASE_URL=postgres://real:real@host/db');

  controller.defaultErrorLog(realError, fakeRequest as never, fakeReply as never);

  const [entry] = lines();
  assertOnlyAllowlistedFields(entry);
  assert.equal(entry.event, 'request_errored');
  assert.equal(entry.safe_error_code, 'INTERNAL_ERROR');
  const serialized = JSON.stringify(entry);
  assert.equal(serialized.includes('unit-test-raw-error-marker'), false);
  assert.equal(serialized.includes('DATABASE_URL'), false);
  assert.equal('err' in entry, false);
  assert.equal('stack' in entry, false);
  assert.equal('message' in entry, false);
});

test('SafeLogController.routeNotFound is a no-op (Fastify default not-found logging, which prints the raw URL, never runs)', () => {
  const { lines } = makeCapturingStream();
  const controller = new SafeLogController();
  controller.routeNotFound();
  assert.equal(lines().length, 0);
});

test('SafeLogController.serviceUnavailable emits only a safe, fixed 503 event', () => {
  const { stream, lines } = makeCapturingStream();
  const logger = pino(loggerOptions as never, stream);
  const controller = new SafeLogController();
  controller.serviceUnavailable(logger as never);
  const [entry] = lines();
  assertOnlyAllowlistedFields(entry);
  assert.equal(entry.event, 'server_closing_request_rejected');
  assert.equal(entry.status_code, 503);
});

test('SafeLogController.streamError/writeHeadError/serializerError log only safe fields, never the raw error', () => {
  const { stream, lines } = makeCapturingStream();
  const logger = pino(loggerOptions as never, stream);
  const controller = new SafeLogController();
  const fakeRequest = { id: 'unit-test-request-id-3', log: logger };

  controller.streamError(new Error('raw-stream-detail-marker'), fakeRequest as never);
  controller.writeHeadError(new Error('raw-writehead-detail-marker'), fakeRequest as never);
  controller.serializerError(new Error('raw-serializer-detail-marker'), fakeRequest as never, {} as never, { statusCode: 500 });

  const entries = lines();
  assert.equal(entries.length, 3);
  for (const entry of entries) assertOnlyAllowlistedFields(entry);
  const raw = JSON.stringify(entries);
  assert.equal(raw.includes('raw-stream-detail-marker'), false);
  assert.equal(raw.includes('raw-writehead-detail-marker'), false);
  assert.equal(raw.includes('raw-serializer-detail-marker'), false);
});

test('loggerOptions serializers drop req/res/err objects entirely -- headers never reach the sink even if passed directly', () => {
  const { stream, raw } = makeCapturingStream();
  const logger = pino(loggerOptions as never, stream);
  logger.info({
    event: 'defense_in_depth_probe',
    req: { headers: { authorization: 'unit-test-secret-marker', cookie: 'unit-test-cookie-marker' } },
    res: { headers: { 'set-cookie': 'unit-test-set-cookie-marker' } },
    err: { message: 'unit-test-raw-error-message', stack: 'unit-test-raw-stack' }
  });
  const [entry] = raw()
    .trim()
    .split('\n')
    .map(line => JSON.parse(line));
  assert.equal('req' in entry, false);
  assert.equal('res' in entry, false);
  assert.equal('err' in entry, false);
  const text = raw();
  for (const marker of [
    'unit-test-secret-marker',
    'unit-test-cookie-marker',
    'unit-test-set-cookie-marker',
    'unit-test-raw-error-message',
    'unit-test-raw-stack'
  ]) {
    assert.equal(text.includes(marker), false, `must not leak: ${marker}`);
  }
});

test('loggerOptions.redact independently replaces the entire req/res headers object with [Redacted] when reached', () => {
  // Isolated from the serializers above (which, in the real loggerOptions,
  // already drop 'req'/'res'/'err' entirely before redact ever runs) --
  // this proves the redact syntax itself works as a standalone backstop.
  // The broader 'req.headers' path supersedes the narrower per-field paths
  // in the same list, so the whole headers object is censored at once
  // rather than per-key -- strictly stronger than leaking a partial object.
  const { stream, raw } = makeCapturingStream();
  const redactOnly = pino({ level: 'info', redact: loggerOptions.redact } as never, stream);
  redactOnly.info({
    event: 'redact_syntax_probe',
    req: {
      headers: {
        authorization: 'unit-test-secret-marker-2',
        cookie: 'unit-test-cookie-marker-2',
        accept: 'application/json'
      }
    }
  });
  const [entry] = raw()
    .trim()
    .split('\n')
    .map(line => JSON.parse(line)) as [{ req: { headers: unknown } }];
  assert.equal(entry.req.headers, '[Redacted]');
  assert.equal(raw().includes('unit-test-secret-marker-2'), false);
  assert.equal(raw().includes('unit-test-cookie-marker-2'), false);
  assert.equal(raw().includes('application/json'), false);
});

// ---------------------------------------------------------------------------
// In-process integration tests: the fully wired app via buildApp()+inject(),
// with real log capture via the stream-capable BuildAppOptions.logger.
// Used for the DB-unavailable path, which a live spawned server cannot reach
// at request time: verifyRuntimeDatabasePrivileges() (ADR-0005) refuses
// startup itself when DATABASE_URL is unreachable, before the port ever
// opens (see tests/runtimeSafetyGateBootstrap.test.ts).
// ---------------------------------------------------------------------------

test('in-process: 503 (DB unavailable) responses preserve the existing contract and log only allowlisted fields', async () => {
  const pool = new pg.Pool({ connectionString: UNREACHABLE_DATABASE_URL, max: 1, connectionTimeoutMillis: 1000 });
  const { stream, raw, lines } = makeCapturingStream();
  const app = buildApp({ pool, logger: stream });
  try {
    const ready = await app.inject({ method: 'GET', url: '/api/v1/health/ready' });
    const list = await app.inject({ method: 'GET', url: '/api/v1/campaigns?token=super-secret-query-marker' });
    const detail = await app.inject({ method: 'GET', url: '/api/v1/campaigns/00000000-0000-4000-8000-000000000001' });

    assert.equal(ready.statusCode, 503);
    assert.deepEqual(ready.json(), { status: 'error', database: 'unreachable' });
    assert.equal(list.statusCode, 503);
    assert.deepEqual(list.json(), { status: 'error', database: 'unreachable' });
    assert.equal(detail.statusCode, 503);
    assert.deepEqual(detail.json(), { status: 'error', database: 'unreachable' });

    const entries = lines();
    assert.ok(entries.length > 0);
    for (const entry of entries) assertOnlyAllowlistedFields(entry);
    const completions = entries.filter(e => e.event === 'request_completed');
    assert.equal(completions.length, 3);
    for (const entry of completions) {
      assert.equal(entry.status_code, 503);
      assert.equal(entry.safe_error_code, 'DATABASE_UNAVAILABLE');
    }
    assert.ok(entries.some(e => e.route === '/api/v1/health/ready'));
    assert.ok(entries.some(e => e.route === '/api/v1/campaigns'));
    assert.ok(entries.some(e => e.route === '/api/v1/campaigns/:campaignId'));

    const text = raw();
    assert.equal(text.includes(UNREACHABLE_DATABASE_URL), false);
    assert.equal(text.includes('synthetic-dev-only-password'), false);
    assert.equal(text.includes('super-secret-query-marker'), false);
    assert.equal(text.toLowerCase().includes('econnrefused'), false);
    assert.equal(text.toLowerCase().includes('stack'), false);
    assert.equal(text.includes('pg-protocol'), false);
    assert.equal(text.includes('node_modules'), false);
  } finally {
    await app.close();
  }
});

test('in-process: a malformed UUID (400), an absent-but-valid UUID (404), and injection-shaped values leak no data and log only allowlisted fields', async () => {
  const pool = new pg.Pool({ connectionString: UNREACHABLE_DATABASE_URL, max: 1, connectionTimeoutMillis: 1000 });
  const { stream, raw, lines } = makeCapturingStream();
  const app = buildApp({ pool, logger: stream });
  try {
    const malformed = await app.inject({ method: 'GET', url: '/api/v1/campaigns/not-a-uuid' });
    const forbiddenVersion = await app.inject({ method: 'GET', url: '/api/v1/campaigns/aaaaaaaa-aaaa-1aaa-aaaa-aaaaaaaaaaaa' });
    const injection = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${encodeURIComponent("1' OR '1'='1")}` });
    const unmatched = await app.inject({ method: 'GET', url: '/api/v1/does-not-exist-marker' });

    assert.equal(malformed.statusCode, 400);
    assert.deepEqual(malformed.json(), { error: 'INVALID_CAMPAIGN_ID' });
    assert.equal(forbiddenVersion.statusCode, 400);
    assert.equal(injection.statusCode, 400);
    assert.equal(unmatched.statusCode, 404);

    const entries = lines();
    for (const entry of entries) assertOnlyAllowlistedFields(entry);
    assert.ok(entries.some(e => e.route === UNMATCHED_ROUTE && e.status_code === 404));
    assert.ok(entries.every(e => e.route !== '/api/v1/does-not-exist-marker'));

    const text = raw();
    assert.equal(text.includes('does-not-exist-marker'), false);
    assert.equal(text.includes("1' OR '1'='1"), false);
    assert.equal(text.includes('OR'), false);
    assert.equal(text.includes('not-a-uuid'), false);
  } finally {
    await app.close();
  }
});

test('in-process: caller-supplied x-request-id (including a CRLF/log-injection payload) never becomes the internal request_id and never appears in logs', async () => {
  const pool = new pg.Pool({ connectionString: UNREACHABLE_DATABASE_URL, max: 1, connectionTimeoutMillis: 1000 });
  const { stream, raw, lines } = makeCapturingStream();
  const app = buildApp({ pool, logger: stream });
  const maliciousId = 'attacker-supplied-id\r\nlog-injected-line: true\r\nx-forged: yes';
  try {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health/live',
      headers: {
        'x-request-id': maliciousId,
        'request-id': maliciousId,
        authorization: 'Bearer unit-test-secret-token-marker',
        cookie: 'session=unit-test-secret-cookie-marker',
        'set-cookie': 'unit-test-set-cookie-marker',
        'x-api-key': 'unit-test-secret-api-key-marker',
        'user-agent': 'unit-test-secret-user-agent-marker',
        'x-forwarded-for': '203.0.113.99',
        'x-phone': '+1-555-0100-marker',
        'x-passport': 'AA1234567-marker',
        'x-card-number': '4111111111111111-marker'
      }
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: 'ok' });

    const entries = lines();
    assert.ok(entries.length >= 2);
    for (const entry of entries) {
      assertOnlyAllowlistedFields(entry);
      if (entry.request_id) assertValidRequestId(entry.request_id);
    }
    const requestIds = new Set(entries.map(e => e.request_id).filter(Boolean));
    assert.equal(requestIds.size, 1, 'the single request must be logged under exactly one server-owned id');

    const text = raw();
    for (const marker of [
      'attacker-supplied-id',
      'log-injected-line',
      'x-forged',
      'unit-test-secret-token-marker',
      'unit-test-secret-cookie-marker',
      'unit-test-set-cookie-marker',
      'unit-test-secret-api-key-marker',
      'unit-test-secret-user-agent-marker',
      '203.0.113.99',
      '555-0100',
      'AA1234567',
      '4111111111111111'
    ]) {
      assert.equal(text.includes(marker), false, `must not leak: ${marker}`);
    }
  } finally {
    await app.close();
  }
});

test('in-process: request_started/request_completed pairs share one request_id across concurrent-looking sequential requests, each unique', async () => {
  const pool = new pg.Pool({ connectionString: UNREACHABLE_DATABASE_URL, max: 1, connectionTimeoutMillis: 1000 });
  const { stream, lines } = makeCapturingStream();
  const app = buildApp({ pool, logger: stream });
  try {
    for (let i = 0; i < 5; i++) {
      await app.inject({ method: 'GET', url: '/api/v1/health/live' });
    }
    const entries = lines();
    const started = entries.filter(e => e.event === 'request_started');
    const completed = entries.filter(e => e.event === 'request_completed');
    assert.equal(started.length, 5);
    assert.equal(completed.length, 5);
    const ids = new Set(entries.map(e => e.request_id));
    assert.equal(ids.size, 5, 'each of the 5 requests must own a distinct request_id');
    for (const id of started.map(e => e.request_id)) {
      assert.ok(
        completed.some(e => e.request_id === id),
        `request ${id as string} must have a matching completion event`
      );
    }
  } finally {
    await app.close();
  }
});

// ---------------------------------------------------------------------------
// Live spawned-process integration tests: the real server.ts entrypoint,
// stdout/stderr captured in-memory only (same pattern as
// tests/runtimeSafetyGateBootstrap.test.ts). Requires a real, migrated,
// seeded database for the 200-path assertions.
// ---------------------------------------------------------------------------

function buildChildEnv(overrides: Record<string, string | undefined>): NodeJS.ProcessEnv {
  const base: NodeJS.ProcessEnv = { ...process.env };
  delete base.DATABASE_URL;
  for (const key of Object.keys(base)) {
    if (key.startsWith('LEASEMIND_')) delete base[key];
  }
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete base[key];
    else base[key] = value;
  }
  return base;
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

interface ServerHandle {
  stdoutLines: () => string[];
  stderrText: () => string;
  stop: (signal: NodeJS.Signals) => Promise<{ code: number | null; signal: NodeJS.Signals | null }>;
}

async function startServer(port: number, databaseUrl: string): Promise<ServerHandle> {
  const env = buildChildEnv({
    HOST: '127.0.0.1',
    PORT: String(port),
    NODE_ENV: 'development',
    DATABASE_URL: databaseUrl,
    LEASEMIND_COMMAND_DATABASE_URL: COMMAND_DATABASE_URL,
    LEASEMIND_TECHNICAL_ASSIGNMENT_DATABASE_URL: TA_DATABASE_URL,
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
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', chunk => {
    stdout += chunk.toString();
  });
  child.stderr.on('data', chunk => {
    stderr += chunk.toString();
  });

  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    if (await isPortOpen(port)) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return {
    stdoutLines: () =>
      stdout
        .split('\n')
        .filter(line => line.trim().length > 0),
    stderrText: () => stderr,
    stop: (signal: NodeJS.Signals) =>
      new Promise(resolve => {
        child.once('close', (code, sig) => resolve({ code, signal: sig }));
        child.kill(signal);
      })
  };
}

function httpGet(port: number, urlPath: string, headers: Record<string, string> = {}): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port, path: urlPath, method: 'GET', headers }, res => {
      let body = '';
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => resolve({ statusCode: res.statusCode ?? 0, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('migration up + seed (fresh) prepare the schema for the live observability probe', { skip: !hasDatabase }, async () => {
  const migratePool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(migratePool);
  } finally {
    await migratePool.end();
  }
  const maintenancePool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  try {
    await seedCampaigns(maintenancePool);
  } finally {
    await maintenancePool.end();
  }
});

test(
  'live server: safe startup event, unchanged response contract on 200/400/404, and only allowlisted structured logs (no secrets, headers, query string, or raw URL)',
  { skip: !hasDatabase },
  async () => {
    const port = 34610;
    const handle = await startServer(port, API_DATABASE_URL as string);
    try {
      const target = SYNTHETIC_CAMPAIGN_SEEDS[0];

      const live = await httpGet(port, '/api/v1/health/live');
      const ready = await httpGet(port, '/api/v1/health/ready');
      const list = await httpGet(port, '/api/v1/campaigns?token=super-secret-query-marker');
      const detail = await httpGet(port, `/api/v1/campaigns/${target.campaignId}`);
      const badId = await httpGet(port, '/api/v1/campaigns/not-a-uuid');
      const notFound = await httpGet(port, '/api/v1/campaigns/00000000-0000-4000-8000-999999999999');
      const unmatched = await httpGet(port, '/api/v1/this-route-does-not-exist-marker');
      const hostile = await httpGet(port, '/api/v1/health/live', {
        'x-request-id': 'attacker-supplied-id-marker',
        authorization: 'Bearer unit-test-secret-token-marker',
        cookie: 'session=unit-test-secret-cookie-marker',
        'x-api-key': 'unit-test-secret-api-key-marker',
        'user-agent': 'unit-test-secret-user-agent-marker',
        'x-phone': '+1-555-0100-marker',
        'x-passport': 'AA1234567-marker',
        'x-card-number': '4111111111111111-marker'
      });

      assert.equal(live.statusCode, 200);
      assert.deepEqual(JSON.parse(live.body), { status: 'ok' });
      assert.equal(ready.statusCode, 200);
      assert.equal(list.statusCode, 200);
      assert.equal(detail.statusCode, 200);
      assert.equal(JSON.parse(detail.body).campaign_id, target.campaignId);
      assert.equal(badId.statusCode, 400);
      assert.deepEqual(JSON.parse(badId.body), { error: 'INVALID_CAMPAIGN_ID' });
      assert.equal(notFound.statusCode, 404);
      assert.deepEqual(JSON.parse(notFound.body), { error: 'CAMPAIGN_NOT_FOUND' });
      assert.equal(unmatched.statusCode, 404);
      assert.equal(hostile.statusCode, 200);

      await new Promise(resolve => setTimeout(resolve, 300));

      const stdoutLines = handle.stdoutLines();
      const entries = stdoutLines.map(line => JSON.parse(line) as Record<string, unknown>);
      const rawLog = stdoutLines.join('\n');

      assert.ok(entries.length > 0, 'the live server must have produced log output');
      for (const entry of entries) {
        assertOnlyAllowlistedFields(entry);
        if (entry.request_id) assertValidRequestId(entry.request_id);
      }

      const started = entries.filter(e => e.event === 'request_started');
      const completed = entries.filter(e => e.event === 'request_completed');
      assert.equal(started.length, completed.length);
      const ids = new Set(entries.map(e => e.request_id).filter(Boolean));
      assert.equal(ids.size, started.length, 'every request must own a unique request_id');

      assert.ok(entries.some(e => e.route === '/api/v1/campaigns' && e.status_code === 200));
      assert.ok(
        entries.some(e => e.route === '/api/v1/campaigns/:campaignId' && e.status_code === 400 && e.safe_error_code === 'INVALID_CAMPAIGN_ID')
      );
      assert.ok(
        entries.some(e => e.route === '/api/v1/campaigns/:campaignId' && e.status_code === 404 && e.safe_error_code === 'CAMPAIGN_NOT_FOUND')
      );
      assert.ok(entries.some(e => e.route === UNMATCHED_ROUTE && e.status_code === 404));
      assert.ok(entries.some(e => e.event === 'server_started'));

      for (const marker of [
        'attacker-supplied-id-marker',
        'unit-test-secret-token-marker',
        'unit-test-secret-cookie-marker',
        'unit-test-secret-api-key-marker',
        'unit-test-secret-user-agent-marker',
        '555-0100',
        'AA1234567',
        '4111111111111111',
        'super-secret-query-marker',
        'this-route-does-not-exist-marker',
        (API_DATABASE_URL as string),
        'ECONNREFUSED'
      ]) {
        assert.equal(rawLog.includes(marker), false, `must not leak: ${marker}`);
      }
      const lowerLog = rawLog.toLowerCase();
      for (const marker of ['authorization', 'cookie', 'x-api-key', 'stack', 'user-agent']) {
        assert.equal(lowerLog.includes(marker), false, `must not leak field name: ${marker}`);
      }
      assert.equal(handle.stderrText().includes('RUNTIME_SAFETY_VIOLATION'), false);
      assert.equal(handle.stderrText().includes('DATABASE_PRIVILEGE_VIOLATION'), false);
    } finally {
      await handle.stop('SIGTERM');
    }
  }
);

// Windows does not deliver real POSIX signals to a child process -- Node
// force-terminates it instead of invoking the JS 'SIGTERM'/'SIGINT' handler
// (verified empirically on this host: the child exits with code null/signal
// SIGTERM without ever running its handler). CI (.github/workflows/
// app-foundation.yml) runs on ubuntu-latest, where these signals are
// delivered correctly and this test exercises the real graceful-shutdown
// path end-to-end.
const canTestRealSignals = process.platform !== 'win32';

test(
  'live server: graceful shutdown on SIGTERM logs safe shutdown events, closes the app, and exits 0',
  { skip: !hasDatabase || !canTestRealSignals },
  async () => {
    const port = 34611;
    const handle = await startServer(port, API_DATABASE_URL as string);
    const result = await handle.stop('SIGTERM');
    assert.equal(result.code, 0);
    assert.equal(await isPortOpen(port), false);
    const entries = handle.stdoutLines().map(line => JSON.parse(line) as Record<string, unknown>);
    for (const entry of entries) assertOnlyAllowlistedFields(entry);
    assert.ok(entries.some(e => e.event === 'shutdown_initiated_sigterm'));
    assert.ok(entries.some(e => e.event === 'shutdown_completed'));
  }
);

test(
  'live server: graceful shutdown on SIGINT logs safe shutdown events, closes the app, and exits 0',
  { skip: !hasDatabase || !canTestRealSignals },
  async () => {
    const port = 34612;
    const handle = await startServer(port, API_DATABASE_URL as string);
    const result = await handle.stop('SIGINT');
    assert.equal(result.code, 0);
    assert.equal(await isPortOpen(port), false);
    const entries = handle.stdoutLines().map(line => JSON.parse(line) as Record<string, unknown>);
    for (const entry of entries) assertOnlyAllowlistedFields(entry);
    assert.ok(entries.some(e => e.event === 'shutdown_initiated_sigint'));
    assert.ok(entries.some(e => e.event === 'shutdown_completed'));
  }
);

test('migration down (final teardown) removes the live-probe schema', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateDown(pool);
    const schemaExists = await pool.query("SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'leasemind_app') AS exists");
    assert.equal(schemaExists.rows[0].exists, false);
  } finally {
    await pool.end();
  }
});
