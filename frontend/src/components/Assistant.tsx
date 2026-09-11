import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useAssistantContext, useRouteAssistantContext } from '../hooks/useAssistantContext';
import type { AssistantContext } from '../contexts/AssistantContext';

const Assistant = () => {
  const { user } = useAuth();
  const location = useLocation();
  const routeContext = useRouteAssistantContext();
  const { context: manualContext } = useAssistantContext();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const context: AssistantContext = useMemo(() => {
    const base = routeContext || { page: '', route: location.pathname, role: user?.role || '' };
    if (!manualContext.page && !manualContext.entity && !manualContext.data) return base as AssistantContext;
    return { ...base, ...manualContext } as AssistantContext;
  }, [routeContext, manualContext, location.pathname, user?.role]);

  const contextLabel = useMemo(() => {
    if (!context.page) return null;
    if (context.entity?.name) return `${context.page} — ${context.entity.name}`;
    return context.page;
  }, [context]);

  useEffect(() => {
    if (messages.length === 0 && open) {
      const roleMessage = user ? ` as a ${user.role.toLowerCase().replace('_', ' ')}` : '';
      const welcome: { role: 'user' | 'assistant'; content: string }[] = [
        {
          role: 'assistant',
          content: `Hello! I'm CreatorOS Assistant${roleMessage}. I can help you with campaigns, creator discovery, collaborations, contracts, tasks, payments, and more. How can I assist you today?`,
        },
      ];
      setMessages(welcome);
    }
  }, [messages.length, open, user]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage },
    ]);

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    setLoading(true);
    try {
      const response = await api.chat<{ message: string }>({
        message: userMessage,
        conversation: messages,
        context: context.page ? context : undefined,
      });
      const assistantMessage = response.message;

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: assistantMessage },
      ]);
    } catch (err: any) {
      setError(
        err.message || 'Assistant is temporarily unavailable. Please try again.'
      );
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="assistant-trigger"
          aria-label="Open CreatorOS Assistant"
        >
          <span style={{ fontFamily: 'var(--font-family-serif)', fontSize: '1rem' }}>Asst</span>
        </button>
      )}

      {open && (
        <div className="assistant-panel">
          <div className="assistant-header">
            <h3 className="assistant-title">Assistant</h3>
            <button onClick={() => setOpen(false)} className="assistant-close" aria-label="Close assistant">×</button>
          </div>

          {contextLabel && (
            <div className="assistant-context">
              <span className="assistant-context-tag">{contextLabel}</span>
            </div>
          )}

          <div className="assistant-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`assistant-message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {error && <div className="assistant-error">{error}</div>}

          <div className="assistant-input-row">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="assistant-input"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="assistant-send"
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Assistant;
