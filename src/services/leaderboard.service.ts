import { USE_MOCK } from '../config/appConfig';
import { mockLeaderboardService } from '../mocks/mockLeaderboardService';
import api from './api';

const realLeaderboardService = {
  getMe: () => api.get('/leaderboard/me'),
  getGroup: () => api.get('/leaderboard/group'),
  getMockRank: (examType: string) => api.get(`/leaderboard/mock/${examType}`),
  getAnalytics: () => api.get('/analytics/leaderboard'),
};

export const leaderboardService = USE_MOCK ? mockLeaderboardService : realLeaderboardService;