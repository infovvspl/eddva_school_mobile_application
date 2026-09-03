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
    schoolApi.getMyProfile()
      .then(res => {
        // Unwrap the { success, data } envelope and derive the initials the
        // header expects; the raw response has neither shape.
        const p = res?.data ?? res ?? {};
        const name: string = p.name || '';
        setProfile({
          ...p,
          name: name || 'Student',
          avatarInitials:
            name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
              .map((w: string) => w.charAt(0)).join('').toUpperCase() || 'S',
        });
      })
      .catch(err => console.error('[menu] profile load failed', err));
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
        { id: 'studyPlan', title: 'Personalized Study Plan', icon: <PenTool size={ms(20)} color={theme.primary} />, badge: 'AI' },
        { id: 'aiStudy', title: 'AI Study Assistant', icon: <BookOpen size={ms(20)} color="#8B5CF6" />, badge: 'New' },
        { id: 'studyMaterials', title: 'Study Materials', icon: <FileText size={ms(20)} color={theme.text} /> },
        { id: 'timetable', title: 'Class Timetable', icon: <Clock size={ms(20)} color={theme.text} /> },
        { id: 'liveClasses', title: 'Live Classes', icon: <Video size={ms(20)} color="#EF4444" /> },
        { id: 'recordedClasses', title: 'Recorded Lectures', icon: <MonitorPlay size={ms(20)} color={theme.text} /> },
      ]
    },
    {
      title: 'Assessments & Doubts',
      items: [
        { id: 'assignments', title: 'Assignments', icon: <FileSignature size={ms(20)} color={theme.text} /> },
        { id: 'assessments', title: 'Tests & Assessments', icon: <FileCheck2 size={ms(20)} color={theme.text} /> },
        { id: 'pyq', title: 'Previous Year Papers (PYQ)', icon: <BookOpen size={ms(20)} color={theme.text} /> },
        { id: 'doubt', title: 'Doubt Forum', icon: <HelpCircle size={ms(20)} color={theme.text} /> },
      ]
    },
    {
      title: 'Performance & Growth',
      items: [
        { id: 'analytics', title: 'My Analytics', icon: <TrendingUp size={ms(20)} color="#10B981" /> },
        { id: 'gamification', title: 'Arcade & Games', icon: <Gamepad2 size={ms(20)} color="#F59E0B" /> },
        { id: 'careers', title: 'Career Guidance', icon: <Briefcase size={ms(20)} color={theme.text} /> },
      ]
    },
    {
      title: 'General',
      items: [
        { id: 'calendar', title: 'School Calendar', icon: <Calendar size={ms(20)} color={theme.text} /> },
        { id: 'attendance', title: 'Attendance', icon: <User size={ms(20)} color={theme.text} /> },
        { id: 'profile', title: 'My Profile', icon: <User size={ms(20)} color={theme.text} /> },
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
            {isDarkMode ? <Moon size={ms(20)} color={theme.text} /> : <Sun size={ms(20)} color={theme.text} />}
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
                    <ChevronRight size={ms(20)} color={theme.subtext} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={ms(20)} color="#EF4444" />
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
    width: hs(48),
    height: vs(48),
    borderRadius: ms(24),
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hs(12),
  },
  avatarText: {
    color: '#fff',
    fontSize: ms(18),
    fontWeight: '700',
  },
  studentName: {
    fontSize: ms(18),
    fontWeight: '700',
    color: theme.text,
  },
  studentClass: {
    fontSize: ms(14),
    color: theme.subtext,
  },
  closeBtn: {
    padding: ms(8),
  },
  closeBtnText: {
    color: theme.primary,
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: ms(16),
  },
  themeToggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: ms(16),
    borderRadius: ms(16),
    marginBottom: vs(24),
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: theme.text,
    marginLeft: hs(12),
  },
  section: {
    marginBottom: vs(24),
  },
  sectionTitle: {
    fontSize: ms(14),
    fontWeight: '700',
    color: theme.subtext,
    marginBottom: vs(12),
    marginLeft: hs(8),
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: theme.surface,
    borderRadius: ms(16),
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ms(16),
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
    fontSize: ms(16),
    color: theme.text,
    marginLeft: hs(12),
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: theme.primary,
    paddingHorizontal: hs(8),
    paddingVertical: vs(2),
    borderRadius: ms(12),
    marginRight: hs(8),
  },
  badgeText: {
    color: '#fff',
    fontSize: ms(12),
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.surface,
    padding: ms(16),
    borderRadius: ms(16),
    marginBottom: vs(40),
  },
  logoutText: {
    fontSize: ms(16),
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: hs(12),
  }
});
