import { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { Message } from '../types/api';
import { Alert, AppShell, DataTable, EmptyState, LoadingScreen, PageHeader, Section } from '../components/ui';

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadMessages();
  }, []);

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
        description="Send workspace messages and review recent communication by receiver and timestamp."
      />
        {error && <Alert>{error}</Alert>}
        <Section title="Send message" description="Communication">
        <form onSubmit={handleSend} className="form-grid">
          <div className="form-field">
            <label htmlFor="receiver-id">Receiver ID</label>
            <input id="receiver-id" value={receiverId} onChange={(e) => setReceiverId(e.target.value)} className="input" required />
          </div>
          <div className="form-field span-3">
            <label htmlFor="message-content">Message</label>
            <input id="message-content" value={content} onChange={(e) => setContent(e.target.value)} className="input" required />
          </div>
          <div className="form-actions full">
            <button type="submit" className="button">Send Message</button>
          </div>
        </form>
        </Section>
        <DataTable>
          <table>
            <thead>
              <tr>
                <th className="text-left p-4">Receiver</th>
                <th className="text-left p-4">Content</th>
                <th className="text-left p-4">Sent At</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-4 id-cell">{m.receiverId}</td>
                  <td className="p-4">{m.content}</td>
                  <td className="p-4">{new Date(m.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr><td colSpan={3}><EmptyState title="No messages found" description="Sent and received workspace messages will appear here." /></td></tr>
              )}
            </tbody>
          </table>
        </DataTable>
    </AppShell>
  );
}
