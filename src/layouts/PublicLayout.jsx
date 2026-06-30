import { Outlet } from 'react-router-dom';
import Topbar from '@/components/layout/Topbar';

export default function PublicLayout() {
  return (
    <div className="app">
      <Topbar loggedIn={false} />
      <Outlet />
    </div>
  );
}
