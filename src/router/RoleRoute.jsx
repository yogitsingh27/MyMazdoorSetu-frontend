import { useEffect } from 'react';
import { Navigate, useParams, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { isRole } from '@/types/roles';

/**
 * Guards /app/:role/* — this is the structural fix for "Worker should never
 * see Employer pages". Unlike the old string-keyed page switch (which only
 * hid links but rendered anything if state was set), this actually blocks
 * the route:
 *   - not logged in              -> /login
 *   - :role isn't a real role    -> /app/<first valid role>
 *   - account doesn't hold :role -> /app/<first valid role>
 * Otherwise it syncs RoleContext's activeRole to the URL (the URL is the
 * source of truth) and renders the nested dashboard routes.
 */
export default function RoleRoute() {
  const { role } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { activeRole, setActiveRole } = useRole();

  const validRole = isAuthenticated && isRole(role) && user.roles.includes(role);

  useEffect(() => {
    if (validRole && activeRole !== role) setActiveRole(role);
  }, [validRole, role, activeRole, setActiveRole]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!validRole) return <Navigate to={`/app/${user.roles[0]}`} replace />;

  return <Outlet />;
}
