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
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/Icon';
import CurriculumAccordion from '../components/learning/CurriculumAccordion';
import {
  FaqList,
  StudyResourceList,
} from '../components/learning/StudyResourceList';
import { Brand } from '../constants/brand';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { studentService } from '../services/student.service';
import { buildCurriculum } from '../utils/buildCurriculum';
import {
  coursePayloadForCurriculum,
  getBatchTitle,
} from '../utils/courseMappers';
import {
  buildResourceBuckets,
  resourcesForCurriculumTab,
  type CurriculumTabKey,
  type StudyResource,
} from '../utils/topicResources';
import { font, hs, ms, safeTopInset, spacing, vs } from '../utils/responsive';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseCurriculum'>;

const TABS: {
  key: CurriculumTabKey;
  label: string;
  icon: string;
  countKey?: keyof ReturnType<typeof buildCurriculum>['counts'];
}[] = [
  { key: 'curriculum', label: 'Curriculum', icon: 'list' },
  { key: 'lectures', label: 'Lectures', icon: 'video', countKey: 'lectures' },
  { key: 'dpp', label: 'DPP', icon: 'clipboard-list', countKey: 'dpp' },
  { key: 'pyq', label: 'PYQ', icon: 'trophy', countKey: 'pyq' },
  { key: 'notes', label: 'Notes', icon: 'file-alt', countKey: 'notes' },
  {
    key: 'mindmaps',
    label: 'Mindmaps',
    icon: 'project-diagram',
    countKey: 'mindmaps',
  },
  {
    key: 'mock',
    label: 'Mock Tests',
    icon: 'clipboard-check',
    countKey: 'mockTests',
  },
  { key: 'faq', label: 'FAQ', icon: 'question-circle' },
];

const CourseCurriculumScreen: React.FC<Props> = ({ navigation, route }) => {
  const { batchId, initialTab } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const [tab, setTab] = useState<CurriculumTabKey>(initialTab || 'curriculum');
  const [search, setSearch] = useState('');

  const { data, loading, refetch } = useApi(
    () => studentService.fetchCourse(batchId),
    [batchId],
  );

  const course = useMemo(() => coursePayloadForCurriculum(data), [data]);
  const title = getBatchTitle(course);

  const { subjects, counts } = useMemo(() => {
    const built = buildCurriculum({
      curriculum: course?.curriculum,
      subjects: course?.subjects,
      topics: course?.topics,
    });
    const q = search.trim().toLowerCase();
    if (!q || tab !== 'curriculum') return built;
    const filteredSubjects = built.subjects
      .map(s => ({
        ...s,
        chapters: s.chapters
          .map(ch => ({
            ...ch,
            topics: ch.topics.filter(
              t =>
                t.name.toLowerCase().includes(q) ||
                ch.name.toLowerCase().includes(q) ||
                s.name.toLowerCase().includes(q),
            ),
          }))
          .filter(
            ch => ch.topics.length > 0 || ch.name.toLowerCase().includes(q),
          ),
      }))
      .filter(
        s =>
          s.chapters.some(ch => ch.topics.length > 0) ||
          s.name.toLowerCase().includes(q),
      );
    return { ...built, subjects: filteredSubjects };
  }, [course, search, tab]);

  const buckets = useMemo(() => {
    try {
      return buildResourceBuckets(subjects);
    } catch {
      return buildResourceBuckets([]);
    }
  }, [subjects]);

  const tabResources = useMemo(() => {
    if (tab === 'faq') return [];
    const raw = resourcesForCurriculumTab(buckets, tab) as StudyResource[];
    const q = search.trim().toLowerCase();
    let list = Array.isArray(raw) ? raw : [];
    if (q) {
      list = list.filter(
        r =>
          r.title.toLowerCase().includes(q) ||
          r.topicName.toLowerCase().includes(q) ||
          r.subjectName.toLowerCase().includes(q),
      );
    }
    return list;
  }, [buckets, tab, search]);

  const firstTopic = subjects[0]?.chapters[0]?.topics[0];

  const openTopic = (
    topicId: string,
    topicName: string,
    subjectName: string,
  ) => {
    navigation.navigate('TopicDetail', {
      batchId,
      topicId,
      topicName,
      subjectName,
      courseName: title,
    });
  };

  const playTopic = (
    topicId: string,
    topicName: string,
    lectureId?: string,
  ) => {
    navigation.navigate('LiveClass', {
      lectureId: lectureId || topicId,
      topicId,
      title: topicName,
      teacherName: course?.teacherName || course?.teacher?.name,
      batchId,
    });
  };

  const openResource = (item: StudyResource) => {
    if (item.kind === 'lecture') {
      const lectureRouteId = item.id.startsWith('lecture-')
        ? undefined
        : item.id;
      playTopic(item.topicId, item.topicName, lectureRouteId);
      return;
    }
    if (item.kind === 'dpp' || item.kind === 'notes') {
      navigation.navigate('StudySheet', { resource: item });
      return;
    }
    if (item.kind === 'mock') {
      navigation.navigate('ExamEngine', { testId: item.id, title: item.title });
      return;
    }
    const topicTab =
      item.kind === 'dpp'
        ? 'dpp'
        : item.kind === 'pyq'
        ? 'pyq'
        : item.kind === 'notes'
        ? 'material'
        : item.kind === 'mindmap'
        ? 'mindmaps'
        : 'about';
    if (item.topicId) {
      navigation.navigate('TopicDetail', {
        batchId,
        topicId: item.topicId,
        topicName: item.topicName,
        subjectName: item.subjectName,
        courseName: title,
        initialTab: topicTab,
      });
    }
  };

  const startLearning = () => {
    if (firstTopic) playTopic(firstTopic.id, firstTopic.name);
  };

  const showSearch = tab === 'curriculum' || (tab !== 'faq' && tab !== 'mock');

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
          style={[styles.backBtn, { backgroundColor: c.chipBg }]}
        >
          <Icon name="arrow-left" size={ms(16)} color={c.text} solid />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: c.text }]} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity
          onPress={startLearning}
          activeOpacity={0.9}
          disabled={!firstTopic}
        >
          <LinearGradient
            colors={[...Brand.gradient]}
            style={[styles.startBtn, !firstTopic && { opacity: 0.5 }]}
          >
            <Icon name="play" size={ms(11)} color="#fff" solid />
            <Text style={styles.startText}>Start</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBarHost}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map(t => {
            const count =
              t.key === 'faq'
                ? buckets.faq.length
                : t.countKey
                ? counts[t.countKey]
                : undefined;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: tab === t.key ? `${c.primary}18` : c.card,
                    borderColor: tab === t.key ? c.primary : c.border,
                  },
                ]}
                onPress={() => setTab(t.key)}
              >
                <Icon
                  name={t.icon}
                  size={ms(11)}
                  color={tab === t.key ? c.primary : c.textMuted}
                  solid
                />
                <Text
                  style={[
                    styles.tabChipText,
                    { color: tab === t.key ? c.primary : c.text },
                  ]}
                  numberOfLines={1}
                >
                  {t.label}
                  {count != null ? ` (${count})` : ''}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {showSearch ? (
        <View
          style={[
            styles.searchBar,
            { backgroundColor: c.card, borderColor: c.border },
          ]}
        >
          <Icon name="search" size={ms(14)} color={c.textMuted} solid />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder={
              tab === 'curriculum'
                ? 'Search topics, chapters...'
                : `Search ${TABS.find(x => x.key === tab)?.label}...`
            }
            placeholderTextColor={c.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      ) : null}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={c.primary}
          />
        }
      >
        {loading && !course?.id ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: vs(32) }} />
        ) : tab === 'curriculum' ? (
          subjects.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="book-open" size={ms(36)} color={c.textMuted} solid />
              <Text style={[styles.emptyTitle, { color: c.text }]}>
                No curriculum yet
              </Text>
              <Text style={[styles.emptySub, { color: c.textMuted }]}>
                Topics will appear here once your institute publishes the
                syllabus.
              </Text>
            </View>
          ) : (
            <CurriculumAccordion
              subjects={subjects}
              colors={c}
              onTopicPress={openTopic}
              onTopicPlay={playTopic}
            />
          )
        ) : tab === 'faq' ? (
          <FaqList items={buckets.faq} colors={c} />
        ) : (
          <StudyResourceList
            items={tabResources as StudyResource[]}
            colors={c}
            onOpen={openResource}
            onDownload={() =>
              Alert.alert(
                'Download started',
                'File will be available in Saved shortly.',
              )
            }
            emptyLabel={`No ${
              TABS.find(t => t.key === tab)?.label
            } yet for this course.`}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    paddingHorizontal: spacing.md,
    paddingBottom: vs(10),
  },
  backBtn: {
    width: hs(40),
    height: hs(40),
    borderRadius: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { flex: 1, fontSize: font.subhead, fontWeight: '800' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    paddingHorizontal: hs(14),
    paddingVertical: vs(9),
    borderRadius: ms(20),
    ...Shadow.soft,
  },
  startText: { color: '#fff', fontSize: font.caption, fontWeight: '800' },
  tabBarHost: {
    flexGrow: 0,
    height: vs(46),
    marginBottom: vs(4),
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: hs(8),
    paddingVertical: vs(4),
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    flexShrink: 0,
    gap: hs(6),
    paddingHorizontal: hs(12),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    borderWidth: 1,
  },
  tabChipText: { fontSize: font.tiny, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    marginHorizontal: spacing.md,
    marginBottom: vs(12),
    paddingHorizontal: hs(14),
    height: vs(44),
    borderRadius: ms(22),
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: font.caption, padding: 0 },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: vs(32) },
  empty: { alignItems: 'center', paddingVertical: vs(48), gap: vs(8) },
  emptyTitle: { fontSize: font.subhead, fontWeight: '800' },
  emptySub: { fontSize: font.caption, textAlign: 'center', lineHeight: ms(22) },
});

export default CourseCurriculumScreen;
