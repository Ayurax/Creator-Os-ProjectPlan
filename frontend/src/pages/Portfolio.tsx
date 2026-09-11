import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { PortfolioItem } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, Section } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function Portfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    loadPortfolio();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    setContext({
      page: 'Portfolio',
      route: '/portfolio',
      data: {
        totalItems: items.length,
      },
    });
  }, [items, setContext]);

  const loadPortfolio = async () => {
    try {
      const res = await api.get<{ success: boolean; data: PortfolioItem[] }>('/portfolio');
      if (res.success && res.data) setItems(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/portfolio', { title, description, mediaUrl });
      setTitle('');
      setDescription('');
      setMediaUrl('');
      loadPortfolio();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (loading) return <LoadingScreen label="Loading portfolio..." />;

  return (
    <AppShell eyebrow="Portfolio">
      <PageHeader
        title="Portfolio"
        description="Showcase your best work and deliverables."
      />
      {error && <Alert>{error}</Alert>}

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        <Section title="Add work" description="Upload a new portfolio piece">
          <form onSubmit={handleAdd} className="form-grid">
            <div className="form-field full">
              <label htmlFor="title">Title</label>
              <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
            </div>
            <div className="form-field full">
              <label htmlFor="description">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="input" rows={3} />
            </div>
            <div className="form-field full">
              <label htmlFor="mediaUrl">Media URL</label>
              <input id="mediaUrl" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="input" />
            </div>
            <div className="form-actions full">
              <button type="submit" className="button">Add to portfolio</button>
            </div>
          </form>
        </Section>

        <div className="panel">
          <div className="section-heading">
            <h2>Work</h2>
            <p>Your portfolio pieces</p>
          </div>
          {items.length === 0 ? (
            <EmptyState title="No portfolio items" description="Add your first piece of work." />
          ) : (
            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {items.map((item, idx) => (
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
