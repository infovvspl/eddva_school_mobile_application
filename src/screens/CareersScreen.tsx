import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { Compass, GraduationCap, Target, Brain, Sparkles, CheckCircle, Clock, FileText, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

export function CareersScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAiDisabled, setAiDisabled] = useState(false);

  // Re-fetch when screen is focused (simulated by polling or simple refetching logic if needed)
  useEffect(() => {
    const fetchGuidance = async () => {
      try {
        const response = await schoolApi.getCareerGuidance();
        setData(response);
      } catch (err: any) {
        if (err.message && err.message.includes('disabled for your institution')) {
          setAiDisabled(true);
        } else {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchGuidance();
  }, []);

  const hasCompletedQuiz = data?.quizCompleted === true || data?.status === 'completed' || data?.type !== undefined;

  if (loading) {
    return <View style={styles.container}><ActivityIndicator color={theme.primary} style={{marginTop: vs(50)}} /></View>;
  }

  if (isAiDisabled) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: ms(20) }]}>
        <Compass size={ms(48)} color={theme.subtext} style={{ marginBottom: vs(16) }} />
        <Text style={{ textAlign: 'center', color: theme.text, fontSize: ms(18), fontFamily: 'Poppins-SemiBold', marginBottom: vs(8) }}>
          Feature Disabled
        </Text>
        <Text style={{ textAlign: 'center', color: theme.subtext, fontSize: ms(14), fontFamily: 'Poppins-Regular' }}>
          The AI Career Guidance feature is currently disabled for your institution.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={{ marginRight: hs(12) }}>
            <ArrowLeft size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <Compass size={ms(20)} color={theme.primary} style={{ marginRight: hs(8) }} />
          <Text style={styles.pageTitle}>Career Guidance</Text>
        </View>
        <Text style={styles.pageSub}>Discover your strengths and ideal career path</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Explore Careers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>EXPLORE CAREERS</Text>
              <Text style={styles.sectionSub}>Browse all career paths</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All ➝</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exploreCardsContainer}>
            <TouchableOpacity style={[styles.exploreCard, { backgroundColor: '#4F46E5' }]}>
              <GraduationCap size={ms(20)} color={theme.surface} style={styles.exploreIcon} />
              <Text style={styles.exploreCardText}>Science Careers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.exploreCard, { backgroundColor: '#F97316' }]}>
              <Target size={ms(20)} color={theme.surface} style={styles.exploreIcon} />
              <Text style={styles.exploreCardText}>Commerce Careers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.exploreCard, { backgroundColor: '#EC4899' }]}>
              <Brain size={ms(20)} color={theme.surface} style={styles.exploreIcon} />
              <Text style={styles.exploreCardText}>Arts Careers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.exploreCard, { backgroundColor: '#8B5CF6' }]}>
              <Sparkles size={ms(20)} color={theme.surface} style={styles.exploreIcon} />
              <Text style={styles.exploreCardText}>Modern Careers</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {!hasCompletedQuiz ? (
          <View style={[styles.reportCard, { alignItems: 'center', paddingVertical: vs(40) }]}>
            <Target size={ms(48)} color={theme.primary} style={{ marginBottom: vs(16) }} />
            <Text style={{ fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.text, marginBottom: vs(8) }}>Discover Your Path</Text>
            <Text style={{ fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext, textAlign: 'center', marginBottom: vs(24), paddingHorizontal: hs(20) }}>
              Take our AI-powered aptitude test to discover careers that match your unique strengths and personality.
            </Text>
            <TouchableOpacity 
              style={[styles.viewReportBtn, { paddingHorizontal: hs(24), paddingVertical: vs(12) }]}
              onPress={() => onNavigate && onNavigate('careerQuiz')}
            >
              <Text style={styles.viewReportBtnText}>Take Aptitude Test</Text>
              <ChevronRight size={ms(16)} color={theme.surface} style={{ marginLeft: hs(4) }} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Profile & Academic Row (Stacked on Mobile) */}
            <View style={styles.profileSection}>
              
              {/* Interest Profile Complete */}
              <View style={styles.profileCard}>
                <View style={styles.profileCardHeader}>
                  <View style={styles.successIconBox}>
                    <CheckCircle size={ms(20)} color="#10B981" />
                  </View>
                  <View style={{ flex: 1, marginLeft: hs(12) }}>
                    <Text style={styles.profileCardTitle}>Interest Profile Complete</Text>
                    <Text style={styles.profileCardHighlight}>Your type: {data?.type || "Investigative + Social"}</Text>
                    <Text style={styles.profileCardDate}>Completed 09/06/2026</Text>
                  </View>
                </View>
                <View style={styles.retakeBadge}>
                  <Clock size={ms(12)} color={theme.subtext} style={{ marginRight: hs(6) }} />
                  <Text style={styles.retakeText}>Retake unlocked in: <Text style={{fontWeight: '700'}}>{data?.retakeUnlockedIn || "2mo 1d 23h 50m 38s"}</Text></Text>
                </View>
              </View>

              {/* Academic Profile */}
              <View style={styles.academicCard}>
                <Text style={styles.academicTitle}>YOUR ACADEMIC PROFILE</Text>
                <View style={styles.academicGrid}>
                  <View style={styles.academicStatBox}>
                    <Text style={styles.academicSubject}>Science</Text>
                    <Text style={styles.academicScore}>70%</Text>
                    <View style={[styles.gradeBadge, { backgroundColor: '#EFF6FF' }]}><Text style={[styles.gradeBadgeText, { color: theme.primary }]}>B</Text></View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: '70%', backgroundColor: theme.primary }]} />
                    </View>
                  </View>
                  
                  <View style={styles.academicStatBox}>
                    <Text style={styles.academicSubject}>Mathematics</Text>
                    <Text style={styles.academicScore}>50%</Text>
                    <View style={[styles.gradeBadge, { backgroundColor: '#FEF2F2' }]}><Text style={[styles.gradeBadgeText, { color: '#DC2626' }]}>D</Text></View>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: '50%', backgroundColor: theme.primary }]} />
                    </View>
                  </View>
                </View>
                <Text style={styles.needsWorkText}>Needs work: {data?.needsWork || "Mathematics"}</Text>
              </View>
            </View>

            {/* Your Career Report */}
            <View style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Sparkles size={ms(16)} color={theme.primary} style={{ marginRight: hs(8) }} />
                <Text style={styles.reportTitle}>Your Career Report</Text>
              </View>
              <Text style={styles.reportSub}>Last generated 09/06/2026</Text>
              
              <View style={styles.tagsContainer}>
                {data?.tags ? data.tags.map((tag: string, idx: number) => (
                  <View key={idx} style={styles.reportTag}><Text style={styles.reportTagText}>{tag}</Text></View>
                )) : (
                  <>
                    <View style={styles.reportTag}><Text style={styles.reportTagText}>Medicine (MBBS/BDS) 70%</Text></View>
                    <View style={styles.reportTag}><Text style={styles.reportTagText}>Psychology / Counselling 64%</Text></View>
                    <View style={styles.reportTag}><Text style={styles.reportTagText}>Entrepreneurship / Business 58%</Text></View>
                  </>
                )}
              </View>
              
              <TouchableOpacity style={styles.viewReportBtn}>
                <Text style={styles.viewReportBtnText}>View Full Report</Text>
                <ChevronRight size={ms(16)} color={theme.surface} style={{ marginLeft: hs(4) }} />
              </TouchableOpacity>
            </View>
          </>
        )}

      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background },
  
  header: { 
    backgroundColor: theme.surface, 
    paddingTop: vs(12), 
    paddingHorizontal: hs(20), 
    paddingBottom: vs(20),
    borderBottomWidth: 1,
    borderBottomColor: theme.border
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(4) },
  pageTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(20), color: theme.text },
  pageSub: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext },
  
  content: { padding: ms(16), paddingTop: vs(20), paddingBottom: vs(100) },
  
  section: { backgroundColor: theme.surface, borderRadius: ms(16), padding: ms(20), marginBottom: vs(16), borderWidth: 1, borderColor: theme.border },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: vs(16) },
  sectionTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(12), color: theme.subtext, letterSpacing: 0.5 },
  sectionSub: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext },
  viewAllText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.primary },
  
  exploreCardsContainer: { gap: ms(12) },
  exploreCard: { width: hs(130), height: vs(110), borderRadius: ms(16), padding: ms(16), justifyContent: 'space-between' },
  exploreIcon: { opacity: 0.9 },
  exploreCardText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(13), color: theme.surface },
  
  profileSection: { gap: ms(16), marginBottom: vs(16) },
  
  profileCard: { backgroundColor: theme.surface, borderRadius: ms(16), padding: ms(20), borderWidth: 1, borderColor: theme.border },
  profileCardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: vs(16) },
  successIconBox: { width: ms(36), height: ms(36), borderRadius: ms(18), backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  profileCardTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(15), color: theme.text, marginBottom: vs(2) },
  profileCardHighlight: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.primary, marginBottom: vs(4) },
  profileCardDate: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext },
  retakeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, paddingHorizontal: hs(12), paddingVertical: vs(8), borderRadius: ms(8), alignSelf: 'flex-start' },
  retakeText: { fontFamily: 'Poppins-Regular', fontSize: ms(11), color: theme.subtext },
  
  academicCard: { backgroundColor: theme.surface, borderRadius: ms(16), padding: ms(20), borderWidth: 1, borderColor: theme.border },
  academicTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(11), color: theme.subtext, letterSpacing: 0.5, marginBottom: vs(16) },
  academicGrid: { flexDirection: 'row', gap: ms(16), marginBottom: vs(16) },
  academicStatBox: { flex: 1, borderWidth: 1, borderColor: theme.surfaceAlt, borderRadius: ms(12), padding: ms(12) },
  academicSubject: { fontFamily: 'Poppins-Medium', fontSize: ms(11), color: theme.subtext, marginBottom: vs(8) },
  academicScore: { fontFamily: 'Poppins-SemiBold', fontSize: ms(20), color: theme.text, marginBottom: vs(8) },
  gradeBadge: { position: 'absolute', top: ms(12), right: ms(12), paddingHorizontal: hs(6), paddingVertical: vs(2), borderRadius: ms(4) },
  gradeBadgeText: { fontFamily: 'Poppins-Medium', fontSize: ms(10) },
  progressBarBg: { height: vs(4), backgroundColor: theme.surfaceAlt, borderRadius: ms(2), overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: ms(2) },
  needsWorkText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: '#D97706' },
  
  reportCard: { backgroundColor: theme.surface, borderRadius: ms(16), padding: ms(20), borderWidth: 1, borderColor: theme.border },
  reportHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(4) },
  reportTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(15), color: theme.text },
  reportSub: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext, marginBottom: vs(16) },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: ms(8), marginBottom: vs(20) },
  reportTag: { backgroundColor: '#EFF6FF', paddingHorizontal: hs(12), paddingVertical: vs(8), borderRadius: ms(8) },
  reportTagText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.primary },
  viewReportBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary, paddingHorizontal: hs(16), paddingVertical: vs(10), borderRadius: ms(20), alignSelf: 'flex-start' },
  viewReportBtnText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(13), color: theme.surface },
});
