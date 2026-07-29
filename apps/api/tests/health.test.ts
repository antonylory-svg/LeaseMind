import { test } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { buildApp } from '../src/app.js';

const UNREACHABLE_CONNECTION_STRING = 'postgres://synthetic:synthetic@127.0.0.1:1/synthetic';

test('GET /api/v1/health/live returns ok regardless of database state', async () => {
  const pool = new pg.Pool({ connectionString: UNREACHABLE_CONNECTION_STRING, max: 1 });
  const app = buildApp({ pool, logger: false });
  try {
    const response = await app.inject({ method: 'GET', url: '/api/v1/health/live' });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), { status: 'ok' });
  } finally {
    await app.close();
  }
});

test('GET /api/v1/health/ready returns 503 when database is unreachable', async () => {
  const pool = new pg.Pool({
    connectionString: UNREACHABLE_CONNECTION_STRING,
    max: 1,
    connectionTimeoutMillis: 2000
  });
  const app = buildApp({ pool, logger: false });
  try {
    const response = await app.inject({ method: 'GET', url: '/api/v1/health/ready' });
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.json(), { status: 'error', database: 'unreachable' });
  } finally {
    await app.close();
  }
});

test(
  'GET /api/v1/health/ready returns 200 when database is reachable',
  { skip: !process.env.DATABASE_URL },
  async () => {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
    const app = buildApp({ pool, logger: false });
    try {
      const response = await app.inject({ method: 'GET', url: '/api/v1/health/ready' });
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.json(), { status: 'ok', database: 'connected' });
    } finally {
      await app.close();
    }
  }
);
