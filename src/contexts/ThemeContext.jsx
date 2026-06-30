import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const ThemeCtx = createContext(null);
export const useTheme = () => useContext(ThemeCtx);

// Light only for now, but the structure is here so a future dark theme is a
// token swap, not a refactor. The value is applied as data-theme on <body>.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggle = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);
  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, toggle]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
