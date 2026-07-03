import { respond, fail } from './http';
import { APPLICATIONS } from '@/data/applications';
import { JOBS } from '@/data/jobs';
import { USERS } from '@/data/users';

function now() { return new Date().toISOString(); }

function nextId() {
  return `APP-${Math.floor(6000 + Math.random() * 999)}`;
}

// The generic, role-agnostic application actions (apply/withdraw/find) are
// called directly by any page that needs them — public Job Detail and the
// worker's Browse Jobs dashboard both apply the same way, so there's one
// implementation instead of two. The role-scoped *list* views (a poster's
// applicants, a worker's own applications) stay behind EmployerService /
// ContractorService / WorkerService, which call forPoster()/forApplicant()
// internally — pages keep using their role's service, per the existing
// service-boundary convention.
export const ApplicationService = {
  /** Create a new application, or reactivate a withdrawn one. Idempotent for an existing pending/accepted/rejected application. */
  async apply({ jobId, applicantId }) {
    const job = JOBS.find((j) => j.id === jobId);
    if (!job || job.status !== 'open') return fail('This job is no longer open.');

    const existing = APPLICATIONS.find((a) => a.jobId === jobId && a.applicantId === applicantId);
    if (existing) {
      if (existing.status === 'withdrawn') {
        existing.status = 'pending';
        existing.appliedAt = now();
        existing.updatedAt = now();
        delete existing.decidedAt;
      }
      // pending/accepted/rejected: already has a live or decided application — return it as-is, no duplicate.
      return respond({ ...existing });
    }

    const created = { id: nextId(), jobId, applicantId, status: 'pending', appliedAt: now(), updatedAt: now() };
    APPLICATIONS.push(created);
    return respond({ ...created });
  },

  /** Worker withdraws their own application. Only valid while pending. */
  async withdraw(applicationId) {
    const app = APPLICATIONS.find((a) => a.id === applicationId);
    if (!app || app.status !== 'pending') return fail('This application can no longer be withdrawn.');
    app.status = 'withdrawn';
    app.updatedAt = now();
    return respond({ ...app });
  },

  /** Poster accepts or rejects an applicant. Only valid while pending. */
  async decide(applicationId, decision) {
    const app = APPLICATIONS.find((a) => a.id === applicationId);
    if (!app || app.status !== 'pending') return fail('This application has already been decided.');
    app.status = decision;
    app.decidedAt = now();
    app.updatedAt = now();
    return respond({ ...app });
  },

  /** The current user's application to a specific job, or null — powers the Job Detail CTA state. */
  async find({ jobId, applicantId }) {
    const app = APPLICATIONS.find((a) => a.jobId === jobId && a.applicantId === applicantId);
    return respond(app ? { ...app } : null);
  },

  /** A worker's own applications, enriched with job details for display. */
  async forApplicant(applicantId) {
    const enriched = APPLICATIONS.filter((a) => a.applicantId === applicantId).map((a) => {
      const job = JOBS.find((j) => j.id === a.jobId);
      return { ...a, jobTitle: job?.title ?? a.jobId, trade: job?.trade, wage: job?.wage };
    });
    return respond(enriched);
  },

  /**
   * Applications to jobs a specific poster posted, under a specific role —
   * a multi-role account (e.g. Apex, who posts as both contractor and
   * employer) must only see applicants for the persona being viewed, same
   * reasoning as EmployerDetail's open-jobs count.
   */
  async forPoster(posterId, posterRole) {
    const posterJobIds = new Set(
      JOBS.filter((j) => j.postedById === posterId && j.postedByRole === posterRole).map((j) => j.id),
    );
    const enriched = APPLICATIONS.filter((a) => posterJobIds.has(a.jobId)).map((a) => {
      const applicant = USERS.find((u) => u.id === a.applicantId);
      const job = JOBS.find((j) => j.id === a.jobId);
      return {
        ...a,
        applicantName: applicant?.name ?? a.applicantId,
        trade: applicant?.workerProfile?.trade,
        rating: applicant?.workerProfile?.rating,
        jobTitle: job?.title,
        jobId: a.jobId,
      };
    });
    return respond(enriched);
  },
};
