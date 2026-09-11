import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Task, Payment } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, StatusBadge } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function FreelancerDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    Promise.all([
      api.get<{ success: boolean; data: Task[] }>('/tasks'),
      api.get<{ success: boolean; data: Payment[] }>('/payments'),
    ])
      .then(([t, p]) => {
        if (t.success && t.data) setTasks(t.data);
        if (p.success && p.data) setPayments(p.data);
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
    const openTasks = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS');
    const pendingPayments = payments.filter((p) => p.status === 'PENDING');
    const totalPaid = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
    setContext({
      page: 'Freelancer Dashboard',
      route: '/dashboard/freelancer',
      data: {
        openTasks: openTasks.length,
        pendingPayments: pendingPayments.length,
        totalPaid,
      },
    });
  }, [tasks, payments, setContext]);

  const openTasks = tasks.filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS');
  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const totalPaid = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);

  if (loading) return <LoadingScreen label="Loading freelancer workspace..." />;

  return (
    <AppShell eyebrow="Freelancer workspace">
      <PageHeader
        title="Freelancer"
        description="Track deliverables, manage deadlines, and review payments."
        action={<Link to="/tasks" className="button">View Tasks</Link>}
      />
      {error && <Alert>{error}</Alert>}

      <div className="metrics-strip" style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        <div className="metric">
          <span className="metric-label">Open tasks</span>
          <strong className="metric-value">{openTasks.length}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Pending payments</span>
          <strong className="metric-value">{pendingPayments.length}</strong>
        </div>
        <div className="metric">
          <span className="metric-label">Total paid</span>
          <strong className="metric-value">${totalPaid.toLocaleString()}</strong>
        </div>
      </div>

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease 100ms, transform 500ms ease 100ms' }}>
        <div className="panel" style={{ marginBottom: '1.1rem' }}>
          <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Open tasks</h2>
              <p>Deliverables and deadlines requiring attention</p>
            </div>
            <Link to="/tasks" className="button-link">View all</Link>
          </div>
          {openTasks.length === 0 ? (
            <EmptyState title="No open tasks" description="Assigned tasks will appear here." />
          ) : (
            <div className="list-rows">
              {openTasks.map((t, idx) => (
                <div
                  key={t.id}
                  className="list-row"
                  style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(6px)', transition: `opacity 400ms ease ${idx * 50 + 150}ms, transform 400ms ease ${idx * 50 + 150}ms` }}
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

        <div className="panel">
          <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Payments</h2>
              <p>Payment status and history</p>
            </div>
            <Link to="/payments" className="button-link">View all</Link>
          </div>
          {payments.length === 0 ? (
            <EmptyState title="No payments" description="Payment records will appear here." />
          ) : (
            <div className="list-rows">
              {payments.slice(0, 5).map((p, idx) => (
                <div
                  key={p.id}
                  className="list-row"
                  style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(6px)', transition: `opacity 400ms ease ${idx * 50 + 200}ms, transform 400ms ease ${idx * 50 + 200}ms` }}
                >
                  <div className="list-row-main">
                    <strong>Payment {p.id}</strong>
                    <p>Contract {p.contractId}</p>
                  </div>
                  <div className="list-row-meta">
                    <span className="mono">${p.amount.toLocaleString()}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
