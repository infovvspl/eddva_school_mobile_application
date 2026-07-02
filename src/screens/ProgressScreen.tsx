import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import IconBadge from '../components/IconBadge';
import PWScreenHeader from '../components/PWScreenHeader';
import { Brand } from '../constants/brand';
import { BorderRadius, Colors, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { analyticsService } from '../services/analytics.service';
import { studentService } from '../services/student.service';
import {
  mapStudentInsights,
  mapStudentPerformance,
  mapWeakTopicsList,
} from '../utils/analyticsMappers';
import { getWeeklyActivity } from '../utils/apiData';
import { font, layout, ms, pagePadding, spacing, vs } from '../utils/responsive';

type Props = { navigation: any };

const BAR_COLORS = [Brand.blue900, Brand.blue700, Brand.blue400, '#F97316', '#16A34A', '#0284C7'];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const STAT_META = [
  { label: 'Accuracy', key: 'accuracy' as const, suffix: '%', icon: 'bullseye', color: Brand.blue700 },
  { label: 'Questions', key: 'totalAttempts' as const, icon: 'clipboard-check', color: '#F97316' },
  { label: 'Topics Done', key: 'topicsCompleted' as const, icon: 'check-circle', color: '#16A34A' },
  { label: 'Study Time', key: 'totalStudyHours' as const, suffix: 'h', icon: 'clock', color: Brand.blue900 },
];

const ProgressScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;

  const perf = useApi(() => analyticsService.getStudentPerformance(), []);
  const insights = useApi(() => analyticsService.getStudentInsights(), []);
  const weakTopics = useApi(() => studentService.getWeakTopics(), []);
  const weekly = useApi(() => studentService.getWeeklyActivity(), []);

  const perfData = mapStudentPerformance(perf.data);
  const insightData = mapStudentInsights(insights.data);
  const weakList = mapWeakTopicsList(weakTopics.data);
  const weeklyData = getWeeklyActivity(weekly.data);

  const loading = perf.loading && insights.loading;
  const onRefresh = () => {
    perf.refetch();
    insights.refetch();
    weakTopics.refetch();
    weekly.refetch();
  };

  const maxLectures =
    weeklyData.length > 0
      ? Math.max(...weeklyData.map((d: { lecturesWatched?: number; minutes?: number }) => d.lecturesWatched || d.minutes || 0), 1)
      : 1;

  const showError = perf.error && !perfData.hasData;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <PWScreenHeader
        title="My Progress"
        subtitle="Live stats from your account"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={c.primary} />
        }
      >
        {loading && !perfData.hasData ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: 48 }} />
        ) : null}

        {showError ? (
          <View style={[styles.emptyState, { backgroundColor: c.card, borderColor: c.border }]}>
            <IconBadge name="exclamation-circle" color={c.danger} size="lg" variant="soft" />
            <Text style={[styles.emptyTitle, { color: c.text }]}>Could not load performance</Text>
            <Text style={[styles.emptySubtitle, { color: c.textMuted }]}>{perf.error}</Text>
          </View>
        ) : null}

        {perfData.hasData ? (
          <View style={styles.statsGrid}>
            {STAT_META.map(stat => {
              const raw = perfData[stat.key];
              const value = `${raw}${stat.suffix || ''}`;
              return (
                <View
                  key={stat.label}
                  style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}
                >
                  <IconBadge name={stat.icon} color={stat.color} size="md" variant="soft" />
                  <Text style={[styles.statValue, { color: c.text }]}>{value}</Text>
                  <Text style={[styles.statLabel, { color: c.textMuted }]}>{stat.label}</Text>
                </View>
              );
            })}
          </View>
        ) : !loading && !showError ? (
          <View style={[styles.emptyState, { backgroundColor: c.card, borderColor: c.border }]}>
            <IconBadge name="chart-bar" color={c.primary} size="lg" variant="soft" />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No performance data yet</Text>
            <Text style={[styles.emptySubtitle, { color: c.textMuted }]}>
              Complete mock tests and lectures — your stats will appear here from the server.
            </Text>
          </View>
        ) : null}

        {weeklyData.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>7-Day Activity</Text>
            <View style={[styles.barChart, { backgroundColor: c.card, borderColor: c.border }]}>
              {weeklyData.map((d: { lecturesWatched?: number; minutes?: number }, i: number) => {
                const val = d.lecturesWatched || d.minutes || 0;
                const h = Math.max((val / maxLectures) * 80, 4);
                return (
                  <View key={i} style={styles.barWrap}>
                    <Text style={[styles.barVal, { color: c.textMuted }]}>{val || ''}</Text>
                    <View
                      style={[
                        styles.bar,
                        { height: h, backgroundColor: BAR_COLORS[i % BAR_COLORS.length] },
                      ]}
                    />
                    <Text style={[styles.barDay, { color: c.textMuted }]}>{DAYS[i]}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {perfData.subjectPerformance.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Subject Performance</Text>
            {perfData.subjectPerformance.map((sub, i) => (
              <View key={sub.subjectId} style={styles.subjectRow}>
                <View
                  style={[styles.subjectDot, { backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }]}
                />
                <View style={{ flex: 1 }}>
                  <View style={styles.subjectHeader}>
                    <Text style={[styles.subjectName, { color: c.text }]}>{sub.subjectName}</Text>
                    <Text style={[styles.subjectPct, { color: c.text }]}>{sub.accuracy}%</Text>
                  </View>
                  <View style={[styles.subjectTrack, { backgroundColor: c.borderLight }]}>
                    <View
                      style={[
                        styles.subjectFill,
                        {
                          width: `${Math.min(100, sub.accuracy)}%`,
                          backgroundColor: BAR_COLORS[i % BAR_COLORS.length],
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {weakList.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Focus Areas</Text>
            {weakList.map(t => (
              <View
                key={t.topicId}
                style={[styles.weakCard, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <IconBadge
                  name="exclamation-triangle"
                  color={t.severity === 'high' ? c.danger : '#F97316'}
                  size="sm"
                  variant="soft"
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.weakTopic, { color: c.text }]}>{t.topicName}</Text>
                  {t.chapterName ? (
                    <Text style={[styles.weakChapter, { color: c.textMuted }]}>{t.chapterName}</Text>
                  ) : null}
                </View>
                <Text style={[styles.accuracyLbl, { color: c.textMuted }]}>{t.accuracy}%</Text>
              </View>
            ))}
          </View>
        ) : null}

        {insightData.insights.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Insights</Text>
            {insightData.insights.map((line, i) => (
              <View
                key={`${i}-${line.slice(0, 16)}`}
                style={[styles.insightCard, { backgroundColor: '#EFF6FF', borderLeftColor: Brand.blue700 }]}
              >
                <Icon name="lightbulb" size={ms(14)} color={Brand.blue700} solid />
                <Text style={[styles.insightText, { color: c.textSecondary }]}>{line}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: vs(10),
    padding: pagePadding,
  },
  statCard: {
    width: '47%',
    borderRadius: BorderRadius.xl,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    ...Shadow.soft,
  },
  statValue: { fontSize: font.headline, fontWeight: '800' },
  statLabel: { fontSize: font.caption, fontWeight: '600' },
  section: { paddingHorizontal: pagePadding, marginBottom: vs(20) },
  sectionTitle: { fontSize: font.title, fontWeight: '800', marginBottom: spacing.md },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.xl,
    padding: spacing.md,
    height: vs(130),
    borderWidth: 1,
    ...Shadow.soft,
  },
  barWrap: { flex: 1, alignItems: 'center', gap: spacing.xs },
  barVal: { fontSize: font.micro, fontWeight: '700' },
  bar: { width: '70%', borderRadius: ms(4) },
  barDay: { fontSize: font.tiny, fontWeight: '700' },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vs(10),
    marginBottom: spacing.md,
  },
  subjectDot: { width: layout.dot, height: layout.dot, borderRadius: ms(5) },
  subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  subjectName: { fontSize: font.caption, fontWeight: '600' },
  subjectPct: { fontSize: font.caption, fontWeight: '700' },
  subjectTrack: { height: vs(6), borderRadius: ms(3) },
  subjectFill: { height: vs(6), borderRadius: ms(3) },
  weakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vs(10),
    padding: spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    ...Shadow.soft,
  },
  weakTopic: { fontSize: font.caption, fontWeight: '600' },
  weakChapter: { fontSize: font.tiny, marginTop: vs(2) },
  accuracyLbl: { fontSize: font.caption, fontWeight: '700' },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: vs(10),
    padding: spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
  },
  insightText: { flex: 1, fontSize: font.caption, lineHeight: ms(18) },
  emptyState: {
    alignItems: 'center',
    margin: pagePadding,
    paddingVertical: vs(32),
    paddingHorizontal: spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: vs(10),
  },
  emptyTitle: { fontSize: font.title, fontWeight: '800' },
  emptySubtitle: { fontSize: font.caption, textAlign: 'center', lineHeight: ms(22) },
});

export default ProgressScreen;
