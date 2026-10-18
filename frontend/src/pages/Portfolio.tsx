import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { PortfolioItem } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, Section } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Portfolio() {
  const { user } = useAuth();
  const canManage = user?.role === 'CREATOR';
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(canManage);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    if (canManage) void loadPortfolio();
  }, [canManage]);

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

  async function loadPortfolio() {
    try {
      const res = await api.get<{ success: boolean; data: PortfolioItem[] }>('/portfolio/mine');
      if (!res.success || !res.data) throw new Error('The portfolio could not be loaded.');
      setItems(res.data);
      setError('');
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      return false;
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      if (mediaUrl && !/^https?:\/\/\S+$/i.test(mediaUrl)) {
        throw new Error('Enter a valid HTTP(S) media URL.');
      }
      if (editingId) {
        await api.put(`/portfolio/${editingId}`, { title, description, mediaUrl });
      } else {
        await api.post('/portfolio', { title, description, mediaUrl });
      }
      setTitle('');
      setDescription('');
      setMediaUrl('');
      setEditingId(null);
      if (await loadPortfolio()) setNotice(editingId ? 'Portfolio item updated.' : 'Portfolio item added.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const editItem = (item: PortfolioItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || '');
    setMediaUrl(item.mediaUrl || '');
    setError('');
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm('Delete this portfolio item?')) return;
    setError('');
    setNotice('');
    setDeletingId(id);
    try {
      await api.delete(`/portfolio/${id}`);
      if (await loadPortfolio()) setNotice('Portfolio item deleted.');
      if (editingId === id) {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setMediaUrl('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete portfolio item');
    } finally {
      setDeletingId(null);
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
      {notice && <div className="cos-inline-success" role="status">{notice}</div>}

      {!canManage && <Alert>This portfolio editor is for Creator accounts. <Link to="/creators">Browse creator portfolios</Link>.</Alert>}

      {canManage && <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
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
              <input id="mediaUrl" type="url" placeholder="https://example.com/work" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="input" />
            </div>
            <div className="form-actions full">
              <button type="submit" className="button" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Add to portfolio'}</button>
              {editingId && <button type="button" className="button-link" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); setMediaUrl(''); }}>Cancel edit</button>}
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
                  <div className="form-actions" style={{ marginTop: '0.8rem' }}>
                    <button type="button" className="button-link" onClick={() => editItem(item)}>Edit</button>
                    <button type="button" className="button-link" disabled={deletingId === item.id} onClick={() => void deleteItem(item.id)}>{deletingId === item.id ? 'Deleting…' : 'Delete'}</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>}
    </AppShell>
  );
}
