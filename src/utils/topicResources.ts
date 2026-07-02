import type { CurriculumSubject, CurriculumTopic } from './buildCurriculum';

export type ResourceKind =
  | 'lecture'
  | 'dpp'
  | 'pyq'
  | 'notes'
  | 'mindmap'
  | 'mock'
  | 'faq';

export type StudyResource = {
  id: string;
  kind: ResourceKind;
  title: string;
  subtitle: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  chapterName: string;
  meta?: string;
  questionCount?: number;
  pageCount?: number;
};

export type ResourceBuckets = Record<
  Exclude<ResourceKind, 'faq'>,
  StudyResource[]
> & { faq: FaqItem[] };

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  topicName?: string;
};

export const RESOURCE_META: Record<
  ResourceKind,
  { icon: string; color: string; bg: string; label: string }
> = {
  lecture: { icon: 'video', color: '#0066cc', bg: '#DBEAFE', label: 'Lecture' },
  dpp: { icon: 'clipboard-list', color: '#C2410C', bg: '#FFEDD5', label: 'DPP' },
  pyq: { icon: 'trophy', color: '#6D28D9', bg: '#EDE9FE', label: 'PYQ' },
  notes: { icon: 'file-alt', color: '#1D4ED8', bg: '#DBEAFE', label: 'Notes' },
  mindmap: { icon: 'project-diagram', color: '#047857', bg: '#D1FAE5', label: 'Mindmap' },
  mock: { icon: 'clipboard-check', color: '#DC2626', bg: '#FEE2E2', label: 'Mock Test' },
  faq: { icon: 'question-circle', color: '#7C3AED', bg: '#EDE9FE', label: 'FAQ' },
};

type TopicCtx = {
  topic: CurriculumTopic;
  subjectName: string;
  chapterName: string;
};

function walkSubjects(subjects: CurriculumSubject[]): TopicCtx[] {
  const out: TopicCtx[] = [];
  subjects.forEach(subject => {
    subject.chapters.forEach(chapter => {
      chapter.topics.forEach(topic => {
        out.push({ topic, subjectName: subject.name, chapterName: chapter.name });
      });
    });
  });
  return out;
}

function pushResource(
  list: StudyResource[],
  kind: ResourceKind,
  ctx: TopicCtx,
  index: number,
  title: string,
  subtitle: string,
  extra: Partial<StudyResource> = {},
) {
  list.push({
    id: `${kind}-${ctx.topic.id}-${index}`,
    kind,
    title,
    subtitle,
    topicId: ctx.topic.id,
    topicName: ctx.topic.name,
    subjectName: ctx.subjectName,
    chapterName: ctx.chapterName,
    ...extra,
  });
}

function addLectures(list: StudyResource[], ctx: TopicCtx) {
  const { topic, subjectName } = ctx;
  for (let index = 0; index < topic.lectureCount; index += 1) {
    pushResource(list, 'lecture', ctx, index, topic.name, `${topic.durationMinutes} min · ${subjectName}`, {
      meta: 'Recorded',
    });
  }
}

function addDpp(list: StudyResource[], ctx: TopicCtx, count: number) {
  const { topic, chapterName } = ctx;
  for (let index = 0; index < count; index += 1) {
    pushResource(
      list,
      'dpp',
      ctx,
      index,
      index === 0 ? `DPP Sheet — ${topic.name}` : `DPP Sheet ${index + 1} — ${topic.name}`,
      `Daily Practice · ${chapterName}`,
      { questionCount: 15 + index * 5 },
    );
  }
}

function addPyq(list: StudyResource[], ctx: TopicCtx, count: number) {
  const { topic, subjectName } = ctx;
  for (let index = 0; index < count; index += 1) {
    pushResource(
      list,
      'pyq',
      ctx,
      index,
      `PYQ Practice ${index + 1} — ${topic.name}`,
      `Previous Year · ${subjectName}`,
      { questionCount: 20 + index * 10 },
    );
  }
}

function addNotes(list: StudyResource[], ctx: TopicCtx, count: number) {
  const { topic, chapterName } = ctx;
  for (let index = 0; index < count; index += 1) {
    pushResource(
      list,
      'notes',
      ctx,
      index,
      index === 0 ? `Study Notes — ${topic.name}` : `Study Notes ${index + 1} — ${topic.name}`,
      `Study Material · ${chapterName}`,
      { pageCount: 4 + index * 2 },
    );
  }
}

function addMindmaps(list: StudyResource[], ctx: TopicCtx, count: number) {
  const { topic, subjectName } = ctx;
  for (let index = 0; index < count; index += 1) {
    pushResource(
      list,
      'mindmap',
      ctx,
      index,
      `Mindmap ${index + 1} — ${topic.name}`,
      `Visual summary · ${subjectName}`,
    );
  }
}

export function buildResourceBuckets(subjects: CurriculumSubject[]): ResourceBuckets {
  const buckets: ResourceBuckets = {
    lecture: [],
    dpp: [],
    pyq: [],
    notes: [],
    mindmap: [],
    mock: [],
    faq: [],
  };

  try {
    walkSubjects(subjects).forEach(ctx => {
      const resources = ctx.topic.resources;
      addLectures(buckets.lecture, ctx);
      addDpp(buckets.dpp, ctx, resources.dpp);
      addPyq(buckets.pyq, ctx, resources.pyq);
      addNotes(buckets.notes, ctx, resources.notes);
      addMindmaps(buckets.mindmap, ctx, resources.mindmaps);
    });
  } catch (err) {
    console.warn('buildResourceBuckets failed', err);
  }

  buckets.mock.push(
    {
      id: 'mock-1',
      kind: 'mock',
      title: 'Full Syllabus Mock Test 1',
      subtitle: '180 min · All subjects',
      topicId: '',
      topicName: 'Course',
      subjectName: 'All',
      chapterName: 'Mock',
      questionCount: 90,
    },
    {
      id: 'mock-2',
      kind: 'mock',
      title: 'Full Syllabus Mock Test 2',
      subtitle: '180 min · All subjects',
      topicId: '',
      topicName: 'Course',
      subjectName: 'All',
      chapterName: 'Mock',
      questionCount: 90,
    },
  );

  buckets.faq = buildCourseFaq(subjects);
  return buckets;
}

function buildCourseFaq(subjects: CurriculumSubject[]): FaqItem[] {
  const topics = walkSubjects(subjects).map(entry => entry.topic.name);
  const sample = topics[0] || 'this topic';

  return [
    {
      id: 'faq-1',
      question: 'How do I watch recorded lectures?',
      answer:
        'Open Curriculum, tap a topic, then press Start Learning or the play icon on the lecture row.',
    },
    {
      id: 'faq-2',
      question: 'Where can I download DPP and PYQ?',
      answer:
        'Go to the DPP or PYQ tab on the course page, or open a topic and switch to the matching resource tab. Tap download on any sheet.',
    },
    {
      id: 'faq-3',
      question: `Are handwritten notes available for ${sample}?`,
      answer:
        'Yes. Open the topic, go to Study Material, or use the Notes tab on the course page to see all note PDFs.',
    },
    {
      id: 'faq-4',
      question: 'How is progress tracked?',
      answer:
        'Lecture progress updates when you finish a video. DPP and mock tests update after you submit.',
    },
    {
      id: 'faq-5',
      question: 'Can I ask doubts during a lecture?',
      answer:
        'Yes. Use Ask Doubt on the video screen or post in the Help tab for faculty review.',
    },
  ];
}

export function buildTopicFaq(topicName: string, subjectName: string): FaqItem[] {
  return [
    {
      id: 'tf-1',
      question: `What is covered in ${topicName}?`,
      answer: `This module covers core ${subjectName} concepts for ${topicName}, aligned with NEET/JEE syllabus and PYQ patterns.`,
      topicName,
    },
    {
      id: 'tf-2',
      question: 'How many DPP questions should I solve?',
      answer: 'Start with the daily sheet (15 questions), then move to PYQ practice once your accuracy is above 70%.',
      topicName,
    },
    {
      id: 'tf-3',
      question: 'Are notes available offline?',
      answer: 'Tap download on any notes PDF to save it on your device for offline revision.',
      topicName,
    },
  ];
}

export type TopicResourceBundle = {
  topic: CurriculumTopic | null;
  subjectName: string;
  chapterName: string;
  lectures: StudyResource[];
  dpp: StudyResource[];
  pyq: StudyResource[];
  notes: StudyResource[];
  mindmaps: StudyResource[];
  faq: FaqItem[];
  totalResources: number;
};

export function getTopicResourceBundle(
  subjects: CurriculumSubject[],
  topicId: string,
): TopicResourceBundle {
  const buckets = buildResourceBuckets(subjects);
  const filterByTopic = (items: StudyResource[]) => items.filter(item => item.topicId === topicId);

  let ctx: TopicCtx | null = null;
  for (const entry of walkSubjects(subjects)) {
    if (entry.topic.id === topicId) {
      ctx = entry;
      break;
    }
  }

  const lectures = filterByTopic(buckets.lecture);
  const dpp = filterByTopic(buckets.dpp);
  const pyq = filterByTopic(buckets.pyq);
  const notes = filterByTopic(buckets.notes);
  const mindmaps = filterByTopic(buckets.mindmap);

  return {
    topic: ctx?.topic ?? null,
    subjectName: ctx?.subjectName ?? '',
    chapterName: ctx?.chapterName ?? '',
    lectures,
    dpp,
    pyq,
    notes,
    mindmaps,
    faq: ctx ? buildTopicFaq(ctx.topic.name, ctx.subjectName) : [],
    totalResources: lectures.length + dpp.length + pyq.length + notes.length + mindmaps.length,
  };
}

export type CurriculumTabKey =
  | 'curriculum'
  | 'lectures'
  | 'dpp'
  | 'pyq'
  | 'notes'
  | 'mindmaps'
  | 'mock'
  | 'faq';

const TAB_BUCKET: Record<
  Exclude<CurriculumTabKey, 'curriculum' | 'faq'>,
  keyof Pick<ResourceBuckets, 'lecture' | 'dpp' | 'pyq' | 'notes' | 'mindmap' | 'mock'>
> = {
  lectures: 'lecture',
  dpp: 'dpp',
  pyq: 'pyq',
  notes: 'notes',
  mindmaps: 'mindmap',
  mock: 'mock',
};

export function resourcesForCurriculumTab(
  buckets: ResourceBuckets,
  tab: CurriculumTabKey,
): StudyResource[] | FaqItem[] {
  if (tab === 'curriculum') return [];
  if (tab === 'faq') return buckets.faq;
  const key = TAB_BUCKET[tab as keyof typeof TAB_BUCKET];
  return key ? buckets[key] : [];
}
