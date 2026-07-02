import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Colors, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { font, hs, ms, spacing, vs } from '../utils/responsive';

export type ExploreCategory = {
  id: string;
  label: string;
  sub: string;
  icon: string;
  color: string;
  bg: string;
  route: string;
  routeParams?: object;
};

const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    id: 'jee',
    label: 'JEE Batches',
    sub: 'Main + Advanced',
    icon: 'atom',
    color: Colors.physics,
    bg: '#EEF2FF',
    route: 'BatchListing',
  },
  {
    id: 'neet',
    label: 'NEET Batches',
    sub: 'UG prep',
    icon: 'dna',
    color: Colors.biology,
    bg: '#FDF2F8',
    route: 'BatchListing',
  },
  {
    id: 'test',
    label: 'Test Series',
    sub: 'Full & part tests',
    icon: 'clipboard-list',
    color: '#0EA5E9',
    bg: '#E0F2FE',
    route: 'TestSeries',
  },
  {
    id: 'pyq',
    label: 'PYQ Bank',
    sub: 'Past year papers',
    icon: 'history',
    color: '#D97706',
    bg: '#FFFBEB',
    route: 'PracticePYQ',
  },
  {
    id: 'live',
    label: 'Live Classes',
    sub: 'Join today',
    icon: 'video',
    color: '#DC2626',
    bg: '#FEF2F2',
    route: 'BatchListing',
    routeParams: { initialTab: 'live' },
  },
  {
    id: 'all',
    label: 'All Programs',
    sub: 'Browse catalog',
    icon: 'th-large',
    color: Colors.primary,
    bg: '#EFF6FF',
    route: 'Courses',
  },
];

type Props = {
  navigation: any;
  categories?: ExploreCategory[];
  title?: string;
};

const ExploreCategoriesGrid: React.FC<Props> = ({
  navigation,
  categories = EXPLORE_CATEGORIES,
  title = 'Explore by category',
}) => {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
          <Text style={[styles.seeAll, { color: c.primary }]}>View all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.grid}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.cell, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
            activeOpacity={0.88}
            onPress={() => navigation.navigate(cat.route, cat.routeParams)}
          >
            <View style={[styles.iconBox, { backgroundColor: cat.bg }]}>
              <Icon name={cat.icon} size={ms(20)} color={cat.color} solid />
            </View>
            <Text style={[styles.label, { color: c.text }]} numberOfLines={1}>
              {cat.label}
            </Text>
            <Text style={[styles.sub, { color: c.textMuted }]} numberOfLines={1}>
              {cat.sub}
            </Text>
            <Icon name="chevron-right" size={ms(10)} color={c.textMuted} solid style={styles.chev} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: vs(20) },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: vs(12),
  },
  title: { fontSize: font.subhead, fontWeight: '800' },
  seeAll: { fontSize: font.caption, fontWeight: '700' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: hs(10),
  },
  cell: {
    width: '48%',
    borderRadius: ms(16),
    borderWidth: 1,
    padding: spacing.md,
    minHeight: vs(108),
    position: 'relative',
  },
  iconBox: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(10),
  },
  label: { fontSize: font.body, fontWeight: '800', marginBottom: vs(2) },
  sub: { fontSize: font.micro, fontWeight: '600' },
  chev: { position: 'absolute', right: hs(12), top: hs(12) },
});

export default ExploreCategoriesGrid;
