import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Creator } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader } from '../components/ui';

export default function Creators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Creator[] }>('/creators');
      if (res.success && res.data) setCreators(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const filtered = creators.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.niche || '').toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  if (loading) return <LoadingScreen label="Loading creators..." />;

  return (
    <AppShell eyebrow="Talent network">
      <PageHeader
        title="Creators"
        description="Search creator profiles by name, email, or niche and inspect portfolio-ready talent details."
      />
        {error && <Alert>{error}</Alert>}
        <div className="toolbar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators..."
          className="input"
        />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <Link key={c.id} to={`/creators/${c.id}`} className="feature-card">
              <h3>{c.name || c.email}</h3>
              <p>{c.niche || 'No niche listed'}</p>
              <div className="meta-row">
                {c.followers && <span className="meta-pill">{c.followers} followers</span>}
                {c.engagementRate && <span className="meta-pill">{c.engagementRate}% engagement</span>}
              </div>
            </Link>
          ))}
          {filtered.length === 0 && <EmptyState title="No creators found" description="Try a different name, email, or niche." />}
        </div>
    </AppShell>
  );
}
