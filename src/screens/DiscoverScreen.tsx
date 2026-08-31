import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { Gamepad2, Calendar as CalendarIcon, Megaphone, Compass, ChevronRight, Trophy, Sparkles } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

export function DiscoverScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    gamification: [],
    calendar: [],
    announcements: [],
    career: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [game, cal, ann, car] = await Promise.all([
          schoolApi.quizRushLeaderboard(),
          schoolApi.getEvents(),
          schoolApi.getPlatformNotices(),
          schoolApi.getCareers(),
        ]);
        
        const safeArray = (arr: any) => Array.isArray(arr) ? arr : [];
        setData({
          gamification: safeArray(game),
          calendar: safeArray(cal),
          announcements: safeArray(ann),
          career: safeArray(car),
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderSectionHeader = (title: string, subtitle?: string, onSeeAll?: () => void) => (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Discover</Text>
        <Text style={styles.pageSub}>Explore school events, latest notices, and career guidance.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Arcade Hero Banner */}
        <TouchableOpacity style={styles.arcadeBanner} activeOpacity={0.9} onPress={() => onNavigate && onNavigate('gamification')}>
          <View style={styles.arcadeBannerContent}>
            <View style={styles.arcadeIconBox}>
              <Gamepad2 size={ms(28)} color="#8B5CF6" />
            </View>
            <View style={styles.arcadeTextContent}>
              <View style={styles.arcadeTitleRow}>
                <Text style={styles.arcadeTitle}>Arcade Hub</Text>
                <Sparkles size={ms(16)} color="#FDE047" fill="#FDE047" />
              </View>
              <Text style={styles.arcadeSub}>Play Quiz Rush, Treasure Map, and more to earn XP!</Text>
            </View>
          </View>
          <View style={styles.arcadeBannerAction}>
            <Text style={styles.arcadeBannerActionText}>Play Now</Text>
            <ChevronRight size={ms(16)} color={theme.surface} />
          </View>
        </TouchableOpacity>
        
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : (
          <>
            {/* Top Leaderboard */}
            {renderSectionHeader('Top Leaderboard', 'Global Student Rankings')}
            <View style={styles.leaderboardContainer}>
              {data.gamification.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>No rankings available yet.</Text></View>
              ) : (
                data.gamification.slice(0, 3).map((item: any, idx: number) => {
                  const isGold = idx === 0;
                  const isSilver = idx === 1;
                  const isBronze = idx === 2;
                  
                  let rankColor = theme.subtext;
                  let rankBg = theme.surfaceAlt;
                  if (isGold) { rankColor = '#D97706'; rankBg = '#FEF3C7'; }
                  else if (isSilver) { rankColor = theme.subtext; rankBg = theme.surfaceAlt; }
                  else if (isBronze) { rankColor = '#B45309'; rankBg = '#FFEDD5'; }

                  return (
                    <View key={idx} style={styles.leaderboardRow}>
                      <View style={[styles.rankCircle, { backgroundColor: rankBg }]}>
                        {isGold ? <Trophy size={ms(16)} color={rankColor} fill={rankColor} /> : <Text style={[styles.rankText, { color: rankColor }]}>#{idx + 1}</Text>}
                      </View>
                      <View style={styles.lbInfo}>
                        <Text style={[styles.lbName, isGold && { fontFamily: 'Poppins-SemiBold' }]}>{item.studentName || 'Student'}</Text>
                        <Text style={styles.lbClass}>Class 10</Text>
                      </View>
                      <View style={styles.scorePill}>
                        <Text style={styles.scorePillText}>{item.points || item.score || 0} XP</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* Announcements */}
            {renderSectionHeader('School Announcements', 'Latest notices from administration')}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll} contentContainerStyle={styles.horizontalContent}>
              {data.announcements.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>No new announcements.</Text></View>
              ) : (
                data.announcements.map((item: any, idx: number) => (
                  <TouchableOpacity key={idx} style={styles.announcementCard} activeOpacity={0.9} onPress={() => Alert.alert('Notice', item.title)}>
                    <View style={styles.announcementHeader}>
                      <View style={styles.announcementIconBox}>
                        <Megaphone size={ms(18)} color="#EF4444" />
                      </View>
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    </View>
                    <Text style={styles.announcementTitle} numberOfLines={2}>{item.title || 'Important Notice'}</Text>
                    <Text style={styles.announcementDate}>{item.date || 'Today'}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            {/* Calendar Events */}
            {renderSectionHeader('Upcoming Events', 'Mark your calendar')}
            <View style={styles.verticalList}>
              {data.calendar.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>No upcoming events.</Text></View>
              ) : (
                data.calendar.map((item: any, idx: number) => {
                  const dateParts = (item.date || 'OCT 15').split(' ');
                  const month = dateParts[0] || 'OCT';
                  const day = dateParts[1] || '15';
                  return (
                    <TouchableOpacity key={idx} style={styles.eventCard} activeOpacity={0.8} onPress={() => Alert.alert('Event', item.title)}>
                      <View style={styles.dateBlock}>
                        <Text style={styles.dateMonth}>{month}</Text>
                        <Text style={styles.dateDay}>{day}</Text>
                      </View>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>{item.title || 'School Event'}</Text>
                        <View style={styles.eventMetaRow}>
                          <CalendarIcon size={ms(12)} color={theme.subtext} />
                          <Text style={styles.eventMetaText}>School Auditorium</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                })
              )}
            </View>

            {/* Career Guidance */}
            {renderSectionHeader('Career Guidance', 'Discover your path', () => onNavigate && onNavigate('careers'))}
            <View style={styles.verticalList}>
              {data.career.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyText}>Explore careers and get a customized roadmap.</Text></View>
              ) : (
                data.career.map((item: any, idx: number) => (
                  <TouchableOpacity key={idx} style={styles.careerCard} activeOpacity={0.8} onPress={() => onNavigate && onNavigate('careers')}>
                    <View style={styles.careerIconBox}>
                      <Compass size={ms(24)} color="#0EA5E9" />
                    </View>
                    <View style={styles.careerInfo}>
                      <Text style={styles.careerTitle}>{item.title || 'Software Engineering'}</Text>
                      <Text style={styles.careerSub}>{item.match || item.industry || 'Tech Industry'}</Text>
                    </View>
                    <View style={styles.careerAction}>
                      <ChevronRight size={ms(20)} color={theme.subtext} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
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
  
  header: { backgroundColor: theme.headerBg, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 60, paddingHorizontal: hs(20), paddingBottom: vs(30), borderBottomLeftRadius: ms(32), borderBottomRightRadius: ms(32) },
  pageTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(28), color: theme.surface, marginBottom: vs(4) },
  pageSub: { fontFamily: 'Poppins-Regular', fontSize: ms(14), color: theme.subtext },
  
  content: { padding: ms(16), paddingTop: vs(20), paddingBottom: vs(100) },

  arcadeBanner: { backgroundColor: '#8B5CF6', borderRadius: ms(24), overflow: 'hidden', shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: vs(8) }, shadowOpacity: 0.3, shadowRadius: ms(16), elevation: 8, marginTop: vs(-40), marginBottom: vs(12) },
  arcadeBannerContent: { flexDirection: 'row', alignItems: 'center', padding: ms(20), paddingBottom: vs(16) },
  arcadeIconBox: { width: hs(56), height: vs(56), borderRadius: ms(16), backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' },
  arcadeTextContent: { flex: 1, marginLeft: hs(16) },
  arcadeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: ms(6) },
  arcadeTitle: { fontFamily: 'Poppins-Bold', fontSize: ms(18), color: theme.surface },
  arcadeSub: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: '#DDD6FE', marginTop: vs(4), lineHeight: ms(18) },
  arcadeBannerAction: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)', paddingVertical: vs(12) },
  arcadeBannerActionText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(13), color: theme.surface, marginRight: hs(4) },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: vs(32), marginBottom: vs(16), paddingHorizontal: hs(4) },
  sectionTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.text, marginBottom: vs(2) },
  sectionSubtitle: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext },
  seeAllBtn: { backgroundColor: '#DBEAFE', paddingHorizontal: hs(12), paddingVertical: vs(6), borderRadius: ms(12) },
  seeAll: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.primary },

  leaderboardContainer: { backgroundColor: theme.surface, borderRadius: ms(20), padding: ms(16), borderWidth: 1, borderColor: theme.border, shadowColor: theme.subtext, shadowOffset: {width: 0, height: vs(4)}, shadowOpacity: 0.05, shadowRadius: ms(8), elevation: 2 },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: vs(12), borderBottomWidth: 1, borderBottomColor: theme.background },
  rankCircle: { width: hs(36), height: vs(36), borderRadius: ms(18), justifyContent: 'center', alignItems: 'center' },
  rankText: { fontFamily: 'Poppins-Bold', fontSize: ms(14) },
  lbInfo: { flex: 1, marginLeft: hs(12) },
  lbName: { fontFamily: 'Poppins-Medium', fontSize: ms(15), color: theme.text },
  lbClass: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext },
  scorePill: { backgroundColor: theme.background, paddingHorizontal: hs(12), paddingVertical: vs(6), borderRadius: ms(12), borderWidth: 1, borderColor: theme.border },
  scorePillText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(13), color: theme.subtext },

  horizontalScroll: { marginHorizontal: hs(-16) },
  horizontalContent: { paddingHorizontal: hs(16), gap: ms(16) },
  announcementCard: { backgroundColor: theme.surface, width: hs(220), borderRadius: ms(20), padding: ms(20), borderWidth: 1, borderColor: theme.border, shadowColor: theme.subtext, shadowOffset: {width: 0, height: vs(4)}, shadowOpacity: 0.05, shadowRadius: ms(8), elevation: 2 },
  announcementHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: vs(16) },
  announcementIconBox: { width: hs(40), height: vs(40), borderRadius: ms(12), backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center' },
  newBadge: { backgroundColor: '#EF4444', paddingHorizontal: hs(8), paddingVertical: vs(4), borderRadius: ms(8) },
  newBadgeText: { fontFamily: 'Poppins-Bold', fontSize: ms(9), color: theme.surface, letterSpacing: 0.5 },
  announcementTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(15), color: theme.text, marginBottom: vs(8), lineHeight: ms(22) },
  announcementDate: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext },

  verticalList: { gap: ms(12) },
  
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: ms(16), padding: ms(12), borderWidth: 1, borderColor: theme.border, shadowColor: theme.subtext, shadowOffset: {width: 0, height: vs(2)}, shadowOpacity: 0.05, shadowRadius: ms(4), elevation: 1 },
  dateBlock: { backgroundColor: '#EFF6FF', borderRadius: ms(12), width: hs(56), height: vs(56), justifyContent: 'center', alignItems: 'center' },
  dateMonth: { fontFamily: 'Poppins-SemiBold', fontSize: ms(11), color: theme.primary, textTransform: 'uppercase' },
  dateDay: { fontFamily: 'Poppins-Bold', fontSize: ms(18), color: theme.headerBg, marginTop: vs(-2) },
  eventInfo: { flex: 1, marginLeft: hs(16) },
  eventTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(15), color: theme.text, marginBottom: vs(4) },
  eventMetaRow: { flexDirection: 'row', alignItems: 'center' },
  eventMetaText: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext, marginLeft: hs(6) },

  careerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: ms(16), padding: ms(16), borderWidth: 1, borderColor: theme.border, shadowColor: theme.subtext, shadowOffset: {width: 0, height: vs(2)}, shadowOpacity: 0.05, shadowRadius: ms(4), elevation: 1 },
  careerIconBox: { width: hs(48), height: vs(48), borderRadius: ms(12), backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center' },
  careerInfo: { flex: 1, marginLeft: hs(16) },
  careerTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(15), color: theme.text, marginBottom: vs(2) },
  careerSub: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext },
  careerAction: { width: hs(32), height: vs(32), borderRadius: ms(16), backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' },

  emptyCard: { backgroundColor: theme.surface, padding: ms(24), borderRadius: ms(16), alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
  emptyText: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext },
});
