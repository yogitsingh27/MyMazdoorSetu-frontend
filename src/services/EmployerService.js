import { respond } from './http';
import { JOBS } from '@/data/jobs';
import { MANAGED_WORKERS } from '@/data/companies';
import { REVIEWS_FOR_HIRER } from '@/data/reviews';
import { ApplicationService } from './ApplicationService';
import { ROLE } from '@/types/roles';

// Employer = homeowner / builder / company / society / factory / hotel / shop.
export const EmployerService = {
  async myJobs() { return respond(JOBS.filter((j) => ['JOB-2291', 'JOB-2276', 'JOB-2204'].includes(j.id))); },
  async findWorkers({ trade } = {}) {
    const list = trade ? MANAGED_WORKERS.filter((w) => w.trade === trade) : MANAGED_WORKERS;
    return respond(list);
  },
  async applications(posterId) { return ApplicationService.forPoster(posterId, ROLE.EMPLOYER); },
  async decideApplication(applicationId, decision) { return ApplicationService.decide(applicationId, decision); },
  async savedWorkers() { return respond(MANAGED_WORKERS.filter((w) => w.rating >= 4.5)); },
  async reviews() { return respond(REVIEWS_FOR_HIRER); },
  async summary() {
    return respond({ activeJobs: 2, workersHired: 5, applicationsReceived: 11, hiringSpend: '₹42,000' });
  },
};
