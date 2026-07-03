// Single source of truth for applications — read and written by
// ApplicationService only. jobId/applicantId are the only identity this
// carries; applicant/job display details are joined in at read time
// (see ApplicationService.forApplicant / forPoster), the same way
// JobDetail/EmployerDetail already join USERS/JOBS rather than storing
// denormalized copies.
export const APPLICATIONS = [
  { id: 'APP-5001', jobId: 'JOB-2288', applicantId: 'u_irfan', status: 'pending', appliedAt: '2026-06-30', updatedAt: '2026-06-30' },
  { id: 'APP-5002', jobId: 'JOB-2291', applicantId: 'u_ritu', status: 'accepted', appliedAt: '2026-06-27', decidedAt: '2026-06-29', updatedAt: '2026-06-29' },
  { id: 'APP-5003', jobId: 'JOB-2299', applicantId: 'u_pooja', status: 'pending', appliedAt: '2026-06-27', updatedAt: '2026-06-27' },
  { id: 'APP-5004', jobId: 'JOB-2276', applicantId: 'u_kavita', status: 'rejected', appliedAt: '2026-06-26', decidedAt: '2026-06-28', updatedAt: '2026-06-28' },
  { id: 'APP-5005', jobId: 'JOB-2315', applicantId: 'u_faisal', status: 'withdrawn', appliedAt: '2026-06-25', updatedAt: '2026-06-27' },
  { id: 'APP-5006', jobId: 'JOB-2295', applicantId: 'u_sanjay', status: 'pending', appliedAt: '2026-06-28', updatedAt: '2026-06-28' },
  { id: 'APP-5007', jobId: 'JOB-2312', applicantId: 'u_ramesh', status: 'pending', appliedAt: '2026-06-24', updatedAt: '2026-06-24' },
];
