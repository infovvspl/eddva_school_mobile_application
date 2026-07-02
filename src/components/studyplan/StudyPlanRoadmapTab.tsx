import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from '../Icon';
import { Brand } from '../../constants/brand';
import { BorderRadius, Shadow } from '../../constants/theme';
import { ThemeColors } from '../../constants/themes';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Chapter = { id: string; name: string; progress: number; total: number; topicsLabel: string };
type Subject = {
  id: string;
  name: string;
  progress: number;
  topicsLabel: string;
  chapters: Chapter[];
};

type Props = {
  colors: ThemeColors;
  progress: {
    percent: number;
    completed: number;
    ongoing: number;
    todo: number;
    accuracy: number;
  };
  subjects: Subject[];
  examType: string;
  examYear: string;
  dailyHours: number;
  daysLeft: number;
  loading: boolean;
  onGoToday: () => void;
  onManagePlan: () => void;
};

const StudyPlanRoadmapTab: React.FC<Props> = ({
  colors: c,
  progress,
  subjects,
  examType,
  examYear,
  dailyHours,
  daysLeft,
  loading,
  onGoToday,
  onManagePlan,
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (loading) {
    return <ActivityIndicator color={c.primary} style={{ marginVertical: vs(40) }} />;
  }

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <View>
      <Text style={[styles.title, { color: c.text }]}>My Curriculum Roadmap</Text>
      <Text style={[styles.sub, { color: c.textMuted }]}>
        Your complete {examType.toLowerCase()} syllabus — tap any subject to expand chapters.
      </Text>

      <View style={[styles.progressHero, { backgroundColor: Brand.blue900 }]}>
        <Text style={styles.heroLabel}>Curriculum Progress</Text>
        <Text style={styles.heroPct}>{progress.percent}%</Text>
        <View style={styles.metrics}>
          {[
            { label: 'Completed', val: progress.completed },
            { label: 'Ongoing', val: progress.ongoing },
            { label: 'To Do', val: progress.todo },
            { label: 'Accuracy', val: `${progress.accuracy}%` },
          ].map(m => (
            <View key={m.label} style={styles.metricBox}>
              <Text style={styles.metricVal}>{m.val}</Text>
              <Text style={styles.metricLbl}>{m.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.targetCard, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
        <Text style={[styles.targetLine, { color: c.text }]}>
          Exam: {examType} · Target {examYear}
        </Text>
        <Text style={[styles.targetLine, { color: c.textMuted }]}>
          Daily Hours: {dailyHours}h · {daysLeft} days left
        </Text>
        <TouchableOpacity style={[styles.todayBtn, { backgroundColor: c.primary }]} onPress={onGoToday}>
          <Text style={styles.todayBtnText}>Go to Today&apos;s Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.regenBtn, { borderColor: c.primary }]} onPress={onManagePlan}>
          <Text style={[styles.regenText, { color: c.primary }]}>Manage Plan</Text>
        </TouchableOpacity>
      </View>

      {subjects.map(sub => {
        const open = expanded[sub.id];
        return (
          <View key={sub.id} style={[styles.subjectCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <TouchableOpacity style={styles.subjectHead} onPress={() => toggle(sub.id)}>
              <View style={[styles.ring, { borderColor: c.primary }]}>
                <Text style={[styles.ringText, { color: c.primary }]}>{sub.progress}%</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.subjectName, { color: c.text }]}>{sub.name}</Text>
                <Text style={[styles.subjectMeta, { color: c.textMuted }]}>{sub.topicsLabel}</Text>
              </View>
              <Icon name={open ? 'chevron-up' : 'chevron-down'} size={ms(14)} color={c.textMuted} solid />
            </TouchableOpacity>
            {open &&
              sub.chapters.map(ch => (
                <View key={ch.id} style={[styles.chapterRow, { borderTopColor: c.border }]}>
                  <Text style={[styles.chapterName, { color: c.text }]}>{ch.name}</Text>
                  <Text style={[styles.chapterMeta, { color: c.textMuted }]}>{ch.topicsLabel}</Text>
                </View>
              ))}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: font.subhead, fontWeight: '800', marginBottom: vs(6) },
  sub: { fontSize: font.body, lineHeight: ms(22), marginBottom: vs(16) },
  progressHero: {
    borderRadius: BorderRadius.xl,
    padding: spacing.md,
    marginBottom: vs(12),
  },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: font.caption, fontWeight: '700' },
  heroPct: { color: '#fff', fontSize: font.headline, fontWeight: '900', marginVertical: vs(8) },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(8) },
  metricBox: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.md,
    padding: ms(10),
  },
  metricVal: { color: '#fff', fontSize: font.subhead, fontWeight: '800' },
  metricLbl: { color: 'rgba(255,255,255,0.75)', fontSize: font.tiny, marginTop: vs(2) },
  targetCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(14),
    gap: vs(8),
  },
  targetLine: { fontSize: font.body, fontWeight: '600' },
  todayBtn: {
    marginTop: vs(8),
    paddingVertical: vs(14),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  todayBtnText: { color: '#fff', fontSize: font.body, fontWeight: '800' },
  regenBtn: {
    paddingVertical: vs(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  regenText: { fontSize: font.body, fontWeight: '700' },
  subjectCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: vs(10),
    overflow: 'hidden',
  },
  subjectHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: spacing.md,
  },
  ring: {
    width: hs(44),
    height: hs(44),
    borderRadius: hs(22),
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: { fontSize: font.tiny, fontWeight: '800' },
  subjectName: { fontSize: font.body, fontWeight: '800' },
  subjectMeta: { fontSize: font.caption, marginTop: vs(2) },
  chapterRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: vs(12),
    borderTopWidth: 1,
    marginLeft: hs(56),
  },
  chapterName: { fontSize: font.body, fontWeight: '700' },
  chapterMeta: { fontSize: font.caption, marginTop: vs(2) },
});

export default StudyPlanRoadmapTab;
