import { PageHead } from '@/components/common/Primitives';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { StatusPill } from '@/components/common/Rating';
import { useServiceData } from '@/hooks/useServiceData';
import { AdminService } from '@/services';

export function AdminUsersPage() {
  const { data: users, loading } = useServiceData(() => AdminService.users(), []);
  if (loading) return <div><PageHead title="Users" /><PageSkeleton stats={false} table /></div>;
  return (
    <div>
      <PageHead title="Users" desc="Everyone registered on the platform." />
      {users.length === 0 ? (
        <EmptyState icon="users" title="No users yet" />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>Name</th><th>Roles</th><th>City</th><th>Status</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.name}>
                  <td>{u.name}</td>
                  <td><span className="roletag">{u.types}</span></td>
                  <td>{u.city}</td>
                  <td><StatusPill status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminJobsPage() {
  const { data: jobs, loading } = useServiceData(() => AdminService.jobs(), []);
  if (loading) return <div><PageHead title="Jobs" /><PageSkeleton stats={false} table /></div>;
  return (
    <div>
      <PageHead title="Jobs" desc="Every job posted across the platform." />
      {jobs.length === 0 ? (
        <EmptyState icon="briefcase" title="No jobs yet" />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>ID</th><th>Title</th><th>Trade</th><th>Status</th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td className="mono">{j.id}</td>
                  <td>{j.title}</td>
                  <td>{j.trade}</td>
                  <td><StatusPill status={j.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function VerificationQueuePage() {
  const { data: queue, loading } = useServiceData(() => AdminService.verificationQueue(), []);
  if (loading) return <div><PageHead title="Verification queue" /><PageSkeleton stats={false} table /></div>;
  return (
    <div>
      <PageHead title="Verification queue" desc="Accounts waiting on ID verification." />
      {queue.length === 0 ? (
        <EmptyState icon="check" title="Nothing pending" hint="All accounts are currently verified." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>Name</th><th>Roles</th><th>Submitted</th><th></th></tr></thead>
            <tbody>
              {queue.map((q) => (
                <tr key={q.name}>
                  <td>{q.name}</td>
                  <td><span className="roletag">{q.types}</span></td>
                  <td>{q.submitted}</td>
                  <td><button className="btn-sm orange">Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ActivityLogsPage() {
  return (
    <div>
      <PageHead title="Activity logs" desc="System-wide event stream across users, jobs, and payouts." />
      <EmptyState
        icon="file"
        title="No activity to show yet"
        hint="As users register, post jobs, and settle payments, events will stream in here in real time."
      />
    </div>
  );
}
