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
 * @property {string[]} tags
 * @property {string} postedById
 * @property {Role} postedByRole
 * @property {number} posterRating
 * @property {number} posterReviews
 * @property {'open'|'active'|'completed'|'closed'} status
 */

/**
 * @typedef {Object} Application
 * @property {string} id
 * @property {string} jobId
 * @property {string} applicantId
 * @property {'pending'|'active'|'closed'} status
 */

export {}; // keep this a module
