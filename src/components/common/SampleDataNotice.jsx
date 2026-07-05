import Icon from './Icon';

// Honest banner for screens still backed by sample/mock data because the
// corresponding backend feature isn't live yet. Keeps such screens from
// masquerading as real data during beta (see docs/BETA_READINESS.md, Phase 3).
export default function SampleDataNotice({
  text = "Sample data — this section isn't live yet. It will show real information after beta.",
}) {
  return (
    <div
      className="sample-notice"
      role="note"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        marginBottom: 16,
        background: 'var(--amber-light, #fff7ed)',
        border: '1px solid var(--amber, #f59e0b)',
        borderRadius: 8,
        color: 'var(--amber-dark, #92400e)',
        fontSize: 13,
      }}
    >
      <Icon name="alert" size={15} />
      <span>{text}</span>
    </div>
  );
}
