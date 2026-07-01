import Icon from '@/components/common/Icon';
import { cn } from '@/utils/cn';

const STATUS_CLASS = { hiring: 'pill-open', 'in-progress': 'pill-active', planning: 'pill-pending' };
const STATUS_LABEL = { hiring: 'Hiring now', 'in-progress': 'In progress', planning: 'Coming soon' };

export default function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <div className="project-card-top">
        <h4>{project.name}</h4>
        <span className={cn('pill-status', STATUS_CLASS[project.status])}>{STATUS_LABEL[project.status]}</span>
      </div>
      <div className="project-meta">
        <span><Icon name="map" size={13} color="var(--text-mute)" /> {project.location}</span>
        <span>{project.builder}</span>
      </div>
      <div className="project-tags">
        {project.tradesNeeded.map((t) => <span className="tag" key={t}>{t}</span>)}
      </div>
      <div className="project-foot">
        <span className="mono ledger-num">{project.workersNeeded}</span> workers needed · {project.stage}
      </div>
    </div>
  );
}
