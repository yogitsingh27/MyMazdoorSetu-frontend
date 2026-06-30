import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { ROLE_META } from '@/types/roles';

export default function RoleSelectPage() {
  const { user } = useAuth();
  const { setActiveRole } = useRole();
  const navigate = useNavigate();

  if (!user) return <Navigate to="/login" replace />;
  if (user.roles.length <= 1) return <Navigate to={`/app/${user.roles[0]}`} replace />;

  const pick = (role) => {
    setActiveRole(role);
    navigate(`/app/${role}`);
  };

  return (
    <div className="section" style={{ maxWidth: 720 }}>
      <div className="section-head">
        <h2>Choose your role</h2>
        <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 6 }}>
          {user.name} — continue as one of your roles. You can switch anytime from the top bar without logging out.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {user.roles.map((r) => {
          const m = ROLE_META[r];
          return (
            <div className="card role-card" key={r} style={{ marginBottom: 0, textAlign: 'center', padding: '28px 20px' }} onClick={() => pick(r)}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>{m.emoji}</div>
              <h4 style={{ fontFamily: 'var(--display)', color: 'var(--navy)', marginBottom: 4 }}>Continue as {m.label}</h4>
              <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0 }}>{m.tagline}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
