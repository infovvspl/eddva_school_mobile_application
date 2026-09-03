import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { ChevronLeft, UserCheck } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

type AttendanceRecord = {
  sessionId?: string;
  date?: string;
  period?: string;
  className?: string;
  sectionName?: string;
  subjectName?: string;
  present?: number;
  absent?: number;
  late?: number;
  leave?: number;
  finalized?: boolean;
};

// The API sends "N/A" for fields it has no value for.
const clean = (v?: string) => (!v || v === 'N/A' ? '' : v);

// The API returns either a bare array or an enveloped { data: [...] }.
const unwrapList = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.records)) return res.records;
  if (Array.isArray(res?.data?.records)) return res.data.records;
  return [];
};

const readPercent = (res: any): number | null => {
  const v =
    res?.percentage ?? res?.data?.percentage ??
    res?.attendancePercentage ?? res?.data?.attendancePercentage;
  return v === undefined || v === null ? null : Number(v);
};

export function AttendanceScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [percent, setPercent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      // The report carries the summary percentage; history carries the rows.
      const [historyRes, reportRes] = await Promise.all([
        schoolApi.getAttendanceHistory().catch(() => schoolApi.getAttendance()),
        schoolApi.getAttendanceReport().catch(() => null),
      ]);
      setRecords(unwrapList(historyRes));
      setPercent(readPercent(reportRes));
    } catch (err: any) {
      console.error('[attendance] load failed', err);
      setError(err?.message || 'Could not load attendance. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('dashboard')}>
          <ChevronLeft size={ms(24)} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <View style={{ width: ms(32) }} />
      </View>
      {loading ? (
        <View style={styles.content}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={records.length === 0 ? styles.content : styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          {error ? (
            <>
              <UserCheck size={ms(48)} color={theme.subtext} />
              <Text style={styles.emptyText}>{error}</Text>
            </>
          ) : records.length === 0 ? (
            <>
              <UserCheck size={ms(48)} color={theme.subtext} />
              <Text style={styles.emptyText}>No attendance records yet.</Text>
            </>
          ) : (
            <>
              {percent !== null && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryValue}>{percent}%</Text>
                  <Text style={styles.summaryLabel}>Overall attendance</Text>
                </View>
              )}
              {records.map((r, i) => {
                const section = clean(r.sectionName);
                const subject = clean(r.subjectName);
                const period = clean(r.period);
                const meta = [
                  r.date ? new Date(r.date).toDateString() : '',
                  subject,
                  period ? `Period ${period}` : '',
                ].filter(Boolean).join(' • ');
                return (
                  <View key={r.sessionId || i} style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowTitle}>
                        {clean(r.className) || 'Class'}{section ? ` · ${section}` : ''}
                      </Text>
                      {!!meta && <Text style={styles.rowDate}>{meta}</Text>}
                    </View>
                    <View style={styles.countGroup}>
                      <Text style={[styles.count, { color: '#059669' }]}>{r.present ?? 0}P</Text>
                      <Text style={[styles.count, { color: '#EF4444' }]}>{r.absent ?? 0}A</Text>
                      <Text style={[styles.count, { color: '#F59E0B' }]}>{r.late ?? 0}L</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    paddingVertical: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface
  },
  backBtn: { padding: ms(4) },
  headerTitle: { fontFamily: 'Poppins-Medium', fontSize: ms(18), color: theme.text },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background },
  emptyText: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.subtext, marginTop: vs(16), textAlign: 'center', paddingHorizontal: hs(32) },
  listContent: { padding: hs(16), paddingBottom: vs(32), backgroundColor: theme.background },
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: ms(16),
    padding: ms(20),
    alignItems: 'center',
    marginBottom: vs(16),
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryValue: { fontFamily: 'Poppins-Medium', fontSize: ms(32), color: theme.primary },
  summaryLabel: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.subtext, marginTop: vs(4) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: ms(12),
    padding: ms(14),
    marginBottom: vs(10),
    borderWidth: 1,
    borderColor: theme.border,
  },
  rowLeft: { flex: 1, paddingRight: hs(12) },
  rowTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: theme.text },
  rowDate: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext, marginTop: vs(2) },
  countGroup: { flexDirection: 'row', alignItems: 'center' },
  count: { fontFamily: 'Poppins-SemiBold', fontSize: ms(13), marginLeft: hs(8) }
});
