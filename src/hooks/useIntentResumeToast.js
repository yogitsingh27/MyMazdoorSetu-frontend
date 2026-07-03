import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { INTENT_ROUTES } from '@/config/intents';

// Shows a one-time "you're logged in, go ahead" toast on whichever page
// IntentService.resume() just navigated back to. Any page that can be an
// intent's destination calls this once — the message itself is looked up
// generically from config/intents.js, so a new intent type needs no new
// code here, only a resumeMessageKey on its config entry.
export function useIntentResumeToast() {
  const location = useLocation();
  const toast = useToast();
  const { t } = useLanguage();
  const firedRef = useRef(false); // guards against StrictMode's dev-only double-invoke firing this twice

  useEffect(() => {
    if (firedRef.current) return;
    const type = location.state?.resumedIntent;
    if (!type) return;
    const key = INTENT_ROUTES[type]?.resumeMessageKey;
    if (!key) return;
    firedRef.current = true;
    toast(t(key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);
}
