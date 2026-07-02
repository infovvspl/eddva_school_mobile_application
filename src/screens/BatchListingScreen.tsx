import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import IconBadge from '../components/IconBadge';
import PWScreenHeader from '../components/PWScreenHeader';
import { BorderRadius, Shadow, Gradients } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { studentService } from '../services/student.service';
import { useLiveClasses } from '../hooks/useLiveClasses';
import { normalizeBatchList, batchMatchesExam } from '../utils/courseMappers';
import { toPercent } from '../utils/progress';
import { font, hs, layout, ms, pagePadding, spacing, vs } from '../utils/responsive';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'BatchListing'>;
type Tab = 'my' | 'explore' | 'live';
type ExamFilter = 'all' | 'jee' | 'neet';

const EXAM_FILTERS: { id: ExamFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'jee', label: 'JEE' },
  { id: 'neet', label: 'NEET' },
];

const BatchListingScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const initialTab = route.params?.initialTab;
  const [tab, setTab] = useState<Tab>(
    initialTab === 'live' || initialTab === 'my' || initialTab === 'explore' ? initialTab : 'explore',
  );
  const [examFilter, setExamFilter] = useState<ExamFilter>('all');
  const [search, setSearch] = useState('');
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const myCourses = useApi(() => studentService.getMyCourses(), []);
  const discover = useApi(() => studentService.discoverBatches(), []);
  const { liveClasses: liveEvents, loading: liveLoading, refresh: refreshLive } = useLiveClasses();

  const myBatches = normalizeBatchList(myCourses.data);
  const exploreBatches = normalizeBatchList(discover.data);

  const filterList = (list: any[]) => {
    let out = list;
    if (examFilter !== 'all') {
      out = out.filter(b =>
        batchMatchesExam(b, examFilter === 'jee' ? 'JEE' : 'NEET'),
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter(b =>
        (b.name || b.batchName || '').toLowerCase().includes(q) ||
        (b.description || '').toLowerCase().includes(q),
      );
    }
    return out;
  };

  const displayList = tab === 'my' ? filterList(myBatches)
    : tab === 'explore' ? filterList(exploreBatches)
    : liveEvents;

  const loading = tab === 'my' ? myCourses.loading
    : tab === 'explore' ? discover.loading
    : liveLoading;

  const onRefresh = () => {
    myCourses.refetch();
    discover.refetch();
    refreshLive();
  };

  const handleEnroll = (batch: any) => {
    const id = batch.id || batch.batchId;
    const name = batch.name || batch.batchName;
    Alert.alert('Enroll in Batch', `Join "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Enroll',
        onPress: async () => {
          setEnrolling(id);
          try {
            await studentService.enrollBatch(id);
            Alert.alert('Success', 'Enrolled! Check My Batches tab.');
            discover.refetch();
            myCourses.refetch();
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Enrollment failed');
          } finally {
            setEnrolling(null);
          }
        },
      },
    ]);
  };

  const renderBatchCard = (batch: any, index: number) => {
    const id = batch.id || batch.batchId;
    const name = batch.name || batch.batchName || batch.title;
    const exam = (batch.examTarget || batch.examType || 'BATCH').toUpperCase();
    const isLive = tab === 'live';
    const progress = toPercent(batch.progressPercent ?? batch.progress);

    const openDetail = () => {
      if (isLive) {
        navigation.navigate('LiveClass', {
          lectureId: batch.lectureId || batch.id,
          title: name,
          teacherName: batch.teacherName || batch.instructor,
          batchId: batch.batchId,
          topicId: batch.topicId,
        });
      } else {
        navigation.navigate('CourseDetail', { batchId: id });
      }
    };

    return (
      <View key={id || index} style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
        <TouchableOpacity activeOpacity={0.9} onPress={openDetail}>
          <LinearGradient colors={Gradients.primary} style={styles.cardBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            {isLive && (
              <View style={[styles.liveBadge, { backgroundColor: c.danger }]}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            <IconBadge name={isLive ? 'video' : 'graduation-cap'} color="#fff" size="md" variant="gradient" />
            <View style={styles.examPill}>
              <Text style={styles.examPillText}>{exam}</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cardBody} activeOpacity={0.9} onPress={openDetail}>
          <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>{name}</Text>
          {batch.description ? (
            <Text style={[styles.cardDesc, { color: c.textMuted }]} numberOfLines={2}>{batch.description}</Text>
          ) : null}
          <View style={styles.cardMeta}>
            {batch.class && (
              <View style={[styles.metaChip, { backgroundColor: c.background }]}>
                <Text style={[styles.metaChipText, { color: c.textMuted }]}>Class {batch.class}</Text>
              </View>
            )}
            {batch.studentCount != null && (
              <View style={[styles.metaChip, { backgroundColor: c.background }]}>
                <Icon name="users" size={10} color={c.textMuted} solid />
                <Text style={[styles.metaChipText, { color: c.textMuted }]}>{batch.studentCount}</Text>
              </View>
            )}
          </View>
          {tab === 'explore' && (
            <TouchableOpacity
              style={[
                styles.enrollBtn,
                { backgroundColor: c.accent },
                batch.isEnrolled && { backgroundColor: `${c.success}20` },
              ]}
              onPress={() => !batch.isEnrolled && handleEnroll(batch)}
              disabled={batch.isEnrolled || enrolling === id}
            >
              {enrolling === id ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={[styles.enrollBtnText, batch.isEnrolled && { color: c.success }]}>
                  {batch.isEnrolled ? 'Enrolled ✓' : 'Buy / Enroll'}
                </Text>
              )}
            </TouchableOpacity>
          )}
          {tab === 'my' && (batch.progressPercent != null || batch.progress != null) && (
            <View style={[styles.progressWrap, { backgroundColor: c.borderLight }]}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: c.primary }]} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <PWScreenHeader
        title="Batches"
        subtitle="Physics Wallah-style learning batches"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('JoinBatch')}
            style={[styles.joinLink, { backgroundColor: c.chipBg, borderColor: c.border }]}
          >
            <Text style={[styles.joinLinkText, { color: c.primary }]}>Join</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.tabs}>
        {([
          ['my', 'My Batches', myBatches.length],
          ['explore', 'Explore', exploreBatches.length],
          ['live', 'Live Now', liveEvents.length],
        ] as [Tab, string, number][]).map(([t, label, count]) => (
          <TouchableOpacity
            key={t}
            style={[
              styles.tab,
              { backgroundColor: c.card, borderColor: c.border },
              tab === t && { backgroundColor: c.primary, borderColor: c.primary },
            ]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, { color: c.textMuted }, tab === t && { color: '#fff' }]}>{label}</Text>
            {count > 0 && (
              <View style={[styles.tabBadge, tab === t ? { backgroundColor: 'rgba(255,255,255,0.25)' } : { backgroundColor: c.borderLight }]}>
                <Text style={[styles.tabBadgeText, { color: c.textMuted }, tab === t && { color: '#fff' }]}>{count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filters}>
        <View style={[styles.searchRow, { backgroundColor: c.card, borderColor: c.border }]}>
          <Icon name="search" size={14} color={c.textMuted} solid />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder="Search batches…"
            placeholderTextColor={c.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {EXAM_FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.filterChip,
                { backgroundColor: c.card, borderColor: c.border },
                examFilter === f.id && { backgroundColor: c.primary, borderColor: c.primary },
              ]}
              onPress={() => setExamFilter(f.id)}
            >
              <Text style={[styles.filterChipText, { color: c.textMuted }, examFilter === f.id && { color: '#fff' }]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={c.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && displayList.length === 0 ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: 40 }} />
        ) : displayList.length === 0 ? (
          <View style={styles.empty}>
            <IconBadge
              name={tab === 'live' ? 'video-slash' : 'book-open'}
              color={c.primary}
              size="lg"
              variant="soft"
            />
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              {tab === 'live' ? 'No live classes right now' : 'No batches found'}
            </Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              {tab === 'explore' ? 'Try a different filter or check back later' : 'Enroll from Explore tab'}
            </Text>
          </View>
        ) : (
          displayList.map(renderBatchCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', paddingHorizontal: pagePadding, paddingVertical: vs(10), gap: spacing.sm },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vs(6),
    paddingVertical: vs(10),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadow.soft,
  },
  tabText: { fontSize: font.caption, fontWeight: '700' },
  tabBadge: { paddingHorizontal: hs(6), paddingVertical: vs(1), borderRadius: ms(8) },
  tabBadgeText: { fontSize: font.micro, fontWeight: '700' },
  filters: { paddingHorizontal: pagePadding, marginBottom: spacing.sm },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: hs(14),
    paddingVertical: vs(10),
    marginBottom: vs(10),
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: font.subhead, padding: 0 },
  chipRow: { gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: vs(8),
    borderRadius: ms(20),
    borderWidth: 1,
  },
  filterChipText: { fontSize: font.caption, fontWeight: '700' },
  list: { padding: pagePadding, paddingBottom: vs(32) },
  card: {
    borderRadius: BorderRadius.xl,
    marginBottom: vs(14),
    overflow: 'hidden',
    borderWidth: 1,
    ...Shadow.card,
  },
  cardBanner: {
    height: vs(100),
    padding: spacing.md,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
    borderRadius: ms(6),
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  liveDot: { width: ms(6), height: ms(6), borderRadius: ms(3), backgroundColor: '#fff' },
  liveText: { fontSize: font.micro, fontWeight: '800', color: '#fff' },
  examPill: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(8),
  },
  examPillText: { fontSize: font.micro, fontWeight: '800', color: '#fff' },
  cardBody: { padding: vs(14) },
  cardTitle: { fontSize: font.title, fontWeight: '800', marginBottom: spacing.xs },
  cardDesc: { fontSize: font.caption, marginBottom: spacing.sm },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: vs(6), marginBottom: vs(10) },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(4),
    borderRadius: ms(8),
  },
  metaChipText: { fontSize: font.tiny, fontWeight: '600' },
  enrollBtn: {
    paddingVertical: spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  enrollBtnText: { fontSize: font.subhead, fontWeight: '800', color: '#fff' },
  progressWrap: { height: vs(6), borderRadius: ms(3), overflow: 'hidden', marginTop: spacing.xs },
  progressFill: { height: vs(6), borderRadius: ms(3) },
  empty: { alignItems: 'center', paddingTop: vs(48), gap: vs(10), paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: font.title, fontWeight: '800' },
  emptySub: { fontSize: font.caption, textAlign: 'center' },
  joinLink: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    borderWidth: 1,
  },
  joinLinkText: { fontSize: font.caption, fontWeight: '800' },
});

export default BatchListingScreen;
