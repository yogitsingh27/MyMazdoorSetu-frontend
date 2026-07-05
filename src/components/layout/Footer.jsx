import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROLE, ROLE_ORDER } from '@/types/roles';

const FOOTER_ROLES = ROLE_ORDER.filter((r) => r !== ROLE.ADMIN);

export default function Footer() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand"><span className="mark">MS</span> MyMazdoorSetu</div>
          <p>{t('footer.tagline')}</p>
        </div>
        <div className="footer-col">
          <h5>{t('footer.registerAs')}</h5>
          {FOOTER_ROLES.map((r) => (
            <a key={r} onClick={() => navigate('/register', { state: { preselectRole: r } })}>{t(`roles.${r}.label`)}</a>
          ))}
        </div>
        <div className="footer-col">
          <h5>{t('footer.platform')}</h5>
          <a onClick={() => navigate('/jobs')}>{t('nav.browseJobs')}</a>
          <a onClick={() => navigate('/workers')}>{t('footer.browseWorkers')}</a>
          <a onClick={() => navigate('/projects')}>{t('footer.constructionProjects')}</a>
          <a onClick={() => navigate('/login')}>{t('common.logIn')}</a>
        </div>
        <div className="footer-col">
          <h5>{t('footer.trust')}</h5>
          <span className="footer-static">{t('footer.verification')}</span>
          <span className="footer-static">{t('footer.grievanceSupport')}</span>
          <span className="footer-static">{t('footer.launchingSoon')}</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>{t('footer.copyright', { year: new Date().getFullYear() })}</span>
        <span className="footer-note"><Icon name="shield" size={12} /> {t('footer.builtFor')}</span>
      </div>
    </footer>
  );
}
