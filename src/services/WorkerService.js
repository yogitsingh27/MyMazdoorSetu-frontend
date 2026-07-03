import { respond } from './http';
import { JOBS } from '@/data/jobs';
import { REVIEWS_FOR_WORKER } from '@/data/reviews';
import { ALL_WORKERS } from '@/data/showcase';
import { ApplicationService } from './ApplicationService';

// Each filter key maps to a builder that takes the filter's value and
// returns a (worker) => boolean test. Adding a future filter (experienceMin,
// wageMin once wage is structured, ...) means adding one entry here —
// search() itself never needs to change, and the UI doesn't need to expose
// it right away.
const PREDICATES = {
  q: (value) => {
    const needle = value.toLowerCase();
    return (w) => [w.name, w.city, w.workerProfile.trade, ...(w.workerProfile.skills || []), ...(w.workerProfile.portfolio || [])]
      .join(' ').toLowerCase().includes(needle);
  },
  trade: (value) => (w) => w.workerProfile.trade === value,
  city: (value) => (w) => w.city === value,
  availability: (value) => (w) => w.workerProfile.availability === value,
  verifiedOnly: (value) => (w) => !value || w.verified,
};

function applyFilters(items, filters) {
  const active = Object.entries(filters).filter(([, v]) => v != null && v !== '' && v !== false);
  const tests = active.map(([key, value]) => PREDICATES[key]?.(value)).filter(Boolean);
  return items.filter((item) => tests.every((test) => test(item)));
}

export const WorkerService = {
  async nearbyJobs() { return respond(JOBS.filter((j) => j.status === 'open')); },
  async myApplications(applicantId) { return ApplicationService.forApplicant(applicantId); },
  async apply(jobId, applicantId) { return ApplicationService.apply({ jobId, applicantId }); },
  async withdrawApplication(applicationId) { return ApplicationService.withdraw(applicationId); },
  async reviews() { return respond(REVIEWS_FOR_WORKER); },
  async summary() {
    return respond({
      todaysJob: 'Tile fitting · Rohini',
      applied: 3,
      earnedThisMonth: '₹18,400',
      rating: 4.6,
      availability: 'available',
    });
  },
  async setAvailability(value) { return respond({ availability: value }); },

  /** @param {import('@/types/models').SearchFilters} filters */
  async search(filters = {}) {
    return respond(applyFilters(ALL_WORKERS, filters));
  },
};
