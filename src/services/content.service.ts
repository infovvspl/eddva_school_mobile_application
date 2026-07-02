import { USE_MOCK } from '../config/appConfig';
import api from './api';

const realContentService = {
  getLecture: (lectureId: string) => api.get(`/content/lectures/${lectureId}`),

  translateNotes: (lectureId: string) =>
    api.post(`/content/lectures/${lectureId}/translate-notes`),

  translateTranscript: (lectureId: string) =>
    api.post(`/content/lectures/${lectureId}/translate-transcript`),

  getLectureProgress: (lectureId: string) =>
    api.get(`/content/lectures/${lectureId}/progress`),

  updateLectureProgress: (
    lectureId: string,
    payload: {
      watchedSeconds: number;
      durationSeconds?: number;
      completed?: boolean;
      progressPercent?: number;
    },
  ) => api.patch(`/content/lectures/${lectureId}/progress`, payload),
};

const mockContentService = {
  getLecture: async (lectureId: string) => ({
    data: {
      id: lectureId,
      title: 'Demo lecture',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      aiNotesMarkdown: '## Demo notes\n\nKey points from this lesson.',
      transcript: 'Welcome to the demo lecture transcript.',
      transcriptHi: 'डेमो व्याख्यान का प्रतिलेख।',
      quizCheckpoints: [
        {
          id: 'mock-q1',
          questionText: 'What is the SI unit of force?',
          options: [
            { label: 'A', text: 'Newton' },
            { label: 'B', text: 'Joule' },
            { label: 'C', text: 'Watt' },
            { label: 'D', text: 'Pascal' },
          ],
          correctOption: 'A',
          explanation: 'Force is measured in Newtons (N).',
          triggerAtPercent: 15,
          segmentTitle: 'Checkpoint 1',
        },
      ],
    },
  }),
  translateNotes: async () => ({ data: { aiNotesMarkdown: '## हिंदी नोट्स\n\nडेमो।' } }),
  translateTranscript: async () => ({ data: { transcriptHi: 'डेमो प्रतिलेख।' } }),
  getLectureProgress: async () => ({ data: { watchedSeconds: 0, progressPercent: 0 } }),
  updateLectureProgress: async () => ({ data: { success: true } }),
};

export const contentService = USE_MOCK ? mockContentService : realContentService;
