<<<<<<< HEAD
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import {
  Bot,
  CalendarCheck,
  ChevronRight,
  ClipboardCheck,
  FileText,
  type LucideIcon,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import HomeGreeting from '../components/HomeGreeting';
import VideoCoursesSection from '../components/VideoCoursesSection';
import DashboardLiveClassesSection from '../components/DashboardLiveClassesSection';
import PwBatchesHome from '../components/PwBatchesHome';
import CourseCoverImage from '../components/CourseCoverImage';
import { navigateRoot } from '../navigation/navigationRef';
import { useNotificationUnread } from '../hooks/useNotificationUnread';
import { Brand } from '../constants/brand';
import { Colors, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { font, hs, layout, ms, pagePadding, spacing, useScreenLayout, vs } from '../utils/responsive';
import { useDemo } from '../context/DemoContext';
import { useApi } from '../hooks/useApi';
import { studentService } from '../services/student.service';
import { useLiveClasses } from '../hooks/useLiveClasses';
import { normalizeBatchList } from '../utils/courseMappers';
import { toPercent } from '../utils/progress';
import { extractCourseImageUrl } from '../utils/mediaUrl';

type Props = { navigation: any };

const QUICK_ACTIONS = [
  {
    id: 'study-plan',
    label: 'Study Plan',
    sub: 'Today tasks',
    Icon: CalendarCheck,
    color: Brand.blue700,
    onPress: () => navigateRoot('Main', { screen: 'StudyPlan' }),
  },
  {
    id: 'tests',
    label: 'Mock Tests',
    sub: 'Practice now',
    Icon: ClipboardCheck,
    color: '#7C3AED',
    onPress: () => navigateRoot('TestSeries'),
  },
  {
    id: 'ai-help',
    label: 'AI Doubt',
    sub: '24/7',
    Icon: Bot,
    color: '#0891B2',
    onPress: () => navigateRoot('Main', { screen: 'Help' }),
  },
  {
    id: 'materials',
    label: 'Materials',
    sub: 'Notes & PDFs',
    Icon: FileText,
    color: '#059669',
    onPress: () => navigateRoot('StudyMaterials'),
  },
] satisfies {
  id: string;
  label: string;
  sub: string;
  Icon: LucideIcon;
  color: string;
  onPress: () => void;
}[];

/** Home — video first, enrolled courses */
const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { carouselCardWidth } = useScreenLayout();
  const { height: windowHeight } = useWindowDimensions();
  const { unread: notifUnread } = useNotificationUnread();
  const { theme } = useTheme();
  const c = theme.colors;
  const { version } = useDemo();
  const [search, setSearch] = React.useState('');
  const [scrollY, setScrollY] = React.useState(0);
  const [miniPlayer, setMiniPlayer] = React.useState<{
    visible: boolean;
    title?: string;
    subtitle?: string;
    progressPercent?: number;
    onPress?: () => void;
  }>({ visible: false });

  const { loading, refetch } = useApi(() => studentService.getDashboard(), [version]);
  const { data: continueLearning } = useApi(() => studentService.getContinueLearning(), [version]);
  const { data: discoverData } = useApi(() => studentService.discoverBatches(), [version]);
  const { data: myData } = useApi(() => studentService.getMyCourses(), [version]);
  const { liveClasses, loading: liveLoading, refresh: refreshLive } = useLiveClasses();

  const myCourses = normalizeBatchList(myData);
  const discover = normalizeBatchList(discoverData);
  const cl = continueLearning as Record<string, unknown> | undefined;
  const showCatalog = !loading && myCourses.length === 0;

  const onRefresh = useCallback(() => {
    refetch();
    refreshLive();
  }, [refetch, refreshLive]);

  if (showCatalog) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, backgroundColor: c.background }]}>
        <PwBatchesHome
          navigation={navigation}
          courses={discover}
          loading={loading}
          onRefresh={onRefresh}
          liveClasses={liveClasses}
          liveClassesLoading={liveLoading}
        />
      </View>
    );
  }

  const q = search.trim().toLowerCase();
  const myFiltered = q
    ? myCourses.filter((course: Record<string, unknown>) =>
        String(course.batchName || course.name || '')
          .toLowerCase()
          .includes(q),
      )
    : myCourses;

  const headerHeightEstimate = insets.top + vs(78);
  const viewportHeight = Math.max(vs(260), windowHeight - headerHeightEstimate);

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <View style={[styles.headerBar, { paddingTop: insets.top + vs(6), backgroundColor: c.background }]}>
        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: c.card }]}
            onPress={() => navigateRoot('AccountHub')}
            activeOpacity={0.85}
          >
            <Icon name="user-circle" size={layout.iconMd} color={c.text} solid />
          </TouchableOpacity>
          <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
            <Icon name="search" size={layout.iconSm} color={c.textMuted} solid />
            <TextInput
              style={[styles.searchInput, { color: c.text }]}
              placeholder="Search courses, topics…"
              placeholderTextColor={c.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Icon name="times-circle" size={ms(16)} color={c.textMuted} solid />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={[styles.toolBtn, { backgroundColor: c.card }]}
            onPress={() => navigateRoot('Notifications')}
            activeOpacity={0.85}
          >
            <Icon name="bell" size={layout.iconMd} color={c.text} solid />
            {notifUnread > 0 ? <View style={styles.notifDot} /> : null}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        onScroll={e => setScrollY(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={c.primary} />
        }
      >
        <HomeGreeting navigation={navigation} />

        <View style={styles.quickActionSection}>
          <View style={styles.quickActionHead}>
            <Text style={[styles.quickActionTitle, { color: c.text }]}>Quick actions</Text>
            <Text style={[styles.quickActionSub, { color: c.textMuted }]}>Jump back into learning</Text>
          </View>
          <View style={styles.quickActionGrid}>
            {QUICK_ACTIONS.map(action => {
              const ActionIcon = action.Icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={[
                    styles.quickActionCard,
                    { backgroundColor: c.card, borderColor: c.border },
                    Shadow.soft,
                  ]}
                  activeOpacity={0.88}
                  onPress={action.onPress}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}12` }]}>
                    <ActionIcon size={ms(20)} color={action.color} strokeWidth={2.4} />
                  </View>
                  <View style={styles.quickActionCopy}>
                    <Text style={[styles.quickActionLabel, { color: c.text }]} numberOfLines={1}>
                      {action.label}
                    </Text>
                    <Text style={[styles.quickActionCaption, { color: c.textMuted }]} numberOfLines={1}>
                      {action.sub}
                    </Text>
                  </View>
                  <View style={[styles.quickActionArrow, { backgroundColor: `${action.color}10` }]}>
                    <ChevronRight size={ms(14)} color={action.color} strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <DashboardLiveClassesSection
          events={liveClasses}
          loading={liveLoading}
          navigation={navigation}
        />

        <VideoCoursesSection
          continueLearning={cl}
          courses={myCourses}
          navigation={navigation}
          scrollY={scrollY}
          viewportHeight={viewportHeight}
          onMiniPlayerStateChange={setMiniPlayer}
        />

        <View style={styles.sectionHead}>
          <View>
            <Text style={[styles.sectionTitle, { color: c.text }]}>My batches</Text>
            <Text style={[styles.sectionSub, { color: c.textMuted }]}>
              {myFiltered.length} enrolled
            </Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => navigation.navigate('MyCourses')}
          >
            <Text style={styles.seeAll}>See all</Text>
            <Icon name="arrow-right" size={ms(10)} color={Colors.primary} solid />
          </TouchableOpacity>
        </View>

        {myFiltered.length === 0 ? (
          <TouchableOpacity
            style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => navigation.navigate('Courses')}
          >
            <Icon name="graduation-cap" size={ms(28)} color={c.primary} solid />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No courses yet</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>Browse programs to enroll</Text>
          </TouchableOpacity>
        ) : (
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.courseRow}
          >
            {myFiltered.map((course: Record<string, unknown>, i: number) => {
              const id = String(course.batchId || course.id || i);
              const name = String(course.batchName || course.name || 'Course');
              const progress = toPercent(course.progressPercent ?? course.progress);
              return (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.courseCard,
                    { width: carouselCardWidth, backgroundColor: c.card, borderColor: c.border },
                    Shadow.soft,
                  ]}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('CourseCurriculum', { batchId: id })}
                >
                  <View style={styles.courseThumbWrap}>
                    <CourseCoverImage
                      course={course}
                      style={styles.courseThumb}
                      iconSize={28}
                    />
                    <View style={styles.courseProgressOverlay}>
                      <View
                        style={[styles.courseProgressFill, { width: `${progress}%` }]}
                      />
                    </View>
                  </View>
                  <View style={styles.courseBody}>
                    <Text style={[styles.courseName, { color: c.text }]} numberOfLines={2}>
                      {name}
                    </Text>
                    <Text style={[styles.courseTeacher, { color: c.textMuted }]} numberOfLines={1}>
                      {course.teacherName
                        ? `With ${course.teacherName}`
                        : 'EDDVA Faculty'}
                    </Text>
                    <View style={styles.courseMeta}>
                      <Icon name="chart-line" size={10} color={c.primary} solid />
                      <Text style={[styles.courseMetaText, { color: c.textMuted }]}>
                        {progress}% complete
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </ScrollView>

      {miniPlayer.visible ? (
        <TouchableOpacity
          style={[styles.miniPlayer, { backgroundColor: c.card, borderColor: c.border }]}
          activeOpacity={0.9}
          onPress={miniPlayer.onPress}
        >
          <View style={styles.miniInfo}>
            <Text style={[styles.miniTitle, { color: c.text }]} numberOfLines={1}>
              {miniPlayer.title || 'Continue watching'}
            </Text>
            <Text style={[styles.miniSub, { color: c.textMuted }]} numberOfLines={1}>
              {miniPlayer.subtitle || 'Tap to open full player'}
            </Text>
          </View>
          <View style={styles.miniRight}>
            <Text style={[styles.miniPct, { color: c.textMuted }]}>
              {Math.max(0, Math.min(100, miniPlayer.progressPercent ?? 0))}%
            </Text>
            <Icon name="expand-arrows-alt" size={ms(12)} color={c.primary} solid />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBar: { paddingBottom: vs(4) },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    paddingHorizontal: pagePadding,
    paddingBottom: vs(10),
  },
  toolBtn: {
    width: layout.touchTargetLg,
    height: layout.touchTargetLg,
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    height: layout.touchTargetLg,
    borderRadius: ms(14),
    paddingHorizontal: hs(14),
    borderWidth: 1,
    ...Shadow.soft,
  },
  searchInput: { flex: 1, fontSize: font.body, padding: 0 },
  notifDot: {
    position: 'absolute',
    top: vs(10),
    right: hs(10),
    width: layout.dot,
    height: layout.dot,
    borderRadius: layout.dot / 2,
    backgroundColor: Colors.danger,
    borderWidth: 2,
    borderColor: '#fff',
  },
  scroll: { paddingBottom: vs(36), flexGrow: 1 },
  quickActionSection: {
    paddingHorizontal: pagePadding,
    marginTop: vs(4),
    marginBottom: vs(18),
  },
  quickActionHead: {
    marginBottom: vs(10),
  },
  quickActionTitle: {
    fontSize: font.subhead,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  quickActionSub: {
    fontSize: font.caption,
    fontWeight: '500',
    marginTop: vs(2),
  },
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(10),
  },
  quickActionCard: {
    width: '48%',
    minHeight: vs(82),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: spacing.sm + 2,
  },
  quickActionIcon: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(13),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: vs(10),
  },
  quickActionCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: hs(24),
  },
  quickActionLabel: {
    fontSize: font.caption,
    fontWeight: '800',
  },
  quickActionCaption: {
    fontSize: font.micro,
    fontWeight: '600',
    marginTop: vs(3),
  },
  quickActionArrow: {
    position: 'absolute',
    right: hs(10),
    top: vs(12),
    width: hs(24),
    height: hs(24),
    borderRadius: hs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniPlayer: {
    position: 'absolute',
    left: pagePadding,
    right: pagePadding,
    bottom: vs(10),
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: hs(12),
    paddingVertical: vs(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    ...Shadow.soft,
  },
  miniInfo: { flex: 1, minWidth: 0 },
  miniTitle: { fontSize: font.caption, fontWeight: '800' },
  miniSub: { fontSize: font.micro, marginTop: vs(1), fontWeight: '500' },
  miniRight: { flexDirection: 'row', alignItems: 'center', gap: hs(8) },
  miniPct: { fontSize: font.micro, fontWeight: '700' },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: pagePadding,
    marginBottom: vs(12),
  },
  sectionTitle: { fontSize: font.subhead, fontWeight: '800', letterSpacing: -0.3 },
  sectionSub: { fontSize: font.caption, marginTop: vs(2), fontWeight: '500' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: hs(4) },
  seeAll: { fontSize: font.caption, fontWeight: '700', color: Colors.primary },
  courseRow: { paddingHorizontal: pagePadding, gap: hs(14), paddingBottom: vs(16) },
  courseCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  courseThumbWrap: { position: 'relative' },
  courseThumb: { height: vs(108), width: '100%' },
  courseProgressOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: vs(4),
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  courseProgressFill: { height: '100%', backgroundColor: Brand.blue400 },
  courseBody: { padding: spacing.md },
  courseName: { fontSize: font.body, fontWeight: '800', lineHeight: vs(20), minHeight: vs(40) },
  courseTeacher: { fontSize: font.tiny, marginTop: vs(4), fontWeight: '500' },
  courseMeta: { flexDirection: 'row', alignItems: 'center', gap: hs(4), marginTop: vs(10) },
  courseMetaText: { fontSize: font.micro, fontWeight: '600' },
  emptyCard: {
    marginHorizontal: pagePadding,
    padding: spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    gap: vs(8),
    marginBottom: vs(20),
    borderWidth: 1,
  },
  emptyTitle: { fontSize: font.body, fontWeight: '800' },
  emptySub: { fontSize: font.caption },
});

export default DashboardScreen;
=======
import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { student, assignments, announcements } from '../data/school-data';

export function DashboardScreen({ theme }: { theme: { background: string; surface: string; text: string; subtext: string; primary: string; primarySoft: string; border: string; accent: string } }) {

const todayClasses = [
  { subject: 'Mathematics', time: '08:00', room: 'Room 12', color: '#f59e0b', icon: '✏️' },
  { subject: 'English', time: '09:00', room: 'Room 08', color: '#8b5cf6', icon: '📖' },
  { subject: 'Science', time: '10:30', room: 'Lab 2', color: '#10b981', icon: '🧪' },
];

  const pending = assignments.filter((a) => a.status === 'pending').slice(0, 2);
  const latestNews = announcements.slice(0, 2);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
        <View style={styles.heroGlow} />
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>School Student Portal</Text>
            <Text style={[styles.heroTitle, { color: '#ffffff' }]}>Hello, {student.name}</Text>
            <Text style={[styles.heroSubtitle, { color: '#e0f2fe' }]}>{student.className} • {student.school}</Text>
          </View>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{student.avatarInitials}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>94%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Today's classes</Text>
          <Text style={styles.cardBadge}>Live</Text>
        </View>
        {todayClasses.map((item) => (
          <View key={item.subject} style={styles.classRow}>
            <View style={[styles.subjectBadge, { backgroundColor: item.color }]}>
              <Text style={styles.subjectBadgeText}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.classTitle}>{item.subject}</Text>
              <Text style={styles.classMeta}>{item.time} • {item.room}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Urgent assignments</Text>
          <Text style={styles.cardLink}>View all</Text>
        </View>
        {pending.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listMeta}>{item.subject}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Announcements</Text>
          <Text style={styles.cardLink}>New</Text>
        </View>
        {latestNews.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listMeta}>{item.time}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Open full portal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8ff',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  heroGlow: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fbbf24',
    opacity: 0.2,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eyebrow: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#dbeafe',
    fontSize: 13,
    marginTop: 2,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statChip: {
    flex: 1,
    backgroundColor: '#ffffff16',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: '#dbeafe',
    fontSize: 11,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#94a3b8',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardBadge: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  cardLink: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subjectBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectBadgeText: {
    fontSize: 16,
  },
  classTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  classMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  listItem: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  listMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
>>>>>>> 17e1994 (bhagyasree changes)
