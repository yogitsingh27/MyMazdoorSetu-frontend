import { useState } from 'react';
import ProfileShell from '@/pages/shared/ProfileShell';
import Icon from '@/components/common/Icon';
import { RatingSummary } from '@/components/common/Rating';
import { ReviewsPanel, avgOverall } from '@/components/common/Reviews';
import { useServiceData } from '@/hooks/useServiceData';
import { WorkerService, ReviewService } from '@/services';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { WORKER_RATING_CATS } from '@/data/reviews';
import { PageSkeleton } from '@/components/common/Skeleton';

function DetailsPanel() {
  const { user } = useAuth();
  const wp = user?.workerProfile;
  const toast = useToast();
  return (
    <div className="card">
      <h3>Skills & experience</h3>
      <div className="form-grid">
        <div className="field">
          <label>Primary trade</label>
          <input defaultValue={wp?.trade || ''} placeholder="Mason" />
        </div>
        <div className="field">
          <label>Years of experience</label>
          <input type="number" defaultValue={wp?.experienceYears || ''} />
        </div>
        <div className="field full">
          <label>Skills</label>
          <input defaultValue={(wp?.skills || []).join(', ')} placeholder="Plastering, Brickwork, Tiling" />
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => toast('Profile changes saved')}>Save changes</button>
    </div>
  );
}

function PortfolioPanel() {
  const { user } = useAuth();
  const items = user?.workerProfile?.portfolio || [];
  return (
    <div className="card">
      <h3>Portfolio</h3>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12 }}>
        Photos of past work help employers and contractors judge quality before hiring.
      </div>
      <div className="portfolio-grid">
        {items.map((p, i) => (
          <div className="portfolio-item" key={p + i}>
            <div className="ph" style={{ background: 'var(--page)' }}><Icon name="file" size={18} color="var(--text-mute)" /></div>
          </div>
        ))}
        <div className="portfolio-add"><Icon name="plus" size={18} /> Add photo</div>
      </div>
    </div>
  );
}

function AvailabilityPanel() {
  const { data, loading } = useServiceData(() => WorkerService.summary(), []);
  const [availability, setAvailability] = useState(null);
  const toast = useToast();
  if (loading) return <PageSkeleton stats={false} />;
  const current = availability ?? data.availability;

  const setAvail = (v) => {
    setAvailability(v);
    WorkerService.setAvailability(v);
    toast(v === 'available' ? "You're now visible as available for work" : 'Marked as booked — hidden from new searches', v === 'available' ? 'success' : 'info');
  };

  return (
    <div className="card">
      <h3>Availability</h3>
      <div className="avail-toggle">
        <button className={`avail-opt available ${current === 'available' ? 'active' : ''}`} onClick={() => setAvail('available')}>
          <span className="avail-dot available" />Available
        </button>
        <button className={`avail-opt booked ${current === 'booked' ? 'active' : ''}`} onClick={() => setAvail('booked')}>
          <span className="avail-dot booked" />Booked
        </button>
      </div>
    </div>
  );
}

function LanguagesPanel() {
  const { user } = useAuth();
  const langs = user?.languages || [];
  return (
    <div className="card">
      <h3>Languages</h3>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {langs.map((l) => <span className="tag" key={l}>{l}</span>)}
      </div>
    </div>
  );
}

function ReviewsPanelWrapper() {
  const { data: reviews, loading } = useServiceData(() => ReviewService.forWorker(), []);
  if (loading) return <PageSkeleton stats={false} />;
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0 }}>Reviews</h3>
        <RatingSummary score={avgOverall(reviews)} count={reviews.length} />
      </div>
      <ReviewsPanel reviews={reviews} categories={WORKER_RATING_CATS} />
    </div>
  );
}

export default function WorkerProfile() {
  return (
    <ProfileShell
      role="worker"
      title="My profile"
      desc="How employers and contractors see you."
      panels={{
        details: <DetailsPanel />,
        portfolio: <PortfolioPanel />,
        availability: <AvailabilityPanel />,
        languages: <LanguagesPanel />,
        reviews: <ReviewsPanelWrapper />,
      }}
    />
  );
}
