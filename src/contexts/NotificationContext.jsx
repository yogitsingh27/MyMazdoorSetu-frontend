import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { NotificationService, MessageService } from '@/services';
import { useAuth } from './AuthContext';

const NotificationCtx = createContext(null);
export const useNotifications = () => useContext(NotificationCtx);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadMessages(0);
      return;
    }
    let live = true;
    NotificationService.list().then((n) => live && setNotifications(n));
    MessageService.unreadCount().then((c) => live && setUnreadMessages(c));
    return () => { live = false; };
  }, [isAuthenticated]);

  const markAllRead = useCallback(() => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })));
    NotificationService.markAllRead();
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const value = useMemo(() => ({
    notifications,
    unreadNotifications,
    unreadMessages,
    markAllRead,
  }), [notifications, unreadNotifications, unreadMessages, markAllRead]);

  return <NotificationCtx.Provider value={value}>{children}</NotificationCtx.Provider>;
}
