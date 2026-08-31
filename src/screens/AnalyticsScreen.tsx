import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, Dimensions, Platform, StatusBar } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { TrendingUp, Clock, Target, Activity, Star, AlertTriangle, Info, BookOpen } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export function AnalyticsScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Since we mapped everything to getMyAnalytics in api.ts, we fetch it once
        const report = await schoolApi.getMyAnalytics();
        setData(report);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <Star size={ms(20)} color="#10B981" />;
      case 'warning': return <AlertTriangle size={ms(20)} color="#F59E0B" />;
      default: return <Info size={ms(20)} color={theme.primary} />;
    }
  };

  const maxHours = data?.weeklyActivity ? Math.max(...data.weeklyActivity.map((d: any) => d.hours)) : 1;

  return (
    <View style={styles.container}>
      {/* Header Dashboard */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.pageTitle}>Analytics</Text>
        </View>

        <View style={styles.heroStatsCard}>
          <View style={styles.heroStatBlock}>
            <Text style={styles.heroStatLbl}>Overall Score</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <Text style={styles.heroStatVal}>{data?.averageScore || 0}</Text>
              <Text style={styles.heroStatUnit}>%</Text>
            </View>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStatBlock}>
            <Text style={styles.heroStatLbl}>Growth</Text>
            <View style={styles.trendPill}>
              <TrendingUp size={ms(14)} color="#10B981" />
              <Text style={styles.trendPillText}>{data?.trend || '+0%'}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : (
          <>
            {/* Subject Mastery */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BookOpen size={ms(20)} color={theme.text} />
                <Text style={styles.sectionTitle}>Subject Mastery</Text>
              </View>
              
              <View style={styles.card}>
                {data?.subjectMastery?.map((sub: any, idx: number) => (
                  <View key={idx} style={styles.subjectRow}>
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectName}>{sub.subject}</Text>
                      <Text style={styles.subjectScore}>{sub.score}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: `${sub.score}%`, 
                            backgroundColor: sub.score >= 90 ? '#10B981' : sub.score >= 80 ? theme.primary : '#F59E0B' 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Weekly Engagement Bar Chart */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Clock size={ms(20)} color={theme.text} />
                <Text style={styles.sectionTitle}>Weekly Engagement</Text>
              </View>
              
              <View style={styles.card}>
                <View style={styles.chartContainer}>
                  {data?.weeklyActivity?.map((dayObj: any, idx: number) => {
                    const heightPercent = (dayObj.hours / maxHours) * 100;
                    return (
                      <View key={idx} style={styles.barColumn}>
                        <Text style={styles.barLabelTop}>{dayObj.hours}h</Text>
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { height: `${heightPercent}%` }]} />
                        </View>
                        <Text style={styles.barLabelBottom}>{dayObj.day}</Text>
                      </View>
                    );
                  })}
                </View>
                
                <View style={styles.engagementSummary}>
                  <Text style={styles.engagementText}>Total study hours this week: <Text style={{ fontFamily: 'Poppins-SemiBold', color: theme.text }}>{data?.studyHours || 0} hrs</Text></Text>
                </View>
              </View>
            </View>

            {/* AI Insights */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={ms(20)} color={theme.text} />
                <Text style={styles.sectionTitle}>AI Insights</Text>
              </View>
              
              {data?.insights?.map((insight: any, idx: number) => {
                const isWarning = insight.type === 'warning';
                const isPositive = insight.type === 'positive';
                
                return (
                  <View key={idx} style={[styles.insightCard, isWarning && styles.insightCardWarning, isPositive && styles.insightCardPositive]}>
                    <View style={[styles.insightIconBox, isWarning && { backgroundColor: '#FEF3C7' }, isPositive && { backgroundColor: '#ECFDF5' }]}>
                      {getInsightIcon(insight.type)}
                    </View>
                    <View style={styles.insightContent}>
                      <Text style={styles.insightText}>{insight.message}</Text>
                    </View>
                  </View>
                );
              })}
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
  
  // Header
  header: { backgroundColor: theme.headerBg, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 60, paddingHorizontal: hs(20), paddingBottom: vs(40), borderBottomLeftRadius: ms(32), borderBottomRightRadius: ms(32) },
  headerTitleRow: { marginBottom: vs(24) },
  pageTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(24), color: theme.surface },
  
  heroStatsCard: { backgroundColor: theme.surface, borderRadius: ms(20), padding: ms(20), flexDirection: 'row', alignItems: 'center', shadowColor: theme.headerBg, shadowOffset: { width: 0, height: vs(10) }, shadowOpacity: 0.2, shadowRadius: ms(15), elevation: 5 },
  heroStatBlock: { flex: 1, alignItems: 'center' },
  heroDivider: { width: hs(1), height: vs(40), backgroundColor: theme.border },
  heroStatLbl: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.subtext, marginBottom: vs(4) },
  heroStatVal: { fontFamily: 'Poppins-Bold', fontSize: ms(32), color: theme.text, lineHeight: ms(36) },
  heroStatUnit: { fontFamily: 'Poppins-Medium', fontSize: ms(16), color: theme.subtext, marginLeft: hs(2) },
  trendPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: hs(12), paddingVertical: vs(6), borderRadius: ms(16), marginTop: vs(4) },
  trendPillText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: '#10B981', marginLeft: hs(6) },

  content: { padding: ms(20), paddingTop: vs(16), paddingBottom: vs(100) },
  
  section: { marginBottom: vs(28) },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(16), gap: ms(8) },
  sectionTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.text },
  
  card: { backgroundColor: theme.surface, borderRadius: ms(20), padding: ms(20), shadowColor: theme.subtext, shadowOffset: {width: 0, height: vs(4)}, shadowOpacity: 0.05, shadowRadius: ms(8), elevation: 2 },

  // Subject Mastery
  subjectRow: { marginBottom: vs(16) },
  subjectInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: vs(8) },
  subjectName: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.text },
  subjectScore: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: theme.text },
  progressBarBg: { height: vs(8), backgroundColor: theme.surfaceAlt, borderRadius: ms(4), overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: ms(4) },

  // Chart
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: vs(160), paddingTop: vs(20), paddingBottom: vs(10), borderBottomWidth: 1, borderBottomColor: theme.surfaceAlt },
  barColumn: { alignItems: 'center', flex: 1 },
  barLabelTop: { fontFamily: 'Poppins-Medium', fontSize: ms(10), color: theme.subtext, marginBottom: vs(4) },
  barTrack: { width: hs(12), height: vs(100), backgroundColor: theme.surfaceAlt, borderRadius: ms(6), justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: theme.primary, borderRadius: ms(6) },
  barLabelBottom: { fontFamily: 'Poppins-Medium', fontSize: ms(11), color: theme.subtext, marginTop: vs(8) },
  engagementSummary: { marginTop: vs(16), alignItems: 'center' },
  engagementText: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext },

  // Insights
  insightCard: { flexDirection: 'row', backgroundColor: theme.background, padding: ms(16), borderRadius: ms(16), marginBottom: vs(12), borderWidth: 1, borderColor: theme.surfaceAlt },
  insightCardWarning: { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' },
  insightCardPositive: { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' },
  insightIconBox: { width: hs(40), height: vs(40), borderRadius: ms(12), backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  insightContent: { flex: 1, marginLeft: hs(16), justifyContent: 'center' },
  insightText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.text, lineHeight: ms(20) },
});
