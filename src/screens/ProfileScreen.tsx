import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { ArrowLeft, LogOut } from 'lucide-react-native';
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

        // Both endpoints wrap their payload in { success, data }.
        const prof = profData?.data ?? profData ?? {};
        const statsBody = statsData?.data ?? statsData ?? {};
        // The profile is a flat user record with a single "name"; class/section
        // live on the dashboard's student object.
        const student = { ...(statsBody.student ?? {}), ...prof };
        const displayName: string = student.name || 'Student';

        const safeProfile = {
          name: displayName,
          className: student.className || profData?.class?.name || 'N/A',
          section: student.sectionName || student.section || 'N/A',
          school: student.instituteName || student.schoolName || 'Eddva School',
          avatarInitials:
            displayName.trim().split(/\s+/).filter(Boolean).slice(0, 2)
              .map((w: string) => w.charAt(0)).join('').toUpperCase() || 'S',
          id: student.rollNo || student.id || 'N/A',
          email: student.email || profData?.email || 'N/A',
          phone: student.phone || student.mobile || student.contactNumber || profData?.phone || 'N/A',
          gender: student.gender || 'N/A',
          dob: student.dob || student.dateOfBirth || 'N/A',
          subjectsCount: student.subjects?.length || student.subjectList?.length || 0,
        };

        const safeStats = {
          streak: statsBody.currentStreak ?? 0,
          points: statsBody.xpTotal ?? 0,
          level: statsBody.student?.currentLevel ?? statsBody.currentLevel ?? 'Bronze'
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

  // A tap here is one accidental swipe away from ending the session, so it
  // confirms first -- the Menu screen's own Log Out skips this, but this
  // button sits among purely informational cards where a stray tap is likelier.
  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => { schoolApi.logout().then(() => onNavigate && onNavigate('login')); },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: vs(16), color: theme.subtext }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: vs(14) }}>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={{ marginRight: hs(12) }}>
          <ArrowLeft size={ms(24)} color={theme.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: ms(24), fontWeight: '800', color: theme.text }}>My Profile</Text>
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

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <LogOut size={ms(20)} color="#EF4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8ff' },
  content: { padding: ms(16), paddingBottom: vs(32) },
  headerCard: {
    backgroundColor: theme.text,
    borderRadius: ms(24),
    padding: ms(20),
    alignItems: 'center',
    marginBottom: vs(14),
  },
  avatarBox: {
    width: hs(70),
    height: vs(70),
    borderRadius: ms(35),
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(10),
  },
  avatarText: { color: theme.primary, fontSize: ms(24), fontWeight: '800' },
  name: { color: theme.surface, fontSize: ms(22), fontWeight: '800' },
  subtext: { color: 'rgba(255,255,255,0.8)', fontSize: ms(13), marginTop: vs(4) },
  card: {
    backgroundColor: theme.surface,
    borderRadius: ms(18),
    padding: ms(16),
    marginBottom: vs(14),
    shadowColor: theme.subtext,
    shadowOpacity: 0.08,
    shadowRadius: ms(10),
    elevation: 2,
  },
  cardTitle: { fontSize: ms(16), fontWeight: '800', color: theme.text, marginBottom: vs(12) },
  infoContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  infoBox: { width: '48%', backgroundColor: theme.background, padding: ms(12), borderRadius: ms(12), marginBottom: vs(10) },
  infoLabel: { fontSize: ms(12), color: theme.subtext, marginBottom: vs(4) },
  infoValue: { fontSize: ms(15), fontWeight: '700', color: theme.text },
  infoRowContainer: { flexDirection: 'row', paddingVertical: vs(8), borderBottomWidth: 1, borderBottomColor: theme.border },
  infoLabelRow: { flex: 1, fontSize: ms(14), color: theme.subtext },
  infoValueRow: { flex: 2, fontSize: ms(14), fontWeight: '600', color: theme.text, textAlign: 'right' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
    padding: ms(16),
    borderRadius: ms(16),
    marginTop: vs(2),
  },
  logoutText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: hs(12),
  },
});
