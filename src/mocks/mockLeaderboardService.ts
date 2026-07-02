import { mockDelay } from './delay';
import { hasAnyEnrollment } from './mockStore';
import { LB_UNLOCK_GEMS } from '../constants/leaderboardXp';

export type LeaderboardEntry = {
  id: string;
  rank: number;
  name: string;
  xp: number;
  zone: 'promotion' | 'safe' | 'danger';
  isMe?: boolean;
  avatarInitial: string;
};

const GROUP_ENTRIES: LeaderboardEntry[] = [
  { id: '1', rank: 1, name: 'Akankshya', xp: 2074, zone: 'promotion', avatarInitial: 'A' },
  { id: '2', rank: 2, name: 'Bhagyasree sendh', xp: 1602, zone: 'promotion', isMe: true, avatarInitial: 'B' },
  { id: '3', rank: 3, name: 'Ayush', xp: 208, zone: 'safe', avatarInitial: 'A' },
  { id: '4', rank: 4, name: 'Priya Sharma', xp: 185, zone: 'safe', avatarInitial: 'P' },
  { id: '5', rank: 5, name: 'Rohan K.', xp: 142, zone: 'safe', avatarInitial: 'R' },
  { id: '6', rank: 6, name: 'Sneha M.', xp: 98, zone: 'danger', avatarInitial: 'S' },
];

const MOCK_TEST_ENTRIES: LeaderboardEntry[] = [
  { id: 'm1', rank: 1, name: 'Akankshya', xp: 94, zone: 'promotion', avatarInitial: 'A' },
  { id: 'm2', rank: 2, name: 'Bhagyasree sendh', xp: 88, zone: 'promotion', isMe: true, avatarInitial: 'B' },
  { id: 'm3', rank: 3, name: 'Ayush', xp: 81, zone: 'safe', avatarInitial: 'A' },
  { id: 'm4', rank: 4, name: 'Priya Sharma', xp: 76, zone: 'safe', avatarInitial: 'P' },
];

export const mockLeaderboardService = {
  getMe: async () => {
    await mockDelay();
    if (!hasAnyEnrollment()) {
      return {
        data: {
          rank: null,
          xp: 0,
          cycleXp: 0,
          level: 1,
          streak: 0,
          gems: 0,
          unlockGems: LB_UNLOCK_GEMS,
          leaderboardUnlocked: false,
        },
      };
    }
    const gems = 7;
    return {
      data: {
        rank: 2,
        xp: 1602,
        cycleXp: 1602,
        totalXp: 1602,
        level: 2,
        levelProgress: 100,
        levelXp: 1602,
        levelTarget: 1200,
        streak: 1,
        promotionXpAway: 244,
        season: 4,
        cycleDays: 14,
        daysLeft: 9,
        examType: 'JEE',
        gems,
        unlockGems: LB_UNLOCK_GEMS,
        leaderboardUnlocked: gems >= LB_UNLOCK_GEMS,
      },
    };
  },

  getGroup: async () => {
    await mockDelay();
    return {
      data: {
        season: 4,
        cycleLabel: '14-DAY CYCLE',
        daysLeft: 9,
        entries: hasAnyEnrollment() ? GROUP_ENTRIES : [],
      },
    };
  },

  getMockRank: async (_examType: string) => {
    await mockDelay();
    return {
      data: {
        entries: hasAnyEnrollment() ? MOCK_TEST_ENTRIES : [],
      },
    };
  },

  getAnalytics: async () => {
    await mockDelay();
    return {
      data: {
        entries: hasAnyEnrollment() ? MOCK_TEST_ENTRIES : [],
        leaderboard: hasAnyEnrollment() ? MOCK_TEST_ENTRIES : [],
      },
    };
  },
};
