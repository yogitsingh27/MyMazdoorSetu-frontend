import { useParams, useNavigate } from 'react-router-dom';
import { useServiceData } from '@/hooks/useServiceData';
import { JobService } from '@/services';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import Icon from '@/components/common/Icon';
import { Stars } from '@/components/common/Rating';
import { Avatar } from '@/components/common/Primitives';
import JobTicket from '@/components/job/JobTicket';
import EmptyState from '@/components/common/EmptyState';
import { PageSkeleton } from '@/components/common/Skeleton';
import { USERS } from '@/data/users';
import { JOBS } from '@/data/jobs';
import { ROLE } from '@/types/roles';

// Facilities are things the poster offers (distinct from requirements, which
// are what the worker needs to have). A per-tag icon where a real one fits;
// a generic check otherwise — no invented glyphs for concepts we don't have one for.
const FACILITY_ICONS = {
  'Tools provided': 'briefcase',
  'Direct contact': 'message',
  'Long term': 'chart',
};

function daysAgo(dateStr) {
  const posted = new Date(dateStr);
  const diffMs = Date.now() - posted.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const toast = useToast();
  const { data: job, loading } = useServiceData(() => JobService.get(id), [id]);

  const applyNow = () => navigate('/register', { state: { preselectRole: ROLE.WORKER } });

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: job.title, url }); } catch { /* user cancelled — not an error */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast(t('jobDetail.linkCopied'));
    } catch { /* clipboard unavailable — nothing we can do without a real backend share link */ }
  };

  if (loading) return <div className="section"><PageSkeleton stats={false} /></div>;

  if (!job) {
    return (
      <section className="section">
        <EmptyState
          icon="briefcase"
          title={t('jobDetail.notFound')}
          hint={t('jobDetail.notFoundHint')}
          actionLabel={t('nav.browseJobs')}
          onAction={() => navigate('/jobs')}
        />
      </section>
    );
  }

  const poster = USERS.find((u) => u.id === job.postedById);
  const posterName = poster ? (poster.employerProfile?.orgName || poster.contractorProfile?.businessName || poster.name) : t(`roles.${job.postedByRole}.label`);
  const similar = JOBS.filter((j) => j.id !== job.id && j.trade === job.trade && j.status === 'open').slice(0, 3);
  const days = daysAgo(job.postedAt);

  return (
    <>
      <section className="section job-detail">
        <a className="back-link" onClick={() => navigate('/jobs')}>
          <Icon name="arrow" size={13} /> {t('jobDetail.backToJobs')}
        </a>

        <div className="job-detail-layout">
          <span className="roletag">{job.trade}</span>
          <h1>{job.title}</h1>
          <div className="job-detail-meta">
            <span><Icon name="map" size={14} color="var(--text-mute)" /> {job.location}</span>
            <span>{job.duration}</span>
            <span className="mono">{job.id}</span>
          </div>

          <div className="job-detail-wage-card">
            <div className="wage-label">{t('common.wage')}</div>
            <div className="job-detail-wage">{job.wage}</div>
          </div>

          {poster && (
            <div className="poster-card">
              <Avatar name={posterName} color={poster.avatarColor} size={44} />
              <div className="poster-id">
                <div className="poster-name">{posterName}</div>
                <div className="poster-role">
                  {t(`roles.${job.postedByRole}.label`)}
                  {poster.verified && <span className="verified-badge"><Icon name="check" size={11} /> {t('jobDetail.verified')}</span>}
                </div>
              </div>
              {job.posterRating != null && (
                <div className="poster-rating">
                  <Stars value={job.posterRating} size={13} />
                  <span className="ledger-num">{job.posterRating.toFixed(1)}</span>
                  <span className="poster-reviews">({job.posterReviews})</span>
                </div>
              )}
            </div>
          )}

          <div className="job-detail-openings">
            {t(job.openings === 1 ? 'jobDetail.hiringWorkersOne' : 'jobDetail.hiringWorkersOther', { count: job.openings })}
          </div>

          <div className="job-detail-ctas">
            <button className="btn btn-primary job-detail-apply-inline" onClick={applyNow}>{t('jobDetail.applyNow')}</button>
            <button className="btn btn-outline" onClick={share}><Icon name="share" size={15} /> {t('jobDetail.shareJob')}</button>
          </div>

          <div className="job-detail-section">
            <h3>{t('jobDetail.description')}</h3>
            <p>{job.description}</p>
          </div>

          {job.requirements?.length > 0 && (
            <div className="job-detail-section">
              <h3>{t('jobDetail.requirements')}</h3>
              <ul className="checklist">
                {job.requirements.map((r) => (
                  <li key={r}><Icon name="check" size={14} color="var(--teal)" /> {r}</li>
                ))}
              </ul>
            </div>
          )}

          {job.tags?.length > 0 && (
            <div className="job-detail-section">
              <h3>{t('jobDetail.facilities')}</h3>
              <div className="facility-list">
                {job.tags.map((tag) => (
                  <span className="facility" key={tag}>
                    <Icon name={FACILITY_ICONS[tag] || 'check'} size={14} /> {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="job-detail-posted">
            {days === 0 ? t('jobDetail.postedToday') : days === 1 ? t('jobDetail.postedYesterday') : t('jobDetail.postedDaysAgo', { days })}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="job-detail-similar">
            <h3>{t('jobDetail.similarJobs')}</h3>
            <div className="ticket-grid">
              {similar.map((j) => <JobTicket key={j.id} job={j} onApply={() => navigate(`/jobs/${j.id}`)} />)}
            </div>
          </div>
        )}

        <div className="browse-banner">
          <p>{t('jobDetail.wantToApply')}</p>
          <div className="browse-banner-ctas">
            <button className="btn btn-primary" onClick={() => navigate('/register')}>{t('common.register')}</button>
            <button className="btn btn-outline" onClick={() => navigate('/login')}>{t('common.logIn')}</button>
          </div>
        </div>
      </section>

      <div className="sticky-apply-bar">
        <div className="sticky-apply-wage mono">{job.wage}</div>
        <button className="btn btn-primary" onClick={applyNow}>{t('jobDetail.applyNow')}</button>
      </div>
    </>
  );
}
