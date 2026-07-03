import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { IntentService } from '@/services';
import { DEMO_ACCOUNTS } from '@/data/users';

// THE FIX: role is no longer a dropdown the user pre-selects. It comes
// from the account record returned by AuthService.login(). Routing below
// reads `user.roles`, not a guessed/defaulted value.
export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(phone);
      toast(`Welcome back, ${user.name.split(' ')[0]}`);
      if (IntentService.resume(navigate)) return; // e.g. resuming an Apply/Contact click
      // Single role -> straight to that dashboard. Multiple -> role selector.
      navigate(user.roles.length > 1 ? '/select-role' : `/app/${user.roles[0]}`);
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hero" style={{ minHeight: 'calc(100vh - 61px)', display: 'flex', alignItems: 'center' }}>
      <div className="modal" style={{ margin: '0 auto', maxWidth: 420 }}>
        <div className="modal-head"><h3>Log in</h3></div>
        <form onSubmit={submit}>
          <div className="field full">
            <label htmlFor="phone">Phone number</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98200-12233" autoFocus />
          </div>
          {error && <p style={{ color: 'var(--rose)', fontSize: 13, marginTop: 8 }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
            {busy ? 'Checking…' : 'Continue'}
          </button>
        </form>

        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mute)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Demo accounts
          </div>
          {DEMO_ACCOUNTS.map((d) => (
            <button key={d.phone} type="button" className="btn-sm" style={{ display: 'block', width: '100%', textAlign: 'left', marginBottom: 6 }}
              onClick={() => setPhone(d.phone)}>
              {d.phone} — {d.label}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 14, textAlign: 'center' }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
