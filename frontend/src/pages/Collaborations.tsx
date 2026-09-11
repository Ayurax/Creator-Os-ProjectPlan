import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Collaboration } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, StatusBadge } from '../components/ui';

const stages = [
  { key: 'PENDING', label: 'Pending', hue: 'warning' },
  { key: 'ACCEPTED', label: 'Accepted', hue: 'info' },
  { key: 'ACTIVE', label: 'Active', hue: 'success' },
  { key: 'COMPLETED', label: 'Completed', hue: 'success' },
] as const;

function stageIndex(status: string) {
  return stages.findIndex((s) => s.key === status.toUpperCase());
}

export default function Collaborations() {
  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadCollabs();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 40);
      return () => clearTimeout(t);
    }
  }, [loading]);

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
        description="Review requests, campaign links, and pending approval actions."
      />
      {error && <Alert>{error}</Alert>}
      {actionError && <Alert>{actionError}</Alert>}

      <div className="pipeline-bar" style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        {stages.map((stage, i) => {
          const count = collabs.filter((c) => c.status.toUpperCase() === stage.key).length;
          const activeIdx = stageIndex(collabs[0]?.status || '');
          return (
            <div key={stage.key} className={`pipeline-stage ${i <= activeIdx ? 'pipeline-stage-active' : ''}`}>
              <span className="pipeline-dot" />
              <span className="pipeline-label">{stage.label}</span>
              <span className="pipeline-count mono">{count}</span>
              {i < stages.length - 1 && <span className="pipeline-connector" />}
            </div>
          );
        })}
      </div>

      <div className="collab-grid">
        {collabs.map((c, idx) => {
          const idx_ = stageIndex(c.status);
          return (
            <div
              key={c.id}
              className="collab-card panel"
              style={{
                opacity: ready ? 1 : 0,
                transform: ready ? 'translateY(0)' : 'translateY(10px)',
                transition: `opacity 500ms ease ${idx * 60}ms, transform 500ms ease ${idx * 60}ms`,
              }}
            >
              <div className="collab-card-header">
                <StatusBadge status={c.status} />
                <span className="mono collab-id">{c.id}</span>
              </div>
              <div className="collab-thread">
                {stages.map((s, i) => (
                  <span key={s.key} className={`thread-dot ${i <= idx_ ? 'thread-dot-active' : ''}`} />
                ))}
              </div>
              <div className="collab-meta">
                <div className="collab-meta-item">
                  <span className="field-label">Campaign</span>
                  <span className="mono">{c.campaignId}</span>
                </div>
                <div className="collab-meta-item">
                  <span className="field-label">Creator</span>
                  <span className="mono">{c.creatorId}</span>
                </div>
              </div>
              {c.message && <p className="collab-message">{c.message}</p>}
              {c.status === 'PENDING' && (
                <div className="collab-actions">
                  <button type="button" onClick={() => handleAccept(c.id)} className="button button-success">Accept</button>
                  <button type="button" onClick={() => handleReject(c.id)} className="button button-danger">Reject</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {collabs.length === 0 && (
        <div className="panel" style={{ opacity: ready ? 1 : 0, transition: 'opacity 400ms ease' }}>
          <EmptyState title="No collaborations found" description="New invitations and creator responses will appear here." />
        </div>
      )}
    </AppShell>
  );
}
