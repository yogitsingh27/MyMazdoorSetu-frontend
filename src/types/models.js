// Domain models expressed as JSDoc typedefs.
// These document the exact shape the future ASP.NET Core API should return,
// so the frontend contract is fixed before the backend exists.

/**
 * @typedef {'worker'|'contractor'|'employer'|'agent'|'admin'} Role
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} phone
 * @property {string} city
 * @property {Role[]} roles            One account can hold several roles.
 * @property {boolean} verified        Govt-ID verification status.
 * @property {string[]} languages
 * @property {string} avatarColor
 * @property {WorkerProfile=} workerProfile
 * @property {ContractorProfile=} contractorProfile
 * @property {EmployerProfile=} employerProfile
 * @property {AgentProfile=} agentProfile
 */

/**
 * @typedef {Object} WorkerProfile
 * @property {string} trade           Mason, Electrician, Painter...
 * @property {string[]} skills
 * @property {number} experienceYears
 * @property {'available'|'booked'} availability
 * @property {string[]} portfolio
 * @property {number} rating
 * @property {number} jobsDone
 */

/**
 * @typedef {Object} ContractorProfile
 * @property {string} businessName
 * @property {number} managedWorkers
 * @property {boolean} businessVerified
 * @property {number} rating
 */

/**
 * @typedef {Object} EmployerProfile
 * @property {string} orgName
 * @property {'homeowner'|'builder'|'company'|'society'|'factory'|'hotel'|'shop'} kind
 * @property {number} jobsPosted
 * @property {number} rating
 * @property {string=} tagline   Short, factual one-line context (e.g. "Family home renovation in Dwarka") — not a marketing bio.
 */

/**
 * @typedef {Object} AgentProfile
 * @property {string} coverageArea
 * @property {number} registrations
 */

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} title
 * @property {string} trade
 * @property {string} wage
 * @property {string} location
 * @property {string} duration
 * @property {string[]} tags              Amenities the poster offers (meals, tools, etc.) — distinct from requirements.
 * @property {string} postedById
 * @property {Role} postedByRole
 * @property {number} posterRating
 * @property {number} posterReviews
 * @property {'open'|'active'|'completed'|'closed'} status
 * @property {string} description         Full job description, shown on the job detail page.
 * @property {string[]} requirements      What the worker needs to have/do — distinct from tags.
 * @property {string} postedAt            ISO date string.
 * @property {number} openings            How many workers are being hired for this listing.
 */

/**
 * @typedef {Object} SearchFilters
 * Passed to JobService.search() / WorkerService.search(). Every field is
 * optional; an unset field means "don't filter on this." The predicate for
 * each key lives in a small registry inside each service — adding a new
 * filter (experienceMin, wageMin/wageMax once wage is structured, ...)
 * means adding one predicate there, not changing this shape or the callers.
 * @property {string=} q               Free-text search.
 * @property {string=} trade
 * @property {string=} city
 * @property {'available'|'booked'=} availability   Workers only.
 * @property {boolean=} verifiedOnly                Workers only.
 */

/**
 * @typedef {Object} Application
 * Deliberately lean — a real API would return this shape from the Applications
 * table, then join Job/User details at read time rather than storing them
 * denormalized here. See ApplicationService for where that join happens.
 * @property {string} id
 * @property {string} jobId
 * @property {string} applicantId
 * @property {'pending'|'accepted'|'rejected'|'withdrawn'} status
 * @property {string} appliedAt    ISO date string — when this application was (most recently) submitted; reset if withdrawn then re-applied.
 * @property {string=} decidedAt   ISO date string — set when status moves to accepted/rejected.
 * @property {string} updatedAt    ISO date string — bumped on every status transition (apply, withdraw, decide, re-apply).
 */

/**
 * @typedef {Object} Intent
 * What an unauthenticated visitor was trying to do, preserved through
 * login/registration. See services/IntentService.js and config/intents.js.
 * @property {string} type          e.g. 'APPLY_JOB', 'CONTACT_WORKER' — looked up in config/intents.js.
 * @property {Object} payload       Opaque to everything except that type's resolver, e.g. { jobId }.
 * @property {Role} preselectRole   Which role to pre-tick on the registration form.
 * @property {number} version       For future migration if the shape changes.
 * @property {string} source        Pathname the intent was captured from — debugging/analytics only.
 * @property {number} createdAt     Epoch ms — used to discard stale, abandoned intents.
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string=} workerId      Which worker's public profile this review appears on (REVIEWS_FOR_WORKER only).
 * @property {string=} hirerId       Which employer/contractor's public profile this review appears on (REVIEWS_FOR_HIRER only).
 * @property {string} by             Display name of the reviewer (a worker, contractor, or employer).
 * @property {string} role
 * @property {string=} job           Job ID this review is tied to, if any.
 * @property {boolean} verified      True when linked to a completed job — shown as "reviewed after completed work".
 * @property {number} overall
 * @property {Object.<string, number>} cats
 * @property {string} comment
 * @property {string} date
 */

export {}; // keep this a module
