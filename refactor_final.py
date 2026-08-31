import re

# ================================
# REFACTOR DoubtScreen.tsx
# ================================
doubt_content = """import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, StatusBar, ActivityIndicator } from 'react-native';
import { ArrowLeft, Plus, Sparkles, ThumbsUp, ThumbsDown, Image as ImageIcon } from 'lucide-react-native';
import { hs, vs, ms } from '../utils/responsive';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

export function DoubtScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [isLoading, setIsLoading] = useState(true);
  const [doubts, setDoubts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const data = await schoolApi.getMyDoubts();
        setDoubts(data || []);
      } catch (err) {
        console.error('Error fetching doubts:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoubts();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => onNavigate('dashboard')} style={styles.backBtn}>
            <ArrowLeft size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.askBtn} onPress={() => onNavigate('askDoubt')}>
            <Plus size={ms(18)} color={theme.surface} />
            <Text style={styles.askBtnText}>Ask a Doubt</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>My Doubts</Text>
        <Text style={styles.headerSubtitle}>Track your questions and teacher replies.</Text>
        <Text style={styles.classInfo}>Class 10 • Section A</Text>

        <View style={styles.statusLegend}>
          <Text style={[styles.legendText, { color: '#F59E0B' }]}>PENDING</Text>
          <Text style={styles.legendDot}>•</Text>
          <Text style={[styles.legendText, { color: '#10B981' }]}>TEACHER ANSWERED</Text>
          <Text style={styles.legendDot}>•</Text>
          <Text style={[styles.legendText, { color: theme.subtext }]}>RESOLVED</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 10, color: theme.subtext }}>Loading your doubts...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {doubts.map((item, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={[styles.badgeText, { color: '#6366F1' }]}>{item.status}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              {item.hasImage && (
                <View style={styles.imagePlaceholder}>
                  <ImageIcon size={ms(24)} color={theme.subtext} />
                  <Text style={styles.imagePlaceholderText}>Question image attached</Text>
                </View>
              )}
              <Text style={styles.subjectText}>Subject: {item.subject}</Text>
              <Text style={styles.questionText}>{item.question}</Text>
              
              {item.explanation && (
                <View style={styles.aiBox}>
                  <View style={styles.aiHeader}>
                    <Sparkles size={ms(14)} color="#6366F1" />
                    <Text style={styles.aiTitle}>AI EXPLANATION</Text>
                  </View>
                  <Text style={styles.aiExplanation}>{item.explanation}</Text>
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' }]}>
                      <ThumbsUp size={ms(14)} color={theme.surface} />
                      <Text style={[styles.actionBtnText, { color: theme.surface }]}>Helpful</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtnOutline}>
                      <ThumbsDown size={ms(14)} color={theme.subtext} />
                      <Text style={styles.actionBtnOutlineText}>Ask teacher instead</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
"""

with open('src/screens/DoubtScreen.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()
styles_match = re.search(r'const getStyles.*', orig, re.DOTALL)
if styles_match:
    doubt_content += '\n' + styles_match.group(0)
with open('src/screens/DoubtScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(doubt_content)


# ================================
# REFACTOR AskDoubtScreen.tsx
# ================================
ask_content = """import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Image as ImageIcon, Sparkles, Send, ChevronDown } from 'lucide-react-native';
import { hs, vs, ms } from '../utils/responsive';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

export function AskDoubtScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (type: string) => {
    if (question.length < 10) {
      Alert.alert('Error', 'Please enter a longer question.');
      return;
    }
    setIsSubmitting(true);
    try {
      await schoolApi.createDoubt({ question, type });
      Alert.alert('Success', 'Doubt submitted successfully!');
      onNavigate('doubt');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit doubt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('doubt')} style={styles.backBtn}>
          <ArrowLeft size={ms(20)} color={theme.text} />
        </TouchableOpacity>
        <View style={{ marginLeft: hs(12) }}>
          <Text style={styles.headerTitle}>Ask a Doubt</Text>
          <Text style={styles.headerSubtitle}>Get instant help from AI or send your question to your subject teacher.</Text>
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>Class 10 • Section A</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <View style={styles.dropdownCol}>
            <Text style={styles.label}>SUBJECT (OPTIONAL)</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>General / any subject</Text>
              <ChevronDown size={ms(16)} color={theme.subtext} />
            </TouchableOpacity>
          </View>
          <View style={styles.dropdownCol}>
            <Text style={styles.label}>TEACHER (FOR DIRECT ASK)</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>Auto-assign (class / subject teacher)</Text>
              <ChevronDown size={ms(16)} color={theme.subtext} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>YOUR QUESTION</Text>
          <TextInput 
            style={styles.textArea}
            placeholder="Describe what you are stuck on (text or image, min. 10 characters if text only)..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            value={question}
            onChangeText={setQuestion}
            editable={!isSubmitting}
          />
        </View>

        <TouchableOpacity style={styles.attachBtn} disabled={isSubmitting}>
          <ImageIcon size={ms(14)} color={theme.subtext} />
          <Text style={styles.attachBtnText}>Attach question image</Text>
        </TouchableOpacity>

        {isSubmitting ? (
          <View style={{ marginTop: vs(20), alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ marginTop: 8, color: theme.subtext }}>Submitting...</Text>
          </View>
        ) : (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#C4B5FD' }]} onPress={() => handleSubmit('ai')}>
              <Sparkles size={ms(16)} color={theme.surface} />
              <Text style={styles.actionBtnText}>Ask AI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#93C5FD' }]} onPress={() => handleSubmit('teacher')}>
              <Send size={ms(16)} color={theme.surface} />
              <Text style={styles.actionBtnText}>Ask Teacher</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={styles.footerNote}>AI ANSWERS INSTANTLY • TEACHER REPLIES WHEN AVAILABLE</Text>
      </ScrollView>
    </View>
  );
}
"""
with open('src/screens/AskDoubtScreen.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()
styles_match = re.search(r'const getStyles.*', orig, re.DOTALL)
if styles_match:
    ask_content += '\n' + styles_match.group(0)
with open('src/screens/AskDoubtScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(ask_content)

# ================================
# REFACTOR MenuScreen.tsx
# ================================
menu_content = """import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
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

        <TouchableOpacity style={styles.logoutBtn} onPress={() => onNavigate('login')}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
"""
with open('src/screens/MenuScreen.tsx', 'r', encoding='utf-8') as f:
    orig = f.read()
styles_match = re.search(r'const getStyles.*', orig, re.DOTALL)
if styles_match:
    menu_content += '\n' + styles_match.group(0)
with open('src/screens/MenuScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(menu_content)

print("Finished refactoring final screens.")
