import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import {
  ArrowLeft, MapPin, User, CalendarDays, Radio, CheckCircle2, ChevronRight,
} from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

type Phase = 'done' | 'now' | 'next' | 'upcoming';

// "08:45" -> minutes since midnight, so periods can be compared to the clock.
const toMinutes = (hhmm: string) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm ?? ''));
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

const fmt = (hhmm: string) => {
  const mins = toMinutes(hhmm);
  if (mins === null) return String(hhmm ?? '');
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
};

export function TodayScheduleScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Re-renders on a timer so "happening now" stays honest while the screen is open.
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    schoolApi
      .getDashboardStats()
      .then((res: any) => {
        const d = res?.data ?? res;
        const list = Array.isArray(d?.todayPlan) ? d.todayPlan : [];
        setPlan(
          [...list].sort(
            (a, b) => (toMinutes(a.startTime) ?? 0) - (toMinutes(b.startTime) ?? 0),
          ),
        );
      })
      .catch((e: any) => setError(e?.message || 'Could not load your schedule.'))
      .finally(() => setLoading(false));
  }, []);

  const nowMins = now.getHours() * 60 + now.getMinutes();

  // The first period that has not finished yet is "next"; anything covering
  // the current minute is "now".
  const phases = useMemo(() => {
    let nextTaken = false;
    return plan.map(p => {
      const s = toMinutes(p.startTime);
      const e = toMinutes(p.endTime);
      if (s === null || e === null) return 'upcoming' as Phase;
      if (nowMins >= e) return 'done' as Phase;
      if (nowMins >= s && nowMins < e) return 'now' as Phase;
      if (!nextTaken) { nextTaken = true; return 'next' as Phase; }
      return 'upcoming' as Phase;
    });
  }, [plan, nowMins]);

  const doneCount = phases.filter(p => p === 'done').length;
  const nextIdx = phases.findIndex(p => p === 'next');
  const nowIdx = phases.findIndex(p => p === 'now');

  const headline = () => {
    if (!plan.length) return 'No classes scheduled';
    if (nowIdx >= 0) return `${plan[nowIdx].subjectName} is in session`;
    if (nextIdx >= 0) {
      const mins = (toMinutes(plan[nextIdx].startTime) ?? 0) - nowMins;
      if (mins <= 60) return `${plan[nextIdx].subjectName} starts in ${mins} min`;
      return `Next up: ${plan[nextIdx].subjectName} at ${fmt(plan[nextIdx].startTime)}`;
    }
    return 'All classes done for today';
  };

  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={styles.back}>
          <ArrowLeft size={ms(22)} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Today's Schedule</Text>
          <Text style={styles.subtitle}>{dateLabel}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.banner}>
            <Text style={styles.bannerHead}>{headline()}</Text>
            {plan.length > 0 && (
              <Text style={styles.bannerSub}>
                {doneCount} of {plan.length} classes done
              </Text>
            )}
          </View>

          {error ? (
            <Text style={styles.empty}>{error}</Text>
          ) : plan.length === 0 ? (
            <Text style={styles.empty}>Nothing scheduled for today. Enjoy the break.</Text>
          ) : (
            plan.map((p, i) => {
              const phase = phases[i];
              const isNow = phase === 'now';
              const isDone = phase === 'done';
              return (
                <View key={p.id ?? i} style={styles.row}>
                  {/* Time rail with a connector, so the day reads as a timeline. */}
                  <View style={styles.railCol}>
                    <Text style={[styles.time, isDone && styles.dim]}>{fmt(p.startTime)}</Text>
                    <View style={[styles.dot, isNow && styles.dotNow, isDone && styles.dotDone]} />
                    {i < plan.length - 1 && <View style={styles.line} />}
                  </View>

                  <View
                    style={[
                      styles.card,
                      isNow && styles.cardNow,
                      isDone && styles.cardDone,
                    ]}
                  >
                    <View style={styles.cardTop}>
                      <Text style={[styles.subject, isDone && styles.dim]} numberOfLines={1}>
                        {p.subjectName || 'Class'}
                      </Text>
                      {isNow && (
                        <View style={styles.nowPill}>
                          <Radio size={ms(10)} color="#FFF" />
                          <Text style={styles.nowPillText}>NOW</Text>
                        </View>
                      )}
                      {phase === 'next' && (
                        <View style={styles.nextPill}>
                          <Text style={styles.nextPillText}>NEXT</Text>
                        </View>
                      )}
                      {isDone && <CheckCircle2 size={ms(15)} color={theme.subtext} />}
                    </View>

                    <Text style={[styles.slot, isDone && styles.dim]}>
                      {fmt(p.startTime)} – {fmt(p.endTime)}
                    </Text>

                    <View style={styles.metaRow}>
                      {!!p.teacherName && (
                        <View style={styles.meta}>
                          <User size={ms(12)} color={theme.subtext} />
                          <Text style={styles.metaText} numberOfLines={1}>{p.teacherName}</Text>
                        </View>
                      )}
                      {!!p.room && (
                        <View style={styles.meta}>
                          <MapPin size={ms(12)} color={theme.subtext} />
                          <Text style={styles.metaText} numberOfLines={1}>{p.room}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}

          <TouchableOpacity
            style={styles.weekBtn}
            onPress={() => onNavigate && onNavigate('timetable')}
            activeOpacity={0.85}
          >
            <CalendarDays size={ms(16)} color={theme.primary} />
            <Text style={styles.weekBtnText}>View full weekly timetable</Text>
            <ChevronRight size={ms(16)} color={theme.primary} />
          </TouchableOpacity>
        </ScrollView>
      )}
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
  subtitle: { fontSize: ms(13), color: theme.subtext, marginTop: vs(1) },

  content: { padding: hs(16), paddingBottom: vs(100) },

  banner: {
    backgroundColor: theme.primary,
    borderRadius: ms(16),
    padding: ms(14),
    marginBottom: vs(18),
  },
  bannerHead: { color: '#FFF', fontSize: ms(15), fontWeight: '700', lineHeight: ms(21) },
  bannerSub: { color: '#DBEAFE', fontSize: ms(12), marginTop: vs(3) },

  empty: { textAlign: 'center', color: theme.subtext, fontSize: ms(13), paddingVertical: vs(30) },

  row: { flexDirection: 'row' },
  railCol: { width: hs(64), alignItems: 'center' },
  time: { fontSize: ms(11), fontWeight: '700', color: theme.text },
  dot: {
    width: ms(9),
    height: ms(9),
    borderRadius: ms(5),
    backgroundColor: theme.primary,
    marginTop: vs(5),
  },
  dotNow: { width: ms(13), height: ms(13), borderRadius: ms(7), backgroundColor: '#16A34A' },
  dotDone: { backgroundColor: theme.border },
  line: { flex: 1, width: 2, backgroundColor: theme.border, marginTop: vs(3) },

  card: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: theme.border,
    padding: ms(13),
    marginBottom: vs(12),
  },
  cardNow: { borderColor: '#16A34A', borderWidth: 1.5, backgroundColor: '#F0FDF4' },
  cardDone: { opacity: 0.62 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: hs(8) },
  subject: { flex: 1, fontSize: ms(15), fontWeight: '700', color: theme.text },
  dim: { color: theme.subtext },

  nowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    backgroundColor: '#16A34A',
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    borderRadius: ms(10),
  },
  nowPillText: { color: '#FFF', fontSize: ms(9.5), fontWeight: '700', letterSpacing: 0.5 },
  nextPill: {
    backgroundColor: theme.primarySoft ?? '#EFF6FF',
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    borderRadius: ms(10),
  },
  nextPillText: { color: theme.primary, fontSize: ms(9.5), fontWeight: '700', letterSpacing: 0.5 },

  slot: { fontSize: ms(12.5), lineHeight: ms(18), color: theme.subtext, marginTop: vs(3) },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(12), marginTop: vs(8) },
  meta: { flexDirection: 'row', alignItems: 'center', gap: hs(5), maxWidth: '60%' },
  metaText: { fontSize: ms(12), lineHeight: ms(17), color: theme.subtext },

  weekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.primary,
    borderRadius: ms(14),
    paddingVertical: vs(12),
    marginTop: vs(6),
  },
  weekBtnText: { color: theme.primary, fontSize: ms(13.5), fontWeight: '700' },
});
