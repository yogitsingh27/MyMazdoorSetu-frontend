import { respond } from './http';
import { COMMISSION_ROWS, MANAGED_WORKERS } from '@/data/companies';

export const AgentService = {
  async registeredWorkers() { return respond(MANAGED_WORKERS); },
  async registeredContractors() {
    return respond([
      { name: 'Apex Builders', type: 'Contractor', joined: '19 Apr', activity: '4 jobs posted', commission: '₹2,600' },
      { name: 'Kumar Works', type: 'Contractor', joined: '3 May', activity: '2 jobs posted', commission: '₹900' },
    ]);
  },
  async commission() {
    const total = COMMISSION_ROWS.reduce((a, r) => a + r.amount, 0);
    const pending = COMMISSION_ROWS.filter((r) => r.status === 'pending').reduce((a, r) => a + r.amount, 0);
    return respond({ rows: COMMISSION_ROWS, total, paid: total - pending, pending });
  },
  async summary() {
    return respond({ registrations: 22, monthlyCommission: '₹4,200', pendingCommission: '₹150' });
  },
};
