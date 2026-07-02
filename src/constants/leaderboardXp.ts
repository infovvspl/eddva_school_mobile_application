/** Leaderboard / XP flow colors aligned with EDDVA light theme */

export const LB_UNLOCK_GEMS = 10;

export const LB_COLORS = {
  bg: '#F8FAFF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  accent: '#0066CC',
  accentDark: '#004499',
  peach: '#E0F2FE',
  border: '#DCE7F5',
  borderSoft: '#EAF2FB',
  purple: '#7C3AED',
  purpleBar: '#5B21B6',
  orange: '#F97316',
  green: '#22C55E',
  yellow: '#EAB308',
  red: '#EF4444',
  blue: '#3B82F6',
};

export const LEADERBOARD_LEVELS = [
  { level: 1, color: '#F97316' },
  { level: 2, color: '#A855F7' },
  { level: 3, color: '#F59E0B' },
  { level: 4, color: '#14B8A6' },
  { level: 5, color: '#EC4899' },
  { level: 6, color: '#8B5CF6' },
  { level: 7, color: '#3B82F6' },
  { level: 8, color: '#84CC16' },
  { level: 9, color: '#06B6D4' },
  { level: 10, color: '#EF4444' },
];

export type InfoPageKind =
  | 'levelup-intro'
  | 'what-xp'
  | 'what-leaderboard'
  | 'xp-lectures'
  | 'xp-dpp'
  | 'xp-tests'
  | 'zones';

export type LeaderboardInfoPage = {
  id: string;
  kind: InfoPageKind;
  /** Short label for footer / screen reader */
  stepLabel: string;
};

export const LEADERBOARD_INFO_PAGES: LeaderboardInfoPage[] = [
  { id: 'intro', kind: 'levelup-intro', stepLabel: 'Level UP' },
  { id: 'what-xp', kind: 'what-xp', stepLabel: 'What is XP' },
  { id: 'what-lb', kind: 'what-leaderboard', stepLabel: 'Leaderboard' },
  { id: 'xp-lectures', kind: 'xp-lectures', stepLabel: 'XP in lectures' },
  { id: 'xp-dpp', kind: 'xp-dpp', stepLabel: 'XP in DPP' },
  { id: 'xp-tests', kind: 'xp-tests', stepLabel: 'XP in tests' },
  { id: 'zones', kind: 'zones', stepLabel: 'Zones' },
];
