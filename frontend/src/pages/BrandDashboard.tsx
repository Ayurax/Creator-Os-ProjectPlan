import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Campaign, Collaboration, Contract } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, StatusBadge } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function BrandDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    Promise.all([
      api.get<{ success: boolean; data: Campaign[] }>('/campaigns'),
      api.get<{ success: boolean; data: Collaboration[] }>('/collaborations'),
      api.get<{ success: boolean; data: Contract[] }>('/contracts'),
    ])
      .then(([c, col, con]) => {
        if (c.success && c.data) setCampaigns(c.data);
        if (col.success && col.data) setCollabs(col.data);
        if (con.success && con.data) setContracts(con.data);
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
    setContext({
      page: 'Brand Dashboard',
      route: '/dashboard/brand',
      data: {
        campaignCount: campaigns.length,
        activeCampaigns: campaigns.filter((c) => c.status === 'ACTIVE').length,
        pendingCollaborations: collabs.filter((c) => c.status === 'PENDING').length,
        activeContracts: contracts.filter((c) => c.status === 'ACTIVE').length,
      },
    });
  }, [campaigns, collabs, contracts, setContext]);

  const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const pendingCollabs = collabs.filter((c) => c.status === 'PENDING').length;
  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;
  const recentCampaigns = campaigns.slice(0, 5);
  const pendingRequests = collabs.filter((c) => c.status === 'PENDING').slice(0, 5);

  if (loading) return <LoadingScreen label="Loading brand workspace..." />;

  return (
    <AppShell eyebrow="Brand workspace">
      <PageHeader
        title="Brand"
        description="Manage campaigns, review collaboration requests, and move contracts forward."
        action={<Link to="/campaigns" className="button">New Campaign</Link>}
      />
      {error && <Alert>{error}</Alert>}

      <div className="metrics-strip" style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        <div className="metric">
          <span className="metric-label">Active campaigns</span>
          <strong className="metric-value">{activeCampaigns}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Pending collaborations</span>
          <strong className="metric-value">{pendingCollabs}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Active contracts</span>
          <strong className="metric-value">{activeContracts}</strong>
        </div>
      </div>

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease 100ms, transform 500ms ease 100ms' }}>
        <div className="panel" style={{ marginBottom: '1.1rem' }}>
          <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Recent campaigns</h2>
              <p>Latest briefs and their status</p>
            </div>
            <Link to="/campaigns" className="button-link">View all</Link>
          </div>
          {recentCampaigns.length === 0 ? (
            <EmptyState title="No campaigns yet" description="Create your first campaign to start inviting creators." />
          ) : (
            <div className="list-rows">
              {recentCampaigns.map((c, idx) => (
                <Link
                  key={c.id}
                  to={`/campaigns/${c.id}`}
                  className="list-row"
                  style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(6px)', transition: `opacity 400ms ease ${idx * 50 + 150}ms, transform 400ms ease ${idx * 50 + 150}ms` }}
                >
                  <div className="list-row-main">
                    <strong>{c.name}</strong>
                    <p>{c.description || 'No description'}</p>
                  </div>
                  <div className="list-row-meta">
                    <StatusBadge status={c.status} />
                    {c.budget && <span className="mono">{typeof c.budget === 'number' ? `$${c.budget.toLocaleString()}` : c.budget}</span>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Pending requests</h2>
              <p>Collaborations awaiting response</p>
            </div>
            <Link to="/collaborations" className="button-link">View all</Link>
          </div>
          {pendingRequests.length === 0 ? (
            <EmptyState title="No pending requests" description="New invitations will appear here." />
          ) : (
            <div className="list-rows">
              {pendingRequests.map((r, idx) => (
                <Link
                  key={r.id}
                  to={`/collaborations`}
                  className="list-row"
                  style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(6px)', transition: `opacity 400ms ease ${idx * 50 + 200}ms, transform 400ms ease ${idx * 50 + 200}ms` }}
                >
                  <div className="list-row-main">
                    <strong>Request {r.id}</strong>
                    <p>Campaign {r.campaignId} · Creator {r.creatorId}</p>
                  </div>
                  <div className="list-row-meta">
                    <StatusBadge status={r.status} />
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
