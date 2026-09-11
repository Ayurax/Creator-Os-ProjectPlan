import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Creator, PortfolioItem } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function CreatorProfile() {
  const { id } = useParams();
  const location = useLocation();
  const { setContext } = useAssistantContext();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<{ success: boolean; data: Creator }>(`/creators/${id}`),
      api.get<{ success: boolean; data: PortfolioItem[] }>(`/creators/${id}/portfolio`),
    ])
      .then(([c, p]) => {
        if (c.success && c.data) setCreator(c.data);
        if (p.success && p.data) setPortfolio(p.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    if (creator) {
      setContext({
        page: 'Creator Profile',
        route: location.pathname,
        entity: {
          type: 'creator',
          id: creator.id,
          name: creator.name || creator.email,
        },
        data: {
          niche: creator.niche,
          followers: creator.followers,
          engagementRate: creator.engagementRate,
          portfolioCount: portfolio.length,
        },
      });
    }
  }, [creator, portfolio, location.pathname, setContext]);

  if (loading) return <LoadingScreen label="Loading creator profile..." />;

  return (
    <AppShell eyebrow="Creator Profile">
      <PageHeader
        title={creator?.name || 'Creator'}
        description={creator?.bio || 'Creator profile and portfolio'}
        action={<Link to="/creators" className="button-link">Back to creators</Link>}
      />
      {error && <Alert>{error}</Alert>}

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        <div className="panel" style={{ marginBottom: '1.1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'baseline' }}>
            <div>
              <span className="eyebrow">Niche</span>
              <div style={{ marginTop: '0.3rem', fontSize: '0.9rem', color: 'var(--color-ink-secondary)' }}>{creator?.niche || 'General'}</div>
            </div>
            <div>
              <span className="eyebrow">Platforms</span>
              <div style={{ marginTop: '0.3rem', fontSize: '0.9rem', color: 'var(--color-ink-secondary)' }}>{creator?.platforms?.join(', ') || 'Not specified'}</div>
            </div>
            <div>
              <span className="eyebrow">Followers</span>
              <div style={{ marginTop: '0.3rem', fontFamily: 'var(--font-family-mono)', fontSize: '1rem', fontWeight: 600 }}>{(creator?.followers ?? 0).toLocaleString()}</div>
            </div>
            <div>
              <span className="eyebrow">Engagement</span>
              <div style={{ marginTop: '0.3rem', fontFamily: 'var(--font-family-mono)', fontSize: '1rem', fontWeight: 600 }}>{creator?.engagementRate ?? 0}%</div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="section-heading" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div>
              <h2>Portfolio</h2>
              <p>Recent work and deliverables</p>
            </div>
          </div>
          {portfolio.length === 0 ? (
            <EmptyState title="No portfolio items" description="Portfolio work will appear here." />
          ) : (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {portfolio.map((item, idx) => (
                <div
                  key={item.id}
                  className="panel"
                  style={{
                    opacity: ready ? 1 : 0,
                    transform: ready ? 'translateY(0)' : 'translateY(8px)',
                    transition: `opacity 400ms ease ${idx * 50 + 100}ms, transform 400ms ease ${idx * 50 + 100}ms`,
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-family-serif)', fontSize: '1rem', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '0.35rem' }}>
                    {item.title}
                  </div>
                  <p style={{ margin: '0 0 0.75rem', color: 'var(--color-ink-tertiary)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                    {item.description || 'No description'}
                  </p>
                  {item.mediaUrl && (
                    <a href={item.mediaUrl} className="button-link" target="_blank" rel="noopener noreferrer">View media</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
