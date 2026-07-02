import { mockDelay } from './delay';
import { getEnrolledBatches, hasAnyEnrollment } from './mockStore';
import type { BacklogCategory } from '../types/studyPlan';

let planGenerated = false;

export type { BacklogCategory } from '../types/studyPlan';

export const mockStudyPlanService = {
  getCourses: async () => {
    await mockDelay();
    if (!hasAnyEnrollment()) return { data: { courses: [] } };
    return {
      data: {
        courses: getEnrolledBatches().map(b => ({
          courseId: b.batchId,
          id: b.batchId,
          courseName: b.batchName,
          batchName: b.batchName,
          examType: b.examType || 'JEE',
          examYear: b.examYear || '2027',
          startsOn: b.startsOn || "Batch 2025-26",
        })),
      },
    };
  },

  getHubMeta: async (_courseId: string) => {
    await mockDelay();
    return {
      data: {
        userName: 'Bhagyasree',
        examType: 'JEE',
        examYear: '2027',
        daysLeft: 323,
        streak: 1,
        dailyHours: 4,
        hasPlan: planGenerated && hasAnyEnrollment(),
        backlogCount: 6,
      },
    };
  },

  getToday: async (courseId: string) => {
    await mockDelay();
    if (!hasAnyEnrollment() || !planGenerated) return { data: { items: [], courseId } };
    return {
      data: {
        items: [
          {
            id: 'i1',
            title: 'Watch: Kinematics revision',
            type: 'lecture',
            estimatedMinutes: 25,
            completed: false,
            xpReward: 20,
          },
          {
            id: 'i2',
            title: 'Practice: 10 MCQs — Newton Laws',
            type: 'practice',
            estimatedMinutes: 15,
            completed: true,
            xpReward: 15,
          },
          {
            id: 'i3',
            title: 'DPP: Electrostatics Set 2',
            type: 'dpp',
            estimatedMinutes: 20,
            completed: false,
            xpReward: 25,
          },
        ],
        courseId,
      },
    };
  },

  getNextAction: async () => {
    await mockDelay();
    if (!hasAnyEnrollment() || !planGenerated) return { data: null };
    return {
      data: {
        title: 'Continue Newton Laws of Motion',
        type: 'video',
        estimatedMinutes: 45,
      },
    };
  },

  getBacklogItems: async (_courseId: string, categoryId: string) => {
    await mockDelay();
    if (categoryId === 'videos') {
      return {
        data: {
          items: [
            {
              id: 'v1',
              title: 'Kinematics — Lecture 3',
              subject: 'Physics',
              meta: '2 days overdue',
            },
            {
              id: 'v2',
              title: 'Organic Basics — Intro',
              subject: 'Chemistry',
              meta: '5 days overdue',
            },
          ],
        },
      };
    }
    return { data: { items: [] } };
  },

  getBacklogs: async (_courseId?: string) => {
    await mockDelay();
    const categories: BacklogCategory[] = [
      {
        id: 'missed',
        title: 'Missed Tasks',
        description: 'Tasks you skipped from previous days',
        pending: 0,
        status: 'clear',
        icon: 'calendar-times',
        color: '#10B981',
      },
      {
        id: 'videos',
        title: 'Video Lectures',
        description: 'Recorded lectures not yet watched',
        pending: 2,
        status: 'pending',
        icon: 'play-circle',
        color: '#2563EB',
      },
      {
        id: 'notes',
        title: 'Notes',
        description: 'Handwritten notes to review',
        pending: 0,
        status: 'clear',
        icon: 'file-alt',
        color: '#8B5CF6',
      },
      {
        id: 'mindmaps',
        title: 'Mindmaps',
        description: 'Visual summaries pending',
        pending: 0,
        status: 'clear',
        icon: 'project-diagram',
        color: '#059669',
      },
      {
        id: 'pyq',
        title: 'PYQs Pending',
        description: 'Previous year questions',
        pending: 0,
        status: 'clear',
        icon: 'trophy',
        color: '#D97706',
      },
      {
        id: 'dpp',
        title: 'DPPs & PDFs',
        description: 'Daily practice sheets',
        pending: 0,
        status: 'clear',
        icon: 'clipboard-list',
        color: '#DC2626',
      },
    ];
    return { data: { categories } };
  },

  getWeakAreaItems: async (_courseId: string, areaId: string) => {
    await mockDelay();
    if (areaId === 'chapters' || areaId === 'accuracy') {
      return {
        data: {
          items: [
            {
              id: 'w1',
              title: 'Newton Laws of Motion',
              subject: 'Physics',
              accuracy: 42,
            },
            {
              id: 'w2',
              title: 'Chemical Bonding',
              subject: 'Chemistry',
              accuracy: 38,
            },
          ],
        },
      };
    }
    return { data: { items: [] } };
  },

  getWeakAreas: async () => {
    await mockDelay();
    return {
      data: {
        areas: [
          {
            id: 'chapters',
            title: 'Weak Chapters',
            description: 'Chapters with overall accuracy < 50%',
            count: 0,
            countLabel: 'chapters',
            icon: 'book-open',
            color: '#F59E0B',
          },
          {
            id: 'accuracy',
            title: 'Low Accuracy',
            description: 'Topics where you score below 50%',
            count: 0,
            countLabel: 'topics',
            icon: 'chart-line',
            color: '#EF4444',
          },
          {
            id: 'forgotten',
            title: 'Forgotten',
            description: 'Completed 14+ days ago without revision',
            count: 0,
            countLabel: 'topics',
            icon: 'brain',
            color: '#8B5CF6',
          },
          {
            id: 'negative',
            title: 'High Negative',
            description: 'PYQ topics with > 50% wrong answers',
            count: 0,
            countLabel: 'topics',
            icon: 'bullseye',
            color: '#DC2626',
          },
        ],
      },
    };
  },

  getRevision: async () => {
    await mockDelay();
    return {
      data: {
        cards: [
          {
            id: 'spaced',
            title: 'Spaced Repetition',
            description: 'Smart 1, 3, 7, 21 day revision cycles based on your performance.',
            badge: '0 topics due',
            icon: 'sync',
            locked: false,
          },
          {
            id: 'intensive',
            title: 'Intensive Revision',
            description: 'Focus on high-volume review of recently learned concepts.',
            badge: 'Unlocks at 100% completion',
            icon: 'fire',
            locked: true,
          },
          {
            id: 'ai-notes',
            title: 'AI Revision Notes',
            description: 'Review your personalized AI study summaries and highlights.',
            badge: '0 sessions',
            icon: 'robot',
            locked: false,
          },
          {
            id: 'practice',
            title: 'Practice History',
            description: 'Re-attempt and review past quizzes and practice questions.',
            badge: '0 completed',
            icon: 'check-circle',
            locked: false,
          },
        ],
      },
    };
  },

  getRoadmap: async () => {
    await mockDelay();
    return {
      data: {
        progress: {
          percent: 0,
          completed: 0,
          ongoing: 2,
          todo: 7,
          accuracy: 0,
        },
        subjects: [
          {
            id: 'math',
            name: 'Mathematics (JEE Advanced)',
            progress: 0,
            topicsLabel: '0/2 topics · 1 chapters',
            chapters: [
              { id: 'calc', name: 'Calculus', progress: 0, total: 2, topicsLabel: '0/2 topics' },
            ],
          },
          {
            id: 'phy',
            name: 'Physics (JEE Advanced)',
            progress: 0,
            topicsLabel: '0/5 topics · 2 chapters',
            chapters: [],
          },
          {
            id: 'chem',
            name: 'Chemistry',
            progress: 0,
            topicsLabel: '0/4 topics · 2 chapters',
            chapters: [],
          },
        ],
      },
    };
  },

  getAISarthi: async () => {
    await mockDelay();
    return {
      data: {
        syllabus: 0,
        streak: 1,
        testReady: 34,
        xp: 1602,
        revHealth: 100,
        weakTopics: 0,
        insights: [
          'Mock test accuracy is below 50%. Increase practice question frequency.',
          'You perform best between 5 PM – 7 PM.',
        ],
      },
    };
  },

  generate: async (_payload: any) => {
    await mockDelay();
    planGenerated = true;
    return { data: { success: true } };
  },

  regeneratePlan: async (_batchId: string, _extra?: any) => {
    await mockDelay();
    planGenerated = true;
    return { data: { success: true } };
  },

  resetPlan: async (_batchId: string) => {
    await mockDelay();
    planGenerated = false;
    return { data: { success: true } };
  },

  completeItem: async () => {
    await mockDelay();
    return { data: { success: true } };
  },

  skipItem: async () => {
    await mockDelay();
    return { data: { success: true } };
  },

  getSpacedRevision: async () => {
    await mockDelay();
    return {
      data: {
        topics: [{ topicId: 'topic-1', topicName: 'Kinematics', dueAt: new Date().toISOString() }],
      },
    };
  },

  startRevisionSession: async (payload: { topicId: string; accuracy: number; intervalDays: number }) => {
    await mockDelay();
    return {
      data: {
        sessionId: `rev-${payload.topicId}`,
        id: `rev-${payload.topicId}`,
        title: 'Spaced revision',
      },
    };
  },

  getRevisionNotes: async (_courseId: string) => {
    await mockDelay();
    return {
      data: {
        notes: [
          {
            id: 'n1',
            topicName: 'Newton\'s Laws of Motion',
            subject: 'Physics',
            keyPoints: [
              'First law: An object stays at rest or in uniform motion unless acted on by a net force.',
              'Second law: F = ma — force equals mass times acceleration.',
              'Third law: Every action has an equal and opposite reaction.',
            ],
            formulae: ['F = ma', 'p = mv', 'Impulse = F × Δt'],
            mnemonics: 'FIFE: Force Is Force × Everything (F=ma always applies)',
            lastReviewed: 'Yesterday',
          },
          {
            id: 'n2',
            topicName: 'Chemical Bonding',
            subject: 'Chemistry',
            keyPoints: [
              'Ionic bonds form between metals and non-metals via electron transfer.',
              'Covalent bonds form by sharing electrons between non-metals.',
              'Bond polarity depends on electronegativity difference.',
            ],
            formulae: ['ΔEN > 1.7 → Ionic', 'ΔEN 0.4–1.7 → Polar covalent', 'ΔEN < 0.4 → Nonpolar covalent'],
            mnemonics: 'LIONS: Low electronegativity = Ionic Or Non-polar Sharing',
          },
          {
            id: 'n3',
            topicName: 'Quadratic Equations',
            subject: 'Mathematics',
            keyPoints: [
              'Standard form: ax² + bx + c = 0',
              'Discriminant D = b² − 4ac determines nature of roots.',
              'If D > 0: two distinct real roots. D = 0: equal roots. D < 0: no real roots.',
            ],
            formulae: ['x = (−b ± √D) / 2a', 'Sum of roots = −b/a', 'Product of roots = c/a'],
            mnemonics: 'DISC: Discriminant Is Sum x Coefficient',
          },
        ],
      },
    };
  },
};
