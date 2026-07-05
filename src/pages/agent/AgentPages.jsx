import { PageHead, IdChip } from '@/components/common/Primitives';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { StatusPill } from '@/components/common/Rating';
import { useServiceData } from '@/hooks/useServiceData';
import { AgentService } from '@/services';
import SampleDataNotice from '@/components/common/SampleDataNotice';

export function RegisteredWorkersPage() {
  const { data: workers, loading } = useServiceData(() => AgentService.registeredWorkers(), []);
  if (loading) return <div><PageHead title="Workers registered" /><PageSkeleton stats={false} table /></div>;
  return (
    <div>
      <PageHead title="Workers registered" desc="People you registered onto the platform." />
      <SampleDataNotice />
      {workers.length === 0 ? (
        <EmptyState icon="users" title="No workers registered yet" hint="Register a worker to start earning commission on their job activity." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>Worker</th><th>Trade</th><th>Verified</th><th>Jobs</th></tr></thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.name}>
                  <td><IdChip name={w.name} /></td>
                  <td>{w.trade}</td>
                  <td>{w.verified ? <StatusPill status="active" /> : <StatusPill status="pending" />}</td>
                  <td className="num">{w.jobs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function RegisteredContractorsPage() {
  const { data: contractors, loading } = useServiceData(() => AgentService.registeredContractors(), []);
  if (loading) return <div><PageHead title="Contractors registered" /><PageSkeleton stats={false} table /></div>;
  return (
    <div>
      <PageHead title="Contractors registered" desc="Contractors you registered onto the platform." />
      <SampleDataNotice />
      {contractors.length === 0 ? (
        <EmptyState icon="briefcase" title="No contractors registered yet" hint="Register a contractor to start earning commission on the jobs they post." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>Contractor</th><th>Joined</th><th>Activity</th><th className="num">Commission</th></tr></thead>
            <tbody>
              {contractors.map((c) => (
                <tr key={c.name}>
                  <td><IdChip name={c.name} sub={c.type} /></td>
                  <td>{c.joined}</td>
                  <td>{c.activity}</td>
                  <td className="num mono">{c.commission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function CommissionPage() {
  const { data, loading } = useServiceData(() => AgentService.commission(), []);
  if (loading) return <div><PageHead title="Commission" /><PageSkeleton table /></div>;

  return (
    <div>
      <PageHead title="Commission" desc="Your earnings from registrations and postings." />
      <SampleDataNotice />
      <div className="stat-row">
        <div className="stat-card"><div className="num mono">₹{data.total}</div><div className="lbl">Total earned</div></div>
        <div className="stat-card"><div className="num mono">₹{data.paid}</div><div className="lbl">Paid out</div></div>
        <div className="stat-card"><div className="num mono">₹{data.pending}</div><div className="lbl">Pending</div></div>
      </div>
      <div className="card">
        <h3>Commission breakdown</h3>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 14 }}>
          ₹150 per job posted on behalf of a registered contractor/employer, and ₹200 per job completed by a registered worker. Payouts settle weekly to your registered bank account.
        </p>
        {data.rows.length === 0 ? (
          <EmptyState icon="rupee" title="No commission activity yet" />
        ) : (
          <table className="list">
            <thead><tr><th>Date</th><th>User</th><th>Job</th><th>Type</th><th className="num">Amount</th><th>Status</th></tr></thead>
            <tbody>
              {data.rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>{r.user}</td>
                  <td className="mono">{r.job}</td>
                  <td>{r.type}</td>
                  <td className="num mono">₹{r.amount}</td>
                  <td><StatusPill status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
