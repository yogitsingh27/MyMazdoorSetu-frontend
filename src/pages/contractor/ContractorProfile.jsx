import ProfileShell from '@/pages/shared/ProfileShell';
import Icon from '@/components/common/Icon';
import { RatingSummary, StatusPill } from '@/components/common/Rating';
import { ReviewsPanel, avgOverall } from '@/components/common/Reviews';
import { useServiceData } from '@/hooks/useServiceData';
import { ContractorService, ReviewService } from '@/services';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { HIRER_RATING_CATS } from '@/data/reviews';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';

function BusinessDetailsPanel() {
  const { user } = useAuth();
  const cp = user?.contractorProfile;
  const toast = useToast();
  return (
    <div className="card">
      <h3>Business profile</h3>
      <div className="form-grid">
        <div className="field full">
          <label>Business name</label>
          <input defaultValue={cp?.businessName || ''} />
        </div>
        <div className="field">
          <label>Workers managed</label>
          <input defaultValue={cp?.managedWorkers || 0} disabled />
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => toast('Profile changes saved')}>Save changes</button>
    </div>
  );
}

function ProjectsPanel() {
  const { data: projects, loading } = useServiceData(() => ContractorService.projects(), []);
  if (loading) return <PageSkeleton stats={false} table />;
  return (
    <div className="card">
      <h3>Projects</h3>
      {projects.length === 0 ? (
        <EmptyState icon="briefcase" title="No projects yet" />
      ) : (
        projects.map((p) => (
          <div key={p.id} style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><strong style={{ fontSize: 14 }}>{p.name}</strong><div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{p.workers} workers</div></div>
              <StatusPill status={p.status} />
            </div>
            <div className="rating-bar-track" style={{ marginTop: 8 }}>
              <div className="rating-bar-fill" style={{ width: `${p.progress * 100}%` }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ManagedWorkersPanel() {
  const { data: workers, loading } = useServiceData(() => ContractorService.managedWorkers(), []);
  if (loading) return <PageSkeleton stats={false} table />;
  return (
    <div className="card" style={{ padding: 0 }}>
      <table className="list">
        <thead><tr><th>Worker</th><th>Trade</th><th>Jobs</th></tr></thead>
        <tbody>{workers.map((w) => <tr key={w.name}><td>{w.name}</td><td>{w.trade}</td><td className="num">{w.jobs}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function VerificationPanel() {
  const { user } = useAuth();
  const verified = user?.contractorProfile?.businessVerified;
  return (
    <div className="card">
      <h3>Business verification</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {verified ? (
          <span className="id-verified"><Icon name="check" size={12} /> Business verified</span>
        ) : (
          <span className="id-unverified"><Icon name="shield" size={12} /> Not yet verified</span>
        )}
      </div>
      {!verified && (
        <div className="field full" style={{ marginTop: 14 }}>
          <label>Upload business registration / GST certificate</label>
          <input type="file" />
        </div>
      )}
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

export default function ContractorProfile() {
  return (
    <ProfileShell
      role="contractor"
      title="Business profile"
      desc="How workers and the platform see your business."
      panels={{
        details: <BusinessDetailsPanel />,
        projects: <ProjectsPanel />,
        workers: <ManagedWorkersPanel />,
        verification: <VerificationPanel />,
        reviews: <ReviewsPanelWrapper />,
      }}
    />
  );
}
