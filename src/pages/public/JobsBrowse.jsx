import { useNavigate } from 'react-router-dom';
import { useServiceData } from '@/hooks/useServiceData';
import { JobService } from '@/services';
import JobTicket from '@/components/job/JobTicket';
import EmptyState from '@/components/common/EmptyState';
import { PageSkeleton } from '@/components/common/Skeleton';

export default function JobsBrowse() {
  const navigate = useNavigate();
  const { data: jobs, loading } = useServiceData(() => JobService.listOpen(), []);

  if (loading) return <div className="section"><PageSkeleton stats={false} /></div>;

  return (
    <section className="section">
      <div className="section-head"><h2>Open jobs</h2></div>
      {jobs.length === 0 ? (
        <EmptyState icon="briefcase" title="No open jobs right now" hint="Check back soon, or register to get notified when matching work is posted." actionLabel="Register" onAction={() => navigate('/register')} />
      ) : (
        <div className="ticket-grid">
          {jobs.map((j) => <JobTicket key={j.id} job={j} onApply={() => navigate('/register', { state: { preselectRole: 'worker' } })} />)}
        </div>
      )}
    </section>
  );
}
