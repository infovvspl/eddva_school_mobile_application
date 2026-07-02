import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { Colors, BorderRadius, Shadow } from '../constants/theme';
import { useApi } from '../hooks/useApi';
import { battleService } from '../services/battle.service';
import { useAuth } from '../context/AuthContext';
import { asArray } from '../utils/apiData';
import { font, layout, ms, pagePadding, spacing, vs } from '../utils/responsive';

const BattleArenaScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);

  const daily = useApi(() => battleService.getDaily(), []);
  const elo = useApi(() => battleService.getMyElo(), []);
  const history = useApi(() => battleService.getMyHistory(), []);
  const leaderboard = useApi(() => battleService.getLeaderboard(), []);

  const dailyData = daily.data as any;
  const eloData = elo.data as any;
  const historyItems: any[] = asArray(history.data, ['battles', 'history']);
  const lbEntries: any[] = asArray(leaderboard.data, ['entries', 'leaderboard']);

  const loading = daily.loading || elo.loading;

  const onRefresh = () => { daily.refetch(); elo.refetch(); history.refetch(); leaderboard.refetch(); };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { data } = await battleService.create({});
      Alert.alert(
        'Battle Created!',
        `Room Code: ${data.roomCode}\nShare this with your opponent`,
        [{ text: 'OK' }],
      );
      history.refetch();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to create battle');
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!roomCode.trim()) { Alert.alert('Enter room code'); return; }
    setJoining(true);
    try {
      const { data } = await battleService.join(roomCode.trim().toUpperCase());
      Alert.alert('Joined!', `Battle started: ${data.id}`);
      setRoomCode('');
      history.refetch();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Invalid room code');
    } finally {
      setJoining(false);
    }
  };

  const getResultColor = (result: string) => {
    if (result === 'win') return Colors.success;
    if (result === 'loss') return Colors.danger;
    return Colors.textMuted;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
    >
      {/* Hero Header */}
      <LinearGradient colors={['#1a0533', '#4a1299', '#6d28d9']} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.heroTitle}>Battle Arena</Text>
        <Text style={styles.heroSubtitle}>Challenge classmates in real-time quiz battles</Text>

        {eloData && (
          <View style={styles.eloRow}>
            <View style={styles.eloCard}>
              <Icon name="chess-king" size={18} color="#f59e0b" solid />
              <Text style={styles.eloValue}>{eloData.elo || eloData.rating || 1200}</Text>
              <Text style={styles.eloLabel}>ELO Rating</Text>
            </View>
            <View style={styles.eloCard}>
              <Icon name="trophy" size={18} color="#34d399" solid />
              <Text style={styles.eloValue}>{eloData.wins || 0}</Text>
              <Text style={styles.eloLabel}>Wins</Text>
            </View>
            <View style={styles.eloCard}>
              <Icon name="star" size={18} color="#a78bfa" solid />
              <Text style={styles.eloValue}>{eloData.xp || eloData.battleXp || 0}</Text>
              <Text style={styles.eloLabel}>Battle XP</Text>
            </View>
            <View style={styles.eloCard}>
              <Icon name="percent" size={18} color="#60a5fa" solid />
              <Text style={styles.eloValue}>{eloData.winRate || '—'}%</Text>
              <Text style={styles.eloLabel}>Win Rate</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      <View style={styles.body}>
        {/* Daily Battle */}
        {dailyData && (
          <View style={styles.dailyCard}>
            <LinearGradient colors={['#f59e0b', '#ef4444']} style={styles.dailyGrad}>
              <View style={styles.dailyContent}>
                <View style={styles.dailyBadge}>
                  <Icon name="calendar-day" size={10} color="#b45309" solid />
                  <Text style={styles.dailyBadgeText}>DAILY CHALLENGE</Text>
                </View>
                <Text style={styles.dailyTitle}>{dailyData.title || 'Today\'s Battle'}</Text>
                <Text style={styles.dailySub}>{dailyData.description || '20 questions · 10 min'}</Text>
              </View>
              <TouchableOpacity style={styles.playBtn} activeOpacity={0.8}>
                <Icon name="play" size={16} color="#b45309" solid />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Create & Join */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.createBtn, creating && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={creating}
            activeOpacity={0.85}
          >
            <LinearGradient colors={[Colors.primary, Colors.secondary]} style={styles.btnGrad}>
              {creating ? <ActivityIndicator color={Colors.white} size="small" /> : <>
                <Icon name="plus-circle" size={18} color={Colors.white} solid />
                <Text style={styles.createBtnText}>Create Room</Text>
              </>}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.joinBox}>
            <TextInput
              style={styles.codeInput}
              placeholder="Room code"
              placeholderTextColor={Colors.textMuted}
              value={roomCode}
              onChangeText={v => setRoomCode(v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={8}
            />
            <TouchableOpacity
              style={[styles.joinBtn, (!roomCode.trim() || joining) && { opacity: 0.6 }]}
              onPress={handleJoin}
              disabled={!roomCode.trim() || joining}
              activeOpacity={0.85}
            >
              {joining ? <ActivityIndicator color={Colors.white} size="small" /> : <Text style={styles.joinBtnText}>Join</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* XP Leaderboard */}
        {lbEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Battle XP Leaderboard</Text>
            {lbEntries.slice(0, 5).map((e: any, i: number) => {
              const isMe = e.studentId === user?.id || e.userId === user?.id;
              return (
                <View key={e.id || i} style={[styles.lbRow, isMe && styles.lbRowMe]}>
                  <Text style={styles.lbRank}>#{i + 1}</Text>
                  <View style={styles.lbAvatar}>
                    <Text style={styles.lbInitial}>{(e.name || '?')[0]}</Text>
                  </View>
                  <Text style={[styles.lbName, { flex: 1 }]}>{isMe ? 'You' : e.name}</Text>
                  <Icon name="star" size={12} color="#f59e0b" solid />
                  <Text style={styles.lbXp}>{e.xp || e.battleXp || 0} XP</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Battle History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Battle History</Text>
          {history.loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : historyItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="swords" size={32} color={Colors.borderLight} />
              <Text style={styles.emptyText}>No battles yet — create or join one!</Text>
            </View>
          ) : (
            historyItems.slice(0, 10).map((b: any) => (
              <View key={b.id} style={styles.historyCard}>
                <View style={[styles.resultBadge, { backgroundColor: `${getResultColor(b.result)}20` }]}>
                  <Text style={[styles.resultText, { color: getResultColor(b.result) }]}>
                    {(b.result || 'pending').toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyOpponent}>vs {b.opponentName || b.opponent?.name || 'Unknown'}</Text>
                  <Text style={styles.historyScore}>
                    {b.myScore ?? '?'} - {b.opponentScore ?? '?'} · {b.topic || b.subject || 'General'}
                  </Text>
                </View>
                <View style={styles.historyXp}>
                  <Icon name="star" size={10} color="#f59e0b" solid />
                  <Text style={styles.historyXpText}>{b.xpEarned || 0}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const getResultColor = (r: string) => {
  if (r === 'win') return Colors.success;
  if (r === 'loss') return Colors.danger;
  return Colors.textMuted;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { paddingHorizontal: pagePadding, paddingBottom: spacing.xl },
  heroTitle: { fontSize: font.headline, fontWeight: '800', color: Colors.white, marginBottom: spacing.xs },
  heroSubtitle: { fontSize: font.caption, color: 'rgba(255,255,255,0.7)', marginBottom: vs(20) },
  eloRow: { flexDirection: 'row', gap: spacing.sm },
  eloCard: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: ms(12), padding: vs(10), gap: vs(3) },
  eloValue: { fontSize: font.title, fontWeight: '800', color: Colors.white },
  eloLabel: { fontSize: font.micro, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  body: { padding: pagePadding },
  dailyCard: { borderRadius: BorderRadius.xl, overflow: 'hidden', marginBottom: spacing.md, ...Shadow.soft },
  dailyGrad: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  dailyContent: { flex: 1 },
  dailyBadge: { flexDirection: 'row', alignItems: 'center', gap: vs(5), backgroundColor: 'rgba(255,255,255,0.4)', alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: vs(3), borderRadius: ms(8), marginBottom: vs(6) },
  dailyBadgeText: { fontSize: font.micro, fontWeight: '800', color: '#b45309', letterSpacing: 0.8 },
  dailyTitle: { fontSize: font.title, fontWeight: '700', color: Colors.white, marginBottom: vs(2) },
  dailySub: { fontSize: font.caption, color: 'rgba(255,255,255,0.8)' },
  playBtn: { width: layout.avatarMd, height: layout.avatarMd, borderRadius: ms(24), backgroundColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  actionsRow: { gap: spacing.md, marginBottom: vs(20) },
  createBtn: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, height: layout.touchTargetLg },
  createBtnText: { fontSize: font.title, fontWeight: '700', color: Colors.white },
  joinBox: { flexDirection: 'row', gap: vs(10) },
  codeInput: { flex: 1, height: layout.touchTargetLg, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, paddingHorizontal: spacing.md, fontSize: font.subhead, fontWeight: '700', color: Colors.text, borderWidth: 1.5, borderColor: Colors.border, letterSpacing: 2 },
  joinBtn: { height: layout.touchTargetLg, paddingHorizontal: spacing.xl, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  joinBtnText: { fontSize: font.subhead, fontWeight: '700', color: Colors.white },
  section: { marginBottom: vs(20) },
  sectionTitle: { fontSize: font.title, fontWeight: '800', color: Colors.text, marginBottom: spacing.md },
  lbRow: { flexDirection: 'row', alignItems: 'center', gap: vs(10), backgroundColor: Colors.white, padding: spacing.md, borderRadius: BorderRadius.lg, marginBottom: spacing.sm, ...Shadow.soft },
  lbRowMe: { borderWidth: 2, borderColor: Colors.primary },
  lbRank: { fontSize: font.caption, fontWeight: '800', color: Colors.textMuted, width: ms(28) },
  lbAvatar: { width: ms(32), height: ms(32), borderRadius: ms(16), backgroundColor: `${Colors.primary}20`, alignItems: 'center', justifyContent: 'center' },
  lbInitial: { fontSize: font.subhead, fontWeight: '700', color: Colors.primary },
  lbName: { fontSize: font.caption, fontWeight: '600', color: Colors.text },
  lbXp: { fontSize: font.caption, fontWeight: '700', color: '#f59e0b' },
  historyCard: { flexDirection: 'row', alignItems: 'center', gap: vs(10), backgroundColor: Colors.white, padding: spacing.md, borderRadius: BorderRadius.lg, marginBottom: spacing.sm, ...Shadow.soft },
  resultBadge: { paddingHorizontal: spacing.sm, paddingVertical: vs(4), borderRadius: ms(8) },
  resultText: { fontSize: font.micro, fontWeight: '800' },
  historyOpponent: { fontSize: font.subhead, fontWeight: '600', color: Colors.text },
  historyScore: { fontSize: font.caption, color: Colors.textMuted, marginTop: vs(2) },
  historyXp: { flexDirection: 'row', alignItems: 'center', gap: vs(3) },
  historyXpText: { fontSize: font.caption, fontWeight: '700', color: '#f59e0b' },
  emptyCard: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl, backgroundColor: Colors.white, borderRadius: BorderRadius.lg, ...Shadow.soft },
  emptyText: { fontSize: font.caption, color: Colors.textMuted, textAlign: 'center' },
});

export default BattleArenaScreen;
