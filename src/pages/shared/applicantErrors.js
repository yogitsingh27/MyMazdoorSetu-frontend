// Maps a backend ProblemDetails `code` (from an accept/reject call) to a
// message. The Employer and Contractor applicant pages are English-only by
// existing convention, so these are hardcoded English strings shared by both.
const DECIDE_ERRORS = {
  'application.not_pending': 'This application was already decided.',
  'application.job_completed': 'This job is completed; applications can no longer be decided.',
  'application.forbidden': 'You can only manage applications for your own jobs.',
  'application.not_found': 'This application no longer exists.',
};

export const decideErrorMessage = (err) =>
  DECIDE_ERRORS[err?.code] || 'Could not update the application. Please try again.';
