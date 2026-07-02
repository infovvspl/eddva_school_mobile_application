import { mockDelay } from './delay';

export const mockBattleService = {
  getDaily: async () => {
    await mockDelay();
    return {
      data: {
        title: "Today's Battle",
        subject: 'JEE Physics',
        questions: 10,
      },
    };
  },

  getMyHistory: async () => {
    await mockDelay();
    return {
      data: {
        battles: [
          { id: 'b1', result: 'win', opponent: 'Rival_42', score: '240-180' },
          { id: 'b2', result: 'loss', opponent: 'Ace_NEET', score: '120-200' },
        ],
      },
    };
  },

  getMyElo: async () => {
    await mockDelay();
    return {
      data: {
        wins: 24,
        losses: 11,
        streak: 5,
        elo: 1284,
      },
    };
  },

  getLeaderboard: async () => {
    await mockDelay();
    return { data: { leaderboard: [] } };
  },

  getRoom: async (id: string) => {
    await mockDelay();
    return {
      data: {
        id,
        roomCode: 'EDDVA1234',
        status: 'active',
        playerCount: 2,
        players: [
          { name: 'You', score: 120, isMe: true },
          { name: 'Rival_42', score: 80 },
        ],
      },
    };
  },

  create: async () => {
    await mockDelay();
    return {
      data: {
        id: 'room-' + Date.now(),
        roomCode: 'EDDVA' + Math.floor(Math.random() * 9000 + 1000),
      },
    };
  },

  createQuickDuel: async () => {
    await mockDelay();
    return {
      data: {
        id: 'room-' + Date.now(),
        roomCode: 'EDDVA' + Math.floor(Math.random() * 9000 + 1000),
      },
    };
  },

  createFriendChallenge: async () => {
    await mockDelay();
    return {
      data: {
        id: 'room-' + Date.now(),
        roomCode: 'EDDVA' + Math.floor(Math.random() * 9000 + 1000),
      },
    };
  },

  join: async (roomCode: string) => {
    await mockDelay();
    return { data: { id: 'joined', roomCode } };
  },

  cancel: async () => {
    await mockDelay();
    return { data: { success: true } };
  },

  getBotQuestions: async (params?: { scope?: string; scopeId?: string; count?: number }) => {
    await mockDelay();
    const n = Math.min(params?.count ?? 5, 5);
    const questions = Array.from({ length: n }, (_, i) => ({
      id: `mq-${i + 1}`,
      text: `Sample battle question ${i + 1}: Which has maximum ionization energy?`,
      options: ['Na', 'Mg', 'Al', 'Si'],
      correctIndex: 3,
    }));
    return { data: { questions } };
  },
};
