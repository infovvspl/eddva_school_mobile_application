import api from './api';

export const analyticsService = {
  getPerformance: () => api.get('/analytics/performance'),
  getStudentPerformance: () => api.get('/analytics/student/performance'),
  getStudentEngagement: () => api.get('/analytics/student/engagement'),
  getStudentStudyPlan: () => api.get('/analytics/student/study-plan'),
  getStudentInsights: () => api.get('/analytics/student/insights'),
};
