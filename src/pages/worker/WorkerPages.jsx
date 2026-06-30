import { useState } from 'react';
import { PageHead } from '@/components/common/Primitives';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import { StatusPill } from '@/components/common/Rating';
import { ReviewModal } from '@/components/common/Reviews';
import { HIRER_RATING_CATS } from '@/data/reviews';
import { useServiceData } from '@/hooks/useServiceData';
import { WorkerService } from '@/services';
import JobTicket from '@/components/job/JobTicket';
import { useToast } from '@/contexts/ToastContext';

export function BrowseJobsPage() {
  const { data: jobs, loading } = useServiceData(() => WorkerService.nearbyJobs(), []);
  const toast = useToast();

  if (loading) return <div><PageHead title="Nearby jobs" /><PageSkeleton stats={false} /></div>;

  const apply = (job) => toast(`Applied to ${job.title}`);

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
  const { data: apps, loading } = useServiceData(() => WorkerService.myApplications(), []);
  const [reviewTarget, setReviewTarget] = useState(null);

  if (loading) return <div><PageHead title="My applications" /><PageSkeleton stats={false} table /></div>;

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
                  <td>{a.title}</td>
                  <td><StatusPill status={a.status} /></td>
                  <td>{a.status === 'active' && <button className="btn-sm orange" onClick={() => setReviewTarget('Apex Builders')}>Rate hirer</button>}</td>
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
