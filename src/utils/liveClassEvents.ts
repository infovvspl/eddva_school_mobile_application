import { asArray, mergeCalendarFeed } from './apiData';

export type LiveClassEvent = {
  id: string;
  title: string;
  lectureId?: string;
  teacherName?: string;
  batchName?: string;
  batchId?: string;
  topicId?: string;
  type?: string;
};

function pickString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

function isLiveCalendarRow(row: Record<string, unknown>): boolean {
  const type = pickString(row.type, row.eventType, row.category).toLowerCase();
  if (type === 'live_class' || type === 'live' || type === 'liveclass') return true;
  if (row.isLive === true || row.is_live === true) return true;
  if (row.liveSessionId || row.live_session_id || row.sessionId) return true;
  const status = pickString(row.status, row.sessionStatus, row.session_status).toLowerCase();
  return status === 'live' || status === 'ongoing' || status === 'active' || status === 'waiting';
}

function normalizeRow(row: Record<string, unknown>, i: number): LiveClassEvent | null {
  const lectureId = pickString(
    row.lectureId,
    row.lecture_id,
    row.liveLectureId,
    row.contentId,
  );
  const id = pickString(row.id, lectureId, row.eventId) || `live-${i}`;
  const title = pickString(row.title, row.name, row.lectureTitle, row.topicName) || 'Live class';
  if (!isLiveCalendarRow(row) && !lectureId && typeLooksGeneric(row)) return null;

  return {
    id,
    lectureId: lectureId || (isLiveCalendarRow(row) ? id : undefined),
    title,
    teacherName:
      pickString(row.teacherName, row.teacher_name, row.instructor, row.teacher) || undefined,
    batchName: pickString(row.batchName, row.batch_name, row.batch, row.courseName) || undefined,
    batchId: pickString(row.batchId, row.batch_id, row.courseId) || undefined,
    topicId: pickString(row.topicId, row.topic_id) || undefined,
  };
}

function typeLooksGeneric(row: Record<string, unknown>): boolean {
  const type = pickString(row.type).toLowerCase();
  return !type || type === 'event';
}


/** Calendar + feed rows that represent live classes. */
export function extractLiveClassEvents(feed: unknown): LiveClassEvent[] {
  return mergeCalendarFeed(feed)
    .filter(isLiveCalendarRow)
    .map((row, i) => normalizeRow(row, i))
    .filter((row): row is LiveClassEvent => Boolean(row));
}

export function mergeLiveClassEvents(...groups: LiveClassEvent[][]): LiveClassEvent[] {
  const map = new Map<string, LiveClassEvent>();
  for (const group of groups) {
    for (const ev of group) {
      const key = ev.lectureId || ev.id;
      map.set(key, { ...map.get(key), ...ev, lectureId: ev.lectureId || ev.id });
    }
  }
  return [...map.values()];
}
