import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { student } from '../data/school-data';

export function ProfileScreen({ theme }: { theme: { background: string; surface: string; text: string; subtext: string; primary: string; primarySoft: string; border: string; accent: string } }) {
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.headerCard, { backgroundColor: theme.primary }]}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{student.avatarInitials}</Text>
        </View>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.subtext}>{student.className}</Text>
        <Text style={styles.subtext}>{student.school}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Student info</Text>
        <Text style={styles.infoRow}>Roll No: 24</Text>
        <Text style={styles.infoRow}>Level: 7</Text>
        <Text style={styles.infoRow}>XP: 1840</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8ff' },
  content: { padding: 16, paddingBottom: 32 },
  headerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtext: { color: '#cbd5e1', fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#94a3b8',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  infoRow: { fontSize: 14, color: '#475569', marginTop: 6 },
});
