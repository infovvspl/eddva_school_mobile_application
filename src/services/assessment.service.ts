import { USE_MOCK } from '../config/appConfig';
import { mockAssessmentService } from '../mocks/mockAssessmentService';
import api from './api';

const realAssessmentService = {
  getMockTests: () => api.get('/assessments/mock-tests'),
  getMockTest: (id: string) => api.get(`/assessments/mock-tests/${id}`),
  getMockTestStats: (id: string) => api.get(`/assessments/mock-tests/${id}/question-stats`),

  startSession: (payload: { mockTestId?: string; topicId?: string; type?: string }) =>
    api.post('/assessments/sessions/start', payload),

  getSession: (id: string) => api.get(`/assessments/sessions/${id}`),

  saveAnswer: (
    sessionId: string,
    payload: {
      questionId: string;
      selectedOption?: string;
      selectedIndex?: number;
      answer?: string;
    },
  ) => api.post(`/assessments/sessions/${sessionId}/answer`, payload),

  submitSession: (id: string) => api.post(`/assessments/sessions/${id}/submit`),

  getSessionResult: (id: string) => api.get(`/assessments/sessions/${id}/result`),

  getMySessions: () => api.get('/assessments/sessions'),

  getProgressOverview: () => api.get('/assessments/progress/overview'),

  getProgressReport: () => api.get('/assessments/progress/report'),

  getTopicPyqOverview: (topicId: string) =>
    api.get(`/assessments/topics/${topicId}/pyqs/overview`),

  getTopicPyqs: (topicId: string, params?: Record<string, string>) =>
    api.get(`/assessments/topics/${topicId}/pyqs`, { params }),

  startPyqSession: (topicId: string, payload?: Record<string, unknown>) =>
    api.post(`/assessments/topics/${topicId}/pyqs/start-session`, payload ?? {}),

  submitPyqAnswer: (topicId: string, questionId: string, payload: Record<string, unknown>) =>
    api.post(`/assessments/topics/${topicId}/pyqs/${questionId}/submit`, payload),

  getTopicPyqProgress: (topicId: string) =>
    api.get(`/assessments/topics/${topicId}/pyqs/my-progress`),
};

export const assessmentService = USE_MOCK ? mockAssessmentService : realAssessmentService;
