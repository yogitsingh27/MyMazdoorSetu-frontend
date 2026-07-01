import { ROLE } from '@/types/roles';

// Structure and routing only — the actual copy lives in src/locales/*.js
// under the matching `landing.*` keys (e.g. landing.audiences.worker.ctaLabel).
// ctaTarget/secondaryTarget are either a literal route ('/jobs', '/workers'),
// an in-page anchor ('#how-it-works'), or the sentinel 'register' (resolved
// to /register with the active role preselected).
export const AUDIENCE_ROUTES = {
  [ROLE.WORKER]: { ctaTarget: '/jobs', secondaryTarget: '#how-it-works' },
  [ROLE.CONTRACTOR]: { ctaTarget: 'register', secondaryTarget: '#how-it-works' },
  [ROLE.EMPLOYER]: { ctaTarget: 'register', secondaryTarget: '/workers' },
  [ROLE.AGENT]: { ctaTarget: 'register', secondaryTarget: '#how-it-works' },
};

export const WHY_MMS_POINTS = [
  { icon: 'hammer', key: 'builtForIndia' },
  { icon: 'file', key: 'transparentHiring' },
  { icon: 'map', key: 'launching' },
];

export const TRUST_SAFETY_POINTS = [
  { icon: 'shield', key: 'secureVerification' },
  { icon: 'message', key: 'grievanceSupport' },
  { icon: 'star', key: 'reviews' },
];

export const IDENTITY_PILLARS = [
  { icon: 'shield', key: 'verifiedIdentity' },
  { icon: 'hammer', key: 'skills' },
  { icon: 'chart', key: 'experience' },
  { icon: 'bookmark', key: 'portfolio' },
  { icon: 'star', key: 'ratings' },
  { icon: 'file', key: 'workHistory' },
  { icon: 'check', key: 'availability' },
  { icon: 'users', key: 'growingReputation' },
];

export const CONTRACTOR_VALUE_POINTS = [
  { icon: 'users', key: 'manageCrew' },
  { icon: 'briefcase', key: 'seeProjects' },
  { icon: 'chart', key: 'getFound' },
];

export const EMPLOYER_VALUE_POINTS = [
  { icon: 'check', key: 'hireWithoutGuesswork' },
  { icon: 'file', key: 'postOnce' },
  { icon: 'shield', key: 'grievanceProcess' },
];

export const AGENT_VALUE_POINTS = [
  { icon: 'users', key: 'bringWorkers' },
  { icon: 'map', key: 'ownArea' },
  { icon: 'rupee', key: 'getRecognized' },
];
