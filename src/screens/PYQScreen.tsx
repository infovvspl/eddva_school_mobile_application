import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Platform, StatusBar } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { FileText, Play, BookOpen, Star, Filter } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const SUBJECT_TABS = ['All', 'Science', 'Mathematics', 'English', 'History'];

export function PYQScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchPYQs = async () => {
      setLoading(true);
      try {
        const pyqs = await schoolApi.getTopicPyqsOverview('general-topic-id');
        let records = [];
        if (Array.isArray(pyqs)) records = pyqs;
        else if (pyqs && Array.isArray(pyqs.data)) records = pyqs.data;
        else if (pyqs && Array.isArray(pyqs.results)) records = pyqs.results;
        
        setData(records);
        setFilteredData(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPYQs();
  }, []);

  useEffect(() => {
    if (activeTab === 'All') {
      setFilteredData(data);
    } else {
      setFilteredData(data.filter(item => item.subject === activeTab));
    }
  }, [activeTab, data]);

  const handleStartSession = async (title: string) => {
    try {
      await schoolApi.startPyqSession('general-topic-id', {});
      Alert.alert('Session Started', `Launching ${title} session!`);
    } catch (err) {
      console.error(err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'Easy': return { bg: '#DCFCE7', text: '#166534' };
      case 'Medium': return { bg: '#FEF9C3', text: '#854D0E' };
      case 'Hard': return { bg: '#FEE2E2', text: '#991B1B' };
      default: return { bg: theme.surfaceAlt, text: theme.subtext };
    }
  };

  return (
    <View style={styles.container}>
      {/* Hero Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.pageTitle}>Past Exams</Text>
            <Text style={styles.pageSub}>Master your preparation</Text>
          </View>
          <View style={styles.badgeContainer}>
            <Star size={ms(16)} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.badgeText}>Pro</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.quickStartCard} onPress={() => handleStartSession('Recommended Paper')} activeOpacity={0.9}>
          <View style={styles.quickStartIcon}>
            <Play size={ms(24)} color={theme.surface} fill="#FFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickStartTitle}>Quick Start</Text>
            <Text style={styles.quickStartSub}>Launch most recommended paper</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {SUBJECT_TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity 
                key={tab} 
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : filteredData.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Filter size={ms(32)} color={theme.subtext} />
            </View>
            <Text style={styles.emptyTitle}>No Papers Found</Text>
            <Text style={styles.emptyText}>We couldn't find any past papers for "{activeTab}". Try selecting another subject.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredData.map((item, idx) => {
              const diffColors = getDifficultyColor(item.difficulty);
              return (
                <TouchableOpacity key={idx} style={styles.pyqCard} onPress={() => handleStartSession(item.title)} activeOpacity={0.8}>
                  <View style={styles.iconBox}>
                    <FileText size={ms(24)} color={theme.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{item.title || 'Previous Year Question'}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.cardSub}>{item.year || '2025'} • {item.subject || 'General'}</Text>
                      <View style={[styles.difficultyBadge, { backgroundColor: diffColors.bg }]}>
                        <Text style={[styles.difficultyText, { color: diffColors.text }]}>{item.difficulty || 'Medium'}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background },
  
  // Header
  header: { backgroundColor: theme.headerBg, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 60, paddingHorizontal: hs(20), paddingBottom: vs(20), borderBottomLeftRadius: ms(32), borderBottomRightRadius: ms(32) },
  headerTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: vs(24) },
  pageTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(28), color: theme.surface },
  pageSub: { fontFamily: 'Poppins-Regular', fontSize: ms(14), color: theme.subtext },
  badgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: hs(10), paddingVertical: vs(4), borderRadius: ms(12) },
  badgeText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(12), color: '#D97706', marginLeft: hs(4) },

  quickStartCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: ms(16), borderRadius: ms(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  quickStartIcon: { width: hs(48), height: vs(48), borderRadius: ms(16), backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginRight: hs(16) },
  quickStartTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(16), color: theme.surface },
  quickStartSub: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.border },

  // Tabs
  tabsWrapper: { marginTop: vs(-10) },
  tabsContainer: { paddingHorizontal: hs(16), paddingVertical: vs(20), gap: ms(10) },
  tab: { paddingHorizontal: hs(20), paddingVertical: vs(10), borderRadius: ms(20), backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, shadowColor: theme.subtext, shadowOffset: {width: 0, height: vs(2)}, shadowOpacity: 0.05, shadowRadius: ms(4), elevation: 1 },
  tabActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  tabText: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.subtext },
  tabTextActive: { color: theme.surface },

  // Content
  content: { padding: ms(16), paddingBottom: vs(100) },
  
  // Empty State
  emptyCard: { backgroundColor: theme.surface, borderRadius: ms(24), padding: ms(32), alignItems: 'center', shadowColor: theme.subtext, shadowOffset: {width: 0, height: vs(4)}, shadowOpacity: 0.05, shadowRadius: ms(8), elevation: 2, marginTop: vs(20) },
  emptyIconBox: { width: hs(64), height: vs(64), borderRadius: ms(32), backgroundColor: theme.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginBottom: vs(16) },
  emptyTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.text, marginBottom: vs(8) },
  emptyText: { fontFamily: 'Poppins-Regular', fontSize: ms(14), color: theme.subtext, textAlign: 'center', lineHeight: ms(20) },
  
  // List
  list: { gap: ms(16) },
  pyqCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, padding: ms(16), borderRadius: ms(20), shadowColor: theme.subtext, shadowOffset: {width: 0, height: vs(4)}, shadowOpacity: 0.05, shadowRadius: ms(8), elevation: 2 },
  iconBox: { width: hs(56), height: vs(56), borderRadius: ms(16), backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: hs(16) },
  cardTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(15), color: theme.text, marginBottom: vs(6) },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardSub: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.subtext },
  
  difficultyBadge: { paddingHorizontal: hs(10), paddingVertical: vs(4), borderRadius: ms(8) },
  difficultyText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(11) },
});
