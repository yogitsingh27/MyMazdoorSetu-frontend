export const WORKER_RATING_CATS = ['Work quality', 'Punctuality', 'Communication', 'Safety compliance'];
export const HIRER_RATING_CATS = ['Payment reliability', 'Site safety', 'Communication', 'Fair treatment'];

// Reviews left for a worker (by contractors/employers).
// workerId ties a review to a specific worker's public profile — reviews
// without it would otherwise show identically on every worker's page.
export const REVIEWS_FOR_WORKER = [
  { id: 'r1', workerId: 'u_ramesh', by: 'Apex Builders', role: 'Contractor', job: 'JOB-2204', verified: true, overall: 5, cats: { 'Work quality': 5, Punctuality: 5, Communication: 4, 'Safety compliance': 5 }, comment: 'Solid plastering work, finished a day early and cleaned the site properly.', date: '12 Jun' },
  { id: 'r2', workerId: 'u_ramesh', by: 'Sharma Residence', role: 'Employer', job: 'JOB-2190', verified: true, overall: 4, cats: { 'Work quality': 4, Punctuality: 3, Communication: 4, 'Safety compliance': 4 }, comment: 'Good quality work, came late on two days but informed in advance.', date: '2 Jun' },
  { id: 'r3', workerId: 'u_ramesh', by: 'Anonymous employer', role: 'Employer', job: null, verified: false, overall: 5, cats: { 'Work quality': 5, Punctuality: 5, Communication: 5, 'Safety compliance': 5 }, comment: 'Excellent worker, highly recommend.', date: '28 May' },
  { id: 'r6', workerId: 'u_anita', by: 'Grand Crown Hotel', role: 'Employer', job: 'JOB-2276', verified: true, overall: 5, cats: { 'Work quality': 5, Punctuality: 5, Communication: 5, 'Safety compliance': 5 }, comment: 'Very neat painting work, covered furniture properly and finished on time.', date: '20 Jun' },
  { id: 'r7', workerId: 'u_suresh', by: 'Local homeowner', role: 'Employer', job: 'JOB-2150', verified: true, overall: 4, cats: { 'Work quality': 4, Punctuality: 4, Communication: 5, 'Safety compliance': 4 }, comment: 'Fixed a tricky leak quickly and explained the issue clearly. Fair pricing.', date: '8 Jun' },
];

// Reviews left for a hirer (contractor/employer) by workers.
export const REVIEWS_FOR_HIRER = [
  { id: 'r4', by: 'Suresh Yadav', role: 'Worker · Plumber', job: 'JOB-2180', verified: true, overall: 5, cats: { 'Payment reliability': 5, 'Site safety': 5, Communication: 5, 'Fair treatment': 5 }, comment: 'Paid the same day as promised, proper safety gear on site.', date: '15 Jun' },
  { id: 'r5', by: 'Vikram Singh', role: 'Worker · Electrician', job: 'JOB-2155', verified: true, overall: 3, cats: { 'Payment reliability': 3, 'Site safety': 4, Communication: 2, 'Fair treatment': 3 }, comment: 'Payment was 2 days late, otherwise site conditions were fine.', date: '30 May' },
];
