import { mockDelay } from './delay';
import {
  enrollBatch,
  getCourseDetail,
  getDiscoverBatches,
  getEnrolledBatches,
  hasAnyEnrollment,
} from './mockStore';
import { MOCK_USER, MOCK_USER_ENROLLED } from './catalog';
import { normalizeStudentProfile } from '../utils/profileMappers';
import { DEMO_LECTURE_VIDEO_URL } from './mockLiveClassService';

export const mockStudentService = {
  getDashboard: async () => {
    await mockDelay();
    const enrolled = hasAnyEnrollment();
    const user = enrolled ? MOCK_USER_ENROLLED : MOCK_USER;
    return {
      data: {
        streak: user.streak,
        xp: user.xp,
        rank: user.rank,
        greeting: enrolled ? 'Welcome back!' : 'Start your journey',
      },
    };
  },

  getContinueLearning: async () => {
    await mockDelay();
    if (!hasAnyEnrollment()) return { data: null };
    const enrolled = getEnrolledBatches();
    const first = enrolled[0];
    return {
      data: {
        batchId: first.batchId,
        lectureTitle: first.nextLectureTitle,
        topicName: first.topics?.[0]?.name,
        progressPercent: first.progressPercent,
      },
    };
  },

  getWeakTopics: async () => {
    await mockDelay();
    return {
      data: hasAnyEnrollment()
        ? [{ name: 'Electrodynamics', accuracy: 62 }, { name: 'Organic Chemistry', accuracy: 58 }]
        : [],
    };
  },

  getMyCourses: async () => {
    await mockDelay();
    return { data: { courses: getEnrolledBatches(), batches: getEnrolledBatches() } };
  },

  getCourseDetail: async (batchId: string) => {
    await mockDelay();
    const detail = getCourseDetail(batchId);
    if (!detail) throw new Error('Course not found');
    return { data: detail };
  },

  getBatchPreview: async (batchId: string) => {
    await mockDelay();
    const detail = getCourseDetail(batchId) || getDiscoverBatches().find(b => b.batchId === batchId || b.id === batchId);
    if (!detail) throw new Error('Batch not found');
    return { data: { ...detail, isEnrolled: false } };
  },

  getTopicDetail: async (batchId: string, topicId: string) => {
    await mockDelay();
    const detail = getCourseDetail(batchId);
    const topic = detail?.topics?.find((t: any) => t.id === topicId);
    return {
      data: {
        ...topic,
        batchId,
        videoUrl: DEMO_LECTURE_VIDEO_URL,
      },
    };
  },

  getWeeklyActivity: async () => {
    await mockDelay();
    return {
      data: {
        weeklyActivity: hasAnyEnrollment()
          ? [2, 4, 1, 5, 3, 4, 2]
          : [0, 0, 0, 0, 0, 0, 0],
      },
    };
  },

  getProfile: async () => {
    await mockDelay();
    const enrolled = hasAnyEnrollment();
    return {
      data: {
        ...(enrolled ? MOCK_USER_ENROLLED : MOCK_USER),
        accuracy: enrolled ? 78 : 0,
        totalAttempts: enrolled ? 12 : 0,
        topicsCompleted: enrolled ? 7 : 0,
        totalDoubts: enrolled ? 3 : 0,
      },
    };
  },

  getFullProfile: async () => {
    await mockDelay();
    const enrolled = hasAnyEnrollment();
    const base = enrolled ? MOCK_USER_ENROLLED : MOCK_USER;
    return {
      data: normalizeStudentProfile(
        {
          ...base,
          accuracy: enrolled ? 78 : 0,
          totalAttempts: enrolled ? 12 : 0,
          topicsCompleted: enrolled ? 7 : 0,
          totalDoubts: enrolled ? 3 : 0,
        },
        {
          rankTitle: 'GOLD',
          examTarget: 'JEE',
          className: '12',
          examYear: '2027',
          careOf: 'Parent Name',
          city: 'Hyderabad',
          state: 'Telangana',
          coursesCount: enrolled ? 3 : 0,
        },
      ),
    };
  },

  updateProfile: async (payload: any) => {
    await mockDelay();
    return { data: { ...MOCK_USER_ENROLLED, ...payload } };
  },

  discoverBatches: async () => {
    await mockDelay();
    const batches = getDiscoverBatches();
    return { data: { availableBatches: batches, batches } };
  },

  enrollBatch: async (batchId: string) => {
    await mockDelay();
    enrollBatch(batchId);
    return { data: { success: true, batchId } };
  },

  joinBatchByInviteToken: async (_token: string) => {
    await mockDelay();
    return { data: { success: true } };
  },

  createBatchCheckout: async (batchId: string) => {
    await mockDelay();
    return {
      data: {
        id: `order_${Date.now()}`,
        amount: 99900,
        currency: 'INR',
        batchId,
      },
    };
  },

  verifyBatchPayment: async (batchId: string) => {
    await mockDelay();
    enrollBatch(batchId);
    return { data: { success: true, batchId } };
  },
};
