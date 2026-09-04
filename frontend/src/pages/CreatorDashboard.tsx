import { Link } from 'react-router-dom';
import { AppShell, PageHeader, StatCard } from '../components/ui';

export default function CreatorDashboard() {
  return (
    <AppShell eyebrow="Creator workspace">
      <PageHeader
        title="Creator Dashboard"
        description="Keep campaign invitations, deliverables, reviews, payments, and your portfolio organized."
        action={<Link to="/portfolio" className="button">Update Portfolio</Link>}
      />

      <div className="stats-grid">
        <StatCard label="Opportunities" value="Collabs" detail="Review campaign invitations and responses." />
        <StatCard label="Delivery" value="Tasks" detail="Submit deliverables and track due dates." />
        <StatCard label="Reputation" value="Reviews" detail="Keep proof and feedback close at hand." />
      </div>

      <div className="dashboard-grid mt-panel">
        <Link to="/collaborations" className="feature-card">
          <h3>Collaborations</h3>
          <p>View partnership requests and coordinate next steps.</p>
        </Link>
        <Link to="/tasks" className="feature-card">
          <h3>Tasks</h3>
          <p>Track assigned work, dates, and deliverable submissions.</p>
        </Link>
        <Link to="/portfolio" className="feature-card">
          <h3>Portfolio</h3>
          <p>Showcase your work with profile-ready media links.</p>
        </Link>
      </div>
    </AppShell>
  );
}
