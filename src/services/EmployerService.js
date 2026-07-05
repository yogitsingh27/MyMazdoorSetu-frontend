import { respond, getOrNull, USE_API } from './http';
import { JOBS } from '@/data/jobs';
import { USERS } from '@/data/users';
import { MANAGED_WORKERS } from '@/data/companies';
import { REVIEWS_FOR_HIRER } from '@/data/reviews';
import { ApplicationService } from './ApplicationService';
import { JobService } from './JobService';
import { WorkerService } from './WorkerService';
import { ROLE } from '@/types/roles';
import { mapEmployerDetail } from './mappers';

// Mock-mode enrichment: assemble the public employer profile so Employer Detail
// consumes a uniform shape whether the data came from mock or the API.
function enrichMockEmployer(u) {
  return {
    id: u.id,
    city: u.city,
    verified: u.verified,
    avatarColor: u.avatarColor,
    employerProfile: u.employerProfile,
    reviews: REVIEWS_FOR_HIRER.filter((r) => r.hirerId === u.id),
    openJobs: JOBS.filter((j) => j.postedById === u.id && j.postedByRole === ROLE.EMPLOYER && j.status === 'open'),
  };
}

// Employer = homeowner / builder / company / society / factory / hotel / shop.
export const EmployerService = {
  // --- dashboard / internal ---
  // My jobs = the employer's own posted jobs. API-backed (real, includes newly
  // posted jobs); mock otherwise. close/complete delegate to JobService — the
  // generic action layer — keeping this role service as the page-facing boundary.
  async myJobs() {
    if (USE_API) return JobService.postedJobs(ROLE.EMPLOYER);
    return respond(JOBS.filter((j) => ['JOB-2291', 'JOB-2276', 'JOB-2204'].includes(j.id)));
  },
  async closeJob(code) { return JobService.close(code); },
  async completeJob(code) { return JobService.complete(code); },
  // Find workers is backed by the real /workers search (via WorkerService) so an
  // employer sees genuine workers, not canned rows. Mock mode maps the local
  // sample list into the same worker-summary shape the page consumes.
  async findWorkers({ trade, q, city } = {}) {
    if (USE_API) return WorkerService.search({ trade, q, city });
    const list = (trade ? MANAGED_WORKERS.filter((w) => w.trade === trade) : MANAGED_WORKERS)
      .map((w, i) => ({
        id: `mw_${i}`,
        name: w.name,
        avatarColor: 'amber',
        city: 'Delhi',
        verified: w.rating >= 4.5,
        workerProfile: { trade: w.trade, rating: w.rating, jobsDone: w.jobs ?? 0, skills: [] },
      }));
    return respond(list);
  },
  async applications(posterId) { return ApplicationService.forPoster(posterId, ROLE.EMPLOYER); },
  async decideApplication(applicationId, decision) { return ApplicationService.decide(applicationId, decision); },
  async savedWorkers() { return respond(MANAGED_WORKERS.filter((w) => w.rating >= 4.5)); },
  async reviews() { return respond(REVIEWS_FOR_HIRER); },
  async summary() {
    return respond({ activeJobs: 2, workersHired: 5, applicationsReceived: 11, hiringSpend: '₹42,000' });
  },

  // --- public read (API or mock) ---
  async getPublic(id) {
    if (USE_API) {
      const dto = await getOrNull(`/employers/${encodeURIComponent(id)}`);
      return dto ? mapEmployerDetail(dto) : null;
    }
    const employer = USERS.find((u) => u.id === id && u.employerProfile);
    return respond(employer ? enrichMockEmployer(employer) : null);
  },
};
