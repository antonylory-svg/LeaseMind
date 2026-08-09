import { createHash } from 'node:crypto';

// Deterministic campaign_id derivation. Originally introduced for the bare
// idempotency_key-only Campaign creation command (ADR-0007); now reused by
// the atomic Technical-Assignment-driven launch command
// (apps/api/src/db/launchCampaign.ts, ADR-0008), which superseded that bare
// command as the implementation of POST /api/v1/campaigns.

const DOMAIN_SEPARATOR = 'LEASEMIND_CAMPAIGN_CREATION_COMMAND_V1';

/**
 * Deterministically derives a UUID v4-shaped campaign_id from the caller's
 * idempotency_key alone -- never accepted from the caller. The same key
 * always yields the same campaign_id, which is what lets
 * appendCampaignStatusEvent's own (campaign_id, idempotency_key) replay
 * check recognize a retried command instead of minting a duplicate
 * Campaign. A different key yields a (practically certain) different
 * campaign_id.
 */
export function deriveCampaignIdFromIdempotencyKey(idempotencyKey: string): string {
  const digest = createHash('sha256').update(`${DOMAIN_SEPARATOR}|${idempotencyKey}`).digest();
  const bytes = digest.subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // RFC 4122 version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant 10xx
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
