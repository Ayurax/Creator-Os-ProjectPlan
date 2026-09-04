import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Payment } from '../types/api';
import { Alert, AppShell, DataTable, EmptyState, LoadingScreen, PageHeader, StatusBadge } from '../components/ui';

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPayments();
  }, []);

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

  const handleStatus = async (id: string, status: string) => {
    setError('');
    try {
      await api.patch(`/payments/${id}/status`, { status });
      loadPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (loading) return <LoadingScreen label="Loading payments..." />;

  return (
    <AppShell eyebrow="Payments">
      <PageHeader
        title="Payments"
        description="Track contract-linked payments and update payout status once funds have cleared."
      />
        {error && <Alert>{error}</Alert>}
        <DataTable>
          <table>
            <thead>
              <tr>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">Contract</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-4 id-cell">{p.id}</td>
                  <td className="p-4 id-cell">{p.contractId}</td>
                  <td className="p-4">${p.amount}</td>
                  <td className="p-4"><StatusBadge status={p.status} /></td>
                  <td className="p-4 flex gap-2">
                    <button type="button" onClick={() => handleStatus(p.id, 'PAID')} className="button button-success">Mark Paid</button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={5}><EmptyState title="No payments found" description="Payment records will appear once contracts generate payable work." /></td></tr>
              )}
            </tbody>
          </table>
        </DataTable>
    </AppShell>
  );
}
