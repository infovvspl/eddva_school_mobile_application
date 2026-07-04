import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { assignments } from '../data/school-data';

export function AssignmentsScreen({ theme }: { theme: { background: string; surface: string; text: string; subtext: string; primary: string; primarySoft: string; border: string; accent: string } }) {
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>Assignments</Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>Stay on top of your work</Text>

      {assignments.map((item) => (
        <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
          <View style={styles.rowBetween}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.note}>Keep track of homework and class tasks</Text>
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
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subject: { fontSize: 13, fontWeight: '700', color: '#2563eb' },
  status: { fontSize: 12, fontWeight: '700', color: '#047857', textTransform: 'capitalize' },
  titleText: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 6 },
  note: { fontSize: 12, color: '#64748b', marginTop: 6 },
});
