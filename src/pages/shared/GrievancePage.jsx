import { PageHead } from '@/components/common/Primitives';
import { StatusPill } from '@/components/common/Rating';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import SampleDataNotice from '@/components/common/SampleDataNotice';
import { useServiceData } from '@/hooks/useServiceData';
import { ComplaintService } from '@/services';
import { ROLE } from '@/types/roles';

export default function GrievancePage({ role }) {
  const isAdmin = role === ROLE.ADMIN;
  // Filing is not wired to a backend yet, so the submit action is omitted rather
  // than faking a ticket. The list below is sample data (see SampleDataNotice).
  const { data: complaints, loading } = useServiceData(() => ComplaintService.list(), []);

  if (loading) return <div><PageHead title={isAdmin ? 'Complaints' : 'Grievance'} /><PageSkeleton stats={false} table /></div>;

  return (
    <div>
      <PageHead
        title={isAdmin ? 'Complaints' : 'Grievance'}
        desc={isAdmin ? 'Platform-wide complaints awaiting review.' : 'Raise a complaint or track one you already filed.'}
      />
      <SampleDataNotice />

      {complaints.length === 0 ? (
        <EmptyState icon="shield" title="No complaints on file" hint="When something needs flagging, you'll be able to file it here and track its status." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>ID</th><th>Type</th><th>Description</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {complaints.map((g) => (
                <tr key={g.id}>
                  <td className="mono">{g.id}</td>
                  <td>{g.type}</td>
                  <td>{g.desc}</td>
                  <td>{g.date}</td>
                  <td><StatusPill status={g.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
