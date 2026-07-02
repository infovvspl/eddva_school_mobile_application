import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from '../Icon';
import { BorderRadius, Shadow } from '../../constants/theme';
import { ThemeColors } from '../../constants/themes';
import { hs, ms, spacing, type as t, vs } from '../../utils/responsive';

type Area = {
  id: string;
  title: string;
  description: string;
  count: number;
  countLabel: string;
  icon: string;
  color: string;
};

type Props = {
  colors: ThemeColors;
  areas: Area[];
  loading: boolean;
  onAreaPress: (area: Area) => void;
};

const StudyPlanWeakTab: React.FC<Props> = ({ colors: c, areas, loading, onAreaPress }) => {
  if (loading) {
    return <ActivityIndicator color={c.primary} style={{ marginVertical: vs(40) }} />;
  }

  return (
    <View>
      <Text style={[styles.title, { color: c.text }]}>Weak Areas Analysis</Text>
      <Text style={[styles.sub, { color: c.textMuted }]}>
        Select a category to analyse and improve your weak areas.
      </Text>
      {areas.map(area => (
        <TouchableOpacity
          key={area.id}
          style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
          onPress={() => onAreaPress(area)}
          activeOpacity={0.85}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${area.color}18` }]}>
            <Icon name={area.icon} size={ms(22)} color={area.color} solid />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: c.text }]}>{area.title}</Text>
            <Text style={[styles.cardDesc, { color: c.textMuted }]}>{area.description}</Text>
          </View>
          <View style={[styles.pill, { backgroundColor: `${area.color}18` }]}>
            <Text style={[styles.pillText, { color: area.color }]}>
              {area.count} {area.countLabel}
            </Text>
          </View>
          <Icon name="chevron-right" size={ms(14)} color={c.textMuted} solid />
        </TouchableOpacity>
      ))}
      <View style={[styles.legend, { backgroundColor: c.chipBg, borderColor: c.border }]}>
        <Text style={[styles.legendTitle, { color: c.text }]}>Weakness Engine</Text>
        <Text style={[styles.legendLine, { color: c.textMuted }]}>
          Weak Chapters: chapter accuracy &lt; 50%
        </Text>
        <Text style={[styles.legendLine, { color: c.textMuted }]}>
          Forgotten: completed 14+ days ago without revision
        </Text>
      </View>
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
  },
  cardTitle: { ...t.bodyBold, marginBottom: vs(4) },
  cardDesc: { ...t.caption, lineHeight: ms(20) },
  pill: {
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: ms(12),
  },
  pillText: { ...t.tinyBold },
  legend: {
    marginTop: vs(8),
    padding: spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: vs(6),
  },
  legendTitle: { ...t.bodyBold, marginBottom: vs(4) },
  legendLine: { ...t.captionBold, lineHeight: ms(22) },
});

export default StudyPlanWeakTab;
