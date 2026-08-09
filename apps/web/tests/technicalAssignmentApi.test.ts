import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchTechnicalAssignmentById,
  saveTechnicalAssignmentDraft,
  type TechnicalAssignment
} from '../src/technicalAssignmentApi.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const assignment: TechnicalAssignment = {
  technical_assignment_id: '00000000-0000-4000-8000-000000000123',
  scenario: 'need_tenant',
  schema_version: '1.0',
  revision: 4,
  lifecycle_status: 'ready_for_analysis',
  has_exact_address: false,
  payload: { property_type: 'office' },
  created_at: '2026-08-09T00:00:00.000Z',
  updated_at: '2026-08-09T00:00:00.000Z'
};

test('a restored-draft save sends the server-owned target ID and expected revision', async () => {
  const sentBodies: Array<Record<string, unknown>> = [];
  globalThis.fetch = async (_input, init) => {
    sentBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return new Response(JSON.stringify(assignment), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  const result = await saveTechnicalAssignmentDraft('fresh-command-key', 'need_tenant', assignment.payload, assignment);
  assert.equal(result.kind, 'saved');
  const sentBody = sentBodies[0];
  assert.equal(sentBody?.technical_assignment_id, assignment.technical_assignment_id);
  assert.equal(sentBody?.expected_revision, assignment.revision);
});

test('a first save omits update-only target fields', async () => {
  const sentBodies: Array<Record<string, unknown>> = [];
  globalThis.fetch = async (_input, init) => {
    sentBodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    return new Response(JSON.stringify(assignment), { status: 201 });
  };

  await saveTechnicalAssignmentDraft('creation-key', 'need_tenant', assignment.payload);
  assert.equal('technical_assignment_id' in sentBodies[0], false);
  assert.equal('expected_revision' in sentBodies[0], false);
});

test('restore distinguishes a confirmed 404 from transient HTTP and network failures', async () => {
  globalThis.fetch = async () => new Response('', { status: 404 });
  assert.deepEqual(await fetchTechnicalAssignmentById(assignment.technical_assignment_id), { kind: 'not_found' });

  globalThis.fetch = async () => new Response('', { status: 503 });
  assert.deepEqual(await fetchTechnicalAssignmentById(assignment.technical_assignment_id), { kind: 'error' });

  globalThis.fetch = async () => {
    throw new Error('synthetic network failure');
  };
  assert.deepEqual(await fetchTechnicalAssignmentById(assignment.technical_assignment_id), { kind: 'error' });
});

test('restore returns the loaded Technical Assignment only for a successful response', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify(assignment), { status: 200 });
  assert.deepEqual(await fetchTechnicalAssignmentById(assignment.technical_assignment_id), {
    kind: 'loaded',
    assignment
  });
});
