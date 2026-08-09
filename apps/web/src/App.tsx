import { useCallback, useEffect, useState } from 'react';
import { fetchHealth, type HealthState } from './api';
import { fetchCampaigns, type CampaignsState } from './campaigns';
import CampaignLaunchWizard from './CampaignLaunchWizard';
import { HEALTH_STATUS_LABELS, CAMPAIGN_STATUS_LABELS, ruLabel } from './ruLabels';

type View = 'campaign' | 'campaigns-list' | 'health';

function HealthPanel() {
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
    <section>
      <h1>LeaseMind — технический статус платформы</h1>
      <p>Только синтетическая среда разработки. Реальные данные не используются.</p>
      <ul>
        <li>Доступность сервиса (live): {health ? ruLabel(HEALTH_STATUS_LABELS, health.live) : HEALTH_STATUS_LABELS.checking}</li>
        <li>Готовность к работе (ready): {health ? ruLabel(HEALTH_STATUS_LABELS, health.ready) : HEALTH_STATUS_LABELS.checking}</li>
      </ul>
      <p>Последняя проверка: {lastCheckedAt ?? 'ещё не выполнялась'}</p>
      <button type="button" onClick={refresh}>
        Обновить
      </button>
    </section>
  );
}

function CampaignsListPanel() {
  const [campaigns, setCampaigns] = useState<CampaignsState>({ kind: 'loading' });

  const refresh = useCallback(() => {
    setCampaigns({ kind: 'loading' });
    fetchCampaigns().then(setCampaigns);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <section>
      <h2>Список кампаний (синтетические данные)</h2>
      <button type="button" onClick={refresh}>
        Обновить
      </button>
      {campaigns.kind === 'loading' && <p>Загрузка списка кампаний...</p>}
      {campaigns.kind === 'error' && <p>Ошибка загрузки списка кампаний.</p>}
      {campaigns.kind === 'empty' && <p>Нет синтетических кампаний.</p>}
      {campaigns.kind === 'loaded' && (
        <ul>
          {campaigns.campaigns.map(campaign => (
            <li key={campaign.campaign_id}>
              {campaign.campaign_id} — {ruLabel(CAMPAIGN_STATUS_LABELS, campaign.status)} (версия {campaign.aggregate_version})
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function App() {
  const [view, setView] = useState<View>('campaign');

  return (
    <main>
      <nav>
        <button type="button" onClick={() => setView('campaign')} disabled={view === 'campaign'}>
          Кампания
        </button>{' '}
        <button type="button" onClick={() => setView('campaigns-list')} disabled={view === 'campaigns-list'}>
          Список кампаний
        </button>{' '}
        <button type="button" onClick={() => setView('health')} disabled={view === 'health'}>
          Технический статус
        </button>
      </nav>
      {view === 'campaign' && <CampaignLaunchWizard />}
      {view === 'campaigns-list' && <CampaignsListPanel />}
      {view === 'health' && <HealthPanel />}
    </main>
  );
}
