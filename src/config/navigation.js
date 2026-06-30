import { ROLE } from '@/types/roles';

// Each entry: [pageKey, iconName, label]. This is the ONLY place sidebar
// links are defined — Sidebar.jsx just renders whatever array it's given.
export const NAV_LINKS = {
  [ROLE.WORKER]: [
    ['overview', 'chart', 'Dashboard'],
    ['browse', 'briefcase', 'Nearby jobs'],
    ['applications', 'file', 'My applications'],
    ['messages', 'message', 'Messages'],
    ['grievance', 'shield', 'Grievance'],
    ['profile', 'user', 'Profile'],
  ],
  [ROLE.CONTRACTOR]: [
    ['overview', 'chart', 'Dashboard'],
    ['post', 'plus', 'Post a job'],
    ['jobs', 'briefcase', 'My jobs'],
    ['applicants', 'check', 'Applicants'],
    ['workers', 'users', 'Managed workers'],
    ['payments', 'card', 'Payments'],
    ['messages', 'message', 'Messages'],
    ['grievance', 'shield', 'Grievance'],
    ['profile', 'user', 'Profile'],
  ],
  [ROLE.EMPLOYER]: [
    ['overview', 'chart', 'Dashboard'],
    ['post', 'plus', 'Post a job'],
    ['search', 'users', 'Find workers'],
    ['myjobs', 'briefcase', 'My jobs'],
    ['applications', 'file', 'Applications'],
    ['saved', 'bookmark', 'Saved workers'],
    ['payments', 'card', 'Payments'],
    ['messages', 'message', 'Messages'],
    ['grievance', 'shield', 'Grievance'],
    ['profile', 'user', 'Profile'],
  ],
  [ROLE.AGENT]: [
    ['overview', 'chart', 'Dashboard'],
    ['registered', 'users', 'Workers registered'],
    ['contractors', 'briefcase', 'Contractors registered'],
    ['applications', 'file', 'Applications'],
    ['commission', 'rupee', 'Commission'],
    ['messages', 'message', 'Messages'],
    ['profile', 'user', 'Profile'],
  ],
  [ROLE.ADMIN]: [
    ['overview', 'chart', 'Dashboard'],
    ['users', 'users', 'Users'],
    ['jobs', 'briefcase', 'Jobs'],
    ['grievance', 'shield', 'Complaints'],
    ['verification', 'check', 'Verification queue'],
    ['logs', 'file', 'Activity logs'],
  ],
};

// First page to land on after picking/switching into a role.
export const DEFAULT_PAGE = {
  [ROLE.WORKER]: 'overview',
  [ROLE.CONTRACTOR]: 'overview',
  [ROLE.EMPLOYER]: 'overview',
  [ROLE.AGENT]: 'overview',
  [ROLE.ADMIN]: 'overview',
};
