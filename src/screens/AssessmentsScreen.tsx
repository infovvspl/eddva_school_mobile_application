import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Modal,
} from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import {
  ArrowLeft, ChevronDown, Check, X, Clock, ListChecks, CalendarDays,
  PlayCircle, RotateCw, Hourglass, Trophy, AlertCircle, Lock,
} from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

type Bucket = 'todo' | 'closed' | 'active' | 'awaiting' | 'result';

const TYPE_LABEL: Record<string, string> = {
  topic: 'Topic Test',
  chapter: 'Chapter Test',
  subject: 'Subject Test',
  exam: 'Mock Test',
  final: 'Final Exam',
};

const subjectOf = (a: any) => a.subjectName || a.subject_name || '';

/**
 * The server closes a test once its window has passed and rejects /start with
 * "Assessment window has ended". Detect it here so a dead Start button is never
 * offered; the server stays authoritative if the rule is finer than this.
 */
const windowClosed = (a: any) => {
  const raw = a.scheduled_date;
  if (!raw) return false;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
};
const scoreOf = (a: any) => {
  const m = a.mySubmission;
  const got = Number(m?.objective_score);
  const total = Number(m?.objective_total);
  if (!m || !isFinite(got) || !isFinite(total) || total <= 0) return null;
  return { got, total, pct: Math.round((got / total) * 100) };
};

/** Count questions without trusting the payload to be pre-parsed. */
const questionCount = (a: any) => {
  let q = a.questions_json;
  if (typeof q === 'string') {
    try { q = JSON.parse(q); } catch { return null; }
  }
  const list = Array.isArray(q) ? q : q?.questions;
  return Array.isArray(list) ? list.length : null;
};

/**
 * What the student can actually do with this assessment. The record carries an
 * assessment lifecycle, a submission status and a grading status; the useful
 * state is a combination of all three.
 */
const attemptExpired = (a: any) => {
  const exp = a.mySubmission?.expires_at;
  if (!exp) return false;
  const d = new Date(exp);
  return !isNaN(d.getTime()) && d.getTime() < Date.now();
};

const bucketOf = (a: any): Bucket => {
  const m = a.mySubmission;
  if (!m) return windowClosed(a) ? 'closed' : 'todo';
  // A started attempt past its expires_at cannot be resumed: /start returns
  // "Assessment window has ended", so it must not offer a Resume button.
  if (m.status === 'in_progress') return attemptExpired(a) ? 'closed' : 'active';
  if (scoreOf(a) || m.grading_status === 'reviewed_published' || m.status === 'evaluated') {
    return 'result';
  }
  return 'awaiting';
};

// A score can be published, or only the objective half of it graded so far.
const isProvisional = (a: any) =>
  a.mySubmission?.grading_status && a.mySubmission.grading_status !== 'reviewed_published';

const shortDate = (iso: any) => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? null
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export function AssessmentsScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | Bucket>('all');
  const [subject, setSubject] = useState<string | null>(null);
  const [subjectOpen, setSubjectOpen] = useState(false);

  useEffect(() => {
    schoolApi
      .getAssessments()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.assessments ?? []);
        setItems(Array.isArray(list) ? list : []);
      })
      .catch((e: any) => setLoadError(e?.message || 'Could not load assessments.'))
      .finally(() => setLoading(false));
  }, []);

  const subjects = useMemo(
    () => Array.from(new Set(items.map(subjectOf).filter(Boolean))).sort(),
    [items],
  );

  const counts = useMemo(() => {
    const c = { todo: 0, closed: 0, active: 0, awaiting: 0, result: 0 };
    items.forEach(a => { c[bucketOf(a)] += 1; });
    return c;
  }, [items]);

  // Anything in progress first (it can expire), then unattempted work.
  const visible = useMemo(() => {
    const rank: Record<Bucket, number> = { active: 0, todo: 1, awaiting: 2, result: 3, closed: 4 };
    return items
      .filter(a => filter === 'all' || bucketOf(a) === filter)
      .filter(a => !subject || subjectOf(a) === subject)
      .sort((a, b) => {
        const r = rank[bucketOf(a)] - rank[bucketOf(b)];
        if (r !== 0) return r;
        return new Date(b.scheduled_date ?? 0).getTime() - new Date(a.scheduled_date ?? 0).getTime();
      });
  }, [items, filter, subject]);

  const STATE: Record<Bucket, { label: string; fg: string; bg: string; Icon: any }> = {
    todo: { label: 'Not attempted', fg: '#B45309', bg: '#FEF3C7', Icon: PlayCircle },
    closed: { label: 'Window closed', fg: '#64748B', bg: '#F1F5F9', Icon: Lock },
    active: { label: 'In progress', fg: '#7C3AED', bg: '#EDE9FE', Icon: RotateCw },
    awaiting: { label: 'Awaiting result', fg: '#1D4ED8', bg: '#DBEAFE', Icon: Hourglass },
    result: { label: 'Result out', fg: '#047857', bg: '#D1FAE5', Icon: Trophy },
  };

  const scoreTone = (pct: number) =>
    pct >= 60 ? '#047857' : pct >= 35 ? '#B45309' : '#B91C1C';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={styles.back}>
          <ArrowLeft size={ms(22)} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Assessments</Text>
          <Text style={styles.subtitle}>Tests, mock exams and your results</Text>
        </View>
      </View>

      {!loading && items.length > 0 && (
        <>
          <View style={styles.summary}>
            {([
              { n: counts.todo, label: 'To attempt', fg: '#B45309', bg: '#FFFBEB' },
              { n: counts.active, label: 'In progress', fg: '#7C3AED', bg: '#F5F3FF' },
              { n: counts.awaiting, label: 'Awaiting', fg: '#1D4ED8', bg: '#EFF6FF' },
              { n: counts.result, label: 'Results', fg: '#047857', bg: '#ECFDF5' },
            ]).map(s => (
              <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
                <Text style={[styles.summaryNum, { color: s.fg }]}>{s.n}</Text>
                <Text style={[styles.summaryLabel, { color: s.fg }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {counts.active > 0 && (
            <View style={styles.alert}>
              <AlertCircle size={ms(15)} color="#6D28D9" />
              <Text style={styles.alertText}>
                {counts.active} attempt{counts.active > 1 ? 's are' : ' is'} still open — resume before it expires
              </Text>
            </View>
          )}

          <View style={styles.filterRow}>
            {([
              { id: 'all', label: `All (${items.length})` },
              { id: 'todo', label: `To attempt (${counts.todo})` },
              { id: 'active', label: `In progress (${counts.active})` },
              { id: 'awaiting', label: `Awaiting (${counts.awaiting})` },
              { id: 'result', label: `Results (${counts.result})` },
              { id: 'closed', label: `Closed (${counts.closed})` },
            ] as const).map(f => {
              const on = filter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.chip, on && styles.chipOn]}
                  onPress={() => setFilter(f.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.subjectBtn}
            onPress={() => setSubjectOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.subjectText} numberOfLines={1}>
              {subject ?? 'All subjects'}
            </Text>
            <ChevronDown size={ms(15)} color={theme.subtext} />
          </TouchableOpacity>
        </>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : visible.length === 0 ? (
          <Text style={styles.empty}>
            {loadError || (items.length ? 'Nothing in this list.' : 'No assessments yet.')}
          </Text>
        ) : (
          visible.map(item => {
            const bucket = bucketOf(item);
            const meta = STATE[bucket];
            const score = scoreOf(item);
            const qCount = questionCount(item);
            const when = shortDate(item.scheduled_date);
            const provisional = bucket === 'result' && isProvisional(item);

            return (
              <View key={item.mySubmission?.id ?? item.id} style={styles.card}>
                <View style={[styles.rail, { backgroundColor: meta.fg }]} />
                <View style={styles.cardBody}>
                  <View style={styles.cardTop}>
                    <View style={styles.typeChip}>
                      <Text style={styles.typeChipText}>
                        {TYPE_LABEL[item.type] ?? String(item.type ?? 'Test')}
                      </Text>
                    </View>
                    <View style={[styles.pill, { backgroundColor: meta.bg }]}>
                      <meta.Icon size={ms(11)} color={meta.fg} />
                      <Text style={[styles.pillText, { color: meta.fg }]}>{meta.label}</Text>
                    </View>
                  </View>

                  <Text style={styles.name}>{item.title || 'Assessment'}</Text>
                  {!!subjectOf(item) && (
                    <Text style={styles.subjectLine}>{subjectOf(item)}</Text>
                  )}

                  <View style={styles.metaRow}>
                    {!!item.duration_minutes && (
                      <View style={styles.meta}>
                        <Clock size={ms(12)} color={theme.subtext} />
                        <Text style={styles.metaText}>{item.duration_minutes} min</Text>
                      </View>
                    )}
                    {qCount != null && (
                      <View style={styles.meta}>
                        <ListChecks size={ms(12)} color={theme.subtext} />
                        <Text style={styles.metaText}>{qCount} questions</Text>
                      </View>
                    )}
                    {!!when && (
                      <View style={styles.meta}>
                        <CalendarDays size={ms(12)} color={theme.subtext} />
                        <Text style={styles.metaText}>{when}</Text>
                      </View>
                    )}
                  </View>

                  {score && (
                    <View style={styles.scoreBox}>
                      <View style={styles.scoreLeft}>
                        <Text style={[styles.scorePct, { color: scoreTone(score.pct) }]}>
                          {score.pct}%
                        </Text>
                        <Text style={styles.scoreRaw}>
                          {score.got} / {score.total}
                          {item.total_marks ? `  ·  paper total ${Number(item.total_marks)}` : ''}
                        </Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            { width: `${score.pct}%`, backgroundColor: scoreTone(score.pct) },
                          ]}
                        />
                      </View>
                    </View>
                  )}

                  {provisional && (
                    <Text style={styles.provisional}>
                      Objective section graded · written answers still under review
                    </Text>
                  )}

                  {bucket === 'closed' && (
                    <Text style={styles.closedNote}>
                      {item.mySubmission
                        ? 'Your attempt expired and can no longer be resumed.'
                        : 'This test is no longer open for attempts.'}
                    </Text>
                  )}

                  {(bucket === 'todo' || bucket === 'active') && (
                    <TouchableOpacity
                      style={[styles.cta, bucket === 'active' && styles.ctaResume]}
                      onPress={() => onNavigate('exam', { assessmentId: item.id, title: item.title })}
                      activeOpacity={0.85}
                    >
                      {bucket === 'active'
                        ? <RotateCw size={ms(14)} color="#FFF" />
                        : <PlayCircle size={ms(14)} color="#FFF" />}
                      <Text style={styles.ctaText}>
                        {bucket === 'active' ? 'Resume attempt' : 'Start test'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={subjectOpen} transparent animationType="slide" onRequestClose={() => setSubjectOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setSubjectOpen(false)}>
          <TouchableOpacity style={styles.sheet} activeOpacity={1}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Subject</Text>
              <TouchableOpacity onPress={() => setSubjectOpen(false)} style={{ padding: ms(4) }}>
                <X size={ms(20)} color={theme.subtext} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[null, ...subjects].map((s, i) => (
                <TouchableOpacity
                  key={s ?? `all-${i}`}
                  style={styles.sheetRow}
                  onPress={() => { setSubject(s); setSubjectOpen(false); }}
                >
                  <Text style={[styles.sheetRowText, subject === s && styles.sheetRowTextOn]}>
                    {s ?? 'All subjects'}
                  </Text>
                  {subject === s && <Check size={ms(17)} color={theme.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: vs(10),
  },
  back: { padding: ms(4), marginRight: hs(10), marginLeft: -ms(4) },
  title: { fontSize: ms(23), fontWeight: '700', color: theme.text },
  subtitle: { fontSize: ms(13), lineHeight: ms(18), color: theme.subtext, marginTop: vs(1) },

  summary: { flexDirection: 'row', gap: hs(7), paddingHorizontal: hs(16) },
  summaryCard: { flex: 1, borderRadius: ms(12), paddingVertical: vs(10), alignItems: 'center' },
  summaryNum: { fontSize: ms(19), lineHeight: ms(26), fontWeight: '700' },
  summaryLabel: { fontSize: ms(10), lineHeight: ms(14), fontWeight: '600', marginTop: vs(1) },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(7),
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: ms(12),
    paddingHorizontal: hs(12),
    paddingVertical: vs(9),
    marginHorizontal: hs(16),
    marginTop: vs(12),
  },
  alertText: { flex: 1, fontSize: ms(11.5), lineHeight: ms(16), color: '#6D28D9', fontWeight: '600' },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(7),
    paddingHorizontal: hs(16),
    marginTop: vs(13),
  },
  chip: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  chipOn: { backgroundColor: theme.primary, borderColor: theme.primary },
  chipText: { fontSize: ms(11.5), lineHeight: ms(16), fontWeight: '600', color: theme.subtext },
  chipTextOn: { color: '#FFF' },

  subjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: hs(6),
    marginHorizontal: hs(16),
    marginTop: vs(10),
    paddingHorizontal: hs(12),
    paddingVertical: vs(9),
    borderRadius: ms(10),
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  subjectText: { flex: 1, fontSize: ms(12.5), lineHeight: ms(18), fontWeight: '600', color: theme.text },

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
  rail: { width: hs(4) },
  cardBody: { flex: 1, padding: ms(13) },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: hs(8), marginBottom: vs(7) },
  typeChip: {
    backgroundColor: theme.background,
    borderRadius: ms(8),
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
  },
  typeChipText: {
    fontSize: ms(10),
    lineHeight: ms(14),
    fontWeight: '700',
    letterSpacing: 0.4,
    color: theme.subtext,
    textTransform: 'uppercase',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    borderRadius: ms(11),
    marginLeft: 'auto',
  },
  pillText: { fontSize: ms(10), lineHeight: ms(14), fontWeight: '700' },

  name: { fontSize: ms(15.5), lineHeight: ms(21), fontWeight: '700', color: theme.text },
  subjectLine: { fontSize: ms(12), lineHeight: ms(17), color: theme.primary, fontWeight: '600', marginTop: vs(2) },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(12), marginTop: vs(8) },
  meta: { flexDirection: 'row', alignItems: 'center', gap: hs(5) },
  metaText: { fontSize: ms(11.5), lineHeight: ms(16), color: theme.subtext },

  scoreBox: { marginTop: vs(11) },
  scoreLeft: { flexDirection: 'row', alignItems: 'baseline', gap: hs(8) },
  scorePct: { fontSize: ms(20), lineHeight: ms(26), fontWeight: '700' },
  scoreRaw: { fontSize: ms(12), lineHeight: ms(17), color: theme.subtext, fontWeight: '600' },
  barTrack: {
    height: vs(6),
    borderRadius: ms(3),
    backgroundColor: theme.background,
    marginTop: vs(6),
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: ms(3) },

  provisional: {
    fontSize: ms(11),
    lineHeight: ms(16),
    color: theme.subtext,
    fontStyle: 'italic',
    marginTop: vs(7),
  },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(7),
    backgroundColor: theme.primary,
    borderRadius: ms(11),
    paddingVertical: vs(10),
    marginTop: vs(12),
  },
  ctaResume: { backgroundColor: '#7C3AED' },
  closedNote: {
    fontSize: ms(11.5),
    lineHeight: ms(16),
    color: theme.subtext,
    marginTop: vs(9),
  },
  ctaText: { color: '#FFF', fontSize: ms(13.5), lineHeight: ms(19), fontWeight: '700' },

  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    paddingBottom: vs(24),
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hs(20),
    paddingTop: vs(16),
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sheetTitle: { fontSize: ms(16), fontWeight: '700', color: theme.text },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hs(20),
    paddingVertical: vs(14),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sheetRowText: { flex: 1, fontSize: ms(14), lineHeight: ms(20), color: theme.text },
  sheetRowTextOn: { color: theme.primary, fontWeight: '700' },
});
