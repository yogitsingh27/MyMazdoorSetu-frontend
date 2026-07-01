import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import { ROLE, ROLE_ORDER, ROLE_META } from '@/types/roles';

const FOOTER_ROLES = ROLE_ORDER.filter((r) => r !== ROLE.ADMIN);

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand"><span className="mark">MS</span> MyMazdoorSetu</div>
          <p>Connecting workers, contractors, and builders across Delhi NCR's construction industry — registered, verified, and dispute-free.</p>
        </div>
        <div className="footer-col">
          <h5>Register as</h5>
          {FOOTER_ROLES.map((r) => (
            <a key={r} onClick={() => navigate('/register', { state: { preselectRole: r } })}>{ROLE_META[r].label}</a>
          ))}
        </div>
        <div className="footer-col">
          <h5>Platform</h5>
          <a onClick={() => navigate('/jobs')}>Browse jobs</a>
          <a onClick={() => navigate('/workers')}>Browse workers</a>
          <a onClick={() => navigate('/projects')}>Construction projects</a>
          <a onClick={() => navigate('/login')}>Log in</a>
        </div>
        <div className="footer-col">
          <h5>Trust</h5>
          <span className="footer-static">Aadhaar / Voter ID / PAN verification</span>
          <span className="footer-static">Grievance support</span>
          <span className="footer-static">Delhi NCR — launching soon</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MyMazdoorSetu</span>
        <span className="footer-note"><Icon name="shield" size={12} /> Built for India's construction workforce</span>
      </div>
    </footer>
  );
}
