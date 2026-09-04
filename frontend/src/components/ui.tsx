import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Role = 'BRAND' | 'CREATOR' | 'FREELANCER' | 'TALENT_MANAGER';

const navItems = [
  { to: '/campaigns', label: 'Campaigns', roles: ['BRAND', 'CREATOR', 'FREELANCER', 'TALENT_MANAGER'] },
  { to: '/creators', label: 'Creators', roles: ['BRAND', 'FREELANCER', 'TALENT_MANAGER'] },
  { to: '/collaborations', label: 'Collaborations', roles: ['BRAND', 'CREATOR', 'FREELANCER', 'TALENT_MANAGER'] },
  { to: '/contracts', label: 'Contracts', roles: ['BRAND', 'CREATOR', 'FREELANCER', 'TALENT_MANAGER'] },
  { to: '/tasks', label: 'Tasks', roles: ['BRAND', 'CREATOR', 'FREELANCER', 'TALENT_MANAGER'] },
  { to: '/payments', label: 'Payments', roles: ['BRAND', 'CREATOR', 'FREELANCER', 'TALENT_MANAGER'] },
  { to: '/reviews', label: 'Reviews', roles: ['BRAND', 'CREATOR', 'FREELANCER', 'TALENT_MANAGER'] },
  { to: '/messages', label: 'Messages', roles: ['BRAND', 'CREATOR', 'FREELANCER', 'TALENT_MANAGER'] },
  { to: '/portfolio', label: 'Portfolio', roles: ['CREATOR', 'FREELANCER'] },
  { to: '/ai', label: 'AI Tools', roles: ['BRAND', 'CREATOR', 'FREELANCER', 'TALENT_MANAGER'] },
] satisfies Array<{ to: string; label: string; roles: Role[] }>;

const roleDashboardPath: Record<Role, string> = {
  BRAND: '/dashboard/brand',
  CREATOR: '/dashboard/creator',
  FREELANCER: '/dashboard/freelancer',
  TALENT_MANAGER: '/dashboard/manager',
};

export function getDashboardPath(role?: string) {
  return role && role in roleDashboardPath ? roleDashboardPath[role as Role] : '/dashboard/brand';
}

export function formatRole(role?: string) {
  if (!role) return 'Workspace';
  return role
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

const breadcrumbMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/brand': 'Brand Dashboard',
  '/dashboard/creator': 'Creator Dashboard',
  '/dashboard/freelancer': 'Freelancer Dashboard',
  '/dashboard/manager': 'Manager Dashboard',
  '/campaigns': 'Campaigns',
  '/creators': 'Creators',
  '/collaborations': 'Collaborations',
  '/contracts': 'Contracts',
  '/tasks': 'Tasks',
  '/payments': 'Payments',
  '/reviews': 'Reviews',
  '/messages': 'Messages',
  '/ai': 'AI Tools',
  '/portfolio': 'Portfolio',
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = breadcrumbMap[path] || decodeURIComponent(seg);
    return { path, label, active: i === segments.length - 1 };
  });

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="breadcrumb-item">
          {i > 0 && <span className="breadcrumb-sep">/</span>}
          {crumb.active ? (
            <span className="breadcrumb-current">{crumb.label}</span>
          ) : (
            <Link to={crumb.path} className="breadcrumb-link">{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export function AppShell({
  children,
  eyebrow,
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  const { user, logout } = useAuth();
  const role = user?.role as Role | undefined;
  const visibleNav = navItems.filter((item) => !role || item.roles.includes(role));
  const dashboardPath = getDashboardPath(user?.role);
  const identity = user?.name || user?.email || 'CreatorOS user';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to={dashboardPath} className="brand-lockup" aria-label="CreatorOS AI dashboard">
          <span className="brand-mark">CO</span>
          <span>
            <span className="brand-name">CreatorOS AI</span>
            <span className="brand-caption">{formatRole(user?.role)}</span>
          </span>
        </Link>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          <NavLink to={dashboardPath} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          {visibleNav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-profile">
          <div className="avatar">{identity.slice(0, 2).toUpperCase()}</div>
          <div className="profile-copy">
            <span className="profile-name">{identity}</span>
            <span className="profile-role">{formatRole(user?.role)}</span>
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="topbar-eyebrow">{eyebrow || formatRole(user?.role)}</span>
            <p className="topbar-title">Welcome back, {user?.name || user?.email}</p>
          </div>
          <button type="button" onClick={logout} className="button button-ghost">
            Logout
          </button>
        </header>
        <main className="page-frame">{children}</main>
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-shell">
      <section className="auth-panel">
        <div className="auth-brand">
          <span className="brand-mark">CO</span>
          <span>
            <span className="brand-name">CreatorOS AI</span>
            <span className="brand-caption">Creator operations workspace</span>
          </span>
        </div>
        <div className="auth-copy">
          <p className="eyebrow">Revenue, talent, and delivery in one place</p>
          <h1>Run every creator partnership from first pitch to final payout.</h1>
          <p>
            Coordinate campaigns, contracts, tasks, payments, reviews, messages, and AI workflows with a calm operating system for modern teams.
          </p>
        </div>
        <div className="auth-metrics">
          <span>Campaign CRM</span>
          <span>Talent pipeline</span>
          <span>AI co-pilot</span>
        </div>
      </section>
      <section className="auth-card">
        <div className="section-heading compact">
          <p>{subtitle}</p>
          <h2>{title}</h2>
        </div>
        {children}
      </section>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">CreatorOS AI</p>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-actions">{action}</div>}
    </div>
  );
}

export function Section({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel">
      {(title || description) && (
        <div className="section-heading">
          {description && <p>{description}</p>}
          {title && <h2>{title}</h2>}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true" />
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

export function LoadingScreen({ label = 'Loading workspace...' }: { label?: string }) {
  return (
    <div className="loading-screen">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="panel" style={{ minHeight: '8rem' }}>
      <div className="skeleton">
        <div className="skeleton-line wide" />
        <div className="skeleton-line narrow" />
      </div>
    </div>
  );
}

export function Alert({ children }: { children: React.ReactNode }) {
  return <div className="alert-error" role="alert">{children}</div>;
}

export function StatusBadge({ status }: { status?: string }) {
  const normalized = (status || 'UNKNOWN').toLowerCase();
  return <span className={`status-badge status-${normalized}`}>{status || 'Unknown'}</span>;
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <p>{detail}</p>}
    </div>
  );
}

export function DataTable({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="table-wrap">{children}</div>;
}

