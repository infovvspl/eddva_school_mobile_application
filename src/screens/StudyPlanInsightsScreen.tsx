import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from '../components/Icon';
import AISarthiCard from '../components/studyplan/AISarthiCard';
import { Brand } from '../constants/brand';
import { BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { studyPlanService } from '../services/studyplan.service';
import type { RootStackParamList } from '../types/navigation';
import { hs, ms, spacing, type as t, vs } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'StudyPlanInsights'>;

const StudyPlanInsightsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;

  const { data, loading } = useApi(() => studyPlanService.getAISarthi(courseId), [courseId]);
  const sarthi = (data as {
    syllabus: number;
    streak: number;
    testReady: number;
    xp: number;
    revHealth: number;
    weakTopics: number;
    insights: string[];
  }) || {
    syllabus: 0,
    streak: 0,
    testReady: 0,
    xp: 0,
    revHealth: 0,
    weakTopics: 0,
    insights: [],
  };

  const hasInsights = sarthi.insights.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={ms(18)} color={c.text} solid />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>AI Insights</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: vs(40) }} />
        ) : (
          <>
            <Text style={[styles.lead, { color: c.textMuted }]}>
              Live stats from your dashboard and analytics — no demo placeholders.
            </Text>
            <AISarthiCard data={sarthi} colors={c} />
            <Text style={[styles.blockTitle, { color: c.text }]}>Recommendations</Text>
            {hasInsights ? (
              sarthi.insights.map((line, i) => (
                <View
                  key={`${i}-${line.slice(0, 12)}`}
                  style={[styles.reminderCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                >
                  <Icon name="lightbulb" size={ms(14)} color={Brand.blue700} solid />
                  <Text style={[styles.reminderLine, { color: c.textSecondary }]}>{line}</Text>
                </View>
              ))
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <Icon name="chart-line" size={ms(28)} color={c.textMuted} solid />
                <Text style={[styles.emptyTitle, { color: c.text }]}>
                  No insights yet
                </Text>
                <Text style={[styles.emptySub, { color: c.textMuted }]}>
                  Generate your study plan and complete a few tasks — tips will appear here from
                  the server.
                </Text>
              </View>
            )}
            {sarthi.streak > 0 && sarthi.streak < 3 ? (
              <View style={[styles.reminderCard, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
                <Text style={[styles.reminderTitle, { color: '#9A3412' }]}>Keep your streak</Text>
                <Text style={[styles.reminderLine, { color: '#C2410C' }]}>
                  You are on a {sarthi.streak}-day streak. Study today to keep it going.
                </Text>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    gap: hs(12),
  },
  backBtn: { padding: ms(4) },
  headerTitle: { ...t.subheadBold, flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: vs(48) },
  lead: { ...t.body, marginBottom: vs(16), lineHeight: ms(24) },
  blockTitle: { ...t.bodyBold, marginBottom: vs(10), marginTop: vs(4) },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: hs(10),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(12),
  },
  reminderTitle: { ...t.captionBold, marginBottom: vs(4) },
  reminderLine: { ...t.caption, flex: 1, lineHeight: ms(22) },
  emptyCard: {
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: vs(12),
  },
  emptyTitle: { ...t.bodyBold, marginTop: vs(12) },
  emptySub: { ...t.caption, textAlign: 'center', marginTop: vs(8), lineHeight: ms(22) },
});

export default StudyPlanInsightsScreen;
