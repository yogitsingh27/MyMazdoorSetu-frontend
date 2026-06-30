import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import JobTicket from '@/components/job/JobTicket';
import { JOBS } from '@/data/jobs';
import { ROLE, ROLE_ORDER, ROLE_META } from '@/types/roles';

const LANDING_ROLES = ROLE_ORDER.filter((r) => r !== ROLE.ADMIN);

const STEPS = [
  ['1', 'Register', 'Create your account as worker, contractor, employer, or agent'],
  ['2', 'Get verified', 'Confirm your identity with Aadhaar, Voter ID, or PAN'],
  ['3', 'Find a match', 'Browse jobs or workers based on trade, location, and rating'],
  ['4', 'Get paid, get rated', 'Complete the work and build a verified track record'],
];

export default function Landing() {
  const navigate = useNavigate();

  // THE FIX: the role chosen here is no longer discarded — it's passed
  // straight into the register flow as a preselected role.
  const pickRole = (roleKey) => navigate('/register', { state: { preselectRole: roleKey } });

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <span className="eyebrow"><Icon name="shield" size={13} /> Verified workers, tracked jobs</span>
            <h1>Find skilled work, <span className="accent">or the right worker</span> — near you.</h1>
            <p className="sub">A platform that connects workers, contractors, and employers for every kind of work — registered, tracked, and dispute-free.</p>
            <div className="hero-ctas">
              <button className="btn btn-primary" onClick={() => pickRole(ROLE.WORKER)}>Find work</button>
              <button className="btn btn-outline" onClick={() => pickRole(ROLE.EMPLOYER)}>Hire workers</button>
            </div>
            <div className="search-bar">
              <Icon name="search" size={16} color="var(--text-mute)" />
              <input placeholder="Search by trade — Mason, Electrician, Painter…" />
              <div className="divider" />
              <button className="btn btn-primary" onClick={() => navigate('/jobs')}>Search</button>
            </div>
          </div>
          <div className="hero-art" />
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>How it works</h2></div>
        <div className="steps">
          {STEPS.map(([n, title, desc]) => (
            <div className="step" key={n}>
              <div className="num-circle">{n}</div>
              <h4>{title}</h4>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-toprow">
          <h2>Open jobs right now</h2>
          <a className="view-all" onClick={() => navigate('/jobs')}>View all <Icon name="arrow" size={13} /></a>
        </div>
        <div className="ticket-grid">
          {JOBS.filter((j) => j.status === 'open').slice(0, 4).map((j) => (
            <JobTicket key={j.id} job={j} onApply={() => pickRole(ROLE.WORKER)} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Choose how you'll use MyMazdoorSetu</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {LANDING_ROLES.map((r) => {
            const m = ROLE_META[r];
            return (
              <div className="card role-card" key={r} style={{ marginBottom: 0 }} onClick={() => pickRole(r)}>
                <div className="icon-circle" style={{ background: 'var(--page)', marginBottom: 12 }}>
                  <Icon name={m.icon} size={20} color="var(--navy)" />
                </div>
                <h4 style={{ marginBottom: 6 }}>{m.label}</h4>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0 }}>{m.tagline}</p>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
