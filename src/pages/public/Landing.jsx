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

import { useLanguage } from '@/contexts/LanguageContext';
import { JOBS } from '@/data/jobs';
import { FEATURED_WORKERS } from '@/data/showcase';
import { CONSTRUCTION_PROJECTS } from '@/data/constructionProjects';
import { ROLE, ROLE_ORDER, ROLE_META } from '@/types/roles';
import {
  AUDIENCE_ROUTES,
  WHY_MMS_POINTS,
  TRUST_SAFETY_POINTS,
  IDENTITY_PILLARS,
  CONTRACTOR_VALUE_POINTS,
  EMPLOYER_VALUE_POINTS,
  AGENT_VALUE_POINTS,
} from '@/config/landing';

const LANDING_ROLES = ROLE_ORDER.filter((r) => r !== ROLE.ADMIN);
const identitySampleWorker = FEATURED_WORKERS[1] || FEATURED_WORKERS[0];

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();
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

  const routes = AUDIENCE_ROUTES[audience];
  const audienceText = {
    headingPre: t(`landing.audiences.${audience}.headingPre`),
    headingAccent: t(`landing.audiences.${audience}.headingAccent`),
    description: t(`landing.audiences.${audience}.description`),
    ctaLabel: t(`landing.audiences.${audience}.ctaLabel`),
    secondaryLabel: t(`landing.audiences.${audience}.secondaryLabel`),
  };
  const steps = t(`landing.howItWorks.${audience}`);
  const faqItems = t('landing.faq.items');

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <AudienceSwitcher active={audience} onChange={setAudience} />
            <h1>{audienceText.headingPre} <span className="accent">{audienceText.headingAccent}</span></h1>
            <p className="sub">{audienceText.description}</p>
            <div className="hero-ctas">
              <button className="btn btn-primary" onClick={() => goTo(routes.ctaTarget)}>{audienceText.ctaLabel}</button>
              {routes.secondaryTarget.startsWith('#') ? (
                <a className="btn btn-outline" href={routes.secondaryTarget}>{audienceText.secondaryLabel}</a>
              ) : (
                <button className="btn btn-outline" onClick={() => goTo(routes.secondaryTarget)}>{audienceText.secondaryLabel}</button>
              )}
            </div>
          </div>
          <HeroPreview audience={audience} />
        </div>
      </section>

      {/* WHY MYMAZDOORSETU */}
      <div className="chapter">
        <section className="section" id="why">
          <div className="section-head"><h2>{t('landing.sections.why')}</h2></div>
          <div className="principle-grid">
            {WHY_MMS_POINTS.map((p) => (
              <PrincipleRow key={p.key} icon={p.icon} title={t(`landing.why.${p.key}.title`)} desc={t(`landing.why.${p.key}.desc`)} />
            ))}
          </div>
        </section>
      </div>

      {/* HOW IT WORKS */}
      <div className="chapter chapter-paper">
        <section className="section" id="how-it-works">
          <div className="section-head"><h2>{t(`landing.sections.howItWorksFor.${audience}`)}</h2></div>
          <div className="steps">
            {steps.map((s, i) => (
              <div className="step" key={s.title}>
                <div className="num-circle">{i + 1}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FEATURED WORKERS */}
      <div className="chapter">
        <section className="section" id="featured-workers">
          <div className="section-toprow">
            <h2>{t('landing.sections.featuredWorkers')}</h2>
            <a className="view-all" onClick={() => navigate('/workers')}>{t('landing.sections.viewAllWorkers')} <Icon name="arrow" size={13} /></a>
          </div>
          <div className="showcase-grid">
            {FEATURED_WORKERS.map((w) => <WorkerShowcaseCard key={w.id} worker={w} />)}
          </div>
          <div className="section-cta">
            <p>{t('landing.sections.skilledLookingForWork')}</p>
            <button className="btn btn-outline" onClick={() => navigate('/jobs')}>{t('landing.audiences.worker.ctaLabel')}</button>
          </div>
        </section>
      </div>

      {/* LATEST JOBS */}
      <div className="chapter chapter-paper">
        <section className="section" id="latest-jobs">
          <div className="section-toprow">
            <h2>{t('landing.sections.latestJobs')}</h2>
            <a className="view-all" onClick={() => navigate('/jobs')}>{t('nav.browseJobs')} <Icon name="arrow" size={13} /></a>
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
            <h2>{t('landing.sections.constructionProjectsHiring')}</h2>
            <a className="view-all" onClick={() => navigate('/projects')}>{t('landing.sections.viewProjects')} <Icon name="arrow" size={13} /></a>
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
              <h2>{t('landing.sections.digitalIdentityHeading')}</h2>
              <p>{t('landing.identity.intro')}</p>
              {identitySampleWorker && <WorkerShowcaseCard worker={identitySampleWorker} />}
              <div className={`identity-more${identityExpanded ? ' open' : ''}`}>
                {identityExpanded ? (
                  <p>{t('landing.identity.learnMoreText')}</p>
                ) : (
                  <button className="btn btn-outline" onClick={() => setIdentityExpanded(true)}>{t('landing.identity.learnMore')}</button>
                )}
              </div>
            </div>
            <div className="identity-pillars">
              {IDENTITY_PILLARS.map((p) => (
                <IdentityPillar key={p.key} icon={p.icon} title={t(`landing.identityPillars.${p.key}.title`)} desc={t(`landing.identityPillars.${p.key}.desc`)} />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* TRUST & SAFETY */}
      <div className="chapter chapter-paper">
        <section className="section" id="trust-safety">
          <div className="section-head"><h2>{t('landing.sections.trustSafety')}</h2></div>
          <div className="principle-grid">
            {TRUST_SAFETY_POINTS.map((p) => (
              <PrincipleRow key={p.key} icon={p.icon} title={t(`landing.trustSafety.${p.key}.title`)} desc={t(`landing.trustSafety.${p.key}.desc`)} />
            ))}
          </div>
        </section>
      </div>

      {/* FOR CONTRACTORS */}
      <div className="chapter">
        <section className="section persona-section" id="for-contractors">
          <div className="persona-copy">
            <h2>{t('landing.contractors.heading')}</h2>
            <p>{t('landing.contractors.description')}</p>
            <button className="btn btn-primary" onClick={() => goRegister(ROLE.CONTRACTOR)}>{t('landing.audiences.contractor.ctaLabel')}</button>
          </div>
          <div className="persona-points">
            {CONTRACTOR_VALUE_POINTS.map((p) => (
              <PrincipleRow key={p.key} icon={p.icon} title={t(`landing.contractors.points.${p.key}.title`)} desc={t(`landing.contractors.points.${p.key}.desc`)} />
            ))}
          </div>
        </section>
      </div>

      {/* FOR BUILDERS / EMPLOYERS */}
      <div className="chapter chapter-paper">
        <section className="section persona-section" id="for-employers">
          <div className="persona-copy">
            <h2>{t('landing.employers.heading')}</h2>
            <p>{t('landing.employers.description')}</p>
            <div className="persona-ctas">
              <button className="btn btn-primary" onClick={() => goRegister(ROLE.EMPLOYER)}>{t('landing.audiences.employer.ctaLabel')}</button>
              <button className="btn btn-outline" onClick={() => navigate('/workers')}>{t('landing.audiences.employer.secondaryLabel')}</button>
            </div>
          </div>
          <div className="persona-points">
            {EMPLOYER_VALUE_POINTS.map((p) => (
              <PrincipleRow key={p.key} icon={p.icon} title={t(`landing.employers.points.${p.key}.title`)} desc={t(`landing.employers.points.${p.key}.desc`)} />
            ))}
          </div>
        </section>
      </div>

      {/* FOR AGENTS */}
      <div className="chapter">
        <section className="section persona-section" id="for-agents">
          <div className="persona-copy">
            <h2>{t('landing.agents.heading')}</h2>
            <p>{t('landing.agents.description')}</p>
            <button className="btn btn-primary" onClick={() => goRegister(ROLE.AGENT)}>{t('landing.audiences.agent.ctaLabel')}</button>
          </div>
          <div className="persona-points">
            {AGENT_VALUE_POINTS.map((p) => (
              <PrincipleRow key={p.key} icon={p.icon} title={t(`landing.agents.points.${p.key}.title`)} desc={t(`landing.agents.points.${p.key}.desc`)} />
            ))}
          </div>
        </section>
      </div>

      {/* FAQ */}
      <div className="chapter chapter-paper">
        <section className="section" id="faq">
          <div className="section-head"><h2>{t('landing.sections.faqHeading')}</h2></div>
          <FaqAccordion items={faqItems} />
        </section>
      </div>

      {/* FINAL CTA — closes on the same dark register as Digital Labour Identity, flowing into the footer */}
      <div className="chapter chapter-dark">
        <section className="section" id="final-cta">
          <div className="section-head"><h2>{t('landing.sections.getStarted')}</h2></div>
          <div className="role-grid">
            {LANDING_ROLES.map((r) => (
              <div className="card role-card" key={r} onClick={() => goRoleHome(r)}>
                <div className="icon-circle" style={{ background: 'var(--page)', marginBottom: 12 }}>
                  <Icon name={ROLE_META[r].icon} size={20} color="var(--navy)" />
                </div>
                <h4 style={{ marginBottom: 6 }}>{t(`roles.${r}.label`)}</h4>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', margin: 0 }}>{t(`roles.${r}.tagline`)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
