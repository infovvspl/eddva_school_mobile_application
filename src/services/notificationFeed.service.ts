import AsyncStorage from '@react-native-async-storage/async-storage';
import { calendarService } from './calendar.service';
import { notificationService } from './notification.service';
import { calendarEventsToNotifications } from '../utils/calendarNotifications';
import { parseNotificationsResponse } from '../utils/notificationMappers';
import type { AppNotification } from '../types/notification';

const SEEN_CALENDAR_KEY = 'eddva_seen_calendar_notif_ids';

function monthParam(offsetMonths = 0): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offsetMonths);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export async function getSeenCalendarNotificationIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_CALENDAR_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(list);
  } catch {
    return new Set();
  }
}

export async function markCalendarNotificationsSeen(ids: string[]): Promise<void> {
  const seen = await getSeenCalendarNotificationIds();
  ids.forEach(id => seen.add(id));
  await AsyncStorage.setItem(SEEN_CALENDAR_KEY, JSON.stringify([...seen]));
}

/** API inbox + calendar feed (events created in calendar often never hit /notifications). */
export async function fetchMergedNotifications(limit = 50): Promise<AppNotification[]> {
  const seen = await getSeenCalendarNotificationIds();

  const [notifRes, calPrev, cal0, cal1] = await Promise.allSettled([
    notificationService.list({ limit }),
    calendarService.getFeed(monthParam(-1)),
    calendarService.getFeed(monthParam(0)),
    calendarService.getFeed(monthParam(1)),
  ]);

  const apiItems =
    notifRes.status === 'fulfilled' ? parseNotificationsResponse(notifRes.value.data) : [];

  const calendarItems: AppNotification[] = [];
  if (calPrev.status === 'fulfilled') {
    calendarItems.push(...calendarEventsToNotifications(calPrev.value.data, seen));
  }
  if (cal0.status === 'fulfilled') {
    calendarItems.push(...calendarEventsToNotifications(cal0.value.data, seen));
  }
  if (cal1.status === 'fulfilled') {
    calendarItems.push(...calendarEventsToNotifications(cal1.value.data, seen));
  }

  const byId = new Map<string, AppNotification>();
  for (const n of apiItems) byId.set(n.id, n);

  for (const c of calendarItems) {
    const bareId = c.id.replace(/^cal-/, '');
    if (!byId.has(c.id) && !byId.has(bareId)) {
      byId.set(c.id, c);
    }
  }

  const merged = [...byId.values()];
  merged.sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return 0;
  });
  return merged;
}

export async function fetchMergedUnreadCount(): Promise<number> {
  const items = await fetchMergedNotifications(60);
  return items.filter(n => !n.read).length;
}
