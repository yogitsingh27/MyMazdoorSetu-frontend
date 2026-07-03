import { respond } from './http';
import { JOBS } from '@/data/jobs';
import { MANAGED_WORKERS, PROJECTS } from '@/data/companies';
import { REVIEWS_FOR_HIRER } from '@/data/reviews';
import { ApplicationService } from './ApplicationService';
import { ROLE } from '@/types/roles';

export const ContractorService = {
  async myJobs() { return respond(JOBS.filter((j) => ['JOB-2288', 'JOB-2280', 'JOB-2204'].includes(j.id))); },
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
