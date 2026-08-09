/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

export type Scenario = 'need_tenant' | 'need_property';
export type LifecycleStatus = 'draft' | 'ready_for_analysis' | 'campaign_started';

export interface TechnicalAssignment {
  technical_assignment_id: string;
  scenario: Scenario;
  schema_version: string;
  revision: number;
  lifecycle_status: LifecycleStatus;
  has_exact_address: boolean;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type SaveTechnicalAssignmentResult =
  | { kind: 'saved'; assignment: TechnicalAssignment }
  | { kind: 'invalid'; field_id: string | null; error: string }
  | { kind: 'error' };

export type FetchTechnicalAssignmentResult =
  | { kind: 'loaded'; assignment: TechnicalAssignment }
  | { kind: 'not_found' }
  | { kind: 'error' };

/** The only write call for the Technical Assignment step. `payload` must
 * contain only the approved field_ids for the given scenario -- the server
 * rejects anything else. Once a draft exists, its server-owned ID/revision
 * are sent together so reloads can update the same row and stale tabs fail
 * closed instead of overwriting newer data. */
export async function saveTechnicalAssignmentDraft(
  idempotencyKey: string,
  scenario: Scenario,
  payload: Record<string, unknown>,
  existing?: Pick<TechnicalAssignment, 'technical_assignment_id' | 'revision'>
): Promise<SaveTechnicalAssignmentResult> {
  try {
    const target = existing
      ? { technical_assignment_id: existing.technical_assignment_id, expected_revision: existing.revision }
      : {};
    const response = await fetch(`${API_BASE_URL}/api/v1/technical-assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idempotency_key: idempotencyKey, ...target, scenario, payload })
    });
    if (response.status === 200 || response.status === 201) {
      return { kind: 'saved', assignment: (await response.json()) as TechnicalAssignment };
    }
    if (response.status === 400) {
      const body = (await response.json()) as { error: string; field_id?: string | null };
      return { kind: 'invalid', field_id: body.field_id ?? null, error: body.error };
    }
    return { kind: 'error' };
  } catch {
    return { kind: 'error' };
  }
}

export async function fetchTechnicalAssignmentById(technicalAssignmentId: string): Promise<FetchTechnicalAssignmentResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/technical-assignments/${encodeURIComponent(technicalAssignmentId)}`);
    if (response.status === 404) return { kind: 'not_found' };
    if (!response.ok) return { kind: 'error' };
    return { kind: 'loaded', assignment: (await response.json()) as TechnicalAssignment };
  } catch {
    return { kind: 'error' };
  }
}
