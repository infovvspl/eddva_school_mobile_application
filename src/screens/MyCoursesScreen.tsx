import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  BookOpen,
  Circle,
  Grid3X3,
  Menu,
  Search,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Video,
} from 'lucide-react-native';
import DashboardLiveClassesSection from '../components/DashboardLiveClassesSection';
import EnrolledCourseCard from '../components/learning/EnrolledCourseCard';
import { useTheme } from '../context/ThemeContext';
import { useDemo } from '../context/DemoContext';
import { useApi } from '../hooks/useApi';
import { useLiveClasses } from '../hooks/useLiveClasses';
import { studentService } from '../services/student.service';
import { normalizeBatchList } from '../utils/courseMappers';
import { toPercent } from '../utils/progress';
import { font, hs, ms, safeTopInset, spacing, vs } from '../utils/responsive';

type Props = { navigation: any };
type TabKey = 'ongoing' | 'completed';
type ModeFilter = 'all' | 'live' | 'hybrid' | 'recorded';

const MODE_FILTERS = [
  { key: 'all' as const, label: 'All', Icon: null, dot: undefined },
  { key: 'live' as const, label: 'Live', Icon: Circle, dot: '#EF4444' },
  { key: 'hybrid' as const, label: 'Hybrid', Icon: Grid3X3, dot: undefined },
  { key: 'recorded' as const, label: 'Recorded', Icon: Video, dot: undefined },
];

const MyCoursesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const canGoBack = navigation.canGoBack?.() ?? false;

  const { version } = useDemo();
  const { data, loading, refetch } = useApi(
    () => studentService.getMyCourses(),
    [version],
  );
  const {
    liveClasses,
    loading: liveLoading,
    refresh: refreshLive,
  } = useLiveClasses();
  const courses: any[] = normalizeBatchList(data);

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabKey>('ongoing');
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter(course => {
      const progress = toPercent(course.progressPercent ?? course.progress);
      const isCompleted = progress >= 100;
      if (tab === 'ongoing' && isCompleted) return false;
      if (tab === 'completed' && !isCompleted) return false;

      const mode = (course.mode || 'online').toLowerCase();
      if (modeFilter === 'live' && mode !== 'online') return false;
      if (modeFilter === 'hybrid' && mode !== 'hybrid') return false;
      if (modeFilter === 'recorded' && mode !== 'offline') return false;

      if (!q) return true;
      const name = (course.batchName || course.name || '').toLowerCase();
      return (
        name.includes(q) || (course.examType || '').toLowerCase().includes(q)
      );
    });
  }, [courses, search, tab, modeFilter]);

  const ongoingCount = courses.filter(
    c => toPercent(c.progressPercent ?? c.progress) < 100,
  ).length;
  const completedCount = courses.length - ongoingCount;

  const openCurriculum = (course: any, initialTab?: string) => {
    navigation.navigate('CourseCurriculum', {
      batchId: course.batchId || course.id,
      initialTab: initialTab as any,
    });
  };

  const openResume = (course: any) => {
    const batchId = course.batchId || course.id;
    const topic = course.topics?.[0];
    if (topic) {
      navigation.navigate('LiveClass', {
        lectureId: topic.id,
        topicId: topic.id,
        title: topic.name || topic.topicName || course.nextLectureTitle,
        teacherName: course.teacherName,
        batchId,
      });
    } else {
      openCurriculum(course);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: safeTopInset(insets.top), backgroundColor: c.background },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerIcon, { borderColor: c.border }]}
          activeOpacity={0.85}
          onPress={canGoBack ? () => navigation.goBack() : undefined}
        >
          <Menu size={ms(24)} color={c.text} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: c.text }]}>
            My Courses
          </Text>
          <Text style={[styles.headerSubtitle, { color: c.textMuted }]}>
            Track your enrolled courses
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.headerIcon, { borderColor: c.border }]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Bell size={ms(23)} color={c.text} strokeWidth={2.2} />
          <View style={styles.notifyDot} />
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.searchBar,
          { backgroundColor: c.card, borderColor: c.border },
        ]}
      >
        <Search size={ms(20)} color={c.textMuted} strokeWidth={2.3} />
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder="Search courses..."
          placeholderTextColor={c.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <View style={[styles.searchDivider, { backgroundColor: c.border }]} />
        <TouchableOpacity activeOpacity={0.85} style={styles.filterButton}>
          <SlidersHorizontal size={ms(22)} color={c.text} strokeWidth={2.3} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabs, { borderBottomColor: c.border }]}>
        {(
          [
            ['ongoing', `Ongoing (${ongoingCount})`],
            ['completed', `Completed (${completedCount})`],
          ] as [TabKey, string][]
        ).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={styles.tabItem}
            onPress={() => setTab(key)}
          >
            <Text
              style={[
                styles.tabText,
                { color: c.textMuted },
                tab === key && { color: c.primary, fontWeight: '900' },
              ]}
            >
              {label}
            </Text>
            {tab === key ? (
              <View style={[styles.tabLine, { backgroundColor: c.primary }]} />
            ) : null}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterHost}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {MODE_FILTERS.map(f => {
            const selected = modeFilter === f.key;
            const FilterIcon = f.Icon;
            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selected ? c.primary : c.card,
                    borderColor: selected ? c.primary : c.border,
                  },
                ]}
                onPress={() => setModeFilter(f.key)}
              >
                {f.dot ? (
                  <View style={styles.liveDots}>
                    <View style={[styles.dot, { backgroundColor: f.dot }]} />
                    <View style={[styles.dot, { backgroundColor: f.dot }]} />
                  </View>
                ) : null}
                {FilterIcon ? (
                  <FilterIcon
                    size={ms(15)}
                    color={selected ? '#fff' : c.textMuted}
                    fill={
                      f.key === 'live'
                        ? selected
                          ? '#fff'
                          : '#EF4444'
                        : 'none'
                    }
                    strokeWidth={2.2}
                  />
                ) : null}
                <Text
                  style={[
                    styles.filterText,
                    { color: selected ? '#fff' : c.text },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <Text style={[styles.countLabel, { color: c.textMuted }]}>
            {filtered.length} of {courses.length}
          </Text>
        </ScrollView>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={loading || liveLoading}
            onRefresh={() => {
              refetch();
              refreshLive();
            }}
            tintColor={c.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <DashboardLiveClassesSection
          events={liveClasses}
          loading={liveLoading}
          navigation={navigation}
        />

        {loading && courses.length === 0 ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: vs(40) }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <BookOpen size={ms(40)} color={c.border} strokeWidth={2.2} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>
              No courses here
            </Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              {courses.length > 0
                ? 'Try another filter'
                : 'Enroll from Home to start learning'}
            </Text>
            {courses.length === 0 ? (
              <TouchableOpacity
                style={[styles.browseBtn, { backgroundColor: c.primary }]}
                onPress={() =>
                  navigation.navigate('Main', { screen: 'Dashboard' })
                }
              >
                <Text style={styles.browseBtnText}>Explore on Home</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          filtered.map(course => (
            <EnrolledCourseCard
              key={course.batchId || course.id}
              course={course}
              onOpenCourse={() => openCurriculum(course)}
              onResume={() => openResume(course)}
              onOpenTab={quickTab => openCurriculum(course, quickTab)}
            />
          ))
        )}

        <View
          style={[
            styles.progressBanner,
            { backgroundColor: '#F0F8FF', borderColor: c.border },
          ]}
        >
          <View style={styles.targetArt}>
            <Target size={ms(52)} color={c.primary} strokeWidth={2.4} />
            <View style={styles.bookStack}>
              <BookOpen size={ms(18)} color="#2563EB" strokeWidth={2.3} />
            </View>
          </View>
          <View style={styles.bannerCopy}>
            <Text style={[styles.bannerTitle, { color: c.text }]}>
              Keep learning, keep growing!
            </Text>
            <Text style={[styles.bannerSub, { color: c.textMuted }]}>
              You're on the right track. Let's reach your goals together.
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.progressBtn, { backgroundColor: c.primary }]}
            onPress={() => navigation.navigate('Progress')}
            activeOpacity={0.88}
          >
            <TrendingUp size={ms(16)} color="#fff" strokeWidth={2.5} />
            <Text style={styles.progressBtnText}>View Progress</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: vs(8),
    paddingBottom: vs(14),
    gap: hs(14),
  },
  headerIcon: {
    width: hs(56),
    height: hs(56),
    borderRadius: hs(28),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  headerText: { flex: 1, minWidth: 0 },
  headerTitle: {
    fontSize: ms(26, 0.2),
    lineHeight: ms(32, 0.2),
    fontWeight: '900',
  },
  headerSubtitle: {
    fontSize: font.subhead,
    fontWeight: '600',
    marginTop: vs(1),
  },
  notifyDot: {
    position: 'absolute',
    top: vs(13),
    right: hs(13),
    width: ms(9),
    height: ms(9),
    borderRadius: ms(5),
    backgroundColor: '#EF233C',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    marginHorizontal: spacing.md,
    marginBottom: vs(20),
    paddingLeft: hs(18),
    paddingRight: hs(10),
    height: vs(60),
    borderRadius: ms(30),
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: font.subhead,
    padding: 0,
    fontWeight: '600',
  },
  searchDivider: { width: StyleSheet.hairlineWidth, height: vs(34) },
  filterButton: {
    width: hs(46),
    height: hs(46),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    borderBottomWidth: 1,
    marginBottom: vs(18),
  },
  tabItem: { marginRight: hs(44), paddingBottom: vs(12) },
  tabText: { fontSize: font.subhead, fontWeight: '700' },
  tabLine: { height: 4, borderRadius: 2, marginTop: vs(10), minWidth: hs(92) },
  filterHost: {
    flexGrow: 0,
    height: vs(58),
    marginBottom: vs(8),
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: hs(12),
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    flexShrink: 0,
    gap: hs(8),
    minHeight: vs(42),
    paddingHorizontal: hs(18),
    paddingVertical: vs(10),
    borderRadius: ms(22),
    borderWidth: 1,
  },
  liveDots: { flexDirection: 'row', gap: hs(4) },
  dot: { width: hs(7), height: hs(7), borderRadius: hs(4) },
  filterText: { fontSize: font.subhead, fontWeight: '800' },
  countLabel: { fontSize: font.subhead, fontWeight: '800', marginLeft: hs(22) },
  list: { paddingHorizontal: spacing.md, paddingBottom: vs(20) },
  empty: { alignItems: 'center', paddingVertical: vs(48), gap: vs(8) },
  emptyTitle: { fontSize: font.subhead, fontWeight: '800' },
  emptySub: { fontSize: font.caption, textAlign: 'center' },
  browseBtn: {
    marginTop: vs(12),
    paddingHorizontal: hs(20),
    paddingVertical: vs(10),
    borderRadius: ms(20),
  },
  browseBtnText: { color: '#fff', fontWeight: '800', fontSize: font.caption },
  progressBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    borderRadius: ms(18),
    borderWidth: 1,
    paddingHorizontal: hs(14),
    paddingVertical: vs(12),
    marginTop: vs(6),
    marginBottom: vs(8),
  },
  targetArt: {
    width: hs(70),
    height: hs(58),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookStack: { position: 'absolute', left: hs(3), bottom: 0 },
  bannerCopy: { flex: 1, minWidth: 0 },
  bannerTitle: { fontSize: font.subhead, fontWeight: '900' },
  bannerSub: {
    fontSize: font.caption,
    fontWeight: '600',
    lineHeight: ms(18),
    marginTop: vs(3),
  },
  progressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(7),
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    borderRadius: ms(22),
  },
  progressBtnText: { color: '#fff', fontSize: font.caption, fontWeight: '900' },
});

export default MyCoursesScreen;
