import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { ThemeColors } from '../../constants/themes';
import { BorderRadius, Shadow } from '../../constants/theme';
import { hs, ms, spacing, type as t, vs } from '../../utils/responsive';

type Props = {
  data: {
    syllabus: number;
    streak: number;
    testReady: number;
    xp: number;
    revHealth: number;
    weakTopics: number;
    insights: string[];
  };
  colors: ThemeColors;
};

const AISarthiCard: React.FC<Props> = ({ data, colors: c }) => (
  <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
    <View style={styles.head}>
      <Icon name="robot" size={ms(16)} color={c.primary} solid />
      <Text style={[styles.headTitle, { color: c.text }]}>AI Sarthi</Text>
      <Text style={[styles.personalized, { color: c.textMuted }]}>Personalised</Text>
    </View>
    <View style={styles.grid}>
      {[
        { label: 'Syllabus', value: `${data.syllabus}%`, icon: 'book' },
        { label: 'Streak', value: `${data.streak} day`, icon: 'fire' },
        { label: 'Test Ready', value: `${data.testReady}%`, icon: 'clipboard-check' },
        { label: 'XP', value: String(data.xp), icon: 'star' },
        { label: 'Rev. Health', value: `${data.revHealth}%`, icon: 'heart' },
        { label: 'Weak Topics', value: String(data.weakTopics), icon: 'exclamation-triangle' },
      ].map(s => (
        <View key={s.label} style={[styles.stat, { backgroundColor: c.chipBg }]}>
          <Icon name={s.icon} size={ms(12)} color={c.primary} solid />
          <Text style={[styles.statVal, { color: c.text }]}>{s.value}</Text>
          <Text style={[styles.statLbl, { color: c.textMuted }]}>{s.label}</Text>
        </View>
      ))}
    </View>
    <Text style={[styles.insightTitle, { color: c.text }]}>INSIGHTS</Text>
    {data.insights.map((line, i) => (
      <Text key={i} style={[styles.insight, { color: c.textSecondary }]}>
        • {line}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(14),
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: hs(8), marginBottom: vs(12) },
  headTitle: { ...t.subheadBold, flex: 1 },
  personalized: { ...t.tinyBold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(8), marginBottom: vs(12) },
  stat: {
    width: '31%',
    padding: ms(10),
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: vs(4),
  },
  statVal: { ...t.captionBold },
  statLbl: { ...t.microBold, textAlign: 'center' },
  insightTitle: { ...t.tinyBold, marginBottom: vs(6) },
  insight: { ...t.captionBold, lineHeight: ms(22), marginBottom: vs(4) },
});

export default AISarthiCard;
