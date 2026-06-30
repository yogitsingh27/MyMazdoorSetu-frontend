import { respond } from './http';
import { USERS } from '@/data/users';
import { JOBS } from '@/data/jobs';
import { GRIEVANCES } from '@/data/companies';
import { roleLabel } from '@/types/roles';

export const AdminService = {
  async users() {
    return respond(
      USERS.filter((u) => !u.roles.includes('admin')).map((u) => ({
        name: u.name,
        types: u.roles.map(roleLabel).join(', '),
        city: u.city,
        status: u.verified ? 'active' : 'pending',
      })),
    );
  },
  async jobs() { return respond(JOBS); },
  async complaints() { return respond(GRIEVANCES); },
  async verificationQueue() {
    return respond(USERS.filter((u) => !u.verified).map((u) => ({ name: u.name, types: u.roles.map(roleLabel).join(', '), submitted: 'today' })));
  },
  async summary() {
    return respond({ users: 1204, activeJobs: 389, complaints: 18, pendingVerification: 6 });
  },
  async activityLogs() { return respond([]); }, // empty -> exercises the empty state
};
