import { asArray } from './apiData';

export type StudentPerformanceView = {
  accuracy: number;
  totalAttempts: number;
  topicsCompleted: number;
  totalStudyHours: number;
  subjectPerformance: Array<{
    subjectId: string;
    subjectName: string;
    accuracy: number;
  }>;
  hasData: boolean;
};

export type StudentInsightView = {
  insights: string[];
};

function flattenRecord(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const out: Record<string, unknown> = {};
  const absorb = (obj: unknown) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    const rec = obj as Record<string, unknown>;
    Object.assign(out, rec);
    for (const key of ['performance', 'stats', 'analytics', 'summary', 'data']) {
      const nested = rec[key];
      if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        absorb(nested);
      }
    }
  };
  absorb(data);
  return out;
}

export function mapStudentPerformance(data: unknown): StudentPerformanceView {
  const r = flattenRecord(data);
  const subjects = asArray(r, ['subjectPerformance', 'subjects', 'bySubject', 'subjectWise']);

  const accuracy = Number(
    r.accuracy ?? r.overallAccuracy ?? r.accuracyPercent ?? r.accuracyIndex ?? 0,
  );
  const totalAttempts = Number(
    r.totalAttempts ?? r.questionsAttempted ?? r.attempts ?? r.totalQuestions ?? 0,
  );
  const topicsCompleted = Number(
    r.topicsCompleted ?? r.completedTopics ?? r.topicsDone ?? 0,
  );
  const totalStudyHours = Number(
    r.totalStudyHours ?? r.studyHours ?? r.hoursStudied ?? r.studyTimeHours ?? 0,
  );

  const subjectPerformance = subjects.map((s: Record<string, unknown>, i) => ({
    subjectId: String(s.subjectId ?? s.id ?? i),
    subjectName: String(s.subjectName ?? s.subject ?? s.name ?? 'Subject'),
    accuracy: Number(s.accuracy ?? s.accuracyPct ?? s.score ?? s.percent ?? 0),
  }));

  const hasData =
    accuracy > 0 ||
    totalAttempts > 0 ||
    topicsCompleted > 0 ||
    totalStudyHours > 0 ||
    subjectPerformance.length > 0;

  return {
    accuracy,
    totalAttempts,
    topicsCompleted,
    totalStudyHours,
    subjectPerformance,
    hasData,
  };
}

export function mapStudentInsights(data: unknown): StudentInsightView {
  const r = flattenRecord(data);
  const raw = asArray(r, ['insights', 'tips', 'recommendations', 'messages']);
  const insights = raw
    .map(item => {
      if (typeof item === 'string') return item;
      const o = item as Record<string, unknown>;
      return String(o.message ?? o.text ?? o.title ?? o.body ?? '').trim();
    })
    .filter(Boolean);
  return { insights };
}

export function mapWeakTopicsList(data: unknown) {
  return asArray(data, ['weakTopics', 'topics', 'items', 'data']).map(
    (t: Record<string, unknown>, i) => ({
      topicId: String(t.topicId ?? t.id ?? i),
      topicName: String(t.topicName ?? t.name ?? t.title ?? 'Topic'),
      chapterName: String(t.chapterName ?? t.chapter ?? ''),
      accuracy: Number(t.accuracy ?? t.accuracyPct ?? 0),
      severity: String(t.severity ?? (Number(t.accuracy ?? 100) < 40 ? 'high' : 'medium')),
    }),
  );
}
