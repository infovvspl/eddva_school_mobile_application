import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { student, assignments, announcements } from '../data/school-data';

export function DashboardScreen({ theme }: { theme: { background: string; surface: string; text: string; subtext: string; primary: string; primarySoft: string; border: string; accent: string } }) {

const todayClasses = [
  { subject: 'Mathematics', time: '08:00', room: 'Room 12', color: '#f59e0b', icon: '✏️' },
  { subject: 'English', time: '09:00', room: 'Room 08', color: '#8b5cf6', icon: '📖' },
  { subject: 'Science', time: '10:30', room: 'Lab 2', color: '#10b981', icon: '🧪' },
];

  const pending = assignments.filter((a) => a.status === 'pending').slice(0, 2);
  const latestNews = announcements.slice(0, 2);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
        <View style={styles.heroGlow} />
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>School Student Portal</Text>
            <Text style={[styles.heroTitle, { color: '#ffffff' }]}>Hello, {student.name}</Text>
            <Text style={[styles.heroSubtitle, { color: '#e0f2fe' }]}>{student.className} • {student.school}</Text>
          </View>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{student.avatarInitials}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>94%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Today's classes</Text>
          <Text style={styles.cardBadge}>Live</Text>
        </View>
        {todayClasses.map((item) => (
          <View key={item.subject} style={styles.classRow}>
            <View style={[styles.subjectBadge, { backgroundColor: item.color }]}>
              <Text style={styles.subjectBadgeText}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.classTitle}>{item.subject}</Text>
              <Text style={styles.classMeta}>{item.time} • {item.room}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Urgent assignments</Text>
          <Text style={styles.cardLink}>View all</Text>
        </View>
        {pending.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listMeta}>{item.subject}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Announcements</Text>
          <Text style={styles.cardLink}>New</Text>
        </View>
        {latestNews.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listMeta}>{item.time}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Open full portal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8ff',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#2563eb',
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  heroGlow: {
    position: 'absolute',
    right: -20,
    top: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fbbf24',
    opacity: 0.2,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eyebrow: {
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#dbeafe',
    fontSize: 13,
    marginTop: 2,
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffffff22',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statChip: {
    flex: 1,
    backgroundColor: '#ffffff16',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: '#dbeafe',
    fontSize: 11,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#94a3b8',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardBadge: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  cardLink: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subjectBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectBadgeText: {
    fontSize: 16,
  },
  classTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  classMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  listItem: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  listMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#0f172a',
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
  },
});
