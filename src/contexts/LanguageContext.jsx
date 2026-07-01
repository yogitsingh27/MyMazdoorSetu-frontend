import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { LANGUAGES, DEFAULT_LANGUAGE, getDictionary } from '@/locales';

const STORAGE_KEY = 'mms.lang';
const LanguageCtx = createContext(null);
export const useLanguage = () => useContext(LanguageCtx);

function readStoredLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch { /* ignore */ }
  return DEFAULT_LANGUAGE;
}

// Dot-path lookup, e.g. readKey(dict, 'landing.why.launching.title').
function readKey(dict, key) {
  return key.split('.').reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), dict);
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang);

  const setLang = useCallback((code) => {
    setLangState(code);
    try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  }, []);

  // Screen readers and browser tooling (spellcheck, translate prompts) read
  // this attribute — keep it in sync with whatever's actually on screen.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const dict = useMemo(() => getDictionary(lang), [lang]);
  const fallbackDict = useMemo(() => getDictionary(DEFAULT_LANGUAGE), []);

  // Every key falls back to English, then to the raw key itself, so a
  // partially-translated language never renders a blank string.
  const t = useCallback((key, vars) => {
    const raw = readKey(dict, key) ?? readKey(fallbackDict, key) ?? key;
    if (!vars || typeof raw !== 'string') return raw;
    return Object.keys(vars).reduce((s, k) => s.replaceAll(`{{${k}}}`, vars[k]), raw);
  }, [dict, fallbackDict]);

  const value = useMemo(() => ({ lang, setLang, t, languages: LANGUAGES }), [lang, setLang, t]);
  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}
