import { USE_API, request, refreshSession, setAccessToken, respond, fail } from './http';
import { USERS } from '@/data/users';
import { ROLE } from '@/types/roles';

const STORAGE_KEY = 'mms.auth';

// Backend MeDto -> the flat user shape the app already consumes.
// (Dashboard read widgets still run on mock data this milestone; they don't
// depend on this object's per-role profile blocks.)
function mapUser(dto) {
  return {
    id: dto.id,
    name: dto.name,
    phone: dto.phone,
    city: dto.city,
    avatarColor: dto.avatarColor || 'amber',
    verified: dto.isVerified,
    roles: dto.roles ?? [],       // lowercase role strings, matching ROLE.*
    profiles: dto.profiles ?? {}, // { worker, contractor, employer, agent } booleans
  };
}

export const AuthService = {
  /**
   * Authenticate by phone + password.
   * API mode: POST /auth/login — stores the access token in memory (via http.js)
   * and returns the mapped user. The refresh token is set as an httpOnly cookie
   * by the backend. Mock mode: look the account up by phone (password ignored).
   */
  async login(phone, password) {
    if (USE_API) {
      const res = await request('/auth/login', {
        method: 'POST',
        body: { phone: phone.trim(), password },
        skipRefresh: true, // login IS the way to get a session — never auto-refresh here
      });
      setAccessToken(res.accessToken);
      return mapUser(res.user);
    }
    const user = USERS.find((u) => u.phone === phone.trim());
    if (!user) return fail('No account found for that number. Try a demo account.');
    return respond(user);
  },

  /**
   * Register a new account.
   * API mode: POST /auth/register returns 201 with NO tokens — the caller then
   * sends the user to the login page. Returns null (no session established).
   * Mock mode: fabricate an ephemeral user.
   */
  async register({ name, phone, city, roles = [ROLE.WORKER], password }) {
    if (USE_API) {
      await request('/auth/register', {
        method: 'POST',
        body: { name, phone, city, password, roles: roles.length ? roles : [ROLE.WORKER] },
        skipRefresh: true,
      });
      return null; // backend-consistent: no auto-login, no tokens
    }
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

  /**
   * Restore a session on app load (API mode only): exchange the httpOnly refresh
   * cookie for a fresh access token + user. Throws if there is no valid cookie.
   */
  async refresh() {
    const user = await refreshSession();
    return mapUser(user);
  },

  /**
   * End the session. API mode: revoke the refresh token server-side (best effort)
   * and drop the in-memory access token. Always clears local persistence.
   */
  logout() {
    if (USE_API) {
      setAccessToken(null);
      // Best-effort revoke; ignore failures (the local session is already gone).
      request('/auth/logout', { method: 'POST', skipRefresh: true }).catch(() => {});
    }
    this.clear();
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
