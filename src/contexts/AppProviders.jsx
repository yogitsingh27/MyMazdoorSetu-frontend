import { ThemeProvider } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';
import { AuthProvider } from './AuthContext';
import { RoleProvider } from './RoleContext';
import { NotificationProvider } from './NotificationContext';
import { ToastProvider } from './ToastContext';

// Order matters: Role depends on Auth; Notifications depend on Auth.
export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <RoleProvider>
            <NotificationProvider>
              <ToastProvider>{children}</ToastProvider>
            </NotificationProvider>
          </RoleProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
