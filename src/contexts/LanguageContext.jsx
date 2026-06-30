import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const LanguageCtx = createContext(null);
export const useLanguage = () => useContext(LanguageCtx);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const toggle = useCallback((l) => setLang(l), []);
  const value = useMemo(() => ({ lang, setLang: toggle }), [lang, toggle]);
  return <LanguageCtx.Provider value={value}>{children}</LanguageCtx.Provider>;
}
