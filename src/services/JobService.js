import { respond } from './http';
import { JOBS } from '@/data/jobs';

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

export const JobService = {
  async list() { return respond(JOBS); },
  async listOpen() { return respond(JOBS.filter((j) => j.status === 'open')); },
  async byPoster(userId) { return respond(JOBS.filter((j) => j.postedById === userId)); },
  async get(id) { return respond(JOBS.find((j) => j.id === id) ?? null); },
  async create(job) { return respond({ id: `JOB-${Math.floor(2300 + Math.random() * 99)}`, status: 'open', ...job }); },

  /** @param {import('@/types/models').SearchFilters} filters */
  async search(filters = {}) {
    const open = JOBS.filter((j) => j.status === 'open');
    return respond(applyFilters(open, filters));
  },
};
