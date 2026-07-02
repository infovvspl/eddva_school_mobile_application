import { mockDelay } from './delay';
import type { AppNotification } from '../types/notification';

const MOCK_ITEMS: AppNotification[] = [
  {
    id: '1',
    icon: 'play-circle',
    iconColor: '#0066cc',
    title: 'Continue your lecture',
    body: 'You left off at Kinematics Basics — pick up where you stopped.',
    time: '2h ago',
    read: false,
    type: 'lecture',
    routeName: 'LiveClass',
    routeParams: { lectureId: 'lec-1', title: 'Kinematics Basics' },
  },
  {
    id: '2',
    icon: 'calendar-alt',
    iconColor: '#10B981',
    title: 'Live class tomorrow',
    body: 'JEE Physics Master — Electrostatics at 5:00 PM.',
    time: '5h ago',
    read: false,
    type: 'calendar',
    routeName: 'Calendar',
  },
  {
    id: '3',
    icon: 'trophy',
    iconColor: '#F59E0B',
    title: 'Weekly rank update',
    body: 'You moved up to rank #42 in your batch leaderboard.',
    time: 'Yesterday',
    read: true,
    type: 'leaderboard',
    routeName: 'Leaderboard',
  },
  {
    id: '4',
    icon: 'comment-dots',
    iconColor: '#6366F1',
    title: 'Doubt answered',
    body: 'Your teacher replied to your question on Newton’s laws.',
    time: 'Yesterday',
    read: true,
    type: 'doubt',
    routeName: 'DoubtDetail',
    routeParams: { doubt: { id: 'd1' }, initialMode: 'brief' },
  },
];

let items = [...MOCK_ITEMS];

export const mockNotificationService = {
  list: async (params?: { limit?: number }) => {
    await mockDelay();
    const limit = params?.limit ?? 30;
    return { data: items.slice(0, limit) };
  },

  unreadCount: async () => {
    await mockDelay();
    return { data: items.filter(n => !n.read).length };
  },

  markRead: async (id: string) => {
    await mockDelay();
    items = items.map(n => (n.id === id ? { ...n, read: true } : n));
    return { data: { ok: true } };
  },

  markAllRead: async () => {
    await mockDelay();
    items = items.map(n => ({ ...n, read: true }));
    return { data: { ok: true } };
  },
};
