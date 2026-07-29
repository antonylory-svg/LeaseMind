export interface HealthState {
  live: 'ok' | 'error';
  ready: 'ok' | 'error';
}

// Synthetic development only: fixed local backend address, matching the
// api-service default HOST/PORT (see apps/api/.env.example).
const API_BASE_URL = 'http://127.0.0.1:3001';

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
