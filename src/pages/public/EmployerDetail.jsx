import { useParams, useNavigate } from 'react-router-dom';
import { useServiceData } from '@/hooks';
import { EmployerService } from '@/services';
import { useLanguage } from '@/contexts/LanguageContext';
import Icon from '@/components/common/Icon';
import { Stars } from '@/components/common/Rating';
import { RatingBars } from '@/components/common/Reviews';
import { Avatar } from '@/components/common/Primitives';
import JobTicket from '@/components/job/JobTicket';
import EmptyState from '@/components/common/EmptyState';
import { PageSkeleton } from '@/components/common/Skeleton';
import { HIRER_RATING_CATS } from '@/data/reviews';
import { EMPLOYER_KIND_LABELS } from '@/data/companies';

function scrollToOpenJobs() {
  document.getElementById('employer-open-jobs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function EmployerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: employer, loading } = useServiceData(() => EmployerService.getPublic(id), [id]);

  if (loading) return <div className="section"><PageSkeleton stats={false} /></div>;

  if (!employer) {
    return (
      <section className="section">
        <EmptyState
          icon="briefcase"
          title={t('employerDetail.notFound')}
          hint={t('employerDetail.notFoundHint')}
          actionLabel={t('nav.browseJobs')}
          onAction={() => navigate('/jobs')}
        />
      </section>
    );
  }

  const ep = employer.employerProfile;
  const reviews = employer.reviews;
  const openJobs = employer.openJobs;

  return (
    <>
      <section className="section job-detail employer-detail">
        <a className="back-link" onClick={() => navigate(-1)}>
          <Icon name="arrow" size={13} /> {t('employerDetail.back')}
        </a>

        <div className="job-detail-layout">
          <div className="worker-detail-head">
            <Avatar name={ep.orgName} color={employer.avatarColor} size={64} />
            <div>
              <h1>{ep.orgName}</h1>
              <div className="worker-detail-meta">
                <span className="roletag">{EMPLOYER_KIND_LABELS[ep.kind] || ep.kind}</span>
                <span><Icon name="map" size={13} color="var(--text-mute)" /> {employer.city}</span>
                {employer.verified && <span className="verified-badge"><Icon name="check" size={11} /> {t('jobDetail.verified')}</span>}
              </div>
            </div>
          </div>

          {ep.tagline && <p className="employer-tagline">{ep.tagline}</p>}

          {/* Trust metrics are the primary decision signal for a worker
              considering this employer, so this panel is deliberately the
              most visually prominent block on the page — ahead of the
              Jobs Posted stat below, not alongside it as an equal. */}
          <div className="trust-panel">
            <div className="trust-panel-head">
              <h3>{t('employerDetail.trustHeading')}</h3>
              <div className="trust-panel-overall">
                <Stars value={ep.rating} size={15} />
                <span className="ledger-num">{ep.rating.toFixed(1)}</span>
              </div>
            </div>
            {reviews.length === 0 ? (
              <p style={{ fontSize: 13.5, color: 'var(--text-mute)', margin: 0 }}>{t('employerDetail.noReviewsYet')}</p>
            ) : (
              <RatingBars reviews={reviews} categories={HIRER_RATING_CATS} />
            )}
          </div>

          <div className="worker-stats">
            <div className="worker-stat">
              <div className="ledger-num worker-stat-num">{ep.jobsPosted}</div>
              <div className="worker-stat-lbl">{t('employerDetail.jobsPosted')}</div>
            </div>
            <div className="worker-stat">
              <div className="ledger-num worker-stat-num">{openJobs.length}</div>
              <div className="worker-stat-lbl">{openJobs.length > 0 ? t('employerDetail.currentlyHiring') : t('employerDetail.notHiring')}</div>
            </div>
          </div>

          <div className="job-detail-ctas">
            {/* One functional action today. The row is the same shared
                job-detail-ctas pattern used on Job Detail (Apply + Share) so
                a future "Message Employer" action can be appended here
                later without new markup or CSS. */}
            <button className="btn btn-primary employer-detail-viewjobs-inline" onClick={scrollToOpenJobs}>{t('employerDetail.viewOpenJobs')}</button>
          </div>

          <div className="job-detail-section" id="employer-open-jobs">
            <h3>{t('employerDetail.openJobs')}</h3>
            {openJobs.length > 0 ? (
              <div className="ticket-grid">
                {openJobs.map((j) => <JobTicket key={j.id} job={j} onApply={() => navigate(`/jobs/${j.id}`)} />)}
              </div>
            ) : (
              <EmptyState
                icon="briefcase"
                title={t('employerDetail.noOpenJobs')}
                hint={t('employerDetail.noOpenJobsHint')}
                actionLabel={t('nav.browseJobs')}
                onAction={() => navigate('/jobs')}
              />
            )}
          </div>

          {reviews.length > 0 && (
            <div className="job-detail-section">
              <h3>{t('employerDetail.reviews')}</h3>
              {reviews.map((r) => (
                <div className="review-card" key={r.id}>
                  <div className="review-head">
                    <div className="id-chip">
                      <span className="av">{r.by[0]}</span>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.by}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{r.role} · {r.date}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                      <Stars value={r.overall} size={13} />
                      {r.verified && (
                        <span className="verified-badge"><Icon name="check" size={10} /> {t('workerDetail.reviewedAfterJob')}</span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="browse-banner">
          <p>{t('employerDetail.wantToApply')}</p>
          <div className="browse-banner-ctas">
            <button className="btn btn-primary" onClick={() => navigate('/register')}>{t('common.register')}</button>
            <button className="btn btn-outline" onClick={() => navigate('/login')}>{t('common.logIn')}</button>
          </div>
        </div>
      </section>

      <div className="sticky-apply-bar">
        <div className="sticky-apply-wage">{ep.rating.toFixed(1)} ★ · {ep.jobsPosted} {t('employerDetail.jobsPosted')}</div>
        <button className="btn btn-primary" onClick={scrollToOpenJobs}>{t('employerDetail.viewOpenJobs')}</button>
      </div>
    </>
  );
}
