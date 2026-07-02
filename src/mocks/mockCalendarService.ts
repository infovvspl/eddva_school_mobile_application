import { mockDelay } from './delay';
import { hasAnyEnrollment } from './mockStore';

export const mockCalendarService = {
  getFeed: async (month?: string) => {
    await mockDelay();
    const today = new Date().toISOString().slice(0, 10);
    if (!hasAnyEnrollment()) {
      return {
        data: {
          instituteEvents: [
            { id: 'e1', title: 'Free Webinar: How to start JEE prep', type: 'webinar', date: today },
          ],
          liveClasses: [],
          events: [],
        },
      };
    }
    return {
      data: {
        instituteEvents: [
          { id: 'e1', title: 'JEE Mock Test #4', type: 'exam', date: today },
        ],
        liveClasses: [
          {
            id: 'lc1',
            title: 'Physics: Rotational Motion',
            type: 'live_class',
            scheduledAt: today,
            date: today,
            lectureId: 'lec-demo-1',
            teacherName: 'Dr. Rajesh Kumar',
            batchName: 'JEE Physics Master 2025',
          },
        ],
        events: [],
      },
    };
  },
};
