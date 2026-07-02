import { asArray } from './apiData';
import { toPercent } from './progress';
import type { BacklogCategory, StudyPlanCourse, StudyPlanTodayItem } from '../types/studyPlan';

export function mapStudyPlanCourses(data: unknown): StudyPlanCourse[] {
  return asArray(data, ['courses', 'batches']).map((c: Record<string, unknown>, i) => {
    const id = String(c.courseId ?? c.batchId ?? c.id ?? `course-${i}`);
    return {
      courseId: id,
      id,
      courseName: String(c.courseName ?? c.batchName ?? c.name ?? 'Course'),
      batchName: String(c.batchName ?? c.name ?? ''),
      examType: String(c.examType ?? c.examTarget ?? c.exam ?? ''),
      examYear: String(c.examYear ?? c.targetYear ?? c.year ?? ''),
      startsOn: c.startsOn
        ? String(c.startsOn)
        : c.startDate
          ? String(c.startDate)
          : undefined,
      dailyHours: Number(c.dailyStudyHours ?? c.dailyHours ?? 0) || undefined,
      hasStudyPlan: Boolean(c.hasStudyPlan ?? c.planActive ?? c.hasPlan),
      daysLeft: Number(c.daysLeft ?? c.daysRemaining ?? 0) || undefined,
    };
  });
}

export function mapEnrolledToStudyCourses(data: unknown): StudyPlanCourse[] {
  return asArray(data, ['courses', 'batches']).map((c: Record<string, unknown>, i) => {
    const id = String(c.batchId ?? c.id ?? `batch-${i}`);
    return {
      courseId: id,
      id,
      courseName: String(c.batchName ?? c.name ?? 'Course'),
      batchName: String(c.batchName ?? c.name ?? ''),
      examType: String(c.examType ?? c.examTarget ?? ''),
      examYear: String(c.examYear ?? c.targetYear ?? ''),
      startsOn: c.startsOn ? String(c.startsOn) : undefined,
      hasStudyPlan: false,
    };
  });
}

export function mapTodayItems(payload: unknown): StudyPlanTodayItem[] {
  const items = asArray(payload, ['items', 'planItems', 'tasks', 'todayItems']);
  return items.map((i: Record<string, unknown>, idx) => {
    const status = String(i.status ?? '').toLowerCase();
    return {
      id: String(i.id ?? i.itemId ?? i.planItemId ?? `item-${idx}`),
      title: String(
        i.title ?? i.name ?? i.topicName ?? i.lectureTitle ?? i.label ?? 'Task',
      ),
      type: String(i.type ?? i.itemType ?? 'topic').toLowerCase(),
      estimatedMinutes:
        Number(i.estimatedMinutes ?? i.durationMinutes ?? i.duration ?? 0) || undefined,
      completed: Boolean(
        i.completed ??
          i.isCompleted ??
          (status === 'completed' || status === 'done'),
      ),
      skipped: Boolean(i.skipped ?? status === 'skipped'),
      overdue: Boolean(i.overdue ?? status === 'overdue'),
      xpReward: Number(i.xpReward ?? i.xp ?? 0) || undefined,
      subject: i.subjectName
        ? String(i.subjectName)
        : i.subject
          ? String(i.subject)
          : undefined,
      topicId: i.topicId ? String(i.topicId) : undefined,
      lectureId: i.lectureId ? String(i.lectureId) : undefined,
      batchId: i.batchId ? String(i.batchId) : undefined,
      testId: i.testId ? String(i.testId) : undefined,
    };
  });
}

export function mapTodayResponse(payload: unknown) {
  const root =
    payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const items = mapTodayItems(payload);
  return {
    items,
    hasPlan: Boolean(
      root.hasPlan ?? root.planExists ?? root.active ?? items.length > 0,
    ),
  };
}

export function mapNextAction(data: unknown) {
  if (!data || typeof data !== 'object') return null;
  const root = data as Record<string, unknown>;
  const action =
    (root.action as Record<string, unknown> | undefined) ??
    (root.nextAction as Record<string, unknown> | undefined) ??
    root;
  const title = action.title ?? action.topicName ?? action.lectureTitle ?? action.name;
  if (!title) return null;
  return {
    title: String(title),
    type: String(action.type ?? action.itemType ?? 'topic'),
    estimatedMinutes: Number(
      action.estimatedMinutes ?? action.durationMinutes ?? action.duration ?? 30,
    ),
    topicId: action.topicId ? String(action.topicId) : undefined,
    lectureId: action.lectureId ? String(action.lectureId) : undefined,
  };
}

export function mapHubMeta(
  course: Record<string, unknown> | null | undefined,
  todayPayload: unknown,
  dashboard: Record<string, unknown> | null | undefined,
  planPayload?: unknown,
  profile?: Record<string, unknown> | null,
) {
  const today = mapTodayResponse(todayPayload);
  const plan =
    planPayload && typeof planPayload === 'object'
      ? (planPayload as Record<string, unknown>)
      : {};
  const dash = dashboard || {};
  const prof = profile || {};
  const co = course || {};

  return {
    userName: String(
      prof.fullName ?? prof.name ?? dash.userName ?? dash.name ?? 'Student',
    ),
    examType: String(
      co.examType ?? co.examTarget ?? plan.examTarget ?? plan.examType ?? 'JEE',
    ),
    examYear: String(co.examYear ?? plan.examYear ?? plan.targetYear ?? ''),
    daysLeft: Number(co.daysLeft ?? plan.daysLeft ?? plan.daysRemaining ?? 0),
    streak: Number(dash.streak ?? prof.streak ?? plan.streak ?? 0),
    dailyHours: Number(
      co.dailyHours ?? co.dailyStudyHours ?? plan.dailyHours ?? plan.dailyStudyHours ?? 4,
    ),
    hasPlan: Boolean(
      today.hasPlan ||
        co.hasStudyPlan ||
        plan.id ||
        plan.planId ||
        plan.status === 'active',
    ),
    backlogCount: today.items.filter(i => i.skipped || i.overdue).length,
  };
}

export function mapBacklogCategories(todayPayload: unknown) {
  const items = mapTodayItems(todayPayload);
  const countByType = (type: string) =>
    items.filter(i => i.type === type).length;

  const categories: BacklogCategory[] = [
    {
      id: 'missed',
      title: 'Missed Tasks',
      description: 'Tasks you skipped from previous days',
      pending: items.filter(i => i.skipped || i.overdue).length,
      status: items.some(i => i.skipped || i.overdue) ? 'pending' : 'clear',
      icon: 'calendar-times',
      color: '#16A34A',
    },
    {
      id: 'videos',
      title: 'Video Lectures',
      description: 'Recorded lectures not yet watched',
      pending: countByType('lecture') + countByType('video'),
      status: countByType('lecture') + countByType('video') > 0 ? 'pending' : 'clear',
      icon: 'play-circle',
      color: '#0066cc',
    },
    {
      id: 'notes',
      title: 'Notes',
      description: 'Study notes to review',
      pending: countByType('notes') + countByType('note'),
      status: countByType('notes') + countByType('note') > 0 ? 'pending' : 'clear',
      icon: 'file-alt',
      color: '#0284C7',
    },
    {
      id: 'pyq',
      title: 'PYQs Pending',
      description: 'Previous year questions',
      pending: countByType('pyq'),
      status: countByType('pyq') > 0 ? 'pending' : 'clear',
      icon: 'trophy',
      color: '#F97316',
    },
    {
      id: 'dpp',
      title: 'DPPs & PDFs',
      description: 'Daily practice sheets',
      pending: countByType('dpp') + countByType('practice'),
      status: countByType('dpp') + countByType('practice') > 0 ? 'pending' : 'clear',
      icon: 'clipboard-list',
      color: '#DC2626',
    },
  ];

  return { categories };
}

export function mapBacklogItems(todayPayload: unknown, categoryId: string) {
  const items = mapTodayItems(todayPayload);
  const typeMap: Record<string, string[]> = {
    videos: ['lecture', 'video'],
    notes: ['notes', 'note'],
    pyq: ['pyq'],
    dpp: ['dpp', 'practice'],
    missed: [],
  };

  const filtered =
    categoryId === 'missed'
      ? items.filter(i => i.skipped || i.overdue)
      : items.filter(i => typeMap[categoryId]?.includes(i.type));

  return {
    items: filtered.map(i => ({
      id: i.id,
      title: i.title,
      type: i.type,
      topicId: i.topicId,
      lectureId: i.lectureId,
      testId: i.testId,
      subject: i.subject || '',
      meta: i.overdue ? 'Overdue' : i.estimatedMinutes ? `${i.estimatedMinutes} min` : '',
    })),
  };
}

export function mapWeakAreas(weakPayload: unknown) {
  const topics: Record<string, unknown>[] = asArray(weakPayload, [
    'topics',
    'weakTopics',
    'items',
    'data',
  ]);
  const lowAccuracy = topics.filter(
    t => Number(t.accuracy ?? t.accuracyPct ?? 100) < 50,
  );

  return {
    areas: [
      {
        id: 'chapters',
        title: 'Weak Chapters',
        description: 'Chapters with overall accuracy below 50%',
        count: new Set(
          topics.map(t => t.chapterId || t.chapterName).filter(Boolean),
        ).size,
        countLabel: 'chapters',
        icon: 'book-open',
        color: '#F97316',
      },
      {
        id: 'accuracy',
        title: 'Low Accuracy',
        description: 'Topics where you score below 50%',
        count: lowAccuracy.length,
        countLabel: 'topics',
        icon: 'chart-line',
        color: '#DC2626',
      },
      {
        id: 'forgotten',
        title: 'Forgotten',
        description: 'Topics needing revision',
        count: topics.filter(t => t.forgotten || t.needsRevision).length,
        countLabel: 'topics',
        icon: 'brain',
        color: '#0066cc',
      },
      {
        id: 'negative',
        title: 'High Negative',
        description: 'Topics with many wrong answers',
        count: topics.filter(t => Number(t.wrongCount ?? 0) > 3).length,
        countLabel: 'topics',
        icon: 'bullseye',
        color: '#004499',
      },
    ],
  };
}

export function mapWeakAreaItems(weakPayload: unknown, areaId: string) {
  const topics: Record<string, unknown>[] = asArray(weakPayload, [
    'topics',
    'weakTopics',
    'items',
  ]);
  let filtered = topics;

  if (areaId === 'accuracy') {
    filtered = topics.filter(t => Number(t.accuracy ?? t.accuracyPct ?? 100) < 50);
  } else if (areaId === 'forgotten') {
    filtered = topics.filter(t => t.forgotten || t.needsRevision);
  } else if (areaId === 'negative') {
    filtered = topics.filter(t => Number(t.wrongCount ?? 0) > 3);
  }

  return {
    items: filtered.map((t, idx) => ({
      id: String(t.topicId || t.id || idx),
      title: String(t.topicName || t.name || t.title || 'Topic'),
      topicId: String(t.topicId || t.id || idx),
      testId: t.testId ? String(t.testId) : undefined,
      subject: String(t.subjectName || t.subject || ''),
      accuracy: Number(t.accuracy ?? t.accuracyPct ?? 0),
    })),
  };
}

export function mapRevisionCards(
  spaced: unknown,
  intensive: unknown,
  notes: unknown,
  practice: unknown,
) {
  const dueSpaced = asArray(spaced, ['topics', 'items', 'dueTopics']).length;
  const intensiveLocked = asArray(intensive, ['topics', 'items']).length === 0;
  const notesCount = asArray(notes, ['sessions', 'items', 'notes']).length;
  const practiceCount = asArray(practice, ['sessions', 'items']).length;

  return {
    cards: [
      {
        id: 'spaced',
        title: 'Spaced Repetition',
        description: 'Smart revision cycles based on your performance.',
        badge: dueSpaced > 0 ? `${dueSpaced} topics due` : 'No topics due',
        icon: 'sync',
        locked: false,
      },
      {
        id: 'intensive',
        title: 'Intensive Revision',
        description: 'Focus on high-volume review of recently learned concepts.',
        badge: intensiveLocked ? 'Complete more syllabus' : 'Available',
        icon: 'fire',
        locked: intensiveLocked,
      },
      {
        id: 'ai-notes',
        title: 'AI Revision Notes',
        description: 'Review your personalized AI study summaries.',
        badge: notesCount > 0 ? `${notesCount} sessions` : 'None yet',
        icon: 'robot',
        locked: false,
      },
      {
        id: 'practice',
        title: 'Practice History',
        description: 'Re-attempt and review past practice questions.',
        badge: practiceCount > 0 ? `${practiceCount} completed` : 'None yet',
        icon: 'check-circle',
        locked: false,
      },
    ],
  };
}

export function mapRoadmap(overview: unknown) {
  const root = (overview as Record<string, unknown>) || {};
  const subjects: Record<string, unknown>[] = asArray(overview, ['subjects']).length
    ? asArray(overview, ['subjects'])
    : asArray(root.progress, ['subjects']);

  const completed = Number(root.completedTopics ?? root.completed ?? 0);
  const total = Number(root.totalTopics ?? root.total ?? 0);
  const inProgress = Number(root.inProgressTopics ?? root.ongoing ?? 0);
  const percent = toPercent(
    root.overallPct ??
      root.progressPercent ??
      root.percent ??
      (total ? (completed / total) * 100 : 0),
  );

  return {
    progress: {
      percent,
      completed,
      ongoing: inProgress,
      todo: Math.max(0, total - completed - inProgress),
      accuracy: Number(root.accuracy ?? root.accuracyPct ?? 0),
    },
    subjects: subjects.map((s, i) => ({
      id: String(s.id || s.subjectId || i),
      name: String(s.name || s.subjectName || 'Subject'),
      progress: Number(s.progressPercent ?? s.progress ?? s.percent ?? 0),
      topicsLabel: `${s.completedTopics ?? 0}/${s.totalTopics ?? 0} topics`,
      chapters: asArray(s, ['chapters']).map((ch: Record<string, unknown>, j) => ({
        id: String(ch.id || j),
        name: String(ch.name || ch.chapterName || 'Chapter'),
        progress: Number(ch.progressPercent ?? ch.progress ?? 0),
        total: Number(ch.totalTopics ?? ch.topicCount ?? 0),
        topicsLabel: `${ch.completedTopics ?? 0}/${ch.totalTopics ?? ch.topicCount ?? 0} topics`,
      })),
    })),
  };
}

export function mapAISarthi(insights: unknown, dashboard: unknown) {
  const ins = (insights as Record<string, unknown>) || {};
  const dash = (dashboard as Record<string, unknown>) || {};
  const tips = asArray(ins, ['insights', 'tips', 'recommendations']).map(t =>
    typeof t === 'string' ? t : String((t as Record<string, unknown>).text ?? t),
  );
  return {
    syllabus: Number(ins.syllabusProgress ?? ins.syllabus ?? dash.syllabusProgress ?? 0),
    streak: Number(ins.streak ?? dash.streak ?? 0),
    testReady: Number(ins.testReady ?? ins.readiness ?? dash.testReady ?? 0),
    xp: Number(ins.xp ?? dash.xp ?? dash.xpPoints ?? 0),
    revHealth: Number(ins.revisionHealth ?? ins.revHealth ?? 100),
    weakTopics: Number(ins.weakTopicsCount ?? ins.weakTopics ?? 0),
    insights: tips,
  };
}
