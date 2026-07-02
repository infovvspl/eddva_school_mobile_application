import { ImageSourcePropType } from 'react-native';
import { getCourseImageSource } from './courseThumbnails';
import {
  extractCourseImageUrl,
  extractLectureThumbnailUrl,
  resolvePosterUrl,
} from './mediaUrl';

export type VideoCardImageTier = 'poster' | 'course' | 'fallback';

/** Resolve poster → course cover → stock/bundled image for video carousel cards. */
export function resolveVideoCardImage(
  thumbnailUrl: string | null | undefined,
  course?: Record<string, unknown> | null,
  tier: VideoCardImageTier = 'poster',
): ImageSourcePropType | null {
  const row = (course || {}) as Record<string, unknown>;

  if (tier === 'poster') {
    const poster =
      resolvePosterUrl(thumbnailUrl) ||
      extractLectureThumbnailUrl(row) ||
      resolvePosterUrl(row.posterUrl as string) ||
      resolvePosterUrl(row.videoThumbnailUrl as string);
    if (poster) return { uri: poster };
    return resolveVideoCardImage(thumbnailUrl, course, 'course');
  }

  if (tier === 'course') {
    const courseUri = extractCourseImageUrl(row);
    if (courseUri) return { uri: courseUri };
    return resolveVideoCardImage(thumbnailUrl, course, 'fallback');
  }

  return getCourseImageSource(row as Parameters<typeof getCourseImageSource>[0]);
}
