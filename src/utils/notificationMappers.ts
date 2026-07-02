import { asArray } from './apiData';
import type { AppNotification } from '../types/notification';

function pickString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value && typeof value === 'object') {
    const o = value as Record<string, unknown>;
    for (const key of ['text', 'content', 'body', 'message', 'title', 'description']) {
      if (typeof o[key] === 'string') return (o[key] as string).trim();
    }
  }
  return '';
}

function pickBool(obj: Record<string, unknown>, keys: string[]): boolean {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === 'boolean') return v;
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  return false;
}

export function formatNotificationTime(value: unknown): string {
  if (!value) return '';
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return pickString(value) || '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function iconForType(type: string): { icon: string; color: string } {
  const t = type.toLowerCase();
  if (t.includes('doubt') || t.includes('answer')) {
    return { icon: 'comment-dots', color: '#6366F1' };
  }
  if (t.includes('live') || t.includes('class') || t.includes('lecture')) {
    return { icon: 'play-circle', color: '#0066cc' };
  }
  if (t.includes('calendar') || t.includes('event')) {
    return { icon: 'calendar-alt', color: '#10B981' };
  }
  if (t.includes('rank') || t.includes('leader') || t.includes('battle')) {
    return { icon: 'trophy', color: '#F59E0B' };
  }
  if (t.includes('study') || t.includes('plan')) {
    return { icon: 'book', color: '#2563EB' };
  }
  return { icon: 'bell', color: '#64748B' };
}

function routeFromPayload(
  data: Record<string, unknown>,
  type: string,
): Pick<AppNotification, 'routeName' | 'routeParams'> {
  const doubtId = data.doubtId || data.doubt_id;
  if (doubtId) {
    return {
      routeName: 'DoubtDetail',
      routeParams: { doubt: { id: String(doubtId) }, initialMode: 'brief' },
    };
  }

  const lectureId = data.lectureId || data.lecture_id;
  const batchId = data.batchId || data.batch_id;
  const topicId = data.topicId || data.topic_id;
  if (lectureId || topicId) {
    return {
      routeName: 'LiveClass',
      routeParams: {
        lectureId: String(lectureId || topicId),
        batchId: batchId ? String(batchId) : undefined,
        topicId: topicId ? String(topicId) : undefined,
        title: pickString(data.title || data.lectureTitle),
      },
    };
  }

  if (batchId && type.toLowerCase().includes('course')) {
    return { routeName: 'CourseCurriculum', routeParams: { batchId: String(batchId) } };
  }

  if (type.toLowerCase().includes('calendar')) {
    return { routeName: 'Calendar' };
  }
  if (type.toLowerCase().includes('schedule') || type.toLowerCase().includes('timetable')) {
    return { routeName: 'Calendar' };
  }

  return {};
}

function unwrapNotificationContainer(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  let root = data as Record<string, unknown>;
  for (let depth = 0; depth < 3; depth++) {
    let changed = false;
    for (const key of ['data', 'result', 'payload', 'response', 'notifications']) {
      const nested = root[key];
      if (Array.isArray(nested)) return nested;
      if (nested && typeof nested === 'object') {
        root = nested as Record<string, unknown>;
        changed = true;
        break;
      }
    }
    if (!changed) break;
  }
  return root;
}

function stableFallbackId(raw: Record<string, unknown>, title: string, body: string): string {
  const stamp =
    pickString(raw.createdAt) ||
    pickString(raw.created_at) ||
    pickString(raw.sentAt) ||
    pickString(raw.timestamp) ||
    pickString(raw.time) ||
    '';
  return `n-${title}-${body}-${stamp}`.replace(/\s+/g, '-').slice(0, 120);
}

export function normalizeNotification(raw: Record<string, unknown>): AppNotification | null {
  if (raw.notification && typeof raw.notification === 'object') {
    const nested = raw.notification as Record<string, unknown>;
    return normalizeNotification({
      ...nested,
      id: raw.id ?? nested.id ?? nested._id,
      read: raw.read ?? nested.read,
    });
  }

  const title =
    pickString(raw.title) ||
    pickString(raw.subject) ||
    pickString(raw.heading) ||
    pickString(raw.name) ||
    'Notification';
  const body =
    pickString(raw.body) ||
    pickString(raw.message) ||
    pickString(raw.description) ||
    pickString(raw.content) ||
    pickString(raw.text) ||
    '';

  const idRaw =
    raw.id ||
    raw._id ||
    raw.notificationId ||
    raw.notification_id ||
    raw.noticeId ||
    raw.uuid;
  const id = idRaw ? String(idRaw) : stableFallbackId(raw, title, body);

  const type =
    pickString(raw.type || raw.category || raw.notificationType || raw.kind) || 'general';
  const read = pickBool(raw, [
    'read',
    'isRead',
    'is_read',
    'seen',
    'is_seen',
    'viewed',
    'is_viewed',
  ]);
  const createdAt = raw.createdAt || raw.created_at || raw.sentAt || raw.timestamp || raw.time;
  const { icon, color } = iconForType(type);

  const data =
    raw.data && typeof raw.data === 'object'
      ? (raw.data as Record<string, unknown>)
      : raw.payload && typeof raw.payload === 'object'
        ? (raw.payload as Record<string, unknown>)
        : ({} as Record<string, unknown>);

  const route = routeFromPayload({ ...data, ...raw }, type);

  return {
    id: String(id),
    icon,
    iconColor: pickString(raw.iconColor) || color,
    title,
    body,
    time: formatNotificationTime(createdAt),
    read,
    type,
    ...route,
  };
}

export function parseNotificationsResponse(data: unknown): AppNotification[] {
  const base = unwrapNotificationContainer(data);
  const rows = asArray<Record<string, unknown>>(base, [
    'notifications',
    'items',
    'results',
    'data',
    'records',
    'rows',
    'list',
  ]);
  return rows
    .map(row => normalizeNotification(row))
    .filter((n): n is AppNotification => n != null)
    .sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return 0;
    });
}

export function parseUnreadCount(data: unknown): number {
  if (typeof data === 'number') return Math.max(0, data);
  if (!data || typeof data !== 'object') return 0;
  const o = (unwrapNotificationContainer(data) ?? data) as Record<string, unknown>;
  for (const key of ['count', 'unread', 'unreadCount', 'totalUnread', 'total']) {
    if (typeof o[key] === 'number') return Math.max(0, o[key] as number);
  }
  return 0;
}
