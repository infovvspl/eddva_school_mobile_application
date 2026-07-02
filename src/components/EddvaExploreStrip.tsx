import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';
import { Brand } from '../constants/brand';
import { Shadow } from '../constants/theme';
import { font, hs, ms, spacing, vs } from '../utils/responsive';

type QuickItem = {
  id: string;
  icon: string;
  label: string;
  sub: string;
  color: string;
  screen: string;
  tab?: string;
};

const QUICK_ITEMS: QuickItem[] = [
  { id: 'doubts', icon: 'robot', label: 'AI Guru', sub: 'Instant help', color: Brand.blue700, screen: 'Main', tab: 'Help' },
  { id: 'tests', icon: 'clipboard-check', label: 'Mock Tests', sub: 'Timed practice', color: '#0284C7', screen: 'TestSeries' },
  { id: 'material', icon: 'file-alt', label: 'Study Material', sub: 'Notes & more', color: '#059669', screen: 'StudyPlan' },
  { id: 'solver', icon: 'bolt', label: 'Doubt Solver', sub: 'Get answers', color: '#F59E0B', screen: 'Main', tab: 'Help' },
];

type Props = {
  navigation: any;
  courseCount: number;
};

const EddvaExploreStrip: React.FC<Props> = ({ navigation, courseCount }) => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const c = theme.colors;
  const quickTileWidth = Math.max(hs(82), Math.min(hs(112), (width - hs(32) - hs(24)) / 4));

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[...Brand.gradient]}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.heroContent}>
          <View style={styles.heroTagRow}>
            <View style={styles.heroDot} />
            <Text style={styles.heroTag}>EDDVA LEARNING HUB</Text>
          </View>
          <Text style={styles.heroTitle}>Explore batches{'\n'}built for you</Text>
          <Text style={styles.heroSub}>
            {courseCount} programs · AI support included
          </Text>
        </View>

        <View style={styles.heroArt}>
          <View style={styles.bookStack}>
            <View style={[styles.book, styles.book3]} />
            <View style={[styles.book, styles.book2]} />
            <View style={[styles.book, styles.book1]} />
            <View style={styles.capWrap}>
              <Icon name="graduation-cap" size={ms(18)} color={Brand.blue900} solid />
            </View>
          </View>
          <View style={styles.yellowBadge}>
            <Icon name="graduation-cap" size={ms(20)} color="#CA8A04" solid />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        {...(Platform.OS === 'ios' ? { directionalLockEnabled: true } : {})}
        contentContainerStyle={styles.quickGrid}
      >
        {QUICK_ITEMS.map(item => (
          <QuickTile
            key={item.id}
            item={item}
            width={quickTileWidth}
            cardBg={c.card}
            borderColor={c.border}
            textColor={c.text}
            mutedColor={c.textMuted}
            onPress={() => {
              if (item.tab) navigation.navigate(item.tab);
              else {
                const stack = navigation.getParent?.() ?? navigation;
                stack.navigate(item.screen);
              }
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

/** Mock-style service card: square icon tile, title, subtitle, round chevron */
const QuickTile: React.FC<{
  item: QuickItem;
  width: number;
  cardBg: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  onPress: () => void;
}> = ({ item, width, cardBg, borderColor, textColor, mutedColor, onPress }) => (
  <TouchableOpacity
    style={[tileStyles.tile, { width, backgroundColor: cardBg, borderColor }, Shadow.soft]}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <View style={[tileStyles.iconSquare, { backgroundColor: `${item.color}18` }]}>
      <Icon name={item.icon} size={ms(22)} color={item.color} solid />
    </View>
    <Text style={[tileStyles.label, { color: textColor }]} numberOfLines={1}>
      {item.label}
    </Text>
    <Text style={[tileStyles.sub, { color: mutedColor }]} numberOfLines={1}>
      {item.sub}
    </Text>
    <View style={[tileStyles.chevBtn, { backgroundColor: item.color }]}>
      <Icon name="chevron-right" size={ms(10)} color="#fff" solid />
    </View>
  </TouchableOpacity>
);

const tileStyles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    paddingVertical: vs(14),
    paddingHorizontal: hs(6),
    borderRadius: ms(16),
    borderWidth: 1,
    minHeight: vs(130),
    marginRight: hs(8),
  },
  iconSquare: {
    width: hs(48),
    height: hs(48),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: font.caption, fontWeight: '800', marginTop: vs(10), textAlign: 'center' },
  sub: { fontSize: font.micro, fontWeight: '600', marginTop: vs(3), textAlign: 'center' },
  chevBtn: {
    width: hs(28),
    height: hs(28),
    borderRadius: hs(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(10),
  },
});

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm + 6 },
  hero: {
    marginHorizontal: spacing.md,
    borderRadius: ms(20),
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm + 6,
    overflow: 'hidden',
    minHeight: vs(130),
  },
  heroContent: { flex: 1, paddingRight: hs(8), minWidth: 0 },
  heroTagRow: { flexDirection: 'row', alignItems: 'center', gap: hs(6), marginBottom: vs(8) },
  heroDot: { width: ms(7), height: ms(7), borderRadius: ms(4), backgroundColor: '#34D399' },
  heroTag: {
    fontSize: font.micro,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: font.title,
    fontWeight: '900',
    color: '#fff',
    lineHeight: ms(24),
  },
  heroSub: {
    fontSize: font.caption,
    color: 'rgba(255,255,255,0.9)',
    marginTop: vs(8),
    fontWeight: '600',
  },
  heroArt: { alignItems: 'center', justifyContent: 'center', width: hs(88), flexShrink: 0 },
  bookStack: { position: 'relative', width: hs(56), height: vs(52), marginBottom: vs(4) },
  book: {
    position: 'absolute',
    borderRadius: ms(4),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  book1: {
    width: hs(40),
    height: vs(28),
    backgroundColor: '#7DD3FC',
    bottom: 0,
    left: hs(8),
  },
  book2: {
    width: hs(36),
    height: vs(24),
    backgroundColor: '#C4B5FD',
    bottom: vs(8),
    left: hs(4),
  },
  book3: {
    width: hs(32),
    height: vs(20),
    backgroundColor: '#BAE6FD',
    bottom: vs(16),
    left: hs(12),
  },
  capWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: hs(28),
    height: hs(28),
    borderRadius: hs(14),
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yellowBadge: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(12),
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGrid: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.md + hs(8),
  },
});

export default EddvaExploreStrip;
