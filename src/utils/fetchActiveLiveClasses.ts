import { liveClassService } from '../services/liveclass.service';
import { studentService } from '../services/student.service';
import { asArray } from './apiData';
import {
  extractLiveClassEvents,
  mergeLiveClassEvents,
  type LiveClassEvent,
} from './liveClassEvents';
import { pickLiveStreamUrl } from './liveStreamUrl';

function pickString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

type TopicRow = {
  id: string;
  name?: string;
  lectureCount?: number;
  lectures?: { total?: number };
};

function flattenTopics(curriculum: unknown): TopicRow[] {
  const rows: TopicRow[] = [];
  for (const subject of asArray(curriculum)) {
    for (const chapter of asArray(subject.chapters)) {
      for (const topic of asArray<TopicRow>(chapter.topics)) {
        if (topic?.id) rows.push(topic);
      }
    }
  }
  return rows;
}

function topicDetailLectures(detail: unknown): Record<string, unknown>[] {
  if (!detail || typeof detail !== 'object') return [];
  const obj = detail as Record<string, unknown>;
  const payload =
    obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)
      ? (obj.data as Record<string, unknown>)
      : obj;
  return asArray<Record<string, unknown>>(payload, ['lectures']);
}

function topicLectureTotal(topic: TopicRow): number {
  const nested = topic.lectures?.total;
  if (typeof nested === 'number') return nested;
  if (typeof topic.lectureCount === 'number') return topic.lectureCount;
  return 0;
}

async function isLectureLiveNow(lectureId: string): Promise<boolean> {
  try {
    const [{ data: stream }, sessionRes] = await Promise.all([
      liveClassService.getStreamStatus(lectureId),
      liveClassService.getSession(lectureId).catch(() => ({ data: null })),
    ]);
    const streamRow = stream as Record<string, unknown> | null;
    if (streamRow?.isLive === true) return true;

    const sessionRow = sessionRes?.data as Record<string, unknown> | null;
    const bunnyHls = pickLiveStreamUrl(streamRow, sessionRow);
    if (bunnyHls && streamRow?.isLive === true) return true;

    const session = sessionRow;
    const status = String(session?.status ?? '').toLowerCase();
    return status === 'live' || status === 'ongoing' || status === 'active';
  } catch {
    return false;
  }
}

/** Collect lecture ids from enrolled batches (topics that have lectures). */
async function collectLectureCandidates(
  batchIds: string[],
): Promise<Map<string, LiveClassEvent>> {
  const map = new Map<string, LiveClassEvent>();
  const uniqueBatchIds = [...new Set(batchIds.filter(Boolean))].slice(0, 6);

  await Promise.all(
    uniqueBatchIds.map(async batchId => {
      try {
        const { data } = await studentService.fetchCourse(batchId);
        const payload = data as Record<string, unknown>;
        const batch = payload.batch as Record<string, unknown> | undefined;
        const batchName = String(batch?.name ?? '');
        const teacherObj = batch?.teacher;
        const teacherName =
          teacherObj && typeof teacherObj === 'object'
            ? pickString((teacherObj as Record<string, unknown>).name)
            : pickString(payload.teacherName, batch?.teacherName);

        const topics = flattenTopics(payload.curriculum).filter(t => topicLectureTotal(t) > 0);
        const topicDetails = await Promise.all(
          topics.slice(0, 20).map(async topic => {
            try {
              const { data: detail } = await studentService.fetchTopicDetail(batchId, topic.id);
              return { topic, detail: detail as Record<string, unknown> };
            } catch {
              return null;
            }
          }),
        );

        for (const row of topicDetails) {
          if (!row) continue;
          const lectures = topicDetailLectures(row.detail);
          for (const lec of lectures) {
            const id = String(lec.id ?? '');
            if (!id) continue;
            map.set(id, {
              id,
              lectureId: id,
              title: String(lec.title || row.topic.name || 'Live class'),
              teacherName: teacherName || undefined,
              batchName: batchName || undefined,
              topicId: row.topic.id,
              batchId,
              type: String(lec.type ?? ''),
            });
          }
        }
      } catch {
        /* skip batch */
      }
    }),
  );

  return map;
}

/**
 * Live classes from calendar feed + enrolled course lectures verified via stream-status.
 */
export async function fetchActiveLiveClasses(params: {
  calendarFeed?: unknown;
  batchIds?: string[];
}): Promise<LiveClassEvent[]> {
  const fromCalendar = extractLiveClassEvents(params.calendarFeed);
  const calendarIds = new Set(
    fromCalendar.map(e => e.lectureId || e.id).filter(Boolean) as string[],
  );

  const candidates = await collectLectureCandidates(params.batchIds ?? []);
  for (const ev of fromCalendar) {
    const id = ev.lectureId || ev.id;
    if (id) candidates.set(id, { ...ev, lectureId: id });
  }

  const verified: LiveClassEvent[] = [];
  const checks = await Promise.all(
    [...candidates.entries()].slice(0, 30).map(async ([id, meta]) => {
      if (calendarIds.has(id)) return meta;
      const live = await isLectureLiveNow(id);
      if (!live) return null;
      return meta;
    }),
  );

  for (const item of checks) {
    if (item) verified.push(item);
  }

  return mergeLiveClassEvents(fromCalendar, verified);
}
