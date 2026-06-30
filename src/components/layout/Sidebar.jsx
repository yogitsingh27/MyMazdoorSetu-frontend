import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import { NAV_LINKS } from '@/config/navigation';
import { ROLE_META } from '@/types/roles';
import { cn } from '@/utils/cn';

export default function Sidebar({ role, basePath }) {
  const links = NAV_LINKS[role] || [];
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="sidebar" aria-label={`${ROLE_META[role]?.label ?? role} navigation`}>
      <div className="side-role">{ROLE_META[role]?.label ?? role}</div>
      {links.map(([key, icon, label]) => {
        const to = `${basePath}/${key}`;
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <a
            key={key}
            className={cn('side-link', active && 'active')}
            aria-current={active ? 'page' : undefined}
            onClick={() => navigate(to)}
          >
            <Icon name={icon} size={16} />
            {label}
          </a>
        );
      })}
    </nav>
  );
}
