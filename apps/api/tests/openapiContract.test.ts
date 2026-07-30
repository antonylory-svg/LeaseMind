import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import SwaggerParser from '@apidevtools/swagger-parser';
import { Ajv2020 } from 'ajv/dist/2020.js';
import addFormatsImport from 'ajv-formats';

// ajv-formats' CJS default export is callable at runtime under Node's ESM
// interop, but its .d.ts resolves to a non-callable namespace type under
// NodeNext -- a known ajv-formats/TS-NodeNext friction, not a real type gap.
const addFormats = addFormatsImport as unknown as (instance: Ajv2020) => void;
import { buildApp } from '../src/app.js';
import { migrateUp, migrateDown } from '../src/db/migrate.js';
import { seedCampaigns, SYNTHETIC_CAMPAIGN_SEEDS } from '../src/db/seed.js';
import { CAMPAIGN_STATUSES } from '../src/db/campaigns.js';
import { MIGRATION_DATABASE_URL, MAINTENANCE_DATABASE_URL, API_DATABASE_URL, hasDatabase } from './testDatabaseUrls.js';

// This file owns its own complete migration/seed/teardown lifecycle,
// independent of tests/campaigns.test.ts. Running test FILES sequentially
// (package.json: `--test-concurrency=1`) is what makes this safe: whichever
// file runs first tears its own state down or leaves it idempotently
// re-appliable, so this file re-applies migrate:up + seed at its own start
// regardless of what ran before it, and tears down at its own end.
// Migration/catalog steps connect as lmapp_migrator (owner); seeding
// connects as the real lmapp_maintainer; every HTTP-surface assertion
// connects as the real lmapp_api_reader (DATABASE_URL) -- proving the
// actual production-shaped roles serve the documented contract, not an
// omnipotent connection standing in for them.

const OPENAPI_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'openapi', 'openapi.yaml');
const UNREACHABLE_CONNECTION_STRING = 'postgres://synthetic:synthetic@127.0.0.1:1/synthetic';

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

interface OpenApiOperation {
  operationId?: string;
  parameters?: Array<{ name: string; in: string; required?: boolean; schema: Record<string, unknown> }>;
  responses: Record<string, { content?: { 'application/json'?: { schema: Record<string, unknown> } } }>;
}
type OpenApiPathItem = Record<string, OpenApiOperation | undefined>;
interface OpenApiDocument {
  openapi: string;
  paths: Record<string, OpenApiPathItem>;
}

let api: OpenApiDocument;

function operation(pathKey: string, method: string): OpenApiOperation {
  const item = api.paths[pathKey];
  assert.ok(item, `path not documented: ${pathKey}`);
  const op = item[method];
  assert.ok(op, `method ${method} not documented on ${pathKey}`);
  return op;
}

function responseSchema(pathKey: string, method: string, statusCode: number): Record<string, unknown> {
  const op = operation(pathKey, method);
  const response = op.responses[String(statusCode)];
  assert.ok(response, `status ${statusCode} not documented for ${method.toUpperCase()} ${pathKey}`);
  const schema = response.content?.['application/json']?.schema;
  assert.ok(schema, `no JSON schema documented for ${method.toUpperCase()} ${pathKey} ${statusCode}`);
  return schema;
}

function assertMatchesSchema(schema: Record<string, unknown>, data: unknown, message: string): void {
  const ok = ajv.validate(schema, data);
  assert.equal(ok, true, `${message}: ${JSON.stringify(ajv.errors)}`);
}

function assertViolatesSchema(schema: Record<string, unknown>, data: unknown, message: string): void {
  const ok = ajv.validate(schema, data);
  assert.equal(ok, false, message);
}

function assertNoLeakedSecrets(responseBody: string): void {
  const forbidden = ['synthetic:synthetic', 'password', 'ECONNREFUSED', 'pg-protocol', 'node_modules'];
  for (const marker of forbidden) {
    assert.equal(responseBody.includes(marker), false, `response leaked: ${marker}`);
  }
}

test('OpenAPI document is valid OpenAPI 3.1', async () => {
  api = (await SwaggerParser.validate(OPENAPI_PATH)) as unknown as OpenApiDocument;
  assert.equal(api.openapi, '3.1.0');
});

const EXPECTED_PATH_METHODS: Record<string, string[]> = {
  '/api/v1/health/live': ['get'],
  '/api/v1/health/ready': ['get'],
  '/api/v1/campaigns': ['get'],
  '/api/v1/campaigns/{campaignId}': ['get']
};
const ALL_HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

test('the contract documents exactly the four allowed read-only operations, nothing else', () => {
  assert.deepEqual(Object.keys(api.paths).sort(), Object.keys(EXPECTED_PATH_METHODS).sort());
  for (const [pathKey, allowedMethods] of Object.entries(EXPECTED_PATH_METHODS)) {
    const item = api.paths[pathKey];
    const present = ALL_HTTP_METHODS.filter(m => item[m] !== undefined);
    assert.deepEqual(present.sort(), [...allowedMethods].sort(), `unexpected method set on ${pathKey}`);
  }
});

test('no write methods (POST/PUT/PATCH/DELETE) are documented anywhere in the contract', () => {
  for (const pathKey of Object.keys(api.paths)) {
    for (const method of ['post', 'put', 'patch', 'delete']) {
      assert.equal(api.paths[pathKey][method], undefined, `${method.toUpperCase()} must not exist on ${pathKey}`);
    }
  }
});

test('every documented operation declares a unique operationId', () => {
  const ids: string[] = [];
  for (const pathKey of Object.keys(api.paths)) {
    for (const method of ALL_HTTP_METHODS) {
      const op = api.paths[pathKey][method];
      if (op) {
        assert.equal(typeof op.operationId, 'string', `${method.toUpperCase()} ${pathKey} must declare operationId`);
        ids.push(op.operationId as string);
      }
    }
  }
  assert.equal(ids.length, 4);
  assert.equal(new Set(ids).size, 4, 'operationId values must be unique');
});

test('the Campaign schema enumerates exactly the 11 approved statuses', () => {
  const schema = responseSchema('/api/v1/campaigns/{campaignId}', 'get', 200);
  const statusSchema = (schema.properties as Record<string, { enum: string[] }>).status;
  assert.deepEqual(statusSchema.enum, [...CAMPAIGN_STATUSES]);
  assert.equal(statusSchema.enum.length, 11);
});

test('the campaignId path parameter allows only UUID v4/v7 and forbids v1/v2/v3/v5/v6/v8', () => {
  const op = operation('/api/v1/campaigns/{campaignId}', 'get');
  const param = op.parameters?.find(p => p.name === 'campaignId');
  assert.ok(param, 'campaignId parameter must be documented');
  assert.equal(param?.in, 'path');
  assert.equal(param?.required, true);
  const pattern = new RegExp((param?.schema as { pattern: string }).pattern);
  assert.equal(pattern.test('00000000-0000-4000-8000-000000000001'), true, 'v4 must be allowed');
  assert.equal(pattern.test('00000000-0000-7000-8000-000000000001'), true, 'v7 must be allowed');
  for (const version of ['1', '2', '3', '5', '6', '8']) {
    assert.equal(pattern.test(`aaaaaaaa-aaaa-${version}aaa-aaaa-aaaaaaaaaaaa`), false, `v${version} must be forbidden`);
  }
});

test('negative mutation: an unexpected extra property on the Campaign schema is rejected', () => {
  const schema = responseSchema('/api/v1/campaigns/{campaignId}', 'get', 200);
  const validCampaign = {
    campaign_id: '00000000-0000-4000-8000-000000000001',
    status: 'Created',
    aggregate_version: '1',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  };
  assertMatchesSchema(schema, validCampaign, 'sanity: the valid fixture itself must pass');
  assertViolatesSchema(schema, { ...validCampaign, extra_field: 'unexpected' }, 'an additional property must be rejected');
});

test('negative mutation: an unapproved status value is rejected by the Campaign schema', () => {
  const schema = responseSchema('/api/v1/campaigns/{campaignId}', 'get', 200);
  const invalidCampaign = {
    campaign_id: '00000000-0000-4000-8000-000000000001',
    status: 'NotAStatus',
    aggregate_version: '1',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z'
  };
  assertViolatesSchema(schema, invalidCampaign, 'an unapproved status must be rejected');
});

test('negative mutation: health/ready 200 schema rejects an error-shaped body', () => {
  const schema = responseSchema('/api/v1/health/ready', 'get', 200);
  assertMatchesSchema(schema, { status: 'ok', database: 'connected' }, 'sanity: valid body must pass');
  assertViolatesSchema(schema, { status: 'error', database: 'unreachable' }, 'the error shape must not satisfy the 200 schema');
});

test('negative mutation: 400/404/503 error schemas reject an unrecognized error code', () => {
  const schema400 = responseSchema('/api/v1/campaigns/{campaignId}', 'get', 400);
  const schema404 = responseSchema('/api/v1/campaigns/{campaignId}', 'get', 404);
  const schema503 = responseSchema('/api/v1/campaigns/{campaignId}', 'get', 503);
  assertViolatesSchema(schema400, { error: 'SOMETHING_ELSE' }, '400 schema must reject unknown error codes');
  assertViolatesSchema(schema404, { error: 'SOMETHING_ELSE' }, '404 schema must reject unknown error codes');
  assertViolatesSchema(schema503, { status: 'error', database: 'reachable' }, '503 schema must reject a wrong database value');
});

test('migration up (fresh) prepares the schema for contract verification', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateUp(pool);
  } finally {
    await pool.end();
  }
});

test('synthetic seed provides all 11 campaigns for contract verification', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MAINTENANCE_DATABASE_URL, max: 2 });
  try {
    await seedCampaigns(pool);
  } finally {
    await pool.end();
  }
});

test('GET /api/v1/health/live: real response matches the documented 200 schema', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    const response = await app.inject({ method: 'GET', url: '/api/v1/health/live' });
    assert.equal(response.statusCode, 200);
    assertMatchesSchema(responseSchema('/api/v1/health/live', 'get', 200), response.json(), 'live 200 body must match contract');
  } finally {
    await app.close();
  }
});

test('GET /api/v1/health/ready: real 200 response matches the documented schema', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    const response = await app.inject({ method: 'GET', url: '/api/v1/health/ready' });
    assert.equal(response.statusCode, 200);
    assertMatchesSchema(responseSchema('/api/v1/health/ready', 'get', 200), response.json(), 'ready 200 body must match contract');
  } finally {
    await app.close();
  }
});

test(
  'GET /api/v1/campaigns: real response matches the documented schema and contains all 11 approved statuses',
  { skip: !hasDatabase },
  async () => {
    const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
    const app = buildApp({ pool, logger: false });
    try {
      const response = await app.inject({ method: 'GET', url: '/api/v1/campaigns' });
      assert.equal(response.statusCode, 200);
      const body = response.json() as { campaigns: Array<{ campaign_id: string; status: string }> };
      assertMatchesSchema(responseSchema('/api/v1/campaigns', 'get', 200), body, 'campaigns list body must match contract');
      assert.equal(body.campaigns.length, 11);
      assert.deepEqual(
        body.campaigns.map(c => c.status).sort(),
        [...CAMPAIGN_STATUSES].sort()
      );
      for (const campaign of body.campaigns) {
        assertMatchesSchema(
          responseSchema('/api/v1/campaigns/{campaignId}', 'get', 200),
          campaign,
          `campaign ${campaign.campaign_id} must match the Campaign schema`
        );
      }
    } finally {
      await app.close();
    }
  }
);

test('GET /api/v1/campaigns/{campaignId}: real 200 response matches the documented schema', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    const target = SYNTHETIC_CAMPAIGN_SEEDS[0];
    const response = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${target.campaignId}` });
    assert.equal(response.statusCode, 200);
    assertMatchesSchema(responseSchema('/api/v1/campaigns/{campaignId}', 'get', 200), response.json(), 'detail 200 body must match contract');
  } finally {
    await app.close();
  }
});

test('GET /api/v1/campaigns/{campaignId}: malformed UUID matches the documented 400 schema', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    const response = await app.inject({ method: 'GET', url: '/api/v1/campaigns/not-a-uuid' });
    assert.equal(response.statusCode, 400);
    assertMatchesSchema(responseSchema('/api/v1/campaigns/{campaignId}', 'get', 400), response.json(), '400 body must match contract');
  } finally {
    await app.close();
  }
});

test('GET /api/v1/campaigns/{campaignId}: forbidden UUID versions match the documented 400 schema', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    for (const version of ['1', '2', '3', '5', '6', '8']) {
      const forbidden = `aaaaaaaa-aaaa-${version}aaa-aaaa-aaaaaaaaaaaa`;
      const response = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${forbidden}` });
      assert.equal(response.statusCode, 400, `version ${version}`);
      assertMatchesSchema(
        responseSchema('/api/v1/campaigns/{campaignId}', 'get', 400),
        response.json(),
        `400 body must match contract for v${version}`
      );
    }
  } finally {
    await app.close();
  }
});

test('GET /api/v1/campaigns/{campaignId}: well-formed absent UUID matches the documented 404 schema', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    const response = await app.inject({ method: 'GET', url: '/api/v1/campaigns/00000000-0000-4000-8000-999999999999' });
    assert.equal(response.statusCode, 404);
    assertMatchesSchema(responseSchema('/api/v1/campaigns/{campaignId}', 'get', 404), response.json(), '404 body must match contract');
  } finally {
    await app.close();
  }
});

test('GET /api/v1/campaigns/{campaignId}: SQL-injection-shaped value matches the documented 400 schema', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    const payloads = ["1' OR '1'='1", "'; DROP TABLE leasemind_app.campaign_current_state_projection; --"];
    for (const payload of payloads) {
      const response = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${encodeURIComponent(payload)}` });
      assert.equal(response.statusCode, 400);
      assertMatchesSchema(
        responseSchema('/api/v1/campaigns/{campaignId}', 'get', 400),
        response.json(),
        '400 body must match contract for injection payload'
      );
    }
  } finally {
    await app.close();
  }
});

test('Campaign and health endpoints: 503 responses match the documented schema and leak no secrets', async () => {
  const pool = new pg.Pool({ connectionString: UNREACHABLE_CONNECTION_STRING, max: 1, connectionTimeoutMillis: 2000 });
  const app = buildApp({ pool, logger: false });
  try {
    const listResponse = await app.inject({ method: 'GET', url: '/api/v1/campaigns' });
    assert.equal(listResponse.statusCode, 503);
    assertMatchesSchema(responseSchema('/api/v1/campaigns', 'get', 503), listResponse.json(), 'campaigns list 503 body must match contract');
    assertNoLeakedSecrets(listResponse.body);

    const detailResponse = await app.inject({ method: 'GET', url: '/api/v1/campaigns/00000000-0000-4000-8000-000000000001' });
    assert.equal(detailResponse.statusCode, 503);
    assertMatchesSchema(
      responseSchema('/api/v1/campaigns/{campaignId}', 'get', 503),
      detailResponse.json(),
      'campaign detail 503 body must match contract'
    );
    assertNoLeakedSecrets(detailResponse.body);

    const readyResponse = await app.inject({ method: 'GET', url: '/api/v1/health/ready' });
    assert.equal(readyResponse.statusCode, 503);
    assertMatchesSchema(responseSchema('/api/v1/health/ready', 'get', 503), readyResponse.json(), 'ready 503 body must match contract');
    assertNoLeakedSecrets(readyResponse.body);
  } finally {
    await app.close();
  }
});

test('an undocumented endpoint/method is not part of the contract and is not routable at runtime', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    assert.equal(app.hasRoute({ method: 'POST', url: '/api/v1/campaigns' }), false);
    assert.equal(app.hasRoute({ method: 'PUT', url: '/api/v1/campaigns/:campaignId' }), false);
    assert.equal(app.hasRoute({ method: 'PATCH', url: '/api/v1/campaigns/:campaignId' }), false);
    assert.equal(app.hasRoute({ method: 'DELETE', url: '/api/v1/campaigns/:campaignId' }), false);
    assert.equal(app.hasRoute({ method: 'GET', url: '/api/v1/campaigns/:campaignId/history' }), false);

    const attempts = [
      { method: 'POST' as const, url: '/api/v1/campaigns' },
      { method: 'PUT' as const, url: '/api/v1/campaigns/00000000-0000-4000-8000-000000000001' },
      { method: 'DELETE' as const, url: '/api/v1/campaigns/00000000-0000-4000-8000-000000000001' }
    ];
    for (const attempt of attempts) {
      const response = await app.inject(attempt);
      assert.equal(response.statusCode, 404, `${attempt.method} ${attempt.url} must not be routable`);
    }
  } finally {
    await app.close();
  }
});

test('migration down (final teardown) removes the contract-verification schema', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await migrateDown(pool);
    const schemaExists = await pool.query("SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'leasemind_app') AS exists");
    assert.equal(schemaExists.rows[0].exists, false);
  } finally {
    await pool.end();
  }
});
