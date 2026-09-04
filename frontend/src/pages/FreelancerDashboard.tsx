import { Link } from 'react-router-dom';
import { AppShell, PageHeader, StatCard } from '../components/ui';

export default function FreelancerDashboard() {
  return (
    <AppShell eyebrow="Freelancer workspace">
      <PageHeader
        title="Freelancer Dashboard"
        description="Coordinate client work, creator delivery, contracts, messages, and payouts from one focused command center."
        action={<Link to="/tasks" className="button">Review Tasks</Link>}
      />

      <div className="stats-grid">
        <StatCard label="Client Work" value="Campaigns" detail="Follow briefs, milestones, and collaborators." />
        <StatCard label="Delivery" value="Tasks" detail="Keep assignments and submissions moving." />
        <StatCard label="Finance" value="Payments" detail="Track contract-linked payment status." />
      </div>

      <div className="dashboard-grid mt-panel">
        <Link to="/campaigns" className="feature-card">
          <h3>Campaigns</h3>
          <p>Stay aligned on active brand and creator work.</p>
        </Link>
        <Link to="/contracts" className="feature-card">
          <h3>Contracts</h3>
          <p>Manage engagement status and move agreements forward.</p>
        </Link>
        <Link to="/messages" className="feature-card">
          <h3>Messages</h3>
          <p>Keep communication attached to the same operating space.</p>
        </Link>
      </div>
    </AppShell>
  );
}
