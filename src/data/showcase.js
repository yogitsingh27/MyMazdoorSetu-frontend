import { USERS } from './users';

// All workers with a completed profile — used for the public Workers browse page.
export const ALL_WORKERS = USERS.filter((u) => u.workerProfile);

// Best-rated first, top 4 — used for landing-page showcases.
export const FEATURED_WORKERS = [...ALL_WORKERS]
  .sort((a, b) => (b.workerProfile.rating ?? 0) - (a.workerProfile.rating ?? 0))
  .slice(0, 4);
