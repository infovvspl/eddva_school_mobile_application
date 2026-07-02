import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import IconBadge from '../components/IconBadge';
import PWScreenHeader from '../components/PWScreenHeader';
import { BorderRadius, Shadow, Gradients } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { assessmentService } from '../services/assessment.service';
import { mapMockTests } from '../utils/assessmentMappers';
import { font, hs, ms, pagePadding, spacing, vs } from '../utils/responsive';

type Props = { navigation: any };
type Filter = 'all' | 'free' | 'full';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All Tests' },
  { id: 'free', label: 'Free' },
  { id: 'full', label: 'Full Syllabus' },
];

const TestSeriesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const [filter, setFilter] = useState<Filter>('all');
  const [starting, setStarting] = useState<string | null>(null);

  const { data, loading, error, refetch } = useApi(() => assessmentService.getMockTests(), []);
  const tests = React.useMemo(() => mapMockTests(data), [data]);

  const filtered = tests.filter(t => {
    if (filter === 'free') return !t.isPaid && t.price === 0;
    if (filter === 'full') {
      return t.isFullSyllabus || t.type.toLowerCase() === 'full' || t.name.toLowerCase().includes('full');
    }
    return true;
  });

  const handleStart = async (test: typeof tests[0]) => {
    const id = test.id;
    setStarting(id);
    try {
      const { data: session } = await assessmentService.startSession({
        mockTestId: id,
        type: 'mock',
      });
      const sessionId = String(
        (session as Record<string, unknown>)?.sessionId ??
          (session as Record<string, unknown>)?.id ??
          '',
      );
      if (!sessionId) {
        Alert.alert('Cannot start test', 'Session was not created. Try again.');
        return;
      }
      navigation.navigate('ExamEngine', {
        testId: id,
        title: test.name,
        sessionId,
        mode: 'mock',
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        'Try again later';
      Alert.alert('Cannot start test', msg);
    } finally {
      setStarting(null);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <PWScreenHeader
        title="Test Series"
        subtitle="Institute mock tests"
        onBack={() => navigation.goBack()}
      />

      <LinearGradient colors={Gradients.orange} style={styles.promo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <IconBadge name="clipboard-check" color="#fff" size="md" variant="gradient" />
        <View style={{ flex: 1 }}>
          <Text style={styles.promoTitle}>Score higher in JEE & NEET</Text>
          <Text style={styles.promoSub}>All India mock tests with detailed solutions</Text>
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.id}
            style={[
              styles.filterChip,
              { backgroundColor: c.card, borderColor: c.border },
              filter === f.id && { backgroundColor: c.primary, borderColor: c.primary },
            ]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.filterChipText, { color: c.textMuted }, filter === f.id && { color: '#fff' }]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={c.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && filtered.length === 0 ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: 40 }} />
        ) : error && filtered.length === 0 ? (
          <View style={styles.empty}>
            <IconBadge name="exclamation-circle" color={c.danger} size="lg" variant="soft" />
            <Text style={[styles.emptyTitle, { color: c.text }]}>Could not load tests</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>{error}</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <IconBadge name="clipboard-list" color={c.primary} size="lg" variant="soft" />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No mock tests yet</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              Your institute will publish tests here soon
            </Text>
          </View>
        ) : (
          filtered.map(test => {
            const id = test.id;
            const qCount = test.questionCount > 0 ? test.questionCount : '—';
            const duration = test.durationMinutes > 0 ? test.durationMinutes : '—';
            const isFree = !test.isPaid && test.price === 0;

            return (
              <View key={id} style={[styles.testCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={styles.testTop}>
                  <IconBadge name="file-alt" color={c.primary} size="md" variant="soft" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.testName, { color: c.text }]} numberOfLines={2}>
                      {test.name}
                    </Text>
                    <Text style={[styles.testExam, { color: c.primary }]}>
                      {test.examType.toUpperCase()}
                    </Text>
                  </View>
                  {isFree ? (
                    <View style={[styles.freeTag, { backgroundColor: `${c.success}20` }]}>
                      <Text style={[styles.freeTagText, { color: c.success }]}>FREE</Text>
                    </View>
                  ) : (
                    <Text style={[styles.price, { color: c.accent }]}>₹{test.price || '—'}</Text>
                  )}
                </View>

                <View style={styles.testStats}>
                  <View style={styles.stat}>
                    <Icon name="list-ol" size={12} color={c.textMuted} solid />
                    <Text style={[styles.statText, { color: c.textMuted }]}>{qCount} Qs</Text>
                  </View>
                  <View style={styles.stat}>
                    <Icon name="clock" size={12} color={c.textMuted} solid />
                    <Text style={[styles.statText, { color: c.textMuted }]}>{duration} min</Text>
                  </View>
                  {test.attemptCount != null && (
                    <View style={styles.stat}>
                      <Icon name="users" size={12} color={c.textMuted} solid />
                      <Text style={[styles.statText, { color: c.textMuted }]}>{test.attemptCount} attempts</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={[styles.startBtn, { backgroundColor: c.primary }]}
                  onPress={() => handleStart(test)}
                  disabled={starting === id}
                  activeOpacity={0.85}
                >
                  {starting === id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Icon name="play" size={12} color="#fff" solid />
                      <Text style={styles.startBtnText}>Start Test</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: pagePadding,
    marginVertical: spacing.md,
    padding: spacing.md,
    borderRadius: BorderRadius.xl,
    ...Shadow.glow,
  },
  promoTitle: { fontSize: font.subhead, fontWeight: '800', color: '#fff' },
  promoSub: { fontSize: font.caption, color: 'rgba(255,255,255,0.9)', marginTop: vs(2) },
  filterRow: { paddingHorizontal: pagePadding, gap: spacing.sm, marginBottom: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: vs(8),
    borderRadius: ms(20),
    borderWidth: 1,
  },
  filterChipText: { fontSize: font.caption, fontWeight: '700' },
  list: { padding: pagePadding, paddingBottom: vs(32) },
  testCard: {
    borderRadius: BorderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    ...Shadow.card,
  },
  testTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  testName: { fontSize: font.subhead, fontWeight: '800' },
  testExam: { fontSize: font.tiny, fontWeight: '700', marginTop: vs(2) },
  freeTag: { paddingHorizontal: hs(10), paddingVertical: vs(4), borderRadius: ms(8) },
  freeTagText: { fontSize: font.tiny, fontWeight: '800' },
  price: { fontSize: font.title, fontWeight: '800' },
  testStats: { flexDirection: 'row', gap: spacing.md, marginBottom: vs(14) },
  stat: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  statText: { fontSize: font.caption, fontWeight: '600' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: BorderRadius.lg,
  },
  startBtnText: { fontSize: font.subhead, fontWeight: '800', color: '#fff' },
  empty: { alignItems: 'center', paddingTop: vs(48), gap: vs(10) },
  emptyTitle: { fontSize: font.title, fontWeight: '800' },
  emptySub: { fontSize: font.caption, textAlign: 'center', paddingHorizontal: spacing.xl },
});

export default TestSeriesScreen;
