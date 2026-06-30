import ProfileShell from '@/pages/shared/ProfileShell';
import Icon from '@/components/common/Icon';
import { useAuth } from '@/contexts/AuthContext';
import EmptyState from '@/components/common/EmptyState';

function AccountPanel() {
  const { user } = useAuth();
  return (
    <div className="card">
      <h3>Account</h3>
      <div className="form-grid">
        <div className="field"><label>Name</label><input defaultValue={user?.name || ''} disabled /></div>
        <div className="field"><label>Phone</label><input defaultValue={user?.phone || ''} disabled /></div>
      </div>
    </div>
  );
}

const PERMISSIONS = ['Manage users', 'Manage jobs', 'Resolve complaints', 'View analytics', 'Manage settings'];

function PermissionsPanel() {
  return (
    <div className="card">
      <h3>Permissions</h3>
      {PERMISSIONS.map((p) => (
        <div className="toggle-row" key={p}>
          <div className="tlabel">{p}</div>
          <button className="switch on" />
        </div>
      ))}
    </div>
  );
}

function SystemLogsPanel() {
  return (
    <div className="card">
      <h3>System logs</h3>
      <EmptyState icon="file" title="No system logs to show yet" hint="Admin actions like role changes and account suspensions will be recorded here." />
    </div>
  );
}

function SecurityPanel() {
  return (
    <div className="card">
      <h3>Security</h3>
      <div className="toggle-row">
        <div><div className="tlabel">Two-factor authentication</div><div className="thint">Require an OTP for admin logins</div></div>
        <button className="switch on" />
      </div>
      <div className="toggle-row">
        <div className="tlabel" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="shield" size={14} color="var(--teal)" /> Session active since today</div>
      </div>
    </div>
  );
}

export default function AdminProfile() {
  return (
    <ProfileShell
      role="admin"
      title="Admin account"
      desc="Platform administration settings."
      panels={{
        details: <AccountPanel />,
        permissions: <PermissionsPanel />,
        logs: <SystemLogsPanel />,
        security: <SecurityPanel />,
      }}
    />
  );
}
