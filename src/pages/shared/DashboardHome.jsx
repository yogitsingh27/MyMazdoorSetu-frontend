import { PageHead, StatRow } from '@/components/common/Primitives';
import { HOME_CARDS } from '@/config/dashboards';
import { ROLE_META } from '@/types/roles';

// Live activity metrics are not wired to the backend yet. Rather than show
// fabricated numbers, each card keeps its label with an honest placeholder value
// (see docs/BETA_READINESS.md, Phase 3). The card layout is preserved.
const placeholder = (
  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-mute)' }}>After beta</span>
);

export default function DashboardHome({ role }) {
  const cards = (HOME_CARDS[role] || []).map(([, label]) => ({ num: placeholder, lbl: label }));

  return (
    <div>
      <PageHead title="Dashboard" desc={`Your ${ROLE_META[role]?.label ?? role} dashboard.`} />
      <StatRow stats={cards} />
      <p style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 12 }}>
        Live activity stats will be available after beta.
      </p>
    </div>
  );
}
