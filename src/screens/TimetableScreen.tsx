import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'UNSCHEDULED'];

export function TimetableScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [isLoading, setIsLoading] = useState(true);
  const [timetableData, setTimetableData] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res: any = await schoolApi.getTimetable();
        const list: any[] = Array.isArray(res?.timetable)
          ? res.timetable
          : Array.isArray(res?.data?.timetable)
            ? res.data.timetable
            : Array.isArray(res?.data)
              ? res.data
              : [];

        // Group the flat list by weekday and keep the school-week order.
        const byDay = new Map<string, any[]>();
        list.forEach(entry => {
          const day = String(entry.day || 'UNSCHEDULED').toUpperCase();
          if (!byDay.has(day)) byDay.set(day, []);
          byDay.get(day)!.push(entry);
        });

        const formattedData = DAY_ORDER
          .filter(day => byDay.has(day))
          .map(day => ({
            day: day.charAt(0) + day.slice(1).toLowerCase(),
            periods: byDay.get(day)!.sort(
              (a, b) =>
                (a.periodNumber ?? 0) - (b.periodNumber ?? 0) ||
                String(a.startTime || '').localeCompare(String(b.startTime || '')),
            ),
          }));

        setTimetableData(formattedData);
      } catch (err) {
        console.error('Error fetching timetable:', err);
        setLoadError('Could not load your timetable. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: vs(16), color: theme.subtext }}>Loading timetable...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={{ marginRight: hs(12) }}>
          <ArrowLeft size={ms(24)} color={theme.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Weekly timetable</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>Your classes for the week</Text>
        </View>
      </View>

      {timetableData.length > 0 ? timetableData.map((day, idx) => (
        <View key={idx} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
          <Text style={styles.day}>{day.day}</Text>
          {day.periods.map((period: any, index: number) => (
            <View key={period.periodId || `${idx}-${index}`} style={styles.periodRow}>
              <Text style={styles.periodNumber}>{period.periodNumber ?? index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.periodTitle}>{period.subject || period.periodName || 'Class'}</Text>
                <Text style={styles.periodMeta}>
                  {[
                    period.startTime && period.endTime ? `${period.startTime} - ${period.endTime}` : '',
                    period.teacher,
                    period.room,
                  ].filter(Boolean).join(' • ')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )) : (
        <Text style={[styles.subtitle, { color: theme.subtext, textAlign: 'center', marginTop: vs(40) }]}>
          {loadError || 'No classes scheduled.'}
        </Text>
      )}
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8ff' },
  content: { padding: ms(16), paddingBottom: vs(32) },
  title: { fontSize: ms(24), fontWeight: '800', color: theme.text },
  subtitle: { fontSize: ms(14), color: theme.subtext, marginTop: vs(4), marginBottom: vs(14) },
  card: {
    backgroundColor: theme.surface,
    borderRadius: ms(18),
    padding: ms(14),
    marginBottom: vs(12),
    shadowColor: theme.subtext,
    shadowOpacity: 0.12,
    shadowRadius: ms(10),
    elevation: 3,
  },
  day: { fontSize: ms(16), fontWeight: '800', color: theme.primary, marginBottom: vs(8) },
  periodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: vs(6) },
  periodMeta: { fontSize: ms(12), color: theme.subtext, marginTop: vs(2) },
  periodNumber: {
    width: hs(24),
    height: vs(24),
    borderRadius: ms(12),
    backgroundColor: '#dbeafe',
    color: theme.primary,
    textAlign: 'center',
    lineHeight: ms(24),
    fontWeight: '800',
    marginRight: hs(10),
  },
  periodTitle: { fontSize: ms(14), fontWeight: '700', color: theme.text },
});
