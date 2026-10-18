import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Alert, AppShell, EmptyState, PageHeader, Section } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';
import { useAuth } from '../contexts/AuthContext';

type Tab = 'recommend' | 'summarize' | 'estimate' | 'email' | 'plan';

export default function AI() {
  const { user } = useAuth();
  const isBrandOrManager = user?.role === 'BRAND' || user?.role === 'TALENT_MANAGER';
  const availableTabs: Array<{ key: Tab; label: string }> = [
    ...(isBrandOrManager ? [{ key: 'recommend' as const, label: 'Recommend creators' }] : []),
    ...(['BRAND', 'CREATOR', 'TALENT_MANAGER'].includes(user?.role || '') ? [{ key: 'summarize' as const, label: 'Campaign summary' }] : []),
    { key: 'estimate', label: 'Price estimate' },
    ...(isBrandOrManager ? [{ key: 'email' as const, label: 'Generate email' }] : []),
    { key: 'plan', label: 'Content plan' },
  ];
  const [tab, setTab] = useState<Tab>(() => isBrandOrManager ? 'recommend' : user?.role === 'CREATOR' ? 'summarize' : 'estimate');
  const [campaigns, setCampaigns] = useState<Array<{ id: number; name: string }>>([]);
  const [creators, setCreators] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [campaignId, setCampaignId] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    setContext({ page: 'AI Tools', route: '/ai', data: {} });
  }, [setContext]);

  useEffect(() => {
    if (['BRAND', 'CREATOR', 'TALENT_MANAGER'].includes(user?.role || '')) {
      api.get<{ success: boolean; data: Array<{ id: number; name: string }> }>('/campaigns')
        .then((response) => setCampaigns(response.data || []))
        .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load campaigns.'));
    }
    if (isBrandOrManager) {
      api.get<{ success: boolean; data: Array<{ id: number; user?: { displayName?: string; email?: string } }> }>('/creators')
        .then((response) => setCreators((response.data || []).map((creator) => ({ id: creator.id, name: creator.user?.displayName || 'Creator', email: creator.user?.email || '' }))))
        .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load creators.'));
    }
  }, [isBrandOrManager, user?.role]);

  const run = async (fn: () => Promise<any>) => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const data = await fn();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI tool failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell eyebrow="AI Tools">
      <PageHeader
        title="AI Tools"
        description="CreatorOS AI utilities for recommendations, summaries, and automation."
      />
      {error && <Alert>{error}</Alert>}

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {availableTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`tab-button ${tab === t.key ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: '1fr 1fr' }}>
        <Section title={tab === 'recommend' ? 'Recommend creators' : tab === 'summarize' ? 'Summarize campaign' : tab === 'estimate' ? 'Estimate price' : tab === 'email' ? 'Generate email' : 'Content plan'} description="Input parameters">
          {['recommend', 'summarize', 'email'].includes(tab) && <div className="form-field" style={{ marginBottom: '1rem' }}><label htmlFor="ai-campaign">Campaign</label><select id="ai-campaign" className="input" value={campaignId} onChange={(event) => setCampaignId(event.target.value)}><option value="">Select a campaign</option>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name} (ID {campaign.id})</option>)}</select></div>}
          {tab === 'email' && <div className="form-field" style={{ marginBottom: '1rem' }}><label htmlFor="ai-creator">Creator</label><select id="ai-creator" className="input" value={creatorId} onChange={(event) => setCreatorId(event.target.value)}><option value="">Select a creator</option>{creators.map((creator) => <option key={creator.id} value={creator.id}>{creator.name}{creator.email ? ` Â· ${creator.email}` : ''} (ID {creator.id})</option>)}</select></div>}
          {tab === 'recommend' && (
            <RecommendForm onRun={() => run(async () => { if (!campaignId) throw new Error('Select a campaign first.'); return api.post('/ai/recommend-creators', { campaignId: Number(campaignId) }); })} />
          )}
          {tab === 'summarize' && (
            <SummarizeForm onRun={() => run(async () => { if (!campaignId) throw new Error('Select a campaign first.'); return api.post('/ai/summarize-campaign', { campaignId: Number(campaignId) }); })} />
          )}
          {tab === 'estimate' && (
            <EstimateForm onRun={() => run(async () => api.post('/ai/estimate-price', { niche: 'Technology', followers: 50000, engagementRate: 4.5, platform: 'instagram' }))} />
          )}
          {tab === 'email' && (
            <EmailForm onRun={() => run(async () => { if (!campaignId || !creatorId) throw new Error('Select a campaign and creator first.'); return api.post('/ai/generate-email', { campaignId: Number(campaignId), creatorId: Number(creatorId) }); })} />
          )}
          {tab === 'plan' && (
            <PlanForm onRun={() => run(async () => api.post('/ai/content-plan', { niche: 'Technology' }))} />
          )}
        </Section>

        <Section title="Result" description="AI output">
          {loading && <EmptyState title="Running..." description="Generating result" />}
          {!loading && !result && <EmptyState title="No result yet" description="Run a tool to see output" />}
          {result && (
            <pre className="result-console" style={{ margin: 0 }}>{result}</pre>
          )}
        </Section>
      </div>
    </AppShell>
  );
}

function RecommendForm({ onRun }: { onRun: () => void }) {
  return (
    <div className="form-actions">
      <button type="button" onClick={onRun} className="button">Run recommendation</button>
    </div>
  );
}

function SummarizeForm({ onRun }: { onRun: () => void }) {
  return (
    <div className="form-actions">
      <button type="button" onClick={onRun} className="button">Summarize campaign</button>
    </div>
  );
}

function EstimateForm({ onRun }: { onRun: () => void }) {
  return (
    <div className="form-actions">
      <button type="button" onClick={onRun} className="button">Estimate price</button>
    </div>
  );
}

function EmailForm({ onRun }: { onRun: () => void }) {
  return (
    <div className="form-actions">
      <button type="button" onClick={onRun} className="button">Generate email</button>
    </div>
  );
}

function PlanForm({ onRun }: { onRun: () => void }) {
  return (
    <div className="form-actions">
      <button type="button" onClick={onRun} className="button">Generate plan</button>
    </div>
  );
}
