import { respond, getOrNull, USE_API } from './http';
import { JOBS } from '@/data/jobs';
import { USERS } from '@/data/users';
import { MANAGED_WORKERS } from '@/data/companies';
import { REVIEWS_FOR_HIRER } from '@/data/reviews';
import { ApplicationService } from './ApplicationService';
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
  // --- dashboard / internal (mock) ---
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
