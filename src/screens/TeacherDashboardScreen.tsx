import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, StatusBar, Platform } from 'react-native';
import { Bell, MessageSquare, BookOpen, Users, FileText, Activity, Clock, FileImage, Video, CheckSquare, MessageCircle } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';
import { ms } from '../utils/responsive';

const { width } = Dimensions.get('window');

export function TeacherDashboardScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await schoolApi.teacher.getStats();
        setStats(statsRes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Top Dark Section */}
        <View style={styles.topSection}>
          <View style={styles.header}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton} onPress={() => onNavigate('notifications')}>
                <Bell size={20} color="#fff" />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarButton} onPress={() => onNavigate('profile')}>
                <Text style={styles.avatarText}>TR</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.greeting}>Hello, Teacher! 👋</Text>
          <Text style={styles.subtitle}>Here is your class overview for today.</Text>
        </View>

        {/* Stats Pill Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Users size={ms(20)} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.statValue}>{stats?.totalStudents || 120}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Activity size={ms(20)} color="#10B981" />
            </View>
            <View>
              <Text style={styles.statValue}>{stats?.averageAttendance || '92%'}</Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('teacherClasses')}>
              <View style={styles.actionIconBox}>
                 <BookOpen size={ms(24)} color={theme.primary} />
              </View>
              <Text style={styles.actionLabel}>Classes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('teacherAssignments')}>
              <View style={styles.actionIconBox}>
                <FileText size={ms(24)} color="#8B5CF6" />
                <View style={styles.actionBadge}>
                  <Text style={styles.badgeText}>5</Text>
                </View>
              </View>
              <Text style={styles.actionLabel}>Assignments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('teacherAssessments')}>
              <View style={styles.actionIconBox}>
                <Activity size={ms(24)} color="#EF4444" />
              </View>
              <Text style={styles.actionLabel}>Assessments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('teacherRecordings')}>
              <View style={styles.actionIconBox}>
                <MessageSquare size={ms(24)} color="#10B981" />
              </View>
              <Text style={styles.actionLabel}>Recordings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('teacherAttendance')}>
              <View style={styles.actionIconBox}>
                <CheckSquare size={ms(24)} color="#F59E0B" />
              </View>
              <Text style={styles.actionLabel}>Attendance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('teacherDoubts')}>
              <View style={styles.actionIconBox}>
                <MessageCircle size={ms(24)} color="#3B82F6" />
                <View style={styles.actionBadge}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </View>
              <Text style={styles.actionLabel}>Doubts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('teacherMaterials')}>
              <View style={styles.actionIconBox}>
                <FileImage size={ms(24)} color="#8B5CF6" />
              </View>
              <Text style={styles.actionLabel}>Materials</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('teacherLiveHost')}>
              <View style={styles.actionIconBox}>
                <Video size={ms(24)} color="#EF4444" />
              </View>
              <Text style={styles.actionLabel}>Go Live</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('teacherTimetable')}>
              <View style={styles.actionIconBox}>
                <Clock size={ms(24)} color="#10B981" />
              </View>
              <Text style={styles.actionLabel}>Timetable</Text>
            </TouchableOpacity>
          </View>

          {/* Pending Submissions */}
          <View style={styles.continueHeader}>
            <Text style={styles.sectionTitle}>Pending Submissions</Text>
            <TouchableOpacity onPress={() => onNavigate('teacherAssignments')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyStateText}>No pending submissions to grade.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  topSection: {
    backgroundColor: '#1e3a8a',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#bfdbfe',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  contentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    marginTop: 10,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: (width - 60) / 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  actionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  actionLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'center',
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  seeAllText: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyStateBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
});
