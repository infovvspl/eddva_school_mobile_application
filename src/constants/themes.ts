export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  primary: string;
  primaryLight: string;
  accent: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  success: string;
  danger: string;
  searchBg: string;
  menuBg: string;
  chipBg: string;
  chipActiveBg: string;
  chipActiveBorder: string;
  goalBannerBg: string;
  goalBannerBorder: string;
  overlay: string;
};

export type AppTheme = {
  mode: ThemeMode;
  colors: ThemeColors;
};

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    primary: '#0066cc',
    primaryLight: '#00a6ff',
    accent: '#F97316',
    background: '#FFFFFF',
    backgroundAlt: '#FFFFFF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    success: '#16A34A',
    danger: '#EF4444',
    searchBg: '#FFFFFF',
    menuBg: '#FFFFFF',
    chipBg: '#FFFFFF',
    chipActiveBg: '#EFF6FF',
    chipActiveBorder: '#0066cc',
    goalBannerBg: '#FFFFFF',
    goalBannerBorder: '#E2E8F0',
    overlay: 'rgba(15,23,42,0.45)',
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    primary: '#00a6ff',
    primaryLight: '#38bdf8',
    accent: '#FB923C',
    background: '#0A1628',
    backgroundAlt: '#0F2744',
    surface: '#132238',
    card: '#1A2D4A',
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    border: '#1E4976',
    borderLight: '#1E3A5F',
    success: '#4ADE80',
    danger: '#F87171',
    searchBg: '#132238',
    menuBg: '#1A2D4A',
    chipBg: '#132238',
    chipActiveBg: '#1E4976',
    chipActiveBorder: '#00a6ff',
    goalBannerBg: '#1A2D4A',
    goalBannerBorder: '#004499',
    overlay: 'rgba(0,0,0,0.65)',
  },
};

export const THEME_STORAGE_KEY = 'eddva_theme_mode';
