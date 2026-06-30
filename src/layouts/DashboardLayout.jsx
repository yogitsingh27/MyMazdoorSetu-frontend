import { Outlet, useParams } from 'react-router-dom';
import Topbar from '@/components/layout/Topbar';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout() {
  // The URL is the source of truth for which role's shell to show — reading it
  // here (rather than the effect-synced activeRole) keeps the sidebar in step
  // with the route on the very first render, with no flash on navigation.
  const { role } = useParams();
  const basePath = `/app/${role}`;

  return (
    <div className="app">
      <Topbar loggedIn />
      <div className="shell">
        <Sidebar role={role} basePath={basePath} />
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
