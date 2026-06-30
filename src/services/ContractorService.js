import { respond } from './http';
import { JOBS } from '@/data/jobs';
import { APPLICATIONS } from '@/data/applications';
import { MANAGED_WORKERS, PROJECTS } from '@/data/companies';
import { REVIEWS_FOR_HIRER } from '@/data/reviews';

export const ContractorService = {
  async myJobs() { return respond(JOBS.filter((j) => ['JOB-2288', 'JOB-2280', 'JOB-2204'].includes(j.id))); },
  async applicants() { return respond(APPLICATIONS); },
  async managedWorkers() { return respond(MANAGED_WORKERS); },
  async projects() { return respond(PROJECTS); },
  async reviews() { return respond(REVIEWS_FOR_HIRER); },
  async summary() {
    return respond({ activeJobs: 6, workersManaged: 22, newApplicants: 5, pendingPayments: '₹14,500' });
  },
  async setWorkerDirectContact(name, value) { return respond({ name, contactDirect: value }); },
};
