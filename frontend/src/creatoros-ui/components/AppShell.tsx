import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { Avatar, Input } from './UI';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import type { Notification } from '../../types/api';

export type AppSection = 'Overview' | 'Campaigns' | 'Creators' | 'Collaborations' | 'Contracts' | 'Tasks' | 'Payments' | 'Reviews' | 'Messages' | 'Portfolio' | 'Analytics';
const mainNav: Array<{ label: AppSection; icon: IconName; count?: string }> = [
  { label: 'Overview', icon: 'grid' },
  { label: 'Campaigns', icon: 'campaign' },
  { label: 'Creators', icon: 'users' },
  { label: 'Collaborations', icon: 'layers' },
  { label: 'Contracts', icon: 'file' },
  { label: 'Tasks', icon: 'check-circle' },
  { label: 'Reviews', icon: 'star' },
];
const workspaceNav: Array<{ label: AppSection; icon: IconName; count?: string }> = [
  { label: 'Messages', icon: 'message' },
  { label: 'Payments', icon: 'wallet' },
  { label: 'Portfolio', icon: 'camera' },
  { label: 'Analytics', icon: 'chart' },
];

export function AppShell({ active, onNavigate, children, userName = 'Alex Morgan', userRole = 'Studio manager', visibleSections }: {
  active: AppSection; onNavigate: (section: AppSection) => void; children: ReactNode; userName?: string; userRole?: string; visibleSections?: AppSection[];
}) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [search, setSearch] = useState('');
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const change = (section: AppSection) => { onNavigate(section); setMobileOpen(false); };
  const loadNotifications = async () => {
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      const response = await api.get<{ success: boolean; data: Array<{ id: number; content: string; isRead: boolean; createdAt: string }> }>('/notifications');
      setNotifications((response.data || []).map((notification) => ({
        id: String(notification.id),
        message: notification.content,
        read: notification.isRead,
        createdAt: notification.createdAt,
      })));
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Unable to load notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  };
  const toggleNotifications = () => {
    setProfileOpen(false);
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    if (nextOpen) void loadNotifications();
  };
  const markNotificationRead = async (notification: Notification) => {
    if (notification.read) return;
    try {
      await api.patch(`/notifications/${notification.id}/read`, {});
      setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
    } catch (error) {
      setNotificationsError(error instanceof Error ? error.message : 'Unable to mark notification as read.');
    }
  };
  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!notificationsRef.current?.contains(target)) setNotificationsOpen(false);
      if (!profileRef.current?.contains(target)) setProfileOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', closeMenus);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeMenus);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);
  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.getElementById('cos-workspace-search')?.focus();
      }
      if (event.key === 'Escape') setSearch('');
    };
    document.addEventListener('keydown', handleSearchShortcut);
    return () => document.removeEventListener('keydown', handleSearchShortcut);
  }, []);
  const isVisible = (section: AppSection) => !visibleSections || visibleSections.includes(section);
  const sectionLabel = (section: AppSection) => {
    if (section === 'Campaigns' && user?.role === 'CREATOR') return 'Discover Campaigns';
    if (section === 'Creators' && user?.role === 'BRAND') return 'Discover Creators';
    if (section === 'Collaborations') return 'Collaborations / Invitations';
    if (section === 'Tasks') return 'Tasks / Deliverables';
    return section;
  };
  const searchableSections = [...mainNav, ...workspaceNav]
    .filter((item, index, items) => items.findIndex((candidate) => candidate.label === item.label) === index)
    .filter((item) => isVisible(item.label));
  const searchResults = searchableSections.filter((item) => sectionLabel(item.label).toLowerCase().includes(search.trim().toLowerCase()));
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const result = searchResults[0];
    if (result) {
      change(result.label);
      setSearch('');
    }
  };
  const navGroup = (label: string, items: Array<{ label: AppSection; icon: IconName; count?: string }>) => (
    <div className="cos-nav-group" key={label}>
      <div className="cos-nav-label">{label}</div>
      {items.filter((item) => isVisible(item.label)).map((item) => <button key={item.label} className={`cos-nav-item ${active === item.label ? 'is-active' : ''}`} onClick={() => change(item.label)} aria-current={active === item.label ? 'page' : undefined}>
        <Icon name={item.icon} size={18} /><span>{sectionLabel(item.label)}</span>{item.count && <span className="cos-nav-count">{item.count}</span>}
      </button>)}
    </div>
  );
  return <div className={`cos-app ${mobileOpen ? 'cos-app--nav-open' : ''}`}>
    {mobileOpen && <button className="cos-mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
    <aside className="cos-sidebar">
      <button className="cos-brand" onClick={() => change('Overview')} aria-label="CreatorOS home"><span className="cos-brand-mark"><span /></span><span className="cos-brand-name">creator<span>os</span><small>STUDIO PLATFORM</small></span></button>
      <div className="cos-workspace-switch"><span className="cos-workspace-logo">C</span><span><strong>CreatorOS workspace</strong><small>{userRole}</small></span><Icon name="chevron-down" size={15} /></div>
      {navGroup('WORKSPACE', mainNav)}
      {navGroup('MANAGE', workspaceNav)}
      <div className="cos-sidebar-spacer" />
      {isVisible('Creators') && <div className="cos-sidebar-callout"><span className="cos-callout-orbit"><Icon name="sparkles" size={19} /></span><strong>Make room for better work.</strong><p>Bring the right people into every project.</p><button onClick={() => change('Creators')}>Explore creators <Icon name="arrow-up-right" size={14} /></button></div>}
      <button className="cos-nav-item cos-nav-item--quiet" onClick={() => change('Analytics')}><Icon name="help" size={18} /><span>Help center</span></button>
      <div className="cos-sidebar-user"><Avatar name={userName} color="violet" /><span className="cos-sidebar-user__name"><strong>{userName}</strong><small>{userRole}</small></span></div>
    </aside>
    <div className="cos-workspace">
      <header className="cos-topbar">
        <div className="cos-topbar__left"><button className="cos-icon-button cos-mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button><div className="cos-breadcrumb"><span>CreatorOS</span><Icon name="chevron-right" size={14} /><strong>{active}</strong></div></div>
        <div className="cos-topbar__right"><div className="cos-search-anchor"><form onSubmit={submitSearch}><Input id="cos-workspace-search" leadingIcon="search" value={search} aria-controls="cos-search-results" onChange={(event) => setSearch(event.target.value)} placeholder="Search your workspace" aria-label="Search your workspace" className="cos-top-search" /></form>{search.trim() && <div id="cos-search-results" className="cos-search-results" role="listbox">{searchResults.length ? searchResults.map((result) => <button type="button" role="option" aria-selected="false" key={result.label} onClick={() => { change(result.label); setSearch(''); }}>{sectionLabel(result.label)}</button>) : <span role="status">No matching workspace section.</span>}</div>}</div><span className="cos-key-hint">⌘ K</span><button type="button" className="cos-icon-button cos-top-action" aria-label="Help" onClick={() => change('Analytics')}><Icon name="help" /></button><div className="cos-menu-anchor" ref={notificationsRef}><button type="button" className="cos-icon-button cos-top-action cos-notification" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={toggleNotifications}><Icon name="bell" />{notifications.some((notification) => !notification.read) && <i />}</button>{notificationsOpen && <section className="cos-popover cos-notification-popover" aria-label="Notifications"><div className="cos-popover__header"><strong>Notifications</strong><button type="button" className="cos-popover__close" onClick={() => setNotificationsOpen(false)}>Close</button></div>{notificationsLoading && <p className="cos-popover__message">Loading notifications...</p>}{notificationsError && <p className="cos-popover__error">{notificationsError}</p>}{!notificationsLoading && !notificationsError && notifications.length === 0 && <p className="cos-popover__message">No notifications yet.</p>}{!notificationsLoading && notifications.map((notification) => <button type="button" className={`cos-notification-item ${notification.read ? '' : 'is-unread'}`} key={notification.id} onClick={() => void markNotificationRead(notification)}><span>{notification.message}</span><small>{new Date(notification.createdAt).toLocaleString()}</small></button>)}</section>}</div><span className="cos-top-divider" /><div className="cos-menu-anchor" ref={profileRef}><button type="button" className="cos-profile-button" aria-expanded={profileOpen} onClick={() => { setNotificationsOpen(false); setProfileOpen(!profileOpen); }}><Avatar name={userName} color="violet" size="sm" /><Icon name="chevron-down" size={14} /></button>{profileOpen && <section className="cos-popover cos-profile-popover" aria-label="Account menu"><strong>{userName}</strong><span>{user?.email || 'No email available'}</span><small>{userRole}</small><button type="button" onClick={() => { setProfileOpen(false); change('Overview'); }}>Workspace overview</button><button type="button" onClick={logout}>Log out</button></section>}</div></div>
      </header>
      <main className="cos-main" id="main-content"><div className="cos-main-inner">{children}</div><footer className="cos-footer"><span>© 2026 CreatorOS</span><span><i /> All systems operational</span></footer></main>
    </div>
  </div>;
}
