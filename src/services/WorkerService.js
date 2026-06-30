import { respond } from './http';
import { JOBS } from '@/data/jobs';
import { MY_APPLICATIONS } from '@/data/applications';
import { REVIEWS_FOR_WORKER } from '@/data/reviews';

export const WorkerService = {
  async nearbyJobs() { return respond(JOBS.filter((j) => j.status === 'open')); },
  async myApplications() { return respond(MY_APPLICATIONS); },
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
};
