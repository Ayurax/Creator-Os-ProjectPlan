import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Payment } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, StatusBadge } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    const pending = payments.filter((p) => p.status === 'PENDING');
    const paid = payments.filter((p) => p.status === 'PAID');
    setContext({
      page: 'Payments',
      route: '/payments',
      data: {
        totalPayments: payments.length,
        pendingPayments: pending.length,
        paidPayments: paid.length,
        totalPendingAmount: pending.reduce((s, p) => s + p.amount, 0),
        totalPaidAmount: paid.reduce((s, p) => s + p.amount, 0),
      },
    });
  }, [payments, setContext]);

  const loadPayments = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Payment[] }>('/payments');
      if (res.success && res.data) setPayments(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await api.patch(`/payments/${id}/mark-paid`, {});
      loadPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  const pending = payments.filter((p) => p.status === 'PENDING');
  const paid = payments.filter((p) => p.status === 'PAID');
  const totalPending = pending.reduce((s, p) => s + p.amount, 0);
  const totalPaid = paid.reduce((s, p) => s + p.amount, 0);

  if (loading) return <LoadingScreen label="Loading payments..." />;

  return (
    <AppShell eyebrow="Payments">
      <PageHeader
        title="Payments"
        description="Track payment status, amounts, and settlement history."
      />
      {error && <Alert>{error}</Alert>}

      <div className="metrics-strip" style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        <div className="metric">
          <span className="metric-label">Pending</span>
          <strong className="metric-value">{pending.length}</strong>
          <p className="metric-detail">${totalPending.toLocaleString()}</p>
        </div>
        <div className="metric">
          <span className="metric-label">Paid</span>
          <strong className="metric-value">{paid.length}</strong>
          <p className="metric-detail">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="metric">
          <span className="metric-label">Total</span>
          <strong className="metric-value">{payments.length}</strong>
          <p className="metric-detail">${payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
        </div>
      </div>

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease 100ms, transform 500ms ease 100ms' }}>
        <div className="panel" style={{ marginBottom: '1.1rem' }}>
          <div className="section-heading">
            <h2>Pending payments</h2>
            <p>Awaiting settlement</p>
          </div>
          {pending.length === 0 ? (
            <EmptyState title="No pending payments" description="All payments are settled." />
          ) : (
            <div className="list-rows">
              {pending.map((p, idx) => (
                <div
                  key={p.id}
                  className="list-row"
                  style={{
                    opacity: ready ? 1 : 0,
                    transform: ready ? 'translateY(0)' : 'translateY(6px)',
                    transition: `opacity 400ms ease ${idx * 50 + 150}ms, transform 400ms ease ${idx * 50 + 150}ms`,
                  }}
                >
                  <div className="list-row-main">
                    <strong>Payment {p.id}</strong>
                    <p>Contract {p.contractId}</p>
                  </div>
                  <div className="list-row-meta">
                    <span className="mono">${p.amount.toLocaleString()}</span>
                    <StatusBadge status={p.status} />
                    <button type="button" onClick={() => handleMarkPaid(p.id)} className="button-link" style={{ fontSize: '0.78rem' }}>Mark paid</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <div className="section-heading">
            <h2>Paid</h2>
            <p>Settled payments</p>
          </div>
          {paid.length === 0 ? (
            <EmptyState title="No paid payments" description="Settled payments will appear here." />
          ) : (
            <div className="list-rows">
              {paid.map((p, idx) => (
                <div
                  key={p.id}
                  className="list-row"
                  style={{
                    opacity: ready ? 1 : 0,
                    transform: ready ? 'translateY(0)' : 'translateY(6px)',
                    transition: `opacity 400ms ease ${idx * 50 + 200}ms, transform 400ms ease ${idx * 50 + 200}ms`,
                  }}
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
