import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export function TimetableScreen({ theme }: { theme: { background: string; surface: string; text: string; subtext: string; primary: string; primarySoft: string; border: string; accent: string } }) {

const timetableData = [
  { day: 'Mon', periods: ['Mathematics', 'English', 'Science', 'History'] },
  { day: 'Tue', periods: ['Chemistry', 'Mathematics', 'PE', 'Art'] },
  { day: 'Wed', periods: ['Biology', 'Hindi', 'Physics', 'Computer'] },
  { day: 'Thu', periods: ['English', 'Mathematics', 'Chemistry', 'History'] },
  { day: 'Fri', periods: ['Physics', 'Biology', 'English', 'Mathematics'] },
];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>Weekly timetable</Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>Your classes for the week</Text>

      {timetableData.map((day) => (
        <View key={day.day} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
          <Text style={styles.day}>{day.day}</Text>
          {day.periods.map((period, index) => (
            <View key={`${day.day}-${period}`} style={styles.periodRow}>
              <Text style={styles.periodNumber}>{index + 1}</Text>
              <Text style={styles.periodTitle}>{period}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8ff' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#94a3b8',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  day: { fontSize: 16, fontWeight: '800', color: '#2563eb', marginBottom: 8 },
  periodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  periodNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '800',
    marginRight: 10,
  },
  periodTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
});
