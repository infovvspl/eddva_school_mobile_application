import { asArray } from './apiData';

export type ExamQuestion = {
  id: string;
  text: string;
  options: string[];
};

export type MockTestCard = {
  id: string;
  name: string;
  examType: string;
  questionCount: number;
  durationMinutes: number;
  isPaid: boolean;
  price: number;
  attemptCount: number;
  type: string;
  isFullSyllabus: boolean;
};

export function mapMockTests(data: unknown): MockTestCard[] {
  return asArray(data, ['mockTests', 'tests', 'items', 'data']).map(
    (t: Record<string, unknown>, i) => {
      const id = String(t.id ?? t.mockTestId ?? t.testId ?? `mock-${i}`);
      return {
        id,
        name: String(t.name ?? t.title ?? t.testName ?? 'Mock Test'),
        examType: String(t.examType ?? t.examTarget ?? t.exam ?? 'Practice'),
        questionCount: Number(
          t.questionCount ?? t.totalQuestions ?? t.noOfQuestions ?? t.questionsCount ?? 0,
        ),
        durationMinutes: Number(
          t.durationMinutes ?? t.duration ?? t.durationMins ?? t.timeMinutes ?? 0,
        ),
        isPaid: Boolean(t.isPaid ?? t.paid ?? false),
        price: Number(t.price ?? 0),
        attemptCount: Number(t.attemptCount ?? t.attempts ?? 0),
        type: String(t.type ?? t.testType ?? ''),
        isFullSyllabus: Boolean(
          t.isFullSyllabus ?? t.fullSyllabus ?? String(t.type ?? '').toLowerCase() === 'full',
        ),
      };
    },
  );
}

function collectSessionQuestions(session: Record<string, unknown>): Record<string, unknown>[] {
  const buckets: Record<string, unknown>[][] = [];
  const push = (obj: unknown) => {
    if (!obj || typeof obj !== 'object') return;
    const rec = obj as Record<string, unknown>;
    const qs = asArray<Record<string, unknown>>(rec, [
      'questions',
      'items',
      'questionList',
      'mcqs',
    ]);
    if (qs.length) buckets.push(qs);
  };

  push(session);
  push(session.mockTest);
  push(session.test);
  push(session.assessment);
  push(session.paper);
  push(session.questionSet);
  push(session.session);

  return buckets.flat();
}

export function mapSessionQuestions(session: unknown): ExamQuestion[] {
  const s = (session as Record<string, unknown>) || {};
  const raw = collectSessionQuestions(s);

  return raw.map((q: Record<string, unknown>, i: number) => {
    const opts = asArray(q, ['options', 'choices', 'answers']);
    const options =
      opts.length > 0
        ? opts.map((o: unknown) => {
            if (typeof o === 'string') return o;
            const obj = o as Record<string, unknown>;
            return String(obj.text ?? obj.label ?? obj.option ?? obj.value ?? o);
          })
        : ['A', 'B', 'C', 'D'].map((l, j) =>
            String(q[`option${j + 1}`] ?? q[`option_${j + 1}`] ?? l),
          );

    return {
      id: String(q.id ?? q.questionId ?? q.mcqId ?? `q-${i + 1}`),
      text: String(
        q.text ?? q.question ?? q.stem ?? q.questionText ?? `Question ${i + 1}`,
      ),
      options,
    };
  });
}

export function mapPyqTopics(overview: unknown): Array<{
  topicId: string;
  name: string;
  accuracy: number;
  attempts: number;
}> {
  const topics: any[] = asArray(overview, ['topics', 'items', 'subjects']);
  if (!topics.length && overview && typeof overview === 'object') {
    const obj = overview as Record<string, unknown>;
    const nested = asArray(obj.subjects, ['topics']);
    nested.forEach((t: any) => topics.push(t));
  }

  return topics
    .filter(t => t.topicId || t.id || t.name || t.topicName)
    .map((t, i) => ({
      topicId: String(t.topicId || t.id || `topic-${i}`),
      name: String(t.topicName || t.name || t.title || 'Topic'),
      accuracy: Number(t.accuracy ?? t.accuracyPct ?? 0),
      attempts: Number(t.attempts ?? t.attemptCount ?? 0),
    }));
}

/** Map PYQ overview API (year grid / sets) to topic resource cards. */
export function mapPyqOverviewToStudyResources(
  overview: unknown,
  ctx: {
    topicId: string;
    topicName: string;
    subjectName: string;
    chapterName?: string;
  },
): import('./topicResources').StudyResource[] {
  const o = (overview as Record<string, unknown>) || {};
  const rows: unknown[] = [
    ...asArray(o, ['years', 'yearGrid', 'items', 'papers', 'sets']),
  ];

  if (!rows.length && o.year != null) {
    rows.push(o);
  }

  return rows.map((row: Record<string, unknown>, i) => {
    const year = row.year ?? row.examYear ?? row.label;
    const count = Number(row.questionCount ?? row.count ?? row.total ?? 0);
    const title = year
      ? `PYQ ${year} — ${ctx.topicName}`
      : String(row.title ?? row.name ?? `PYQ Set ${i + 1}`);
    return {
      id: String(row.id ?? row.year ?? `pyq-api-${i}`),
      kind: 'pyq' as const,
      title,
      subtitle: `Previous Year · ${ctx.subjectName}`,
      topicId: ctx.topicId,
      topicName: ctx.topicName,
      subjectName: ctx.subjectName,
      chapterName: ctx.chapterName || '',
      meta: row.examType ? String(row.examType) : 'PYQ',
      questionCount: count > 0 ? count : 20,
    };
  });
}
