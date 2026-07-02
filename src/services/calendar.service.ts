import { USE_MOCK } from '../config/appConfig';
import { mockCalendarService } from '../mocks/mockCalendarService';
import api from './api';

const realCalendarService = {
  getFeed: (month?: string) =>
    api.get('/calendar/feed', { params: month ? { month } : undefined }),
};

export const calendarService = USE_MOCK ? mockCalendarService : realCalendarService;
