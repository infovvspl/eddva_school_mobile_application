import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Platform, StatusBar } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { Gamepad2, Brain, Map, Calculator, FileQuestion, MessageCircle, Trophy, Flame, Star, ChevronRight, PlayCircle, ArrowLeft } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

export function GamificationScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const lb = await schoolApi.quizRushLeaderboard();
      let records = [];
      if (Array.isArray(lb)) records = lb;
      else if (lb && Array.isArray(lb.data)) records = lb.data;
      else if (lb && Array.isArray(lb.leaderboard)) records = lb.leaderboard;
      else if (lb && Array.isArray(lb.results)) records = lb.results;
      
      setLeaderboard(records.slice(0, 3)); // Top 3 only
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async (game: string, apiCall: () => Promise<any>) => {
    try {
      Alert.alert('Starting...', `Launching ${game}...`);
      await apiCall();
    } catch (err) {
      console.error(err);
    }
  };

  const games = [
    { title: 'Treasure Map', desc: 'Explore to learn', icon: <Map size={ms(32)} color="#10B981" />, bg: '#D1FAE5', onPress: () => handleStartGame('Treasure Map', () => schoolApi.getTreasureMaps()) },
    { title: 'Math Sprint', desc: 'Race against time', icon: <Calculator size={ms(32)} color={theme.primary} />, bg: '#DBEAFE', onPress: () => handleStartGame('Math Sprint', () => schoolApi.startMathSprint()) },
    { title: 'Memory Match', desc: 'Test retention', icon: <FileQuestion size={ms(32)} color="#F59E0B" />, bg: '#FEF3C7', onPress: () => handleStartGame('Memory Match', () => schoolApi.startMemoryMatch()) },
    { title: 'Word Master', desc: 'Expand vocabulary', icon: <MessageCircle size={ms(32)} color="#EF4444" />, bg: '#FEE2E2', onPress: () => handleStartGame('Word Master', () => schoolApi.startWordMaster()) }
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Dynamic Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={{ marginRight: hs(12) }}>
                <ArrowLeft size={24} color={theme.surface} />
              </TouchableOpacity>
              <View>
                <Text style={styles.headerTitle}>Arcade Center</Text>
                <Text style={styles.headerLevel}>Level 12 Scholar</Text>
              </View>
            </View>
            <View style={styles.streakBadge}>
              <Flame size={ms(16)} color="#EF4444" />
              <Text style={styles.streakText}>12 Days</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Star size={ms(20)} color="#F59E0B" />
              <Text style={styles.statValue}>3,450</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Trophy size={ms(20)} color={theme.primary} />
              <Text style={styles.statValue}>Top 5%</Text>
              <Text style={styles.statLabel}>School Rank</Text>
            </View>
          </View>
        </View>

        {/* Daily Challenge Banner (Featured) */}
        <Text style={styles.sectionTitle}>Game of the Day</Text>
        <TouchableOpacity style={styles.featuredCard} onPress={() => handleStartGame('Quiz Rush', () => schoolApi.startQuizRush())}>
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>2X XP BOOST</Text>
            </View>
            <Text style={styles.featuredTitle}>Quiz Rush</Text>
            <Text style={styles.featuredDesc}>Answer rapid-fire questions from this week's science chapters to earn double points!</Text>
            <View style={styles.playBtn}>
              <PlayCircle size={ms(18)} color={theme.primary} style={{marginRight: hs(6)}} />
              <Text style={styles.playBtnText}>Play Now</Text>
            </View>
          </View>
          <View style={styles.featuredIconOverlay}>
            <Brain size={ms(120)} color={theme.surface} opacity={0.15} />
          </View>
        </TouchableOpacity>

        {/* Game Grid */}
        <Text style={styles.sectionTitle}>Game Library</Text>
        <View style={styles.grid}>
          {games.map((game, idx) => (
            <TouchableOpacity key={idx} style={styles.gameCard} onPress={game.onPress}>
              <View style={[styles.gameIconBox, { backgroundColor: game.bg }]}>
                {game.icon}
              </View>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDesc}>{game.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Mini Leaderboard */}
        <View style={styles.leaderboardSection}>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.sectionTitle}>Top Players (Global)</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.leaderboardCard}>
            {loading ? (
              <ActivityIndicator size="small" color={theme.primary} style={{ margin: ms(20) }} />
            ) : leaderboard.length > 0 ? (
              leaderboard.map((player, idx) => (
                <View key={idx} style={[styles.lbRow, idx !== leaderboard.length - 1 && styles.lbBorder]}>
                  <View style={styles.lbRankBox}>
                    <Text style={styles.lbRank}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.lbName}>{player.studentName}</Text>
                  <Text style={styles.lbPoints}>{player.points} pts</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No data available</Text>
            )}
          </View>
        </View>
        
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background },
  content: { padding: ms(16), paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 60, paddingBottom: vs(100) },
  
  // Header
  headerCard: { backgroundColor: theme.text, borderRadius: ms(24), padding: ms(24), marginBottom: vs(24), shadowColor: theme.text, shadowOffset: {width: 0, height: vs(10)}, shadowOpacity: 0.1, shadowRadius: ms(15), elevation: 5 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: vs(24) },
  headerTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(24), color: theme.surface, marginBottom: vs(4) },
  headerLevel: { fontFamily: 'Poppins-Regular', fontSize: ms(14), color: theme.subtext },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: hs(12), paddingVertical: vs(6), borderRadius: ms(20) },
  streakText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(13), color: '#EF4444', marginLeft: hs(4) },
  
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.text, borderRadius: ms(16), padding: ms(16) },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: hs(1), height: vs(40), backgroundColor: theme.subtext },
  statValue: { fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.surface, marginTop: vs(8) },
  statLabel: { fontFamily: 'Poppins-Regular', fontSize: ms(11), color: theme.subtext },

  sectionTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.text, marginBottom: vs(12) },
  
  // Featured Card
  featuredCard: { backgroundColor: theme.primary, borderRadius: ms(24), overflow: 'hidden', marginBottom: vs(24), shadowColor: theme.primary, shadowOffset: {width: 0, height: vs(8)}, shadowOpacity: 0.3, shadowRadius: ms(12), elevation: 5 },
  featuredContent: { padding: ms(24), position: 'relative', zIndex: 2 },
  featuredBadge: { backgroundColor: '#F59E0B', alignSelf: 'flex-start', paddingHorizontal: hs(10), paddingVertical: vs(4), borderRadius: ms(8), marginBottom: vs(16) },
  featuredBadgeText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(10), color: theme.surface, letterSpacing: 0.5 },
  featuredTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(26), color: theme.surface, marginBottom: vs(8) },
  featuredDesc: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: '#BFDBFE', lineHeight: ms(20), marginBottom: vs(24), width: '85%' },
  playBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, paddingHorizontal: hs(20), paddingVertical: vs(12), borderRadius: ms(12) },
  playBtnText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: theme.primary },
  featuredIconOverlay: { position: 'absolute', right: hs(-20), bottom: vs(-20), zIndex: 1 },

  // Game Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: ms(12), marginBottom: vs(24) },
  gameCard: { width: '48%', backgroundColor: theme.surface, borderRadius: ms(20), padding: ms(20), alignItems: 'center', borderWidth: 1, borderColor: theme.border, shadowColor: theme.subtext, shadowOffset: {width: 0, height: vs(4)}, shadowOpacity: 0.05, shadowRadius: ms(8), elevation: 2 },
  gameIconBox: { width: hs(64), height: vs(64), borderRadius: ms(20), justifyContent: 'center', alignItems: 'center', marginBottom: vs(16) },
  gameTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(15), color: theme.text, textAlign: 'center', marginBottom: vs(4) },
  gameDesc: { fontFamily: 'Poppins-Regular', fontSize: ms(11), color: theme.subtext, textAlign: 'center' },

  // Leaderboard
  leaderboardSection: { marginBottom: vs(24) },
  leaderboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: vs(12) },
  seeAllText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.primary },
  leaderboardCard: { backgroundColor: theme.surface, borderRadius: ms(20), borderWidth: 1, borderColor: theme.border, padding: ms(16) },
  lbRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: vs(12) },
  lbBorder: { borderBottomWidth: 1, borderBottomColor: theme.surfaceAlt },
  lbRankBox: { width: hs(28), height: vs(28), borderRadius: ms(14), backgroundColor: theme.surfaceAlt, justifyContent: 'center', alignItems: 'center', marginRight: hs(12) },
  lbRank: { fontFamily: 'Poppins-SemiBold', fontSize: ms(12), color: theme.subtext },
  lbName: { flex: 1, fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.text },
  lbPoints: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: '#F59E0B' },
  emptyText: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext, textAlign: 'center', margin: ms(20) },
});
