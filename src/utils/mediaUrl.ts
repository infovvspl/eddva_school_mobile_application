import { BASE_URL } from '../services/api';
import { asArray } from './apiData';

const IMAGE_FIELD_KEYS = [
  'thumbnailUrl',
  'thumbnail',
  'imageUrl',
  'coverImage',
  'bannerUrl',
  'batchImage',
  'coverPhoto',
  'bannerImage',
  'image',
  'photo',
  'fileUrl',
];

const LECTURE_THUMB_KEYS = [
  'thumbnailUrl',
  'thumbnail',
  'posterUrl',
  'poster',
  'videoThumbnailUrl',
  'videoThumbnail',
  'previewImageUrl',
  'previewUrl',
  'coverImage',
  'frameUrl',
];

const AVATAR_FIELD_KEYS = [
  'avatarUrl',
  'avatarURL',
  'avatar_url',
  'avatarPath',
  'avatar_path',
  'avatar',
  'profileImage',
  'profileImageUrl',
  'profile_image_url',
  'profile_image',
  'profilePhoto',
  'profilePhotoUrl',
  'profile_photo',
  'profile_photo_url',
  'profilePicture',
  'profilePictureUrl',
  'profile_picture',
  'profile_picture_url',
  'photoUrl',
  'photo_url',
  'photo',
  'picture',
  'pictureUrl',
  'picture_url',
  'displayPicture',
  'displayPictureUrl',
  'display_picture',
  'display_picture_url',
  'imageUrl',
  'image_url',
  'image',
  'mediaUrl',
  'media_url',
  'url',
];

const AVATAR_NESTED_KEYS = ['student', 'user', 'profile', 'account', 'data'];

/** Turn API-relative or localhost media paths into absolute URLs. */
export function resolveMediaUrl(raw?: string | null): string | null {
  if (!raw) return null;

  let url = raw.trim();
  if (!url || url.startsWith('local://')) return null;

  if (/^data:image\//i.test(url)) return url;

  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(url)) {
    url = url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, BASE_URL);
  }

  if (/^https?:\/\/dev-api\.eddva\.in/i.test(url)) {
    url = url.replace(/^https?:\/\/dev-api\.eddva\.in/i, BASE_URL);
  }

  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url.replace(/^\//, '')}`;
}

/** True when URL can be shown in React Native `<Image>` (not HLS/DASH/video files). */
export function isLikelyImageUrl(url: string): boolean {
  const path = url.split('?')[0].toLowerCase();
  if (/\.(m3u8|mpd|mp4|webm|mov|mkv)(\?|$)/i.test(path)) return false;
  if (
    path.includes('playlist.m3u8') ||
    path.includes('/hls/') ||
    path.includes('mpegurl') ||
    url.includes('format=m3u8')
  ) {
    return false;
  }
  if (/\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)(\?|$)/i.test(path)) return true;
  if (/(thumbnail|poster|cover|preview|thumb)/i.test(url)) return true;
  return true;
}

/** Resolve media URL only when it is a displayable image (not a video stream). */
export function resolvePosterUrl(raw?: string | null): string | null {
  const url = resolveMediaUrl(raw);
  if (!url || !isLikelyImageUrl(url)) return null;
  return url;
}

function readNestedUrl(value: unknown): string | null {
  if (typeof value === 'string') return resolveMediaUrl(value);
  if (!value || typeof value !== 'object') return null;

  const obj = value as Record<string, unknown>;
  for (const key of [
    'url',
    'uri',
    'fileUrl',
    'file_url',
    'href',
    'path',
    'src',
    'secureUrl',
    'secure_url',
    'signedUrl',
    'signed_url',
    'publicUrl',
    'public_url',
    'location',
  ]) {
    const nested = obj[key];
    if (typeof nested === 'string') {
      const resolved = resolveMediaUrl(nested);
      if (resolved) return resolved;
    }
  }
  return null;
}

/** Lecture/video poster only — not course cover art. */
export function extractLectureThumbnailUrl(
  lecture: Record<string, any> | null | undefined,
): string | null {
  if (!lecture || typeof lecture !== 'object') return null;

  for (const key of LECTURE_THUMB_KEYS) {
    const resolved = readNestedUrl(lecture[key]);
    if (resolved && isLikelyImageUrl(resolved)) return resolved;
  }

  for (const key of ['videoUrl', 'playbackUrl', 'hlsUrl', 'streamUrl', 'signedUrl']) {
    const resolved = readNestedUrl(lecture[key]);
    if (resolved && isLikelyImageUrl(resolved)) return resolved;
  }

  return null;
}

export function extractCourseImageUrl(course: Record<string, any> | null | undefined): string | null {
  if (!course || typeof course !== 'object') return null;

  for (const key of IMAGE_FIELD_KEYS) {
    const resolved = readNestedUrl(course[key]);
    if (resolved) return resolved;
  }

  if (course.batch && typeof course.batch === 'object') {
    return extractCourseImageUrl(course.batch);
  }

  return null;
}

function avatarFromRecord(record: Record<string, any>): string | null {
  for (const key of AVATAR_FIELD_KEYS) {
    const resolved = readNestedUrl(record[key]);
    if (resolved && isLikelyImageUrl(resolved)) return resolved;
  }
  return null;
}

/** Protected API media needs Bearer token; S3/CDN URLs are usually public. */
export function mediaUrlNeedsAuth(url: string): boolean {
  if (/amazonaws\.com|cloudfront\.net|\.s3\./i.test(url)) return false;
  return /eddva\.in/i.test(url);
}

/** Student / auth profile photo — checks top-level and nested user objects. */
export function extractAvatarUrl(user: Record<string, any> | null | undefined): string | null {
  if (!user || typeof user !== 'object') return null;

  const direct = avatarFromRecord(user);
  if (direct) return direct;

  const mediaList = asArray(user, ['media', 'files', 'attachments', 'uploads']);
  for (const item of mediaList) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const kind = String(row.type ?? row.kind ?? row.purpose ?? '').toLowerCase();
    if (kind && !kind.includes('avatar') && !kind.includes('profile') && !kind.includes('photo')) {
      continue;
    }
    const url = readNestedUrl(row);
    if (url && isLikelyImageUrl(url)) return url;
  }

  for (const key of AVATAR_NESTED_KEYS) {
    const nested = user[key];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const found = extractAvatarUrl(nested as Record<string, any>);
      if (found) return found;
    }
  }

  return null;
}
