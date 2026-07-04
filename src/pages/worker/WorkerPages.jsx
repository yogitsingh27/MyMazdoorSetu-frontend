import { useState } from 'react';
import { PageHead } from '@/components/common/Primitives';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { StatusPill } from '@/components/common/Rating';
import { ReviewModal } from '@/components/common/Reviews';
import { HIRER_RATING_CATS } from '@/data/reviews';
import { useServiceData } from '@/hooks/useServiceData';
import { useAuth } from '@/contexts/AuthContext';
import { WorkerService } from '@/services';
import JobTicket from '@/components/job/JobTicket';
import { useToast } from '@/contexts/ToastContext';

// These worker dashboard pages are English-only by existing convention (see
// docs/CHANGELOG.md), so backend error codes map to hardcoded English strings
// rather than locale keys.
const APPLY_ERRORS = {
  'application.already_applied': 'You have already applied to this job.',
  'job.not_open': 'This job is no longer open for applications.',
  'application.self_apply': 'You cannot apply to a job you posted.',
};
const applyError = (err) => APPLY_ERRORS[err?.code] || 'Could not apply. Please try again.';

const WITHDRAW_ERRORS = {
  'application.not_pending': 'This application can no longer be withdrawn.',
  'application.forbidden': 'You can only withdraw your own applications.',
};
const withdrawError = (err) => WITHDRAW_ERRORS[err?.code] || 'Could not withdraw. Please try again.';

export function BrowseJobsPage() {
  const { user } = useAuth();
  const { data: jobs, loading } = useServiceData(() => WorkerService.nearbyJobs(), []);
  const toast = useToast();

  if (loading) return <div><PageHead title="Nearby jobs" /><PageSkeleton stats={false} /></div>;

  const apply = async (job) => {
    try {
      await WorkerService.apply(job.id, user.id);
      toast(`Applied to ${job.title}`);
    } catch (err) {
      toast(applyError(err), 'error');
    }
  };

  return (
    <div>
      <PageHead title="Nearby jobs" desc="Jobs matching your trade, closest first." />
      {jobs.length === 0 ? (
        <EmptyState icon="briefcase" title="No jobs nearby right now" hint="We'll notify you the moment something matching your trade is posted." />
      ) : (
        <div className="ticket-grid">{jobs.map((j) => <JobTicket key={j.id} job={j} onApply={apply} />)}</div>
      )}
    </div>
  );
}

export function MyApplicationsPage() {
  const { user } = useAuth();
  const { data: apps, loading, reload } = useServiceData(() => WorkerService.myApplications(user.id), [user.id]);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const toast = useToast();

  if (loading) return <div><PageHead title="My applications" /><PageSkeleton stats={false} table /></div>;

  const withdraw = async (app) => {
    setBusyId(app.id);
    try {
      await WorkerService.withdrawApplication(app.id);
      toast(`Application to ${app.jobTitle} withdrawn`, 'info');
    } catch (err) {
      toast(withdrawError(err), 'error');
    } finally {
      setBusyId(null);
      reload(); // server-confirmed: re-sync the list from the backend
    }
  };

  return (
    <div>
      <PageHead title="My applications" desc="Track what you applied to and what came back." />
      {apps.length === 0 ? (
        <EmptyState icon="file" title="You haven't applied to anything yet" hint="Browse nearby jobs and apply — your applications will show up here." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>Job</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td>{a.jobTitle}</td>
                  <td><StatusPill status={a.status} /></td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {a.status === 'pending' && (
                      <button className="btn-sm muted" disabled={busyId === a.id} onClick={() => withdraw(a)}>Withdraw</button>
                    )}
                    {a.status === 'accepted' && (
                      <button className="btn-sm orange" onClick={() => setReviewTarget('Apex Builders')}>Rate hirer</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {reviewTarget && <ReviewModal onClose={() => setReviewTarget(null)} subjectName={reviewTarget} categories={HIRER_RATING_CATS} />}
    </div>
  );
}
