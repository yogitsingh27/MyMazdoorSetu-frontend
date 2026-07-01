import { useNavigate } from 'react-router-dom';
import ProjectCard from '@/components/landing/ProjectCard';
import EmptyState from '@/components/common/EmptyState';
import { CONSTRUCTION_PROJECTS } from '@/data/constructionProjects';

export default function ProjectsBrowse() {
  const navigate = useNavigate();

  return (
    <section className="section">
      <div className="section-head">
        <h2>Construction sites hiring right now</h2>
        <p className="section-desc">Ongoing and upcoming projects across Delhi NCR where contractors and employers on MyMazdoorSetu are looking for workers.</p>
      </div>

      {CONSTRUCTION_PROJECTS.length === 0 ? (
        <EmptyState icon="briefcase" title="No projects listed yet" hint="Check back soon as more contractors and builders list their sites." />
      ) : (
        <div className="project-grid">
          {CONSTRUCTION_PROJECTS.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      <div className="browse-banner">
        <p>Looking for work on one of these sites?</p>
        <div className="browse-banner-ctas">
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Register</button>
          <button className="btn btn-outline" onClick={() => navigate('/login')}>Log in</button>
        </div>
      </div>
    </section>
  );
}
