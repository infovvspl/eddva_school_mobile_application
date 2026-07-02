import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import IconBadge from '../components/IconBadge';
import SubjectTopicTree from '../components/SubjectTopicTree';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import CourseCoverImage from '../components/CourseCoverImage';
import CoursePriceTag from '../components/CoursePriceTag';
import DemoPaymentModal from '../components/DemoPaymentModal';
import { useDemo } from '../context/DemoContext';
import { useApi } from '../hooks/useApi';
import { useDemoPurchase } from '../hooks/useDemoPurchase';
import { studentService } from '../services/student.service';
import { formatInr } from '../utils/courseImages';
import {
  getBatchTitle,
  curriculumToSubjectGroups,
  coursePayloadForCurriculum,
} from '../utils/courseMappers';
import { buildCurriculum } from '../utils/buildCurriculum';
import {
  font,
  hs,
  layout,
  ms,
  pagePadding,
  safeTopInset,
  spacing,
  vs,
} from '../utils/responsive';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDetail'>;
type Tab = 'courseView' | 'about' | 'lessons' | 'syllabus' | 'chat';

const CourseDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const { batchId } = route.params;
  const [tab, setTab] = useState<Tab>('lessons');

  const { version } = useDemo();
  const { data, loading, refetch } = useApi(
    () => studentService.fetchCourse(batchId),
    [batchId, version],
  );

  const course = useMemo(() => coursePayloadForCurriculum(data), [data]);
  const isEnrolled = !!course?.isEnrolled;
  const curriculum = course?.curriculum || [];

  const { subjects: curriculumSubjects, counts } = useMemo(
    () =>
      buildCurriculum({
        curriculum,
        subjects: course?.subjects,
        topics: course?.topics,
      }),
    [course, curriculum],
  );

  const subjectGroups = useMemo(() => {
    if (curriculum.length > 0) {
      return curriculumToSubjectGroups(curriculum);
    }
    return curriculumSubjects.map(s => ({
      id: s.id,
      displayName: s.name,
      topics: s.chapters.flatMap(ch =>
        ch.topics.map(t => ({
          id: t.id,
          name: t.name,
          topicName: t.name,
          durationMinutes: t.durationMinutes,
        })),
      ),
    }));
  }, [curriculum, curriculumSubjects]);

  const title = getBatchTitle(course);
  const rating = course?.rating || 4.5;
  const students = course?.studentCount || 0;
  const lessonCount =
    counts.lectures ||
    curriculumSubjects.reduce((n, s) => n + s.totalTopics, 0) ||
    subjectGroups.reduce((n, s) => n + s.topics.length, 0);

  const {
    paymentVisible,
    paymentBatch,
    startPurchase,
    closePayment,
    onPaymentSuccess,
  } = useDemoPurchase(refetch);

  const handlePurchase = () => {
    if (!course) return;
    startPurchase({ ...course, batchId });
  };

  const openTopic = (
    topic: { id: string; name?: string; topicName?: string; title?: string },
    subjectName: string,
  ) => {
    const label = topic.name || topic.topicName || topic.title || 'Lesson';
    navigation.navigate('LiveClass', {
      lectureId: topic.id,
      topicId: topic.id,
      title: `${subjectName} · ${label}`,
      teacherName: course?.teacherName,
      batchId,
    });
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: safeTopInset(insets.top), backgroundColor: c.background },
      ]}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.iconBtn, { backgroundColor: c.surface }]}
        >
          <Icon name="arrow-left" size={18} color={c.text} solid />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: c.surface }]}
          onPress={() => navigation.navigate('Main', { screen: 'Help' })}
        >
          <IconBadge name="robot" color={c.primary} size="sm" variant="soft" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={c.primary}
          />
        }
      >
        {loading && !course ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: 48 }} />
        ) : (
          <>
            <CourseCoverImage course={course} style={styles.heroImage} />
            <Text style={[styles.title, { color: c.text }]}>{title}</Text>
            <View style={styles.priceRow}>
              <CoursePriceTag
                price={course?.price ?? 0}
                originalPrice={course?.originalPrice}
                isPaid={course?.isPaid}
              />
            </View>
            {course?.instituteName ? (
              <View
                style={[
                  styles.institutePill,
                  { backgroundColor: `${c.primary}14`, borderColor: c.border },
                ]}
              >
                <Icon name="university" size={12} color={c.primary} solid />
                <Text style={[styles.institutePillText, { color: c.primary }]}>
                  {course.instituteName}
                </Text>
              </View>
            ) : null}
            <View style={styles.ratingRow}>
              <Icon name="star" size={14} color="#FBBF24" solid />
              <Text style={[styles.ratingText, { color: c.text }]}>
                {rating}
              </Text>
              <Text style={[styles.statDot, { color: c.textMuted }]}>·</Text>
              <Text style={[styles.statText, { color: c.textMuted }]}>
                {students} Students
              </Text>
              <Text style={[styles.statDot, { color: c.textMuted }]}>·</Text>
              <Text style={[styles.statText, { color: c.textMuted }]}>
                {lessonCount} Topics
              </Text>
            </View>

            <Text style={[styles.desc, { color: c.textSecondary }]}>
              {course?.description ||
                'Master concepts with structured lessons, practice questions, and AI-powered doubt support from EDDVA faculty.'}
            </Text>

            <View
              style={[
                styles.instructor,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <View
                style={[
                  styles.instructorAvatar,
                  { backgroundColor: `${c.primary}22` },
                ]}
              >
                <Text style={[styles.instructorInitial, { color: c.primary }]}>
                  {(course?.teacherName || 'E')[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.instructorName, { color: c.text }]}>
                  {course?.teacherName || 'EDDVA Teacher'}
                </Text>
                <Text style={[styles.instructorRole, { color: c.textMuted }]}>
                  Subject Teacher
                </Text>
              </View>
            </View>

            <View style={[styles.tabs, { borderBottomColor: c.border }]}>
              {(
                [
                  ['courseView', 'Course View'],
                  ['about', 'About'],
                  ['lessons', 'Subjects & Topics'],
                  ['syllabus', 'Syllabus'],
                  ['chat', 'Chat'],
                ] as [Tab, string][]
              ).map(([t, label]) => (
                <TouchableOpacity
                  key={t}
                  style={styles.tabItem}
                  onPress={() => setTab(t)}
                >
                  <Text
                    style={[
                      styles.tabText,
                      { color: c.textMuted },
                      tab === t && { color: c.primary, fontWeight: '800' },
                    ]}
                  >
                    {label}
                  </Text>
                  {tab === t && (
                    <View
                      style={[styles.tabDot, { backgroundColor: c.primary }]}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {tab === 'courseView' && (
              <View style={styles.courseViewBlock}>
                <Text style={[styles.courseViewTitle, { color: c.text }]}>About this course</Text>
                <Text style={[styles.courseViewDesc, { color: c.textSecondary }]}> 
                  {course?.description ||
                    'Master concepts with structured lessons, practice questions, and AI-powered doubt support from EDDVA faculty.'}
                </Text>

                <View style={styles.courseViewMeta}>
                  {course?.examType ? (
                    <View style={[styles.metaPill, { backgroundColor: `${c.primary}10`, borderColor: c.border }]}>
                      <Text style={[styles.metaPillText, { color: c.primary, fontWeight: '800' }]}>Exam</Text>
                      <Text style={[styles.metaPillText, { color: c.text, marginLeft: 6 }]}> {course.examType}</Text>
                    </View>
                  ) : null}

                  <View style={[styles.metaPill, { backgroundColor: `${c.primary}10`, borderColor: c.border }]}>
                    <Text style={[styles.metaPillText, { color: c.primary, fontWeight: '800' }]}>Mode</Text>
                    <Text style={[styles.metaPillText, { color: c.text, marginLeft: 6 }]}> {course?.mode ? course.mode : 'Online'}</Text>
                  </View>
                </View>

                <View style={styles.courseViewTeacher}>
                  <View style={[styles.instructorAvatar, { backgroundColor: `${c.primary}22` }]}>
                    <Text style={[styles.instructorInitial, { color: c.primary }]}>
                      {(course?.teacherName || 'E')[0]}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.instructorName, { color: c.text }]}>
                      {course?.teacherName || 'EDDVA Teacher'}
                    </Text>
                    <Text style={[styles.instructorRole, { color: c.textMuted }]}>
                      Subject Teacher
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {tab === 'about' && (
              <View style={styles.aboutBlock}>
                {subjectGroups.map((s, i) => (
                  <View
                    key={s.id}
                    style={[
                      styles.aboutRow,
                      { backgroundColor: c.card, borderColor: c.border },
                    ]}
                  >
                    <IconBadge
                      name="check-circle"
                      color={c.success}
                      size="sm"
                      variant="soft"
                    />
                    <Text style={[styles.aboutText, { color: c.text }]}>
                      {s.displayName} · {s.topics.length} topics
                    </Text>
                  </View>
                ))}
                {course?.examType ? (
                  <Text style={[styles.examTag, { color: c.primary }]}>
                    Exam: {course.examType}
                  </Text>
                ) : null}
              </View>
            )}

            {tab === 'lessons' && (
              <View>
                {!isEnrolled ? (
                  <View
                    style={[
                      styles.lockBanner,
                      {
                        backgroundColor: c.chipActiveBg,
                        borderColor: c.border,
                      },
                    ]}
                  >
                    <IconBadge
                      name="lock"
                      color={c.primary}
                      size="md"
                      variant="soft"
                    />
                    <Text style={[styles.lockText, { color: c.text }]}>
                      {course?.isPaid
                        ? `Purchase (${formatInr(
                            course?.price ?? 0,
                          )}) to unlock all subjects & topics.`
                        : 'Enroll for free to unlock all subjects & topics.'}
                    </Text>
                  </View>
                ) : null}
                <SubjectTopicTree
                  subjects={subjectGroups}
                  colors={c}
                  isEnrolled={isEnrolled}
                  onTopicPress={openTopic}
                  onLockedPress={handlePurchase}
                />
              </View>
            )}

            {tab === 'syllabus' && (
              <View style={styles.syllabusBlock}>
                <Text style={[styles.syllabusTitle, { color: c.text }]}>Syllabus</Text>
                <Text style={[styles.syllabusSub, { color: c.textMuted }]}>
                  Explore curriculum topics and resources for this course.
                </Text>

                <View style={[styles.syllabusStatsRow, { borderColor: c.border }]}>
                  <View style={[styles.syllabusStatPill, { backgroundColor: `${c.primary}10` }]}>

                    <Text style={[styles.syllabusStatVal, { color: c.text }]}>
                      {lessonCount}
                    </Text>
                    <Text style={[styles.syllabusStatLbl, { color: c.textMuted }]}>
                      Topics
                    </Text>
                  </View>
                  <View style={[styles.syllabusStatPill, { backgroundColor: `${c.primary}10` }]}>
                    <Text style={[styles.syllabusStatVal, { color: c.text }]}>
                      {course?.mode ? course.mode : 'Online'}
                    </Text>
                    <Text style={[styles.syllabusStatLbl, { color: c.textMuted }]}>
                      Mode
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.syllabusBtn, { backgroundColor: c.primary }]}
                  activeOpacity={0.9}
                  onPress={() =>
                    navigation.navigate('CourseCurriculum', {
                      batchId,
                      initialTab: 'curriculum',
                    })
                  }
                >
                  <Icon name="book-open" size={ms(16)} color="#fff" solid />
                  <Text style={styles.syllabusBtnText}>Open Curriculum</Text>
                </TouchableOpacity>

                <View style={styles.syllabusHint}>
                  <Text style={[styles.syllabusHintText, { color: c.textMuted }]}>Tip: Use the tabs in Curriculum to jump to Lectures, DPP, PYQ, Notes, and more.</Text>
                </View>
              </View>
            )}

            {tab === 'chat' && (
              <View style={styles.chatPlaceholder}>
                <IconBadge
                  name="comments"
                  color={c.primary}
                  size="lg"
                  variant="soft"
                />
                <Text
                  style={[styles.chatPlaceholderText, { color: c.textMuted }]}
                >
                  Batch discussion opens in class chat
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Main', { screen: 'Help' })
                  }
                >
                  <Text style={[styles.chatLink, { color: c.primary }]}>
                    Ask AI Guru instead →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 12,
            backgroundColor: c.background,
            borderTopColor: c.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.ctaBtn,
            { backgroundColor: c.primary },
            !isEnrolled && course?.isPaid && { backgroundColor: c.accent },
          ]}
          activeOpacity={0.9}
          onPress={() => {
            if (isEnrolled)
              navigation.navigate('Main', { screen: 'StudyPlan' });
            else handlePurchase();
          }}
        >
          <Text style={styles.ctaText}>
            {isEnrolled
              ? 'Continue Learning'
              : course?.isPaid
              ? `Pay ${formatInr(course?.price ?? 0)}`
              : 'Enroll Free'}
          </Text>
        </TouchableOpacity>
      </View>

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
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: pagePadding,
    paddingVertical: vs(8),
  },
  iconBtn: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: ms(22),
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  scroll: { paddingHorizontal: pagePadding, paddingBottom: vs(100) },
  heroImage: {
    width: '100%',
    height: vs(180),
    borderRadius: BorderRadius.xl,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: font.headline,
    fontWeight: '800',
    marginBottom: spacing.sm,
    lineHeight: ms(30),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(10),
  },
  offer: { fontSize: font.tiny, fontWeight: '700' },
  institutePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: vs(6),
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: ms(10),
    borderWidth: 1,
    marginBottom: vs(10),
  },
  institutePillText: { fontSize: font.caption, fontWeight: '700' },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vs(6),
    marginBottom: vs(14),
  },
  ratingText: { fontSize: font.subhead, fontWeight: '700' },
  statDot: {},
  statText: { fontSize: font.caption, fontWeight: '600' },
  desc: { fontSize: font.subhead, lineHeight: ms(22), marginBottom: vs(20) },

  courseViewBlock: { gap: spacing.sm },
  courseViewTitle: { fontSize: font.subhead, fontWeight: '800', marginBottom: spacing.sm },
  courseViewDesc: { fontSize: font.subhead, lineHeight: ms(22), marginBottom: vs(16) },
  courseViewMeta: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: ms(10),
    borderWidth: 1,
  },
  metaPillText: { fontSize: font.caption, fontWeight: '700' },
  courseViewTeacher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: vs(10),
  },
  instructor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: vs(14),
    borderRadius: BorderRadius.xl,
    marginBottom: vs(20),
    borderWidth: 1,
    ...Shadow.soft,
  },
  instructorAvatar: {
    width: layout.avatarMd,
    height: layout.avatarMd,
    borderRadius: ms(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructorInitial: { fontSize: font.title, fontWeight: '800' },
  instructorName: { fontSize: font.subhead, fontWeight: '700' },
  instructorRole: { fontSize: font.caption },
  tabs: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    paddingBottom: vs(8),
  },
  tabItem: { alignItems: 'center' },
  tabText: { fontSize: font.subhead, fontWeight: '600' },
  tabDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    marginTop: vs(6),
  },
  aboutBlock: { gap: spacing.sm },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: ms(12),
    borderWidth: 1,
  },
  syllabusBlock: {
    gap: spacing.sm,
    paddingVertical: vs(6),
  },


  aboutText: { fontSize: font.subhead, fontWeight: '600', flex: 1 },
  examTag: { fontSize: font.caption, fontWeight: '700', marginTop: spacing.sm },
  lockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: vs(14),
    borderRadius: BorderRadius.lg,
    marginBottom: vs(14),
    borderWidth: 1,
  },
  lockText: {
    flex: 1,
    fontSize: font.caption,
    fontWeight: '600',
    lineHeight: ms(18),
  },
  chatPlaceholder: {
    alignItems: 'center',
    paddingVertical: vs(32),
    gap: spacing.md,
  },
  chatPlaceholderText: { fontSize: font.subhead, textAlign: 'center' },
  chatLink: { fontSize: font.subhead, fontWeight: '700' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: pagePadding,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  ctaBtn: {
    height: vs(56),
    borderRadius: ms(28),
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.glow,
  },
  ctaText: { fontSize: font.title, fontWeight: '800', color: '#fff' },
});

export default CourseDetailScreen;
