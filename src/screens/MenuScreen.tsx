import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Switch, SafeAreaView, Platform, StatusBar } from 'react-native';
import { BookOpen, Calendar, Clock, FileText, User, Users, GraduationCap, Video, HelpCircle, Trophy, TrendingUp, Briefcase, FileSignature, Settings, LogOut, ChevronRight, Moon, Sun, MonitorPlay, FileCheck2, Gamepad2, PenTool } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { hs, vs, ms } from '../utils/responsive';
import { schoolApi } from '../utils/api';

export function MenuScreen({ onNavigate, onClose }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);
  
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    schoolApi.getMyProfile().then(data => setProfile(data)).catch(() => {});
  }, []);

  const handleLogout = () => {
    schoolApi.logout().then(() => {
      onNavigate('login');
    });
  };

  const menuSections = [
    {
      title: 'Academics',
      items: [
        { id: 'studyPlan', title: 'Personalized Study Plan', icon: <PenTool size={20} color={theme.primary} />, badge: 'AI' },
        { id: 'aiStudy', title: 'AI Study Assistant', icon: <BookOpen size={20} color="#8B5CF6" />, badge: 'New' },
        { id: 'studyMaterials', title: 'Study Materials', icon: <FileText size={20} color={theme.text} /> },
        { id: 'timetable', title: 'Class Timetable', icon: <Clock size={20} color={theme.text} /> },
        { id: 'liveClasses', title: 'Live Classes', icon: <Video size={20} color="#EF4444" /> },
        { id: 'recordedClasses', title: 'Recorded Lectures', icon: <MonitorPlay size={20} color={theme.text} /> },
      ]
    },
    {
      title: 'Assessments & Doubts',
      items: [
        { id: 'assignments', title: 'Assignments', icon: <FileSignature size={20} color={theme.text} /> },
        { id: 'assessments', title: 'Tests & Assessments', icon: <FileCheck2 size={20} color={theme.text} /> },
        { id: 'pyq', title: 'Previous Year Papers (PYQ)', icon: <BookOpen size={20} color={theme.text} /> },
        { id: 'doubt', title: 'Doubt Forum', icon: <HelpCircle size={20} color={theme.text} /> },
      ]
    },
    {
      title: 'Performance & Growth',
      items: [
        { id: 'analytics', title: 'My Analytics', icon: <TrendingUp size={20} color="#10B981" /> },
        { id: 'gamification', title: 'Arcade & Games', icon: <Gamepad2 size={20} color="#F59E0B" /> },
        { id: 'careers', title: 'Career Guidance', icon: <Briefcase size={20} color={theme.text} /> },
      ]
    },
    {
      title: 'General',
      items: [
        { id: 'calendar', title: 'School Calendar', icon: <Calendar size={20} color={theme.text} /> },
        { id: 'attendance', title: 'Attendance', icon: <User size={20} color={theme.text} /> },
        { id: 'profile', title: 'My Profile', icon: <User size={20} color={theme.text} /> },
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{profile?.avatarInitials || 'S'}</Text>
          </View>
          <View>
            <Text style={styles.studentName}>{profile?.name || 'Loading...'}</Text>
            <Text style={styles.studentClass}>{profile?.className || ''}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Dark Mode Toggle */}
        <View style={styles.themeToggleCard}>
          <View style={styles.themeToggleLeft}>
            {isDarkMode ? <Moon size={20} color={theme.text} /> : <Sun size={20} color={theme.text} />}
            <Text style={styles.themeToggleText}>Dark Mode</Text>
          </View>
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleTheme}
            trackColor={{ false: '#D1D5DB', true: theme.primarySoft }}
            thumbColor={isDarkMode ? theme.primary : '#fff'}
          />
        </View>

        {menuSections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item: any, itemIdx: number) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.menuItem, itemIdx < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => onNavigate(item.id)}
                >
                  <View style={styles.menuItemLeft}>
                    {item.icon}
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    {item.badge && (
                      <View style={[styles.badge, item.badge === 'AI' ? {backgroundColor: '#EEF2FF'} : {}]}>
                        <Text style={[styles.badgeText, item.badge === 'AI' ? {color: '#6366F1'} : {}]}>{item.badge}</Text>
                      </View>
                    )}
                    <ChevronRight size={20} color={theme.subtext} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hs(24),
    paddingVertical: vs(16),
    backgroundColor: theme.surface
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  studentName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
  },
  studentClass: {
    fontSize: 14,
    color: theme.subtext,
  },
  closeBtn: {
    padding: 8,
  },
  closeBtnText: {
    color: theme.primary,
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  themeToggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.subtext,
    marginBottom: 12,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: theme.text,
    marginLeft: 12,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 40,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 12,
  }
});
