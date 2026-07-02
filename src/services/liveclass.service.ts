import { USE_MOCK } from '../config/appConfig';
import { mockLiveClassService } from '../mocks/mockLiveClassService';
import api from './api';

const realLiveClassService = {
  getToken: (payload: { lectureId: string; role?: 'host' | 'audience' }) =>
    api.post('/live-class/token', payload),
  start: (lectureId: string) => api.post(`/live-class/${lectureId}/start`),
  getStreamStatus: (lectureId: string) => api.get(`/live-class/${lectureId}/stream-status`),
  end: (lectureId: string) => api.post(`/live-class/${lectureId}/end`),
  getSession: (lectureId: string) => api.get(`/live-class/${lectureId}/session`),
  getAttendance: (lectureId: string) => api.get(`/live-class/${lectureId}/attendance`),
  getChat: (liveSessionId: string) => api.get(`/live-class/${liveSessionId}/chat`),
  sendChat: (liveSessionId: string, message: string) =>
    api.post(`/live-class/${liveSessionId}/chat`, { message }),
  getPolls: (liveSessionId: string) => api.get(`/live-class/${liveSessionId}/polls`),
  votePoll: (liveSessionId: string, pollId: string, optionId: string) =>
    api.post(`/live-class/${liveSessionId}/polls/${pollId}/vote`, { optionId }),
};

export const liveClassService = USE_MOCK ? mockLiveClassService : realLiveClassService;
