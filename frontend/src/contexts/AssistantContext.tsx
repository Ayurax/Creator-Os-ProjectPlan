import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export interface AssistantContext {
  page: string;
  route: string;
  role: string;
  entity?: {
    type: string;
    id?: string | number;
    name?: string;
    status?: string;
  };
  data?: Record<string, unknown>;
}

interface AssistantContextValue {
  context: AssistantContext;
  setContext: (update: Partial<AssistantContext>) => void;
  clearContext: () => void;
}

const AssistantContextContext = createContext<AssistantContextValue | null>(null);

export function AssistantContextProvider({ children }: { children: ReactNode }) {
  const [context, setContextState] = useState<AssistantContext>({
    page: '',
    route: '',
    role: '',
  });

  const setContext = useCallback((update: Partial<AssistantContext>) => {
    setContextState((prev) => ({ ...prev, ...update }));
  }, []);

  const clearContext = useCallback(() => {
    setContextState({ page: '', route: '', role: '' });
  }, []);

  return (
    <AssistantContextContext.Provider value={{ context, setContext, clearContext }}>
      {children}
    </AssistantContextContext.Provider>
  );
}

export function useAssistantContext() {
  const ctx = useContext(AssistantContextContext);
  if (!ctx) {
    const fallback: AssistantContextValue = {
      context: { page: '', route: '', role: '' },
      setContext: () => {},
      clearContext: () => {},
    };
    return fallback;
  }
  return ctx;
}
