import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { IntentService } from '@/services';

// Gate any action that requires being logged in. Already authenticated ->
// run the real action now. Not authenticated -> remember the intent and
// send them to register; IntentService.resume() picks it back up once
// they're signed in. One implementation shared by every gated action
// (Apply to Job today; Save Job / Hire Worker / Book Service later).
export function useIntentGate() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (intent, onAuthenticated) => {
    if (isAuthenticated) {
      onAuthenticated();
      return;
    }
    IntentService.save(intent);
    navigate('/register', { state: { preselectRole: intent.preselectRole } });
  };
}
