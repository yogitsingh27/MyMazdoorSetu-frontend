import { respond } from './http';
import { MESSAGE_THREADS } from '@/data/messages';

export const MessageService = {
  async threads() { return respond(MESSAGE_THREADS); },
  async unreadCount() { return respond(MESSAGE_THREADS.reduce((a, t) => a + t.unread, 0)); },
  async send(threadId, text) { return respond({ threadId, text, time: 'now' }); },
};
