import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Contract } from '../types/api';
import { Alert, AppShell, DataTable, EmptyState, LoadingScreen, PageHeader, Section, StatusBadge } from '../components/ui';

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [collabId, setCollabId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Contract[] }>('/contracts');
      if (res.success && res.data) setContracts(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/contracts', { collaborationRequestId: collabId });
      setCollabId('');
      loadContracts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  const handleStatus = async (id: string, status: string) => {
    setError('');
    try {
      await api.patch(`/contracts/${id}/status`, { status });
      loadContracts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  const filtered = statusFilter ? contracts.filter((c) => c.status === statusFilter) : contracts;

  if (loading) return <LoadingScreen label="Loading contracts..." />;

  return (
    <AppShell eyebrow="Contracts">
      <PageHeader
        title="Contracts"
        description="Create contracts from collaboration requests and move agreements from pending to active to complete."
      />
        {error && <Alert>{error}</Alert>}
        <Section title="Create contract" description="Contract setup">
        <form onSubmit={handleCreate} className="form-grid two">
          <div className="form-field">
            <label htmlFor="collab-id">Collaboration Request ID</label>
            <input id="collab-id" value={collabId} onChange={(e) => setCollabId(e.target.value)} className="input" required />
          </div>
          <div className="form-actions">
            <button type="submit" className="button">Create Contract</button>
          </div>
        </form>
        </Section>
        <div className="toolbar">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
        <DataTable>
          <table>
            <thead>
              <tr>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Collab Request</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-4 id-cell">{c.id}</td>
                  <td className="p-4 id-cell">{c.collaborationRequestId}</td>
                  <td className="p-4"><StatusBadge status={c.status} /></td>
                  <td className="p-4 flex gap-2">
                    <button type="button" onClick={() => handleStatus(c.id, 'ACTIVE')} className="button button-success">Activate</button>
                    <button type="button" onClick={() => handleStatus(c.id, 'COMPLETED')} className="button">Complete</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4}><EmptyState title="No contracts found" description="Create a contract from an accepted collaboration request." /></td></tr>
              )}
            </tbody>
          </table>
        </DataTable>
    </AppShell>
  );
}
