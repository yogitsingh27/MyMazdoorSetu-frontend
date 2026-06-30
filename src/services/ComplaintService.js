import { respond } from './http';
import { GRIEVANCES } from '@/data/companies';

export const ComplaintService = {
  async list() { return respond(GRIEVANCES); },
  async submit(complaint) { return respond({ id: `GRV-${Math.floor(500 + Math.random() * 499)}`, status: 'open', date: 'today', ...complaint }); },
  async updateStatus(id, status) { return respond({ id, status }); },
};
