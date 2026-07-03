import { useState } from 'react';
import { PageHead, IdChip } from '@/components/common/Primitives';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { StatusPill, Stars } from '@/components/common/Rating';
import { ReviewModal } from '@/components/common/Reviews';
import { WORKER_RATING_CATS } from '@/data/reviews';
import { useServiceData } from '@/hooks/useServiceData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { EmployerService } from '@/services';
import PostJobModal from '@/components/job/PostJobModal';

export function FindWorkersPage() {
  const { data: workers, loading } = useServiceData(() => EmployerService.findWorkers(), []);

  if (loading) return <div><PageHead title="Find workers" /><PageSkeleton stats={false} table /></div>;

  return (
    <div>
      <PageHead title="Find workers" desc="Search by trade, rating, and availability." />
      {workers.length === 0 ? (
        <EmptyState icon="users" title="No workers match yet" hint="Try a different trade or widen your search area." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>Worker</th><th>Trade</th><th>Rating</th><th>Availability</th><th></th></tr></thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.name}>
                  <td><IdChip name={w.name} /></td>
                  <td>{w.trade}</td>
                  <td><Stars value={w.rating} size={12} /> <span className="mono" style={{ fontSize: 12 }}>{w.rating.toFixed(1)}</span></td>
                  <td><StatusPill status={w.available ? 'active' : 'pending'} /></td>
                  <td><button className="btn-sm">View profile</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function EmployerJobsPage() {
  const [showPost, setShowPost] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const { data: jobs, loading, reload } = useServiceData(() => EmployerService.myJobs(), []);

  if (loading) return <div><PageHead title="My jobs" /><PageSkeleton stats={false} table /></div>;

  return (
    <div>
      <PageHead title="My jobs" desc="Jobs you have posted." action={<button className="btn btn-primary" onClick={() => setShowPost(true)}>Post a job</button>} />
      {jobs.length === 0 ? (
        <EmptyState icon="briefcase" title="No jobs posted yet" hint="Post a job and qualified workers nearby will be notified." actionLabel="Post a job" onAction={() => setShowPost(true)} />
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
                  <td>{j.status === 'completed' && <button className="btn-sm orange" onClick={() => setReviewTarget('Worker')}>Rate worker</button>}</td>
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

export function EmployerApplicationsPage() {
  const { user } = useAuth();
  const { data: apps, loading, reload } = useServiceData(() => EmployerService.applications(user.id), [user.id]);
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  if (loading) return <div><PageHead title="Applications" /><PageSkeleton stats={false} table /></div>;

  const decide = async (app, decision) => {
    setBusyId(app.id);
    await EmployerService.decideApplication(app.id, decision);
    toast(decision === 'accepted' ? `${app.applicantName} accepted — they've been notified` : `${app.applicantName} declined`, decision === 'accepted' ? 'success' : 'info');
    setBusyId(null);
    reload();
  };

  return (
    <div>
      <PageHead title="Applications" desc="People who applied to your job postings." />
      {apps.length === 0 ? (
        <EmptyState icon="file" title="No applications yet" hint="Once you post a job, applicants will show up here." />
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

export function SavedWorkersPage() {
  const { data: workers, loading } = useServiceData(() => EmployerService.savedWorkers(), []);
  if (loading) return <div><PageHead title="Saved workers" /><PageSkeleton stats={false} table /></div>;
  return (
    <div>
      <PageHead title="Saved workers" desc="Workers you bookmarked for future jobs." />
      {workers.length === 0 ? (
        <EmptyState icon="users" title="No saved workers yet" hint="Bookmark workers from search results to keep them handy for future jobs." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <table className="list">
            <thead><tr><th>Worker</th><th>Trade</th><th>Rating</th></tr></thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.name}>
                  <td><IdChip name={w.name} /></td>
                  <td>{w.trade}</td>
                  <td><Stars value={w.rating} size={12} /> <span className="mono" style={{ fontSize: 12 }}>{w.rating.toFixed(1)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
