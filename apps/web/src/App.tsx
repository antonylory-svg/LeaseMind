import { useCallback, useEffect, useState } from 'react';
import { fetchHealth, type HealthState } from './api';
import { fetchCampaigns, type CampaignsState } from './campaigns';

export default function App() {
  const [health, setHealth] = useState<HealthState | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignsState>({ kind: 'loading' });

  const refresh = useCallback(() => {
    fetchHealth()
      .then(setHealth)
      .finally(() => setLastCheckedAt(new Date().toISOString()));
    setCampaigns({ kind: 'loading' });
    fetchCampaigns().then(setCampaigns);
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

      <h2>Campaign Read Model (synthetic, technical view only)</h2>
      {campaigns.kind === 'loading' && <p>Loading campaigns...</p>}
      {campaigns.kind === 'error' && <p>Error loading campaigns.</p>}
      {campaigns.kind === 'empty' && <p>No synthetic campaigns.</p>}
      {campaigns.kind === 'loaded' && (
        <ul>
          {campaigns.campaigns.map(campaign => (
            <li key={campaign.campaign_id}>
              {campaign.campaign_id} — {campaign.status} (v{campaign.aggregate_version})
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
