// Single source of truth for roles across the whole app.
// NOTE: `Customer` has been removed and replaced by `Employer`.

export const ROLE = Object.freeze({
  WORKER: 'worker',
  CONTRACTOR: 'contractor', // ThekeDar
  EMPLOYER: 'employer',     // homeowner, builder, company, society, factory, hotel, shop...
  AGENT: 'agent',
  ADMIN: 'admin',
});

export const ROLE_ORDER = [ROLE.WORKER, ROLE.CONTRACTOR, ROLE.EMPLOYER, ROLE.AGENT, ROLE.ADMIN];

// Display metadata used by the role selector, top bar and labels.
export const ROLE_META = {
  [ROLE.WORKER]:     { label: 'Worker',              short: 'Worker',     emoji: '👷', icon: 'hammer',    tagline: 'Find work near you.' },
  [ROLE.CONTRACTOR]: { label: 'Contractor (ThekeDar)', short: 'Contractor', emoji: '🏗', icon: 'briefcase', tagline: 'Manage workers and projects.' },
  [ROLE.EMPLOYER]:   { label: 'Employer',            short: 'Employer',   emoji: '📋', icon: 'user',      tagline: 'Hire workers directly.' },
  [ROLE.AGENT]:      { label: 'Agent',               short: 'Agent',      emoji: '🤝', icon: 'users',     tagline: 'Register and manage workers.' },
  [ROLE.ADMIN]:      { label: 'Admin',               short: 'Admin',      emoji: '🛡', icon: 'shield',    tagline: 'Manage the platform.' },
};

export const isRole = (value) => Object.values(ROLE).includes(value);

export const roleLabel = (role) => (ROLE_META[role]?.label ?? role);
