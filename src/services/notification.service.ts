import { USE_MOCK } from '../config/appConfig';
import { mockNotificationService } from '../mocks/mockNotificationService';
import { parseNotificationsResponse, parseUnreadCount } from '../utils/notificationMappers';
import api from './api';

async function tryNotificationGet(
  paths: string[],
  params?: { page?: number; limit?: number },
): Promise<{ data: unknown; path: string }> {
  const query = { page: params?.page ?? 1, limit: params?.limit ?? 30 };
  for (const path of paths) {
    try {
      const res = await api.get(path, { params: query });
      const items = parseNotificationsResponse(res.data);
      if (items.length > 0) {
        return { data: res.data, path };
      }
    } catch {
      /* try next route */
    }
  }

  for (const path of paths) {
    try {
      const res = await api.get(path, { params: query });
      return { data: res.data, path };
    } catch {
      /* try next route */
    }
  }

  throw new Error('Notifications unavailable');
}

const LIST_PATHS = [
  '/notifications',
  '/students/notifications',
  '/student/notifications',
  '/announcements',
  '/students/announcements',
  '/messages/notifications',
  '/students/messages',
];

const realNotificationService = {
  list: async (params?: { page?: number; limit?: number }) => {
    const result = await tryNotificationGet(LIST_PATHS, params);
    if (__DEV__) console.log('[notifications] loaded via', result.path);
    return { data: result.data };
  },

  unreadCount: async () => {
    const countPaths = [
      '/notifications/unread-count',
      '/students/notifications/unread-count',
      '/student/notifications/unread-count',
    ];
    for (const path of countPaths) {
      try {
        const res = await api.get(path);
        return { data: parseUnreadCount(res.data) };
      } catch {
        /* next */
      }
    }
    try {
      const res = await realNotificationService.list({ limit: 50 });
      const items = parseNotificationsResponse(res.data);
      return { data: items.filter(n => !n.read).length };
    } catch {
      return { data: 0 };
    }
  },

  markRead: async (id: string) => {
    const attempts = [
      () => api.patch(`/notifications/${id}/read`),
      () => api.patch(`/notifications/${id}`, { read: true, isRead: true }),
      () => api.patch(`/students/notifications/${id}/read`),
    ];
    for (const fn of attempts) {
      try {
        return await fn();
      } catch {
        /* next */
      }
    }
    throw new Error('Could not mark notification read');
  },

  markAllRead: async () => {
    const attempts = [
      () => api.post('/notifications/read-all'),
      () => api.patch('/notifications/read-all'),
      () => api.post('/students/notifications/read-all'),
    ];
    for (const fn of attempts) {
      try {
        return await fn();
      } catch {
        /* next */
      }
    }
    throw new Error('Could not mark all notifications read');
  },
};

export const notificationService = USE_MOCK
  ? mockNotificationService
  : realNotificationService;
