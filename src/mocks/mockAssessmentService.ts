import { mockDelay } from './delay';

const DEMO_QUESTIONS = Array.from({ length: 10 }).map((_, i) => ({
  id: `q${i + 1}`,
  text: `Sample PYQ ${i + 1}: A particle moves in a circle of radius 0.5 m with speed 4 m/s. Centripetal acceleration is closest to:`,
  options: ['8 m/s²', '16 m/s²', '32 m/s²', '64 m/s²'],
}));

export const mockAssessmentService = {
  getMockTests: async () => {
    await mockDelay();
    return {
      data: {
        mockTests: [
          {
            id: 'mt1',
            name: 'JEE Physics Full Test 1',
            examType: 'JEE',
            questionCount: 10,
            durationMinutes: 90,
            isPaid: false,
            price: 0,
            attemptCount: 0,
          },
        ],
      },
    };
  },

  startSession: async () => {
    await mockDelay();
    return {
      data: {
        sessionId: 'demo-session-1',
        id: 'demo-session-1',
        questions: DEMO_QUESTIONS,
        durationMinutes: 90,
      },
    };
  },

  getSession: async () => {
    await mockDelay();
    return { data: { id: 'demo-session-1', questions: DEMO_QUESTIONS, durationMinutes: 90 } };
  },

  saveAnswer: async () => {
    await mockDelay();
    return { data: { success: true } };
  },

  submitSession: async () => {
    await mockDelay();
    return { data: { success: true } };
  },

  getSessionResult: async () => {
    await mockDelay();
    return { data: { score: 72, total: 100, correct: 7, incorrect: 3 } };
  },

  getMySessions: async () => ({ data: { sessions: [] } }),

  getProgressOverview: async () => ({
    data: {
      topics: [
        { topicId: 't1', topicName: 'Rotational Motion', accuracy: 72, attempts: 14 },
        { topicId: 't2', topicName: 'Thermodynamics', accuracy: 58, attempts: 9 },
      ],
    },
  }),

  getProgressReport: async () => ({ data: {} }),

  getTopicPyqOverview: async () => ({ data: { years: [] } }),

  getTopicPyqs: async () => ({ data: { questions: DEMO_QUESTIONS } }),

  startPyqSession: async () => ({
    data: { sessionId: 'demo-pyq-session', questions: DEMO_QUESTIONS },
  }),

  submitPyqAnswer: async () => ({ data: { correct: true } }),

  getTopicPyqProgress: async () => ({ data: { accuracy: 65, attempts: 5 } }),
};
