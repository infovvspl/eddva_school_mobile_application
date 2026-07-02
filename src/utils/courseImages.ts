import { USE_MOCK } from '../config/appConfig';
import { extractCourseImageUrl } from './mediaUrl';

/** High-quality cover images per batch (1200px, 16:9 crop) — mock/demo only. */
export const COURSE_IMAGE_URLS: Record<string, string> = {  'batch-jee-physics':
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&h=675&fit=crop&q=90',
  'batch-neet-bio':
    'https://images.unsplash.com/photo-1576086213369-97f3069a0f60?w=1200&h=675&fit=crop&q=90',
  'batch-maths-free':
    'https://images.unsplash.com/photo-1632572353712-6739fe73133c?w=1200&h=675&fit=crop&q=90',
  'batch-chem-crash':
    'https://images.unsplash.com/photo-1603128795159-77542463eef6?w=1200&h=675&fit=crop&q=90',
  'batch-apex-jee':
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=675&fit=crop&q=90',
  'batch-vision-neet':
    'https://images.unsplash.com/photo-1579154204601-01588fde56e3?w=1200&h=675&fit=crop&q=90',
  'batch-kota-masters':
    'https://images.unsplash.com/photo-1488190217125-5b0ae395ecd6?w=1200&h=675&fit=crop&q=90',
  'batch-scholars-foundation':
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&h=675&fit=crop&q=90',
};

const EXAM_FALLBACK: Record<string, string> = {
  NEET: COURSE_IMAGE_URLS['batch-neet-bio'],
  JEE: COURSE_IMAGE_URLS['batch-jee-physics'],
};

export type HeroTheme = {
  colorStart: string;
  colorEnd: string;
  accent: string;
  brandLine1: string;
  brandLine2: string;
};

const HERO_THEMES: Record<string, HeroTheme> = {
  'batch-jee-physics': {
    colorStart: '#EDE9FE',
    colorEnd: '#C4B5FD',
    accent: '#6D28D9',
    brandLine1: 'PRAKRAM',
    brandLine2: 'JEE ADVANCED 2027',
  },
  'batch-jee-sankalp': {
    colorStart: '#DBEAFE',
    colorEnd: '#1E3A8A',
    accent: '#2563EB',
    brandLine1: 'JEE',
    brandLine2: 'SANKALP 2027',
  },
  'batch-apex-jee': {
    colorStart: '#DBEAFE',
    colorEnd: '#93C5FD',
    accent: '#1D4ED8',
    brandLine1: 'JEE',
    brandLine2: 'SANKALP',
  },
  'batch-neet-bio': {
    colorStart: '#FFEDD5',
    colorEnd: '#FDBA74',
    accent: '#C2410C',
    brandLine1: 'PARAKRAM',
    brandLine2: 'NEET 2027',
  },
  'batch-vision-neet': {
    colorStart: '#DBEAFE',
    colorEnd: '#93C5FD',
    accent: '#0066cc',
    brandLine1: 'NEET',
    brandLine2: '2027',
  },
  'batch-maths-free': {
    colorStart: '#DBEAFE',
    colorEnd: '#93C5FD',
    accent: '#2563EB',
    brandLine1: 'MATHS',
    brandLine2: 'FOUNDATION',
  },
  'batch-chem-crash': {
    colorStart: '#D1FAE5',
    colorEnd: '#6EE7B7',
    accent: '#059669',
    brandLine1: 'CHEMISTRY',
    brandLine2: 'CRASH 2027',
  },
};

function examStockFromName(name: string): string | null {
  const upper = name.toUpperCase();
  if (upper.includes('NEET')) return EXAM_FALLBACK.NEET;
  if (upper.includes('JEE')) return EXAM_FALLBACK.JEE;
  return null;
}

export function getCourseImageUrl(course: {
  imageUrl?: string;
  batchId?: string;
  id?: string;
  examType?: string;
  batchName?: string;
  name?: string;
}): string | null {
  const remoteUrl = extractCourseImageUrl(course);
  if (remoteUrl) return remoteUrl;

  const id = course.batchId || course.id || '';
  if (COURSE_IMAGE_URLS[id]) return COURSE_IMAGE_URLS[id];

  const exam = (course.examType || '').toUpperCase();
  if (EXAM_FALLBACK[exam]) return EXAM_FALLBACK[exam];

  const byName = examStockFromName(String(course.batchName || course.name || ''));
  if (byName) return byName;

  if (!USE_MOCK) return EXAM_FALLBACK.JEE;

  if (course.imageUrl?.includes('unsplash')) {
    const url = course.imageUrl;
    if (url.includes('w=800')) return url.replace('w=800', 'w=1200').replace('h=500', 'h=675');
    if (!url.includes('w=1200')) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}w=1200&h=675&fit=crop&q=90`;
    }
    return url;
  }
  if (course.imageUrl && !course.imageUrl.startsWith('local://')) return course.imageUrl;

  return COURSE_IMAGE_URLS['batch-jee-physics'];
}
export function getHeroTheme(course: { batchId?: string; id?: string; examType?: string }): HeroTheme {
  const id = course.batchId || course.id || '';
  if (HERO_THEMES[id]) return HERO_THEMES[id];
  return {
    colorStart: '#F0F9FF',
    colorEnd: '#E0F2FE',
    accent: '#0066cc',
    brandLine1: course.examType || 'JEE',
    brandLine2: 'BATCH 2027',
  };
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getSubjectAccent(examType?: string): string {
  if (examType === 'NEET') return '#059669';
  if (examType === 'JEE') return '#0066cc';
  return '#6366F1';
}
