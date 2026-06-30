import Icon from './Icon';

export default function EmptyState({ icon = 'file', title, hint, actionLabel, onAction }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name={icon} size={24} color="var(--text-mute)" /></div>
      <div className="empty-title">{title}</div>
      {hint && <p className="empty-hint">{hint}</p>}
      {actionLabel && (
        <button className="btn btn-primary" onClick={onAction}>
          <Icon name="plus" size={15} /> {actionLabel}
        </button>
      )}
    </div>
  );
}
