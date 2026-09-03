import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { ArrowLeft, Clock, MapPin } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { hs, vs, ms } from '../utils/responsive';

export function TeacherTimetableScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await schoolApi.teacher.getTimetables();
        let records = [];
        if (Array.isArray(res)) records = res;
        else if (res && Array.isArray(res.data)) records = res.data;

        if (records.length === 0) {
          records = [
            { id: 't1', time: '09:00  AM - 10:00 AM', subject: 'Mathematics', class: 'Class 10 A', room: 'Room 204' },
            { id: 't2', time: '10:15 AM - 11:15 AM', subject: 'Physics', class: 'Class 9 B', room: 'Lab 1' },
            { id: 't3', time: '11:30 AM - 12:30 PM', subject: 'Mathematics', class: 'Class 10 C', room: 'Room 205' },
          ];
        }
        setSchedule(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('teacherDashboard')} style={{ marginRight: hs(12) }}>
            <ArrowLeft size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Timetable</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>Your schedule for today</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : schedule.length === 0 ? (
          <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: vs(40) }}>No classes scheduled today.</Text>
        ) : (
          schedule.map(item => (
          <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeText}>{item.time.split('-')[0].trim()}</Text>
              <View style={styles.timeLine} />
              <Text style={styles.timeText}>{item.time.split('-')[1].trim()}</Text>
            </View>
            
            <View style={styles.detailsColumn}>
              <Text style={[styles.subject, { color: theme.primary }]}>{item.subject}</Text>
              <Text style={[styles.className, { color: theme.text }]}>{item.class}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: vs(8) }}>
                <MapPin size={ms(14)} color={theme.subtext} style={{ marginRight: hs(4) }} />
                <Text style={[styles.roomText, { color: theme.subtext }]}>{item.room}</Text>
              </View>
            </View>
          </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8ff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: hs(16), paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: vs(16), backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { fontSize: ms(24), fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: ms(14), color: '#64748B', marginTop: vs(2) },
  content: { padding: ms(16), paddingBottom: vs(32) },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: ms(16),
    padding: ms(16),
    marginBottom: vs(16),
    shadowColor: '#94a3b8',
    shadowOpacity: 0.1,
    shadowRadius: ms(8),
    elevation: 2,
  },
  timeColumn: { width: hs(80), alignItems: 'center', justifyContent: 'space-between', borderRightWidth: 1, borderRightColor: '#E2E8F0', paddingRight: hs(12), marginRight: hs(12) },
  timeText: { fontSize: ms(12), fontWeight: '700', color: '#64748B', textAlign: 'center' },
  timeLine: { width: hs(2), flex: 1, backgroundColor: '#E2E8F0', marginVertical: vs(4) },
  detailsColumn: { flex: 1, justifyContent: 'center' },
  subject: { fontSize: ms(12), fontWeight: '800', textTransform: 'uppercase', marginBottom: vs(4) },
  className: { fontSize: ms(18), fontWeight: '700', color: '#1E293B' },
  roomText: { fontSize: ms(13), fontWeight: '500' },
});
