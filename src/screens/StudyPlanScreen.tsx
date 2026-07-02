import React, { useCallback, useState } from 'react';

import {

  View,

  Text,

  StyleSheet,

  ScrollView,

  TouchableOpacity,

  ActivityIndicator,

  RefreshControl,

  Alert,

} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from '../components/Icon';

import StudyPlanHero, { StudyPlanTab } from '../components/studyplan/StudyPlanHero';

import StudyPlanCoursePicker from '../components/studyplan/StudyPlanCoursePicker';

import StudyPlanSectionDivider from '../components/studyplan/StudyPlanSectionDivider';

import StudyPlanTodayTab from '../components/studyplan/StudyPlanTodayTab';

import StudyPlanBacklogsTab from '../components/studyplan/StudyPlanBacklogsTab';

import StudyPlanWeakTab from '../components/studyplan/StudyPlanWeakTab';

import StudyPlanRevisionTab from '../components/studyplan/StudyPlanRevisionTab';
import StudyPlanRoadmapTab from '../components/studyplan/StudyPlanRoadmapTab';


import { BorderRadius } from '../constants/theme';

import { useTheme } from '../context/ThemeContext';

import { useApi } from '../hooks/useApi';

import { studyPlanService } from '../services/studyplan.service';

import type { BacklogCategory } from '../types/studyPlan';
import { mapStudyPlanCourses } from '../utils/studyPlanAdapters';
import { asArray } from '../utils/apiData';

import { hs, ms, spacing, type as t, vs } from '../utils/responsive';



type Props = { navigation: any };



const StudyPlanScreen: React.FC<Props> = ({ navigation }) => {

  const insets = useSafeAreaInsets();

  const { theme } = useTheme();
  const c = theme.colors;



  const [pickedCourseId, setPickedCourseId] = useState<string | null>(null);

  const [tab, setTab] = useState<StudyPlanTab>('today');

  const [generating, setGenerating] = useState(false);

  const [refreshing, setRefreshing] = useState(false);



  const { data: courses, loading: coursesLoading } = useApi(

    () => studyPlanService.getCourses(),

    [],

  );

  const courseList = React.useMemo(() => mapStudyPlanCourses(courses), [courses]);

  const activeCourseId = pickedCourseId || courseList[0]?.courseId || courseList[0]?.id;



  const { data: hubMeta, refetch: refetchHub } = useApi(

    () => (activeCourseId ? studyPlanService.getHubMeta(activeCourseId) : Promise.resolve({ data: null })),

    [activeCourseId],

  );

  const hub = (hubMeta as any) || {};



  const { data: todayData, loading: todayLoading, refetch: refetchToday } = useApi(

    () => (activeCourseId ? studyPlanService.getToday(activeCourseId) : Promise.resolve({ data: { items: [] } })),

    [activeCourseId],

  );

  const { data: nextAction, refetch: refetchNext } = useApi(

    () =>

      activeCourseId

        ? studyPlanService.getNextAction(activeCourseId)

        : Promise.resolve({ data: null }),

    [activeCourseId],

  );

  const { data: backlogData, loading: backlogLoading, refetch: refetchBacklogs } = useApi(

    () =>

      activeCourseId

        ? studyPlanService.getBacklogs(activeCourseId)

        : Promise.resolve({ data: { categories: [] } }),

    [activeCourseId],

  );

  const { data: weakData, loading: weakLoading, refetch: refetchWeak } = useApi(

    () =>

      activeCourseId

        ? studyPlanService.getWeakAreas(activeCourseId)

        : Promise.resolve({ data: { areas: [] } }),

    [activeCourseId],

  );

  const { data: revisionData, loading: revisionLoading, refetch: refetchRevision } = useApi(

    () =>

      activeCourseId

        ? studyPlanService.getRevision(activeCourseId)

        : Promise.resolve({ data: { cards: [] } }),

    [activeCourseId],

  );

  const { data: roadmapData, loading: roadmapLoading, refetch: refetchRoadmap } = useApi(
    () =>
      activeCourseId
        ? studyPlanService.getRoadmap(activeCourseId)
        : (Promise.resolve({ data: { progress: {}, subjects: [] } }) as Promise<any>),
    [activeCourseId],
  );

  const today = (todayData as { items?: unknown[]; hasPlan?: boolean }) || {};
  const items: any[] = today.items ?? asArray(todayData, ['items', 'planItems']);
  const todayHasPlan = Boolean(today.hasPlan);

  const categories: BacklogCategory[] = asArray(backlogData, ['categories']);

  const weakAreas = asArray(weakData, ['areas']);

  const revisionCards = asArray(revisionData, ['cards']);

  const showCoursePicker =

    !coursesLoading && courseList.length > 0 && pickedCourseId === null && courseList.length > 1;



  const examType = hub.examType || 'JEE';



  const onRefresh = useCallback(async () => {

    setRefreshing(true);

    await Promise.all([

      refetchHub(),

      refetchToday(),

      refetchNext(),

      refetchBacklogs(),

      refetchWeak(),

      refetchRevision(),
      refetchRoadmap(),

    ]);

    setRefreshing(false);

  }, [refetchHub, refetchToday, refetchNext, refetchBacklogs, refetchWeak, refetchRevision, refetchRoadmap]);



  const handleGenerate = async () => {

    if (!activeCourseId) return;

    setGenerating(true);

    try {

      const batch = courseList.find(co => co.courseId === activeCourseId);
      
      const rawExam = String(batch?.examType || hub.examType || 'JEE');
      const mappedExam = rawExam.toLowerCase().includes('neet') ? 'neet' 
        : rawExam.toLowerCase().includes('foundation') ? 'foundation' 
        : rawExam.toLowerCase().includes('advanced') ? 'jee_advanced' : 'jee_mains';
        
      const rawClass = String(hub.currentClass || 'Class 12');
      const mappedClass = rawClass.toLowerCase().includes('dropper') ? 'dropper' 
        : rawClass.match(/\d+/)?.[0] ?? '12';

      await studyPlanService.generate({
        batchId: activeCourseId,
        targetExam: mappedExam,
        examYear: String(batch?.examYear || hub.examYear || '2025'),
        currentClass: mappedClass,
        dailyStudyHours: Number(hub.dailyHours || batch?.dailyHours || 4),
      });

      refetchHub();

      refetchToday();

      refetchNext();

    } catch (err: any) {

      Alert.alert('Error', err?.message || 'Could not generate plan');

    } finally {

      setGenerating(false);

    }

  };



  const handleComplete = async (itemId: string) => {

    await studyPlanService.completeItem(itemId);

    refetchToday();

    refetchNext();

  };



  const handleSkip = async (itemId: string) => {

    await studyPlanService.skipItem(itemId);

    refetchToday();

  };

  const openStudyPlanItem = (item: any) => {
    if (!activeCourseId) return;
    const type = String(item.type || '').toLowerCase();
    const topicId = item.topicId ? String(item.topicId) : undefined;
    const lectureId = item.lectureId ? String(item.lectureId) : undefined;
    const title = String(item.title || item.topicName || 'Study task');

    if ((type === 'lecture' || type === 'video') && lectureId) {
      navigation.navigate('LiveClass', {
        lectureId,
        topicId,
        batchId: activeCourseId,
        title,
      });
      return;
    }

    if (type === 'pyq') {
      navigation.navigate('PracticePYQ', { topicId });
      return;
    }

    if (type === 'quiz' || type === 'practice' || type === 'dpp' || type === 'mock' || item.testId) {
      navigation.navigate('ExamEngine', {
        testId: String(item.testId || item.id),
        topicId,
        title,
        mode: 'mock',
      });
      return;
    }

    navigation.navigate('AIStudyRoom', { topicId, title });
  };



  const handleRevisionCard = async (cardId: string) => {

    if (!activeCourseId) return;

    if (cardId === 'spaced') {

      try {

        const { data } = await studyPlanService.getSpacedRevision(activeCourseId);

        const topics = asArray(data, ['topics', 'items', 'dueTopics']);

        const first = topics[0] as Record<string, unknown> | undefined;

        const topicId = first?.topicId || first?.id;

        if (!topicId) {

          Alert.alert('No topics due', 'No spaced revision topics are due right now.');

          return;

        }

        const { data: session } = await studyPlanService.startRevisionSession({
          topicId: String(topicId),
          accuracy: 0,
          intervalDays: 1,
        });

        const sessionId = String(

          (session as Record<string, unknown>)?.sessionId ??

            (session as Record<string, unknown>)?.id ??

            '',

        );

        if (sessionId) {

          navigation.navigate('ExamEngine', {

            testId: sessionId,

            sessionId,

            topicId: String(topicId),

            title: String(first?.topicName || first?.name || 'Spaced revision'),

            mode: 'mock',

          });

        } else {

          Alert.alert('Revision started', 'Your spaced revision session is ready.');

          refetchRevision();

        }

      } catch (err: any) {

        Alert.alert('Error', err?.message || 'Could not start revision session');

      }

      return;

    }

    if (cardId === 'intensive') {
      navigation.navigate('IntensiveRevision', { courseId: activeCourseId });
      return;
    }

    if (cardId === 'notes' || cardId === 'revision-notes' || cardId === 'ai-notes') {
      navigation.navigate('RevisionNotes', { courseId: activeCourseId });
      return;
    }

    navigation.navigate('RevisionNotes', { courseId: activeCourseId });

  };



  const openBacklogCategory = (cat: BacklogCategory) => {
    if (!activeCourseId) return;
    navigation.navigate('StudyPlanBacklogDetail', {
      courseId: activeCourseId,
      categoryId: cat.id,
      title: cat.title,
    });
  };



  const openWeakArea = (area: { id: string; title: string; count: number }) => {

    if (!activeCourseId) return;

    navigation.navigate('StudyPlanWeakDetail', {

      courseId: activeCourseId,

      areaId: area.id,

      title: area.title,

    });

  };



  const renderTab = () => {

    switch (tab) {

      case 'backlogs':

        return (

          <StudyPlanBacklogsTab

            colors={c}

            categories={categories}

            loading={backlogLoading}

            onCategoryPress={openBacklogCategory}

          />

        );

      case 'weak':

        return (

          <StudyPlanWeakTab

            colors={c}

            areas={weakAreas}

            loading={weakLoading}

            onAreaPress={openWeakArea}

          />

        );

      case 'revision':

        return (

          <StudyPlanRevisionTab
            colors={c}
            cards={revisionCards}
            loading={revisionLoading}
            onCardPress={handleRevisionCard}
          />

        );

      case 'roadmap': {
        const roadmap = (roadmapData as any) || {};
        return (
          <StudyPlanRoadmapTab
            colors={c}
            progress={
              roadmap.progress || {
                percent: 0,
                completed: 0,
                ongoing: 0,
                todo: 0,
                accuracy: 0,
              }
            }
            subjects={roadmap.subjects || []}
            examType={examType}
            examYear={hub.examYear || activeCourse?.examYear || ''}
            dailyHours={hub.dailyHours || activeCourse?.dailyHours || 4}
            daysLeft={hub.daysLeft || activeCourse?.daysLeft || 0}
            loading={roadmapLoading}
            onGoToday={() => setTab('today')}
            onManagePlan={() =>
              navigation.navigate('StudyPlanManage', { courseId: activeCourseId, examType })
            }
          />
        );
      }

      default:

        return (

          <StudyPlanTodayTab

            colors={c}

            examType={examType}

            items={items}

            nextAction={nextAction}

            hasPlan={hub.hasPlan || todayHasPlan}

            loading={todayLoading}

            generating={generating}

            onGenerate={handleGenerate}

            onComplete={handleComplete}

            onSkip={handleSkip}

            onStart={openStudyPlanItem}

            onManagePlan={() =>

              navigation.navigate('StudyPlanManage', { courseId: activeCourseId, examType })

            }

          />

        );

    }

  };



  if (coursesLoading) {

    return (

      <View style={[styles.centered, { paddingTop: insets.top, backgroundColor: c.background }]}>

        <ActivityIndicator color={c.primary} size="large" />

      </View>

    );

  }



  if (courseList.length === 0) {

    return (

      <View style={[styles.centered, { paddingTop: insets.top, backgroundColor: c.background }]}>

        <Icon name="book" size={40} color={c.textMuted} solid />

        <Text style={[styles.emptyTitle, { color: c.text }]}>No enrolled courses</Text>

        <Text style={[styles.emptySub, { color: c.textMuted }]}>

          Enroll in a batch from Learn tab, then return here.

        </Text>

        <TouchableOpacity

          style={[styles.enrollBtn, { backgroundColor: c.primary }]}

          onPress={() => navigation.navigate('Learn')}

        >

          <Text style={styles.enrollBtnText}>Go to My Courses</Text>

        </TouchableOpacity>

      </View>

    );

  }



  if (showCoursePicker) {

    return (

      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>

        <StudyPlanCoursePicker

          courses={courseList}

          colors={c}

          onSelect={id => setPickedCourseId(id)}

        />

      </View>

    );

  }



  const activeCourse =

    courseList.find((co: any) => (co.courseId || co.id) === activeCourseId) || courseList[0];



  return (

    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>

      <View style={[styles.topBar, { borderBottomColor: c.border }]}>

        <TouchableOpacity

          onPress={() => {

            if (courseList.length > 1) setPickedCourseId(null);

          }}

          style={styles.topBarLeft}

        >

          {courseList.length > 1 ? (

            <Icon name="arrow-left" size={18} color={c.text} solid />

          ) : null}

          <Text style={[styles.topTitle, { color: c.text }]} numberOfLines={1}>

            {activeCourse?.courseName || 'Study Plan'}

          </Text>

        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>

          <Icon name="calendar" size={20} color={c.textMuted} solid />

        </TouchableOpacity>

      </View>



      <StudyPlanHero
        tab={tab}
        backlogCount={hub.backlogCount ?? categories.filter(x => x.pending > 0).length}
        onTabChange={setTab}
      />



      <View style={[styles.quickRow, { backgroundColor: c.background }]}>

        <TouchableOpacity

          style={[styles.quickBtn, { backgroundColor: c.card, borderColor: c.border }]}

          onPress={() => navigation.navigate('StudyPlanInsights', { courseId: activeCourseId })}

        >

          <Icon name="robot" size={ms(16)} color={c.primary} solid />

          <Text style={[styles.quickText, { color: c.text }]}>AI Insights</Text>

        </TouchableOpacity>

        <TouchableOpacity

          style={[styles.quickBtn, { backgroundColor: c.card, borderColor: c.border }]}

          onPress={() =>

            navigation.navigate('StudyPlanManage', { courseId: activeCourseId, examType })

          }

        >

          <Icon name="cog" size={ms(16)} color={c.textMuted} solid />

          <Text style={[styles.quickText, { color: c.text }]}>Manage Plan</Text>

        </TouchableOpacity>

      </View>



      <ScrollView

        style={styles.mainScroll}

        showsVerticalScrollIndicator={false}

        refreshControl={

          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />

        }

        contentContainerStyle={styles.scroll}

      >

        <StudyPlanSectionDivider colors={c} />

        {renderTab()}

      </ScrollView>

    </View>

  );

};



const styles = StyleSheet.create({

  container: { flex: 1 },

  mainScroll: { flex: 1 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },

  emptyTitle: { ...t.subheadBold, marginTop: vs(16) },

  emptySub: { ...t.body, textAlign: 'center', marginTop: vs(8), lineHeight: vs(24) },

  enrollBtn: {

    marginTop: vs(20),

    paddingHorizontal: hs(24),

    paddingVertical: vs(14),

    borderRadius: BorderRadius.lg,

  },

  enrollBtnText: { ...t.bodyBold, color: '#fff' },

  topBar: {

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingHorizontal: spacing.md,

    paddingVertical: vs(10),

    borderBottomWidth: 1,

  },

  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: hs(8), flex: 1 },

  topTitle: { ...t.bodyBold, flex: 1 },

  quickRow: {

    flexDirection: 'row',

    gap: hs(10),

    paddingHorizontal: spacing.md,

    paddingVertical: vs(10),

  },

  quickBtn: {

    flex: 1,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: hs(8),

    paddingVertical: vs(12),

    borderRadius: BorderRadius.lg,

    borderWidth: 1,

  },

  quickText: { ...t.captionBold },

  scroll: { paddingHorizontal: spacing.md, paddingBottom: vs(48) },

});



export default StudyPlanScreen;

