import { Outlet } from 'react-router-dom';
import Topbar from '@/components/layout/Topbar';
import Footer from '@/components/layout/Footer';

export default function PublicLayout() {
  return (
    <div className="app">
      <Topbar loggedIn={false} />
      <Outlet />
      <Footer />
    </div>
  );
}
