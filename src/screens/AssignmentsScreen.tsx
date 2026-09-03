import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Linking,
} from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import {
  ArrowLeft, CalendarClock, AlertTriangle, CheckCircle2, Clock3,
  Paperclip, Award, ChevronDown, ChevronUp, MessageSquareQuote,
} from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { Markdown } from '../components/Markdown';

type Bucket = 'pending' | 'submitted' | 'graded';

// The record mixes snake_case and camelCase for the same values.
const subjectOf = (a: any) => a.subjectName || a.subject_name || a.subject || '';
const dueOf = (a: any) => a.dueDate || a.due_date || null;
const marksOf = (a: any) =>
  a.mySubmission?.marksObtained ?? a.marksObtained ?? a.submission_marks ?? null;
const feedbackOf = (a: any) =>
  a.mySubmission?.feedback ?? a.feedback ?? a.submission_feedback ?? '';
const briefOf = (a: any) => a.teacherFileUrl || a.file_path || a.filePath || null;
const workOf = (a: any) => a.mySubmission?.filePath || a.submission_file_path || null;

/**
 * Which of the three states the student is actually in. The record carries both
 * an assignment lifecycle ("evaluated") and a submission state ("graded");
 * the latter is what matters to the student.
 */
const bucketOf = (a: any): Bucket => {
  const s = String(
    a.mySubmission?.status || a.submission_status || a.submissionStatus || a.status || '',
  ).toLowerCase();
  if (s === 'graded' || s === 'evaluated') return 'graded';
  if (s === 'submitted' || a.mySubmission) return 'submitted';
  return 'pending';
};

const isOverdue = (a: any) => {
  const due = dueOf(a);
  return bucketOf(a) === 'pending' && !!due && new Date(due).getTime() < Date.now();
};

const dayDiff = (iso: string) =>
  Math.round((new Date(iso).getTime() - Date.now()) / 86400000);

const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * "Due in 3 days" reads better than a bare date near the deadline. Overdue
 * wording is reserved for work still owed: once it is handed in, a past due
 * date is history, not a warning.
 */
const dueLabel = (iso: string | null, owed: boolean) => {
  if (!iso) return 'No due date';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  const diff = dayDiff(iso);
  if (!owed) return `Due ${shortDate(iso)}`;
  if (diff === 0) return 'Due today';
  if (diff === 1) return 'Due tomorrow';
  if (diff > 1 && diff <= 7) return `Due in ${diff} days`;
  if (diff === -1) return 'Due yesterday';
  if (diff < -1) return `Overdue by ${Math.abs(diff)} days · ${shortDate(iso)}`;
  return `Due ${shortDate(iso)}`;
};

export function AssignmentsScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Bucket>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res: any = await schoolApi.getAssignments();
        const list = Array.isArray(res) ? res : (res?.data ?? res?.assignments ?? []);
        setAssignments(Array.isArray(list) ? list : []);
      } catch (err: any) {
        console.error(err);
        setLoadError(err?.message || 'Could not load your assignments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const counts = useMemo(() => {
    const c = { pending: 0, submitted: 0, graded: 0, overdue: 0 };
    assignments.forEach(a => {
      c[bucketOf(a)] += 1;
      if (isOverdue(a)) c.overdue += 1;
    });
    return c;
  }, [assignments]);

  // Soonest deadline first, and anything still owed ahead of finished work.
  const visible = useMemo(() => {
    const rank: Record<Bucket, number> = { pending: 0, submitted: 1, graded: 2 };
    return assignments
      .filter(a => filter === 'all' || bucketOf(a) === filter)
      .sort((a, b) => {
        const r = rank[bucketOf(a)] - rank[bucketOf(b)];
        if (r !== 0) return r;
        return new Date(dueOf(a) ?? 0).getTime() - new Date(dueOf(b) ?? 0).getTime();
      });
  }, [assignments, filter]);

  const STATUS: Record<Bucket, { label: string; fg: string; bg: string; Icon: any }> = {
    pending: { label: 'To do', fg: '#B45309', bg: '#FEF3C7', Icon: Clock3 },
    submitted: { label: 'Submitted', fg: '#1D4ED8', bg: '#DBEAFE', Icon: CheckCircle2 },
    graded: { label: 'Graded', fg: '#047857', bg: '#D1FAE5', Icon: Award },
  };

  const open = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={styles.back}>
          <ArrowLeft size={ms(22)} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Assignments</Text>
          <Text style={styles.subtitle}>Stay on top of your work</Text>
        </View>
      </View>

      {!loading && assignments.length > 0 && (
        <>
          <View style={styles.summary}>
            {([
              { id: 'pending', n: counts.pending, label: 'To do', fg: '#B45309', bg: '#FFFBEB' },
              { id: 'submitted', n: counts.submitted, label: 'Submitted', fg: '#1D4ED8', bg: '#EFF6FF' },
              { id: 'graded', n: counts.graded, label: 'Graded', fg: '#047857', bg: '#ECFDF5' },
            ] as const).map(s => (
              <View key={s.id} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
                <Text style={[styles.summaryNum, { color: s.fg }]}>{s.n}</Text>
                <Text style={[styles.summaryLabel, { color: s.fg }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {counts.overdue > 0 && (
            <View style={styles.alert}>
              <AlertTriangle size={ms(15)} color="#B91C1C" />
              <Text style={styles.alertText}>
                {counts.overdue} {counts.overdue === 1 ? 'assignment is' : 'assignments are'} past the due date
              </Text>
            </View>
          )}

          {/* A wrapping row rather than a horizontal ScrollView: nested inside a
              column the scroller collapsed its height and clipped the labels. */}
          <View style={styles.filterRow}>
            {([
              { id: 'all', label: `All (${assignments.length})` },
              { id: 'pending', label: `To do (${counts.pending})` },
              { id: 'submitted', label: `Submitted (${counts.submitted})` },
              { id: 'graded', label: `Graded (${counts.graded})` },
            ] as const).map(f => {
              const on = filter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.filterChip, on && styles.filterChipOn]}
                  onPress={() => setFilter(f.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.filterText, on && styles.filterTextOn]}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : visible.length === 0 ? (
          <Text style={styles.empty}>
            {loadError || (assignments.length ? 'Nothing in this list.' : 'No assignments found.')}
          </Text>
        ) : (
          visible.map(item => {
            const bucket = bucketOf(item);
            const meta = STATUS[bucket];
            const overdue = isOverdue(item);
            const marks = marksOf(item);
            const feedback = feedbackOf(item);
            const brief = briefOf(item);
            const work = workOf(item);
            const isOpen = !!expanded[item.id];
            const submittedAt =
              item.mySubmission?.submittedAt || item.submission_submitted_at || null;

            return (
              <View key={item.id} style={[styles.card, overdue && styles.cardOverdue]}>
                {/* A colour rail makes state scannable without reading the pill. */}
                <View style={[styles.rail, { backgroundColor: overdue ? '#DC2626' : meta.fg }]} />

                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <Text style={styles.subject} numberOfLines={1}>{subjectOf(item)}</Text>
                    <View style={[styles.pill, { backgroundColor: overdue ? '#FEE2E2' : meta.bg }]}>
                      <meta.Icon size={ms(11)} color={overdue ? '#B91C1C' : meta.fg} />
                      <Text style={[styles.pillText, { color: overdue ? '#B91C1C' : meta.fg }]}>
                        {overdue ? 'Overdue' : meta.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.name}>{item.title || 'Assignment'}</Text>

                  <View style={styles.dueRow}>
                    <CalendarClock size={ms(13)} color={overdue ? '#DC2626' : theme.subtext} />
                    <Text style={[styles.due, overdue && styles.dueOverdue]}>
                      {dueLabel(dueOf(item), bucket === 'pending')}
                    </Text>
                  </View>

                  {submittedAt && (
                    <View style={styles.dueRow}>
                      <CheckCircle2 size={ms(13)} color="#1D4ED8" />
                      <Text style={styles.submitted}>Submitted {shortDate(submittedAt)}</Text>
                    </View>
                  )}

                  {bucket === 'graded' && marks != null && (
                    <View style={styles.scoreBox}>
                      <Award size={ms(16)} color="#047857" />
                      <Text style={styles.scoreValue}>{marks}</Text>
                      <Text style={styles.scoreLabel}>marks awarded</Text>
                    </View>
                  )}

                  {!!feedback && (
                    <View style={styles.feedbackBox}>
                      <MessageSquareQuote size={ms(13)} color={theme.subtext} />
                      <Text style={styles.feedbackText}>{feedback}</Text>
                    </View>
                  )}

                  {(!!brief || !!work) && (
                    <View style={styles.fileRow}>
                      {!!brief && (
                        <TouchableOpacity style={styles.fileBtn} onPress={() => open(brief)}>
                          <Paperclip size={ms(12)} color={theme.primary} />
                          <Text style={styles.fileText}>Brief</Text>
                        </TouchableOpacity>
                      )}
                      {!!work && (
                        <TouchableOpacity style={styles.fileBtn} onPress={() => open(work)}>
                          <Paperclip size={ms(12)} color={theme.primary} />
                          <Text style={styles.fileText}>My submission</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {!!item.instructions && (
                    <>
                      <TouchableOpacity
                        style={styles.moreBtn}
                        onPress={() => setExpanded(p => ({ ...p, [item.id]: !p[item.id] }))}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.moreText}>
                          {isOpen ? 'Hide instructions' : 'View instructions'}
                        </Text>
                        {isOpen
                          ? <ChevronUp size={ms(14)} color={theme.primary} />
                          : <ChevronDown size={ms(14)} color={theme.primary} />}
                      </TouchableOpacity>
                      {isOpen && (
                        <View style={styles.instructions}>
                          <Markdown value={item.instructions} theme={theme} compact />
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(16),
    paddingTop: vs(12),
    paddingBottom: vs(12),
  },
  back: { padding: ms(4), marginRight: hs(10), marginLeft: -ms(4) },
  title: { fontSize: ms(24), fontWeight: '700', color: theme.text },
  subtitle: { fontSize: ms(13), color: theme.subtext, marginTop: vs(1) },

  summary: { flexDirection: 'row', gap: hs(10), paddingHorizontal: hs(16) },
  summaryCard: { flex: 1, borderRadius: ms(14), paddingVertical: vs(12), alignItems: 'center' },
  summaryNum: { fontSize: ms(22), fontWeight: '700' },
  summaryLabel: { fontSize: ms(11), fontWeight: '600', marginTop: vs(2) },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(7),
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: ms(12),
    paddingHorizontal: hs(12),
    paddingVertical: vs(9),
    marginHorizontal: hs(16),
    marginTop: vs(12),
  },
  alertText: { flex: 1, fontSize: ms(12), color: '#B91C1C', fontWeight: '600' },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(8),
    paddingHorizontal: hs(16),
    marginTop: vs(14),
  },
  filterChip: {
    paddingHorizontal: hs(14),
    paddingVertical: vs(7),
    borderRadius: ms(18),
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  filterChipOn: { backgroundColor: theme.primary, borderColor: theme.primary },
  filterText: {
    fontSize: ms(12.5),
    lineHeight: ms(18),
    fontWeight: '600',
    color: theme.subtext,
  },
  filterTextOn: { color: '#FFF' },

  content: { padding: hs(16), paddingBottom: vs(100) },
  empty: { textAlign: 'center', color: theme.subtext, marginTop: vs(40), fontSize: ms(13) },

  card: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: vs(12),
    overflow: 'hidden',
  },
  cardOverdue: { borderColor: '#FECACA' },
  rail: { width: hs(4) },
  cardBody: { flex: 1, padding: ms(14) },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: hs(8), marginBottom: vs(5) },
  subject: {
    flex: 1,
    fontSize: ms(11),
    fontWeight: '700',
    letterSpacing: 0.6,
    color: theme.primary,
    textTransform: 'uppercase',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    borderRadius: ms(11),
  },
  pillText: { fontSize: ms(10.5), fontWeight: '700' },

  name: { fontSize: ms(15.5), fontWeight: '700', color: theme.text, marginBottom: vs(8) },
  dueRow: { flexDirection: 'row', alignItems: 'center', gap: hs(6) },
  due: { fontSize: ms(12.5), lineHeight: ms(18), color: theme.subtext, fontWeight: '500' },
  submitted: { fontSize: ms(12.5), lineHeight: ms(18), color: '#1D4ED8', fontWeight: '600' },
  dueOverdue: { color: '#DC2626', fontWeight: '700' },

  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(7),
    backgroundColor: '#ECFDF5',
    borderRadius: ms(10),
    paddingHorizontal: hs(11),
    paddingVertical: vs(8),
    marginTop: vs(10),
    alignSelf: 'flex-start',
  },
  scoreValue: { fontSize: ms(17), fontWeight: '700', color: '#047857' },
  scoreLabel: { fontSize: ms(11.5), color: '#047857' },

  feedbackBox: {
    flexDirection: 'row',
    gap: hs(7),
    backgroundColor: theme.background,
    borderRadius: ms(10),
    padding: ms(10),
    marginTop: vs(9),
  },
  feedbackText: { flex: 1, fontSize: ms(12.5), color: theme.text, lineHeight: ms(18) },

  fileRow: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(8), marginTop: vs(10) },
  fileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(5),
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: ms(16),
    paddingHorizontal: hs(11),
    paddingVertical: vs(6),
  },
  fileText: { fontSize: ms(11.5), fontWeight: '600', color: theme.primary },

  moreBtn: { flexDirection: 'row', alignItems: 'center', gap: hs(4), marginTop: vs(11) },
  moreText: { fontSize: ms(12), fontWeight: '700', color: theme.primary },
  instructions: {
    marginTop: vs(8),
    paddingTop: vs(10),
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});
