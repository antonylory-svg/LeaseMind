// Opaque technical_assignment_id navigation state, kept in the URL query
// string only -- never localStorage/sessionStorage. Pure and DOM-free
// (URLSearchParams is a standard global in both the browser and Node), so
// it is directly unit-testable with plain node:test.
//
// The URL is per-tab by construction (every browser tab has its own
// location/history), which is exactly the "two tabs restore independently"
// property CampaignLaunchWizard.tsx needs -- nothing extra to build for it.
// Only the opaque id travels here; the Technical Assignment payload,
// property_exact_address and any contact data are never put in the URL,
// localStorage or sessionStorage -- CampaignLaunchWizard.tsx always
// re-fetches the actual content from the backend (GET
// /api/v1/technical-assignments/{id}), which alone is the source of truth
// for lifecycle_status.

const TA_QUERY_PARAM = 'ta';

export function getTechnicalAssignmentIdFromSearch(search: string): string | null {
  return new URLSearchParams(search).get(TA_QUERY_PARAM);
}

export function buildSearchWithTechnicalAssignmentId(search: string, technicalAssignmentId: string): string {
  const params = new URLSearchParams(search);
  params.set(TA_QUERY_PARAM, technicalAssignmentId);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function buildSearchWithoutTechnicalAssignmentId(search: string): string {
  const params = new URLSearchParams(search);
  params.delete(TA_QUERY_PARAM);
  const query = params.toString();
  return query ? `?${query}` : '';
}
