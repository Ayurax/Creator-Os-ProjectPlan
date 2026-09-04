import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Campaign } from '../types/api';
import { Alert, AppShell, DataTable, EmptyState, LoadingScreen, PageHeader, Section, StatusBadge } from '../components/ui';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

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
      await api.post('/campaigns', {
        name,
        description: description || undefined,
        budget: budget ? Number(budget) : undefined,
      });
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
        description="Create campaign briefs, manage budgets, and track campaign status without leaving the workspace."
        action={
          <button type="button" onClick={() => setShowForm(!showForm)} className={showForm ? 'button button-secondary' : 'button'}>
            {showForm ? 'Cancel' : 'New Campaign'}
          </button>
        }
      />
      {error && <Alert>{error}</Alert>}
        {showForm && (
          <Section title="New campaign" description="Campaign setup">
          <form onSubmit={handleCreate} className="form-grid">
            <div className="form-field">
              <label htmlFor="campaign-name">Name</label>
              <input id="campaign-name" value={name} onChange={(e) => setName(e.target.value)} className="input" required />
            </div>
            <div className="form-field full">
              <label htmlFor="campaign-description">Description</label>
              <textarea id="campaign-description" value={description} onChange={(e) => setDescription(e.target.value)} className="input" />
            </div>
            <div className="form-field">
              <label htmlFor="campaign-budget">Budget</label>
              <input id="campaign-budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="input" />
            </div>
            <div className="form-actions full">
              <button type="submit" className="button">Create Campaign</button>
            </div>
          </form>
          </Section>
        )}
        <DataTable>
          <table>
            <thead>
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Budget</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-4">{c.name}</td>
                  <td className="p-4">{c.budget ? `$${c.budget}` : '-'}</td>
                  <td className="p-4"><StatusBadge status={c.status} /></td>
                  <td className="p-4">
                    <Link to={`/campaigns/${c.id}`} className="button-link">View</Link>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr><td colSpan={4}><EmptyState title="No campaigns found" description="Create your first campaign to start inviting creators." /></td></tr>
              )}
            </tbody>
          </table>
        </DataTable>
    </AppShell>
  );
}
