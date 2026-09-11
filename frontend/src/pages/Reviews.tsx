import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Review } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, Section } from '../components/ui';
import { useAssistantContext } from '../hooks/useAssistantContext';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [targetType, setTargetType] = useState('CREATOR');
  const [targetId, setTargetId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ready, setReady] = useState(false);
  const { setContext } = useAssistantContext();

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => {
    setContext({
      page: 'Reviews',
      route: '/reviews',
      data: {
        totalReviews: reviews.length,
      },
    });
  }, [reviews, setContext]);

  const loadReviews = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Review[] }>('/reviews');
      if (res.success && res.data) setReviews(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reviews', { targetType, targetId, rating: Number(rating), comment });
      setTargetId('');
      setRating(5);
      setComment('');
      loadReviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (loading) return <LoadingScreen label="Loading reviews..." />;

  return (
    <AppShell eyebrow="Reviews">
      <PageHeader
        title="Reviews"
        description="Read and submit reviews for creators and brands."
      />
      {error && <Alert>{error}</Alert>}

      <div style={{ opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 500ms ease, transform 500ms ease' }}>
        <Section title="Submit review" description="Share feedback">
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-field">
              <label htmlFor="targetType">Target type</label>
              <select id="targetType" value={targetType} onChange={(e) => setTargetType(e.target.value)} className="input">
                <option value="CREATOR">Creator</option>
                <option value="BRAND">Brand</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="targetId">Target ID</label>
              <input id="targetId" value={targetId} onChange={(e) => setTargetId(e.target.value)} className="input" required />
            </div>
            <div className="form-field">
              <label htmlFor="rating">Rating</label>
              <input id="rating" type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="input" />
            </div>
            <div className="form-field full">
              <label htmlFor="comment">Comment</label>
              <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} className="input" rows={3} />
            </div>
            <div className="form-actions full">
              <button type="submit" className="button">Submit review</button>
            </div>
          </form>
        </Section>

        <div className="panel">
          <div className="section-heading">
            <h2>Recent reviews</h2>
            <p>Community feedback</p>
          </div>
          {reviews.length === 0 ? (
            <EmptyState title="No reviews yet" description="Reviews will appear here." />
          ) : (
            <div className="list-rows">
              {reviews.map((r, idx) => (
                <div
                  key={r.id}
                  className="list-row"
                  style={{
                    opacity: ready ? 1 : 0,
                    transform: ready ? 'translateY(0)' : 'translateY(6px)',
                    transition: `opacity 400ms ease ${idx * 50 + 100}ms, transform 400ms ease ${idx * 50 + 100}ms`,
                  }}
                >
                  <div className="list-row-main">
                    <strong>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</strong>
                    <p>{r.comment || 'No comment'}</p>
                  </div>
                  <div className="list-row-meta">
                    <span className="mono">Campaign {r.campaignId} · Creator {r.creatorId}</span>
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
