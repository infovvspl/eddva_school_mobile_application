import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from '../Icon';
import { BorderRadius, Shadow } from '../../constants/theme';
import { ThemeColors } from '../../constants/themes';
import type { BacklogCategory } from '../../types/studyPlan';
import { hs, ms, spacing, type as t, vs } from '../../utils/responsive';

type Props = {
  colors: ThemeColors;
  categories: BacklogCategory[];
  loading: boolean;
  onCategoryPress: (cat: BacklogCategory) => void;
};

const StudyPlanBacklogsTab: React.FC<Props> = ({ colors: c, categories, loading, onCategoryPress }) => {
  if (loading) {
    return <ActivityIndicator color={c.primary} style={{ marginVertical: vs(40) }} />;
  }

  return (
    <View>
      <Text style={[styles.title, { color: c.text }]}>All Pending Work</Text>
      <Text style={[styles.sub, { color: c.textMuted }]}>
        Tap a category to open its list on a separate screen.
      </Text>
      {categories.map(cat => (
        <TouchableOpacity
          key={cat.id}
          style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
          onPress={() => onCategoryPress(cat)}
          activeOpacity={0.85}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${cat.color}18` }]}>
            <Icon name={cat.icon} size={ms(22)} color={cat.color} solid />
          </View>
          <View style={styles.cardBody}>
            <Text style={[styles.cardTitle, { color: c.text }]}>{cat.title}</Text>
            <Text style={[styles.cardDesc, { color: c.textMuted }]} numberOfLines={2}>
              {cat.description}
            </Text>
            <View
              style={[
                styles.pill,
                {
                  backgroundColor: cat.status === 'clear' ? `${c.success}18` : `${cat.color}18`,
                },
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: cat.status === 'clear' ? c.success : cat.color },
                ]}
              >
                {cat.status === 'clear' ? 'All clear' : `${cat.pending} items pending`}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={ms(14)} color={c.textMuted} solid />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  title: { ...t.subheadBold, marginBottom: vs(6) },
  sub: { ...t.body, lineHeight: ms(24), marginBottom: vs(16) },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(12),
  },
  iconWrap: {
    width: hs(48),
    height: hs(48),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTitle: { ...t.bodyBold, marginBottom: vs(4) },
  cardDesc: { ...t.caption, lineHeight: ms(20), marginBottom: vs(8) },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: hs(10),
    paddingVertical: vs(5),
    borderRadius: ms(12),
  },
  pillText: { ...t.tinyBold },
});

export default StudyPlanBacklogsTab;
