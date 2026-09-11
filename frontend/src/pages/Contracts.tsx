import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Contract } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, StatusBadge } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function Contracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    loadContracts();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    setContext({
      page: 'Contracts',
      route: '/contracts',
      data: {
        totalContracts: contracts.length,
      },
    });
  }, [contracts, setContext]);

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

  if (loading) return <LoadingScreen label="Loading contracts..." />;

  return (
    <AppShell eyebrow="Contracts">
      <PageHeader
        title="Contracts"
        description="Manage agreements, review terms, and track contract status."
      />
      {error && <Alert>{error}</Alert>}

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        {contracts.length === 0 ? (
          <div className="panel">
            <EmptyState title="No contracts" description="Contracts will appear here once created." />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {contracts.map((c, idx) => (
              <div
                key={c.id}
                className="panel"
                style={{
                  opacity: ready ? 1 : 0,
                  transform: ready ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 400ms ease ${idx * 50 + 100}ms, transform 400ms ease ${idx * 50 + 100}ms`,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                  <div style={{ fontFamily: 'var(--font-family-serif)', fontSize: '1.15rem', fontWeight: 400, letterSpacing: '-0.01em' }}>
                    Contract {c.id}
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.85rem', color: 'var(--color-ink-secondary)' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--color-ink-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.15rem' }}>Collaboration</span>
                    <span className="mono">{c.collaborationRequestId}</span>
                  </div>
                  {c.terms && (
                    <div style={{ flex: '1 1 200px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--color-ink-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.15rem' }}>Terms</span>
                      <span>{c.terms}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
