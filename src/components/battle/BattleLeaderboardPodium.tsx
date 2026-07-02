import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Brand } from '../../constants/brand';
import { BorderRadius, Shadow } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import type { BattleLeaderboardEntry } from '../../utils/battleMappers';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = {
  entries: BattleLeaderboardEntry[];
  userId?: string;
};

const PODIUM_ORDER = [1, 0, 2] as const;
const PODIUM_HEIGHTS = [vs(56), vs(88), vs(48)];
const MEDALS = ['#C0C0C0', '#FFD700', '#CD7F32'];

/**
 * Top-3 podium bars (like main Group Leaderboard) for Battle Arena.
 */
const BattleLeaderboardPodium: React.FC<Props> = ({ entries, userId }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  const top3 = useMemo(
    () => [...entries].sort((a, b) => a.rank - b.rank).slice(0, 3),
    [entries],
  );

  if (top3.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
      <LinearGradient
        colors={['#EFF6FF', c.card]}
        style={StyleSheet.absoluteFillObject}
      />
      <Text style={[styles.title, { color: c.text }]}>Top 3</Text>
      <View style={styles.podiumRow}>
        {PODIUM_ORDER.map((slot, idx) => {
          const entry = top3[slot];
          if (!entry) {
            return <View key={`empty-${idx}`} style={styles.slot} />;
          }
          const isMe = entry.studentId === userId;
          const medal = MEDALS[slot] ?? Brand.blue700;
          return (
            <View key={entry.studentId} style={styles.slot}>
              <View
                style={[
                  styles.avatar,
                  {
                    borderColor: medal,
                    backgroundColor: isMe ? `${c.primary}20` : c.background,
                  },
                ]}
              >
                <Text style={[styles.initial, { color: c.primary }]}>
                  {(entry.name || '?')[0]}
                </Text>
              </View>
              <Text style={[styles.pName, { color: c.text }]} numberOfLines={1}>
                {isMe ? 'You' : entry.name.split(' ')[0]}
              </Text>
              <Text style={[styles.pScore, { color: c.textMuted }]}>{entry.score} XP</Text>
              <LinearGradient
                colors={[medal, `${medal}99`]}
                style={[styles.bar, { height: PODIUM_HEIGHTS[idx] }]}
              />
              <Text style={[styles.pRank, { color: medal }]}>#{entry.rank}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    overflow: 'hidden',
    marginBottom: vs(10),
  },
  title: {
    fontSize: font.caption,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: vs(12),
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: hs(12),
  },
  slot: { flex: 1, alignItems: 'center', maxWidth: hs(100) },
  avatar: {
    width: hs(44),
    height: hs(44),
    borderRadius: hs(22),
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(6),
  },
  initial: { fontSize: font.subhead, fontWeight: '900' },
  pName: { fontSize: font.micro, fontWeight: '800', textAlign: 'center' },
  pScore: { fontSize: font.micro, marginTop: vs(2), marginBottom: vs(6) },
  bar: { width: '85%', borderTopLeftRadius: ms(8), borderTopRightRadius: ms(8) },
  pRank: { fontSize: font.caption, fontWeight: '900', marginTop: vs(4) },
});

export default BattleLeaderboardPodium;
