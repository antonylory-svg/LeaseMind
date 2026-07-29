/// <reference types="vite/client" />

export interface HealthState {
  live: 'ok' | 'error';
  ready: 'ok' | 'error';
}

// Same-origin by default: relative /api/... paths, proxied to the local API
// by Vite's dev server (see vite.config.ts) and expected to be served under
// the same origin in any deployment. No CORS headers are required this way.
// VITE_API_BASE_URL is an optional explicit override for environments where
// the API is genuinely on a different origin; it must never be required for
// a production build to work.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

function isOkStatus(value: unknown): boolean {
  return Boolean(value) && typeof value === 'object' && (value as { status?: unknown }).status === 'ok';
}

async function getJson(path: string): Promise<unknown> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchHealth(): Promise<HealthState> {
  const [live, ready] = await Promise.all([
    getJson('/api/v1/health/live'),
    getJson('/api/v1/health/ready')
  ]);

  return {
    live: isOkStatus(live) ? 'ok' : 'error',
    ready: isOkStatus(ready) ? 'ok' : 'error'
  };
}
