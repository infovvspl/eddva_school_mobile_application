import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { CheckCircle2, Circle, PlayCircle, BookOpen, Clock, FileText, Brain, Trophy, Zap, ChevronRight, Check, AlertCircle, RefreshCw, TrendingDown, Target, HelpCircle, Map, Trash2 } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

const TYPE_CFG: Record<string, any> = {
  lecture: { icon: PlayCircle, color: '#3B82F6', bg: '#EFF6FF', border: '#DBEAFE' },
  practice: { icon: Zap, color: '#7C3AED', bg: '#F5F3FF', border: '#EDE9FE' },
  revision: { icon: BookOpen, color: '#D97706', bg: '#FFFBEB', border: '#FEF3C7' },
  mock_test: { icon: Trophy, color: '#DC2626', bg: '#FEF2F2', border: '#FEE2E2' },
  battle: { icon: Zap, color: '#EA580C', bg: '#FFF7ED', border: '#FFEDD5' },
  doubt_session: { icon: Brain, color: '#0D9488', bg: '#F0FDFA', border: '#CCFBF1' },
};

const TABS = ['Today', 'Backlogs', 'Weak Topics', 'Revision', 'Roadmap'];

export function StudyPlanScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [activeTab, setActiveTab] = useState('Today');
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [plan, setPlan] = useState<any>(null);
  const [backlogs, setBacklogs] = useState<any>(null);
  const [weakTopics, setWeakTopics] = useState<any>(null);
  const [revision, setRevision] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Today' && !plan) {
        const data = await schoolApi.getToday();
        setPlan(data && data.items ? data : null);
      } else if (activeTab === 'Backlogs' && !backlogs) {
        setBacklogs(await schoolApi.getBacklogs());
      } else if (activeTab === 'Weak Topics' && !weakTopics) {
        setWeakTopics(await schoolApi.getStudyPlanWeakTopics());
      } else if (activeTab === 'Revision' && !revision) {
        setRevision(await schoolApi.getRevision());
      } else if (activeTab === 'Roadmap' && !roadmap) {
        setRoadmap(await schoolApi.getRoadmap().catch(() => []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(async () => {
      try {
        await schoolApi.generate({});
        const data = await schoolApi.getToday();
        setPlan(data && data.items ? data : null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    }, 3000);
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      await schoolApi.regenerateStudyPlan();
      const data = await schoolApi.getToday();
      setPlan(data && data.items ? data : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    Alert.alert('Clear Study Plan', 'Are you sure you want to clear your current study plan?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        try {
          await schoolApi.clearStudyPlan();
          setPlan(null);
        } catch (err) {
          console.error(err);
        }
      }}
    ]);
  };

  const handleComplete = async (id: string) => {
    try {
      await schoolApi.completeItem(id);
      const data = await schoolApi.getToday();
      setPlan(data && data.items ? data : null);
    } catch (err) { console.error(err); }
  };

  const handleSkip = async (id: string) => {
    try {
      await schoolApi.skipItem(id);
      const data = await schoolApi.getToday();
      setPlan(data && data.items ? data : null);
    } catch (err) { console.error(err); }
  };

  // ----- RENDER TODAY -----
  const renderToday = () => {
    if (!plan) {
      return (
        <View style={styles.emptyCard}>
          <Brain size={ms(48)} color={theme.subtext} style={{ marginBottom: vs(16) }} />
          <Text style={styles.emptyTitle}>No Plan Generated</Text>
          <Text style={styles.emptyText}>Create a personalized study plan to optimize your learning today.</Text>
          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate}>
            <Text style={styles.generateBtnText}>Generate Plan</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{plan?.stats?.completion || 0}%</Text>
            <Text style={styles.statLbl}>Completion</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{plan?.stats?.estTime || 0}m</Text>
            <Text style={styles.statLbl}>Est. Time</Text>
          </View>
          <TouchableOpacity style={styles.revisionBtn} onPress={() => { const next = plan?.items?.find((i: any) => !i.completed) ?? plan?.items?.[0]; onNavigate('aiStudy', { topicId: next?.topicId || next?.topic?.id, title: next?.title || next?.topic?.name }); }}>
            <PlayCircle size={ms(16)} color={theme.surface} style={{ marginRight: hs(6) }} />
            <Text style={styles.revisionBtnText}>Start Revision</Text>
          </TouchableOpacity>
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: vs(16)}}>
          <Text style={[styles.sectionTitle, {marginBottom: 0}]}>Today's Roadmap</Text>
          <View style={{flexDirection: 'row', gap: hs(16), alignItems: 'center'}}>
            <TouchableOpacity onPress={handleRegenerate} style={{padding: ms(4)}}><RefreshCw size={ms(18)} color={theme.subtext} /></TouchableOpacity>
            <TouchableOpacity onPress={handleClear} style={{padding: ms(4)}}><Trash2 size={ms(18)} color="#EF4444" /></TouchableOpacity>
          </View>
        </View>
        <View style={styles.roadmapContainer}>
          {plan?.items?.map((item: any, idx: number) => {
            const isDone = item.status === 'completed';
            const isSkip = item.status === 'skipped';
            const t = TYPE_CFG[item.type] || TYPE_CFG.lecture;
            const Icon = t.icon;
            const isLast = idx === plan.items.length - 1;

            return (
              <View key={item.id || idx} style={styles.roadmapItem}>
                <View style={styles.timelineCol}>
                  {!isLast && <View style={[styles.timelineLine, { backgroundColor: isDone ? '#10B981' : theme.border }]} />}
                  <View style={[styles.timelineDot, { backgroundColor: isDone ? '#10B981' : theme.border, borderColor: isDone ? '#059669' : theme.border }]}>
                    {isDone && <Check size={ms(10)} color={theme.surface} />}
                  </View>
                </View>

                <View style={[styles.taskCard, isDone ? styles.taskCardDone : {}]}>
                  <View style={styles.taskCardHeader}>
                    <View style={[styles.typeIconBox, { backgroundColor: isDone ? '#ECFDF5' : t.bg, borderColor: isDone ? '#D1FAE5' : t.border }]}>
                      {isDone ? <CheckCircle2 size={ms(16)} color="#10B981" /> : <Icon size={ms(16)} color={t.color} />}
                    </View>
                    <View style={styles.taskCardTitleBox}>
                      <Text style={[styles.taskTitle, isDone && styles.textDone]}>{item.title}</Text>
                      <View style={styles.taskMetaRow}>
                        {item.xpReward && !isDone && (
                          <View style={styles.xpBadge}><Text style={styles.xpBadgeText}>+{item.xpReward}XP</Text></View>
                        )}
                        <Clock size={ms(12)} color={theme.subtext} />
                        <Text style={styles.taskMetaText}>{item.estimatedMinutes || 30}m</Text>
                      </View>
                    </View>
                  </View>

                  {item.content && (
                    <View style={styles.taskContentPills}>
                      {item.content.subjectName && (
                        <View style={styles.subjectPill}><Text style={styles.subjectPillText}>{item.content.subjectName}</Text></View>
                      )}
                      {item.content.topicName && (
                        <Text style={styles.topicText}>{item.content.topicName}</Text>
                      )}
                    </View>
                  )}

                  {!isDone && !isSkip && (
                    <View style={styles.taskActions}>
                      <TouchableOpacity 
                        style={styles.actionBtnText} 
                        onPress={() => onNavigate(item.type === 'practice' ? 'aiQuiz' : 'aiStudy')}
                      >
                        <Text style={styles.actionBtnTextLabel}>Open</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtnText} onPress={() => handleSkip(item.id)}>
                        <Text style={styles.actionBtnTextLabel}>Skip</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtnSolid} onPress={() => handleComplete(item.id)}>
                        <Text style={styles.actionBtnSolidText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // ----- GRID CARD HELPER -----
  const renderGridCard = (icon: any, title: string, count: number, label: string, color: string, bg: string, targetScreen?: string) => (
    <TouchableOpacity 
      style={styles.gridCard}
      activeOpacity={0.8}
      onPress={() => targetScreen ? onNavigate(targetScreen) : Alert.alert('Coming Soon', `${title} will be available soon!`)}
    >
      <View style={[styles.gridIconBox, { backgroundColor: bg }]}>
        {icon}
      </View>
      <Text style={styles.gridTitle}>{title}</Text>
      <View style={styles.gridFooter}>
        <Text style={[styles.gridCount, { color }]}>{count}</Text>
        <Text style={styles.gridLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  // ----- RENDER BACKLOGS -----
  const renderBacklogs = () => {
    if (!backlogs) return null;
    return (
      <View>
        <Text style={styles.sectionTitle}>Backlogs</Text>
        <Text style={styles.sectionSub}>Clear your missed work and pending lectures.</Text>
        <View style={styles.gridContainer}>
          {renderGridCard(<AlertCircle size={ms(20)} color="#EF4444" />, "Missed Tasks", backlogs.missedTasks, "items pending", "#EF4444", "#FEF2F2", "assignments")}
          {renderGridCard(<PlayCircle size={ms(20)} color={theme.primary} />, "Video Lectures", backlogs.videoLectures, "items pending", "#3B82F6", "#EFF6FF", "recordedClasses")}
          {renderGridCard(<BookOpen size={ms(20)} color="#10B981" />, "Notes", backlogs.notes, "items pending", "#10B981", "#ECFDF5", "aiStudy")}
          {renderGridCard(<Brain size={ms(20)} color="#8B5CF6" />, "Mindmaps", backlogs.mindmaps, "items pending", "#8B5CF6", "#F5F3FF", "aiStudy")}
          {renderGridCard(<Zap size={ms(20)} color="#F59E0B" />, "PYQs Pending", backlogs.pyqs, "items pending", "#F59E0B", "#FFFBEB", "pyq")}
          {renderGridCard(<FileText size={ms(20)} color="#6366F1" />, "DPPs & PDFs", backlogs.dpps, "items pending", "#6366F1", "#DBEAFE", "aiStudy")}
        </View>
      </View>
    );
  };

  // ----- RENDER WEAK TOPICS -----
  const renderWeakTopics = () => {
    if (!weakTopics) return null;
    return (
      <View>
        <Text style={styles.sectionTitle}>Weak Areas Analysis</Text>
        <Text style={styles.sectionSub}>Select a category to analyse and improve.</Text>
        <View style={styles.gridContainer}>
          {renderGridCard(<BookOpen size={ms(20)} color="#F59E0B" />, "Weak Chapters", weakTopics.weakChapters, "chapters", "#F59E0B", "#FFFBEB", "aiStudy")}
          {renderGridCard(<TrendingDown size={ms(20)} color="#EF4444" />, "Low Accuracy", weakTopics.lowAccuracy, "topics", "#EF4444", "#FEF2F2", "assessments")}
          {renderGridCard(<Brain size={ms(20)} color="#8B5CF6" />, "Forgotten", weakTopics.forgotten, "topics", "#8B5CF6", "#F5F3FF", "aiStudy")}
          {renderGridCard(<Target size={ms(20)} color="#F43F5E" />, "High Negative", weakTopics.highNegative, "topics", "#F43F5E", "#FFF1F2", "assessments")}
        </View>
      </View>
    );
  };

  // ----- RENDER REVISION -----
  const renderRevision = () => {
    if (!revision) return null;
    return (
      <View>
        <Text style={styles.sectionTitle}>Revision Tools</Text>
        <Text style={styles.sectionSub}>Review topics that are due and keep memory fresh.</Text>
        <View style={styles.gridContainer}>
          {renderGridCard(<RefreshCw size={ms(20)} color={theme.primary} />, "Spaced Repetition", revision.spacedRepetition, "topics due", "#3B82F6", "#EFF6FF", "aiStudy")}
          {renderGridCard(<Zap size={ms(20)} color="#F59E0B" />, "Intensive Revision", 0, "Unlocks at 100%", "#94A3B8", "#F8FAFC")}
          {renderGridCard(<Brain size={ms(20)} color="#8B5CF6" />, "AI Revision Notes", revision.aiRevisionNotes, "sessions", "#8B5CF6", "#F5F3FF", "aiStudy")}
          {renderGridCard(<CheckCircle2 size={ms(20)} color="#10B981" />, "Practice History", revision.practiceHistory, "completed", "#10B981", "#ECFDF5", "assessments")}
        </View>
      </View>
    );
  };

  // ----- RENDER ROADMAP -----
  const renderRoadmap = () => {
    if (!roadmap) return null;
    return (
      <View>
        <Text style={styles.sectionTitle}>Curriculum Roadmap</Text>
        <Text style={styles.sectionSub}>See your subjects, chapters, and topic progress.</Text>
        <View style={styles.subjectList}>
          {roadmap.map((sub: any, i: number) => {
            const pct = sub.totalTopics > 0 ? Math.round((sub.completedTopics / sub.totalTopics) * 100) : 0;
            return (
              <View key={i} style={styles.subjectCard}>
                <View style={styles.subjectCardHeader}>
                  <Text style={styles.subjectTitle}>{sub.subject}</Text>
                  <Text style={styles.subjectPct}>{pct}%</Text>
                </View>
                <Text style={styles.subjectMeta}>{sub.chapters} chapters • {sub.completedTopics}/{sub.totalTopics} topics complete</Text>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (isGenerating) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={styles.generatingBox}>
           <Brain size={ms(48)} color="#6366F1" />
           <Text style={styles.generatingTitle}>Creating your study plan</Text>
           <Text style={styles.generatingSub}>We are preparing your daily roadmap based on your syllabus and topics...</Text>
           <ActivityIndicator size="large" color="#6366F1" style={{marginTop: vs(20)}} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Study Planner</Text>
        
        {/* Horizontal Tab Navigation */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
          {TABS.map(tab => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabChipText, activeTab === tab && styles.tabChipTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : (
          <>
            {activeTab === 'Today' && renderToday()}
            {activeTab === 'Backlogs' && renderBacklogs()}
            {activeTab === 'Weak Topics' && renderWeakTopics()}
            {activeTab === 'Revision' && renderRevision()}
            {activeTab === 'Roadmap' && renderRoadmap()}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background },
  header: { paddingTop: vs(12), backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  pageTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(24), color: theme.text, paddingHorizontal: hs(16), marginBottom: vs(12) },
  
  tabContainer: { paddingHorizontal: hs(16), paddingBottom: vs(16), gap: ms(8), flexDirection: 'row' },
  tabChip: { paddingHorizontal: hs(16), paddingVertical: vs(8), borderRadius: ms(20), backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border },
  tabChipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  tabChipText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.subtext },
  tabChipTextActive: { color: theme.surface },

  content: { padding: ms(16), paddingBottom: vs(100) },
  
  emptyCard: { backgroundColor: theme.surface, borderRadius: ms(16), padding: ms(32), alignItems: 'center', borderWidth: 1, borderColor: theme.border, marginTop: vs(40) },
  emptyTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.text, marginBottom: vs(8) },
  emptyText: { fontFamily: 'Poppins-Regular', fontSize: ms(14), color: theme.subtext, textAlign: 'center', marginBottom: vs(24), lineHeight: ms(20) },
  generateBtn: { backgroundColor: theme.primary, paddingHorizontal: hs(24), paddingVertical: vs(12), borderRadius: ms(10) },
  generateBtnText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: theme.surface },
  
  generatingBox: { backgroundColor: theme.surface, padding: ms(32), borderRadius: ms(16), alignItems: 'center', borderWidth: 1, borderColor: theme.border, width: '85%' },
  generatingTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.text, marginTop: vs(16), marginBottom: vs(8), textAlign: 'center' },
  generatingSub: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext, textAlign: 'center', lineHeight: ms(20) },

  statsRow: { flexDirection: 'row', alignItems: 'center', gap: ms(12), marginBottom: vs(24) },
  statBox: { flex: 1, backgroundColor: theme.surface, padding: ms(12), borderRadius: ms(12), borderWidth: 1, borderColor: theme.border },
  statVal: { fontFamily: 'Poppins-SemiBold', fontSize: ms(20), color: theme.text, marginBottom: vs(2) },
  statLbl: { fontFamily: 'Poppins-Regular', fontSize: ms(11), color: theme.subtext },
  revisionBtn: { flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10B981', padding: ms(16), borderRadius: ms(12) },
  revisionBtnText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(13), color: theme.surface },
  
  sectionTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.text, marginBottom: vs(4) },
  sectionSub: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext, marginBottom: vs(16) },
  
  roadmapContainer: { paddingLeft: hs(8), marginTop: vs(12) },
  roadmapItem: { flexDirection: 'row', marginBottom: vs(16) },
  timelineCol: { width: hs(24), alignItems: 'center', marginRight: hs(12) },
  timelineLine: { position: 'absolute', top: vs(24), bottom: vs(-16), width: hs(2) },
  timelineDot: { width: hs(16), height: vs(16), borderRadius: ms(8), borderWidth: 2, marginTop: vs(16), justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface },
  
  taskCard: { flex: 1, backgroundColor: theme.surface, padding: ms(16), borderRadius: ms(16), borderWidth: 1, borderColor: theme.border, shadowColor: theme.subtext, shadowOffset: {width: 0, height: vs(4)}, shadowOpacity: 0.05, shadowRadius: ms(8), elevation: 2 },
  taskCardDone: { opacity: 0.6, backgroundColor: theme.background },
  taskCardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: vs(8) },
  typeIconBox: { width: hs(32), height: vs(32), borderRadius: ms(10), borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: hs(12) },
  taskCardTitleBox: { flex: 1 },
  taskTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: theme.text, marginBottom: vs(4), lineHeight: ms(20) },
  textDone: { color: theme.subtext, textDecorationLine: 'line-through' },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center' },
  taskMetaText: { fontFamily: 'Poppins-Regular', fontSize: ms(11), color: theme.subtext, marginLeft: hs(4) },
  xpBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: hs(6), paddingVertical: vs(2), borderRadius: ms(6), borderWidth: 1, borderColor: '#FDE68A', marginRight: hs(8) },
  xpBadgeText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(9), color: '#D97706' },

  taskContentPills: { flexDirection: 'row', alignItems: 'center', gap: ms(8), marginLeft: hs(44), marginBottom: vs(12) },
  subjectPill: { backgroundColor: theme.surfaceAlt, paddingHorizontal: hs(8), paddingVertical: vs(2), borderRadius: ms(12) },
  subjectPillText: { fontFamily: 'Poppins-Medium', fontSize: ms(10), color: theme.subtext },
  topicText: { fontFamily: 'Poppins-Regular', fontSize: ms(11), color: theme.subtext, flex: 1 },

  taskActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: ms(16), borderTopWidth: 1, borderTopColor: theme.surfaceAlt, paddingTop: vs(12), marginTop: vs(4), alignItems: 'center' },
  actionBtnOutline: { paddingHorizontal: hs(16), paddingVertical: vs(8), borderRadius: ms(8) },
  actionBtnOutlineText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.subtext },
  actionBtnText: { paddingHorizontal: hs(4), paddingVertical: vs(8) },
  actionBtnTextLabel: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.primary },
  actionBtnSolid: { backgroundColor: theme.primary, paddingHorizontal: hs(20), paddingVertical: vs(8), borderRadius: ms(8) },
  actionBtnSolidText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.surface },

  // Grid Styles
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: ms(12), marginTop: vs(8) },
  gridCard: { width: '48%', backgroundColor: theme.surface, padding: ms(16), borderRadius: ms(16), borderWidth: 1, borderColor: theme.border },
  gridIconBox: { width: hs(40), height: vs(40), borderRadius: ms(12), justifyContent: 'center', alignItems: 'center', marginBottom: vs(12) },
  gridTitle: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.text, marginBottom: vs(8), height: vs(40) },
  gridFooter: { flexDirection: 'row', alignItems: 'center', gap: ms(6) },
  gridCount: { fontFamily: 'Poppins-SemiBold', fontSize: ms(16) },
  gridLabel: { fontFamily: 'Poppins-Regular', fontSize: ms(11), color: theme.subtext },

  // Subject List Styles
  subjectList: { marginTop: vs(8) },
  subjectCard: { backgroundColor: theme.surface, padding: ms(16), borderRadius: ms(16), borderWidth: 1, borderColor: theme.border, marginBottom: vs(12) },
  subjectCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: vs(4) },
  subjectTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(15), color: theme.text },
  subjectPct: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: theme.primary },
  subjectMeta: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext, marginBottom: vs(12) },
  progressBarBg: { height: vs(6), backgroundColor: theme.surfaceAlt, borderRadius: ms(3), overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: theme.primary, borderRadius: ms(3) }
});
