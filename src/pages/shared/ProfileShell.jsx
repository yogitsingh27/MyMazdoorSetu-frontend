import { useState } from 'react';
import { PageHead } from '@/components/common/Primitives';
import { PROFILE_TABS, DEFAULT_PROFILE_TAB } from '@/config/profileTabs';
import { cn } from '@/utils/cn';

export default function ProfileShell({ role, title, desc, panels }) {
  const tabs = PROFILE_TABS[role] || [];
  const [tab, setTab] = useState(DEFAULT_PROFILE_TAB[role] || tabs[0]?.[0]);

  return (
    <div>
      <PageHead title={title} desc={desc} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {tabs.map(([key, label]) => (
          <button key={key} className={cn('btn-sm', tab === key && 'orange')} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      {panels[tab] ?? <div className="card">Coming soon.</div>}
    </div>
  );
}
