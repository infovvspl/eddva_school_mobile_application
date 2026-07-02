import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from '../Icon';
import BattleTierBadge from './BattleTierBadge';
import BattleLeaderboardPodium from './BattleLeaderboardPodium';
import BattleLeaderboardChart from './BattleLeaderboardChart';
import { useTheme } from '../../context/ThemeContext';
import { getAllBattleTiers } from '../../utils/battleTier';
import type { BattleLeaderboardEntry } from '../../utils/battleMappers';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = {
  entries: BattleLeaderboardEntry[];
  loading: boolean;
  userId?: string;
  myTier?: string;
};

const BattleLeaderboardPanel: React.FC<Props> = ({
  entries,
  loading,
  userId,
  myTier,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const myRank = entries.find(e => e.studentId === userId)?.rank;

  return (
    <View style={styles.wrap}>
      <View style={[styles.typeCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.typeTitle, { color: c.text }]}>Your rank type</Text>
        <BattleTierBadge tier={myTier} size="lg" />
        {myRank ? (
          <Text style={[styles.typeSub, { color: c.textMuted }]}>
            Global rank #{myRank} · Battle XP leaderboard
          </Text>
        ) : (
          <Text style={[styles.typeSub, { color: c.textMuted }]}>
            Play battles to appear on the leaderboard
          </Text>
        )}
      </View>

      <Text style={[styles.legendTitle, { color: c.textMuted }]}>Tier types</Text>
      <View style={styles.legendRow}>
        {getAllBattleTiers().slice(0, 5).map(t => (
          <BattleTierBadge key={t.id} tier={t.id} size="sm" />
        ))}
      </View>

      {!loading && entries.length > 0 ? (
        <>
          <BattleLeaderboardPodium entries={entries} userId={userId} />
          <BattleLeaderboardChart entries={entries} userId={userId} maxBars={10} />
        </>
      ) : null}

      <Text style={[styles.listTitle, { color: c.text }]}>All players</Text>

      {loading && entries.length === 0 ? (
        <ActivityIndicator color={c.primary} style={{ marginVertical: vs(24) }} />
      ) : entries.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: c.card, borderColor: c.border }]}>
          <Icon name="trophy" size={ms(32)} color={c.border} solid />
          <Text style={[styles.emptyText, { color: c.textMuted }]}>
            No rankings yet. Finish a battle to climb the board.
          </Text>
        </View>
      ) : (
        entries.map(entry => {
          const isMe = entry.studentId === userId;
          return (
            <View
              key={entry.studentId || entry.rank}
              style={[
                styles.row,
                { backgroundColor: c.card, borderColor: c.border },
                isMe && { borderColor: c.primary, borderWidth: 2 },
              ]}
            >
              <Text style={[styles.rank, { color: c.textMuted }]}>#{entry.rank}</Text>
              <View style={[styles.avatar, { backgroundColor: `${c.primary}18` }]}>
                <Text style={[styles.initial, { color: c.primary }]}>
                  {(entry.name || '?')[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: c.text }]}>
                  {isMe ? 'You' : entry.name}
                </Text>
                <Text style={[styles.score, { color: c.textMuted }]}>{entry.score} XP</Text>
              </View>
              <BattleTierBadge tier={entry.tier || 'iron'} size="sm" />
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: vs(10) },
  typeCard: {
    padding: spacing.md,
    borderRadius: ms(16),
    borderWidth: 1,
    gap: vs(10),
    alignItems: 'flex-start',
  },
  typeTitle: { fontSize: font.caption, fontWeight: '800' },
  typeSub: { fontSize: font.micro, fontWeight: '600' },
  legendTitle: {
    fontSize: font.micro,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: vs(4),
  },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(6) },
  listTitle: { fontSize: font.caption, fontWeight: '800', marginTop: vs(8) },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: ms(16),
    borderWidth: 1,
    gap: vs(10),
  },
  emptyText: { fontSize: font.caption, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    padding: spacing.md,
    borderRadius: ms(16),
    borderWidth: 1,
  },
  rank: { fontSize: font.caption, fontWeight: '800', width: hs(32) },
  avatar: {
    width: hs(36),
    height: hs(36),
    borderRadius: hs(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: font.subhead, fontWeight: '800' },
  name: { fontSize: font.caption, fontWeight: '700' },
  score: { fontSize: font.micro, marginTop: vs(2) },
});

export default BattleLeaderboardPanel;
