import Icon from '@/components/common/Icon';
import { Stars } from '@/components/common/Rating';
import { Avatar } from '@/components/common/Primitives';

export default function WorkerShowcaseCard({ worker, compact = false }) {
  const wp = worker.workerProfile;
  return (
    <div className={`worker-showcase-card${compact ? ' compact' : ''}`}>
      <div className="wsc-top">
        <Avatar name={worker.name} color={worker.avatarColor} size={compact ? 34 : 46} />
        <div className="wsc-id">
          <div className="wsc-name">{worker.name}</div>
          <div className="wsc-trade">{wp.trade} · {worker.city}</div>
        </div>
        {worker.verified && (
          <span className="verified-badge"><Icon name="check" size={11} /> Verified</span>
        )}
      </div>
      <div className="wsc-bottom">
        <Stars value={wp.rating} size={compact ? 11 : 13} />
        <span className="wsc-rating-num">{wp.rating.toFixed(1)}</span>
        <span className="wsc-jobs">· {wp.jobsDone} jobs done</span>
      </div>
      {!compact && (
        <div className="wsc-skills">{wp.skills.slice(0, 3).join(' · ')}</div>
      )}
    </div>
  );
}
