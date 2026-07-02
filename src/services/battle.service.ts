import { USE_MOCK } from '../config/appConfig';
import { mockBattleService } from '../mocks/mockBattleService';
import api from './api';

export type BotQuestionsParams = {
  scope: 'subject' | 'chapter' | 'topic';
  scopeId: string;
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
};

const realBattleService = {
  getDaily: () => api.get('/battles/daily'),
  getMyHistory: () => api.get('/battles/my-history'),
  getMyElo: () => api.get('/battles/my-elo'),
  getLeaderboard: () => api.get('/battles/leaderboard'),
  getRoom: (id: string) => api.get(`/battles/${id}`),
  create: (
    payload: {
      subjectId?: string;
      topicId?: string;
      mode?:
        | 'quick_duel'
        | 'challenge_friend'
        | 'daily'
        | 'topic_battle'
        | 'bot_practice';
    } = {},
  ) => api.post('/battles/create', payload),

  createQuickDuel: () => api.post('/battles/create', { mode: 'quick_duel' }),

  createFriendChallenge: () => api.post('/battles/create', { mode: 'challenge_friend' }),
  join: (roomCode: string) =>
    api.post('/battles/join', { roomCode: roomCode.trim().toUpperCase() }),
  cancel: (id: string) => api.delete(`/battles/${id}`),
  getBotQuestions: (params: BotQuestionsParams) =>
    api.get('/battles/bot-questions', { params }),
};

export const battleService = USE_MOCK ? mockBattleService : realBattleService;
