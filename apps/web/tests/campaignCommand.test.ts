import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { launchCampaign, SYNTHETIC_CONTACTS_GATE_EVIDENCE } from '../src/campaignCommand.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('launch sends the authorizing Analysis Snapshot and no contact/PII fields', async () => {
  let sentBody: Record<string, unknown> | undefined;
  globalThis.fetch = async (_input, init) => {
    sentBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return new Response(JSON.stringify({
      campaign_id: '00000000-0000-4000-8000-000000000004',
      status: 'Created',
      aggregate_version: '2',
      created_at: '2026-08-11T00:00:00.000Z',
      updated_at: '2026-08-11T00:00:00.000Z'
    }), { status: 201 });
  };

  const result = await launchCampaign(
    'launch-key',
    '00000000-0000-4000-8000-000000000002',
    3,
    '00000000-0000-4000-8000-000000000003'
  );
  assert.equal(result.kind, 'created');
  assert.deepEqual(sentBody, {
    idempotency_key: 'launch-key',
    technical_assignment_id: '00000000-0000-4000-8000-000000000002',
    expected_revision: 3,
    analysis_snapshot_id: '00000000-0000-4000-8000-000000000003',
    contacts_gate_evidence: SYNTHETIC_CONTACTS_GATE_EVIDENCE
  });
  for (const forbidden of ['name', 'phone', 'email']) {
    assert.equal(Object.keys(sentBody ?? {}).some(key => key.toLowerCase().includes(forbidden)), false);
  }
});
