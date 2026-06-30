import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { AuthService } from '@/services';

const RoleCtx = createContext(null);
export const useRole = () => useContext(RoleCtx);

export function RoleProvider({ children }) {
  const { user } = useAuth();
  const restored = AuthService.restore();
  const [activeRole, setActive] = useState(restored?.activeRole ?? null);

  const availableRoles = useMemo(() => user?.roles ?? [], [user]);

  // Reset / auto-select whenever the account changes.
  useEffect(() => {
    if (!user) {
      setActive(null);
      return;
    }
    // Single-role accounts skip the selector entirely.
    if (user.roles.length === 1) {
      setActive(user.roles[0]);
    } else if (activeRole && !user.roles.includes(activeRole)) {
      // Active role no longer valid for this account.
      setActive(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Persist the active role alongside the user.
  useEffect(() => {
    if (user && activeRole) AuthService.persist({ user, activeRole });
  }, [user, activeRole]);

  const setActiveRole = useCallback((role) => {
    if (!user?.roles.includes(role)) return;
    setActive(role);
  }, [user]);

  const value = useMemo(() => ({
    activeRole,
    setActiveRole,
    availableRoles,
    canSwitch: availableRoles.length > 1,
    needsSelection: !!user && user.roles.length > 1 && !activeRole,
  }), [activeRole, setActiveRole, availableRoles, user]);

  return <RoleCtx.Provider value={value}>{children}</RoleCtx.Provider>;
}
