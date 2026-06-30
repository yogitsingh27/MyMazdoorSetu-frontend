import Icon from '@/components/common/Icon';
import { cn } from '@/utils/cn';

const JOB_STAGES = ['Open', 'In progress', 'Completed', 'Closed'];

export default function JobStatusStepper({ stage }) {
  const idx = JOB_STAGES.indexOf(stage);
  return (
    <div className="stepper">
      {JOB_STAGES.map((s, i) => (
        <div className="step-node" key={s}>
          {i < JOB_STAGES.length - 1 && <div className={cn('step-line', i < idx && 'done')} />}
          <div className={cn('step-circle', i < idx ? 'done' : i === idx ? 'current' : '')}>
            {i < idx ? <Icon name="check" size={13} /> : i + 1}
          </div>
          <div className="step-label">{s}</div>
        </div>
      ))}
    </div>
  );
}
