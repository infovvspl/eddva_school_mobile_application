import { getSubjectMeta } from './subjectMeta';
import { asArray } from './apiData';

export type TopicResource = {
  dpp: number;
  pyq: number;
  notes: number;
  mindmaps: number;
};

export type CurriculumTopic = {
  id: string;
  name: string;
  durationMinutes: number;
  lectureCount: number;
  completed: boolean;
  resources: TopicResource;
};

export type CurriculumChapter = {
  id: string;
  name: string;
  topics: CurriculumTopic[];
};

export type CurriculumSubject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  chapters: CurriculumChapter[];
  completedTopics: number;
  totalTopics: number;
};

export type CurriculumCounts = {
  lectures: number;
  dpp: number;
  pyq: number;
  notes: number;
  mindmaps: number;
  mockTests: number;
  studyMinutes: number;
};

function topicName(t: { name?: string; topicName?: string; title?: string }) {
  return t.name || t.topicName || t.title || 'Lesson';
}

function resourcesForTopic(index: number): TopicResource {
  const patterns: TopicResource[] = [
    { dpp: 1, pyq: 1, notes: 4, mindmaps: 1 },
    { dpp: 0, pyq: 1, notes: 2, mindmaps: 0 },
    { dpp: 1, pyq: 0, notes: 3, mindmaps: 1 },
    { dpp: 0, pyq: 0, notes: 1, mindmaps: 0 },
  ];
  return patterns[index % patterns.length];
}

function mapApiResourceCounts(rc: Record<string, number> | undefined): TopicResource {
  const counts = rc || {};
  return {
    dpp: counts.dpp ?? 0,
    pyq: counts.pyq ?? 0,
    notes: (counts.notes ?? 0) + (counts.pdf ?? 0),
    mindmaps: counts.mindmap ?? counts.mindmaps ?? 0,
  };
}

function mapApiTopic(t: any, index: number): CurriculumTopic {
  const rc = t.resourceCounts || {};
  const lectureCount = Math.max(
    Number(t.lectureCount ?? 0),
    Number(rc.video ?? 0),
    Array.isArray(t.lectures) ? t.lectures.length : 0,
  );

  const hasApiResources = Object.keys(rc).length > 0;

  return {
    id: String(t.id),
    name: topicName(t),
    durationMinutes: t.estimatedStudyMinutes ?? t.durationMinutes ?? 45 + index * 5,
    lectureCount,
    completed: Boolean(t.completed ?? t.isCompleted),
    resources: hasApiResources ? mapApiResourceCounts(rc) : resourcesForTopic(index),
  };
}

function buildFromApiCurriculum(curriculum: any[]): {
  subjects: CurriculumSubject[];
  counts: CurriculumCounts;
} {
  let topicIndex = 0;
  const subjects: CurriculumSubject[] = curriculum.map(subject => {
    const meta = getSubjectMeta(subject.name);
    const chapters: CurriculumChapter[] = (subject.chapters || []).map((ch: any) => ({
      id: String(ch.id),
      name: ch.name || 'Chapter',
      topics: (ch.topics || []).map((t: any) => mapApiTopic(t, topicIndex++)),
    }));

    const totalTopics = chapters.reduce((n, ch) => n + ch.topics.length, 0);
    const completedTopics = chapters.reduce(
      (n, ch) => n + ch.topics.filter(t => t.completed).length,
      0,
    );

    return {
      id: String(subject.id),
      name: subject.name || 'Subject',
      icon: subject.icon || meta.icon,
      color: subject.colorCode || meta.color,
      chapters,
      completedTopics,
      totalTopics,
    };
  });

  return { subjects, counts: computeCounts(subjects, false) };
}

const CHAPTER_NAMES: Record<string, string[]> = {
  botany: ['Plant Physiology', 'Cell Biology'],
  zoology: ['Human Physiology', 'Genetics'],
  physics: ['Mechanics', 'Electrodynamics'],
  chemistry: ['Organic Chemistry', 'Physical Chemistry'],
  maths: ['Algebra', 'Calculus'],
  default: ['Chapter 1', 'Chapter 2'],
};

function chaptersForSubject(subjectName: string, topics: any[]): CurriculumChapter[] {
  const key = subjectName.toLowerCase();
  let names = CHAPTER_NAMES.default;
  for (const [k, list] of Object.entries(CHAPTER_NAMES)) {
    if (key.includes(k)) {
      names = list;
      break;
    }
  }
  if (topics.length === 0) {
    return [{ id: `ch-${key}-0`, name: names[0], topics: [] }];
  }
  const perChapter = Math.max(1, Math.ceil(topics.length / names.length));
  const chapters: CurriculumChapter[] = [];
  names.forEach((chName, ci) => {
    const slice = topics.slice(ci * perChapter, (ci + 1) * perChapter);
    if (slice.length === 0 && ci > 0) return;
    chapters.push({
      id: `ch-${key}-${ci}`,
      name: chName,
      topics: slice.map((t, ti) => {
        const idx = ci * perChapter + ti;
        return {
          id: t.id,
          name: topicName(t),
          durationMinutes: t.durationMinutes || 45 + idx * 5,
          lectureCount: 1,
          completed: false,
          resources: resourcesForTopic(idx),
        };
      }),
    });
  });
  if (chapters.length === 0) {
    chapters.push({
      id: `ch-${key}-0`,
      name: names[0],
      topics: topics.map((t, i) => ({
        id: t.id,
        name: topicName(t),
        durationMinutes: t.durationMinutes || 45,
        lectureCount: 1,
        completed: false,
        resources: resourcesForTopic(i),
      })),
    });
  }
  return chapters;
}

function computeCounts(subjects: CurriculumSubject[], padMinimums: boolean): CurriculumCounts {
  let lectures = 0;
  let dpp = 0;
  let pyq = 0;
  let notes = 0;
  let mindmaps = 0;
  let studyMinutes = 0;

  subjects.forEach(sub => {
    sub.chapters.forEach(ch => {
      ch.topics.forEach(t => {
        lectures += t.lectureCount;
        dpp += t.resources.dpp;
        pyq += t.resources.pyq;
        notes += t.resources.notes;
        mindmaps += t.resources.mindmaps;
        studyMinutes += t.durationMinutes;
      });
    });
  });

  if (padMinimums) {
    return {
      lectures,
      dpp: Math.max(dpp, 1),
      pyq: Math.max(pyq, 1),
      notes: Math.max(notes, 1),
      mindmaps: Math.max(mindmaps, 1),
      mockTests: 2,
      studyMinutes: studyMinutes || 90,
    };
  }

  return {
    lectures,
    dpp,
    pyq,
    notes,
    mindmaps,
    mockTests: 0,
    studyMinutes,
  };
}

export function buildCurriculum(course: {
  subjects?: { id: string; name: string }[];
  topics?: any[];
  curriculum?: any[];
}): { subjects: CurriculumSubject[]; counts: CurriculumCounts } {
  const apiCurriculum = asArray(course.curriculum);
  if (apiCurriculum.length > 0) {
    return buildFromApiCurriculum(apiCurriculum);
  }

  const rawSubjects = course.subjects?.length
    ? course.subjects
    : [{ id: 'general', name: 'Lessons' }];
  const topics = course.topics || [];

  const subjects: CurriculumSubject[] = rawSubjects.map(s => {
    const subjectTopics = topics.filter(t => !t.subjectId || t.subjectId === s.id);
    const meta = getSubjectMeta(s.name);
    const chapters = chaptersForSubject(
      s.name,
      subjectTopics.length ? subjectTopics : topics,
    );
    const totalTopics = chapters.reduce((n, ch) => n + ch.topics.length, 0);
    return {
      id: s.id,
      name: s.name,
      icon: meta.icon,
      color: meta.color,
      chapters,
      completedTopics: 0,
      totalTopics,
    };
  });

  return { subjects, counts: computeCounts(subjects, true) };
}
