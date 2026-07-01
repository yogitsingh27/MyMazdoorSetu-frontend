import JobTicket from '@/components/job/JobTicket';
import WorkerShowcaseCard from './WorkerShowcaseCard';
import DashboardPreviewCard from './DashboardPreviewCard';
import { JOBS } from '@/data/jobs';
import { FEATURED_WORKERS } from '@/data/showcase';
import { ROLE } from '@/types/roles';

const sampleJob = JOBS.find((j) => j.status === 'open');
const primaryWorker = FEATURED_WORKERS[0];

// One real product screen per audience — a single focal point, not a stack.
export default function HeroPreview({ audience }) {
  return (
    <div className="hero-preview">
      {audience === ROLE.WORKER && <JobTicket job={sampleJob} />}
      {audience === ROLE.CONTRACTOR && <DashboardPreviewCard title="Your crew today" />}
      {audience === ROLE.EMPLOYER && <WorkerShowcaseCard worker={primaryWorker} />}
      {audience === ROLE.AGENT && <DashboardPreviewCard title="Workers you registered" />}
    </div>
  );
}
