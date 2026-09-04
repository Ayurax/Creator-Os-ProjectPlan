import { useState } from 'react';
import { api } from '../api/client';
import { Alert, AppShell, PageHeader, Section } from '../components/ui';

type AiTab = 'recommend-creators' | 'recommend-brands' | 'estimate-price' | 'generate-email' | 'analytics-summary' | 'content-plan';

const tabs: Array<{ id: AiTab; label: string }> = [
  { id: 'recommend-creators', label: 'Recommend Creators' },
  { id: 'recommend-brands', label: 'Recommend Brands' },
  { id: 'estimate-price', label: 'Estimate Price' },
  { id: 'generate-email', label: 'Generate Email' },
  { id: 'analytics-summary', label: 'Analytics Summary' },
  { id: 'content-plan', label: 'Content Plan' },
];

export default function AI() {
  const [tab, setTab] = useState<AiTab>('recommend-creators');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [campaignId, setCampaignId] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [query, setQuery] = useState('');
  const [niche, setNiche] = useState('');
  const [followers, setFollowers] = useState('');
  const [engagementRate, setEngagementRate] = useState('');
  const [platform, setPlatform] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [duration, setDuration] = useState('');
  const [tone, setTone] = useState('professional');
  const [platforms, setPlatforms] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  const run = async () => {
    setError('');
    setResult('');
    setLoading(true);
    try {
      let res;
      switch (tab) {
        case 'recommend-creators':
          res = await api.post('/ai/recommend-creators', { campaignId, query: query || undefined });
          break;
        case 'recommend-brands':
          res = await api.post('/ai/recommend-brands', { creatorId, query: query || undefined });
          break;
        case 'estimate-price':
          res = await api.post('/ai/estimate-price', {
            niche,
            followers: Number(followers),
            engagementRate: Number(engagementRate),
            platform,
            deliverables: deliverables || undefined,
            duration: duration || undefined,
          });
          break;
        case 'generate-email':
          res = await api.post('/ai/generate-email', { campaignId, creatorId, tone });
          break;
        case 'analytics-summary':
          res = await api.post('/ai/analytics-summary', { campaignId });
          break;
        case 'content-plan':
          res = await api.post('/ai/content-plan', {
            niche,
            campaignId: campaignId || undefined,
            platforms: platforms ? platforms.split(',') : undefined,
            targetAudience: targetAudience || undefined,
          });
          break;
      }
      setResult(JSON.stringify(res, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell eyebrow="AI Tools">
      <PageHeader
        title="AI Tools"
        description="Use CreatorOS AI workflows for recommendations, pricing, outreach, analytics summaries, and content planning."
      />
        <div className="tab-list">
          {tabs.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`tab-button ${tab === t.id ? 'active' : ''}`}>{t.label}</button>
          ))}
        </div>
        <Section title={tabs.find((t) => t.id === tab)?.label} description="AI workflow">
          <div className="form-grid two">
            {tab === 'recommend-creators' && (
              <>
                <div className="form-field">
                  <label htmlFor="ai-campaign-id">Campaign ID</label>
                  <input id="ai-campaign-id" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} placeholder="Campaign ID" className="input" />
                </div>
                <div className="form-field">
                  <label htmlFor="ai-query">Query</label>
                  <input id="ai-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Optional" className="input" />
                </div>
              </>
            )}
            {tab === 'recommend-brands' && (
              <>
                <div className="form-field">
                  <label htmlFor="ai-creator-id">Creator ID</label>
                  <input id="ai-creator-id" value={creatorId} onChange={(e) => setCreatorId(e.target.value)} placeholder="Creator ID" className="input" />
                </div>
                <div className="form-field">
                  <label htmlFor="ai-brand-query">Query</label>
                  <input id="ai-brand-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Optional" className="input" />
                </div>
              </>
            )}
            {tab === 'estimate-price' && (
              <>
                <div className="form-field"><label htmlFor="ai-niche">Niche</label><input id="ai-niche" value={niche} onChange={(e) => setNiche(e.target.value)} className="input" required /></div>
                <div className="form-field"><label htmlFor="ai-followers">Followers</label><input id="ai-followers" type="number" value={followers} onChange={(e) => setFollowers(e.target.value)} className="input" required /></div>
                <div className="form-field"><label htmlFor="ai-engagement">Engagement Rate</label><input id="ai-engagement" type="number" step="0.01" value={engagementRate} onChange={(e) => setEngagementRate(e.target.value)} className="input" required /></div>
                <div className="form-field"><label htmlFor="ai-platform">Platform</label><input id="ai-platform" value={platform} onChange={(e) => setPlatform(e.target.value)} className="input" required /></div>
                <div className="form-field"><label htmlFor="ai-deliverables">Deliverables</label><input id="ai-deliverables" value={deliverables} onChange={(e) => setDeliverables(e.target.value)} placeholder="Optional" className="input" /></div>
                <div className="form-field"><label htmlFor="ai-duration">Duration</label><input id="ai-duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Optional" className="input" /></div>
              </>
            )}
            {tab === 'generate-email' && (
              <>
                <div className="form-field"><label htmlFor="ai-email-campaign">Campaign ID</label><input id="ai-email-campaign" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="input" /></div>
                <div className="form-field"><label htmlFor="ai-email-creator">Creator ID</label><input id="ai-email-creator" value={creatorId} onChange={(e) => setCreatorId(e.target.value)} className="input" /></div>
                <div className="form-field"><label htmlFor="ai-tone">Tone</label><select id="ai-tone" value={tone} onChange={(e) => setTone(e.target.value)} className="input">
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="friendly">Friendly</option>
                  </select></div>
              </>
            )}
            {tab === 'analytics-summary' && (
              <div className="form-field">
                <label htmlFor="ai-summary-campaign">Campaign ID</label>
                <input id="ai-summary-campaign" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="input" />
              </div>
            )}
            {tab === 'content-plan' && (
              <>
                <div className="form-field"><label htmlFor="ai-plan-niche">Niche</label><input id="ai-plan-niche" value={niche} onChange={(e) => setNiche(e.target.value)} className="input" required /></div>
                <div className="form-field"><label htmlFor="ai-plan-campaign">Campaign ID</label><input id="ai-plan-campaign" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} placeholder="Optional" className="input" /></div>
                <div className="form-field"><label htmlFor="ai-platforms">Platforms</label><input id="ai-platforms" value={platforms} onChange={(e) => setPlatforms(e.target.value)} placeholder="Comma-separated" className="input" /></div>
                <div className="form-field"><label htmlFor="ai-audience">Target Audience</label><input id="ai-audience" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Optional" className="input" /></div>
              </>
            )}
          </div>
          <div className="form-actions mt-panel">
          <button type="button" onClick={run} disabled={loading} className="button">
            {loading ? 'Running...' : 'Run'}
          </button>
          </div>
        </Section>
        {error && <Alert>{error}</Alert>}
        {result && (
          <pre className="result-console">{result}</pre>
        )}
    </AppShell>
  );
}
