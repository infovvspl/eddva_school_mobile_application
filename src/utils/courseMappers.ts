import { asArray } from './apiData';
import { extractCourseImageUrl } from './mediaUrl';
import { parseProgressStats } from './progress';

/** Normalize API batch/course objects to the shape UI components expect. */
export function normalizeBatch(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;

  const nested =
    raw.batch && typeof raw.batch === 'object'
      ? raw.batch
      : raw.course && typeof raw.course === 'object'
        ? raw.course
        : null;

  const source = nested ? { ...nested, ...raw } : raw;
  const id = source.id || source.batchId || raw.batchId || raw.id || '';
  const name =
    source.name ||
    source.batchName ||
    source.title ||
    source.displayName ||
    source.displayTitle ||
    '';
  const examRaw = source.examTarget || source.examType || source.exam || '';
  const examType = String(examRaw).toUpperCase();
  const price = source.feeAmount ?? source.price ?? 0;
  const imageUrl = extractCourseImageUrl(source) || undefined;
  const progress = parseProgressStats(
    source.progressPercent,
    source.progress,
    raw.progressPercent,
    raw.progress,
    source.completedTopics,
    raw.completedTopics,
  );

  return {
    ...source,
    id,
    batchId: id,
    name,
    batchName: name,
    displayTitle: name,
    examType,
    examTarget: source.examTarget || source.examType || examRaw,
    price,
    originalPrice: source.originalPrice ?? source.mrp,
    isPaid: Boolean(source.isPaid ?? (Number(price) > 0)),
    imageUrl,
    thumbnailUrl: source.thumbnailUrl || imageUrl,
    studentCount: source.studentCount ?? source.enrolledCount ?? source.enrollmentCount,
    instituteName:
      source.instituteName ||
      source.institute?.name ||
      source.tenantName ||
      source.tenant?.name,
    progressPercent: progress.progressPercent,
    totalLectures: progress.totalLectures,
    watchedLectures: progress.watchedLectures,
    completedTopics: progress.completedTopics,
    inProgressTopics: progress.inProgressTopics,
    totalTopics: progress.totalTopics,
    progress: progress.progressPercent,
    isEnrolled: Boolean(source.isEnrolled ?? raw.isEnrolled ?? raw.enrolled),
  };
}

export function normalizeBatchList(data: unknown): any[] {
  return asArray(data, ['availableBatches', 'batches', 'courses', 'enrolledBatches', 'items']).map(
    normalizeBatch,
  );
}

export function curriculumToSubjects(curriculum: any[]): any[] {
  return (curriculum || []).map(subject => ({
    id: subject.id,
    name: subject.name,
    subjectName: subject.name,
    icon: subject.icon,
    colorCode: subject.colorCode,
    teacher: subject.teacher,
    chapters: subject.chapters || [],
  }));
}

export function flattenCurriculumTopics(curriculum: any[]): any[] {
  const topics: any[] = [];
  for (const subject of curriculum || []) {
    for (const chapter of subject.chapters || []) {
      for (const topic of chapter.topics || []) {
        topics.push({
          ...topic,
          subjectId: subject.id,
          chapterId: chapter.id,
          name: topic.name || topic.topicName || topic.title,
        });
      }
    }
  }
  return topics;
}

export function getBatchTitle(course: any): string {
  const normalized = normalizeBatch(course);
  return normalized.batchName || normalized.name || 'Course';
}

export function batchMatchesExam(course: any, examFilter: 'JEE' | 'NEET' | 'ALL'): boolean {
  if (examFilter === 'ALL') return true;
  const exam = String(course?.examType || course?.examTarget || '').toUpperCase();
  return exam.includes(examFilter);
}

export function findTopicInCurriculum(curriculum: any[], topicId: string): any | null {
  for (const subject of curriculum || []) {
    for (const chapter of subject.chapters || []) {
      for (const topic of chapter.topics || []) {
        if (String(topic.id) === String(topicId)) {
          return {
            ...topic,
            subjectId: subject.id,
            subjectName: subject.name,
            chapterId: chapter.id,
            chapterName: chapter.name,
          };
        }
      }
    }
  }
  return null;
}

/** Flat subject list for SubjectTopicTree on course detail. */
export function curriculumToSubjectGroups(curriculum: any[]) {
  return (curriculum || []).map(subject => ({
    id: String(subject.id),
    displayName: subject.name || 'Subject',
    topics: (subject.chapters || []).flatMap((ch: any) =>
      (ch.topics || []).map((t: any) => ({
        id: String(t.id),
        name: t.name || t.topicName || t.title,
        topicName: t.name || t.topicName || t.title,
        title: t.name || t.topicName || t.title,
        durationMinutes: t.estimatedStudyMinutes ?? t.durationMinutes,
      })),
    ),
  }));
}

export function coursePayloadForCurriculum(course: any) {
  const normalized = normalizeBatch(course);
  const curriculum = asArray(course?.curriculum);
  return {
    ...normalized,
    curriculum,
    subjects: asArray(course?.subjects).length ? asArray(course?.subjects) : curriculumToSubjects(curriculum),
    topics: asArray(course?.topics).length ? asArray(course?.topics) : flattenCurriculumTopics(curriculum),
  };
}
