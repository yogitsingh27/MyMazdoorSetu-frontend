import Icon from '@/components/common/Icon';

export default function IdentityPillar({ icon, title, desc }) {
  return (
    <div className="identity-pillar">
      <div className="icon-circle identity-icon"><Icon name={icon} size={18} color="#fff" /></div>
      <div>
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </div>
  );
}
