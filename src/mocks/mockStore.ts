import { CATALOG } from './catalog';

export type DemoPreset = 'no_courses' | 'with_courses';

type Listener = () => void;

let preset: DemoPreset = 'no_courses';
const enrolledIds = new Set<string>();
let version = 0;
const listeners = new Set<Listener>();

function bump() {
  version += 1;
  listeners.forEach(l => l());
}

export function getDemoVersion() {
  return version;
}

export function subscribeDemo(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDemoPreset(): DemoPreset {
  return preset;
}

export function setDemoPreset(next: DemoPreset) {
  preset = next;
  enrolledIds.clear();
  if (next === 'with_courses') {
    enrolledIds.add('batch-vision-neet');
    enrolledIds.add('batch-jee-physics');
    enrolledIds.add('batch-jee-sankalp');
  }
  bump();
}

export const DEMO_PRESET_STORAGE_KEY = 'eddva_demo_preset';

export function getEnrolledIds(): string[] {
  return Array.from(enrolledIds);
}

export function isEnrolled(batchId: string): boolean {
  return enrolledIds.has(batchId);
}

export function enrollBatch(batchId: string): boolean {
  if (!CATALOG.some(b => b.id === batchId)) return false;
  enrolledIds.add(batchId);
  bump();
  return true;
}

export function hasAnyEnrollment(): boolean {
  return enrolledIds.size > 0;
}

export function getEnrolledBatches() {
  return CATALOG.filter(b => enrolledIds.has(b.id)).map((b, i) => ({
    ...b,
    isEnrolled: true,
    progressPercent: i === 0 ? 42 : 15,
    progress: i === 0 ? 42 : 15,
    totalTopics: b.topics.length + 8,
    completedTopics: i === 0 ? 5 : 2,
    nextLectureTitle: b.topics[0]?.name || 'Next lesson',
  }));
}

export function getDiscoverBatches() {
  return CATALOG.map(b => ({
    ...b,
    isEnrolled: enrolledIds.has(b.id),
  }));
}

export function getCourseDetail(batchId: string) {
  const b = CATALOG.find(c => c.id === batchId);
  if (!b) return null;
  return {
    ...b,
    isEnrolled: enrolledIds.has(batchId),
  };
}

// Init default: new student, no purchases
setDemoPreset('no_courses');
