import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { AuthService } from '@/services';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  // Restore a persisted session on first load (keeps you logged in on refresh).
  const restored = AuthService.restore();
  const [user, setUser] = useState(restored?.user ?? null);

  const login = useCallback(async (phone) => {
    const u = await AuthService.login(phone);
    setUser(u);
    return u; // caller decides where to route based on u.roles
  }, []);

  const register = useCallback(async (payload) => {
    const u = await AuthService.register(payload);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    AuthService.clear();
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }), [user, login, register, logout]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
