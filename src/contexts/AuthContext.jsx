import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { AuthService } from '@/services';
import { USE_API, setSessionExpiredHandler } from '@/services/http';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  // Mock mode restores synchronously from localStorage. API mode must ask the
  // backend to exchange the httpOnly refresh cookie for a token, which is async —
  // so we start with no user and gate protected routes on `initializing`.
  const restored = AuthService.restore();
  // Only attempt a session restore if this browser previously held a session
  // (a persisted user). This avoids pinging /auth/refresh for anonymous visitors
  // on every public page load.
  const hadSession = USE_API && !!restored?.user;
  const [user, setUser] = useState(USE_API ? null : restored?.user ?? null);
  const [initializing, setInitializing] = useState(hadSession);

  // On mount (API mode): restore the session from the refresh cookie, and wire
  // the session-expired hook so a failed background refresh logs the user out.
  useEffect(() => {
    if (!USE_API) return;
    setSessionExpiredHandler(() => setUser(null));
    if (!hadSession) return; // never logged in on this browser -> nothing to restore
    let active = true;
    (async () => {
      try {
        const u = await AuthService.refresh(); // valid cookie -> fresh token + user
        if (active) setUser(u);
      } catch {
        if (active) { setUser(null); AuthService.clear(); } // stale hint -> clear it
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (phone, password) => {
    const u = await AuthService.login(phone, password);
    setUser(u);
    // Persist a session hint immediately (before role selection). Multi-role users
    // land on /select-role with no activeRole yet; without this a hard reload there
    // finds no hint, skips the refresh probe, and drops them to /login despite a
    // valid refresh cookie. RoleContext augments this with activeRole once chosen.
    if (USE_API) AuthService.persist({ user: u });
    return u; // caller decides where to route based on u.roles
  }, []);

  // Register does NOT establish a session (backend returns 201 with no tokens).
  // The caller redirects to the login page afterwards.
  const register = useCallback((payload) => AuthService.register(payload), []);

  const logout = useCallback(() => {
    setUser(null);
    AuthService.logout();
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    initializing,
    login,
    register,
    logout,
  }), [user, initializing, login, register, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
