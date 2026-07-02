import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/Icon';
import {
  FaqList,
  StudyResourceList,
} from '../components/learning/StudyResourceList';
import { Brand } from '../constants/brand';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { studentService } from '../services/student.service';
import { assessmentService } from '../services/assessment.service';
import { buildCurriculum } from '../utils/buildCurriculum';
import { coursePayloadForCurriculum } from '../utils/courseMappers';
import { toPercent } from '../utils/progress';
import { getTopicResourceBundle } from '../utils/topicResources';
import { mapPyqOverviewToStudyResources } from '../utils/assessmentMappers';
import { font, hs, ms, safeTopInset, spacing, vs } from '../utils/responsive';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'TopicDetail'>;

type ResourceTab = 'dpp' | 'pyq' | 'material' | 'mindmaps' | 'faq' | 'about';

const TopicDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { batchId, topicId, topicName, subjectName, courseName, initialTab } =
    route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const [tab, setTab] = useState<ResourceTab>(initialTab || 'dpp');

  const { data: course } = useApi(
    () => studentService.fetchCourse(batchId),
    [batchId],
  );
  const { data: topicDetail } = useApi(
    () => studentService.fetchTopicDetail(batchId, topicId),
    [batchId, topicId],
  );
  const { data: pyqOverview } = useApi(
    () => assessmentService.getTopicPyqOverview(topicId),
    [topicId],
  );

  const bundle = useMemo(() => {
    const payload = coursePayloadForCurriculum(course);
    const { subjects } = buildCurriculum({
      curriculum: payload?.curriculum,
      subjects: payload?.subjects,
      topics: payload?.topics,
    });
    return getTopicResourceBundle(subjects, topicId);
  }, [course, topicId]);

  const apiPyqItems = useMemo(
    () =>
      mapPyqOverviewToStudyResources(pyqOverview, {
        topicId,
        topicName,
        subjectName: subjectName || bundle.subjectName,
        chapterName: bundle.chapterName,
      }),
    [
      pyqOverview,
      topicId,
      topicName,
      subjectName,
      bundle.chapterName,
      bundle.subjectName,
    ],
  );

  const pyqItems = apiPyqItems.length > 0 ? apiPyqItems : bundle.pyq;

  const tabs: { key: ResourceTab; label: string; count: number }[] = [
    { key: 'dpp', label: 'DPP', count: bundle.dpp.length },
    { key: 'pyq', label: 'PYQ', count: pyqItems.length },
    { key: 'material', label: 'Study Material', count: bundle.notes.length },
    { key: 'mindmaps', label: 'Mindmaps', count: bundle.mindmaps.length },
    { key: 'faq', label: 'FAQ', count: bundle.faq.length },
    { key: 'about', label: 'About', count: 0 },
  ];

  const tabItems = useMemo(() => {
    switch (tab) {
      case 'dpp':
        return bundle.dpp;
      case 'pyq':
        return pyqItems;
      case 'material':
        return bundle.notes;
      case 'mindmaps':
        return bundle.mindmaps;
      default:
        return [];
    }
  }, [tab, bundle]);

  const openVideo = () => {
    const lectures = Array.isArray((topicDetail as any)?.lectures)
      ? (topicDetail as any).lectures
      : [];
    const firstLecture = lectures[0];
    navigation.navigate('LiveClass', {
      lectureId: firstLecture?.id || topicId,
      topicId,
      title: firstLecture?.title || topicName,
      batchId,
    });
  };

  const openPractice = (testId: string, title: string, isPyq = false) => {
    navigation.navigate('ExamEngine', {
      testId,
      title,
      topicId: isPyq ? topicId : undefined,
      mode: isPyq ? 'pyq' : 'mock',
    });
  };

  const td = topicDetail as any;
  const progressPct = toPercent(td?.progress ?? td?.progressPercent);
  const watchedLectures = Number(
    td?.watchedLectures ?? td?.completedLectures ?? 0,
  );
  const totalLectures = Number(
    td?.totalLectures ?? td?.lectureCount ?? (bundle.lectures.length || 1),
  );
  const duration = bundle.topic?.durationMinutes ?? 90;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: safeTopInset(insets.top), backgroundColor: c.background },
      ]}
    >
      <View style={styles.breadcrumb}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backLink, { color: c.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.crumb, { color: c.textMuted }]} numberOfLines={1}>
          My Courses › {subjectName} › {topicName}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Brand.blue900, Brand.blue700, '#1e3a8a']}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.heroTag}>{subjectName?.toUpperCase()}</Text>
          <Text style={styles.heroTitle}>{topicName}</Text>
          <Text style={styles.heroSub}>
            {watchedLectures} of {totalLectures} lectures completed
          </Text>
          <View style={styles.heroProgress}>
            <View style={styles.heroTrack}>
              <View style={[styles.heroFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.heroPct}>{progressPct}%</Text>
          </View>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={openVideo}
            activeOpacity={0.9}
          >
            <Icon name="play" size={ms(12)} color={Brand.blue900} solid />
            <Text style={styles.heroBtnText}>Start Learning</Text>
            <Icon
              name="chevron-right"
              size={ms(10)}
              color={Brand.blue900}
              solid
            />
          </TouchableOpacity>
          <View style={styles.statsRow}>
            {[
              {
                icon: 'video',
                label: `${bundle.lectures.length || 1} LECTURES`,
              },
              { icon: 'book', label: `${bundle.totalResources} RESOURCES` },
              { icon: 'clock', label: `${duration}m STUDY` },
              { icon: 'bolt', label: '70% GATE' },
            ].map(s => (
              <View key={s.label} style={styles.statBox}>
                <Icon
                  name={s.icon}
                  size={ms(14)}
                  color="rgba(255,255,255,0.9)"
                  solid
                />
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.sectionRow}>
          <Icon name="video" size={ms(14)} color={c.text} solid />
          <Text style={[styles.sectionTitle, { color: c.text }]}>Lectures</Text>
        </View>
        {bundle.lectures.length > 0 ? (
          bundle.lectures.map(lec => (
            <TouchableOpacity
              key={lec.id}
              style={[
                styles.lectureCard,
                { backgroundColor: c.card, borderColor: c.border },
                Shadow.soft,
              ]}
              onPress={openVideo}
            >
              <View
                style={[
                  styles.lectureThumb,
                  { backgroundColor: `${c.primary}22` },
                ]}
              >
                <Icon name="play" size={ms(20)} color={c.primary} solid />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.lectureTitle, { color: c.text }]}>
                  {lec.title}
                </Text>
                <Text style={[styles.lectureMeta, { color: c.textMuted }]}>
                  Not started
                </Text>
              </View>
              <View style={[styles.playCircle, { backgroundColor: c.primary }]}>
                <Icon name="play" size={ms(10)} color="#fff" solid />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <TouchableOpacity
            style={[
              styles.lectureCard,
              { backgroundColor: c.card, borderColor: c.border },
              Shadow.soft,
            ]}
            onPress={openVideo}
          >
            <View
              style={[
                styles.lectureThumb,
                { backgroundColor: `${c.primary}22` },
              ]}
            >
              <Icon name="play" size={ms(20)} color={c.primary} solid />
            </View>
            <View style={styles.flex}>
              <Text style={[styles.lectureTitle, { color: c.text }]}>
                {topicName}
              </Text>
              <Text style={[styles.lectureMeta, { color: c.textMuted }]}>
                Not started
              </Text>
            </View>
            <View style={[styles.playCircle, { backgroundColor: c.primary }]}>
              <Icon name="play" size={ms(10)} color="#fff" solid />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.tabBarHost}>
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
            {tabs.map(t => (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.resTab,
                  tab === t.key && {
                    borderBottomColor: c.primary,
                    borderBottomWidth: 3,
                  },
                ]}
                onPress={() => setTab(t.key)}
              >
                <Text
                  style={[
                    styles.resTabText,
                    { color: tab === t.key ? c.primary : c.textMuted },
                  ]}
                >
                  {t.label}
                  {t.count > 0 ? ` (${t.count})` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {tab === 'faq' ? (
          <FaqList items={bundle.faq} colors={c} />
        ) : tab === 'about' ? (
          <View
            style={[
              styles.aboutCard,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Text style={[styles.aboutTitle, { color: c.text }]}>
              About {topicName}
            </Text>
            <Text style={[styles.aboutBody, { color: c.textMuted }]}>
              Chapter: {bundle.chapterName || '—'}
              {'\n'}
              Subject: {subjectName || bundle.subjectName}
              {'\n'}
              Course: {courseName || '—'}
              {'\n\n'}
              This topic includes {bundle.dpp.length} DPP sheet(s),{' '}
              {pyqItems.length} PYQ set(s), {bundle.notes.length} note PDF(s),
              and {bundle.mindmaps.length} mindmap(s).
            </Text>
          </View>
        ) : (
          <StudyResourceList
            items={tabItems}
            colors={c}
            onOpen={item => {
              if (item.kind === 'dpp' || item.kind === 'notes') {
                navigation.navigate('StudySheet', { resource: item });
              } else if (item.kind === 'pyq') {
                openPractice(item.id, item.title, true);
              } else {
                Alert.alert('Open', item.title);
              }
            }}
            onDownload={() =>
              Alert.alert(
                'Download started',
                'Saved to your device for offline study.',
              )
            }
            emptyLabel={`No ${
              tabs.find(t => t.key === tab)?.label
            } for this topic yet.`}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  breadcrumb: { paddingHorizontal: spacing.md, paddingBottom: vs(8) },
  backLink: { fontSize: font.caption, fontWeight: '700', marginBottom: vs(4) },
  crumb: { fontSize: font.tiny, fontWeight: '600' },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: vs(32) },
  hero: {
    borderRadius: BorderRadius.xl,
    padding: spacing.md,
    marginBottom: vs(20),
    overflow: 'hidden',
  },
  heroTag: {
    fontSize: font.micro,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: font.title + 4,
    fontWeight: '900',
    color: '#fff',
    marginTop: vs(4),
  },
  heroSub: {
    fontSize: font.caption,
    color: 'rgba(255,255,255,0.85)',
    marginTop: vs(6),
  },
  heroProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    marginTop: vs(12),
  },
  heroTrack: {
    flex: 1,
    height: vs(6),
    borderRadius: ms(3),
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  heroFill: { height: '100%', backgroundColor: Brand.blue400 },
  heroPct: { color: '#fff', fontWeight: '800', fontSize: font.caption },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: hs(8),
    backgroundColor: '#fff',
    paddingHorizontal: hs(16),
    paddingVertical: vs(10),
    borderRadius: ms(24),
    marginTop: vs(14),
  },
  heroBtnText: {
    color: Brand.blue900,
    fontWeight: '800',
    fontSize: font.caption,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(8),
    marginTop: vs(16),
  },
  statBox: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: ms(12),
    padding: vs(10),
    gap: vs(4),
  },
  statLabel: {
    fontSize: font.micro,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    marginBottom: vs(10),
  },
  sectionTitle: { fontSize: font.body, fontWeight: '800' },
  lectureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: ms(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: vs(10),
  },
  lectureThumb: {
    width: hs(56),
    height: hs(56),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  lectureTitle: { fontSize: font.caption, fontWeight: '800' },
  lectureMeta: { fontSize: font.tiny, marginTop: vs(2) },
  playCircle: {
    width: hs(32),
    height: hs(32),
    borderRadius: hs(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarHost: { flexGrow: 0, height: vs(40), marginBottom: vs(12) },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(16),
    paddingVertical: vs(4),
  },
  resTab: { paddingBottom: vs(8) },
  resTabText: { fontSize: font.caption, fontWeight: '700' },
  aboutCard: {
    padding: ms(16),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  aboutTitle: {
    fontSize: font.subhead,
    fontWeight: '800',
    marginBottom: vs(8),
  },
  aboutBody: { fontSize: font.caption, lineHeight: ms(22) },
});

export default TopicDetailScreen;
