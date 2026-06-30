// Contractor projects.
export const PROJECTS = [
  { id: 'PRJ-12', name: 'Residential tower — Noida 62', workers: 18, status: 'active', progress: 0.6 },
  { id: 'PRJ-09', name: 'Shop complex rewiring — Karol Bagh', workers: 4, status: 'active', progress: 0.3 },
  { id: 'PRJ-04', name: 'Villa interiors — Gurugram', workers: 9, status: 'completed', progress: 1 },
];

// Managed workers under a contractor.
export const MANAGED_WORKERS = [
  { name: 'Ramesh Kumar', trade: 'Mason', phone: '98200-12233', contactDirect: true, jobs: 14, viaAgent: false, available: true, verified: true, rating: 4.6 },
  { name: 'Suresh Yadav', trade: 'Plumber', phone: '97700-88421', contactDirect: false, jobs: 8, viaAgent: true, available: false, verified: true, rating: 4.2 },
  { name: 'Anita Devi', trade: 'Painter', phone: '96400-44120', contactDirect: true, jobs: 21, viaAgent: false, available: true, verified: true, rating: 4.9 },
  { name: 'Vikram Singh', trade: 'Electrician', phone: '99100-30912', contactDirect: false, jobs: 5, viaAgent: false, available: false, verified: false, rating: 3.8 },
];

export const GRIEVANCES = [
  { id: 'GRV-0512', type: 'Payment', desc: 'Wages not paid for 3 days work at site JOB-2210', status: 'review', date: '24 Jun' },
  { id: 'GRV-0498', type: 'Abuse', desc: 'Verbal misconduct by site supervisor', status: 'resolved', date: '18 Jun' },
  { id: 'GRV-0505', type: 'Fraud', desc: 'Fake job posting collected registration fee', status: 'open', date: '21 Jun' },
];

export const COMMISSION_ROWS = [
  { date: '24 Jun', user: 'Suresh Yadav', job: 'JOB-2180', type: 'Job completed', amount: 200, status: 'paid' },
  { date: '19 Jun', user: 'Apex Builders', job: 'JOB-2204', type: 'Job posted', amount: 150, status: 'paid' },
  { date: '12 Jun', user: 'Suresh Yadav', job: 'JOB-2099', type: 'Job completed', amount: 200, status: 'paid' },
  { date: '5 Jun', user: 'Apex Builders', job: 'JOB-2155', type: 'Job posted', amount: 150, status: 'pending' },
];

export const TRADES = ['Mason', 'Painter', 'Electrician', 'Plumber', 'Carpenter', 'Supervisor', 'Welder', 'Helper'];
