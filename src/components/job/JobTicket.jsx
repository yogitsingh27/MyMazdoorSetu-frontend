import Icon from '@/components/common/Icon';
import { Stars } from '@/components/common/Rating';
import { roleLabel } from '@/types/roles';

// The signature "ticket" card. Visual markup identical to the prototype.
export default function JobTicket({ job, onApply, actionLabel = 'Apply' }) {
  return (
    <div className="ticket">
      <div className="ticket-stub">
        <div className="role-icon">{job.trade}</div>
        <div>
          <div className="wage-label">Wage</div>
          <div className="wage">{job.wage}</div>
        </div>
      </div>
      <div className="perf" />
      <div className="ticket-body">
        <div className="ticket-main">
          <h4>{job.title}</h4>
          <div className="meta">
            <span><Icon name="map" size={13} color="var(--text-mute)" /> {job.location}</span>
            <span>{job.duration}</span>
            <span>{roleLabel(job.postedByRole)}</span>
            {job.posterRating != null && (
              <span><Stars value={job.posterRating} size={11} /> {job.posterRating.toFixed(1)} ({job.posterReviews})</span>
            )}
          </div>
          <div className="ticket-tags">
            {job.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
          </div>
        </div>
        <div className="ticket-action">
          <span className="ticket-id mono">{job.id}</span>
          {onApply && <button className="btn-sm orange" onClick={() => onApply(job)}>{actionLabel}</button>}
        </div>
      </div>
    </div>
  );
}
