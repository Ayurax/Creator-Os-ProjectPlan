import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Creator } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function Creators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    loadCreators();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    setContext({
      page: 'Creators',
      route: '/creators',
      data: {
        totalCreators: creators.length,
      },
    });
  }, [creators, setContext]);

  const loadCreators = async () => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/creators');
      if (res.success && res.data) {
        // Transform API response to match Creator interface
        const transformed = res.data.map((c: any) => ({
          id: String(c.id),
          email: c.user?.email || '',
          name: c.user?.email ? c.user.email.split('@')[0] : '',
          bio: c.bio,
          niche: c.niche,
          followers: c.followers,
          engagementRate: c.engagementRate,
          platforms: [], // API doesn't provide platforms
        }));
        setCreators(transformed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const filtered = creators.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.niche?.toLowerCase().includes(term)
    );
  });

  if (loading) return <LoadingScreen label="Loading creators..." />;

  return (
    <AppShell eyebrow="Creators">
      <PageHeader
        title="Creators"
        description="Discover and review creators for collaboration opportunities."
      />
      {error && <Alert>{error}</Alert>}

      <div className="toolbar" style={{ opacity: ready ? 1 : 0, transition: 'opacity 400ms ease' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          placeholder="Search creators..."
          style={{ maxWidth: '22rem' }}
        />
      </div>

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease 100ms, transform 500ms ease 100ms' }}>
        {filtered.length === 0 ? (
          <div className="panel">
            <EmptyState title="No creators found" description="Try adjusting your search or check back later." />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {filtered.map((c, idx) => (
              <Link
                key={c.id}
                to={`/creators/${c.id}`}
                className="panel"
                style={{
                  opacity: ready ? 1 : 0,
                  transform: ready ? 'translateY(0)' : 'translateY(8px)',
                  transition: `opacity 400ms ease ${idx * 40 + 100}ms, transform 400ms ease ${idx * 40 + 100}ms`,
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="avatar" style={{ width: '2.5rem', height: '2.5rem', fontSize: '0.85rem' }}>
                    {(c.name || c.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-family-serif)', fontSize: '1.05rem', fontWeight: 400, letterSpacing: '-0.01em' }}>
                      {c.name || 'Creator'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-ink-tertiary)' }}>{c.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {c.niche && <span className="status-badge status-draft">{c.niche}</span>}
                  {c.platforms && c.platforms.length > 0 && <span className="status-badge status-draft">{c.platforms[0]}</span>}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-line)' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-ink-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Followers</div>
                    <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.85rem', fontWeight: 600 }}>{(c.followers ?? 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-ink-tertiary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Engagement</div>
                    <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.85rem', fontWeight: 600 }}>{c.engagementRate ?? 0}%</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
