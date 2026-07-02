import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from './Icon';
import HomeGreeting from './HomeGreeting';
import { Brand } from '../constants/brand';
import CatalogCourseCard from './CatalogCourseCard';
import FeaturedProgramsRow from './FeaturedProgramsRow';
import ExploreCategoriesGrid from './ExploreCategoriesGrid';
import DashboardLiveClassesSection from './DashboardLiveClassesSection';
import DemoPaymentModal from './DemoPaymentModal';
import { navigateRoot } from '../navigation/navigationRef';
import GoalPreferenceModal from './GoalPreferenceModal';
import { Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useOnboarding } from '../context/OnboardingContext';
import {
  DEFAULT_PREFERENCE_ID,
  ExamPreferenceId,
  GOAL_PREF_STORAGE_KEY,
  getPreferenceById,
} from '../constants/examPreferences';
import { useDemoPurchase } from '../hooks/useDemoPurchase';
import { useNotificationUnread } from '../hooks/useNotificationUnread';
import { batchMatchesExam } from '../utils/courseMappers';
import type { LiveClassEvent } from '../utils/liveClassEvents';
import { font, hs, ms, pagePadding, spacing, textFamily, vs } from '../utils/responsive';

type Props = {
  navigation: any;
  courses: any[];
  loading: boolean;
  onRefresh: () => void;
  liveClasses?: LiveClassEvent[];
  liveClassesLoading?: boolean;
};

function matchesExam(course: any, examFilter: 'JEE' | 'NEET' | 'ALL'): boolean {
  return batchMatchesExam(course, examFilter);
}

const VALID_PREF_IDS: ExamPreferenceId[] = [
  'dropper_jee',
  'dropper_neet',
  'class12_jee',
  'class12_neet',
];

/**
 * Home for new students (no enrolled courses).
 * Goal preference drives which programs we show after first login.
 */
const PwBatchesHome: React.FC<Props> = ({
  navigation,
  courses,
  loading,
  onRefresh,
  liveClasses = [],
  liveClassesLoading = false,
}) => {
  const { theme } = useTheme();
  const { onboardingDone } = useOnboarding();
  const { unread: notifUnread } = useNotificationUnread();
  const c = theme.colors;
  const [search, setSearch] = useState('');
  const [preferenceId, setPreferenceId] = useState<ExamPreferenceId>(DEFAULT_PREFERENCE_ID);
  const [goalModal, setGoalModal] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);
  const preference = getPreferenceById(preferenceId);

  useEffect(() => {
    AsyncStorage.getItem(GOAL_PREF_STORAGE_KEY).then(saved => {
      if (saved && VALID_PREF_IDS.includes(saved as ExamPreferenceId)) {
        setPreferenceId(saved as ExamPreferenceId);
      } else if (!onboardingDone) {
        // First-time home visit before onboarding wizard saved a goal
        setGoalModal(true);
      }
      setPrefsReady(true);
    });
  }, [onboardingDone]);

  const setPreference = useCallback((id: ExamPreferenceId) => {
    setPreferenceId(id);
    AsyncStorage.setItem(GOAL_PREF_STORAGE_KEY, id).catch(() => {});
  }, []);

  const {
    paymentVisible,
    paymentBatch,
    closePayment,
    onPaymentSuccess,
  } = useDemoPurchase(onRefresh);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter(batch => {
      if (!matchesExam(batch, preference.examFilter)) return false;
      if (!q) return true;
      const name = (batch.batchName || batch.name || '').toLowerCase();
      const institute = (batch.instituteName || '').toLowerCase();
      return name.includes(q) || institute.includes(q) || (batch.examType || batch.examTarget || '').toLowerCase().includes(q);
    });
  }, [courses, search, preference.examFilter]);

  const openCourse = useCallback(
    (course: any) => {
      navigation.navigate('CourseDetail', {
        batchId: course.batchId || course.id,
      });
    },
    [navigation],
  );

  if (!prefsReady) {
    return (
      <View style={[styles.wrap, styles.centered, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { backgroundColor: c.background }]}>
      <View style={[styles.headerBar, { backgroundColor: c.background }]}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={[styles.menuBtn, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => navigateRoot('AccountHub')}
            activeOpacity={0.8}
          >
            <Icon name="user-circle" size={ms(18)} color={c.text} solid />
          </TouchableOpacity>
          <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border }]}>
            <Icon name="search" size={ms(15)} color={c.textMuted} solid />
            <TextInput
              style={[styles.searchInput, { color: c.text }, textFamily.regular]}
              placeholder="Search courses or institutes"
              placeholderTextColor={c.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => navigateRoot('Notifications')}
            activeOpacity={0.85}
          >
            <Icon name="bell" size={ms(18)} color={c.text} solid />
            {notifUnread > 0 ? <View style={styles.notifDot} /> : null}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={c.primary} />
        }
      >
        <HomeGreeting navigation={navigation} />

        <DashboardLiveClassesSection
          events={liveClasses}
          loading={liveClassesLoading}
          navigation={navigation}
        />

        <TouchableOpacity
          style={[styles.goalBanner, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
          onPress={() => setGoalModal(true)}
          activeOpacity={0.9}
        >
          <View style={[styles.goalIconSquare, { backgroundColor: c.primary }]}>
            <Icon
              name={preference.examFilter === 'NEET' ? 'dna' : 'atom'}
              size={ms(18)}
              color="#fff"
              solid
            />
          </View>
          <View style={styles.goalTextBlock}>
            <Text style={[styles.goalLabel, { color: c.textMuted }, textFamily.medium]}>
              Your exam goal
            </Text>
            <Text style={[styles.goalText, { color: c.text }, textFamily.bold]} numberOfLines={1}>
              {preference.label}
            </Text>
            <Text style={[styles.goalSub, { color: c.textMuted }, textFamily.regular]} numberOfLines={1}>
              {preference.subtitle}
            </Text>
          </View>
          <View style={styles.goalChangeRow}>
            <Text style={[styles.goalChange, { color: c.primary }, textFamily.semibold]}>Change</Text>
            <Icon name="chevron-right" size={ms(12)} color={c.primary} solid />
          </View>
        </TouchableOpacity>

        <FeaturedProgramsRow
          navigation={navigation}
          title="Video Courses"
          subtitle="Watch previews and explore flagship batches"
        />

        <View style={styles.listHead}>
          <Text style={[styles.listTitle, { color: c.text }, textFamily.bold]}>
            {filtered.length} {filtered.length === 1 ? 'Program' : 'Programs'} for you
          </Text>
          <Text style={[styles.listHint, { color: c.textMuted }, textFamily.regular]}>
            {preference.examFilter} batches · all institutes
          </Text>
        </View>

        {loading && filtered.length === 0 ? (
          <ActivityIndicator color={c.primary} style={styles.loader} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <Icon name="book-open" size={ms(36)} color={c.border} solid />
            <Text style={[styles.empty, { color: c.text }, textFamily.semibold]}>
              No programs for this goal yet
            </Text>
            <Text style={[styles.emptyHint, { color: c.textMuted }]}>
              Tap your goal above to try JEE or NEET
            </Text>
            <TouchableOpacity onPress={() => setGoalModal(true)} style={styles.emptyBtn}>
              <Text style={[styles.emptyBtnText, { color: c.primary }, textFamily.bold]}>
                Change goal
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.programList}>
            {filtered.map((course, i) => (
              <CatalogCourseCard
                key={course.batchId || course.id || String(i)}
                course={course}
                featured={i === 0}
                onPress={() => openCourse(course)}
              />
            ))}
          </View>
        )}

        <ExploreCategoriesGrid navigation={navigation} title="Explore by category" />
      </ScrollView>

      <GoalPreferenceModal
        visible={goalModal}
        selectedId={preferenceId}
        onSelect={setPreference}
        onClose={() => setGoalModal(false)}
      />

      <DemoPaymentModal
        visible={paymentVisible}
        batch={paymentBatch}
        onClose={closePayment}
        onSuccess={onPaymentSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  headerBar: { paddingTop: vs(6), paddingBottom: vs(4) },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: vs(48) },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    paddingHorizontal: pagePadding,
    paddingBottom: vs(10),
  },
  menuBtn: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  notifBtn: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  notifDot: {
    position: 'absolute',
    top: vs(8),
    right: hs(8),
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  pageIntro: {
    paddingHorizontal: pagePadding,
    marginBottom: vs(14),
    marginTop: vs(4),
  },
  headerTitle: { fontSize: font.title, letterSpacing: -0.4, fontWeight: '800' },
  headerSub: { fontSize: font.caption, marginTop: vs(4), lineHeight: vs(18) },
  goalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    marginHorizontal: spacing.md,
    marginBottom: vs(14),
    paddingHorizontal: spacing.md,
    paddingVertical: vs(14),
    borderRadius: ms(16),
    borderWidth: 1,
  },
  goalIconSquare: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  goalTextBlock: { flex: 1, minWidth: 0 },
  goalLabel: { fontSize: font.micro, textTransform: 'uppercase', letterSpacing: 0.5 },
  goalText: { fontSize: font.subhead, marginTop: vs(2) },
  goalSub: { fontSize: font.tiny, marginTop: vs(2) },
  goalChangeRow: { flexDirection: 'row', alignItems: 'center', gap: hs(4), flexShrink: 0 },
  goalChange: { fontSize: font.caption },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    height: hs(46),
    borderRadius: ms(14),
    paddingHorizontal: hs(14),
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: font.body, padding: 0 },
  listHead: {
    paddingHorizontal: spacing.md,
    marginBottom: vs(12),
  },
  listTitle: { fontSize: font.subhead },
  listHint: { fontSize: font.caption, marginTop: vs(4) },
  programList: { gap: vs(16) },
  loader: { marginTop: vs(40) },
  emptyBox: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: vs(10),
    marginTop: vs(16),
  },
  empty: { fontSize: font.subhead },
  emptyHint: { fontSize: font.caption, textAlign: 'center' },
  emptyBtn: { marginTop: vs(8), padding: vs(8) },
  emptyBtnText: { fontSize: font.body },
});

export default PwBatchesHome;
