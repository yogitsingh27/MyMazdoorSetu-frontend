import { ROLE } from '@/types/roles';
import { WorkerService } from '@/services/WorkerService';
import { ContractorService } from '@/services/ContractorService';
import { EmployerService } from '@/services/EmployerService';
import { AgentService } from '@/services/AgentService';
import { AdminService } from '@/services/AdminService';

// Each role's homepage cards, expressed as [valueKey, label, deltaKey?]
// against whatever object `summary()` resolves to. DashboardHome.jsx is the
// single component that renders these for every role.
export const HOME_CARDS = {
  [ROLE.WORKER]: [
    ['todaysJob', "Today's job"],
    ['applied', 'Jobs applied'],
    ['earnedThisMonth', 'Earnings'],
    ['rating', 'Rating'],
  ],
  [ROLE.CONTRACTOR]: [
    ['activeJobs', 'Active jobs'],
    ['workersManaged', 'Workers managed'],
    ['newApplicants', 'New applicants'],
    ['pendingPayments', 'Pending payments'],
  ],
  [ROLE.EMPLOYER]: [
    ['activeJobs', 'Active jobs'],
    ['workersHired', 'Workers hired'],
    ['applicationsReceived', 'Applications received'],
    ['hiringSpend', 'Hiring spend'],
  ],
  [ROLE.AGENT]: [
    ['registrations', 'Registrations'],
    ['monthlyCommission', 'Monthly commission'],
    ['pendingCommission', 'Pending commission'],
  ],
  [ROLE.ADMIN]: [
    ['users', 'Users'],
    ['activeJobs', 'Active jobs'],
    ['complaints', 'Complaints'],
    ['pendingVerification', 'Pending verification'],
  ],
};

// Which service's summary() backs each role's homepage cards.
export const SUMMARY_SERVICE = {
  [ROLE.WORKER]: () => WorkerService.summary(),
  [ROLE.CONTRACTOR]: () => ContractorService.summary(),
  [ROLE.EMPLOYER]: () => EmployerService.summary(),
  [ROLE.AGENT]: () => AgentService.summary(),
  [ROLE.ADMIN]: () => AdminService.summary(),
};

export const PAGE_TITLES = {
  overview: ['Dashboard', 'A quick look at what needs your attention.'],
  browse: ['Nearby jobs', 'Jobs matching your trade, closest first.'],
  applications: ['Applications', 'Track what you applied to and what came in.'],
  post: ['Post a job', 'Describe the work — workers matching the trade will see it.'],
  jobs: ['My jobs', 'Jobs you posted or are running.'],
  myjobs: ['My jobs', 'Jobs you have posted.'],
  applicants: ['Applicants', 'Review and respond to people who applied.'],
  workers: ['Managed workers', 'People working under your contracts.'],
  search: ['Find workers', 'Search by trade, rating, and availability.'],
  saved: ['Saved workers', 'Workers you bookmarked for future jobs.'],
  payments: ['Payments', 'Track what is owed and what has been paid.'],
  registered: ['Workers registered', 'People you registered onto the platform.'],
  contractors: ['Contractors registered', 'Contractors you registered onto the platform.'],
  commission: ['Commission', 'Your earnings from registrations and postings.'],
  messages: ['Messages', 'Conversations with workers, hirers, and agents.'],
  grievance: ['Grievance', 'Raise or track a complaint.'],
  verification: ['Verification queue', 'Accounts waiting on ID verification.'],
  users: ['Users', 'Everyone registered on the platform.'],
  logs: ['Activity logs', 'System-wide event stream across users, jobs, and payouts.'],
  profile: ['Profile', ''],
};
