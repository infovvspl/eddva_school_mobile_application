import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Platform, StatusBar, Modal } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { BookOpen, FileText, LayoutList, Trophy, GraduationCap, CheckCircle, Clock, ChevronDown, Check, BarChart2 } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

const CATEGORIES = [
  { id: 'Topic Test', label: 'Topic Tests', icon: FileText },
  { id: 'Chapter Test', label: 'Chapter Tests', icon: LayoutList },
  { id: 'Subject Test', label: 'Subject Tests', icon: BookOpen },
  { id: 'Mock Test', label: 'Mock Tests', icon: Trophy },
  { id: 'Final Exam', label: 'Final Exams', icon: GraduationCap },
];

export function AssessmentsScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('Topic Test');
  const [activeSubTab, setActiveSubTab] = useState('Available Tests');
  const [activeSubject, setActiveSubject] = useState('All Subjects');
  const [subjectDropdownVisible, setSubjectDropdownVisible] = useState(false);

  useEffect(() => {
    const fetchAssessments = async () => {
      setLoading(true);
      try {
        const data = await schoolApi.getAssessments();
        let records = [];
        if (Array.isArray(data)) records = data;
        else if (data && Array.isArray(data.data)) records = data.data;
        else if (data && Array.isArray(data.assessments)) records = data.assessments;
        else if (data && Array.isArray(data.results)) records = data.results;
        
        if (records.length === 0) {
          records = [
            { id: '1', title: 'Mathematics: Algebra Basics', type: 'Topic Test', subject: 'Mathematics', maxMarks: 50, timeAllowed: '45 mins', score: 42, date: '10/05/2026', classInfo: 'Class 9' },
            { id: '2', title: 'Physics: Laws of Motion', type: 'Chapter Test', subject: 'Science', maxMarks: 100, timeAllowed: '1.5 hrs', score: 85, date: '12/05/2026', classInfo: 'Class 9' },
            { id: '3', title: 'English: Grammar & Vocab', type: 'Topic Test', subject: 'English', maxMarks: 30, timeAllowed: '30 mins', score: 25, date: '15/05/2026', classInfo: 'Class 9' },
            { id: '4', title: 'History: World War I', type: 'Subject Test', subject: 'Social Studies', maxMarks: 80, timeAllowed: '2 hrs', score: 0, date: 'Upcoming', classInfo: 'Class 9' },
          ];
        }
        
        setAssessments(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  const subjects = ['All Subjects', ...new Set(assessments.map(a => a.subject).filter(Boolean))];

  const filteredAssessments = assessments.filter(a => {
    const matchesCategory = a.type === activeCategory;
    const matchesSubject = activeSubject === 'All Subjects' || a.subject === activeSubject;
    return matchesCategory && matchesSubject;
  });

  return (
    <View style={styles.container}>
      {/* Header matching web app (Clean White) */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Assessments</Text>
        <Text style={styles.pageSub}>Practice tests, topic tests, unit tests, subject tests, mock exams, and final exams.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Main Nav Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer} style={styles.categoriesScroll}>
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            const IconComponent = cat.icon;
            return (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.categoryTab, isActive && styles.categoryTabActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <IconComponent size={ms(16)} color={isActive ? theme.surface : theme.subtext} style={{marginRight: hs(8)}} />
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{cat.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Subject Filter Row */}
        <View style={styles.subjectFilterRow}>
          <Text style={styles.subjectLabel}>SUBJECT</Text>
          <TouchableOpacity style={styles.subjectDropdownBtn} onPress={() => setSubjectDropdownVisible(true)} activeOpacity={0.7}>
            <Text style={styles.subjectDropdownText}>{activeSubject}</Text>
            <ChevronDown size={ms(16)} color={theme.subtext} />
          </TouchableOpacity>
        </View>

        {/* Sub Nav Tabs */}
        <View style={styles.subTabsContainer}>
          {['Available Tests', 'My Results', 'Issues'].map((tab) => {
             const isActive = activeSubTab === tab;
             return (
               <TouchableOpacity key={tab} style={styles.subTab} onPress={() => setActiveSubTab(tab)}>
                 <Text style={[styles.subTabText, isActive && styles.subTabTextActive]}>{tab}</Text>
                 {isActive && <View style={styles.subTabActiveIndicator} />}
               </TouchableOpacity>
             )
          })}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : (
          <View style={styles.cardsGrid}>
            {filteredAssessments.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyTitle}>No tests found</Text>
              </View>
            ) : (
              activeSubTab === 'My Results' ? (
                /* Results List View */
                filteredAssessments.map((item, idx) => {
                  const grade = item.score >= 75 ? 'A' : item.score >= 50 ? 'B' : 'C';
                  return (
                  <View key={idx} style={styles.resultCard}>
                    <View style={styles.resultCardLeft}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: vs(8) }}>
                        <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>TOPIC</Text></View>
                        <View style={[styles.gradeBadge, { backgroundColor: '#DBEAFE' }]}><Text style={[styles.gradeBadgeText, { color: theme.primary }]}>{grade}</Text></View>
                      </View>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardClassInfo}>{item.maxMarks} marks • {item.timeAllowed} • {item.date || '6/20/2026'}</Text>
                      
                      <View style={styles.progressSection}>
                        <Text style={styles.progressText}>{item.score || 0} / {item.maxMarks} marks</Text>
                        <View style={styles.progressBarBg}>
                          <View style={[styles.progressBarFill, { width: `${(item.score / item.maxMarks) * 100}%` }]} />
                        </View>
                        <View style={styles.progressMarks}>
                          <Text style={styles.progressMarkText}>0</Text>
                          <Text style={[styles.progressMarkText, { color: '#EF4444' }]}>Pass: 33%</Text>
                          <Text style={[styles.progressMarkText, { color: '#10B981' }]}>Distinction: 75%</Text>
                          <Text style={styles.progressMarkText}>100</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.resultCardRight}>
                       <View style={styles.scoreCircle}>
                         <Text style={styles.scoreCircleText}>{item.score}%</Text>
                       </View>
                       <TouchableOpacity style={styles.viewResultBtn}>
                         <BarChart2 size={ms(14)} color={theme.primary} />
                         <Text style={styles.viewResultBtnText}>View</Text>
                       </TouchableOpacity>
                    </View>
                  </View>
                )})
              ) : (
                /* Available Tests Grid View */
                filteredAssessments.map((item, idx) => (
                  <View key={idx} style={styles.assessmentCard}>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.typeBadge}><Text style={styles.typeBadgeText}>TOPIC</Text></View>
                      <Text style={styles.scheduledText}>scheduled</Text>
                    </View>
                    
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardClassInfo}>Class: {item.classInfo} | Subject: {item.subject} | Max Marks: {item.maxMarks} | Time Allowed: {item.timeAllowed}</Text>
                    
                    <View style={styles.cardMetaGrid}>
                      <View style={styles.metaItem}>
                        <Clock size={ms(14)} color={theme.subtext} />
                        <Text style={styles.metaItemText}>{item.timeAllowed}</Text>
                      </View>
                      <Text style={styles.metaItemText}>{item.maxMarks} marks</Text>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity style={[styles.submittedOnlineBtn, { backgroundColor: theme.primary, borderWidth: 0 }]} onPress={() => onNavigate('exam', { assessmentId: item.id, title: item.title })}>
                        <Text style={[styles.submittedOnlineText, { color: '#fff' }]}>Start Exam</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.viewSubmissionBtn}>
                        <FileText size={ms(14)} color={theme.primary} />
                        <Text style={styles.viewSubmissionText}>View details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )
            )}
          </View>
        )}
      </ScrollView>

      {/* Subject Dropdown Modal */}
      <Modal visible={subjectDropdownVisible} animationType="fade" transparent={true} onRequestClose={() => setSubjectDropdownVisible(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setSubjectDropdownVisible(false)}>
          <View style={styles.dropdownContent}>
            <Text style={styles.dropdownTitle}>Select Subject</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {subjects.map((sub, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.dropdownItem, activeSubject === sub && styles.dropdownItemActive]} 
                  onPress={() => { setActiveSubject(sub as string); setSubjectDropdownVisible(false); }}
                >
                  <Text style={[styles.dropdownItemText, activeSubject === sub && styles.dropdownItemTextActive]}>{sub as string}</Text>
                  {activeSubject === sub && <Check size={ms(16)} color={theme.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface },
  
  header: { 
    backgroundColor: theme.surface, 
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 60, 
    paddingHorizontal: hs(20), 
    paddingBottom: vs(20) 
  },
  pageTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(24), color: theme.text, marginBottom: vs(4) },
  pageSub: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext },
  
  content: { padding: ms(20), paddingTop: 0, paddingBottom: vs(100) },
  
  categoriesScroll: { marginBottom: vs(24) },
  categoriesContainer: { gap: ms(12), paddingRight: hs(20) },
  categoryTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: hs(16), paddingVertical: vs(12), borderRadius: ms(12), backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  categoryTabActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  categoryText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.subtext },
  categoryTextActive: { color: theme.surface },
  
  subjectFilterRow: { marginBottom: vs(24) },
  subjectLabel: { fontFamily: 'Poppins-Medium', fontSize: ms(11), color: theme.subtext, letterSpacing: 0.5, marginBottom: vs(8) },
  subjectDropdownBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, paddingHorizontal: hs(16), paddingVertical: vs(12), borderRadius: ms(12), width: hs(200) },
  subjectDropdownText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.text },

  subTabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.border, marginBottom: vs(24), gap: ms(24) },
  subTab: { paddingBottom: vs(12), position: 'relative' },
  subTabText: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.subtext },
  subTabTextActive: { color: theme.primary, fontFamily: 'Poppins-SemiBold' },
  subTabActiveIndicator: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: theme.primary },

  cardsGrid: { gap: ms(16) },
  
  // Available Tests Card
  assessmentCard: { backgroundColor: theme.surface, borderRadius: ms(16), padding: ms(20), borderWidth: 1, borderColor: theme.border },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: vs(12) },
  typeBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: hs(10), paddingVertical: vs(4), borderRadius: ms(6) },
  typeBadgeText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(10), color: theme.primary, letterSpacing: 0.5 },
  scheduledText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.subtext },
  cardTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(16), color: theme.text, marginBottom: vs(8) },
  cardClassInfo: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext, marginBottom: vs(12), lineHeight: ms(18) },
  cardMetaGrid: { flexDirection: 'row', alignItems: 'center', gap: ms(16), marginBottom: vs(20) },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: ms(6) },
  metaItemText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.subtext },
  
  cardActions: { gap: ms(8) },
  submittedOnlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FDF4', paddingVertical: vs(12), borderRadius: ms(12), gap: ms(8) },
  submittedOnlineText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(13), color: '#16A34A' },
  submittedOfflineBtn: { backgroundColor: theme.surfaceAlt, paddingVertical: vs(12), borderRadius: ms(12), alignItems: 'center' },
  submittedOfflineText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.subtext },
  viewSubmissionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF6FF', paddingVertical: vs(12), borderRadius: ms(12), gap: ms(8) },
  viewSubmissionText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.primary },

  // Results Card
  resultCard: { flexDirection: 'row', backgroundColor: theme.surface, borderRadius: ms(16), padding: ms(20), borderWidth: 1, borderColor: theme.border },
  resultCardLeft: { flex: 1, paddingRight: hs(16) },
  gradeBadge: { paddingHorizontal: hs(10), paddingVertical: vs(4), borderRadius: ms(6), marginLeft: hs(8) },
  gradeBadgeText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(10), letterSpacing: 0.5 },
  progressSection: { marginTop: vs(16) },
  progressText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.text, marginBottom: vs(8) },
  progressBarBg: { height: vs(6), backgroundColor: theme.border, borderRadius: ms(3), overflow: 'hidden', marginBottom: vs(8) },
  progressBarFill: { height: '100%', backgroundColor: '#6366F1', borderRadius: ms(3) },
  progressMarks: { flexDirection: 'row', justifyContent: 'space-between' },
  progressMarkText: { fontFamily: 'Poppins-Medium', fontSize: ms(9), color: theme.subtext },
  
  resultCardRight: { width: hs(80), alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: theme.surfaceAlt, paddingLeft: hs(16) },
  scoreCircle: { width: hs(50), height: hs(50), borderRadius: hs(25), backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: vs(12) },
  scoreCircleText: { fontFamily: 'Poppins-Bold', fontSize: ms(16), color: theme.surface },
  viewResultBtn: { flexDirection: 'row', alignItems: 'center', gap: ms(4) },
  viewResultBtnText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.primary },

  emptyStateContainer: { padding: ms(40), alignItems: 'center' },
  emptyTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(16), color: theme.subtext },

  // Modal Styles
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', padding: ms(20) },
  dropdownContent: { backgroundColor: theme.surface, borderRadius: ms(16), padding: ms(16), width: '80%', maxHeight: '60%', shadowColor: '#000', shadowOffset: {width: 0, height: vs(10)}, shadowOpacity: 0.1, shadowRadius: ms(20), elevation: 5 },
  dropdownTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(16), color: theme.text, marginBottom: vs(12), textAlign: 'center' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: vs(12), paddingHorizontal: hs(12), borderRadius: ms(8) },
  dropdownItemActive: { backgroundColor: '#EFF6FF' },
  dropdownItemText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.subtext },
  dropdownItemTextActive: { color: theme.primary, fontFamily: 'Poppins-SemiBold' },
});
