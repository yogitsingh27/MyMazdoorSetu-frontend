import Icon from './Icon';
import { initial, avatarTint } from '@/utils/format';

export function PageHead({ title, desc, action }) {
  return (
    <div className="page-head">
      <div>
        <h2>{title}</h2>
        {desc && <div className="desc">{desc}</div>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ num, lbl, delta }) {
  return (
    <div className="stat-card">
      <div className="num">{num}</div>
      <div className="lbl">{lbl}</div>
      {delta && <div className="delta">↑ {delta}</div>}
    </div>
  );
}

export function StatRow({ stats }) {
  return (
    <div className="stat-row">
      {stats.map((s) => <StatCard key={s.lbl} {...s} />)}
    </div>
  );
}

export function Avatar({ name, color = 'amber', size = 26 }) {
  const tint = avatarTint(color);
  return (
    <span className="av" style={{ width: size, height: size, background: tint.bg, color: tint.fg, fontSize: size * 0.42 }}>
      {initial(name)}
    </span>
  );
}

export function IdChip({ name, color, sub, onClick }) {
  return (
    <span className="id-chip" style={onClick ? { cursor: 'pointer' } : undefined} onClick={onClick}>
      <Avatar name={name} color={color} />
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{name}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{sub}</div>}
      </div>
    </span>
  );
}
