export function asArray<T = any>(data: unknown, keys: string[] = []): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return (data as any[]).filter(Boolean) as T[];

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(obj[key])) return (obj[key] as any[]).filter(Boolean) as T[];
    }
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) return (value as any[]).filter(Boolean) as T[];
    }
  }
  return [];
}

export function mergeCalendarFeed(feed: unknown): Record<string, unknown>[] {
  if (!feed) return [];
  if (Array.isArray(feed)) return feed as Record<string, unknown>[];

  const obj = feed as Record<string, unknown>;
  const nested = obj.data;
  const root =
    nested && typeof nested === 'object' && !Array.isArray(nested)
      ? (nested as Record<string, unknown>)
      : obj;

  const buckets = [
    'instituteEvents',
    'institute_events',
    'liveClasses',
    'live_classes',
    'events',
    'items',
    'feed',
  ];

  const merged: Record<string, unknown>[] = [];
  for (const key of buckets) {
    merged.push(...asArray<Record<string, unknown>>(root[key]));
  }
  return merged;
}

export function mergeCalendarEvents(feed: unknown): any[] {
  return mergeCalendarFeed(feed);
}

export function getWeeklyActivity(data: unknown): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  const obj = data as Record<string, any>;
  return obj.weeklyActivity || obj.days || obj.activity || [];
}
