import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createPreLaunchAnalysisSnapshot,
  fetchAnalysisSnapshotById,
  fetchCurrentPreLaunchAnalysisSnapshot,
  type AnalysisSnapshot
} from '../src/analysisSnapshotApi.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const snapshot = {
  analysis_snapshot_id: '00000000-0000-4000-8000-000000000001',
  status: 'completed'
} as AnalysisSnapshot;

test('pre-launch create sends the complete normalized command and preserves explicit retry null', async () => {
  let sentBody: Record<string, unknown> | undefined;
  globalThis.fetch = async (_input, init) => {
    sentBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify(snapshot), { status: 201 });
  };

  const result = await createPreLaunchAnalysisSnapshot(
    'analysis-key-1',
    '00000000-0000-4000-8000-000000000002',
    3,
    null
  );
  assert.equal(result.kind, 'snapshot');
  assert.deepEqual(sentBody, {
    idempotency_key: 'analysis-key-1',
    technical_assignment_id: '00000000-0000-4000-8000-000000000002',
    expected_revision: 3,
    analysis_kind: 'pre_launch',
    campaign_id: null,
    retry_of_analysis_snapshot_id: null
  });
});

test('explicit retry sends the failed Snapshot reference without changing the logical request', async () => {
  let sentBody: Record<string, unknown> | undefined;
  globalThis.fetch = async (_input, init) => {
    sentBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify(snapshot), { status: 201 });
  };
  await createPreLaunchAnalysisSnapshot(
    'analysis-retry-key',
    '00000000-0000-4000-8000-000000000002',
    3,
    '00000000-0000-4000-8000-000000000003'
  );
  assert.equal(sentBody?.retry_of_analysis_snapshot_id, '00000000-0000-4000-8000-000000000003');
});

test('current read encodes the TA identity and requests pre_launch for the exact revision', async () => {
  let requestedUrl = '';
  globalThis.fetch = async input => {
    requestedUrl = String(input);
    return new Response(JSON.stringify(snapshot), { status: 200 });
  };
  const result = await fetchCurrentPreLaunchAnalysisSnapshot('00000000-0000-4000-8000-000000000002', 7);
  assert.equal(result.kind, 'snapshot');
  assert.ok(requestedUrl.includes('/technical-assignments/00000000-0000-4000-8000-000000000002/analysis-snapshots/current?'));
  assert.ok(requestedUrl.includes('revision=7'));
  assert.ok(requestedUrl.includes('analysis_kind=pre_launch'));
});

test('reads distinguish confirmed not-found, safe server rejection and transport failure', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ code: 'ANALYSIS_SNAPSHOT_NOT_FOUND', retryable: false }), { status: 404 });
  assert.deepEqual(
    await fetchCurrentPreLaunchAnalysisSnapshot('00000000-0000-4000-8000-000000000002', 1),
    { kind: 'not_found' }
  );

  globalThis.fetch = async () => new Response(JSON.stringify({ code: 'ANALYSIS_DATASET_UNAVAILABLE', retryable: true }), { status: 503 });
  assert.deepEqual(await fetchAnalysisSnapshotById(snapshot.analysis_snapshot_id), {
    kind: 'rejected',
    error: { code: 'ANALYSIS_DATASET_UNAVAILABLE', retryable: true }
  });

  globalThis.fetch = async () => {
    throw new Error('synthetic network failure');
  };
  assert.deepEqual(await fetchAnalysisSnapshotById(snapshot.analysis_snapshot_id), { kind: 'error' });
});
