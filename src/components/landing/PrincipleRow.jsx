import Icon from '@/components/common/Icon';

// A platform-level idea, not a real-world entity — rendered as a typographic
// row (icon, bold heading, one line of support) instead of a bordered card.
// Cards are reserved for things with a real referent (a worker, a job, a
// project); a "principle" like Transparent Hiring isn't a thing, so boxing
// it the same way as those flattens the hierarchy between them.
export default function PrincipleRow({ icon, title, desc }) {
  return (
    <div className="principle-row">
      <Icon name={icon} size={22} color="var(--navy)" />
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}
