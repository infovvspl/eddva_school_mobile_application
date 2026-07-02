import { pickVideoUrlFromRecord, resolveVideoUrl } from './videoSource';

const BUNNY_URL_KEYS = [
  'hlsUrl',
  'hlsPlaylistUrl',
  'masterPlaylistUrl',
  'manifestUrl',
  'liveStreamUrl',
  'streamUrl',
  'playbackUrl',
  'bunnyHlsUrl',
  'bunnyStreamUrl',
  'bunnyPlaybackUrl',
  'bunnyLiveUrl',
  'cdnUrl',
  'pullZoneUrl',
];

const BUNNY_HOST_RE =
  /(?:\.b-cdn\.net|\.bunnycdn\.com|\.mediadelivery\.net|video\.bunnycdn\.com)/i;

function pickString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

/** True when URL looks like Bunny CDN or an HLS manifest. */
export function isBunnyOrHlsUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    BUNNY_HOST_RE.test(url) ||
    lower.includes('.m3u8') ||
    lower.includes('/playlist') ||
    lower.includes('format=m3u8')
  );
}

function buildBunnyPlaylistUrl(
  libraryId: string,
  videoId: string,
  pullZoneHost?: string,
): string | null {
  if (!libraryId || !videoId) return null;
  const host = pullZoneHost?.replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (host) {
    return `https://${host}/${videoId}/playlist.m3u8`;
  }
  return `https://video.bunnycdn.com/play/${libraryId}/${videoId}`;
}

/** Build Bunny HLS from nested ids when API omits the full URL. */
function bunnyUrlFromIds(record: Record<string, unknown>): string | null {
  const libraryId = pickString(
    record.bunnyLibraryId,
    record.libraryId,
    record.videoLibraryId,
    record.bunny_library_id,
  );
  const videoId = pickString(
    record.bunnyVideoId,
    record.videoId,
    record.guid,
    record.bunny_video_id,
    record.streamId,
  );
  const pullZone = pickString(
    record.bunnyPullZone,
    record.pullZoneHost,
    record.cdnHostname,
    record.bunnyCdnHost,
  );

  const built = buildBunnyPlaylistUrl(libraryId, videoId, pullZone || undefined);
  return built ? resolveVideoUrl(built) : null;
}

function pickFromRecord(record?: Record<string, unknown> | null): string | null {
  if (!record) return null;

  for (const key of BUNNY_URL_KEYS) {
    const val = record[key];
    if (typeof val === 'string' && val.trim()) {
      const resolved = resolveVideoUrl(val);
      if (resolved && isBunnyOrHlsUrl(resolved)) return resolved;
    }
  }

  const generic = pickVideoUrlFromRecord(record);
  if (generic && isBunnyOrHlsUrl(generic)) return generic;

  const fromIds = bunnyUrlFromIds(record);
  if (fromIds) return fromIds;

  const bunny = record.bunny;
  if (bunny && typeof bunny === 'object') {
    const nested = pickFromRecord(bunny as Record<string, unknown>);
    if (nested) return nested;
  }

  const stream = record.stream;
  if (stream && typeof stream === 'object') {
    const nested = pickFromRecord(stream as Record<string, unknown>);
    if (nested) return nested;
  }

  return null;
}

/** Extract Bunny/HLS live URL from stream-status + session payloads. */
export function pickLiveStreamUrl(
  ...records: Array<Record<string, unknown> | null | undefined>
): string | null {
  for (const record of records) {
    const url = pickFromRecord(record ?? null);
    if (url) return url;
  }
  return null;
}

export function isBunnyStreamType(record?: Record<string, unknown> | null): boolean {
  if (!record) return false;
  const type = pickString(record.streamType, record.provider, record.cdnProvider).toLowerCase();
  if (type.includes('bunny')) return true;
  return Boolean(pickLiveStreamUrl(record));
}
