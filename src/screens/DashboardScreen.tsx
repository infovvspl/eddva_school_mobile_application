import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, ImageBackground, Dimensions, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Bell, MessageSquare, ChevronRight } from 'lucide-react-native';
import { student } from '../data/school-data';
import { schoolApi } from '../utils/api';

const { width } = Dimensions.get('window');

export function DashboardScreen({ theme, onNavigate }: any) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await schoolApi.getDashboardStats();
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
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarButton} onPress={() => onNavigate('profile')}>
                <Text style={styles.avatarText}>PD</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.greeting}>Hello, {stats?.student?.firstName || stats?.firstName || 'Pratap'}! 👋</Text>
          <Text style={styles.subtitle}>Ready to conquer your goals today?</Text>
        </View>

        {/* Stats Pill Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Image source={require('../../assets/fire.jpg')} style={styles.statImage} />
            </View>
            <View>
              <Text style={styles.statValue}>{stats?.streak || stats?.gamification?.streak || 12}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Image source={require('../../assets/coin.jpg')} style={styles.statImage} />
            </View>
            <View>
              <Text style={styles.statValue}>{stats?.points || stats?.gamification?.points || 450}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          {/* AI Tutor Banner */}
          <ImageBackground source={require('../../assets/bg.png')} style={styles.aiBanner} imageStyle={{ borderRadius: 20 }}>
            <View style={styles.aiBannerLeft}>
              <Text style={styles.aiBannerTitle}>EDDVA AI Tutor</Text>
              <Text style={styles.aiBannerSubtitle}>Ask Now</Text>
              <TouchableOpacity style={styles.aiButton}>
                <MessageSquare size={16} color="#1e3a8a" />
                <Text style={styles.aiButtonText}>Chat with AI</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('timetable')}>
              <View style={styles.actionIconBox}>
                <Image source={require('../../assets/myclasses.png')} style={styles.actionImage} resizeMode="contain" />
              </View>
              <Text style={styles.actionLabel}>My Classes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('assignments')}>
              <View style={styles.actionIconBox}>
                <Image source={require('../../assets/assignments.jpg')} style={styles.actionImage} resizeMode="contain" />
                <View style={styles.actionBadge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              </View>
              <Text style={styles.actionLabel}>Assignme...</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('assessments')}>
              <View style={styles.actionIconBox}>
                <Image source={require('../../assets/tests.png')} style={styles.actionImage} resizeMode="contain" />
              </View>
              <Text style={styles.actionLabel}>Tests</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('studyMaterials')}>
              <View style={styles.actionIconBox}>
                <Image source={require('../../assets/notes.png')} style={styles.actionImage} resizeMode="contain" />
              </View>
              <Text style={styles.actionLabel}>Notes</Text>
            </TouchableOpacity>
          </View>

          {/* Continue Learning */}
          <View style={styles.continueHeader}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.emptyStateBox}>
            <Text style={styles.emptyStateText}>No recent classes to continue.</Text>
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
    paddingBottom: 80,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 40,
    tintColor: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greeting: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 15,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: -45,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statImage: {
    width: 24,
    height: 24,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  aiBanner: {
    backgroundColor: '#1d4ed8',
    borderRadius: 20,
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 6,
  },
  aiBannerLeft: {
    flex: 1,
    zIndex: 2,
  },
  aiBannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  aiBannerSubtitle: {
    color: '#bfdbfe',
    fontSize: 14,
    marginBottom: 16,
  },
  aiButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  aiButtonText: {
    color: '#1e3a8a',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  aiImage: {
    width: 120,
    height: 120,
    position: 'absolute',
    right: -10,
    bottom: -15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 24,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    width: (width - 40) / 4,
  },
  actionIconBox: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  actionImage: {
    width: 45,
    height: 45,
  },
  actionBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  actionLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 8,
  },
  emptyStateBox: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: 14,
  }
});
