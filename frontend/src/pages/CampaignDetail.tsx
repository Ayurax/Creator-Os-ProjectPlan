import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Campaign, Collaboration } from '../types/api';
import { Alert, AppShell, DataTable, EmptyState, LoadingScreen, PageHeader, Section, StatusBadge } from '../components/ui';

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatorId, setCreatorId] = useState('');

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !creatorId) return;
    try {
      await api.post('/collaborations', { campaignId: id, creatorId });
      setCreatorId('');
      setCollabs((prev) => [...prev, { id: Date.now().toString(), campaignId: id, creatorId, status: 'PENDING', createdAt: new Date().toISOString() } as Collaboration]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (loading) return <LoadingScreen label="Loading campaign..." />;

  return (
    <AppShell eyebrow="Campaign detail">
        {error && <Alert>{error}</Alert>}
        {campaign && (
          <>
            <PageHeader
              title={campaign.name}
              description={campaign.description || 'Campaign details and collaboration invitations.'}
              action={<Link to="/campaigns" className="button button-secondary">Back to Campaigns</Link>}
            />
            <div className="stats-grid">
              <div className="stat-card">
                <span>Budget</span>
                <strong>{campaign.budget ? `$${campaign.budget}` : '-'}</strong>
              </div>
              <div className="stat-card">
                <span>Status</span>
                <strong><StatusBadge status={campaign.status} /></strong>
              </div>
              <div className="stat-card">
                <span>Collaborations</span>
                <strong>{collabs.length}</strong>
              </div>
            </div>

            <Section title="Invite creator" description="Collaboration request">
              <form onSubmit={handleInvite} className="form-grid two">
                <div className="form-field">
                  <label htmlFor="creator-id">Creator ID</label>
                  <input id="creator-id" value={creatorId} onChange={(e) => setCreatorId(e.target.value)} className="input" required />
                </div>
                <div className="form-actions">
                  <button type="submit" className="button">Invite</button>
                </div>
              </form>
            </Section>

            <DataTable>
              <table>
                <thead>
                  <tr>
                    <th className="text-left p-4">ID</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {collabs.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="p-4 id-cell">{c.id}</td>
                      <td className="p-4"><StatusBadge status={c.status} /></td>
                      <td className="p-4">
                        <Link to="/collaborations" className="button-link">View</Link>
                      </td>
                    </tr>
                  ))}
                  {collabs.length === 0 && (
                    <tr><td colSpan={3}><EmptyState title="No collaborations yet" description="Invite a creator to start the collaboration pipeline." /></td></tr>
                  )}
                </tbody>
              </table>
            </DataTable>
          </>
        )}
    </AppShell>
  );
}
