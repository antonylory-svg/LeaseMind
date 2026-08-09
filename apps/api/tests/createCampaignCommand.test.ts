import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveCampaignIdFromIdempotencyKey } from '../src/db/createCampaign.js';
import { isUuidV4OrV7 } from '../src/uuid.js';

// Pure-function unit tests, no database required. See
// 03_ARCHITECTURE/decisions/ADR-0007-synthetic-campaign-creation-command-boundary.md.
// End-to-end idempotency/replay/distinct-key behavior through the real HTTP
// endpoint and database is covered in tests/openapiContract.test.ts.

test('deriveCampaignIdFromIdempotencyKey always returns a valid UUID v4', () => {
  const samples = ['a', 'a very long synthetic idempotency key with spaces and punctuation!', '', '0', 'ключ'];
  for (const key of samples) {
    const id = deriveCampaignIdFromIdempotencyKey(key);
    assert.equal(isUuidV4OrV7(id), true, `derived id for ${JSON.stringify(key)} must pass isUuidV4OrV7`);
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  }
});

test('deriveCampaignIdFromIdempotencyKey is deterministic: the same key always yields the same id', () => {
  const key = 'demo-launch-2026-07-31';
  const first = deriveCampaignIdFromIdempotencyKey(key);
  const second = deriveCampaignIdFromIdempotencyKey(key);
  assert.equal(first, second);
});

test('deriveCampaignIdFromIdempotencyKey yields different ids for different keys', () => {
  const ids = new Set(Array.from({ length: 200 }, (_, i) => deriveCampaignIdFromIdempotencyKey(`synthetic-key-${i}`)));
  assert.equal(ids.size, 200);
});
