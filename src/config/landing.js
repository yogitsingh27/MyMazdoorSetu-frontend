import { ROLE } from '@/types/roles';

// Hero content per audience. ctaTarget/secondaryTarget are either a literal
// route ('/jobs', '/workers'), an in-page anchor ('#how-it-works'), or the
// sentinel 'register' (resolved to /register with the active role preselected).
export const AUDIENCE_CONTENT = {
  [ROLE.WORKER]: {
    headingPre: 'Find verified work,',
    headingAccent: 'near you.',
    description: 'See the wage, duration, and trade on every job before you say yes — then get verified once and carry that record to every job after.',
    ctaLabel: 'Find Work',
    ctaTarget: '/jobs',
    secondaryLabel: 'See how it works',
    secondaryTarget: '#how-it-works',
  },
  [ROLE.CONTRACTOR]: {
    headingPre: 'Run your crew,',
    headingAccent: 'win more sites.',
    description: 'Keep your workers, your projects, and your reputation in one place — and get matched to builders who need a contractor they can trust.',
    ctaLabel: 'Register as a Contractor',
    ctaTarget: 'register',
    secondaryLabel: 'See how it works',
    secondaryTarget: '#how-it-works',
  },
  [ROLE.EMPLOYER]: {
    headingPre: 'Hire verified workers,',
    headingAccent: 'directly.',
    description: "Post what you need — mason, electrician, painter — and review verified profiles with real ratings, not just a number someone passed along.",
    ctaLabel: 'Post a Job',
    ctaTarget: 'register',
    secondaryLabel: 'Browse Workers',
    secondaryTarget: '/workers',
  },
  [ROLE.AGENT]: {
    headingPre: 'Register workers,',
    headingAccent: 'build your network.',
    description: 'Help workers who need a hand getting online, keep them verified, and stay their point of contact for every job that follows.',
    ctaLabel: 'Register as an Agent',
    ctaTarget: 'register',
    secondaryLabel: 'See how it works',
    secondaryTarget: '#how-it-works',
  },
};

export const HOW_IT_WORKS_BY_ROLE = {
  [ROLE.WORKER]: [
    ['1', 'Register', 'Add your trade, skills, and years of experience'],
    ['2', 'Get verified', 'Confirm identity with Aadhaar, Voter ID, or PAN'],
    ['3', 'Find a match', 'Browse nearby jobs that fit your trade and rate'],
    ['4', 'Work & get rated', 'Build a verified record that travels with you'],
  ],
  [ROLE.CONTRACTOR]: [
    ['1', 'Register your business', 'Add your team and the trades you cover'],
    ['2', 'Get verified', 'Confirm your business and identity documents'],
    ['3', 'Manage your crew', 'Track workers and projects in one dashboard'],
    ['4', 'Win more work', 'Get matched to builders who need a trusted contractor'],
  ],
  [ROLE.EMPLOYER]: [
    ['1', 'Post a job', 'Describe the work, trade, wage, and duration'],
    ['2', 'Review profiles', 'See verified workers and contractors, with ratings'],
    ['3', 'Hire directly', 'Message and confirm — no informal broker needed'],
    ['4', 'Rate & repeat', 'Build a trusted list of workers you can call again'],
  ],
  [ROLE.AGENT]: [
    ['1', 'Register', 'Set up your details and coverage area'],
    ['2', 'Onboard workers', 'Help workers register and complete verification'],
    ['3', 'Stay connected', 'Track every worker and job in your network'],
    ['4', 'Get recognized', 'Every registration and placement is tied to your name'],
  ],
};

export const WHY_MMS_POINTS = [
  {
    icon: 'hammer',
    title: "Built for India's Construction Workforce",
    desc: 'Job posting, crew rosters, and grievances are built around how hiring for mason work, wiring, or painting actually happens on the ground — not adapted from a generic office job board.',
  },
  {
    icon: 'file',
    title: 'Transparent Hiring',
    desc: 'Wage, duration, and trade are visible on every job before anyone applies — no broker fees that surface later.',
  },
  {
    icon: 'map',
    title: 'Launching in Delhi NCR',
    desc: "We're onboarding our first verified workers, contractors, and employers in Delhi, Noida, Gurugram, and Ghaziabad. More cities follow once trust is built here first.",
  },
];

export const TRUST_SAFETY_POINTS = [
  {
    icon: 'shield',
    title: 'Secure Identity Verification',
    desc: 'Every worker, contractor, employer, and agent confirms identity with Aadhaar, Voter ID, or PAN before they can transact on the platform.',
  },
  {
    icon: 'message',
    title: 'Grievance Support',
    desc: 'A dedicated grievance section on every dashboard for payment disputes, misconduct, or fraud — a documented place for it, not just a phone call to a supervisor.',
  },
  {
    icon: 'star',
    title: 'Reviews From Real Jobs',
    desc: 'Both sides rate every completed job, so a reputation reflects actual site behaviour — not a one-sided account.',
  },
];

export const IDENTITY_PILLARS = [
  { icon: 'shield', title: 'Verified Identity', desc: 'Aadhaar, Voter ID, or PAN — confirmed once, trusted everywhere on the platform.' },
  { icon: 'hammer', title: 'Skills', desc: 'Trade and specific skills — plastering, wiring, interior painting — not just a job title.' },
  { icon: 'chart', title: 'Experience', desc: 'Years in the trade, carried forward instead of re-explained at every new site.' },
  { icon: 'bookmark', title: 'Portfolio', desc: 'Photos of real, completed work that speak for themselves.' },
  { icon: 'star', title: 'Ratings', desc: 'Two-way reviews after every job, from the people who actually worked with you.' },
  { icon: 'file', title: 'Work History', desc: 'Every completed job — mason work in Dwarka, wiring in Karol Bagh — adds to a record you can show the next employer.' },
  { icon: 'check', title: 'Availability', desc: "A live 'available' or 'booked' status, so employers know who can actually start tomorrow." },
  { icon: 'users', title: 'Growing Reputation', desc: 'This identity gets stronger with every job — the credential that gets a worker noticed by an employer who has never met them.' },
];

export const IDENTITY_LEARN_MORE = "As you complete more jobs, your rating, work history, and portfolio all grow with you. The plan is for this record to travel across every contractor and employer on MyMazdoorSetu — the way a bank record follows you between branches — so it doesn't reset just because you switched sites or contractors.";

export const CONTRACTOR_VALUE_POINTS = [
  { icon: 'users', title: 'Manage your crew in one place', desc: 'Keep every worker you manage — mason, electrician, painter — in one roster with contact details and availability.' },
  { icon: 'briefcase', title: 'See your projects at a glance', desc: 'Track which sites are active, how many workers are on each, and what stage the work is at.' },
  { icon: 'chart', title: 'Get found by builders', desc: "Show up, verified and rated, when an employer is looking for a contractor they haven't worked with before." },
];

export const EMPLOYER_VALUE_POINTS = [
  { icon: 'check', title: 'Hire without guesswork', desc: 'Every profile shows verification status, trade, and real ratings before you decide — not just a phone number someone passed along.' },
  { icon: 'file', title: 'Post once, reach the right trade', desc: 'One job post reaches workers and contractors who actually do that trade in your area.' },
  { icon: 'shield', title: 'A grievance process if something goes wrong', desc: 'Payment disputes and site issues have a documented place to go, instead of a WhatsApp argument.' },
];

export const AGENT_VALUE_POINTS = [
  { icon: 'users', title: 'Bring on workers who need a hand', desc: "Register workers who aren't comfortable filling out an app themselves, and help them get verified." },
  { icon: 'map', title: 'Own your coverage area', desc: 'Every worker and contractor you bring on stays visible to you in your area.' },
  { icon: 'rupee', title: 'Get recognized for the work you put in', desc: 'Every registration and placement is tied to your name.' },
];

export const LANDING_FAQS = [
  { q: 'Is MyMazdoorSetu free to use?', a: 'Registering, browsing jobs, and browsing workers is free. Any fee we introduce later will be shown upfront before you owe anything.' },
  { q: 'How is identity verified?', a: 'Workers, contractors, employers, and agents confirm identity with Aadhaar, Voter ID, or PAN as part of registering.' },
  { q: 'What if a job goes wrong?', a: 'Every dashboard has a Grievance section for payment disputes, misconduct, or fraud — a documented place for it, not just a call to a supervisor.' },
  { q: 'Which cities are you live in?', a: "We're starting in Delhi NCR — Delhi, Noida, Gurugram, and Ghaziabad — with more cities planned as we grow." },
  { q: 'Can one account hold multiple roles?', a: 'Yes. A worker who also runs a small contracting crew, for example, can hold both roles on one account and switch between them without logging out.' },
];
