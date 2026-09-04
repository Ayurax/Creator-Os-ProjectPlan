import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Review } from '../types/api';
import { Alert, AppShell, DataTable, EmptyState, LoadingScreen, PageHeader, Section } from '../components/ui';

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        campaignId,
        creatorId,
        rating: Number(rating),
        comment: comment || undefined,
      });
      setCampaignId('');
      setCreatorId('');
      setRating('5');
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
        description="Capture feedback by campaign and creator so outcomes stay visible after delivery."
      />
        {error && <Alert>{error}</Alert>}
        <Section title="Submit review" description="Feedback entry">
        <form onSubmit={handleCreate} className="form-grid">
          <div className="form-field">
            <label htmlFor="review-campaign">Campaign ID</label>
            <input id="review-campaign" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="input" required />
          </div>
          <div className="form-field">
            <label htmlFor="review-creator">Creator ID</label>
            <input id="review-creator" value={creatorId} onChange={(e) => setCreatorId(e.target.value)} className="input" required />
          </div>
          <div className="form-field">
            <label htmlFor="review-rating">Rating</label>
            <input id="review-rating" type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} className="input" required />
          </div>
          <div className="form-field">
            <label htmlFor="review-comment">Comment</label>
            <input id="review-comment" value={comment} onChange={(e) => setComment(e.target.value)} className="input" />
          </div>
          <div className="form-actions full">
            <button type="submit" className="button">Submit Review</button>
          </div>
        </form>
        </Section>
        <DataTable>
          <table>
            <thead>
              <tr>
                <th className="text-left p-4">Campaign</th>
                <th className="text-left p-4">Creator</th>
                <th className="text-left p-4">Rating</th>
                <th className="text-left p-4">Comment</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-4 id-cell">{r.campaignId}</td>
                  <td className="p-4 id-cell">{r.creatorId}</td>
                  <td className="p-4">{r.rating}</td>
                  <td className="p-4">{r.comment || '-'}</td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={4}><EmptyState title="No reviews found" description="Submitted campaign reviews will appear here." /></td></tr>
              )}
            </tbody>
          </table>
        </DataTable>
    </AppShell>
  );
}
