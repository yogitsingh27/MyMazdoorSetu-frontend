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
 * @typedef {Object} Application
 * @property {string} id
 * @property {string} jobId
 * @property {string} applicantId
 * @property {'pending'|'active'|'closed'} status
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} workerId       Which worker's public profile this review appears on.
 * @property {string} by             Display name of the reviewer (a contractor or employer).
 * @property {string} role
 * @property {string=} job           Job ID this review is tied to, if any.
 * @property {boolean} verified      True when linked to a completed job — shown as "reviewed after completed work".
 * @property {number} overall
 * @property {Object.<string, number>} cats
 * @property {string} comment
 * @property {string} date
 */

export {}; // keep this a module
