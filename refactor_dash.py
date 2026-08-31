import re

filepath = 'src/screens/DashboardScreen.tsx'

content = """import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

export function DashboardScreen({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profData, statsData, timetableData, assignData, noticeData] = await Promise.all([
          schoolApi.getMyProfile().catch(() => null),
          schoolApi.getDashboardStats().catch(() => null),
          schoolApi.getTimetable().catch(() => null),
          schoolApi.getAssignments().catch(() => []),
          schoolApi.getPlatformNotices().catch(() => [])
        ]);

        setProfile(profData || { name: 'Student', className: 'Class 10', school: 'School', avatarInitials: 'S' });
        setStats(statsData || { streak: 0, points: 0, attendance: 0 });
        
        // Pick today's classes (mock data has dates like '2026-07-08', we'll just take the first array we find)
        let todayClasses = [];
        if (timetableData) {
          const firstDateKey = Object.keys(timetableData)[0];
          if (firstDateKey) {
            todayClasses = timetableData[firstDateKey];
          }
        }
        
        setClasses(todayClasses.slice(0, 3));
        setAssignments(assignData.slice(0, 2));
        setAnnouncements(noticeData.slice(0, 2));
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: 16, color: theme.subtext }}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
        <View style={styles.heroGlow} />
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>School Student Portal</Text>
            <Text style={[styles.heroTitle, { color: theme.surface }]}>Hello, {profile.name}</Text>
            <Text style={[styles.heroSubtitle, { color: '#e0f2fe' }]}>{profile.className} • {profile.school}</Text>
          </View>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>94%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{assignments.length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Today's classes</Text>
          <Text style={styles.cardBadge}>Live</Text>
        </View>
        {classes.length > 0 ? classes.map((item: any, idx) => {
          // Use colors based on index for variety
          const colors = ['#f59e0b', '#8b5cf6', '#10b981'];
          const color = colors[idx % colors.length];
          return (
            <View key={item.id || idx} style={styles.classRow}>
              <View style={[styles.subjectBadge, { backgroundColor: color }]}>
                <Text style={styles.subjectBadgeText}>{item.title?.[0] || 'C'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.classTitle}>{item.title}</Text>
                <Text style={styles.classMeta}>{item.startTime} • {item.room}</Text>
              </View>
            </View>
          )
        }) : <Text style={styles.listMeta}>No classes today.</Text>}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Urgent assignments</Text>
          <Text style={styles.cardLink}>View all</Text>
        </View>
        {assignments.length > 0 ? assignments.map((item: any) => (
          <View key={item.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listMeta}>{item.subject}</Text>
          </View>
        )) : <Text style={styles.listMeta}>No urgent assignments.</Text>}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Announcements</Text>
          <Text style={styles.cardLink}>New</Text>
        </View>
        {announcements.length > 0 ? announcements.map((item: any) => (
          <View key={item.id} style={styles.listItem}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listMeta}>{item.date || item.time || 'Today'}</Text>
          </View>
        )) : <Text style={styles.listMeta}>No new announcements.</Text>}
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Open full portal</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
"""

with open(filepath, 'r', encoding='utf-8') as f:
    orig = f.read()
    
# Extract styles
styles_match = re.search(r'const getStyles.*', orig, re.DOTALL)
if styles_match:
    content += '\n' + styles_match.group(0)
    
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Dashboard refactored.")
