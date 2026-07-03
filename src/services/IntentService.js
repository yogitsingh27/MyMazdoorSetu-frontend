import { INTENT_ROUTES } from '@/config/intents';

// Remembers what an unauthenticated visitor was trying to do (Apply to Job,
// Contact Worker, ...) so it can resume after they log in or register.
//
// sessionStorage, not localStorage: this is "what I was doing just now, in
// this tab" — it should survive a refresh mid-registration (the whole point
// of this system) but not silently resurrect itself in an unrelated visit
// weeks later, or in a different tab. It naturally disappears when the tab
// closes; no explicit cleanup code is needed for that case.
const KEY = 'mms.intent';
const VERSION = 1;
const MAX_AGE_MS = 60 * 60 * 1000; // 1 hour — a stale, abandoned intent is quietly discarded rather than resumed

export const IntentService = {
  /** Called once, at the moment an unauthenticated user triggers a gated action. */
  save({ type, payload, preselectRole }) {
    try {
      sessionStorage.setItem(KEY, JSON.stringify({
        type,
        payload,
        preselectRole,
        version: VERSION,
        source: window.location.pathname, // for future debugging/analytics — not read by resume()
        createdAt: Date.now(),
      }));
    } catch { /* ignore — worst case, intent just isn't preserved */ }
  },

  /** Reads the stored intent without removing it. Returns null if missing, stale, or malformed. */
  peek() {
    let intent = null;
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) intent = JSON.parse(raw);
    } catch { /* ignore */ }
    if (!intent || intent.version !== VERSION) return null;
    if (Date.now() - intent.createdAt > MAX_AGE_MS) return null;
    return intent;
  },

  clear() {
    try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
  },

  resolvePath(intent) {
    return INTENT_ROUTES[intent.type]?.buildPath(intent.payload) ?? null;
  },

  /**
   * Called once, right after a successful login/register (and, defensively,
   * on the role-selection step — see config/intents.js). Resolves and
   * consumes a pending intent if one exists; otherwise a no-op so the caller
   * falls back to its normal post-auth destination.
   * @returns {boolean} true if it navigated somewhere, false if there was nothing to resume.
   */
  resume(navigate) {
    const intent = this.peek();
    if (!intent) return false;
    const path = this.resolvePath(intent);
    if (!path) { this.clear(); return false; }
    this.clear();
    navigate(path, { state: { resumedIntent: intent.type } });
    return true;
  },
};
