import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '@/components/common/Icon';
import JobTicket from '@/components/job/JobTicket';
import AudienceSwitcher from '@/components/landing/AudienceSwitcher';
import HeroPreview from '@/components/landing/HeroPreview';
import WorkerShowcaseCard from '@/components/landing/WorkerShowcaseCard';
import PrincipleRow from '@/components/landing/PrincipleRow';
import ProjectCard from '@/components/landing/ProjectCard';
import IdentityPillar from '@/components/landing/IdentityPillar';
import FaqAccordion from '@/components/landing/FaqAccordion';

import { JOBS } from '@/data/jobs';
import { FEATURED_WORKERS } from '@/data/showcase';
import { CONSTRUCTION_PROJECTS } from '@/data/constructionProjects';
import { ROLE, ROLE_ORDER, ROLE_META } from '@/types/roles';
import {
  AUDIENCE_CONTENT,
  HOW_IT_WORKS_BY_ROLE,
  WHY_MMS_POINTS,
  TRUST_SAFETY_POINTS,
  IDENTITY_PILLARS,
  IDENTITY_LEARN_MORE,
  CONTRACTOR_VALUE_POINTS,
  EMPLOYER_VALUE_POINTS,
  AGENT_VALUE_POINTS,
  LANDING_FAQS,
} from '@/config/landing';

const LANDING_ROLES = ROLE_ORDER.filter((r) => r !== ROLE.ADMIN);
const identitySampleWorker = FEATURED_WORKERS[1] || FEATURED_WORKERS[0];

export default function Landing() {
  const navigate = useNavigate();
  const [audience, setAudience] = useState(ROLE.WORKER);
  const [identityExpanded, setIdentityExpanded] = useState(false);

  const goRegister = (roleKey) => navigate('/register', { state: { preselectRole: roleKey } });

  // Workers browse first, register only once they act on a specific job —
  // everyone else's primary action naturally is registering.
  const goRoleHome = (roleKey) => (roleKey === ROLE.WORKER ? navigate('/jobs') : goRegister(roleKey));

  const goTo = (target) => {
    if (target === 'register') return goRegister(audience);
    if (target.startsWith('#')) return;
    navigate(target);
  };

  const content = AUDIENCE_CONTENT[audience];
  const steps = HOW_IT_WORKS_BY_ROLE[audience];

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <AudienceSwitcher active={audience} onChange={setAudience} />
            <h1>{content.headingPre} <span className="accent">{content.headingAccent}</span></h1>
            <p className="sub">{content.description}</p>
            <div className="hero-ctas">
              <button className="btn btn-primary" onClick={() => goTo(content.ctaTarget)}>{content.ctaLabel}</button>
              {content.secondaryTarget.startsWith('#') ? (
                <a className="btn btn-outline" href={content.secondaryTarget}>{content.secondaryLabel}</a>
              ) : (
                <button className="btn btn-outline" onClick={() => goTo(content.secondaryTarget)}>{content.secondaryLabel}</button>
              )}
            </div>
          </div>
          <HeroPreview audience={audience} />
        </div>
      </section>

      {/* WHY MYMAZDOORSETU */}
      <div className="chapter">
        <section className="section" id="why">
          <div className="section-head"><h2>Why MyMazdoorSetu</h2></div>
          <div className="principle-grid">
            {WHY_MMS_POINTS.map((p) => <PrincipleRow key={p.title} {...p} />)}
          </div>
        </section>
      </div>

      {/* HOW IT WORKS */}
      <div className="chapter chapter-paper">
        <section className="section" id="how-it-works">
          <div className="section-head"><h2>How it works for {ROLE_META[audience].short.toLowerCase()}s</h2></div>
          <div className="steps">
            {steps.map(([n, title, desc]) => (
              <div className="step" key={n}>
                <div className="num-circle">{n}</div>
                <h4>{title}</h4>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FEATURED WORKERS */}
      <div className="chapter">
        <section className="section" id="featured-workers">
          <div className="section-toprow">
            <h2>Featured verified workers</h2>
            <a className="view-all" onClick={() => navigate('/workers')}>View all workers <Icon name="arrow" size={13} /></a>
          </div>
          <div className="showcase-grid">
            {FEATURED_WORKERS.map((w) => <WorkerShowcaseCard key={w.id} worker={w} />)}
          </div>
          <div className="section-cta">
            <p>Skilled and looking for work near you?</p>
            <button className="btn btn-outline" onClick={() => navigate('/jobs')}>Find Work</button>
          </div>
        </section>
      </div>

      {/* LATEST JOBS */}
      <div className="chapter chapter-paper">
        <section className="section" id="latest-jobs">
          <div className="section-toprow">
            <h2>Latest jobs</h2>
            <a className="view-all" onClick={() => navigate('/jobs')}>Browse jobs <Icon name="arrow" size={13} /></a>
          </div>
          <div className="ticket-grid">
            {JOBS.filter((j) => j.status === 'open').slice(0, 4).map((j) => (
              <JobTicket key={j.id} job={j} onApply={() => goRegister(ROLE.WORKER)} />
            ))}
          </div>
        </section>
      </div>

      {/* CONSTRUCTION PROJECTS */}
      <div className="chapter">
        <section className="section" id="construction-projects">
          <div className="section-toprow">
            <h2>Construction projects hiring now</h2>
            <a className="view-all" onClick={() => navigate('/projects')}>View projects <Icon name="arrow" size={13} /></a>
          </div>
          <div className="project-grid">
            {CONSTRUCTION_PROJECTS.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      </div>

      {/* DIGITAL LABOUR IDENTITY — flagship section, dark band */}
      <div className="chapter chapter-dark">
        <section className="section" id="digital-identity">
          <div className="identity-layout">
            <div className="identity-intro">
              <h2>Your Digital Labour Identity</h2>
              <p>Every verified worker on MyMazdoorSetu builds a single, portable identity that grows stronger with every job completed — instead of starting from zero at every new site.</p>
              {identitySampleWorker && <WorkerShowcaseCard worker={identitySampleWorker} />}
              <div className={`identity-more${identityExpanded ? ' open' : ''}`}>
                {identityExpanded ? (
                  <p>{IDENTITY_LEARN_MORE}</p>
                ) : (
                  <button className="btn btn-outline" onClick={() => setIdentityExpanded(true)}>Learn More</button>
                )}
              </div>
            </div>
            <div className="identity-pillars">
              {IDENTITY_PILLARS.map((p) => <IdentityPillar key={p.title} {...p} />)}
            </div>
          </div>
        </section>
      </div>

      {/* TRUST & SAFETY */}
      <div className="chapter chapter-paper">
        <section className="section" id="trust-safety">
          <div className="section-head"><h2>Trust & safety</h2></div>
          <div className="principle-grid">
            {TRUST_SAFETY_POINTS.map((p) => <PrincipleRow key={p.title} {...p} />)}
          </div>
        </section>
      </div>

      {/* FOR CONTRACTORS */}
      <div className="chapter">
        <section className="section persona-section" id="for-contractors">
          <div className="persona-copy">
            <h2>For Contractors (ThekeDar)</h2>
            <p>Run your crew and win more sites — manage workers, track projects, and get matched to builders looking for a contractor they can trust.</p>
            <button className="btn btn-primary" onClick={() => goRegister(ROLE.CONTRACTOR)}>Register as a Contractor</button>
          </div>
          <div className="persona-points">
            {CONTRACTOR_VALUE_POINTS.map((p) => <PrincipleRow key={p.title} {...p} />)}
          </div>
        </section>
      </div>

      {/* FOR BUILDERS / EMPLOYERS */}
      <div className="chapter chapter-paper">
        <section className="section persona-section" id="for-employers">
          <div className="persona-copy">
            <h2>For Builders & Employers</h2>
            <p>Post a job, review verified profiles with real ratings and work history, and hire with confidence — no informal middlemen required.</p>
            <div className="persona-ctas">
              <button className="btn btn-primary" onClick={() => goRegister(ROLE.EMPLOYER)}>Post a Job</button>
              <button className="btn btn-outline" onClick={() => navigate('/workers')}>Browse Workers</button>
            </div>
          </div>
          <div className="persona-points">
            {EMPLOYER_VALUE_POINTS.map((p) => <PrincipleRow key={p.title} {...p} />)}
          </div>
        </section>
      </div>

      {/* FOR AGENTS */}
      <div className="chapter">
        <section className="section persona-section" id="for-agents">
          <div className="persona-copy">
            <h2>For Agents</h2>
            <p>Bring workers onto the platform, help them get verified, and stay connected to every job and contractor in your coverage area.</p>
            <button className="btn btn-primary" onClick={() => goRegister(ROLE.AGENT)}>Register as an Agent</button>
          </div>
          <div className="persona-points">
            {AGENT_VALUE_POINTS.map((p) => <PrincipleRow key={p.title} {...p} />)}
          </div>
        </section>
      </div>

      {/* FAQ */}
      <div className="chapter chapter-paper">
        <section className="section" id="faq">
          <div className="section-head"><h2>Frequently asked questions</h2></div>
          <FaqAccordion items={LANDING_FAQS} />
        </section>
      </div>

      {/* FINAL CTA — closes on the same dark register as Digital Labour Identity, flowing into the footer */}
      <div className="chapter chapter-dark">
        <section className="section" id="final-cta">
          <div className="section-head"><h2>Get started</h2></div>
          <div className="role-grid">
            {LANDING_ROLES.map((r) => {
              const m = ROLE_META[r];
              return (
                <div className="card role-card" key={r} onClick={() => goRoleHome(r)}>
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
      </div>
    </>
  );
}
