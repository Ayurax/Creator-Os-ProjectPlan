import { useState, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { Avatar, Input } from './UI';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const change = (section: AppSection) => { onNavigate(section); setMobileOpen(false); };
  const isVisible = (section: AppSection) => !visibleSections || visibleSections.includes(section);
  const navGroup = (label: string, items: Array<{ label: AppSection; icon: IconName; count?: string }>) => (
    <div className="cos-nav-group" key={label}>
      <div className="cos-nav-label">{label}</div>
      {items.filter((item) => isVisible(item.label)).map((item) => <button key={item.label} className={`cos-nav-item ${active === item.label ? 'is-active' : ''}`} onClick={() => change(item.label)} aria-current={active === item.label ? 'page' : undefined}>
        <Icon name={item.icon} size={18} /><span>{item.label}</span>{item.count && <span className="cos-nav-count">{item.count}</span>}
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
      <div className="cos-sidebar-callout"><span className="cos-callout-orbit"><Icon name="sparkles" size={19} /></span><strong>Make room for better work.</strong><p>Bring the right people into every project.</p><button onClick={() => change('Creators')}>Explore creators <Icon name="arrow-up-right" size={14} /></button></div>
      <button className="cos-nav-item cos-nav-item--quiet" onClick={() => change('Analytics')}><Icon name="help" size={18} /><span>Help center</span></button>
      <div className="cos-sidebar-user"><Avatar name={userName} color="violet" /><span className="cos-sidebar-user__name"><strong>{userName}</strong><small>{userRole}</small></span><button aria-label="Account settings" onClick={() => change('Analytics')}><Icon name="more" size={18} /></button></div>
    </aside>
    <div className="cos-workspace">
      <header className="cos-topbar">
        <div className="cos-topbar__left"><button className="cos-icon-button cos-mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Icon name="menu" /></button><div className="cos-breadcrumb"><span>CreatorOS</span><Icon name="chevron-right" size={14} /><strong>{active}</strong></div></div>
        <div className="cos-topbar__right"><Input leadingIcon="search" placeholder="Search your workspace" aria-label="Search your workspace" className="cos-top-search" /><span className="cos-key-hint">⌘ K</span><button className="cos-icon-button cos-top-action" aria-label="Help"><Icon name="help" /></button><button className="cos-icon-button cos-top-action cos-notification" aria-label="Notifications"><Icon name="bell" /><i /></button><span className="cos-top-divider" /><button className="cos-profile-button" onClick={() => change('Analytics')}><Avatar name={userName} color="violet" size="sm" /><Icon name="chevron-down" size={14} /></button></div>
      </header>
      <main className="cos-main" id="main-content"><div className="cos-main-inner">{children}</div><footer className="cos-footer"><span>© 2026 CreatorOS</span><span><i /> All systems operational</span></footer></main>
    </div>
  </div>;
}
