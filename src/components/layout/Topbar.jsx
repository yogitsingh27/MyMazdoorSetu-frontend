import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import RoleSwitcher from './RoleSwitcher';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Topbar({ loggedIn }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { lang, setLang, t, languages } = useLanguage();

  const goHome = () => navigate(loggedIn ? '/app' : '/');
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="topbar">
      <div className="brand" onClick={goHome} style={{ cursor: 'pointer' }}>
        <span className="mark">MS</span> MyMazdoorSetu
      </div>

      {!loggedIn && (
        <nav className="nav-links">
          <a className="nav-link" onClick={() => navigate('/jobs')}>{t('nav.browseJobs')}</a>
          <a className="nav-link" onClick={() => navigate('/how-it-works')}>{t('nav.howItWorks')}</a>
        </nav>
      )}

      <div className="nav-actions">
        {/* Public-only for now — dashboards aren't localized yet, so the
            toggle stays out of the logged-in header until they are. */}
        {!loggedIn && (
          <div className="lang-toggle" role="group" aria-label="Language">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`lang-opt${lang === l.code ? ' active' : ''}`}
                onClick={() => setLang(l.code)}
              >
                {l.native}
              </button>
            ))}
          </div>
        )}

        {loggedIn ? (
          <>
            <NotificationBell />
            <RoleSwitcher />
            <button className="btn btn-ghost" onClick={handleLogout}>
              <Icon name="logout" size={16} /> {t('nav.logout')}
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>{t('common.logIn')}</button>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>{t('common.register')}</button>
          </>
        )}
      </div>
    </header>
  );
}
