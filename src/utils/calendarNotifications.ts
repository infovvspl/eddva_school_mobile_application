import { mergeCalendarEvents } from './apiData';
import { formatNotificationTime } from './notificationMappers';
import type { AppNotification } from '../types/notification';

const EVENT_COLORS: Record<string, string> = {
  live_class: '#6366f1',
  holiday: '#f43f5e',
  exam: '#ef4444',
  event: '#f59e0b',
  reminder: '#10b981',
  webinar: '#8b5cf6',
};

function eventDateStr(raw: Record<string, unknown>): string {
  const v = raw.date ?? raw.startDate ?? raw.scheduledAt ?? raw.start_at;
  return v ? String(v).split('T')[0] : '';
}

/** Include recent past (7d) and upcoming (90d) calendar items in the notifications list. */
export function isRelevantCalendarDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(`${dateStr}T12:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = new Date(today);
  from.setDate(from.getDate() - 7);
  const to = new Date(today);
  to.setDate(to.getDate() + 90);
  return d >= from && d <= to;
}

export function calendarEventsToNotifications(
  feed: unknown,
  seenIds: Set<string> = new Set(),
): AppNotification[] {
  const rows = mergeCalendarEvents(feed);
  const out: AppNotification[] = [];

  for (const raw of rows) {
    if (!raw || typeof raw !== 'object') continue;
    const ev = raw as Record<string, unknown>;
    const date = eventDateStr(ev);
    if (!isRelevantCalendarDate(date)) continue;

    const serverId = String(ev.id ?? `${ev.title}-${date}`);
    const id = `cal-${serverId}`;
    const type = String(ev.type ?? 'event');
    const title = String(ev.title ?? 'Calendar event');
    const when =
      ev.scheduledAt ?? ev.startTime
        ? formatNotificationTime(ev.scheduledAt ?? ev.startTime)
        : date;

    const bodyParts = [
      type.replace(/_/g, ' '),
      date,
      ev.batchName ? String(ev.batchName) : '',
      ev.description ? String(ev.description) : '',
    ].filter(Boolean);

    out.push({
      id,
      icon: type.includes('live') ? 'play-circle' : 'calendar-alt',
      iconColor: EVENT_COLORS[type] || '#10B981',
      title,
      body: bodyParts.join(' · '),
      time: when,
      read: seenIds.has(id),
      type: `calendar_${type}`,
      routeName: 'Calendar',
      routeParams: { selectedDate: date },
    });
  }

  return out;
}
