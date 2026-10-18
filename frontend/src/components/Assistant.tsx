import { useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useAssistantContext, useRouteAssistantContext } from '../hooks/useAssistantContext';
import type { AssistantContext } from '../contexts/AssistantContext';
import { AssistantWidget } from '../creatoros-ui/components/AssistantWidget';

const Assistant = () => {
  const { user } = useAuth();
  const location = useLocation();
  const routeContext = useRouteAssistantContext();
  const { context: manualContext } = useAssistantContext();
  const conversation = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

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

  const sendMessage = async (message: string) => {
    const response = await api.chat<{ message: string }>({
      message,
      conversation: conversation.current,
      context: context.page ? context : undefined,
    });
    conversation.current = [
      ...conversation.current,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: response.message },
    ].slice(-10);
    return response.message;
  };

  return <AssistantWidget key={user?.email || 'guest'} onSend={sendMessage} userName={user?.displayName || user?.name || user?.email || 'there'} workspaceLabel={contextLabel || 'CreatorOS workspace'} />;
};

export default Assistant;
