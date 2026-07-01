import Icon from '@/components/common/Icon';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROLE, ROLE_ORDER, ROLE_META } from '@/types/roles';

const AUDIENCES = ROLE_ORDER.filter((r) => r !== ROLE.ADMIN);

export default function AudienceSwitcher({ active, onChange }) {
  const { t } = useLanguage();

  return (
    <div className="audience-switcher" role="tablist" aria-label="Choose your audience">
      {AUDIENCES.map((r) => {
        const m = ROLE_META[r];
        const isActive = r === active;
        return (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`audience-pill${isActive ? ' active' : ''}`}
            onClick={() => onChange(r)}
          >
            <Icon name={m.icon} size={15} />
            {t(`roles.${r}.short`)}
          </button>
        );
      })}
    </div>
  );
}
