import Icon from '@/components/common/Icon';
import { StatusPill } from '@/components/common/Rating';
import { MANAGED_WORKERS, PROJECTS } from '@/data';

export default function DashboardPreviewCard({ title = 'Managed workers' }) {
  const rows = MANAGED_WORKERS.slice(0, 3);
  const activeProjects = PROJECTS.filter((p) => p.status === 'active').length;

  return (
    <div className="dash-preview-card">
      <div className="dash-preview-head">
        <span>{title}</span>
        <Icon name="users" size={14} color="var(--text-mute)" />
      </div>
      <div className="dash-preview-stats">
        <div className="dash-stat">
          <div className="num">{MANAGED_WORKERS.length}</div>
          <div className="lbl">Workers</div>
        </div>
        <div className="dash-stat">
          <div className="num">{activeProjects}</div>
          <div className="lbl">Active projects</div>
        </div>
      </div>
      <div className="dash-preview-rows">
        {rows.map((w) => (
          <div className="dash-preview-row" key={w.name}>
            <span>{w.name}</span>
            <StatusPill status={w.available ? 'active' : 'pending'} />
          </div>
        ))}
      </div>
    </div>
  );
}
