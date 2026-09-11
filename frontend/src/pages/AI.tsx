import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Alert, AppShell, EmptyState, PageHeader, Section } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

type Tab = 'recommend' | 'summarize' | 'estimate' | 'email' | 'plan';

export default function AI() {
  const [tab, setTab] = useState<Tab>('recommend');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    setContext({ page: 'AI Tools', route: '/ai', data: {} });
  }, [setContext]);

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
        {([
          { key: 'recommend', label: 'Recommend creators' },
          { key: 'summarize', label: 'Campaign summary' },
          { key: 'estimate', label: 'Price estimate' },
          { key: 'email', label: 'Generate email' },
          { key: 'plan', label: 'Content plan' },
        ] as const).map((t) => (
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
          {tab === 'recommend' && (
            <RecommendForm onRun={() => run(async () => api.post('/ai/recommend-creators', { campaignId: Number(prompt('Campaign ID')) || 1 }))} />
          )}
          {tab === 'summarize' && (
            <SummarizeForm onRun={() => run(async () => api.post('/ai/summarize-campaign', { campaignId: Number(prompt('Campaign ID')) || 1 }))} />
          )}
          {tab === 'estimate' && (
            <EstimateForm onRun={() => run(async () => api.post('/ai/estimate-price', { niche: 'Technology', followers: 50000, engagementRate: 4.5, platform: 'instagram' }))} />
          )}
          {tab === 'email' && (
            <EmailForm onRun={() => run(async () => api.post('/ai/generate-email', { campaignId: Number(prompt('Campaign ID')) || 1, creatorId: Number(prompt('Creator ID')) || 1 }))} />
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

function prompt(message: string): string {
  return window.prompt(message) || '';
}
