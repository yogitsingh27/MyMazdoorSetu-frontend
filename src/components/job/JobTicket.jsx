import Icon from '@/components/common/Icon';
import { Stars } from '@/components/common/Rating';
import { useLanguage } from '@/contexts/LanguageContext';

// The signature "ticket" card. Visual markup identical to the prototype.
export default function JobTicket({ job, onApply, actionLabel }) {
  const { t } = useLanguage();
  const label = actionLabel ?? t('common.apply');
  return (
    <div className="ticket">
      <div className="ticket-stub">
        <div className="role-icon">{job.trade}</div>
        <div>
          <div className="wage-label">{t('common.wage')}</div>
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
            <span>{t(`roles.${job.postedByRole}.label`)}</span>
            {job.posterRating != null && (
              <span><Stars value={job.posterRating} size={11} /> {job.posterRating.toFixed(1)} ({job.posterReviews})</span>
            )}
          </div>
          <div className="ticket-tags">
            {job.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}
          </div>
        </div>
        <div className="ticket-action">
          <span className="ticket-id mono">{job.id}</span>
          {onApply && <button className="btn-sm orange" onClick={() => onApply(job)}>{label}</button>}
        </div>
      </div>
    </div>
  );
}
