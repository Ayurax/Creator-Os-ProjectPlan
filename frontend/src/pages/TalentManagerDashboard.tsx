import { Link } from 'react-router-dom';
import { AppShell, PageHeader, StatCard } from '../components/ui';

export default function TalentManagerDashboard() {
  return (
    <AppShell eyebrow="Talent manager workspace">
      <PageHeader
        title="Talent Manager Dashboard"
        description="Oversee creator discovery, collaboration pipelines, contracts, tasks, reviews, and payout readiness."
        action={<Link to="/creators" className="button">Open Talent Network</Link>}
      />

      <div className="stats-grid">
        <StatCard label="Roster" value="Creators" detail="Review creator fit, niche, and audience signals." />
        <StatCard label="Pipeline" value="Collabs" detail="Coordinate approvals from invite to agreement." />
        <StatCard label="Operations" value="AI Tools" detail="Use AI to accelerate planning and outreach." />
      </div>

      <div className="dashboard-grid mt-panel">
        <Link to="/creators" className="feature-card">
          <h3>Creators</h3>
          <p>Browse the talent network and inspect creator profiles.</p>
        </Link>
        <Link to="/collaborations" className="feature-card">
          <h3>Collaborations</h3>
          <p>Monitor requests, responses, and campaign alignment.</p>
        </Link>
        <Link to="/ai" className="feature-card">
          <h3>AI Tools</h3>
          <p>Generate recommendations, emails, pricing, and content plans.</p>
        </Link>
      </div>
    </AppShell>
  );
}
