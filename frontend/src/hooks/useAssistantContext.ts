import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAssistantContext } from '../contexts/AssistantContext';
import type { AssistantContext } from '../contexts/AssistantContext';

const PAGE_MAP: Record<string, string> = {
  '/dashboard/brand': 'Brand Dashboard',
  '/dashboard/creator': 'Creator Dashboard',
  '/dashboard/freelancer': 'Freelancer Dashboard',
  '/dashboard/manager': 'Talent Manager Dashboard',
  '/campaigns': 'Campaigns',
  '/collaborations': 'Collaborations',
  '/contracts': 'Contracts',
  '/tasks': 'Tasks',
  '/payments': 'Payments',
  '/reviews': 'Reviews',
  '/messages': 'Messages',
  '/ai': 'AI Tools',
  '/portfolio': 'Portfolio',
  '/creators': 'Creators',
};

function matchPage(pathname: string): { page: string; entity?: AssistantContext['entity'] } | null {
  const campaignMatch = pathname.match(/^\/campaigns\/(\d+)$/);
  if (campaignMatch) {
    return { page: 'Campaign Detail', entity: { type: 'campaign', id: campaignMatch[1] } };
  }

  const creatorMatch = pathname.match(/^\/creators\/(\d+)$/);
  if (creatorMatch) {
    return { page: 'Creator Profile', entity: { type: 'creator', id: creatorMatch[1] } };
  }

  const page = PAGE_MAP[pathname];
  if (page) {
    return { page };
  }

  return null;
}

export function useRouteAssistantContext() {
  const location = useLocation();
  const { user } = useAuth();

  const derived = useMemo(() => {
    const matched = matchPage(location.pathname);
    if (!matched) return null;

    return {
      page: matched.page,
      route: location.pathname,
      role: user?.role || '',
      entity: matched.entity,
    } satisfies AssistantContext;
  }, [location.pathname, user?.role]);

  return derived;
}

export { useAssistantContext };
