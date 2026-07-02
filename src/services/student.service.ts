import { USE_MOCK } from '../config/appConfig';
import { mockStudentService } from '../mocks/mockStudentService';
import { authService } from './auth.service';
import { leaderboardService } from './leaderboard.service';
import { asArray } from '../utils/apiData';
import { findTopicInCurriculum } from '../utils/courseMappers';
import { normalizeStudentProfile, type StudentProfile } from '../utils/profileMappers';
import api from './api';

const realStudentService = {
  getDashboard: () => api.get('/students/dashboard'),
  getContinueLearning: () => api.get('/students/continue-learning'),
  getWeakTopics: () => api.get('/students/weak-topics'),
  getMyCourses: () => api.get('/students/my-courses'),
  getCourseDetail: (batchId: string) => api.get(`/students/my-courses/${batchId}`),
  /** Enrolled detail, or batch preview when not enrolled yet. */
  fetchCourse: async (batchId: string) => {
    try {
      return await api.get(`/students/my-courses/${batchId}`);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404) {
        return api.get(`/students/batches/${batchId}`);
      }
      throw err;
    }
  },
  getBatchPreview: (batchId: string) => api.get(`/students/batches/${batchId}`),
  getTopicDetail: (batchId: string, topicId: string) =>
    api.get(`/students/my-courses/${batchId}/topics/${topicId}`),
  fetchTopicDetail: async (batchId: string, topicId: string) => {
    try {
      return await api.get(`/students/my-courses/${batchId}/topics/${topicId}`);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403 || status === 404) {
        const { data: batch } = await api.get(`/students/batches/${batchId}`);
        const curriculum = asArray((batch as any)?.curriculum);
        const topic = findTopicInCurriculum(curriculum, topicId);
        return { data: topic || { id: topicId } };
      }
      throw err;
    }
  },
  getWeeklyActivity: () => api.get('/students/weekly-activity'),
  getProfile: () => api.get('/students/profile'),
  /** Merges profile, auth/me, dashboard, and leaderboard for the full student card. */
  getFullProfile: async (): Promise<{ data: StudentProfile }> => {
    const results = await Promise.allSettled([
      api.get('/students/profile'),
      authService.getMe(),
      api.get('/students/dashboard'),
      leaderboardService.getMe(),
      api.get('/students/my-courses'),
    ]);

    const pick = (i: number) =>
      results[i].status === 'fulfilled' ? (results[i] as PromiseFulfilledResult<{ data: unknown }>).value.data : null;

    const profile = pick(0);
    const me = pick(1);
    const dashboard = pick(2);
    const leaderboard = pick(3);
    const courses = pick(4);
    const courseList = asArray(courses, ['courses', 'batches', 'enrolledBatches', 'items']);

    const merged = normalizeStudentProfile(profile, me, dashboard, leaderboard, {
      coursesCount: courseList.length,
    });

    return { data: merged };
  },
  updateProfile: (payload: Record<string, unknown>) =>
    api.patch('/students/profile', {
      fullName: payload.fullName ?? payload.name,
      name: payload.name ?? payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber ?? payload.phone,
      ...payload,
    }),
  joinBatchByInviteToken: (token: string) => api.post('/batches/join', { token }),
  discoverBatches: () => api.get('/students/discover-batches'),
  enrollBatch: (batchId: string) => api.post(`/students/enroll/${batchId}`),
  createBatchCheckout: (batchId: string) => api.post(`/batches/${batchId}/checkout`),
  verifyBatchPayment: (
    batchId: string,
    payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) => api.post(`/batches/${batchId}/verify-payment`, payload),
};

export const studentService = USE_MOCK ? mockStudentService : realStudentService;
