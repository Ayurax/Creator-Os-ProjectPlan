import { useState, type FormEvent } from 'react';
import { Avatar, Button } from './UI';
import { Icon } from './Icon';

type ChatMessage = { id: number; role: 'assistant' | 'user'; content: string };

export function AssistantWidget({ onSend, userName = 'there', workspaceLabel = 'CreatorOS workspace' }: { onSend?: (message: string) => Promise<string>; userName?: string; workspaceLabel?: string }) {
  const [open, setOpen] = useState(false); const [text, setText] = useState(''); const [busy, setBusy] = useState(false); const [messages, setMessages] = useState<ChatMessage[]>([{ id: 1, role: 'assistant', content: `Hey ${userName} — I can help you find a creator, get a campaign unstuck, or make sense of your workspace. What are we working on?` }]);
  const [failure, setFailure] = useState('');
  const send = async (message: string) => {
    setBusy(true); setFailure('');
    try {
      if (!onSend) throw new Error('The assistant service is not connected.');
      const reply = await onSend(message);
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', content: reply }]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'The assistant is unavailable right now.';
      setFailure(detail && detail !== '[object Object]' ? detail : 'The assistant is unavailable right now. Please try again.');
    } finally { setBusy(false); }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); const message = text.trim(); if (!message || busy) return;
    const id = Date.now();
    setMessages((current) => [...current, { id, role: 'user', content: message }]); setText('');
    await send(message);
  };
  return <><button className={`cos-assistant-launch ${open ? 'is-open' : ''}`} onClick={() => setOpen(!open)} aria-label={open ? 'Close CreatorOS assistant' : 'Open CreatorOS assistant'}><span className="cos-assistant-launch__icon">{open ? <Icon name="close" size={21} /> : <Icon name="sparkles" size={21} />}</span><span>{open ? 'Close assistant' : 'Ask CreatorOS'}</span>{!open && <i />}</button>{open && <section className="cos-assistant-panel" aria-label="CreatorOS assistant"><header className="cos-assistant-header"><div className="cos-assistant-brand"><span className="cos-assistant-mark"><Icon name="sparkles" size={17} /></span><span><strong>CreatorOS Assist</strong><small><i /> {busy ? 'Waiting for provider' : failure ? 'Needs attention' : 'Server-powered assistant'}</small></span></div><button className="cos-icon-button" aria-label="Close assistant" onClick={() => setOpen(false)}><Icon name="close" /></button></header><div className="cos-assistant-context"><Icon name="activity" size={14} /> CURRENT WORKSPACE <span>{workspaceLabel}</span></div><div className="cos-assistant-messages">{messages.map((message) => <div className={`cos-assistant-message cos-assistant-message--${message.role}`} key={message.id}>{message.role === 'assistant' && <Avatar name="CreatorOS" initials="C" color="dark" size="sm" />}<p>{message.content}</p></div>)}{failure && <div className="cos-assistant-error" role="alert">{failure} <button type="button" disabled={busy} onClick={() => { const lastUser = [...messages].reverse().find((message) => message.role === 'user'); if (lastUser) void send(lastUser.content); }}>Retry</button></div>}{busy && <div className="cos-assistant-thinking" role="status"><i /><i /><i /> Thinking</div>}</div><div className="cos-assistant-suggestions"><button type="button" onClick={() => setText('Help me find the best creator for my next campaign')}>Find a creator <Icon name="arrow-up-right" size={12} /></button><button type="button" onClick={() => setText('Summarize my active campaigns')}>Campaign summary <Icon name="arrow-up-right" size={12} /></button></div><form className="cos-assistant-compose" onSubmit={submit}><textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about your workspace…" rows={2} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }} /><div><span><Icon name="shield" size={13} /> Workspace-aware</span><Button size="icon" type="submit" aria-label="Send message" disabled={busy || !text.trim()}><Icon name="send" size={17} /></Button></div></form><div className="cos-assistant-disclaimer">AI can make mistakes. Review important details before acting.</div></section>}</>;
}
