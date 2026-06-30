import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import RoleSwitcher from './RoleSwitcher';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

export default function Topbar({ loggedIn }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const goHome = () => navigate(loggedIn ? '/app' : '/');
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="topbar">
      <div className="brand" onClick={goHome} style={{ cursor: 'pointer' }}>
        <span className="mark">MS</span> MyMazdoorSetu
      </div>

      {!loggedIn && (
        <nav className="nav-links">
          <a className="nav-link" onClick={() => navigate('/jobs')}>Browse jobs</a>
          <a className="nav-link" onClick={() => navigate('/how-it-works')}>How it works</a>
        </nav>
      )}

      <div className="nav-actions">
        {loggedIn ? (
          <>
            <NotificationBell />
            <RoleSwitcher />
            <button className="btn btn-ghost" onClick={handleLogout}>
              <Icon name="logout" size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Log in</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>Register</button>
          </>
        )}
      </div>
    </header>
  );
}
