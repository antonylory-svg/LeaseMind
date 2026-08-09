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
import { deriveCampaignIdFromIdempotencyKey } from '../src/db/createCampaign.js';
import { saveTechnicalAssignmentDraft } from '../src/db/technicalAssignment.js';
import { CAMPAIGN_STATUSES } from '../src/db/campaigns.js';
import {
  MIGRATION_DATABASE_URL,
  MAINTENANCE_DATABASE_URL,
  API_DATABASE_URL,
  COMMAND_DATABASE_URL,
  TA_DATABASE_URL,
  hasDatabase
} from './testDatabaseUrls.js';

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
  '/api/v1/campaigns': ['get', 'post'],
  '/api/v1/campaigns/{campaignId}': ['get'],
  '/api/v1/technical-assignments': ['post'],
  '/api/v1/technical-assignments/{technicalAssignmentId}': ['get']
};
const ALL_HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const WRITE_PATHS = ['/api/v1/campaigns', '/api/v1/technical-assignments'];

test('the contract documents exactly the seven allowed operations, nothing else', () => {
  assert.deepEqual(Object.keys(api.paths).sort(), Object.keys(EXPECTED_PATH_METHODS).sort());
  for (const [pathKey, allowedMethods] of Object.entries(EXPECTED_PATH_METHODS)) {
    const item = api.paths[pathKey];
    const present = ALL_HTTP_METHODS.filter(m => item[m] !== undefined);
    assert.deepEqual(present.sort(), [...allowedMethods].sort(), `unexpected method set on ${pathKey}`);
  }
});

test('no write method exists anywhere except the two documented POST operations', () => {
  for (const pathKey of Object.keys(api.paths)) {
    for (const method of ['put', 'patch', 'delete']) {
      assert.equal(api.paths[pathKey][method], undefined, `${method.toUpperCase()} must not exist on ${pathKey}`);
    }
    if (!WRITE_PATHS.includes(pathKey)) {
      assert.equal(api.paths[pathKey].post, undefined, `POST must not exist on ${pathKey}`);
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
  assert.equal(ids.length, 7);
  assert.equal(new Set(ids).size, 7, 'operationId values must be unique');
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

    const launchResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: 'openapi-contract-503-probe',
        technical_assignment_id: '00000000-0000-4000-8000-000000000001',
        expected_revision: 1,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(launchResponse.statusCode, 503);
    assertMatchesSchema(
      responseSchema('/api/v1/campaigns', 'post', 503),
      launchResponse.json(),
      'launch-campaign 503 body must match contract'
    );
    assertNoLeakedSecrets(launchResponse.body);
  } finally {
    await app.close();
  }
});

async function createReadyProperty(technicalAssignmentPool: pg.Pool, idempotencyKey: string): Promise<{ id: string; revision: number }> {
  // Calls the DB command directly rather than spinning up a second
  // buildApp() sharing the caller's pool: buildApp's onClose hook ends
  // every pool it was given, so a nested app.close() here would end the
  // caller's still-in-use technicalAssignmentPool out from under it
  // ("Called end on pool more than once" on the caller's own close).
  const result = await saveTechnicalAssignmentDraft(technicalAssignmentPool, {
    idempotencyKey,
    scenario: 'need_tenant',
    payload: {
      property_type: 'office',
      property_country_code: 'RU',
      property_region: 'Synthetic Region',
      property_city: 'Synthetic City',
      property_area_sqm: 100,
      property_condition: 'ready_to_use',
      property_available_from: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      property_monthly_rent_rub: 150000,
      property_operating_expenses_included: true,
      property_utilities_included: true,
      property_allowed_business_categories: ['office'],
      property_deal_priority: 'balanced'
    }
  });
  assert.equal(result.lifecycle_status, 'ready_for_analysis');
  return { id: result.technical_assignment_id, revision: result.revision };
}

test('POST /api/v1/campaigns: a well-formed launch command creates a Campaign matching the documented 201 schema', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const technicalAssignmentPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, commandPool, technicalAssignmentPool, logger: false });
  try {
    const ta = await createReadyProperty(technicalAssignmentPool, 'openapi-contract:launch-201-ta');
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      payload: {
        idempotency_key: 'openapi-contract:launch-201-probe',
        technical_assignment_id: ta.id,
        expected_revision: ta.revision,
        contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
      }
    });
    assert.equal(response.statusCode, 201);
    const body = response.json();
    assertMatchesSchema(responseSchema('/api/v1/campaigns', 'post', 201), body, 'launch-campaign 201 body must match contract');
    assert.equal(body.status, 'Created');
    assert.equal(body.created_at, body.updated_at);

    const detail = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${body.campaign_id}` });
    assert.equal(detail.statusCode, 200);
    assert.deepEqual(detail.json(), body, 'the created Campaign must be immediately visible via GET by id');
  } finally {
    await app.close();
  }
});

test('POST /api/v1/campaigns: retrying the same idempotency_key returns the same Campaign (200), not a duplicate', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const technicalAssignmentPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, commandPool, technicalAssignmentPool, logger: false });
  try {
    const ta = await createReadyProperty(technicalAssignmentPool, 'openapi-contract:launch-replay-ta');
    const payload = {
      idempotency_key: 'openapi-contract:launch-replay-probe',
      technical_assignment_id: ta.id,
      expected_revision: ta.revision,
      contacts_gate_evidence: 'synthetic-fixture-acknowledged-v1'
    };
    const first = await app.inject({ method: 'POST', url: '/api/v1/campaigns', payload });
    assert.equal(first.statusCode, 201);

    const second = await app.inject({ method: 'POST', url: '/api/v1/campaigns', payload });
    assert.equal(second.statusCode, 200);
    assertMatchesSchema(responseSchema('/api/v1/campaigns', 'post', 200), second.json(), 'replay body must match contract');
    assert.deepEqual(second.json(), first.json(), 'a replay must return the exact same Campaign, not a new one');

    const list = await app.inject({ method: 'GET', url: '/api/v1/campaigns' });
    const matches = (list.json() as { campaigns: Array<{ campaign_id: string }> }).campaigns.filter(
      c => c.campaign_id === first.json().campaign_id
    );
    assert.equal(matches.length, 1, 'exactly one Campaign must exist for this idempotency_key, never a duplicate');
  } finally {
    await app.close();
  }
});

test('POST /api/v1/campaigns: malformed or unexpected-property bodies match the documented 400 schema', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const commandPool = new pg.Pool({ connectionString: COMMAND_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, commandPool, logger: false });
  try {
    const cases = [
      {},
      { idempotency_key: '' },
      { idempotency_key: 'ok', technical_assignment_id: '00000000-0000-4000-8000-000000000001', expected_revision: 1, contacts_gate_evidence: 'x', phone: '+1-555-0100' },
      { idempotency_key: 123, technical_assignment_id: '00000000-0000-4000-8000-000000000001', expected_revision: 1, contacts_gate_evidence: 'x' }
    ];
    for (const payload of cases) {
      const response = await app.inject({ method: 'POST', url: '/api/v1/campaigns', payload });
      assert.equal(response.statusCode, 400, `payload ${JSON.stringify(payload)} must be rejected`);
      assertMatchesSchema(responseSchema('/api/v1/campaigns', 'post', 400), response.json(), '400 body must match contract');
      assert.equal(response.body.includes('phone'), false, 'the rejected field name/value must never be echoed back');
      assert.equal(response.body.includes('555-0100'), false);
    }
  } finally {
    await app.close();
  }
});

test('POST /api/v1/technical-assignments: a well-formed draft matches the documented 201 schema', { skip: !hasDatabase }, async () => {
  const technicalAssignmentPool = new pg.Pool({ connectionString: TA_DATABASE_URL, max: 2 });
  const app = buildApp({ pool: technicalAssignmentPool, technicalAssignmentPool, logger: false });
  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/technical-assignments',
      payload: {
        idempotency_key: 'openapi-contract:ta-schema-probe',
        scenario: 'need_property',
        payload: {
          request_business_category: 'office',
          request_business_stage: 'operating',
          request_country_code: 'RU',
          request_region: 'Synthetic Region',
          request_cities: ['Synthetic City'],
          request_property_types: ['office'],
          request_area_min_sqm: 50,
          request_area_max_sqm: 150,
          request_monthly_budget_max_rub: 200000,
          request_budget_includes_operating_expenses: true,
          request_condition_options: ['ready_to_use'],
          request_move_in_by: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
          request_deal_priority: 'balanced'
        }
      }
    });
    assert.equal(response.statusCode, 201);
    assertMatchesSchema(responseSchema('/api/v1/technical-assignments', 'post', 201), response.json(), 'technical-assignment 201 body must match contract');

    const fetched = await app.inject({ method: 'GET', url: `/api/v1/technical-assignments/${response.json().technical_assignment_id}` });
    assertMatchesSchema(
      responseSchema('/api/v1/technical-assignments/{technicalAssignmentId}', 'get', 200),
      fetched.json(),
      'technical-assignment GET 200 body must match contract'
    );
  } finally {
    await app.close();
  }
});

test('cleanup: remove openapi-contract POST-probe campaigns/technical assignments so later "exactly 11" assertions stay valid', { skip: !hasDatabase }, async () => {
  const launchIdempotencyKeys = ['openapi-contract:launch-201-probe', 'openapi-contract:launch-replay-probe'];
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    for (const key of launchIdempotencyKeys) {
      const campaignId = deriveCampaignIdFromIdempotencyKey(key);
      await pool.query('DELETE FROM leasemind_app.campaign_current_state_projection WHERE campaign_id = $1', [campaignId]);
      await pool.query('DELETE FROM leasemind_app.campaign_stream_head WHERE campaign_id = $1', [campaignId]);
    }
    await pool.query(
      "DELETE FROM leasemind_app.property WHERE idempotency_key IN ('openapi-contract:launch-201-ta', 'openapi-contract:launch-replay-ta')"
    );
    await pool.query("DELETE FROM leasemind_app.tenant_request WHERE idempotency_key = 'openapi-contract:ta-schema-probe'");
  } finally {
    await pool.end();
  }
});

test('an undocumented endpoint/method is not part of the contract and is not routable at runtime', { skip: !hasDatabase }, async () => {
  const pool = new pg.Pool({ connectionString: API_DATABASE_URL, max: 2 });
  const app = buildApp({ pool, logger: false });
  try {
    assert.equal(app.hasRoute({ method: 'POST', url: '/api/v1/campaigns' }), true, 'POST /api/v1/campaigns is the one documented write operation');
    assert.equal(app.hasRoute({ method: 'PUT', url: '/api/v1/campaigns/:campaignId' }), false);
    assert.equal(app.hasRoute({ method: 'PATCH', url: '/api/v1/campaigns/:campaignId' }), false);
    assert.equal(app.hasRoute({ method: 'DELETE', url: '/api/v1/campaigns/:campaignId' }), false);
    assert.equal(app.hasRoute({ method: 'POST', url: '/api/v1/campaigns/:campaignId' }), false);
    assert.equal(app.hasRoute({ method: 'GET', url: '/api/v1/campaigns/:campaignId/history' }), false);
    assert.equal(
      app.hasRoute({ method: 'POST', url: '/api/v1/technical-assignments' }),
      true,
      'POST /api/v1/technical-assignments is the one documented technical-assignment write operation'
    );
    assert.equal(app.hasRoute({ method: 'GET', url: '/api/v1/technical-assignments/:technicalAssignmentId' }), true);
    assert.equal(app.hasRoute({ method: 'PUT', url: '/api/v1/technical-assignments' }), false);
    assert.equal(app.hasRoute({ method: 'PATCH', url: '/api/v1/technical-assignments/:technicalAssignmentId' }), false);
    assert.equal(app.hasRoute({ method: 'DELETE', url: '/api/v1/technical-assignments/:technicalAssignmentId' }), false);

    const attempts = [
      { method: 'PUT' as const, url: '/api/v1/campaigns/00000000-0000-4000-8000-000000000001' },
      { method: 'DELETE' as const, url: '/api/v1/campaigns/00000000-0000-4000-8000-000000000001' },
      { method: 'POST' as const, url: '/api/v1/campaigns/00000000-0000-4000-8000-000000000001' },
      { method: 'PATCH' as const, url: '/api/v1/technical-assignments/00000000-0000-4000-8000-000000000001' },
      { method: 'DELETE' as const, url: '/api/v1/technical-assignments/00000000-0000-4000-8000-000000000001' }
    ];
    for (const attempt of attempts) {
      const response = await app.inject(attempt);
      assert.equal(response.statusCode, 404, `${attempt.method} ${attempt.url} must not be routable`);
    }
  } finally {
    await app.close();
  }
});

test('migration 006 down is blocked once a subject_linked event exists (cannot discard event data it cannot represent)', { skip: !hasDatabase }, async () => {
  // The launch-contract tests above created at least one
  // 'campaign.subject_linked.v1' row via POST /api/v1/campaigns. The Event
  // Log is immutable (Sprint 0/2 controlled artifact) and 006's down
  // migration intentionally refuses to run while such a row exists
  // (ADR-0008), so this file can no longer complete a full down-to-empty
  // teardown once its own contract probes have launched a Campaign -- that
  // is the safety mechanism working as designed, not a regression. The
  // standalone "provision -> up -> down -> empty catalog" pass exercised
  // elsewhere in this session's regression (no seed, no Campaign launches)
  // is what proves the migration chain itself round-trips cleanly.
  const pool = new pg.Pool({ connectionString: MIGRATION_DATABASE_URL, max: 2 });
  try {
    await assert.rejects(() => migrateDown(pool), /campaign_event_log_payload_check/);
    const schemaExists = await pool.query("SELECT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'leasemind_app') AS exists");
    assert.equal(schemaExists.rows[0].exists, true);
  } finally {
    await pool.end();
  }
});
