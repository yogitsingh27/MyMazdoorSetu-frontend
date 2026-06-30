import { respond, fail } from './http';
import { USERS } from '@/data/users';
import { ROLE } from '@/types/roles';

const STORAGE_KEY = 'mms.auth';

export const AuthService = {
  /**
   * Look the account up by phone. Returns the full user (with roles[]).
   * The active role is decided later by RoleContext, NOT here — this is the
   * fix for "every login opens Worker": role now comes from the account.
   */
  async login(phone) {
    const user = USERS.find((u) => u.phone === phone.trim());
    if (!user) return fail('No account found for that number. Try a demo account.');
    return respond(user);
  },

  /** Register a new account. New users start with the chosen role(s). */
  async register({ name, phone, city, roles = [ROLE.WORKER] }) {
    const user = {
      id: `u_${Math.random().toString(36).slice(2, 8)}`,
      name: name || 'New user',
      phone,
      city: city || 'Delhi',
      roles: roles.length ? roles : [ROLE.WORKER],
      verified: false,
      languages: ['Hindi'],
      avatarColor: 'amber',
    };
    return respond(user);
  },

  /** Persist the session (auth + active role) so a refresh keeps you logged in. */
  persist(session) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); } catch { /* ignore */ }
  },

  restore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  },
};
