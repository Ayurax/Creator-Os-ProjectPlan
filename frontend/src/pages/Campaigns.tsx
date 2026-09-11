import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Campaign } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, Section, StatusBadge } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    setContext({
      page: 'Campaigns',
      route: '/campaigns',
      data: {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter((c) => c.status === 'ACTIVE').length,
        draftCampaigns: campaigns.filter((c) => c.status === 'DRAFT').length,
      },
    });
  }, [campaigns, setContext]);

  const loadCampaigns = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Campaign[] }>('/campaigns');
      if (res.success && res.data) setCampaigns(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/campaigns', { name, description, budget: budget ? Number(budget) : undefined });
      setName('');
      setDescription('');
      setBudget('');
      setShowForm(false);
      loadCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    }
  };

  if (loading) return <LoadingScreen label="Loading campaigns..." />;

  return (
    <AppShell eyebrow="Campaigns">
      <PageHeader
        title="Campaigns"
        description="Manage brand campaigns, set budgets, and track collaboration progress."
        action={
          <button type="button" onClick={() => setShowForm((v) => !v)} className="button">
            {showForm ? 'Close form' : 'New Campaign'}
          </button>
        }
      />
      {error && <Alert>{error}</Alert>}

      {showForm && (
        <Section title="New campaign" description="Start a fresh collaboration brief">
          <form onSubmit={handleCreate} className="form-grid">
            <div className="form-field full">
              <label htmlFor="name">Campaign name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
            </div>
            <div className="form-field full">
              <label htmlFor="description">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="input" rows={3} />
            </div>
            <div className="form-field">
              <label htmlFor="budget">Budget</label>
              <input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="input" />
            </div>
            <div className="form-actions full">
              <button type="submit" className="button">Create campaign</button>
            </div>
          </form>
        </Section>
      )}

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        {campaigns.length === 0 ? (
          <div className="panel">
            <EmptyState title="No campaigns yet" description="Create your first campaign to start inviting creators." />
          </div>
        ) : (
          <div className="list-rows" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 'var(--radius)' }}>
            {campaigns.map((c, idx) => (
              <Link
                key={c.id}
                to={`/campaigns/${c.id}`}
                className="list-row"
                style={{
                  opacity: ready ? 1 : 0,
                  transform: ready ? 'translateY(0)' : 'translateY(6px)',
                  transition: `opacity 400ms ease ${idx * 40 + 100}ms, transform 400ms ease ${idx * 40 + 100}ms`,
                }}
              >
                <div className="list-row-main">
                  <strong>{c.name}</strong>
                  <p>{c.description || 'No description'}</p>
                </div>
                <div className="list-row-meta">
                  <StatusBadge status={c.status} />
                  {c.budget && <span className="mono">${typeof c.budget === 'number' ? c.budget.toLocaleString() : c.budget}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
