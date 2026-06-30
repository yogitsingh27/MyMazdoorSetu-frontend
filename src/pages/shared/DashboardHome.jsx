import { PageHead, StatRow } from '@/components/common/Primitives';
import { PageSkeleton } from '@/components/common/Skeleton';
import { useServiceData } from '@/hooks/useServiceData';
import { HOME_CARDS, SUMMARY_SERVICE } from '@/config/dashboards';
import { ROLE_META } from '@/types/roles';

export default function DashboardHome({ role }) {
  const fetcher = SUMMARY_SERVICE[role];
  const { data: summary, loading } = useServiceData(fetcher, [role]);

  if (loading || !summary) return <PageSkeleton />;

  const cards = (HOME_CARDS[role] || []).map(([key, label]) => ({
    num: summary[key] ?? '—',
    lbl: label,
  }));

  return (
    <div>
      <PageHead title="Dashboard" desc={`Here's what needs your attention as ${ROLE_META[role]?.label ?? role}.`} />
      <StatRow stats={cards} />
    </div>
  );
}
