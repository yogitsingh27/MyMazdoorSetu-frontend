import ProfileShell from '@/pages/shared/ProfileShell';
import { RatingSummary, StatusPill } from '@/components/common/Rating';
import { ReviewsPanel, avgOverall } from '@/components/common/Reviews';
import { useServiceData } from '@/hooks/useServiceData';
import { EmployerService, ReviewService } from '@/services';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { HIRER_RATING_CATS } from '@/data/reviews';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';

function OrgDetailsPanel() {
  const { user } = useAuth();
  const ep = user?.employerProfile;
  const toast = useToast();
  return (
    <div className="card">
      <h3>Organization details</h3>
      <div className="form-grid">
        <div className="field full">
          <label>Organization name</label>
          <input defaultValue={ep?.orgName || ''} />
        </div>
        <div className="field">
          <label>Type</label>
          <select defaultValue={ep?.kind || 'homeowner'}>
            <option value="homeowner">Homeowner</option>
            <option value="builder">Builder</option>
            <option value="company">Construction company</option>
            <option value="society">Housing society</option>
            <option value="factory">Factory</option>
            <option value="hotel">Hotel</option>
            <option value="shop">Shop</option>
          </select>
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => toast('Profile changes saved')}>Save changes</button>
    </div>
  );
}

function HiringHistoryPanel() {
  const { data: jobs, loading } = useServiceData(() => EmployerService.myJobs(), []);
  if (loading) return <PageSkeleton stats={false} table />;
  return (
    <div className="card" style={{ padding: 0 }}>
      <table className="list">
        <thead><tr><th>Job</th><th>Trade</th><th>Status</th></tr></thead>
        <tbody>{jobs.map((j) => <tr key={j.id}><td>{j.title}</td><td>{j.trade}</td><td><StatusPill status={j.status} /></td></tr>)}</tbody>
      </table>
    </div>
  );
}

function SavedWorkersPanel() {
  const { data: workers, loading } = useServiceData(() => EmployerService.savedWorkers(), []);
  if (loading) return <PageSkeleton stats={false} table />;
  return workers.length === 0 ? (
    <EmptyState icon="users" title="No saved workers yet" />
  ) : (
    <div className="card" style={{ padding: 0 }}>
      <table className="list">
        <thead><tr><th>Worker</th><th>Trade</th></tr></thead>
        <tbody>{workers.map((w) => <tr key={w.name}><td>{w.name}</td><td>{w.trade}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function PaymentsPanel() {
  return (
    <div className="card">
      <h3>Payments</h3>
      <div className="pay-status pay-paid">
        <div><strong style={{ fontSize: 14 }}>JOB-2204 · Tile fitting</strong><div style={{ fontSize: 12, color: 'var(--text-mute)' }}>Paid 24 Jun</div></div>
        <span className="mono" style={{ fontWeight: 700 }}>₹3,500</span>
      </div>
      <div className="pay-status">
        <div><strong style={{ fontSize: 14 }}>JOB-2291 · Wall plastering</strong><div style={{ fontSize: 12, color: 'var(--text-mute)' }}>Due on completion</div></div>
        <span className="mono" style={{ fontWeight: 700 }}>₹4,000</span>
      </div>
    </div>
  );
}

function ReviewsPanelWrapper() {
  const { data: reviews, loading } = useServiceData(() => ReviewService.forHirer(), []);
  if (loading) return <PageSkeleton stats={false} />;
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0 }}>Reviews</h3>
        <RatingSummary score={avgOverall(reviews)} count={reviews.length} />
      </div>
      <ReviewsPanel reviews={reviews} categories={HIRER_RATING_CATS} />
    </div>
  );
}

export default function EmployerProfile() {
  return (
    <ProfileShell
      role="employer"
      title="Organization profile"
      desc="How workers and contractors see you as an employer."
      panels={{
        details: <OrgDetailsPanel />,
        history: <HiringHistoryPanel />,
        saved: <SavedWorkersPanel />,
        payments: <PaymentsPanel />,
        reviews: <ReviewsPanelWrapper />,
      }}
    />
  );
}
