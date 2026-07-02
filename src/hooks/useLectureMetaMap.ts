import { useEffect, useState } from 'react';
import { contentService } from '../services/content.service';
import { extractCourseImageUrl, extractLectureThumbnailUrl } from '../utils/mediaUrl';
import { pickVideoUrlFromRecord } from '../utils/videoSource';

export type LectureMeta = {
  thumbnailUrl: string | null;
  videoUrl: string | null;
};

/**
 * Fetch lecture poster + video URL for dashboard cards (video thumb, not course image).
 */
export function useLectureMetaMap(lectureIds: string[]): Record<string, LectureMeta> {
  const [map, setMap] = useState<Record<string, LectureMeta>>({});
  const key = [...new Set(lectureIds.filter(Boolean))].sort().join(',');

  useEffect(() => {
    const ids = key ? key.split(',') : [];
    if (!ids.length) {
      setMap({});
      return;
    }

    let cancelled = false;

    (async () => {
      const pairs = await Promise.all(
        ids.map(async id => {
          try {
            const { data } = await contentService.getLecture(id);
            const row = (data || {}) as Record<string, unknown>;
            const thumb =
              extractLectureThumbnailUrl(row as Record<string, any>) ||
              extractCourseImageUrl(
                (row.batch || row.course || row.topic) as Record<string, any>,
              ) ||
              extractCourseImageUrl(row as Record<string, any>);
            return [
              id,
              {
                thumbnailUrl: thumb,
                videoUrl: pickVideoUrlFromRecord(row),
              },
            ] as const;
          } catch {
            return [id, { thumbnailUrl: null, videoUrl: null }] as const;
          }
        }),
      );

      if (cancelled) return;
      setMap(Object.fromEntries(pairs));
    })();

    return () => {
      cancelled = true;
    };
  }, [key]);

  return map;
}
