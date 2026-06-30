import { respond } from './http';
import { NOTIFICATIONS } from '@/data/notifications';

export const NotificationService = {
  async list() { return respond(NOTIFICATIONS); },
  async unreadCount() { return respond(NOTIFICATIONS.filter((n) => !n.read).length); },
  async markAllRead() { return respond({ ok: true }); },
};
