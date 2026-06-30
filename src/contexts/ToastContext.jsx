import { createContext, useContext, useState, useCallback } from 'react';
import Icon from '@/components/common/Icon';

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((msg, kind = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-wrap" aria-live="polite">
        {toasts.map((t) => (
          <div className={`toast toast-${t.kind}`} key={t.id} role="status">
            <Icon name={t.kind === 'success' ? 'check' : 'bell'} size={15} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
