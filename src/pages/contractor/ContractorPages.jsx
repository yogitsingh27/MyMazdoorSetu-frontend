import { useState, useEffect } from 'react';
import { PageHead, IdChip } from '@/components/common/Primitives';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { StatusPill, Stars } from '@/components/common/Rating';
import { useServiceData } from '@/hooks/useServiceData';
import { useAuth } from '@/contexts/AuthContext';
import { ContractorService } from '@/services';
import { useToast } from '@/contexts/ToastContext';
import PostJobModal from '@/components/job/PostJobModal';
import ErrorState from '@/components/common/ErrorState';
import SampleDataNotice from '@/components/common/SampleDataNotice';
import { decideErrorMessage } from '@/pages/shared/applicantErrors';
import { jobErrorMessage } from '@/pages/shared/jobErrors';

export function ContractorJobsPage() {
  const [showPost, setShowPost] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const { data: jobs, loading, error, reload } = useServiceData(() => ContractorService.myJobs(), []);
  const toast = useToast();

  if (loading) return <div><PageHead title="My jobs" /><PageSkeleton stats={false} table /></div>;
  if (error) return <div><PageHead title="My jobs" /><ErrorState onRetry={reload} /></div>;

  // Job lifecycle transitions (server-confirmed): Open -> Closed -> Completed.
  const transition = async (job, action) => {
    setBusyId(job.id);
    try {
      if (action === 'close') await ContractorService.closeJob(job.id);
      else await ContractorService.completeJob(job.id);
      toast(action === 'close' ? `${job.id} closed to new applications` : `${job.id} marked completed`, 'info');
    } catch (err) {
      toast(jobErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
      reload();
    }
  };

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
                  <td style={{ display: 'flex', gap: 6 }}>
                    {j.status === 'open' && <button className="btn-sm muted" disabled={busyId === j.id} onClick={() => transition(j, 'close')}>Close</button>}
                    {j.status === 'closed' && <button className="btn-sm orange" disabled={busyId === j.id} onClick={() => transition(j, 'complete')}>Complete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showPost && <PostJobModal onClose={() => setShowPost(false)} onPosted={reload} postedAsRole="contractor" />}
    </div>
  );
}

export function ApplicantsPage() {
  const { user } = useAuth();
  const { data: apps, loading, error, reload } = useServiceData(() => ContractorService.applicants(user.id), [user.id]);
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  if (loading) return <div><PageHead title="Applicants" /><PageSkeleton stats={false} table /></div>;
  if (error) return <div><PageHead title="Applicants" /><ErrorState onRetry={reload} /></div>;

  const decide = async (app, decision) => {
    setBusyId(app.id);
    try {
      await ContractorService.decideApplication(app.id, decision);
      toast(decision === 'accepted' ? `${app.applicantName} accepted — they've been notified` : `${app.applicantName} declined`, decision === 'accepted' ? 'success' : 'info');
    } catch (err) {
      toast(decideErrorMessage(err), 'error');
    } finally {
      setBusyId(null);
      reload(); // server-confirmed: re-sync the list from the backend
    }
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
                        <button className="btn-sm orange" disabled={busyId === a.id} onClick={() => decide(a, 'accepted')}>Accept</button>
                        <button className="btn-sm muted" disabled={busyId === a.id} onClick={() => decide(a, 'rejected')}>Reject</button>
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
  const { data: fetched, loading, error, reload } = useServiceData(() => ContractorService.managedWorkers(), []);
  const [rows, setRows] = useState([]);
  const toast = useToast();

  // Mirror fetched data into local editable state once it arrives.
  useEffect(() => {
    if (fetched) setRows(fetched);
  }, [fetched]);

  if (loading) return <div><PageHead title="Managed workers" /><PageSkeleton stats={false} table /></div>;
  if (error) return <div><PageHead title="Managed workers" /><ErrorState onRetry={reload} /></div>;

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
      <SampleDataNotice />
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
