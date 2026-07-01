import { useNavigate } from 'react-router-dom';
import WorkerShowcaseCard from '@/components/landing/WorkerShowcaseCard';
import EmptyState from '@/components/common/EmptyState';
import { ALL_WORKERS } from '@/data/showcase';

export default function WorkersBrowse() {
  const navigate = useNavigate();

  return (
    <section className="section">
      <div className="section-head">
        <h2>Verified workers on MyMazdoorSetu</h2>
        <p className="section-desc">Masons, electricians, painters, plumbers, and more — verified and rated from real jobs across Delhi NCR.</p>
      </div>

      {ALL_WORKERS.length === 0 ? (
        <EmptyState icon="users" title="No verified workers yet" hint="Check back soon as more workers join and get verified." />
      ) : (
        <div className="showcase-grid">
          {ALL_WORKERS.map((w) => <WorkerShowcaseCard key={w.id} worker={w} onClick={() => navigate(`/workers/${w.id}`)} />)}
        </div>
      )}

      <div className="browse-banner">
        <p>Want to contact or hire a worker directly?</p>
        <div className="browse-banner-ctas">
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Register</button>
          <button className="btn btn-outline" onClick={() => navigate('/login')}>Log in</button>
        </div>
      </div>
    </section>
  );
}
