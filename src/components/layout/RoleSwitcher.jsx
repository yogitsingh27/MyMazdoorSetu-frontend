import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import { useRole } from '@/contexts/RoleContext';
import { ROLE_META } from '@/types/roles';

export default function RoleSwitcher() {
  const { activeRole, availableRoles, canSwitch, setActiveRole } = useRole();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!activeRole) return null;
  const meta = ROLE_META[activeRole];

  if (!canSwitch) {
    return <span className="roletag">{meta.emoji} {meta.short}</span>;
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-ghost" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
        <span>{meta.emoji} {meta.short}</span>
        <Icon name="swap" size={14} />
      </button>
      {open && (
        <div role="listbox" className="card" style={{
          position: 'absolute', right: 0, top: '110%', minWidth: 220, zIndex: 40,
          padding: 8, margin: 0, boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-mute)', padding: '4px 8px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Continue as
          </div>
          {availableRoles.map((r) => {
            const m = ROLE_META[r];
            const isActive = r === activeRole;
            return (
              <button
                key={r}
                role="option"
                aria-selected={isActive}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer',
                  padding: '9px 10px', borderRadius: 8, fontSize: 14,
                  color: isActive ? 'var(--navy)' : 'var(--text)',
                  background: isActive ? 'var(--page)' : 'transparent', fontWeight: isActive ? 600 : 500,
                }}
                onClick={() => { setActiveRole(r); setOpen(false); navigate(`/app/${r}`); }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{m.emoji}</span> {m.label}
                </span>
                {isActive && <Icon name="check" size={14} color="var(--teal)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
