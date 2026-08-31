import re

filepath = 'src/screens/ProfileScreen.tsx'

content = """import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

export function ProfileScreen({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profData, statsData] = await Promise.all([
          schoolApi.getMyProfile().catch(() => null),
          schoolApi.getDashboardStats().catch(() => null)
        ]);

        setProfile(profData || { name: 'Student', className: 'Class 10', school: 'School', avatarInitials: 'S' });
        setStats(statsData || { streak: 0, points: 0, level: 'Bronze' });
      } catch (err) {
        console.error('Error fetching profile data:', err);
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
        <Text style={{ marginTop: 16, color: theme.subtext }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.headerCard, { backgroundColor: theme.primary }]}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.subtext}>{profile.className}</Text>
        <Text style={styles.subtext}>{profile.school}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Student info</Text>
        <Text style={styles.infoRow}>Roll No: {profile.id || 24}</Text>
        <Text style={styles.infoRow}>Level: {stats.level}</Text>
        <Text style={styles.infoRow}>XP: {stats.points}</Text>
      </View>
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

print("ProfileScreen refactored.")
