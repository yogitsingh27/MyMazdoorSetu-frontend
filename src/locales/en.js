// English — the source of truth. Every key here should exist; other
// dictionaries fall back to this one for anything they haven't translated.
export default {
  common: {
    logIn: 'Log in',
    register: 'Register',
    wage: 'Wage',
    apply: 'Apply',
  },

  nav: {
    browseJobs: 'Browse jobs',
    howItWorks: 'How it works',
    logout: 'Logout',
  },

  search: {
    jobsHeading: 'Open jobs',
    workersHeading: 'Verified workers on MyMazdoorSetu',
    workersDesc: 'Masons, electricians, painters, plumbers, and more — verified and rated from real jobs across Delhi NCR.',
    jobsPlaceholder: 'Search by trade, location, or keyword',
    workersPlaceholder: 'Search by name, trade, skill, or location',
    availableNow: 'Available now',
    verifiedOnly: 'Verified only',
    clearFilters: 'Clear filters',
    resultsCountOne: '{{count}} result',
    resultsCountOther: '{{count}} results',
    noResultsTitle: 'No matches for these filters',
    noResultsHint: 'Try a different trade or city, or clear your filters to see everything.',
    noJobsTitle: 'No open jobs right now',
    noJobsHint: 'Check back soon, or register to get notified when matching work is posted.',
    noWorkersTitle: 'No verified workers yet',
    noWorkersHint: 'Check back soon as more workers join and get verified.',
    wantToContact: 'Want to contact or hire a worker directly?',
  },

  footer: {
    tagline: "Connecting workers, contractors, and builders across Delhi NCR's construction industry — registered, verified, and dispute-free.",
    registerAs: 'Register as',
    platform: 'Platform',
    trust: 'Trust',
    browseWorkers: 'Browse workers',
    constructionProjects: 'Construction projects',
    verification: 'Aadhaar / Voter ID / PAN verification',
    grievanceSupport: 'Grievance support',
    launchingSoon: 'Delhi NCR — launching soon',
    copyright: '© {{year}} MyMazdoorSetu',
    builtFor: "Built for India's construction workforce",
  },

  roles: {
    worker: { label: 'Worker', short: 'Worker', tagline: 'Find work near you.' },
    contractor: { label: 'Contractor (ThekeDar)', short: 'Contractor', tagline: 'Manage workers and projects.' },
    employer: { label: 'Employer', short: 'Employer', tagline: 'Hire workers directly.' },
    agent: { label: 'Agent', short: 'Agent', tagline: 'Register and manage workers.' },
  },

  jobDetail: {
    backToJobs: 'Back to jobs',
    applyNow: 'Apply Now',
    applied: 'Application submitted.',
    withdraw: 'Withdraw Application',
    withdrawn: 'Application withdrawn.',
    shareJob: 'Share job',
    linkCopied: 'Link copied to clipboard',
    verified: 'Verified',
    hiringWorkersOne: 'Hiring {{count}} Worker',
    hiringWorkersOther: 'Hiring {{count}} Workers',
    description: 'Description',
    requirements: 'Requirements',
    facilities: 'Facilities',
    postedToday: 'Posted today',
    postedYesterday: 'Posted yesterday',
    postedDaysAgo: 'Posted {{days}} days ago',
    similarJobs: 'Similar jobs',
    wantToApply: 'Want to apply for this job?',
    notFound: "This job isn't available anymore",
    notFoundHint: 'It may have been filled or removed. Browse other open jobs instead.',
    status: {
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Not Selected',
      withdrawn: 'Withdrawn',
      open: 'Open',
      active: 'Active',
      completed: 'Completed',
      closed: 'Closed',
    },
  },

  intent: {
    resumedApplyJob: "You're logged in — go ahead and apply.",
    resumedContactWorker: "You're logged in — go ahead and contact this worker.",
    alreadyLoggedInApply: "You're logged in — you can apply from your dashboard.",
    alreadyLoggedInContact: "You're logged in — you can contact workers from your dashboard.",
  },

  workerDetail: {
    backToWorkers: 'Back to workers',
    contactWorker: 'Contact Worker',
    completedJobs: 'Completed Jobs',
    yearsExperience: 'Years Experience',
    portfolio: 'Portfolio',
    reviews: 'Reviews',
    languages: 'Languages',
    similarWorkers: 'Similar workers',
    reviewedAfterJob: 'Reviewed after completed work',
    wantToContact: 'Want to contact this worker?',
    available: 'Available',
    booked: 'Booked',
    notFound: "This worker profile isn't available",
    notFoundHint: 'They may no longer be active on the platform. Browse other verified workers instead.',
  },

  employerDetail: {
    back: 'Back',
    trustHeading: 'How workers rate this employer',
    noReviewsYet: 'No reviews yet.',
    jobsPosted: 'Jobs Posted',
    currentlyHiring: 'Currently Hiring',
    notHiring: 'Not Currently Hiring',
    viewOpenJobs: 'View Open Jobs',
    openJobs: 'Open Jobs',
    noOpenJobs: 'No open jobs right now',
    noOpenJobsHint: "This employer isn't hiring at the moment. Browse other open jobs instead.",
    reviews: 'Reviews',
    wantToApply: 'Want to apply for a job with this employer?',
    notFound: "This employer profile isn't available",
    notFoundHint: 'They may no longer be active on the platform. Browse open jobs instead.',
  },

  landing: {
    audiences: {
      worker: {
        headingPre: 'Find verified work,',
        headingAccent: 'near you.',
        description: 'See the wage, duration, and trade on every job before you say yes — then get verified once and carry that record to every job after.',
        ctaLabel: 'Find Work',
        secondaryLabel: 'See how it works',
      },
      contractor: {
        headingPre: 'Run your crew,',
        headingAccent: 'win more sites.',
        description: 'Keep your workers, your projects, and your reputation in one place — and get matched to builders who need a contractor they can trust.',
        ctaLabel: 'Register as a Contractor',
        secondaryLabel: 'See how it works',
      },
      employer: {
        headingPre: 'Hire verified workers,',
        headingAccent: 'directly.',
        description: 'Post what you need — mason, electrician, painter — and review verified profiles with real ratings, not just a number someone passed along.',
        ctaLabel: 'Post a Job',
        secondaryLabel: 'Browse Workers',
      },
      agent: {
        headingPre: 'Register workers,',
        headingAccent: 'build your network.',
        description: 'Help workers who need a hand getting online, keep them verified, and stay their point of contact for every job that follows.',
        ctaLabel: 'Register as an Agent',
        secondaryLabel: 'See how it works',
      },
    },

    howItWorks: {
      worker: [
        { title: 'Register', desc: 'Add your trade, skills, and years of experience' },
        { title: 'Get verified', desc: 'Confirm identity with Aadhaar, Voter ID, or PAN' },
        { title: 'Find a match', desc: 'Browse nearby jobs that fit your trade and rate' },
        { title: 'Work & get rated', desc: 'Build a verified record that travels with you' },
      ],
      contractor: [
        { title: 'Register your business', desc: 'Add your team and the trades you cover' },
        { title: 'Get verified', desc: 'Confirm your business and identity documents' },
        { title: 'Manage your crew', desc: 'Track workers and projects in one dashboard' },
        { title: 'Win more work', desc: 'Get matched to builders who need a trusted contractor' },
      ],
      employer: [
        { title: 'Post a job', desc: 'Describe the work, trade, wage, and duration' },
        { title: 'Review profiles', desc: 'See verified workers and contractors, with ratings' },
        { title: 'Hire directly', desc: 'Message and confirm — no informal broker needed' },
        { title: 'Rate & repeat', desc: 'Build a trusted list of workers you can call again' },
      ],
      agent: [
        { title: 'Register', desc: 'Set up your details and coverage area' },
        { title: 'Onboard workers', desc: 'Help workers register and complete verification' },
        { title: 'Stay connected', desc: 'Track every worker and job in your network' },
        { title: 'Get recognized', desc: 'Every registration and placement is tied to your name' },
      ],
    },

    sections: {
      why: 'Why MyMazdoorSetu',
      howItWorksFor: {
        worker: 'How it works for workers',
        contractor: 'How it works for contractors',
        employer: 'How it works for employers',
        agent: 'How it works for agents',
      },
      featuredWorkers: 'Featured verified workers',
      viewAllWorkers: 'View all workers',
      skilledLookingForWork: 'Skilled and looking for work near you?',
      latestJobs: 'Latest jobs',
      constructionProjectsHiring: 'Construction projects hiring now',
      viewProjects: 'View projects',
      digitalIdentityHeading: 'Your Digital Labour Identity',
      trustSafety: 'Trust & safety',
      faqHeading: 'Frequently asked questions',
      getStarted: 'Get started',
    },

    identity: {
      intro: 'Every verified worker on MyMazdoorSetu builds a single, portable identity that grows stronger with every job completed — instead of starting from zero at every new site.',
      learnMore: 'Learn More',
      learnMoreText: "As you complete more jobs, your rating, work history, and portfolio all grow with you. The plan is for this record to travel across every contractor and employer on MyMazdoorSetu — the way a bank record follows you between branches — so it doesn't reset just because you switched sites or contractors.",
    },

    why: {
      builtForIndia: {
        title: "Built for India's Construction Workforce",
        desc: 'Job posting, crew rosters, and grievances are built around how hiring for mason work, wiring, or painting actually happens on the ground — not adapted from a generic office job board.',
      },
      transparentHiring: {
        title: 'Transparent Hiring',
        desc: 'Wage, duration, and trade are visible on every job before anyone applies — no broker fees that surface later.',
      },
      launching: {
        title: 'Launching in Delhi NCR',
        desc: "We're onboarding our first verified workers, contractors, and employers in Delhi, Noida, Gurugram, and Ghaziabad. More cities follow once trust is built here first.",
      },
    },

    trustSafety: {
      secureVerification: {
        title: 'Secure Identity Verification',
        desc: 'Every worker, contractor, employer, and agent confirms identity with Aadhaar, Voter ID, or PAN before they can transact on the platform.',
      },
      grievanceSupport: {
        title: 'Grievance Support',
        desc: 'A dedicated grievance section on every dashboard for payment disputes, misconduct, or fraud — a documented place for it, not just a call to a supervisor.',
      },
      reviews: {
        title: 'Reviews From Real Jobs',
        desc: 'Both sides rate every completed job, so a reputation reflects actual site behaviour — not a one-sided account.',
      },
    },

    identityPillars: {
      verifiedIdentity: { title: 'Verified Identity', desc: 'Aadhaar, Voter ID, or PAN — confirmed once, trusted everywhere on the platform.' },
      skills: { title: 'Skills', desc: 'Trade and specific skills — plastering, wiring, interior painting — not just a job title.' },
      experience: { title: 'Experience', desc: 'Years in the trade, carried forward instead of re-explained at every new site.' },
      portfolio: { title: 'Portfolio', desc: 'Photos of real, completed work that speak for themselves.' },
      ratings: { title: 'Ratings', desc: 'Two-way reviews after every job, from the people who actually worked with you.' },
      workHistory: { title: 'Work History', desc: 'Every completed job — mason work in Dwarka, wiring in Karol Bagh — adds to a record you can show the next employer.' },
      availability: { title: 'Availability', desc: "A live 'available' or 'booked' status, so employers know who can actually start tomorrow." },
      growingReputation: { title: 'Growing Reputation', desc: 'This identity gets stronger with every job — the credential that gets a worker noticed by an employer who has never met them.' },
    },

    contractors: {
      heading: 'For Contractors (ThekeDar)',
      description: 'Run your crew and win more sites — manage workers, track projects, and get matched to builders looking for a contractor they can trust.',
      points: {
        manageCrew: { title: 'Manage your crew in one place', desc: 'Keep every worker you manage — mason, electrician, painter — in one roster with contact details and availability.' },
        seeProjects: { title: 'See your projects at a glance', desc: 'Track which sites are active, how many workers are on each, and what stage the work is at.' },
        getFound: { title: 'Get found by builders', desc: "Show up, verified and rated, when an employer is looking for a contractor they haven't worked with before." },
      },
    },

    employers: {
      heading: 'For Builders & Employers',
      description: 'Post a job, review verified profiles with real ratings and work history, and hire with confidence — no informal middlemen required.',
      points: {
        hireWithoutGuesswork: { title: 'Hire without guesswork', desc: 'Every profile shows verification status, trade, and real ratings before you decide — not just a phone number someone passed along.' },
        postOnce: { title: 'Post once, reach the right trade', desc: 'One job post reaches workers and contractors who actually do that trade in your area.' },
        grievanceProcess: { title: 'A grievance process if something goes wrong', desc: 'Payment disputes and site issues have a documented place to go, instead of a WhatsApp argument.' },
      },
    },

    agents: {
      heading: 'For Agents',
      description: 'Bring workers onto the platform, help them get verified, and stay connected to every job and contractor in your coverage area.',
      points: {
        bringWorkers: { title: 'Bring on workers who need a hand', desc: "Register workers who aren't comfortable filling out an app themselves, and help them get verified." },
        ownArea: { title: 'Own your coverage area', desc: 'Every worker and contractor you bring on stays visible to you in your area.' },
        getRecognized: { title: 'Get recognized for the work you put in', desc: 'Every registration and placement is tied to your name.' },
      },
    },

    faq: {
      items: [
        { q: 'Is MyMazdoorSetu free to use?', a: 'Registering, browsing jobs, and browsing workers is free. Any fee we introduce later will be shown upfront before you owe anything.' },
        { q: 'How is identity verified?', a: 'Workers, contractors, employers, and agents confirm identity with Aadhaar, Voter ID, or PAN as part of registering.' },
        { q: 'What if a job goes wrong?', a: 'Every dashboard has a Grievance section for payment disputes, misconduct, or fraud — a documented place for it, not just a call to a supervisor.' },
        { q: 'Which cities are you live in?', a: "We're starting in Delhi NCR — Delhi, Noida, Gurugram, and Ghaziabad — with more cities planned as we grow." },
        { q: 'Can one account hold multiple roles?', a: 'Yes. A worker who also runs a small contracting crew, for example, can hold both roles on one account and switch between them without logging out.' },
      ],
    },
  },
};
