import { respond, USE_API } from './http';
import { JOBS } from '@/data/jobs';
import { MANAGED_WORKERS, PROJECTS } from '@/data/companies';
import { REVIEWS_FOR_HIRER } from '@/data/reviews';
import { ApplicationService } from './ApplicationService';
import { JobService } from './JobService';
import { ROLE } from '@/types/roles';

export const ContractorService = {
  // My jobs = the contractor's own posted jobs (API-backed); close/complete
  // delegate to JobService, keeping this role service as the page-facing boundary.
  async myJobs() {
    if (USE_API) return JobService.postedJobs(ROLE.CONTRACTOR);
    return respond(JOBS.filter((j) => ['JOB-2288', 'JOB-2280', 'JOB-2204'].includes(j.id)));
  },
  async closeJob(code) { return JobService.close(code); },
  async completeJob(code) { return JobService.complete(code); },
  async applicants(posterId) { return ApplicationService.forPoster(posterId, ROLE.CONTRACTOR); },
  async decideApplication(applicationId, decision) { return ApplicationService.decide(applicationId, decision); },
  async managedWorkers() { return respond(MANAGED_WORKERS); },
  async projects() { return respond(PROJECTS); },
  async reviews() { return respond(REVIEWS_FOR_HIRER); },
  async summary() {
    return respond({ activeJobs: 6, workersManaged: 22, newApplicants: 5, pendingPayments: '₹14,500' });
  },
  async setWorkerDirectContact(name, value) { return respond({ name, contactDirect: value }); },
};
