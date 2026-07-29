import { useCallback, useEffect, useState } from 'react';
import { fetchHealth, type HealthState } from './api';

export default function App() {
  const [health, setHealth] = useState<HealthState | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetchHealth()
      .then(setHealth)
      .finally(() => setLastCheckedAt(new Date().toISOString()));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main>
      <h1>LeaseMind — App Foundation Health</h1>
      <p>Synthetic development environment only. No real data.</p>
      <ul>
        <li>live: {health?.live ?? 'checking...'}</li>
        <li>ready: {health?.ready ?? 'checking...'}</li>
      </ul>
      <p>Last checked: {lastCheckedAt ?? 'never'}</p>
      <button type="button" onClick={refresh}>
        Refresh
      </button>
    </main>
  );
}
