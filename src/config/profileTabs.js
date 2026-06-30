import { ROLE } from '@/types/roles';

// Tabs shown on each role's profile page. ProfileShell.jsx renders whichever
// set matches the active role — no role reuses another's profile.
export const PROFILE_TABS = {
  [ROLE.WORKER]: [
    ['details', 'Skills & experience'],
    ['portfolio', 'Portfolio'],
    ['availability', 'Availability'],
    ['languages', 'Languages'],
    ['reviews', 'Reviews'],
  ],
  [ROLE.CONTRACTOR]: [
    ['details', 'Business profile'],
    ['projects', 'Projects'],
    ['workers', 'Managed workers'],
    ['verification', 'Business verification'],
    ['reviews', 'Reviews'],
  ],
  [ROLE.EMPLOYER]: [
    ['details', 'Organization details'],
    ['history', 'Hiring history'],
    ['saved', 'Saved workers'],
    ['payments', 'Payments'],
    ['reviews', 'Reviews'],
  ],
  [ROLE.AGENT]: [
    ['details', 'Agent details'],
    ['registrations', 'Registrations'],
    ['coverage', 'Coverage area'],
    ['performance', 'Performance'],
  ],
  [ROLE.ADMIN]: [
    ['details', 'Account'],
    ['permissions', 'Permissions'],
    ['logs', 'System logs'],
    ['security', 'Security'],
  ],
};

export const DEFAULT_PROFILE_TAB = {
  [ROLE.WORKER]: 'details',
  [ROLE.CONTRACTOR]: 'details',
  [ROLE.EMPLOYER]: 'details',
  [ROLE.AGENT]: 'details',
  [ROLE.ADMIN]: 'details',
};
