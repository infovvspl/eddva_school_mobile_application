const PROGRESS_STAT_KEYS = [
  'totalLectures',
  'watchedLectures',
  'completedTopics',
  'inProgressTopics',
  'totalTopics',
  'overallPct',
] as const;

export function isProgressStats(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  return PROGRESS_STAT_KEYS.some(key => key in obj);
}

/** Flatten API progress blobs into numeric fields safe for UI. */
export function parseProgressStats(...candidates: unknown[]) {
  let stats: Record<string, unknown> | null = null;
  for (const candidate of candidates) {
    if (isProgressStats(candidate)) {
      stats = candidate;
      break;
    }
  }

  const num = (key: string, fallback = 0): number => {
    const raw = stats?.[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    if (typeof raw === 'string') {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  };

  const percentSource = stats ?? candidates.find(c => typeof c === 'number' || typeof c === 'string');

  return {
    progressPercent: toPercent(percentSource),
    totalLectures: num('totalLectures'),
    watchedLectures: num('watchedLectures'),
    completedTopics: num('completedTopics'),
    inProgressTopics: num('inProgressTopics'),
    totalTopics: num('totalTopics'),
  };
}

export function toPercent(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return clampPercent(value);
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return clampPercent(parsed);
    return fallback;
  }

  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const candidate =
      obj.overallPct ??
      obj.progressPercent ??
      obj.percent ??
      obj.pct ??
      obj.completionPct ??
      obj.progress;
    if (candidate !== undefined) return toPercent(candidate, fallback);
  }

  return fallback;
}

function clampPercent(value: number) {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}
