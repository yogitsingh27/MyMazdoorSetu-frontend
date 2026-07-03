import { useParams, useNavigate } from 'react-router-dom';
import { useServiceData, useIntentGate, useIntentResumeToast } from '@/hooks';
import { WorkerService } from '@/services';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import Icon from '@/components/common/Icon';
import { Stars } from '@/components/common/Rating';
import { RatingBars } from '@/components/common/Reviews';
import { Avatar } from '@/components/common/Primitives';
import WorkerShowcaseCard from '@/components/landing/WorkerShowcaseCard';
import EmptyState from '@/components/common/EmptyState';
import { PageSkeleton } from '@/components/common/Skeleton';
import { WORKER_RATING_CATS } from '@/data/reviews';
import { ROLE } from '@/types/roles';

export default function WorkerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const toast = useToast();
  const gate = useIntentGate();
  useIntentResumeToast();

  const { data: worker, loading } = useServiceData(() => WorkerService.get(id), [id]);

  const contactWorker = () => gate(
    { type: 'CONTACT_WORKER', payload: { workerId: id }, preselectRole: ROLE.EMPLOYER },
    () => toast(t('intent.alreadyLoggedInContact')),
  );

  if (loading) return <div className="section"><PageSkeleton stats={false} /></div>;

  if (!worker) {
    return (
      <section className="section">
        <EmptyState
          icon="users"
          title={t('workerDetail.notFound')}
          hint={t('workerDetail.notFoundHint')}
          actionLabel={t('landing.sections.viewAllWorkers')}
          onAction={() => navigate('/workers')}
        />
      </section>
    );
  }

  const wp = worker.workerProfile;
  const reviews = worker.reviews;
  const similar = worker.similar;

  return (
    <>
      <section className="section worker-detail">
        <a className="back-link" onClick={() => navigate('/workers')}>
          <Icon name="arrow" size={13} /> {t('workerDetail.backToWorkers')}
        </a>

        <div className="worker-detail-layout">
          <div className="worker-detail-head">
            <Avatar name={worker.name} color={worker.avatarColor} size={64} />
            <div>
              <h1>{worker.name}</h1>
              <div className="worker-detail-meta">
                <span className="roletag">{wp.trade}</span>
                <span><Icon name="map" size={13} color="var(--text-mute)" /> {worker.city}</span>
                {worker.verified && <span className="verified-badge"><Icon name="check" size={11} /> {t('jobDetail.verified')}</span>}
              </div>
            </div>
          </div>

          <div className="worker-detail-rating-row">
            <Stars value={wp.rating} size={16} />
            <span className="ledger-num worker-detail-rating">{wp.rating.toFixed(1)}</span>
            <span className={`avail-opt active ${wp.availability}`} style={{ pointerEvents: 'none' }}>
              <span className={`avail-dot ${wp.availability}`} /> {wp.availability === 'available' ? t('workerDetail.available') : t('workerDetail.booked')}
            </span>
          </div>

          <div className="worker-stats">
            <div className="worker-stat">
              <div className="ledger-num worker-stat-num">{wp.jobsDone}</div>
              <div className="worker-stat-lbl">{t('workerDetail.completedJobs')}</div>
            </div>
            <div className="worker-stat">
              <div className="ledger-num worker-stat-num">{wp.experienceYears}</div>
              <div className="worker-stat-lbl">{t('workerDetail.yearsExperience')}</div>
            </div>
          </div>

          <div className="job-detail-section">
            <div className="facility-list">
              {wp.skills.map((s) => <span className="tag" key={s}>{s}</span>)}
            </div>
          </div>

          <div className="job-detail-ctas">
            <button className="btn btn-primary worker-detail-contact-inline" onClick={contactWorker}>{t('workerDetail.contactWorker')}</button>
          </div>

          {wp.portfolio?.length > 0 && (
            <div className="job-detail-section">
              <h3>{t('workerDetail.portfolio')}</h3>
              <div className="portfolio-grid">
                {wp.portfolio.map((p, i) => (
                  <div className="portfolio-item" key={p + i}>
                    <div className="ph" style={{ background: 'var(--page)' }}><Icon name="file" size={18} color="var(--text-mute)" /></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="job-detail-section">
            <h3>{t('workerDetail.reviews')}</h3>
            {reviews.length === 0 ? (
              <p style={{ fontSize: 13.5, color: 'var(--text-mute)' }}>—</p>
            ) : (
              <>
                <div style={{ marginBottom: 18 }}>
                  <RatingBars reviews={reviews} categories={WORKER_RATING_CATS} />
                </div>
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
              </>
            )}
          </div>

          <div className="job-detail-section">
            <h3>{t('workerDetail.languages')}</h3>
            <div className="facility-list">
              {worker.languages.map((l) => <span className="tag" key={l}>{l}</span>)}
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="job-detail-similar">
            <h3>{t('workerDetail.similarWorkers')}</h3>
            <div className="showcase-grid">
              {similar.map((w) => <WorkerShowcaseCard key={w.id} worker={w} onClick={() => navigate(`/workers/${w.id}`)} />)}
            </div>
          </div>
        )}

        <div className="browse-banner">
          <p>{t('workerDetail.wantToContact')}</p>
          <div className="browse-banner-ctas">
            <button className="btn btn-primary" onClick={() => navigate('/register')}>{t('common.register')}</button>
            <button className="btn btn-outline" onClick={() => navigate('/login')}>{t('common.logIn')}</button>
          </div>
        </div>
      </section>

      <div className="sticky-apply-bar">
        <div className="sticky-apply-wage">{wp.rating.toFixed(1)} ★ · {wp.jobsDone} {t('workerDetail.completedJobs')}</div>
        <button className="btn btn-primary" onClick={contactWorker}>{t('workerDetail.contactWorker')}</button>
      </div>
    </>
  );
}
