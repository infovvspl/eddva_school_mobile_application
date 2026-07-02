import { USE_MOCK } from '../config/appConfig';
import { mockDoubtService } from '../mocks/mockDoubtService';
import api from './api';

const realDoubtService = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get('/doubts', { params }),

  getById: (id: string) => api.get(`/doubts/${id}`),

  create: (payload: {
    question: string;
    batchId?: string;
    topicId?: string;
    imageUrl?: string;
    source?: 'lecture' | 'question' | 'battle' | 'manual';
    explanationMode?: 'short' | 'detailed';
    /** `ai` = instant AI answer; `teacher` = faculty queue only */
    target?: 'ai' | 'teacher';
  }) =>
    api.post('/doubts', {
      questionText: payload.question,
      source: payload.source || 'manual',
      explanationMode: payload.explanationMode || 'detailed',
      skipAI: payload.target === 'teacher',
      batchId: payload.batchId,
      topicId: payload.topicId,
      questionImageUrl: payload.imageUrl,
    }),

  markHelpful: (id: string, helpful: boolean) =>
    api.patch(`/doubts/${id}/helpful`, { isHelpful: helpful }),

  requestAI: (id: string) => api.patch(`/doubts/${id}/request-ai`),

  reopen: (id: string, reason?: string) =>
    api.patch(`/doubts/${id}/reopen`, { reason }),

  rateTeacher: (id: string, helpful: boolean) =>
    api.patch(`/doubts/${id}/rate-teacher`, { helpful }),
};

export const doubtService = USE_MOCK ? mockDoubtService : realDoubtService;
