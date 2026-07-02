import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../services/api';
import { resolveMediaUrl } from './mediaUrl';

export type VideoSourceConfig = {
  uri: string;
  type?: string;
  headers?: Record<string, string>;
};

/** Resolve playable video URL without breaking external CDN links. */
export function resolveVideoUrl(raw?: string | null): string | null {
  if (!raw?.trim()) return null;
  const url = raw.trim();
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    return resolveMediaUrl(url);
  }
  if (/^https?:\/\//i.test(url) || url.startsWith('//')) {
    return url.startsWith('//') ? `https:${url}` : url;
  }
  return resolveMediaUrl(url);
}

export function detectStreamType(url: string): string | undefined {
  const path = url.split('?')[0].toLowerCase();
  if (
    path.includes('.m3u8') ||
    path.includes('mpegurl') ||
    path.includes('/hls/') ||
    path.includes('/hls.') ||
    url.includes('format=m3u8') ||
    /(?:\.b-cdn\.net|\.bunnycdn\.com|\.mediadelivery\.net)/i.test(url)
  ) {
    return 'm3u8';
  }
  if (path.includes('.mpd') || path.includes('/dash/')) {
    return 'mpd';
  }
  if (path.includes('.mp4') || path.includes('.webm') || path.includes('.mov')) {
    return undefined;
  }
  return undefined;
}

function needsAuthHeader(uri: string): boolean {
  return uri.includes('eddva.in') || uri.startsWith(BASE_URL);
}

export function videoUriNeedsAuth(rawUrl?: string | null): boolean {
  const uri = resolveVideoUrl(rawUrl);
  return uri ? needsAuthHeader(uri) : false;
}

/** Build react-native-video source with stream type + auth when required. */
export function buildVideoSource(
  rawUrl?: string | null,
  authToken?: string | null,
): VideoSourceConfig | null {
  const uri = resolveVideoUrl(rawUrl);
  if (!uri) return null;

  const type = detectStreamType(uri);
  const headers: Record<string, string> = {};

  if (authToken && needsAuthHeader(uri)) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return {
    uri,
    ...(type ? { type } : {}),
    ...(Object.keys(headers).length ? { headers } : {}),
  };
}

export async function loadVideoAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('accessToken');
  } catch {
    return null;
  }
}

const VIDEO_URL_KEYS = [
  'videoUrl',
  'playbackUrl',
  'hlsUrl',
  'hlsPlaylistUrl',
  'masterPlaylistUrl',
  'bunnyHlsUrl',
  'bunnyStreamUrl',
  'bunnyPlaybackUrl',
  'bunnyLiveUrl',
  'streamUrl',
  'mediaUrl',
  'signedUrl',
  'fileUrl',
  'url',
  'recordingUrl',
  'manifestUrl',
  'contentUrl',
  'liveMeetingUrl',
  'liveStreamUrl',
  'cdnUrl',
  'pullZoneUrl',
];

/** Pick first usable video URL from a lecture/content object. */
export function pickVideoUrlFromRecord(record?: Record<string, unknown> | null): string | null {
  if (!record) return null;
  for (const key of VIDEO_URL_KEYS) {
    const val = record[key];
    if (typeof val === 'string' && val.trim()) {
      const resolved = resolveVideoUrl(val);
      if (resolved) return resolved;
    }
  }
  return null;
}
