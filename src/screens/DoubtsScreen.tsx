import React, { useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '../components/Icon';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { doubtService } from '../services/doubt.service';
import type { DoubtChannel, MockDoubt } from '../mocks/mockDoubtService';
import type { RootStackParamList } from '../types/navigation';
import { normalizeDoubt, parseDoubtsResponse } from '../utils/doubtMappers';
import { font, hs, ms, spacing, useScreenLayout, vs } from '../utils/responsive';

type FilterKey = 'all' | 'waiting' | 'queued' | 'ai_resolved' | 'resolved';
type RootNav = NativeStackNavigationProp<RootStackParamList>;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'queued', label: 'Queued' },
  { key: 'ai_resolved', label: 'AI Resolved' },
  { key: 'resolved', label: 'Resolved' },
];

const DoubtsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { isNarrow } = useScreenLayout();
  const navigation = useNavigation<RootNav>();
  const { theme } = useTheme();
  const c = theme.colors;
  const [filter, setFilter] = useState<FilterKey>('all');
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState<DoubtChannel | null>(null);
  const [showAsk, setShowAsk] = useState(false);

  const { data, loading, error, refetch } = useApi(() => doubtService.list({ limit: 30 }), []);

  const [cachedList, setCachedList] = useState<{
    doubts: MockDoubt[];
    stats: { total: number; pending: number; resolved: number };
  } | null>(null);

  const parsed = useMemo(() => parseDoubtsResponse(data), [data]);
  const doubts = parsed.doubts.length > 0 ? parsed.doubts : cachedList?.doubts ?? [];
  const stats = parsed.doubts.length > 0 ? parsed.stats : cachedList?.stats ?? parsed.stats;

  useEffect(() => {
    if (parsed.doubts.length > 0) {
      setCachedList({ doubts: parsed.doubts, stats: parsed.stats });
    }
  }, [data, parsed.doubts.length, parsed.stats]);

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return doubts;
    return doubts.filter(d => d.status === filter);
  }, [doubts, filter]);

  const submitDoubt = async (target: DoubtChannel) => {
    if (!question.trim()) return;
    setSubmitting(target);
    try {
      const { data } = await doubtService.create({
        question: question.trim(),
        target,
      });
      setQuestion('');
      setShowAsk(false);
      await refetch();
      const created =
        data && typeof data === 'object'
          ? normalizeDoubt(data as Record<string, unknown>)
          : undefined;
      if (created?.id) {
        navigation.navigate('DoubtDetail', {
          doubt: created,
          initialMode: target === 'ai' ? 'brief' : undefined,
        });
      }
      Alert.alert(
        target === 'ai' ? 'Sent to AI' : 'Sent to teacher',
        target === 'ai'
          ? 'AI explanation is ready. You can also forward to a teacher from the detail screen.'
          : 'Your doubt is in the teacher queue. You will be notified when they respond.',
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not submit doubt');
    } finally {
      setSubmitting(null);
    }
  };

  const statusLabel = (d: MockDoubt) => {
    if (d.channel === 'teacher' && d.status === 'queued') return 'With teacher';
    if (d.status === 'ai_resolved') return 'Answered by AI';
    if (d.status === 'resolved') return 'Resolved by Teacher';
    if (d.status === 'waiting') return 'Waiting for AI';
    if (d.status === 'queued') return 'Queued for teacher';
    return 'Pending';
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>Doubts</Text>
        <TouchableOpacity
          style={[styles.askFab, { backgroundColor: c.primary }]}
          onPress={() => setShowAsk(s => !s)}
        >
          <Icon name="plus" size={ms(14)} color="#fff" solid />
          <Text style={styles.askFabText}>Ask</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.statNum, { color: c.text }]}>{stats.total}</Text>
          <Text style={[styles.statLbl, { color: c.textMuted }]}>Total</Text>
        </View>
        <View style={[styles.statCard, styles.statPending]}>
          <Text style={[styles.statNum, { color: '#D97706' }]}>{stats.pending}</Text>
          <Text style={[styles.statLbl, { color: '#D97706' }]}>Pending</Text>
        </View>
        <View style={[styles.statCard, styles.statResolved]}>
          <Text style={[styles.statNum, { color: '#059669' }]}>{stats.resolved}</Text>
          <Text style={[styles.statLbl, { color: '#059669' }]}>Resolved</Text>
        </View>
      </View>

      {showAsk ? (
        <View style={[styles.askBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <TextInput
            style={[styles.askInput, { color: c.text, borderColor: c.border }]}
            placeholder="Type your doubt…"
            placeholderTextColor={c.textMuted}
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <Text style={[styles.askHint, { color: c.textMuted }]}>
            Choose how you want this doubt answered
          </Text>
          <View style={[styles.submitRow, isNarrow && styles.submitRowStacked]}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                styles.submitAi,
                submitting === 'ai' && { opacity: 0.6 },
              ]}
              onPress={() => submitDoubt('ai')}
              disabled={!!submitting || !question.trim()}
            >
              {submitting === 'ai' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon name="magic" size={ms(12)} color="#fff" solid />
                  <Text style={styles.submitText}>Ask AI</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                styles.submitTeacher,
                submitting === 'teacher' && { opacity: 0.6 },
              ]}
              onPress={() => submitDoubt('teacher')}
              disabled={!!submitting || !question.trim()}
            >
              {submitting === 'teacher' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon name="user-graduate" size={ms(12)} color="#fff" solid />
                  <Text style={styles.submitText}>Send to teacher</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <View style={styles.filterHost}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                filter === f.key
                  ? { backgroundColor: c.primary }
                  : { backgroundColor: c.card, borderColor: c.border },
              ]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.key ? '#fff' : c.textMuted },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={c.primary} />}
      >
        {loading && doubts.length === 0 ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: vs(32) }} />
        ) : error && doubts.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="exclamation-circle" size={ms(36)} color="#DC2626" solid />
            <Text style={[styles.emptyTitle, { color: c.text }]}>Could not load doubts</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: c.primary }]} onPress={refetch}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="comments" size={ms(36)} color={c.textMuted} solid />
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              {doubts.length === 0 ? 'No doubts yet' : 'No doubts in this filter'}
            </Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              {doubts.length === 0 ? 'Tap Ask to post a new question' : 'Try another filter or tap All'}
            </Text>
          </View>
        ) : (
          filtered.map(d => (
            <TouchableOpacity
              key={d.id}
              style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
              activeOpacity={0.92}
              onPress={() => navigation.navigate('DoubtDetail', { doubt: d, initialMode: 'brief' })}
            >
              <View style={styles.cardHead}>
                <View style={styles.cardHeadLeft}>
                  <Icon name="comment-dots" size={ms(14)} color={c.primary} solid />
                  <Text style={[styles.cardStatus, { color: c.primary }]}>{statusLabel(d)}</Text>
                </View>
                <Icon name="chevron-right" size={ms(12)} color={c.textMuted} solid />
              </View>
              <Text style={[styles.question, { color: c.text }]} numberOfLines={3}>
                {d.question}
              </Text>
              <Text style={[styles.tapHint, { color: c.textMuted }]}>Tap to view full explanation</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: vs(12),
  },
  title: { fontSize: font.title, fontWeight: '900' },
  askFab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    paddingHorizontal: hs(14),
    paddingVertical: vs(8),
    borderRadius: ms(20),
  },
  askFabText: { color: '#fff', fontWeight: '800', fontSize: font.caption },
  statsRow: {
    flexDirection: 'row',
    gap: hs(10),
    paddingHorizontal: spacing.md,
    marginBottom: vs(14),
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: vs(14),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  statPending: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  statResolved: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  statNum: { fontSize: font.title, fontWeight: '900' },
  statLbl: { fontSize: font.tiny, fontWeight: '700', marginTop: vs(4) },
  askBox: {
    marginHorizontal: spacing.md,
    marginBottom: vs(12),
    padding: ms(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: vs(10),
  },
  askInput: {
    minHeight: vs(72),
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: ms(12),
    fontSize: font.caption,
    textAlignVertical: 'top',
  },
  askHint: { fontSize: font.tiny, fontWeight: '600' },
  submitRow: { flexDirection: 'row', gap: hs(8) },
  submitRowStacked: { flexDirection: 'column' },
  submitBtn: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(6),
    paddingVertical: vs(12),
    borderRadius: BorderRadius.md,
  },
  submitAi: { backgroundColor: '#2563EB' },
  submitTeacher: { backgroundColor: '#EA580C' },
  submitText: { color: '#fff', fontWeight: '800', fontSize: font.caption },
  filterHost: { flexGrow: 0, height: vs(42), marginBottom: vs(8) },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: hs(8),
  },
  filterChip: {
    paddingHorizontal: hs(14),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    borderWidth: 1,
    alignSelf: 'center',
  },
  filterText: { fontSize: font.tiny, fontWeight: '700' },
  list: { paddingHorizontal: spacing.md, paddingBottom: vs(32) },
  empty: { alignItems: 'center', paddingVertical: vs(48), gap: vs(8) },
  emptyTitle: { fontSize: font.subhead, fontWeight: '800' },
  emptySub: { fontSize: font.caption, textAlign: 'center', paddingHorizontal: hs(24) },
  retryBtn: {
    marginTop: vs(16),
    paddingHorizontal: hs(24),
    paddingVertical: vs(10),
    borderRadius: BorderRadius.lg,
  },
  retryBtnText: { color: '#fff', fontWeight: '800', fontSize: font.caption },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: ms(14),
    marginBottom: vs(12),
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  cardHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: hs(8) },
  cardStatus: { fontSize: font.tiny, fontWeight: '800' },
  question: { fontSize: font.caption, fontWeight: '700', lineHeight: ms(22), marginBottom: vs(4) },
  tapHint: { fontSize: font.micro, fontWeight: '600' },
});

export default DoubtsScreen;
