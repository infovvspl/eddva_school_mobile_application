import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell, BookOpen, FileText, Clock, FileImage, Video, CheckSquare, MessageCircle,
  Radio, ChevronRight, Inbox, CircleAlert, Send, ClipboardCheck, GraduationCap, Users,
} from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';
import { hs, vs, ms } from '../utils/responsive';
import { HeaderBackdrop } from '../components/HeaderBackdrop';

const { width: SCREEN_W } = Dimensions.get('window');

const DAY_NAMES = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const toMinutes = (hhmm: string) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm ?? ''));
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};
const fmt = (hhmm: string) => {
  const mins = toMinutes(hhmm);
  if (mins === null) return String(hhmm ?? '');
  const h = Math.floor(mins / 60), m = mins % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export function TeacherDashboardScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [inbox, setInbox] = useState<any[]>([]);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [headerSize, setHeaderSize] = useState({ w: 0, h: 0 });
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    // /school/teachers/stats is an institute-wide staff-headcount endpoint,
    // not "my dashboard" -- confirmed live (totalTeachers/presentToday, no
    // per-teacher fields at all), so this screen is built entirely from the
    // endpoints that actually carry this teacher's own data instead.
    Promise.all([
      schoolApi.getMe().catch(() => null),
      schoolApi.getUnreadNotificationsCount().catch(() => null),
      schoolApi.teacher.getTimetables().catch(() => null),
      schoolApi.teacher.getAssignments().catch(() => null),
      schoolApi.teacher.getInboxSubmissions().catch(() => null),
      schoolApi.teacher.getDoubts().catch(() => null),
      schoolApi.teacher.getAssessments().catch(() => null),
    ]).then(([meRes, unread, ttRes, asgRes, inboxRes, doubtRes, assessRes]) => {
      setMe(meRes?.data ?? meRes);
      const uc = unread?.count ?? unread?.data?.count ?? unread?.unreadCount;
      setUnreadCount(Number(uc) || 0);
      const tt = Array.isArray(ttRes) ? ttRes : (ttRes?.data ?? []);
      setTimetable(Array.isArray(tt) ? tt : []);
      const asg = Array.isArray(asgRes) ? asgRes : (asgRes?.data ?? []);
      setAssignments(Array.isArray(asg) ? asg : []);
      const ib = Array.isArray(inboxRes) ? inboxRes : (inboxRes?.data ?? []);
      setInbox(Array.isArray(ib) ? ib : []);
      const db = Array.isArray(doubtRes) ? doubtRes : (doubtRes?.data ?? []);
      setDoubts(Array.isArray(db) ? db : []);
      const asm = Array.isArray(assessRes) ? assessRes : (assessRes?.data ?? []);
      setAssessments(Array.isArray(asm) ? asm : []);
    }).finally(() => setLoading(false));
  }, []);

  const myId = me?.id;
  const firstName = (me?.name || '').trim().split(/\s+/)[0] || 'Teacher';
  const initials =
    (me?.name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2)
      .map((w: string) => w.charAt(0)).join('').toUpperCase() || 'T';

  // Only this teacher's own periods -- /school/timetables returns the whole
  // institute's timetable with no server-side filter for "mine".
  const myPeriods = useMemo(
    () => timetable.filter(p => (p.teacher?.user?.id ?? p.teacherId) === myId),
    [timetable, myId],
  );
  const todayPeriods = useMemo(() => {
    const today = DAY_NAMES[now.getDay()];
    return myPeriods
      .filter(p => p.dayOfWeek === today)
      .sort((a, b) => (toMinutes(a.startTime) ?? 0) - (toMinutes(b.startTime) ?? 0));
  }, [myPeriods, now]);

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const phaseOf = (p: any) => {
    const s = toMinutes(p.startTime), e = toMinutes(p.endTime);
    if (s === null || e === null) return 'upcoming';
    if (nowMins >= e) return 'done';
    if (nowMins >= s) return 'live';
    return 'upcoming';
  };

  const pendingGrading = useMemo(
    () => inbox.filter(s => s.status && s.status !== 'graded').length,
    [inbox],
  );
  const doubtsAwaiting = useMemo(
    () => doubts.filter(d => d.status === 'escalated').length,
    [doubts],
  );
  const scheduledAssessments = useMemo(
    () => assessments.filter(a => a.status === 'scheduled').length,
    [assessments],
  );

  // Distinct class + section this teacher actually teaches, with the real
  // subjects taught there -- derived from their own timetable, since
  // /school/classes and /school/classes/:id/students both 404 for this role.
  const myClasses = useMemo(() => {
    const map = new Map<string, { className: string; section: string; subjects: Set<string> }>();
    myPeriods.forEach(p => {
      const key = `${p.section?.class?.name}-${p.section?.name}`;
      if (!map.has(key)) {
        map.set(key, { className: p.section?.class?.name, section: p.section?.name, subjects: new Set() });
      }
      if (p.subject?.name) map.get(key)!.subjects.add(p.subject.name);
    });
    return Array.from(map.values());
  }, [myPeriods]);

  const QUICK_ACTIONS = [
    { id: 'teacherAttendance', label: 'Take Attendance', Icon: CheckSquare, color: '#F59E0B' },
    { id: 'teacherAssignments', label: 'Create Assignment', Icon: FileText, color: '#8B5CF6', badge: pendingGrading },
    { id: 'teacherAssessments', label: 'Create Assessment', Icon: ClipboardCheck, color: '#EF4444' },
    { id: 'teacherLiveHost', label: 'Start Live Class', Icon: Radio, color: '#DC2626' },
    { id: 'teacherClasses', label: 'My Classes', Icon: BookOpen, color: theme.primary },
    { id: 'teacherDoubts', label: 'Doubts', Icon: MessageCircle, color: '#3B82F6', badge: doubtsAwaiting },
    { id: 'teacherMaterials', label: 'Materials', Icon: FileImage, color: '#8B5CF6' },
    { id: 'teacherRecordings', label: 'Recordings', Icon: Video, color: '#10B981' },
    { id: 'teacherTimetable', label: 'Timetable', Icon: Clock, color: '#10B981' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View
          style={styles.hero}
          onLayout={e => setHeaderSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        >
          <HeaderBackdrop width={headerSize.w} height={headerSize.h} />
          <View style={[styles.header, { paddingTop: insets.top + vs(12) }]}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton} onPress={() => onNavigate('notifications')}>
                <Bell size={ms(20)} color="#fff" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarButton} onPress={() => onNavigate('profile')}>
                <Text style={styles.avatarText}>{initials}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.heroText}>
            <Text style={styles.greeting}>Welcome back, {firstName}!</Text>
            <Text style={styles.subtitle}>
              {loading
                ? 'Loading your day...'
                : todayPeriods.length === 0
                ? 'No classes on your schedule today.'
                : `${todayPeriods.filter(p => phaseOf(p) !== 'done').length} of ${todayPeriods.length} classes still to go today.`}
            </Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          {[
            { label: 'Classes Today', value: todayPeriods.length, Icon: Clock, color: theme.primary },
            { label: 'Assignments', value: assignments.length, Icon: FileText, color: '#8B5CF6' },
            { label: 'Doubts Waiting', value: doubtsAwaiting, Icon: MessageCircle, color: '#3B82F6' },
            { label: 'Tests Scheduled', value: scheduledAssessments, Icon: ClipboardCheck, color: '#EF4444' },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <View style={[styles.statIconBox, { backgroundColor: s.color + '18' }]}>
                <s.Icon size={ms(17)} color={s.color} />
              </View>
              <Text style={styles.statValue}>{loading ? '…' : s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.contentSection}>
          {/* Today's Schedule */}
          <View style={styles.rowHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => onNavigate('teacherTimetable')}>
              <Text style={styles.seeAllText}>Full timetable</Text>
            </TouchableOpacity>
          </View>

          {todayPeriods.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyStateText}>
                {loading ? 'Loading...' : 'Nothing on your timetable today.'}
              </Text>
            </View>
          ) : (
            // A vertical list of full-width cards was tall enough to push
            // Quick Actions off screen for a normal day (4+ periods). A
            // horizontal strip shows the same information -- every period
            // still fully visible, just scrolled sideways -- in a fraction
            // of the height.
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.scheduleScroll}
              contentContainerStyle={styles.scheduleRow}
            >
              {todayPeriods.map((p, i) => {
                const phase = phaseOf(p);
                return (
                  <View key={p.id ?? i} style={[styles.periodCard, phase === 'live' && styles.periodCardLive]}>
                    {phase === 'live' && (
                      <View style={styles.livePill}>
                        <Radio size={ms(9)} color="#fff" />
                        <Text style={styles.livePillText}>LIVE</Text>
                      </View>
                    )}
                    <Text style={[styles.periodTimeText, phase === 'done' && styles.dim]}>{fmt(p.startTime)}</Text>
                    <Text style={[styles.periodSubject, phase === 'done' && styles.dim]} numberOfLines={1}>
                      {p.subject?.name ?? 'Class'}
                    </Text>
                    <Text style={styles.periodMeta} numberOfLines={1}>
                      {p.section?.class?.name} - {p.section?.name}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map(a => (
              <TouchableOpacity key={a.id} style={styles.actionItem} onPress={() => onNavigate(a.id)}>
                <View style={styles.actionIconBox}>
                  <a.Icon size={ms(24)} color={a.color} />
                  {!!a.badge && (
                    <View style={styles.actionBadge}>
                      <Text style={styles.actionBadgeText}>{a.badge > 9 ? '9+' : a.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionLabel} numberOfLines={2}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Needs Your Attention */}
          {(pendingGrading > 0 || doubtsAwaiting > 0) && (
            <>
              <Text style={styles.sectionTitle}>Needs Your Attention</Text>
              <View style={{ gap: vs(10), marginBottom: vs(20) }}>
                {pendingGrading > 0 && (
                  <TouchableOpacity style={styles.alertCard} onPress={() => onNavigate('teacherAssignments')}>
                    <View style={[styles.alertIcon, { backgroundColor: '#FEF3C7' }]}>
                      <Inbox size={ms(17)} color="#B45309" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>Pending Evaluations</Text>
                      <Text style={styles.alertSub}>
                        {pendingGrading} submission{pendingGrading === 1 ? '' : 's'} waiting for review
                      </Text>
                    </View>
                    <ChevronRight size={ms(16)} color={theme.subtext} />
                  </TouchableOpacity>
                )}
                {doubtsAwaiting > 0 && (
                  <TouchableOpacity style={styles.alertCard} onPress={() => onNavigate('teacherDoubts')}>
                    <View style={[styles.alertIcon, { backgroundColor: '#DBEAFE' }]}>
                      <CircleAlert size={ms(17)} color="#1D4ED8" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>Unanswered Doubts</Text>
                      <Text style={styles.alertSub}>
                        {doubtsAwaiting} question{doubtsAwaiting === 1 ? '' : 's'} escalated to you
                      </Text>
                    </View>
                    <ChevronRight size={ms(16)} color={theme.subtext} />
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* My Classes */}
          <View style={styles.rowHeader}>
            <Text style={styles.sectionTitle}>My Classes</Text>
            <TouchableOpacity onPress={() => onNavigate('teacherClasses')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {myClasses.length === 0 ? (
            <View style={styles.emptyStateBox}>
              <Text style={styles.emptyStateText}>
                {loading ? 'Loading...' : 'No classes on your timetable yet.'}
              </Text>
            </View>
          ) : (
            <View style={{ gap: vs(10) }}>
              {myClasses.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.classCard}
                  onPress={() => onNavigate('teacherClasses')}
                  activeOpacity={0.85}
                >
                  <View style={styles.classIcon}>
                    <GraduationCap size={ms(20)} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.classTitle}>{c.className} - Section {c.section}</Text>
                    <Text style={styles.classSubjects} numberOfLines={1}>
                      {Array.from(c.subjects).join(' · ') || 'No subjects yet'}
                    </Text>
                  </View>
                  <ChevronRight size={ms(16)} color={theme.subtext} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scrollContent: { paddingBottom: vs(60) },
  hero: { backgroundColor: '#1e3a8a', overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hs(20),
  },
  logo: { width: hs(100), height: vs(36), tintColor: '#fff' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { padding: ms(8), marginRight: hs(6) },
  badge: {
    position: 'absolute', top: vs(4), right: hs(4),
    backgroundColor: '#ef4444', width: hs(16), height: vs(16), borderRadius: ms(8),
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: ms(9.5), fontWeight: '700' },
  avatarButton: {
    width: hs(36), height: vs(36), borderRadius: ms(18),
    backgroundColor: 'rgba(255,255,255,0.16)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: ms(13) },
  heroText: { paddingHorizontal: hs(20), paddingTop: vs(20), paddingBottom: vs(36) },
  greeting: { fontSize: ms(21), fontWeight: '700', color: '#fff', marginBottom: vs(4) },
  subtitle: { fontSize: ms(13), color: 'rgba(255,255,255,0.8)' },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    marginHorizontal: hs(16),
    marginTop: -vs(24),
    borderRadius: ms(16),
    padding: ms(14),
    shadowColor: '#000', shadowOffset: { width: 0, height: vs(4) }, shadowOpacity: 0.1, shadowRadius: ms(12), elevation: 5,
    justifyContent: 'space-between',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statIconBox: {
    width: hs(34), height: vs(34), borderRadius: ms(10),
    justifyContent: 'center', alignItems: 'center', marginBottom: vs(6),
  },
  statValue: { fontSize: ms(17), fontWeight: '700', color: theme.text },
  statLabel: { fontSize: ms(9.5), color: theme.subtext, fontWeight: '600', textAlign: 'center', marginTop: vs(2) },

  contentSection: { padding: hs(20) },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: vs(4), marginBottom: vs(12) },
  sectionTitle: { fontSize: ms(17), fontWeight: '700', color: theme.text, marginBottom: vs(12), marginTop: vs(4) },
  seeAllText: { color: theme.primary, fontWeight: '700', fontSize: ms(13) },

  scheduleScroll: { flexGrow: 0, marginBottom: vs(22) },
  scheduleRow: { flexDirection: 'row', gap: hs(10), paddingRight: hs(6) },
  periodCard: {
    width: hs(128),
    backgroundColor: theme.surface,
    borderRadius: ms(14),
    borderWidth: 1.5,
    borderColor: 'rgba(37,99,235,0.35)',
    padding: ms(11),
  },
  periodCardLive: { borderColor: '#16A34A', borderWidth: 1.5, backgroundColor: '#F0FDF4' },
  periodTimeText: { fontSize: ms(11.5), fontWeight: '700', color: theme.text, marginTop: vs(6) },
  periodSubject: { fontSize: ms(13.5), fontWeight: '700', color: theme.text, marginTop: vs(3) },
  periodMeta: { fontSize: ms(10.5), color: theme.subtext, marginTop: vs(2) },
  dim: { color: theme.subtext },
  livePill: {
    flexDirection: 'row', alignItems: 'center', gap: hs(3), alignSelf: 'flex-start',
    backgroundColor: '#16A34A', borderRadius: ms(8), paddingHorizontal: hs(6), paddingVertical: vs(2),
  },
  livePillText: { color: '#fff', fontSize: ms(8.5), fontWeight: '700' },

  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(10), marginBottom: vs(6) },
  // Four evenly-sized columns across the real screen width, not a hardcoded
  // stand-in width -- that mismatch was leaving each row one tile short and
  // the spacing uneven, since the tiles never actually summed to the
  // container's real width.
  actionItem: {
    // contentSection's own padding (hs(20) each side) plus the 3 inter-column
    // gaps below, so four tiles land flush with both edges of the row.
    width: (SCREEN_W - hs(40) - hs(30)) / 4,
    alignItems: 'center',
    marginBottom: vs(14),
  },
  actionIconBox: {
    width: hs(58), height: vs(58), borderRadius: ms(16), backgroundColor: theme.surface,
    justifyContent: 'center', alignItems: 'center', marginBottom: vs(7),
    shadowColor: '#000', shadowOffset: { width: 0, height: vs(2) }, shadowOpacity: 0.06, shadowRadius: ms(6), elevation: 2,
  },
  actionBadge: {
    position: 'absolute', top: -vs(4), right: -hs(4),
    backgroundColor: '#ef4444', minWidth: hs(18), height: vs(18), borderRadius: ms(9),
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.surface, paddingHorizontal: hs(3),
  },
  actionBadgeText: { color: '#fff', fontSize: ms(9.5), fontWeight: '700' },
  actionLabel: { fontSize: ms(11), color: theme.subtext, fontWeight: '600', textAlign: 'center', lineHeight: ms(14) },

  emptyStateBox: {
    backgroundColor: theme.surface, borderRadius: ms(14), padding: ms(20),
    alignItems: 'center', borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed', marginBottom: vs(20),
  },
  emptyStateText: { color: theme.subtext, fontSize: ms(13), fontWeight: '500' },

  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: hs(11),
    backgroundColor: theme.surface, borderRadius: ms(14), borderWidth: 1, borderColor: theme.border, padding: ms(12),
  },
  alertIcon: { width: hs(38), height: vs(38), borderRadius: ms(11), justifyContent: 'center', alignItems: 'center' },
  alertTitle: { fontSize: ms(13.5), fontWeight: '700', color: theme.text },
  alertSub: { fontSize: ms(11.5), color: theme.subtext, marginTop: vs(2) },

  classCard: {
    flexDirection: 'row', alignItems: 'center', gap: hs(12),
    backgroundColor: theme.surface, borderRadius: ms(14), borderWidth: 1, borderColor: theme.border, padding: ms(13),
  },
  classIcon: {
    width: hs(42), height: vs(42), borderRadius: ms(12),
    backgroundColor: theme.primarySoft ?? '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  classTitle: { fontSize: ms(14.5), fontWeight: '700', color: theme.text },
  classSubjects: { fontSize: ms(11.5), color: theme.subtext, marginTop: vs(2) },
});
