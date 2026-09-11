import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import type { Campaign, Collaboration } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, StatusBadge } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function CampaignDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { setContext } = useAssistantContext();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [inviting, setInviting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<{ success: boolean; data: Campaign }>(`/campaigns/${id}`),
      api.get<{ success: boolean; data: Collaboration[] }>('/collaborations'),
    ])
      .then(([c, c2]) => {
        if (c.success && c.data) setCampaign(c.data);
        if (c2.success && c2.data) setCollabs(c2.data.filter((x) => x.campaignId === id));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    if (campaign) {
      setContext({
        page: 'Campaign Detail',
        route: location.pathname,
        entity: {
          type: 'campaign',
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
        },
        data: {
          budget: campaign.budget,
          description: campaign.description,
          collaborationCount: collabs.length,
        },
      });
    }
  }, [campaign, collabs, location.pathname, setContext]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !creatorId) return;
    setInviting(true);
    try {
      await api.post('/collaborations', { campaignId: id, creatorId });
      setCreatorId('');
      const res = await api.get<{ success: boolean; data: Collaboration[] }>('/collaborations');
      if (res.success && res.data) setCollabs(res.data.filter((x) => x.campaignId === id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite creator');
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <LoadingScreen label="Loading campaign..." />;

  return (
    <AppShell eyebrow="Campaign Detail">
      <PageHeader
        title={campaign?.name || 'Campaign'}
        description={campaign?.description || 'Campaign details and collaboration management'}
        action={
          <Link to="/campaigns" className="button-link">Back to campaigns</Link>
        }
      />
      {error && <Alert>{error}</Alert>}

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        <div className="panel" style={{ marginBottom: '1.1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'baseline' }}>
            <div>
              <span className="eyebrow">Status</span>
              <div style={{ marginTop: '0.3rem' }}>
                <StatusBadge status={campaign?.status} />
              </div>
            </div>
            {campaign?.budget && (
              <div>
                <span className="eyebrow">Budget</span>
                <div style={{ marginTop: '0.3rem', fontFamily: 'var(--font-family-mono)', fontSize: '1.1rem', fontWeight: 600 }}>
                  ${typeof campaign.budget === 'number' ? campaign.budget.toLocaleString() : campaign.budget}
                </div>
              </div>
            )}
            <div>
              <span className="eyebrow">Collaborations</span>
              <div style={{ marginTop: '0.3rem', fontSize: '0.9rem', color: 'var(--color-ink-secondary)' }}>
                {collabs.length} total
              </div>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: '1.1rem' }}>
          <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Invite creator</h2>
              <p>Send a collaboration request to a creator</p>
            </div>
          </div>
          <form onSubmit={handleInvite} className="form-grid">
            <div className="form-field">
              <label htmlFor="creatorId">Creator ID</label>
              <input id="creatorId" value={creatorId} onChange={(e) => setCreatorId(e.target.value)} className="input" required />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={inviting} className="button">
                {inviting ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Collaborations</h2>
              <p>Creator relationships for this campaign</p>
            </div>
            <Link to="/collaborations" className="button-link">View all</Link>
          </div>
          {collabs.length === 0 ? (
            <EmptyState title="No collaborations yet" description="Invite creators to start building relationships." />
          ) : (
            <div className="list-rows">
              {collabs.map((col, idx) => (
                <Link
                  key={col.id}
                  to="/collaborations"
                  className="list-row"
                  style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(6px)', transition: `opacity 400ms ease ${idx * 50 + 150}ms, transform 400ms ease ${idx * 50 + 150}ms` }}
                >
                  <div className="list-row-main">
                    <strong>Creator {col.creatorId}</strong>
                    <p>{col.message || 'No message'}</p>
                  </div>
                  <div className="list-row-meta">
                    <StatusBadge status={col.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
