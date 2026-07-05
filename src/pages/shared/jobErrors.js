// Maps a backend ProblemDetails `code` (from create/close/complete) to a
// message. The employer/contractor job pages and PostJobModal are English-only
// by existing convention, so these are hardcoded English strings shared by both.
const JOB_ERRORS = {
  'request.invalid': 'Please check the job details and try again.',
  'job.invalid_transition': 'This job can no longer change to that state.',
  'job.forbidden': 'You can only manage your own jobs.',
  'job.not_found': 'This job no longer exists.',
};

export const jobErrorMessage = (err) =>
  JOB_ERRORS[err?.code] || 'Something went wrong. Please try again.';
