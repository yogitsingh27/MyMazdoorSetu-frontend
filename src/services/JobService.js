import { respond, request, getOrNull, USE_API } from './http';
import { JOBS } from '@/data/jobs';
import { USERS } from '@/data/users';
import { mapJobSummary, mapJobDetail } from './mappers';

// Each filter key maps to a builder that takes the filter's value and
// returns a (job) => boolean test. Adding a future filter (wageMin,
// wageMax, durationMax, ...) means adding one entry here — search() itself
// never needs to change, and the UI doesn't need to expose it right away.
const PREDICATES = {
  q: (value) => {
    const needle = value.toLowerCase();
    return (j) => [j.title, j.description, j.location, j.trade, j.wage, ...(j.tags || [])]
      .join(' ').toLowerCase().includes(needle);
  },
  trade: (value) => (j) => j.trade === value,
  // location is free text ("Sector 45, Gurugram"), not a structured city
  // field, so this is a substring match against the canonical city name.
  city: (value) => (j) => j.location.includes(value),
};

function applyFilters(items, filters) {
  const active = Object.entries(filters).filter(([, v]) => v != null && v !== '' && v !== false);
  const tests = active.map(([key, value]) => PREDICATES[key]?.(value)).filter(Boolean);
  return items.filter((item) => tests.every((test) => test(item)));
}

// Mock-mode enrichment: resolve poster + similar so Job Detail consumes a
// uniform shape whether the data came from mock or the API.
function enrichMockJob(job) {
  const poster = USERS.find((u) => u.id === job.postedById);
  return {
    ...job,
    poster: poster
      ? {
        id: poster.id,
        name: poster.employerProfile?.orgName || poster.contractorProfile?.businessName || poster.name,
        role: job.postedByRole,
        kind: poster.employerProfile?.kind,
        verified: poster.verified,
        avatarColor: poster.avatarColor,
      }
      : null,
    similar: JOBS.filter((j) => j.id !== job.id && j.trade === job.trade && j.status === 'open').slice(0, 3),
  };
}

export const JobService = {
  // --- dashboard / internal (mock) ---
  async list() { return respond(JOBS); },
  async listOpen() { return respond(JOBS.filter((j) => j.status === 'open')); },
  async byPoster(userId) { return respond(JOBS.filter((j) => j.postedById === userId)); },
  async create(job) { return respond({ id: `JOB-${Math.floor(2300 + Math.random() * 99)}`, status: 'open', ...job }); },

  // --- public read (API or mock) ---
  async get(id) {
    if (USE_API) {
      const dto = await getOrNull(`/jobs/${encodeURIComponent(id)}`);
      return dto ? mapJobDetail(dto) : null;
    }
    const job = JOBS.find((j) => j.id === id);
    return respond(job ? enrichMockJob(job) : null);
  },

  /** @param {import('@/types/models').SearchFilters} filters */
  async search(filters = {}) {
    if (USE_API) {
      const data = await request('/jobs', {
        params: { q: filters.q, trade: filters.trade, city: filters.city, pageSize: 100 },
      });
      return data.items.map(mapJobSummary);
    }
    const open = JOBS.filter((j) => j.status === 'open');
    return respond(applyFilters(open, filters));
  },
};
