import { cn } from '@/utils/cn';

export function StatusPill({ status }) {
  const map = {
    open: ['pill-open', 'Open'],
    review: ['pill-review', 'In review'],
    resolved: ['pill-resolved', 'Resolved'],
    closed: ['pill-closed', 'Closed'],
    active: ['pill-active', 'Active'],
    pending: ['pill-pending', 'Pending'],
    completed: ['pill-resolved', 'Completed'],
    paid: ['pill-resolved', 'Paid'],
  };
  const [klass, label] = map[status] || ['pill-closed', status];
  return <span className={cn('pill-status', klass)}>{label}</span>;
}

const STAR_PATH = 'M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.7l-5.2 2.9 1-5.8L1.5 7.7l5.9-.8z';

export function Stars({ value, size = 14, color = 'var(--amber)' }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= full;
        const isHalf = !filled && half && i === full + 1;
        const gid = `half-${i}-${value}`;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 20 20">
            {isHalf && (
              <defs>
                <linearGradient id={gid}>
                  <stop offset="50%" stopColor={color} />
                  <stop offset="50%" stopColor="var(--border-strong)" />
                </linearGradient>
              </defs>
            )}
            <path d={STAR_PATH} fill={filled ? color : isHalf ? `url(#${gid})` : 'var(--border-strong)'} />
          </svg>
        );
      })}
    </span>
  );
}

export function RatingSummary({ score, count, size = 14 }) {
  return (
    <div className="rating-summary">
      <Stars value={score} size={size} />
      <span className="rating-score">{score.toFixed(1)}</span>
      <span className="rating-count">({count} review{count !== 1 ? 's' : ''})</span>
    </div>
  );
}
