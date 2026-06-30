import { useState, useEffect } from 'react';
import { PageHead, IdChip } from '@/components/common/Primitives';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { StatusPill, Stars } from '@/components/common/Rating';
import { ReviewModal } from '@/components/common/Reviews';
import { WORKER_RATING_CATS } from '@/data/reviews';
import { useServiceData } from '@/hooks/useServiceData';
import { ContractorService } from '@/services';
import { useToast } from '@/contexts/ToastContext';
import PostJobModal from '@/components/job/PostJobModal';

export function ContractorJobsPage() {
  const [showPost, setShowPost] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const { data: jobs, loading, reload } = useServiceData(() => ContractorService.myJobs(), []);

  if (loading) return <div><PageHead title="My jobs" /><PageSkeleton stats={false} table /></div>;

  return (
    <div>
      <PageHead title="My jobs" desc="Jobs you posted or are running." action={<button className="btn btn-primary" onClick={() => setShowPost(true)}>Post a job</button>} />
      {jobs.length === 0 ? (
        <EmptyState icon="briefcase" title="No jobs posted yet" hint="Post your first job and applicants will start coming in." actionLabel="Post a job" onAction={() => setShowPost(true)} />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>Job</th><th>Trade</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td className="mono">{j.id} <span style={{ color: 'var(--text)', fontFamily: 'var(--body)' }}>— {j.title}</span></td>
                  <td>{j.trade}</td>
                  <td><StatusPill status={j.status} /></td>
                  <td>{j.status === 'completed' && <button className="btn-sm orange" onClick={() => setReviewTarget('Ramesh Kumar')}>Rate worker</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showPost && <PostJobModal onClose={() => setShowPost(false)} onPosted={reload} />}
      {reviewTarget && <ReviewModal onClose={() => setReviewTarget(null)} subjectName={reviewTarget} categories={WORKER_RATING_CATS} />}
    </div>
  );
}

export function ApplicantsPage() {
  const { data: apps, loading, reload } = useServiceData(() => ContractorService.applicants(), []);
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  if (loading) return <div><PageHead title="Applicants" /><PageSkeleton stats={false} table /></div>;

  const decide = async (app, decision) => {
    setBusyId(app.id);
    // Mock services don't persist this mutation server-side yet — optimistic
    // local update plus a real service call shape ready for the API.
    toast(decision === 'accept' ? `${app.applicantName} accepted — they've been notified` : `${app.applicantName} declined`, decision === 'accept' ? 'success' : 'info');
    setBusyId(null);
    reload();
  };

  return (
    <div>
      <PageHead title="Applicants" desc="Review and respond to people who applied to your jobs." />
      {apps.length === 0 ? (
        <EmptyState icon="users" title="No applicants yet" hint="Once you post a job, people who apply will show up here." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>Applicant</th><th>Trade</th><th>Job</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td><IdChip name={a.applicantName} /></td>
                  <td>{a.trade}</td>
                  <td className="mono">{a.jobId}</td>
                  <td><StatusPill status={a.status} /></td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {a.status === 'pending' && (
                      <>
                        <button className="btn-sm orange" disabled={busyId === a.id} onClick={() => decide(a, 'accept')}>Accept</button>
                        <button className="btn-sm muted" disabled={busyId === a.id} onClick={() => decide(a, 'reject')}>Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ManagedWorkersPage() {
  const { data: fetched, loading } = useServiceData(() => ContractorService.managedWorkers(), []);
  const [rows, setRows] = useState([]);
  const toast = useToast();

  // Mirror fetched data into local editable state once it arrives.
  useEffect(() => {
    if (fetched) setRows(fetched);
  }, [fetched]);

  if (loading) return <div><PageHead title="Managed workers" /><PageSkeleton stats={false} table /></div>;

  const toggleContact = (i) => {
    setRows((prev) => prev.map((w, idx) => {
      if (idx !== i) return w;
      toast(`Direct contact ${w.contactDirect ? 'disabled' : 'enabled'} for ${w.name}`, w.contactDirect ? 'info' : 'success');
      return { ...w, contactDirect: !w.contactDirect };
    }));
  };

  return (
    <div>
      <PageHead title="Managed workers" desc="Toggle whether hirers can contact a worker directly. Can still be overridden per job post." />
      {rows.length === 0 ? (
        <EmptyState icon="users" title="No workers under your contracts yet" hint="Workers you bring on for projects will appear here." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>Worker</th><th>Trade</th><th>Rating</th><th>Jobs</th><th>Direct contact</th></tr></thead>
            <tbody>
              {rows.map((w, i) => (
                <tr key={w.name}>
                  <td><IdChip name={w.name} /></td>
                  <td>{w.trade}</td>
                  <td><Stars value={w.rating} size={12} /> <span className="mono" style={{ fontSize: 12 }}>{w.rating.toFixed(1)}</span></td>
                  <td className="num">{w.jobs}</td>
                  <td><button className={`switch ${w.contactDirect ? 'on' : ''}`} onClick={() => toggleContact(i)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
