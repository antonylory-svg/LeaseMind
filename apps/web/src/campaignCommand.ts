/// <reference types="vite/client" />

import type { Campaign } from './campaigns';

// Same-origin by default, matching api.ts/campaigns.ts.
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

// Synthetic-only Contacts Gate marker (ADR-0008 section 2). The server
// accepts only this exact literal -- the frontend cannot "declare" the
// gate passed with arbitrary text, only by sending this constant, which it
// only ever does after the synthetic Contacts screen.
export const SYNTHETIC_CONTACTS_GATE_EVIDENCE = 'synthetic-fixture-acknowledged-v1';

export type LaunchCampaignResult =
  | { kind: 'created'; campaign: Campaign }
  | { kind: 'replayed'; campaign: Campaign }
  | { kind: 'invalid'; error: string }
  | { kind: 'error' };

/**
 * The atomic Campaign launch command. Sends nothing but a client-generated
 * idempotency_key, the Technical Assignment reference/revision, the current
 * server-owned Analysis Snapshot reference, and the synthetic Contacts Gate
 * marker -- never a name, phone, email or any
 * other contact field (see
 * ADR-0007-synthetic-campaign-creation-command-boundary.md and
 * ADR-0008-technical-assignment-implementation.md). Retrying with the same
 * idempotencyKey is safe: the server returns the same Campaign
 * (kind: 'replayed') instead of creating a duplicate.
 */
export async function launchCampaign(
  idempotencyKey: string,
  technicalAssignmentId: string,
  expectedRevision: number,
  analysisSnapshotId: string
): Promise<LaunchCampaignResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        technical_assignment_id: technicalAssignmentId,
        expected_revision: expectedRevision,
        analysis_snapshot_id: analysisSnapshotId,
        contacts_gate_evidence: SYNTHETIC_CONTACTS_GATE_EVIDENCE
      })
    });
    if (response.status === 201) {
      return { kind: 'created', campaign: (await response.json()) as Campaign };
    }
    if (response.status === 200) {
      return { kind: 'replayed', campaign: (await response.json()) as Campaign };
    }
    if (response.status === 400) {
      const body = (await response.json()) as { error: string };
      return { kind: 'invalid', error: body.error };
    }
    return { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}
