import { AppState, type AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchMergedNotifications,
} from './notificationFeed.service';
import { displayLocalNotification } from './notificationDisplay';
import { checkNotificationPermission } from '../utils/permissions';
import type { AppNotification } from '../types/notification';

const LAST_NOTIF_IDS_KEY = 'eddva_last_notif_ids';
const SESSION_SEED_KEY = 'eddva_notif_session_seeded';
const POLL_MS = 30_000;
const MAX_STORED_IDS = 250;

async function getStoredIds(key: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(list);
  } catch {
    return new Set();
  }
}

async function saveStoredIds(key: string, ids: Set<string>): Promise<void> {
  const list = [...ids].slice(-MAX_STORED_IDS);
  await AsyncStorage.setItem(key, JSON.stringify(list));
}

function pickNewest(items: AppNotification[]): AppNotification | undefined {
  return items.find(n => !n.read) ?? items[0];
}

async function pollForNewNotifications(): Promise<void> {
  const granted = await checkNotificationPermission();
  if (!granted) return;

  const merged = await fetchMergedNotifications(80);
  const prevIds = await getStoredIds(LAST_NOTIF_IDS_KEY);
  const currentIds = new Set(merged.map(n => n.id));
  const sessionSeeded = await AsyncStorage.getItem(SESSION_SEED_KEY);

  if (!sessionSeeded) {
    const unread = merged.filter(n => !n.read);
    const target = pickNewest(unread);
    if (target) {
      await displayLocalNotification(
        target.title,
        target.body || 'New update from Team EDDVA',
      );
    }
    await AsyncStorage.setItem(SESSION_SEED_KEY, '1');
  } else {
    const fresh = merged.filter(n => !prevIds.has(n.id));
    const target = pickNewest(fresh);
    if (target) {
      await displayLocalNotification(
        target.title,
        target.body || 'New update from Team EDDVA',
      );
    }
  }

  await saveStoredIds(LAST_NOTIF_IDS_KEY, currentIds);
}

/** Tray alerts when new inbox or calendar items appear. */
export function startInboxNotificationSync(): () => void {
  let timer: ReturnType<typeof setInterval> | null = null;
  let running = false;

  const poll = async () => {
    if (running) return;
    running = true;
    try {
      await pollForNewNotifications();
    } catch {
      /* offline or auth */
    } finally {
      running = false;
    }
  };

  const onAppState = (state: AppStateStatus) => {
    if (state === 'active') poll();
  };

  poll();
  timer = setInterval(poll, POLL_MS);
  const sub = AppState.addEventListener('change', onAppState);

  return () => {
    if (timer) clearInterval(timer);
    sub.remove();
  };
}

/** After user opens inbox, stop re-alerting items already on screen. */
export async function syncNotificationTrayBaseline(
  notifications: AppNotification[],
): Promise<void> {
  const ids = new Set(notifications.map(n => n.id));
  await saveStoredIds(LAST_NOTIF_IDS_KEY, ids);
}

/** Clears tray diff state (e.g. after enabling notifications). */
export async function resetInboxNotificationBaseline(): Promise<void> {
  await AsyncStorage.multiRemove([LAST_NOTIF_IDS_KEY, SESSION_SEED_KEY]);
}

export async function clearNotificationSessionSeed(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_SEED_KEY);
}
