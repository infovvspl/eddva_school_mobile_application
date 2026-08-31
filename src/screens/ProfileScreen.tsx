import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
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

        const student = profData?.student || profData || {};
        
        const safeProfile = {
          name: student.firstName ? `${student.firstName} ${student.lastName || ''}` : student.name || 'Student',
          className: student.className || profData?.class?.name || 'N/A',
          section: student.sectionName || student.section || 'N/A',
          school: profData?.schoolName || student.schoolName || 'Eddva School',
          avatarInitials: student.firstName?.[0]?.toUpperCase() || 'S',
          id: student.rollNo || student.id || 'N/A',
          email: student.email || profData?.email || 'N/A',
          phone: student.phone || student.mobile || student.contactNumber || profData?.phone || 'N/A',
          gender: student.gender || 'N/A',
          dob: student.dob || student.dateOfBirth || 'N/A',
          subjectsCount: student.subjects?.length || student.subjectList?.length || 0,
        };

        const safeStats = {
          streak: statsData?.streak || statsData?.gamification?.streak || 0,
          points: statsData?.points || statsData?.gamification?.points || 0,
          level: statsData?.level || statsData?.gamification?.level || 'Bronze'
        };

        setProfile(safeProfile);
        setStats(safeStats);
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
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={{ marginRight: 12 }}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text }}>My Profile</Text>
      </View>
      <View style={[styles.headerCard, { backgroundColor: theme.primary }]}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{profile.avatarInitials}</Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.subtext}>{profile.school}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Academic Info</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Roll No</Text>
            <Text style={styles.infoValue}>{profile.id}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Class</Text>
            <Text style={styles.infoValue}>{profile.className}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Section</Text>
            <Text style={styles.infoValue}>{profile.section}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Subjects</Text>
            <Text style={styles.infoValue}>{profile.subjectsCount > 0 ? profile.subjectsCount : 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Info</Text>
        <View style={styles.infoRowContainer}>
          <Text style={styles.infoLabelRow}>Email:</Text>
          <Text style={styles.infoValueRow}>{profile.email}</Text>
        </View>
        <View style={styles.infoRowContainer}>
          <Text style={styles.infoLabelRow}>Phone:</Text>
          <Text style={styles.infoValueRow}>{profile.phone}</Text>
        </View>
        <View style={styles.infoRowContainer}>
          <Text style={styles.infoLabelRow}>Gender:</Text>
          <Text style={styles.infoValueRow}>{profile.gender}</Text>
        </View>
        <View style={styles.infoRowContainer}>
          <Text style={styles.infoLabelRow}>Date of Birth:</Text>
          <Text style={styles.infoValueRow}>{profile.dob}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gamification Stats</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Level</Text>
            <Text style={styles.infoValue}>{stats.level}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Total XP</Text>
            <Text style={styles.infoValue}>{stats.points}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Streak</Text>
            <Text style={styles.infoValue}>{stats.streak} Days</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8ff' },
  content: { padding: 16, paddingBottom: 32 },
  headerCard: {
    backgroundColor: theme.text,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarBox: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: { color: theme.primary, fontSize: 24, fontWeight: '800' },
  name: { color: theme.surface, fontSize: 22, fontWeight: '800' },
  subtext: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: theme.subtext,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: theme.text, marginBottom: 12 },
  infoContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  infoBox: { width: '48%', backgroundColor: theme.background, padding: 12, borderRadius: 12, marginBottom: 10 },
  infoLabel: { fontSize: 12, color: theme.subtext, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '700', color: theme.text },
  infoRowContainer: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  infoLabelRow: { flex: 1, fontSize: 14, color: theme.subtext },
  infoValueRow: { flex: 2, fontSize: 14, fontWeight: '600', color: theme.text, textAlign: 'right' },
});
