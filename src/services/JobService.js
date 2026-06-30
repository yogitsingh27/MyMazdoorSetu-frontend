import { respond } from './http';
import { JOBS } from '@/data/jobs';

export const JobService = {
  async list() { return respond(JOBS); },
  async listOpen() { return respond(JOBS.filter((j) => j.status === 'open')); },
  async byPoster(userId) { return respond(JOBS.filter((j) => j.postedById === userId)); },
  async get(id) { return respond(JOBS.find((j) => j.id === id) ?? null); },
  async create(job) { return respond({ id: `JOB-${Math.floor(2300 + Math.random() * 99)}`, status: 'open', ...job }); },
};
