import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from '../Icon';
import IconBadge from '../IconBadge';
import { Brand } from '../../constants/brand';
import { BorderRadius, Shadow } from '../../constants/theme';
import { ThemeColors } from '../../constants/themes';
import { hs, ms, spacing, type as t, vs } from '../../utils/responsive';

const TYPE_META: Record<string, { icon: string; color: string }> = {
  lecture: { icon: 'play-circle', color: Brand.blue700 },
  video: { icon: 'play-circle', color: Brand.blue700 },
  topic: { icon: 'book-open', color: Brand.blue400 },
  quiz: { icon: 'clipboard-check', color: '#F97316' },
  revision: { icon: 'redo', color: Brand.blue900 },
  practice: { icon: 'pencil-alt', color: '#16A34A' },
  dpp: { icon: 'file-alt', color: '#DC2626' },
  pyq: { icon: 'trophy', color: '#F97316' },
  notes: { icon: 'file-alt', color: '#0284C7' },
};

const getSubjectColor = (subject: string, c: ThemeColors) => {
  const s = subject.toLowerCase();
  if (s.includes('chem')) return { bg: '#ECFCCB', border: '#D9F99D', dot: '#65A30D', text: '#3F6212', badgeText: '#65A30D', badgeBg: '#ECFCCB' };
  if (s.includes('phys')) return { bg: '#F3E8FF', border: '#E9D5FF', dot: '#9333EA', text: '#581C87', badgeText: '#9333EA', badgeBg: '#F3E8FF' };
  if (s.includes('math')) return { bg: '#FCE7F3', border: '#FBCFE8', dot: '#DB2777', text: '#831843', badgeText: '#DB2777', badgeBg: '#FCE7F3' };
  if (s.includes('bio') || s.includes('bot') || s.includes('zoo')) return { bg: '#ECFDF5', border: '#A7F3D0', dot: '#059669', text: '#064E3B', badgeText: '#059669', badgeBg: '#ECFDF5' };
  return { bg: c.chipBg, border: c.border, dot: c.primary, text: c.text, badgeText: c.textMuted, badgeBg: c.chipBg };
};

type Props = {
  colors: ThemeColors;
  examType: string;
  items: any[];
  nextAction: any;
  hasPlan: boolean;
  loading: boolean;
  generating: boolean;
  onGenerate: () => void;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onStart: (item: any) => void;
  onManagePlan: () => void;
};

const StudyPlanTodayTab: React.FC<Props> = ({
  colors: c,
  examType,
  items,
  nextAction,
  hasPlan,
  loading,
  generating,
  onGenerate,
  onComplete,
  onSkip,
  onStart,
  onManagePlan,
}) => {
  const completed = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach(item => {
      const subject = item.subject || 'Other';
      if (!groups[subject]) groups[subject] = [];
      groups[subject].push(item);
    });
    return Object.keys(groups).map(key => ({ subject: key, items: groups[key] }));
  }, [items]);

  if (loading) {
    return <ActivityIndicator color={c.primary} style={{ marginVertical: vs(40) }} />;
  }

  if (!hasPlan || items.length === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
        <Icon name="rocket" size={ms(36)} color={c.primary} solid />
        <Text style={[styles.emptyTitle, { color: c.text }]}>No plan created yet</Text>
        <Text style={[styles.emptySub, { color: c.textMuted }]}>
          Click below to create your monthly plan for {examType.toLowerCase()}
        </Text>
        <TouchableOpacity
          style={[styles.generateBtn, { backgroundColor: c.primary }, generating && { opacity: 0.6 }]}
          onPress={onGenerate}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="magic" size={ms(16)} color="#fff" solid />
              <Text style={styles.generateBtnText}>Generate Study Plan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View style={[styles.progressCard, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: c.text }]}>Today&apos;s Progress</Text>
          <Text style={[styles.progressPct, { color: c.primary }]}>{progress}%</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: c.borderLight }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: c.primary }]} />
        </View>
        <Text style={[styles.progressSub, { color: c.textMuted }]}>
          {completed} of {items.length} tasks done
        </Text>
      </View>

      {nextAction ? (
        <View style={[styles.nextCard, { backgroundColor: c.chipActiveBg, borderColor: c.chipActiveBorder }]}>
          <View style={[styles.nextBadge, { backgroundColor: c.primary }]}>
            <Icon name="bolt" size={ms(10)} color="#fff" solid />
            <Text style={styles.nextBadgeText}>UP NEXT</Text>
          </View>
          <Text style={[styles.nextTitle, { color: c.text }]}>
            {nextAction.title || nextAction.topicName}
          </Text>
          <Text style={[styles.nextMeta, { color: c.textMuted }]}>
            {nextAction.type} · {nextAction.estimatedMinutes || 30} min
          </Text>
        </View>
      ) : null}

      {groupedItems.map((group, gIdx) => {
        const subColor = getSubjectColor(group.subject, c);
        const subDone = group.items.filter(i => i.completed).length;
        const subMins = group.items.reduce((acc, i) => acc + (i.estimatedMinutes || 30), 0);
        
        return (
          <View key={gIdx} style={styles.subjectGroup}>
            <View style={[styles.subjectHeader, { backgroundColor: subColor.bg, borderColor: subColor.border }]}>
              <View style={styles.subjectHeaderLeft}>
                <View style={[styles.subjectDot, { backgroundColor: subColor.dot }]} />
                <Text style={[styles.subjectTitle, { color: subColor.text }]}>{group.subject}</Text>
              </View>
              <Text style={[styles.subjectMeta, { color: subColor.text }]}>
                {subDone}/{group.items.length} done · {subMins}m
              </Text>
            </View>

            <View style={styles.taskList}>
              {group.items.map((item: any) => {
                const type = item.type || 'topic';
                const intensity = item.intensity || (type === 'practice' ? 'MED' : 'LOW');
                
                return (
                  <View key={item.id} style={[styles.taskCardWrap, { borderColor: c.border }]}>
                    <TouchableOpacity
                      activeOpacity={0.88}
                      onPress={() => { if (!item.completed) onStart(item); }}
                      style={[styles.taskCard, item.completed && styles.taskDone]}
                    >
                      <IconBadge
                        name={type === 'practice' ? 'pencil-alt' : 'book-open'}
                        color={item.completed ? c.textMuted : '#EAB308'}
                        size="md"
                        variant={item.completed ? 'soft' : 'gradient'}
                      />
                      <View style={styles.taskContent}>
                        <Text
                          style={[styles.taskTitle, { color: c.text }, item.completed && { color: c.textMuted, textDecorationLine: 'line-through' }]}
                          numberOfLines={1}
                        >
                          <Text style={{textTransform: 'capitalize'}}>{type}</Text>: {item.title || item.topicName}
                        </Text>
                        <View style={styles.taskMetaRow}>
                          <Text style={[styles.subjectBadge, { color: subColor.badgeText }]}>{group.subject}</Text>
                          <Text style={[styles.taskMeta, { color: c.textMuted }]}>
                            {item.estimatedMinutes || 30}m {item.title || item.topicName}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={[styles.intensityPill, { borderColor: intensity === 'LOW' ? '#D1D5DB' : '#FDE047' }]}>
                        <Text style={[styles.intensityText, { color: c.textMuted }]}>{intensity}</Text>
                      </View>
                    </TouchableOpacity>

                    <View style={[styles.taskActionsRow, { borderTopColor: c.borderLight }]}>
                      {!item.completed ? (
                        <>
                          <TouchableOpacity onPress={() => onStart(item)} style={styles.actionBtn}>
                            <Text style={[styles.actionBtnText, { color: c.primary }]}>Open</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => onSkip(item.id)} style={styles.actionBtn}>
                            <Text style={[styles.actionBtnText, { color: c.textMuted }]}>Skip</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => onComplete(item.id)} style={[styles.actionBtnDone, { backgroundColor: c.primary }]}>
                            <Text style={styles.actionBtnDoneText}>Done</Text>
                          </TouchableOpacity>
                        </>
                      ) : (
                        <View style={styles.actionDoneWrap}>
                           <Icon name="check-circle" size={ms(14)} color={c.success} solid />
                           <Text style={[styles.actionDoneText, { color: c.success }]}>Completed</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        style={[styles.manageLink, { borderColor: c.border, backgroundColor: c.chipBg }]}
        onPress={onManagePlan}
      >
        <Icon name="cog" size={ms(14)} color={c.primary} solid />
        <Text style={[styles.manageLinkText, { color: c.primary }]}>Manage or regenerate plan</Text>
        <Icon name="chevron-right" size={ms(12)} color={c.primary} solid />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyCard: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: vs(10),
  },
  emptyTitle: { ...t.subheadBold, marginTop: vs(8) },
  emptySub: { ...t.body, textAlign: 'center', lineHeight: ms(24) },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    paddingHorizontal: hs(24),
    paddingVertical: vs(14),
    borderRadius: ms(24),
    marginTop: vs(12),
  },
  generateBtnText: { ...t.bodyBold, color: '#fff' },
  progressCard: {
    borderRadius: BorderRadius.xl,
    padding: spacing.md,
    marginBottom: vs(12),
    borderWidth: 1,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: vs(8) },
  progressTitle: { ...t.bodyBold },
  progressPct: { ...t.subheadBold },
  progressTrack: { height: vs(8), borderRadius: 4, marginBottom: vs(6) },
  progressFill: { height: vs(8), borderRadius: 4 },
  progressSub: { ...t.captionBold },
  nextCard: {
    borderRadius: BorderRadius.xl,
    padding: spacing.md,
    marginBottom: vs(16),
    borderWidth: 1.5,
  },
  nextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(5),
    alignSelf: 'flex-start',
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    borderRadius: 8,
    marginBottom: vs(8),
  },
  nextBadgeText: { ...t.microBold, color: '#fff', letterSpacing: 1 },
  nextTitle: { ...t.bodyBold, marginBottom: vs(4) },
  nextMeta: { ...t.captionBold },
  
  subjectGroup: {
    marginBottom: vs(16),
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hs(12),
    paddingVertical: vs(8),
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  subjectHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
  },
  subjectDot: {
    width: hs(6),
    height: hs(6),
    borderRadius: hs(3),
  },
  subjectTitle: {
    ...t.subheadBold,
  },
  subjectMeta: {
    ...t.captionBold,
  },
  taskList: {
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  taskCardWrap: {
    borderWidth: 1,
    borderTopWidth: 0,
    backgroundColor: '#fff',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: hs(12),
  },
  taskDone: { opacity: 0.65 },
  taskContent: { flex: 1 },
  taskTitle: { ...t.bodyBold, marginBottom: vs(4) },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: hs(6) },
  subjectBadge: { ...t.captionBold },
  taskMeta: { ...t.caption, fontSize: ms(11) },
  
  intensityPill: {
    paddingHorizontal: hs(8),
    paddingVertical: vs(2),
    borderRadius: 12,
    borderWidth: 1,
  },
  intensityText: { ...t.microBold },
  
  taskActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: hs(12),
  },
  actionBtn: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
  },
  actionBtnText: { ...t.captionBold },
  actionBtnDone: {
    paddingHorizontal: hs(16),
    paddingVertical: vs(6),
    borderRadius: 16,
  },
  actionBtnDoneText: { ...t.captionBold, color: '#fff' },
  actionDoneWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
  },
  actionDoneText: { ...t.captionBold },
  
  manageLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    marginTop: vs(8),
    padding: spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: vs(32),
  },
  manageLinkText: { ...t.captionBold, flex: 1 },
});

export default StudyPlanTodayTab;
