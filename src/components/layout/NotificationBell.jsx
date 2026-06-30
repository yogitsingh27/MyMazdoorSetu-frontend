import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/common/Icon';
import EmptyState from '@/components/common/EmptyState';
import { useNotifications } from '@/contexts/NotificationContext';

export default function NotificationBell() {
  const { notifications, unreadNotifications, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggle = () => {
    setOpen((o) => !o);
    if (!open && unreadNotifications > 0) markAllRead();
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button className="btn btn-ghost" onClick={toggle} aria-label="Notifications" style={{ position: 'relative', padding: 9 }}>
        <Icon name="bell" size={18} />
        {unreadNotifications > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%',
            background: 'var(--amber)', border: '2px solid var(--paper)',
          }} />
        )}
      </button>
      {open && (
        <div className="card" style={{
          position: 'absolute', right: 0, top: '110%', width: 320, maxHeight: 380, overflowY: 'auto',
          zIndex: 40, padding: 10, margin: 0, boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)', padding: '4px 6px 10px' }}>Notifications</div>
          {notifications.length === 0 ? (
            <EmptyState icon="bell" title="You're all caught up" hint="New activity will show up here." />
          ) : (
            notifications.map((n) => (
              <div key={n.id} style={{ display: 'flex', gap: 10, padding: '10px 6px', borderTop: '1px solid var(--border)' }}>
                <div className="icon-circle" style={{ width: 32, height: 32, background: 'var(--page)', flexShrink: 0 }}>
                  <Icon name={n.icon} size={15} color="var(--navy-light)" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.4 }}>{n.body}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 3 }}>{n.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
