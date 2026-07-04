import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import RouteLoading from '@/router/RouteLoading';

export default function RequireAuth() {
  const { isAuthenticated, initializing } = useAuth();
  if (initializing) return <RouteLoading />; // wait for session restore before deciding
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
