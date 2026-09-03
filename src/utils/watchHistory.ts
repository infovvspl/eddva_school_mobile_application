import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@eddva/watch_history';
const MAX_ENTRIES = 12;
// Anything essentially finished should not be offered as "continue".
const COMPLETE_AT = 95;

export type WatchEntry = {
  id: string;
  title: string;
  subjectName?: string;
  teacherName?: string;
  thumbnailUrl?: string | null;
  durationMins?: number;
  /** 0-100 */
  percent: number;
  lastPositionSeconds: number;
  watchedAt: number;
};

/**
 * Local "continue watching" index.
 *
 * The API stores watch progress per recording but exposes no way to list the
 * recordings a student has progress on, so the shelf is driven from a local
 * index written when playback starts. Progress for the entries actually shown
 * is refreshed from the server, which stays the source of truth for position.
 *
 * Storage failures are swallowed on purpose: this is a convenience surface,
 * and losing it must never break playback or the dashboard.
 */
const read = async (): Promise<WatchEntry[]> => {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(e => e && e.id) : [];
  } catch (e) {
    console.warn('[watchHistory] read failed', e);
    return [];
  }
};

const write = async (entries: WatchEntry[]) => {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch (e) {
    console.warn('[watchHistory] write failed', e);
  }
};

/** Called when playback starts. Moves the recording to the front of the shelf. */
export const recordWatch = async (
  entry: Omit<WatchEntry, 'watchedAt' | 'percent' | 'lastPositionSeconds'> &
    Partial<Pick<WatchEntry, 'percent' | 'lastPositionSeconds'>>,
) => {
  if (!entry?.id) return;
  const list = await read();
  const existing = list.find(e => e.id === entry.id);
  const next: WatchEntry = {
    ...entry,
    // Keep any progress already known; opening a video does not reset it.
    percent: entry.percent ?? existing?.percent ?? 0,
    lastPositionSeconds: entry.lastPositionSeconds ?? existing?.lastPositionSeconds ?? 0,
    watchedAt: Date.now(),
  };
  await write([next, ...list.filter(e => e.id !== entry.id)]);
};

/** Called as playback advances, on the same throttle as the server upsert. */
export const updateWatchProgress = async (
  id: string,
  percent: number,
  lastPositionSeconds: number,
) => {
  if (!id) return;
  const list = await read();
  const i = list.findIndex(e => e.id === id);
  if (i === -1) return;
  list[i] = {
    ...list[i],
    percent: Math.max(0, Math.min(100, Math.round(percent))),
    lastPositionSeconds: Math.max(0, Math.floor(lastPositionSeconds)),
    watchedAt: Date.now(),
  };
  await write(list);
};

/**
 * Entries worth resuming: started, not finished, newest first. Returns an empty
 * array when there is nothing — the caller hides the shelf entirely.
 */
export const getContinueWatching = async (limit = 6): Promise<WatchEntry[]> => {
  const list = await read();
  return list
    .filter(e => e.percent > 0 && e.percent < COMPLETE_AT)
    .sort((a, b) => b.watchedAt - a.watchedAt)
    .slice(0, limit);
};

export const clearWatchHistory = async () => {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {
    console.warn('[watchHistory] clear failed', e);
  }
};
