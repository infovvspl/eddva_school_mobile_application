import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../components/Icon';
import BattleArenaTabs, { type BattleArenaTab } from '../../components/battle/BattleArenaTabs';
import BattleTierBadge from '../../components/battle/BattleTierBadge';
import BattleArenaHomePanel from '../../components/battle/BattleArenaHomePanel';
import BattleLeaderboardPanel from '../../components/battle/BattleLeaderboardPanel';
import BattleHistoryPanel from '../../components/battle/BattleHistoryPanel';
import { Brand } from '../../constants/brand';
import { BorderRadius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { battleService } from '../../services/battle.service';
import {
  mapBattleDaily,
  mapBattleElo,
  mapBattleHistory,
  mapBattleLeaderboard,
  isJoinableDailyBattle,
} from '../../utils/battleMappers';
import { BattleStackParamList } from '../../types/navigation';
import { font, hs, ms, pagePadding, spacing, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<BattleStackParamList, 'BattleLobby'>;

const BattleLobbyScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;
  const [tab, setTab] = useState<BattleArenaTab>('play');

  const elo = useApi(() => battleService.getMyElo(), []);
  const daily = useApi(() => battleService.getDaily(), []);
  const leaderboard = useApi(() => battleService.getLeaderboard(), []);
  const history = useApi(() => battleService.getMyHistory(), []);

  useFocusEffect(
    React.useCallback(() => {
      elo.refetch();
      daily.refetch();
      leaderboard.refetch();
      history.refetch();
    }, [elo.refetch, daily.refetch, leaderboard.refetch, history.refetch]),
  );

  const eloStats = mapBattleElo(elo.data);
  const dailyBattle = mapBattleDaily(daily.data);
  const lb = mapBattleLeaderboard(leaderboard.data);
  const battles = mapBattleHistory(history.data);
  const loading = elo.loading && !elo.data;
  const panelLoading =
    tab === 'leaderboard' ? leaderboard.loading : tab === 'history' ? history.loading : false;

  const examLabel = [user?.examTarget, user?.className].filter(Boolean).join(' ').trim() || 'JEE / NEET';

  const onRefresh = () => {
    elo.refetch();
    daily.refetch();
    leaderboard.refetch();
    history.refetch();
  };

  const startDaily = () => {
    if (isJoinableDailyBattle(dailyBattle)) {
      navigation.navigate('BattleLive', {
        roomCode: dailyBattle!.roomCode!,
        battleId: dailyBattle!.battleId,
        opponent: 'Daily Challenge',
      });
      return;
    }
    navigation.navigate('BattleMatchmaker', {
      mode: '1v1',
      subject: dailyBattle?.title ?? 'Daily Battle',
    });
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <LinearGradient colors={[...Brand.gradient]} style={styles.heroBand}>
        <Text style={styles.heroTitle}>Battle Arena</Text>
        <Text style={styles.heroSub}>Real-time quiz duels</Text>

        {eloStats ? (
          <>
            <View style={styles.tierRow}>
              <BattleTierBadge tier={eloStats.tier} size="lg" />
              <Text style={styles.tierHint}>
                {eloStats.battlesPlayed} battles · {eloStats.winRate}% win rate
              </Text>
            </View>
            <View style={styles.eloRow}>
              <StatPill icon="chess-king" color="#FBBF24" value={eloStats.elo} label="ELO" />
              <StatPill icon="trophy" color="#34D399" value={eloStats.wins} label="Wins" />
              <StatPill icon="fire" color="#60A5FA" value={eloStats.streak} label="Streak" />
              <StatPill icon="star" color="#C4B5FD" value={eloStats.battleXp} label="XP" />
            </View>
          </>
        ) : loading ? (
          <ActivityIndicator color="#fff" style={{ marginVertical: vs(12) }} />
        ) : null}
        {elo.error ? (
          <Text style={styles.heroErr}>Could not load stats — pull to refresh</Text>
        ) : null}
      </LinearGradient>

      <BattleArenaTabs active={tab} onChange={setTab} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading || panelLoading}
            onRefresh={onRefresh}
            tintColor={c.primary}
          />
        }
      >
        {tab === 'play' ? (
          <BattleArenaHomePanel
            navigation={navigation}
            userId={user?.id}
            examLabel={examLabel}
            eloStats={eloStats}
            dailyBattle={dailyBattle}
            leaderboard={lb}
            leaderboardLoading={leaderboard.loading}
            leaderboardError={leaderboard.error}
            onRefreshLeaderboard={leaderboard.refetch}
            onDaily={startDaily}
            onQuickDuel={() =>
              navigation.navigate('BattleMatchmaker', { mode: '1v1', subject: 'Quick Duel' })
            }
            onFriendRoom={() => navigation.navigate('BattleRoomCode', { create: true })}
          />
        ) : null}

        {tab === 'leaderboard' ? (
          <BattleLeaderboardPanel
            entries={lb}
            loading={leaderboard.loading}
            userId={user?.id}
            myTier={eloStats?.tier}
          />
        ) : null}

        {tab === 'history' ? (
          <BattleHistoryPanel battles={battles} loading={history.loading} />
        ) : null}
      </ScrollView>
    </View>
  );
};

const StatPill: React.FC<{
  icon: string;
  color: string;
  value: number | string;
  label: string;
}> = ({ icon, color, value, label }) => (
  <View style={styles.statPill}>
    <Icon name={icon} size={ms(14)} color={color} solid />
    <Text style={styles.statVal}>{value}</Text>
    <Text style={styles.statLbl}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  heroBand: {
    paddingHorizontal: pagePadding,
    paddingTop: vs(8),
    paddingBottom: spacing.md,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  heroTitle: {
    fontSize: font.headline,
    fontWeight: '900',
    color: '#fff',
    marginBottom: vs(4),
  },
  heroSub: {
    fontSize: font.caption,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: vs(10),
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: hs(10),
    marginBottom: vs(10),
  },
  tierHint: {
    flex: 1,
    fontSize: font.micro,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.88)',
  },
  heroErr: {
    fontSize: font.micro,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: vs(8),
  },
  eloRow: { flexDirection: 'row', gap: hs(8) },
  statPill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: ms(12),
    paddingVertical: vs(10),
    gap: vs(2),
  },
  statVal: { fontSize: font.title, fontWeight: '800', color: '#fff' },
  statLbl: { fontSize: font.micro, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: vs(32) },
});

export default BattleLobbyScreen;
