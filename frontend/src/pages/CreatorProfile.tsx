import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Creator, PortfolioItem } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, Section } from '../components/ui';

export default function CreatorProfile() {
  const { id } = useParams();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <LoadingScreen label="Loading creator profile..." />;

  return (
    <AppShell eyebrow="Creator profile">
        {error && <Alert>{error}</Alert>}
        {creator && (
          <>
            <div className="panel profile-hero">
              <div className="avatar">{(creator.name || creator.email).slice(0, 2).toUpperCase()}</div>
              <div>
                <p className="eyebrow">Creator profile</p>
                <h1>{creator.name || creator.email}</h1>
                <p>{creator.bio || 'Creator profile and portfolio details.'}</p>
                <div className="meta-row">
                  {creator.niche && <span className="meta-pill">Niche: {creator.niche}</span>}
                  {creator.followers && <span className="meta-pill">Followers: {creator.followers}</span>}
                  {creator.engagementRate && <span className="meta-pill">Engagement: {creator.engagementRate}%</span>}
                </div>
              </div>
            </div>

            <Section title="Portfolio" description="Creator work">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {portfolio.map((item) => (
                <div key={item.id} className="feature-card">
                  <h3>{item.title}</h3>
                  <p>{item.description || 'No description added.'}</p>
                  {item.mediaUrl && <a href={item.mediaUrl} className="button-link">View Media</a>}
                </div>
              ))}
              {portfolio.length === 0 && <EmptyState title="No portfolio items" description="Portfolio entries will appear when this creator adds them." />}
            </div>
            </Section>
          </>
        )}
    </AppShell>
  );
}
