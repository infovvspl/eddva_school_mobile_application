import { asArray } from './apiData';
import { normalizeQuizCheckpoints, type VideoQuizCheckpoint } from './videoQuizCheckpoints';
import { extractLectureThumbnailUrl } from './mediaUrl';
import { pickVideoUrlFromRecord } from './videoSource';
import { contentService } from '../services/content.service';
import { studentService } from '../services/student.service';

export type LecturePlayback = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  aiNotesMarkdown?: string | null;
  transcript?: string | null;
  transcriptHi?: string | null;
  quizCheckpoints?: VideoQuizCheckpoint[];
  type?: string;
  scheduledAt?: string | null;
  status?: string;
};

function pickString(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  return '';
}

function unwrapPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== 'object') return null;
  const obj = data as Record<string, unknown>;
  const inner = obj.lecture ?? obj.data ?? obj.item ?? obj;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return obj;
}

function pickVideoUrl(raw: Record<string, unknown>): string {
  const direct = pickVideoUrlFromRecord(raw);
  if (direct) return direct;

  if (raw.video && typeof raw.video === 'object') {
    const nested = pickVideoUrlFromRecord(raw.video as Record<string, unknown>);
    if (nested) return nested;
  }

  if (raw.recording && typeof raw.recording === 'object') {
    const nested = pickVideoUrlFromRecord(raw.recording as Record<string, unknown>);
    if (nested) return nested;
  }

  const type = String(raw.type ?? raw.lectureType ?? '').toLowerCase();
  if (type === 'live') {
    return (
      pickVideoUrlFromRecord({
        videoUrl: raw.liveMeetingUrl,
        playbackUrl: raw.liveStreamUrl ?? raw.liveMeetingUrl,
        streamUrl: raw.liveStreamUrl,
        hlsUrl: raw.hlsUrl,
      }) || ''
    );
  }

  return '';
}

function pickAiNotes(raw: Record<string, unknown>): string | null {
  const keys = [
    'aiNotesMarkdown',
    'aiNotes',
    'notesMarkdown',
    'notes',
    'aiNotesHtml',
    'notesHtml',
    'generatedNotes',
    'lectureNotes',
    'summary',
  ];

  for (const key of keys) {
    const val = raw[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }

  if (raw.aiNotes && typeof raw.aiNotes === 'object') {
    const nested = raw.aiNotes as Record<string, unknown>;
    const text =
      pickString(nested.markdown) ||
      pickString(nested.content) ||
      pickString(nested.html) ||
      pickString(nested.text);
    if (text) return text;
  }

  const concepts = raw.aiKeyConcepts;
  const formulas = raw.aiFormulas;
  const parts: string[] = [];

  if (Array.isArray(concepts) && concepts.length > 0) {
    parts.push(
      '## Key concepts\n\n' +
        concepts
          .map(c => `- ${typeof c === 'string' ? c : pickString(c)}`)
          .filter(Boolean)
          .join('\n'),
    );
  }

  if (Array.isArray(formulas) && formulas.length > 0) {
    parts.push(
      '## Formulas\n\n' +
        formulas
          .map(f => {
            const t = typeof f === 'string' ? f : pickString(f);
            return t ? `- $${t}$` : '';
          })
          .filter(Boolean)
          .join('\n'),
    );
  }

  if (parts.length) return parts.join('\n\n');

  return null;
}

function mapLecture(raw: Record<string, unknown>): LecturePlayback {
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? 'Lesson'),
    videoUrl: pickVideoUrl(raw),
    thumbnailUrl: extractLectureThumbnailUrl(raw as Record<string, any>),
    aiNotesMarkdown: pickAiNotes(raw),
    transcript: pickString(raw.transcript) || null,
    transcriptHi: pickString(raw.transcriptHi) || pickString(raw.transcriptHindi) || null,
    quizCheckpoints: normalizeQuizCheckpoints(raw.quizCheckpoints),
    type: pickString(raw.type) || undefined,
    scheduledAt: pickString(raw.scheduledAt) || null,
    status: pickString(raw.status) || undefined,
  };
}

function mergeLectures(
  ...parts: Array<LecturePlayback | null | undefined>
): LecturePlayback | null {
  const list = parts.filter((p): p is LecturePlayback => Boolean(p?.id));
  if (!list.length) return null;

  return list.reduce(
    (acc, cur) => ({
      id: cur.id || acc.id,
      title: cur.title || acc.title,
      videoUrl: cur.videoUrl || acc.videoUrl,
      thumbnailUrl: cur.thumbnailUrl ?? acc.thumbnailUrl,
      aiNotesMarkdown: cur.aiNotesMarkdown || acc.aiNotesMarkdown,
      transcript: cur.transcript || acc.transcript,
      transcriptHi: cur.transcriptHi || acc.transcriptHi,
      quizCheckpoints:
        (cur.quizCheckpoints?.length ? cur.quizCheckpoints : acc.quizCheckpoints) || [],
      type: cur.type || acc.type,
      scheduledAt: cur.scheduledAt || acc.scheduledAt,
      status: cur.status || acc.status,
    }),
    list[0],
  );
}

export async function fetchLectureById(lectureId: string): Promise<LecturePlayback | null> {
  if (!lectureId) return null;
  try {
    const { data } = await contentService.getLecture(lectureId);
    const raw = unwrapPayload(data);
    if (!raw) return null;
    const mapped = mapLecture(raw);
    return mapped.id ? mapped : null;
  } catch {
    return null;
  }
}

async function resolveFromTopic(
  batchId: string,
  topicId: string,
  preferLectureId?: string,
): Promise<LecturePlayback | null> {
  try {
    const { data } = await studentService.fetchTopicDetail(batchId, topicId);
    const payload = unwrapPayload(data);
    const lectures = asArray<Record<string, unknown>>(payload, ['lectures']);

    if (!lectures.length) return null;

    const match =
      (preferLectureId &&
        preferLectureId !== topicId &&
        lectures.find(l => String(l.id) === preferLectureId)) ||
      lectures.find(l => pickVideoUrl(l)) ||
      lectures.find(l => pickAiNotes(l)) ||
      lectures[0];

    if (!match) return null;

    const fromList = mapLecture(match);
    const full = await fetchLectureById(String(match.id));
    return mergeLectures(fromList, full);
  } catch {
    return null;
  }
}

/** Resolve a playable lecture from route params (lecture id and/or topic + batch). */
export async function resolveLecturePlayback(params: {
  lectureId: string;
  topicId?: string;
  batchId?: string;
}): Promise<LecturePlayback | null> {
  const { lectureId, batchId } = params;
  const topicId = params.topicId;

  const idIsTopicPlaceholder = Boolean(topicId && lectureId === topicId);
  const shouldFetchByLectureId = Boolean(lectureId && !idIsTopicPlaceholder);

  let byId: LecturePlayback | null = null;
  if (shouldFetchByLectureId) {
    byId = await fetchLectureById(lectureId);
  }

  let fromTopic: LecturePlayback | null = null;
  if (batchId && topicId) {
    fromTopic = await resolveFromTopic(
      batchId,
      topicId,
      shouldFetchByLectureId ? lectureId : undefined,
    );
  }

  const merged = mergeLectures(byId, fromTopic);

  if (merged?.id) return merged;

  if (lectureId && !idIsTopicPlaceholder) {
    return byId || (await fetchLectureById(lectureId));
  }

  return fromTopic || byId;
}
