import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Message } from '../types/api';
import { Alert, AppShell, EmptyState, LoadingScreen, PageHeader, Section } from '../components/ui';

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setReady(true), 40);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const loadMessages = async () => {
    try {
      const res = await api.get<{ success: boolean; data: Message[] }>('/messages');
      if (res.success && res.data) setMessages(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/messages', { receiverId, content });
      setReceiverId('');
      setContent('');
      loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  };

  if (loading) return <LoadingScreen label="Loading messages..." />;

  return (
    <AppShell eyebrow="Messages">
      <PageHeader
        title="Messages"
        description="Send workspace messages and review recent communication."
      />
      {error && <Alert>{error}</Alert>}
      <div className="messages-layout">
        <Section title="New message" description="Communication">
          <form onSubmit={handleSend} className="form-grid">
            <div className="form-field">
              <label htmlFor="receiver-id">Receiver ID</label>
              <input id="receiver-id" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} className="input" required />
            </div>
            <div className="form-field full">
              <label htmlFor="message-content">Message</label>
              <textarea id="message-content" value={content} onChange={(e) => setContent(e.target.value)} className="input" required rows={3} />
            </div>
            <div className="form-actions full">
              <button type="submit" className="button">Send Message</button>
            </div>
          </form>
        </Section>
        <div className="messages-thread">
          {messages.map((m, idx) => (
            <div
              key={m.id}
              className={`message-bubble ${m.receiverId ? 'message-outgoing' : 'message-incoming'}`}
              style={{
                opacity: ready ? 1 : 0,
                transform: ready ? 'translateY(0)' : 'translateY(6px)',
                transition: `opacity 400ms ease ${idx * 35}ms, transform 400ms ease ${idx * 35}ms`,
              }}
            >
              <div className="message-meta">
                <span className="mono">To {m.receiverId}</span>
                <span className="mono message-time">{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <p className="message-text">{m.content}</p>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="panel" style={{ opacity: ready ? 1 : 0, transition: 'opacity 400ms ease' }}>
              <EmptyState title="No messages found" description="Sent and received workspace messages will appear here." />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
