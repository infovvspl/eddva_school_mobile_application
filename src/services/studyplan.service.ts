import { USE_MOCK } from '../config/appConfig';
import { mockStudyPlanService } from '../mocks/mockStudyPlanService';
import api from './api';
import { studentService } from './student.service';
import { analyticsService } from './analytics.service';
import {
  mapAISarthi,
  mapBacklogCategories,
  mapBacklogItems,
  mapEnrolledToStudyCourses,
  mapHubMeta,
  mapNextAction,
  mapRevisionCards,
  mapRoadmap,
  mapStudyPlanCourses,
  mapTodayResponse,
  mapWeakAreaItems,
  mapWeakAreas,
} from '../utils/studyPlanAdapters';
import { asArray } from '../utils/apiData';

// ─── helpers ──────────────────────────────────────────────────────────────────

/** All study-plan GET endpoints accept ?batchId as the course identifier. */
const batchParam = (batchId: string) => ({ params: { batchId } });

/** Generate / regenerate request body – matches the backend schema exactly. */
export interface GeneratePayload {
  batchId?: string;
  targetExam: string;
  examYear: string;
  currentClass: string;
  dailyStudyHours: number;
}

/** Start-revision-session request body – matches the backend schema exactly. */
export interface RevisionSessionPayload {
  topicId: string;
  accuracy: number;
  intervalDays: 1 | 3 | 7 | 21;
}

const findCourse = async (batchId: string) => {
  try {
    const { data } = await api.get('/study-plans/courses');
    const courses = mapStudyPlanCourses(data);
    const found = courses.find(c => c.courseId === batchId);
    if (found) return found;
  } catch {
    /* fallback below */
  }
  try {
    const { data } = await studentService.getMyCourses();
    return (
      mapEnrolledToStudyCourses(data).find(c => c.courseId === batchId) || {
        courseId: batchId,
        id: batchId,
        courseName: 'Course',
      }
    );
  } catch {
    return { courseId: batchId, id: batchId, courseName: 'Course' };
  }
};

// ─── real service ─────────────────────────────────────────────────────────────

const realStudyPlanService = {
  // ── 1. Courses & Status ──────────────────────────────────────────────────
  /**
   * GET /study-plans/courses
   * Lists all active enrollments + study plan generation status.
   */
  getCourses: async () => {
    try {
      const { data } = await api.get('/study-plans/courses');
      const courses = mapStudyPlanCourses(data);
      if (courses.length > 0) return { data: { courses } };
    } catch {
      /* fallback to enrolled batches */
    }
    const { data } = await studentService.getMyCourses();
    return { data: { courses: mapEnrolledToStudyCourses(data) } };
  },

  // ── Hub meta (composite – not a single endpoint) ─────────────────────────
  getHubMeta: async (batchId: string) => {
    const [course, todayRes, dashRes, planRes, profileRes] = await Promise.all([
      findCourse(batchId),
      api
        .get('/study-plans/today', batchParam(batchId))
        .catch(() => ({ data: { items: [] } })),
      studentService.getDashboard().catch(() => ({ data: {} })),
      api.get('/study-plans', batchParam(batchId)).catch(() => ({ data: null })),
      studentService.getProfile().catch(() => ({ data: {} })),
    ]);
    return {
      data: mapHubMeta(
        course as Record<string, unknown>,
        todayRes.data,
        dashRes.data as Record<string, unknown>,
        planRes.data,
        profileRes.data as Record<string, unknown>,
      ),
    };
  },

  // ── 3. Study Plan Items & Actions ────────────────────────────────────────

  /**
   * GET /study-plans/today  ?batchId=
   * All scheduled tasks for today.
   */
  getToday: async (batchId: string) => {
    const { data } = await api.get('/study-plans/today', batchParam(batchId));
    return { data: mapTodayResponse(data) };
  },

  /**
   * GET /study-plans  ?batchId=  (used as backlog source)
   */
  getBacklogs: async (batchId: string) => {
    const { data } = await api
      .get('/study-plans/today', batchParam(batchId))
      .catch(() => ({ data: { items: [] } }));
    return { data: mapBacklogCategories(data) };
  },

  getBacklogItems: async (batchId: string, categoryId: string) => {
    const { data } = await api
      .get('/study-plans/today', batchParam(batchId))
      .catch(() => ({ data: { items: [] } }));
    return { data: mapBacklogItems(data, categoryId) };
  },

  /**
   * GET /study-plans/next-action  ?batchId=
   */
  getNextAction: async (batchId: string) => {
    const { data } = await api
      .get('/study-plans/next-action', batchParam(batchId))
      .catch(() => ({ data: null }));
    return { data: mapNextAction(data) };
  },

  /**
   * PATCH /study-plans/items/:itemId/complete
   */
  completeItem: (itemId: string) => api.patch(`/study-plans/items/${itemId}/complete`),

  /**
   * PATCH /study-plans/items/:itemId/skip
   */
  skipItem: (itemId: string) => api.patch(`/study-plans/items/${itemId}/skip`),

  /** GET /study-plans (date-range view) */
  getPlan: (batchId: string) => api.get('/study-plans', batchParam(batchId)),

  // ── 2. Study Plan Management ─────────────────────────────────────────────

  /**
   * POST /study-plans/generate
   * Body: { batchId?, targetExam, examYear, currentClass, dailyStudyHours }
   *
   * Overload 1: pass the full payload.
   * Overload 2: pass only batchId (legacy / splash screen fallback).
   */
  generate: (payload: GeneratePayload | string) => {
    if (typeof payload === 'string') {
      // Called from PlanGeneratorSplashScreen with just the batchId
      return api.post('/study-plans/generate', { batchId: payload });
    }
    return api.post('/study-plans/generate', {
      batchId: payload.batchId,
      targetExam: payload.targetExam,
      examYear: payload.examYear,
      currentClass: payload.currentClass,
      dailyStudyHours: payload.dailyStudyHours,
    });
  },

  /**
   * POST /study-plans/regenerate
   * Same body schema as generate.
   */
  regeneratePlan: (batchId: string, extra?: Partial<Omit<GeneratePayload, 'batchId'>>) =>
    api.post('/study-plans/regenerate', {
      batchId,
      targetExam: extra?.targetExam ?? '',
      examYear: extra?.examYear ?? '',
      currentClass: extra?.currentClass ?? '',
      dailyStudyHours: extra?.dailyStudyHours ?? 4,
    }),

  /**
   * POST /study-plans/clear
   * Body: { batchId }
   */
  resetPlan: (batchId: string) =>
    api.post('/study-plans/clear', { batchId }),

  // ── 4. Revision & Study Session APIs ────────────────────────────────────

  /**
   * GET /study-plans/revision/spaced  ?batchId=
   * Returns spaced-repetition topics due/overdue.
   */
  getSpacedRevision: (batchId: string) =>
    api.get('/study-plans/revision/spaced', batchParam(batchId)),

  /**
   * GET /study-plans/revision/intensive  ?batchId=
   * Returns hierarchical syllabus tree (Subject → Chapter → Topic)
   * with completion rates and accuracies.
   */
  getIntensiveRevision: (batchId: string) =>
    api.get('/study-plans/revision/intensive', batchParam(batchId)),

  /**
   * GET /study-plans/revision/notes  ?batchId=
   * Returns completed AI study notes for revision.
   */
  getRevisionNotes: async (batchId: string) => {
    try {
      const { data } = await api.get('/study-plans/revision/notes', batchParam(batchId));
      return { data };
    } catch {
      return { data: { notes: [] } };
    }
  },

  /**
   * GET /study-plans/revision/practice  ?batchId=
   * Returns completed practice sessions under this plan.
   */
  getRevisionPractice: (batchId: string) =>
    api.get('/study-plans/revision/practice', batchParam(batchId)),

  /**
   * Aggregate all four revision endpoints → revision hub cards.
   */
  getRevision: async (batchId: string) => {
    const p = batchParam(batchId);
    const [spaced, intensive, notes, practice] = await Promise.all([
      api.get('/study-plans/revision/spaced', p).catch(() => ({ data: {} })),
      api.get('/study-plans/revision/intensive', p).catch(() => ({ data: {} })),
      api.get('/study-plans/revision/notes', p).catch(() => ({ data: {} })),
      api.get('/study-plans/revision/practice', p).catch(() => ({ data: {} })),
    ]);
    return {
      data: mapRevisionCards(spaced.data, intensive.data, notes.data, practice.data),
    };
  },

  /**
   * POST /study-plans/revision-session
   * Body: { topicId, accuracy, intervalDays: 1|3|7|21 }
   *
   * Starts a structured spaced-revision session.
   */
  startRevisionSession: (payload: RevisionSessionPayload) =>
    api.post('/study-plans/revision-session', {
      topicId: payload.topicId,
      accuracy: payload.accuracy,
      intervalDays: payload.intervalDays,
    }),

  // ── Roadmap (non-study-plan endpoint) ───────────────────────────────────
  getRoadmap: async (batchId: string) => {
    try {
      const { data } = await api.get('/assessments/progress/overview', batchParam(batchId));
      return { data: mapRoadmap(data) };
    } catch {
      const { data } = await api.get('/assessments/progress/report').catch(() => ({ data: {} }));
      return { data: mapRoadmap(data) };
    }
  },

  // ── AI Insights / AI Sarthi (non-study-plan endpoint) ───────────────────
  getAISarthi: async (batchId: string) => {
    const [insightsRes, dashRes] = await Promise.all([
      analyticsService.getStudentInsights().catch(() => ({ data: {} })),
      studentService.getDashboard().catch(() => ({ data: {} })),
    ]);
    const dash = {
      ...(dashRes.data as Record<string, unknown>),
      batchId,
    };
    return { data: mapAISarthi(insightsRes.data, dash) };
  },

  // ── Weak Areas (derived from student analytics) ───────────────────────────
  getWeakAreas: async (_batchId: string) => {
    const { data } = await studentService.getWeakTopics().catch(() => ({ data: [] }));
    return { data: mapWeakAreas(data) };
  },

  getWeakAreaItems: async (_batchId: string, areaId: string) => {
    const { data } = await studentService.getWeakTopics().catch(() => ({ data: [] }));
    return { data: mapWeakAreaItems(data, areaId) };
  },
};

export const studyPlanService = (USE_MOCK ? mockStudyPlanService : realStudyPlanService) as typeof realStudyPlanService;
