import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Creator, Collaboration, Campaign } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, StatusBadge } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function TalentManagerDashboard() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    Promise.all([
      api.get<{ success: boolean; data: Creator[] }>('/creators'),
      api.get<{ success: boolean; data: Collaboration[] }>('/collaborations'),
      api.get<{ success: boolean; data: Campaign[] }>('/campaigns'),
    ])
      .then(([cr, col, cam]) => {
        if (cr.success && cr.data) setCreators(cr.data);
        if (col.success && col.data) setCollabs(col.data);
        if (cam.success && cam.data) setCampaigns(cam.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    const pendingRequests = collabs.filter((c) => c.status === 'PENDING');
    const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE');
    setContext({
      page: 'Talent Manager Dashboard',
      route: '/dashboard/manager',
      data: {
        creatorCount: creators.length,
        pendingRequests: pendingRequests.length,
        activeCampaigns: activeCampaigns.length,
      },
    });
  }, [creators, collabs, campaigns, setContext]);

  const pendingRequests = collabs.filter((c) => c.status === 'PENDING');
  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE');

  if (loading) return <LoadingScreen label="Loading manager workspace..." />;

  return (
    <AppShell eyebrow="Manager workspace">
      <PageHeader
        title="Talent Manager"
        description="Oversee creator relationships, campaign pipeline, and active partnerships."
        action={<Link to="/creators" className="button">Browse Creators</Link>}
      />
      {error && <Alert>{error}</Alert>}

      <div className="metrics-strip" style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        <div className="metric">
          <span className="metric-label">Creators</span>
          <strong className="metric-value">{creators.length}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Pending requests</span>
          <strong className="metric-value">{pendingRequests.length}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Active campaigns</span>
          <strong className="metric-value">{activeCampaigns.length}</strong>
        </div>
      </div>

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease 100ms, transform 500ms ease 100ms' }}>
        <div className="panel" style={{ marginBottom: '1.1rem' }}>
          <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Creator roster</h2>
              <p>Managed creators and their status</p>
            </div>
            <Link to="/creators" className="button-link">View all</Link>
          </div>
          {creators.length === 0 ? (
            <EmptyState title="No creators yet" description="Add creators to build your roster." />
          ) : (
            <div className="list-rows">
              {creators.slice(0, 5).map((c, idx) => (
                <Link
                  key={c.id}
                  to={`/creators/${c.id}`}
                  className="list-row"
                  style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(6px)', transition: `opacity 400ms ease ${idx * 50 + 150}ms, transform 400ms ease ${idx * 50 + 150}ms` }}
                >
                  <div className="list-row-main">
                    <strong>{c.name || c.email}</strong>
                    <p>{c.niche || 'General'} · {c.followers?.toLocaleString() || 0} followers</p>
                  </div>
                  <div className="list-row-meta">
                    <span className="mono">{c.engagementRate ?? 0}% engagement</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Active campaigns</h2>
              <p>Campaigns currently running</p>
            </div>
            <Link to="/campaigns" className="button-link">View all</Link>
          </div>
          {activeCampaigns.length === 0 ? (
            <EmptyState title="No active campaigns" description="Active campaigns will appear here." />
          ) : (
            <div className="list-rows">
              {activeCampaigns.slice(0, 5).map((c, idx) => (
                <Link
                  key={c.id}
                  to={`/campaigns/${c.id}`}
                  className="list-row"
                  style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(6px)', transition: `opacity 400ms ease ${idx * 50 + 200}ms, transform 400ms ease ${idx * 50 + 200}ms` }}
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
      </div>
    </AppShell>
  );
}
