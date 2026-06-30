import ProfileShell from '@/pages/shared/ProfileShell';
import { useServiceData } from '@/hooks/useServiceData';
import { AgentService } from '@/services';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';

function DetailsPanel() {
  const { user } = useAuth();
  const ap = user?.agentProfile;
  const toast = useToast();
  return (
    <div className="card">
      <h3>Agent details</h3>
      <div className="form-grid">
        <div className="field full">
          <label>Coverage area</label>
          <input defaultValue={ap?.coverageArea || ''} placeholder="West & South Delhi" />
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => toast('Profile changes saved')}>Save changes</button>
    </div>
  );
}

function RegistrationsPanel() {
  const { data: workers, loading } = useServiceData(() => AgentService.registeredWorkers(), []);
  if (loading) return <PageSkeleton stats={false} table />;
  return workers.length === 0 ? (
    <EmptyState icon="users" title="No registrations yet" />
  ) : (
    <div className="card" style={{ padding: 0 }}>
      <table className="list">
        <thead><tr><th>Worker</th><th>Trade</th><th className="num">Jobs</th></tr></thead>
        <tbody>{workers.map((w) => <tr key={w.name}><td>{w.name}</td><td>{w.trade}</td><td className="num">{w.jobs}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

function CoveragePanel() {
  const { user } = useAuth();
  return (
    <div className="card">
      <h3>Coverage area</h3>
      <p style={{ fontSize: 14, color: 'var(--text)' }}>{user?.agentProfile?.coverageArea || 'Not set yet.'}</p>
    </div>
  );
}

function PerformancePanel() {
  const { data, loading } = useServiceData(() => AgentService.summary(), []);
  if (loading) return <PageSkeleton stats />;
  return (
    <div className="stat-row">
      <div className="stat-card"><div className="num">{data.registrations}</div><div className="lbl">Total registrations</div></div>
      <div className="stat-card"><div className="num mono">{data.monthlyCommission}</div><div className="lbl">This month's commission</div></div>
      <div className="stat-card"><div className="num mono">{data.pendingCommission}</div><div className="lbl">Pending commission</div></div>
    </div>
  );
}

export default function AgentProfile() {
  return (
    <ProfileShell
      role="agent"
      title="Agent profile"
      desc="Your registrations and performance as a platform agent."
      panels={{
        details: <DetailsPanel />,
        registrations: <RegistrationsPanel />,
        coverage: <CoveragePanel />,
        performance: <PerformancePanel />,
      }}
    />
  );
}
