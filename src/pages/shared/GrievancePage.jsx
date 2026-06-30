import { useState } from 'react';
import { PageHead } from '@/components/common/Primitives';
import { StatusPill } from '@/components/common/Rating';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { useServiceData } from '@/hooks/useServiceData';
import { ComplaintService } from '@/services';
import { useToast } from '@/contexts/ToastContext';
import { ROLE } from '@/types/roles';

export default function GrievancePage({ role }) {
  const isAdmin = role === ROLE.ADMIN;
  const [showForm, setShowForm] = useState(false);
  const { data: complaints, loading, reload } = useServiceData(() => ComplaintService.list(), []);
  const toast = useToast();

  const submitComplaint = async (e) => {
    e.preventDefault();
    await ComplaintService.submit({ type: 'General', desc: 'New complaint' });
    toast("Complaint submitted — you'll get a ticket ID by SMS");
    setShowForm(false);
    reload();
  };

  if (loading) return <div><PageHead title={isAdmin ? 'Complaints' : 'Grievance'} /><PageSkeleton stats={false} table /></div>;

  return (
    <div>
      <PageHead
        title={isAdmin ? 'Complaints' : 'Grievance'}
        desc={isAdmin ? 'Platform-wide complaints awaiting review.' : 'Raise a complaint or track one you already filed.'}
        action={!isAdmin && <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>File a complaint</button>}
      />

      {showForm && !isAdmin && (
        <form className="card" onSubmit={submitComplaint}>
          <h3>New complaint</h3>
          <div className="form-grid">
            <div className="field">
              <label>Type</label>
              <select><option>Payment</option><option>Abuse</option><option>Fraud</option><option>Other</option></select>
            </div>
            <div className="field full">
              <label>Description</label>
              <textarea rows="3" placeholder="What happened?" />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" style={{ marginTop: 14 }}>Submit complaint</button>
        </form>
      )}

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
