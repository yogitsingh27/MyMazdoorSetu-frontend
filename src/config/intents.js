// The single extension point for the Intent Preservation system. Adding a
// new intent type (Save Job, Hire Worker, Book Service, ...) means adding
// one entry here — no other file needs to change.
//
// buildPath(payload)      -> where to send the user once the intent resolves.
// resumeMessageKey        -> translation key for the toast shown on arrival.
// requiredRole (optional) -> reserved for future use. If a later intent type
//   needs the user to be in a specific role before it can resolve (e.g. Hire
//   Worker really only makes sense as an Employer), set it here. IntentService
//   .resume() already has the shape to check this and defer to role selection
//   instead of resolving directly — today no intent type sets it, so every
//   intent resolves immediately, but adding one won't require touching the
//   auth pages or the resume logic itself.
export const INTENT_ROUTES = {
  APPLY_JOB: {
    buildPath: (payload) => `/jobs/${payload.jobId}`,
    resumeMessageKey: 'intent.resumedApplyJob',
  },
  CONTACT_WORKER: {
    buildPath: (payload) => `/workers/${payload.workerId}`,
    resumeMessageKey: 'intent.resumedContactWorker',
  },
};
