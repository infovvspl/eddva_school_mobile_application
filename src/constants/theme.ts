import { Platform, ViewStyle } from 'react-native';
import { Brand } from './brand';
import { hs, ms, vs } from '../utils/responsive';

/**
 * EDDVA theme — blue brand gradient, clean white surfaces, orange accent CTAs
 */
export const Colors = {
  primary: Brand.blue700,
  primaryLight: Brand.blue400,
  primaryDark: Brand.blue900,
  secondary: '#0284C7',
  accent: '#F97316',
  accentSoft: '#FFF7ED',

  background: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  white: '#FFFFFF',
  black: '#000000',

  text: '#0F172A',
  textMain: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: Brand.blue400,

  physics: '#6366F1',
  chemistry: '#10B981',
  maths: '#F59E0B',
  biology: '#EC4899',

  accentGreen: '#9AD3BC',
  accentPink: '#FF9999',
  accentYellow: '#FFD700',
  accentPurple: '#CBC3E3',
  accentBlue: '#ABC4FF',
  slate700: '#334155',
  slate600: '#475569',
  yellowGold: '#F59E0B',
  emerald: '#10B981',
};

/** Scaled from 375×812 baseline — use with StyleSheet across screens */
export const Spacing = {
  xs: ms(4),
  sm: ms(8),
  md: ms(12),
  base: hs(16),
  lg: hs(20),
  xl: hs(24),
  xxl: hs(32),
  xxxl: vs(40),
};

export const BorderRadius = {
  sm: ms(8),
  md: ms(12),
  lg: ms(16),
  xl: ms(20),
  xxl: ms(24),
  xxxl: ms(32),
  full: 9999,
};

/** factor 0 = same visual size on all phones (matches global body scale) */
const tx = (n: number) => ms(n, 0);

export const FontSize = {
  xs: tx(10),
  sm: tx(12),
  base: tx(12),
  md: tx(14),
  lg: tx(17),
  xl: tx(20),
  xxl: ms(24, 0.35),
  xxxl: ms(28, 0.35),
  heading: ms(32, 0.35),
  hero: ms(40, 0.35),
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const Shadow: Record<'soft' | 'glow' | 'nav' | 'card', ViewStyle> = {
  soft: Platform.select<ViewStyle>({
    ios: {
      shadowColor: Brand.blue700,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
    },
    default: { elevation: 2 },
  })!,
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    default: { elevation: 4 },
  })!,
  glow: Platform.select<ViewStyle>({
    ios: {
      shadowColor: Brand.blue700,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    default: { elevation: 8 },
  })!,
  nav: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
    },
    default: { elevation: 10 },
  })!,
};

/** EDDVA blue gradient presets (left → right) */
export const Gradients = {
  primary: [...Brand.gradient],
  banner: [...Brand.gradient],
  streak: [Brand.blue400, Brand.blue700],
  orange: ['#FB923C', '#F97316'],
};
