import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from '../Icon';
import BattleLivePlayersList, { type LivePlayer } from './BattleLivePlayersList';
import { Brand } from '../../constants/brand';
import { Shadow } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { battleService } from '../../services/battle.service';
import { extractBattleId, extractRoomCode } from '../../hooks/useBattleRoom';
import type { BattleDaily, BattleElo, BattleLeaderboardEntry } from '../../utils/battleMappers';
import { isActiveDailyBattle, isJoinableDailyBattle } from '../../utils/battleMappers';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Nav = {
  navigate: (screen: string, params?: object) => void;
};

type Props = {
  navigation: Nav;
  userId?: string;
  examLabel?: string;
  eloStats: BattleElo | null;
  dailyBattle: BattleDaily | null;
  leaderboard: BattleLeaderboardEntry[];
  leaderboardLoading: boolean;
  leaderboardError?: string | null;
  onRefreshLeaderboard: () => void;
  onDaily: () => void;
  onQuickDuel: () => void;
  onFriendRoom: () => void;
};

const BattleArenaHomePanel: React.FC<Props> = ({
  navigation,
  userId,
  examLabel = 'JEE / NEET',
  eloStats,
  dailyBattle,
  leaderboard,
  leaderboardLoading,
  leaderboardError,
  onDaily,
  onQuickDuel,
  onFriendRoom,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const [challengingId, setChallengingId] = useState<string | null>(null);

  /** Real leaderboard entries — not a live presence list (no online API). */
  const challengablePlayers: LivePlayer[] = useMemo(
    () =>
      leaderboard.filter(
        e =>
          e.studentId &&
          e.studentId !== userId &&
          e.name &&
          e.name !== 'Player',
      ),
    [leaderboard, userId],
  );

  const handleChallenge = async (player: LivePlayer) => {
    setChallengingId(player.studentId);
    try {
      const { data } = await battleService.createFriendChallenge();
      const battleId = extractBattleId(data);
      const roomCode = extractRoomCode(data);
      if (!battleId || !roomCode) {
        throw new Error('Could not create challenge room');
      }
      navigation.navigate('BattleChallengeWait', {
        battleId,
        roomCode,
        opponentName: player.name,
        opponentId: player.studentId,
      });
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Challenge failed';
      Alert.alert('Could not send challenge', msg);
    } finally {
      setChallengingId(null);
    }
  };

  const showDaily = isActiveDailyBattle(dailyBattle);

  return (
    <View style={styles.wrap}>
      <View style={[styles.metaRow, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={[styles.examChip, { borderColor: c.border }]}>
          <Text style={[styles.examText, { color: c.text }]}>{examLabel}</Text>
          <Icon name="chevron-down" size={ms(10)} color={c.textMuted} solid />
        </View>
        <View style={[styles.rankPill, { borderColor: c.border, backgroundColor: c.background }]}>
          <Icon name="trophy" size={ms(10)} color={c.primary} solid />
          <Text style={[styles.rankPillText, { color: c.textSecondary }]}>
            {challengablePlayers.length} on leaderboard
          </Text>
        </View>
        <View style={[styles.xpBox, { backgroundColor: `${Brand.blue700}12` }]}>
          <Text style={styles.xpLbl}>XP points</Text>
          <Text style={[styles.xpVal, { color: Brand.blue700 }]}>
            {eloStats?.battleXp ?? 0}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.friendCard, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={onFriendRoom}
        activeOpacity={0.9}
      >
        <View style={[styles.friendIcon, { backgroundColor: `${c.primary}15` }]}>
          <Icon name="user-plus" size={ms(18)} color={c.primary} solid />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.friendTitle, { color: c.text }]}>Challenge friend</Text>
          <Text style={[styles.friendSub, { color: c.textMuted }]}>
            Create or join with code
          </Text>
        </View>
        <Icon name="chevron-right" size={ms(12)} color={c.textMuted} solid />
      </TouchableOpacity>

      {showDaily ? (
        <TouchableOpacity
          style={[styles.dailyCard, { borderColor: c.border }]}
          onPress={onDaily}
          activeOpacity={0.9}
        >
          <Icon name="bolt" size={ms(16)} color={Brand.blue700} solid />
          <View style={{ flex: 1 }}>
            <Text style={[styles.dailyTitle, { color: c.text }]}>{dailyBattle!.title}</Text>
            <Text style={[styles.dailySub, { color: c.textMuted }]}>
              {isJoinableDailyBattle(dailyBattle)
                ? `Room ${dailyBattle!.roomCode} · Tap to play`
                : 'Start today\'s duel'}
            </Text>
          </View>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={[styles.quickRow, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
        onPress={onQuickDuel}
        activeOpacity={0.9}
      >
        <Icon name="bolt" size={ms(16)} color={Brand.blue700} solid />
        <Text style={[styles.quickText, { color: Brand.blue700 }]}>Quick match (random)</Text>
        <Icon name="chevron-right" size={ms(12)} color={Brand.blue700} solid />
      </TouchableOpacity>

      {leaderboardError ? (
        <View style={[styles.infoBanner, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
          <Icon name="exclamation-circle" size={ms(14)} color="#DC2626" solid />
          <Text style={[styles.infoText, { color: '#991B1B' }]}>
            Could not load players: {leaderboardError}. Pull down to refresh.
          </Text>
        </View>
      ) : null}

      <View style={[styles.infoBanner, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
        <Icon name="info-circle" size={ms(14)} color={c.primary} solid />
        <Text style={[styles.infoText, { color: c.textSecondary }]}>
          Names below are real students from the battle leaderboard — not who is online right now.
          Challenge sends a room code they must join to accept.
        </Text>
      </View>

      <BattleLivePlayersList
        players={challengablePlayers}
        userId={userId}
        loading={leaderboardLoading}
        challengingId={challengingId}
        onChallenge={handleChallenge}
        variant="ranked"
      />

      <Text style={[styles.hint, { color: c.textMuted }]}>
        Tap Challenge → share the room code → when they join, the battle starts automatically.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: vs(12) },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: hs(8),
    padding: spacing.md,
    borderRadius: ms(16),
    borderWidth: 1,
    ...Shadow.soft,
  },
  examChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: ms(10),
    borderWidth: 1,
  },
  examText: { fontSize: font.micro, fontWeight: '700' },
  rankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: ms(10),
    borderWidth: 1,
  },
  rankPillText: { fontSize: font.micro, fontWeight: '700' },
  infoBanner: {
    flexDirection: 'row',
    gap: hs(10),
    padding: spacing.md,
    borderRadius: ms(14),
    borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: font.micro, lineHeight: vs(16) },
  xpBox: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(10),
  },
  xpLbl: { fontSize: font.micro, fontWeight: '700', color: '#64748B', textTransform: 'uppercase' },
  xpVal: { fontSize: font.subhead, fontWeight: '900' },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: spacing.md,
    borderRadius: ms(16),
    borderWidth: 1,
    ...Shadow.soft,
  },
  friendIcon: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendTitle: { fontSize: font.caption, fontWeight: '800' },
  friendSub: { fontSize: font.micro, marginTop: vs(2) },
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: spacing.md,
    borderRadius: ms(14),
    borderWidth: 1,
    backgroundColor: '#FFFBEB',
  },
  dailyTitle: { fontSize: font.caption, fontWeight: '800' },
  dailySub: { fontSize: font.micro, marginTop: vs(2) },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    padding: spacing.md,
    borderRadius: ms(14),
    borderWidth: 1,
  },
  quickText: { flex: 1, fontSize: font.caption, fontWeight: '800' },
  hint: { fontSize: font.micro, lineHeight: vs(16), textAlign: 'center', marginTop: vs(4) },
});

export default BattleArenaHomePanel;
