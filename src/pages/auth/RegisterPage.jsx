import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { IntentService } from '@/services';
import { ROLE, ROLE_META, ROLE_ORDER } from '@/types/roles';

// THE FIX (register side): the old form collapsed Contractor into "Worker /
// ThekeDar" and had no Employer option at all. This is a proper multi-select
// so a single account can legitimately start with more than one role.
const SELECTABLE_ROLES = ROLE_ORDER.filter((r) => r !== ROLE.ADMIN);

export default function RegisterPage() {
  const location = useLocation();
  const preselect = location.state?.preselectRole;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [roles, setRoles] = useState(preselect && SELECTABLE_ROLES.includes(preselect) ? [preselect] : [ROLE.WORKER]);
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const toggleRole = (r) => {
    setRoles((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (roles.length === 0) return;
    setBusy(true);
    try {
      const user = await register({ name, phone, city, roles });
      toast('Account created — welcome to MyMazdoorSetu');
      if (IntentService.resume(navigate)) return; // e.g. resuming an Apply/Contact click
      navigate(user.roles.length > 1 ? '/select-role' : `/app/${user.roles[0]}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hero" style={{ minHeight: 'calc(100vh - 61px)', display: 'flex', alignItems: 'center' }}>
      <div className="modal" style={{ margin: '0 auto', maxWidth: 480 }}>
        <div className="modal-head"><h3>Create your account</h3></div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98200-12233" />
            </div>
            <div className="field full">
              <label htmlFor="city">City</label>
              <input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Delhi" />
            </div>
          </div>

          <div className="field full" style={{ marginTop: 14 }}>
            <label>I want to (choose one or more)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {SELECTABLE_ROLES.map((r) => {
                const m = ROLE_META[r];
                const active = roles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    className="btn-sm"
                    aria-pressed={active}
                    style={active ? { background: 'var(--amber-light)', borderColor: 'var(--amber)', color: 'var(--amber-dark)' } : undefined}
                    onClick={() => toggleRole(r)}
                  >
                    {m.emoji} {m.label}
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--text-mute)', marginTop: 6 }}>
              You can add more roles later from your profile — one account, no need to re-register.
            </p>
          </div>

          <button className="btn btn-primary" type="submit" disabled={busy || roles.length === 0}
            style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}>
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 14, textAlign: 'center' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
