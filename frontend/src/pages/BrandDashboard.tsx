import { Link } from 'react-router-dom';
import { AppShell, PageHeader, StatCard } from '../components/ui';

export default function BrandDashboard() {
  return (
    <AppShell eyebrow="Brand workspace">
      <PageHeader
        title="Brand Dashboard"
        description="Plan campaigns, discover creators, manage collaboration requests, and keep commercial work moving."
        action={<Link to="/campaigns" className="button">New Campaign</Link>}
      />

      <div className="stats-grid">
        <StatCard label="Pipeline" value="Campaigns" detail="Build briefs and track creator progress." />
        <StatCard label="Talent" value="Creators" detail="Search profiles and invite the right partners." />
        <StatCard label="Operations" value="Contracts" detail="Connect approvals, tasks, reviews, and payouts." />
      </div>

      <div className="dashboard-grid mt-panel">
        <Link to="/campaigns" className="feature-card">
          <h3>Campaigns</h3>
          <p>Manage active briefs, budgets, and campaign status.</p>
        </Link>
        <Link to="/collaborations" className="feature-card">
          <h3>Collaborations</h3>
          <p>Track invitations and creator responses in one queue.</p>
        </Link>
        <Link to="/creators" className="feature-card">
          <h3>Discover Creators</h3>
          <p>Find creators by niche, audience, and profile details.</p>
        </Link>
      </div>
    </AppShell>
  );
}
