import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Collaboration, Task, PortfolioItem } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, StatusBadge } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function CreatorDashboard() {
  const [collabs, setCollabs] = useState<Collaboration[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) return;
    api.get<{ success: boolean; data: { id: string } }>('/auth/me')
      .then((res) => { if (res.success && res.data) setUserId(res.data.id); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      api.get<{ success: boolean; data: Collaboration[] }>('/collaborations'),
      api.get<{ success: boolean; data: Task[] }>('/tasks'),
      api.get<{ success: boolean; data: PortfolioItem[] }>(`/creators/${userId}/portfolio`),
    ])
      .then(([col, t, p]) => {
        if (col.success && col.data) setCollabs(col.data);
        if (t.success && t.data) setTasks(t.data);
        if (p.success && p.data) setPortfolio(p.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    setContext({
      page: 'Creator Dashboard',
      route: '/dashboard/creator',
      data: {
        invitations: collabs.filter((c) => c.status === 'PENDING').length,
        activeTasks: tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'TODO').length,
        completedTasks: tasks.filter((t) => t.status === 'DONE').length,
        portfolioCount: portfolio.length,
      },
    });
  }, [collabs, tasks, portfolio, setContext]);

  const invitations = collabs.filter((c) => c.status === 'PENDING');
  const activeTasks = tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'TODO');
  const completedTasks = tasks.filter((t) => t.status === 'DONE').length;

  if (loading) return <LoadingScreen label="Loading creator workspace..." />;

  return (
    <AppShell eyebrow="Creator workspace">
      <PageHeader
        title="Creator"
        description="Review invitations, track active work, and manage your portfolio."
        action={<Link to="/portfolio" className="button">Update Portfolio</Link>}
      />
      {error && <Alert>{error}</Alert>}

      <div className="metrics-strip" style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        <div className="metric">
          <span className="metric-label">Invitations</span>
          <strong className="metric-value">{invitations.length}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Active tasks</span>
          <strong className="metric-value">{activeTasks.length}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Completed</span>
          <strong className="metric-value">{completedTasks}</strong>
        </div>
      </div>

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease 100ms, transform 500ms ease 100ms' }}>
        <div className="panel" style={{ marginBottom: '1.1rem' }}>
          <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Pending invitations</h2>
              <p>Collaboration requests awaiting your response</p>
            </div>
            <Link to="/collaborations" className="button-link">View all</Link>
          </div>
          {invitations.length === 0 ? (
            <EmptyState title="No pending invitations" description="New campaign invitations will appear here." />
          ) : (
            <div className="list-rows">
              {invitations.map((inv, idx) => (
                <Link
                  key={inv.id}
                  to="/collaborations"
                  className="list-row"
                  style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(6px)', transition: `opacity 400ms ease ${idx * 50 + 150}ms, transform 400ms ease ${idx * 50 + 150}ms` }}
                >
                  <div className="list-row-main">
                    <strong>Invitation {inv.id}</strong>
                    <p>Campaign {inv.campaignId}</p>
                  </div>
                  <div className="list-row-meta">
                    <StatusBadge status={inv.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="panel" style={{ marginBottom: '1.1rem' }}>
          <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Active tasks</h2>
              <p>Deliverables and deadlines</p>
            </div>
            <Link to="/tasks" className="button-link">View all</Link>
          </div>
          {activeTasks.length === 0 ? (
            <EmptyState title="No active tasks" description="Assigned tasks will appear here." />
          ) : (
            <div className="list-rows">
              {activeTasks.map((t, idx) => (
                <div
                  key={t.id}
                  className="list-row"
                  style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(6px)', transition: `opacity 400ms ease ${idx * 50 + 200}ms, transform 400ms ease ${idx * 50 + 200}ms` }}
                >
                  <div className="list-row-main">
                    <strong>{t.description}</strong>
                    <p>Due {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}</p>
                  </div>
                  <div className="list-row-meta">
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {portfolio.length > 0 && (
          <div className="panel">
            <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <h2>Portfolio</h2>
                <p>Recent additions</p>
              </div>
              <Link to="/portfolio" className="button-link">View all</Link>
            </div>
            <div className="list-rows">
              {portfolio.slice(0, 3).map((item, idx) => (
                <div
                  key={item.id}
                  className="list-row"
                  style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(6px)', transition: `opacity 400ms ease ${idx * 50 + 250}ms, transform 400ms ease ${idx * 50 + 250}ms` }}
                >
                  <div className="list-row-main">
                    <strong>{item.title}</strong>
                    <p>{item.description || 'No description'}</p>
                  </div>
                  {item.mediaUrl && (
                    <div className="list-row-meta">
                      <a href={item.mediaUrl} className="button-link" target="_blank" rel="noopener noreferrer">View</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
