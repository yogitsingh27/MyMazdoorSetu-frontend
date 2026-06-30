import { useServiceData } from '@/hooks/useServiceData';
import { MessageService } from '@/services';
import { PageHead, Avatar } from '@/components/common/Primitives';
import { PageSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';

export default function MessagesPage() {
  const { data: threads, loading } = useServiceData(() => MessageService.threads(), []);

  if (loading) return <div><PageHead title="Messages" /><PageSkeleton stats={false} table /></div>;

  return (
    <div>
      <PageHead title="Messages" desc="Conversations with workers, hirers, and agents." />
      {threads.length === 0 ? (
        <EmptyState icon="message" title="No conversations yet" hint="Messages from people you work with will show up here." />
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {threads.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderTop: i ? '1px solid var(--border)' : 'none' }}>
              <Avatar name={t.with} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{t.with}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--text-mute)', flexShrink: 0 }}>{t.time}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.last}</div>
              </div>
              {t.unread > 0 && (
                <span style={{ background: 'var(--amber)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 10, minWidth: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
                  {t.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
