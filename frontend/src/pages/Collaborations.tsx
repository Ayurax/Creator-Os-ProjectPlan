import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Collaboration } from '../types/api';
import { Alert, AppShell, DataTable, EmptyState, LoadingScreen, PageHeader, StatusBadge } from '../components/ui';

export default function Collaborations() {
  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadCollabs();
  }, []);

  const loadCollabs = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Collaboration[] }>('/collaborations');
      if (res.success && res.data) setCollabs(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    setActionError('');
    try {
      await api.patch(`/collaborations/${id}/accept`, {});
      loadCollabs();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleReject = async (id: string) => {
    setActionError('');
    try {
      await api.patch(`/collaborations/${id}/reject`, {});
      loadCollabs();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (loading) return <LoadingScreen label="Loading collaborations..." />;

  return (
    <AppShell eyebrow="Collaborations">
      <PageHeader
        title="Collaborations"
        description="Review collaboration requests, campaign links, creator IDs, and pending approval actions."
      />
        {error && <Alert>{error}</Alert>}
        {actionError && <Alert>{actionError}</Alert>}
        <DataTable>
          <table>
            <thead>
              <tr>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Campaign</th>
                <th className="text-left p-4">Creator</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collabs.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-4 id-cell">{c.id}</td>
                  <td className="p-4 id-cell">{c.campaignId}</td>
                  <td className="p-4 id-cell">{c.creatorId}</td>
                  <td className="p-4"><StatusBadge status={c.status} /></td>
                  <td className="p-4 flex gap-2">
                    {c.status === 'PENDING' && (
                      <>
                        <button type="button" onClick={() => handleAccept(c.id)} className="button button-success">Accept</button>
                        <button type="button" onClick={() => handleReject(c.id)} className="button button-danger">Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {collabs.length === 0 && (
                <tr><td colSpan={5}><EmptyState title="No collaborations found" description="New invitations and creator responses will appear here." /></td></tr>
              )}
            </tbody>
          </table>
        </DataTable>
    </AppShell>
  );
}
