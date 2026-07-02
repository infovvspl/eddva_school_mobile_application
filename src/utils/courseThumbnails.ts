import { ImageSourcePropType } from 'react-native';
import { getCourseImageUrl } from './courseImages';
import { extractCourseImageUrl } from './mediaUrl';

/** One bundled asset per EDDVA banner — mock/demo only */
export const THUMBNAIL_BY_SLUG: Record<string, number> = {
  'parakram-neet': require('../assets/courses/parakram-neet.png'),
  'neet-2027': require('../assets/courses/neet-2027.png'),
  'prakram-jee': require('../assets/courses/prakram-jee.png'),
  'jee-sankalp': require('../assets/courses/jee-sankalp.png'),
};

/** Default thumbnail per batch — mock/demo only */
export const LOCAL_COURSE_THUMBNAILS: Record<string, number> = {
  'batch-jee-physics': THUMBNAIL_BY_SLUG['prakram-jee'],
  'batch-neet-bio': THUMBNAIL_BY_SLUG['parakram-neet'],
  'batch-vision-neet': THUMBNAIL_BY_SLUG['neet-2027'],
  'batch-jee-sankalp': THUMBNAIL_BY_SLUG['jee-sankalp'],
  'batch-apex-jee': THUMBNAIL_BY_SLUG['jee-sankalp'],
  'batch-maths-free': THUMBNAIL_BY_SLUG['prakram-jee'],
  'batch-chem-crash': THUMBNAIL_BY_SLUG['neet-2027'],
  'batch-kota-masters': THUMBNAIL_BY_SLUG['parakram-jee'],
  'batch-scholars-foundation': THUMBNAIL_BY_SLUG['parakram-neet'],
};

export const FEATURED_BATCH_IDS = [
  'batch-neet-bio',
  'batch-vision-neet',
  'batch-jee-physics',
  'batch-jee-sankalp',
] as const;

function slugFromImageUrl(imageUrl?: string): string | null {
  if (!imageUrl?.startsWith('local://')) return null;
  return imageUrl.replace('local://', '').trim();
}

function getBundledCourseImage(course: {
  imageUrl?: string;
  batchId?: string;
  id?: string;
  examType?: string;
  batchName?: string;
  name?: string;
}): ImageSourcePropType | null {
  const slug = slugFromImageUrl(course.imageUrl);
  if (slug && THUMBNAIL_BY_SLUG[slug]) {
    return THUMBNAIL_BY_SLUG[slug];
  }

  const id = course.batchId || course.id || '';
  if (id && LOCAL_COURSE_THUMBNAILS[id]) {
    return LOCAL_COURSE_THUMBNAILS[id];
  }

  const label = String(course.batchName || course.name || '').toUpperCase();
  if (label.includes('NEET')) return THUMBNAIL_BY_SLUG['parakram-neet'];
  if (label.includes('JEE')) return THUMBNAIL_BY_SLUG['prakram-jee'];

  const exam = (course.examType || '').toUpperCase();
  if (exam === 'NEET') return THUMBNAIL_BY_SLUG['parakram-neet'];
  if (exam === 'JEE') return THUMBNAIL_BY_SLUG['prakram-jee'];
  return THUMBNAIL_BY_SLUG['prakram-jee'];
}

/** Best image for video/course cards — API poster, stock photo, then bundled art. */
export function getCourseImageSource(course: {
  imageUrl?: string;
  batchId?: string;
  id?: string;
  examType?: string;
  batchName?: string;
  name?: string;
}): ImageSourcePropType | null {
  const url = getCourseImageUrl(course);
  if (url) return { uri: url };
  return getBundledCourseImage(course);
}

export function getCourseImageKey(course: {
  imageUrl?: string;
  batchId?: string;
  id?: string;
}): string {
  const remoteUrl = extractCourseImageUrl(course);
  if (remoteUrl) return remoteUrl;

  const slug = slugFromImageUrl(course.imageUrl);
  const id = course.batchId || course.id || '';
  return slug || id || 'default';
}
