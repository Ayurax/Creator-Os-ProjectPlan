import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { PortfolioItem } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, Section } from '../components/ui';

export default function Portfolio() {
  const { user } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');

  useEffect(() => {
    if (user?.id) loadPortfolio(user.id);
  }, [user]);

  const loadPortfolio = async (creatorId: string) => {
    try {
      const res = await api.get<{ success: boolean; data: PortfolioItem[] }>(`/creators/${creatorId}/portfolio`);
      if (res.success && res.data) setItems(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      await api.post(`/creators/${user.id}/portfolio`, {
        title,
        description: description || undefined,
        mediaUrl: mediaUrl || undefined,
      });
      setTitle('');
      setDescription('');
      setMediaUrl('');
      loadPortfolio(user.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (loading) return <LoadingScreen label="Loading portfolio..." />;

  return (
    <AppShell eyebrow="Portfolio">
      <PageHeader
        title="Portfolio"
        description="Add and manage portfolio entries that help brands understand your work."
      />
        {error && <Alert>{error}</Alert>}
        <Section title="Add portfolio item" description="Creator profile">
        <form onSubmit={handleCreate} className="form-grid">
          <div className="form-field">
            <label htmlFor="portfolio-title">Title</label>
            <input id="portfolio-title" value={title} onChange={(e) => setTitle(e.target.value)} className="input" required />
          </div>
          <div className="form-field">
            <label htmlFor="portfolio-description">Description</label>
            <input id="portfolio-description" value={description} onChange={(e) => setDescription(e.target.value)} className="input" />
          </div>
          <div className="form-field">
            <label htmlFor="portfolio-media">Media URL</label>
            <input id="portfolio-media" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="input" />
          </div>
          <div className="form-actions">
            <button type="submit" className="button">Add</button>
          </div>
        </form>
        </Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="feature-card">
              <h3>{item.title}</h3>
              <p>{item.description || 'No description added.'}</p>
              {item.mediaUrl && <a href={item.mediaUrl} className="button-link">View Media</a>}
            </div>
          ))}
          {items.length === 0 && <EmptyState title="No portfolio items" description="Add a title, description, and optional media URL to start building your portfolio." />}
        </div>
    </AppShell>
  );
}
