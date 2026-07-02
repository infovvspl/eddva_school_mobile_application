import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Brand } from '../../constants/brand';
import { BorderRadius, Colors, Shadow } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { getBattleTierMeta } from '../../utils/battleTier';
import type { BattleLeaderboardEntry } from '../../utils/battleMappers';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = {
  entries: BattleLeaderboardEntry[];
  userId?: string;
  maxBars?: number;
};

const BAR_COLORS = [Brand.blue700, Brand.blue400, '#60A5FA', '#93C5FD', '#BFDBFE'];

const BattleLeaderboardChart: React.FC<Props> = ({
  entries,
  userId,
  maxBars = 10,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;

  const chartData = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.rank - b.rank);
    return sorted.slice(0, maxBars);
  }, [entries, maxBars]);

  const maxScore = useMemo(
    () => Math.max(...chartData.map(e => e.score), 1),
    [chartData],
  );

  if (chartData.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
      <Text style={[styles.title, { color: c.text }]}>Battle XP chart</Text>
      <Text style={[styles.sub, { color: c.textMuted }]}>
        Top {chartData.length} players by battle score
      </Text>

      <View style={styles.chart}>
        {chartData.map((entry, i) => {
          const isMe = entry.studentId === userId;
          const pct = Math.max(8, (entry.score / maxScore) * 100);
          const tierColor = getBattleTierMeta(entry.tier).color;
          const barColors = isMe
            ? [Brand.blue700, Brand.blue400]
            : [BAR_COLORS[i % BAR_COLORS.length], `${BAR_COLORS[i % BAR_COLORS.length]}99`];

          return (
            <View key={entry.studentId || entry.rank} style={styles.row}>
              <View style={styles.labelCol}>
                <Text style={[styles.rank, { color: c.textMuted }]}>#{entry.rank}</Text>
                <Text
                  style={[styles.name, { color: isMe ? c.primary : c.text }]}
                  numberOfLines={1}
                >
                  {isMe ? 'You' : entry.name.split(' ')[0]}
                </Text>
              </View>
              <View style={styles.barCol}>
                <View style={[styles.track, { backgroundColor: c.borderLight }]}>
                  <LinearGradient
                    colors={barColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.fill, { width: `${pct}%` }]}
                  />
                  {isMe ? (
                    <View style={[styles.youDot, { backgroundColor: c.primary }]} />
                  ) : null}
                </View>
                <View style={styles.scoreRow}>
                  <View style={[styles.tierDot, { backgroundColor: tierColor }]} />
                  <Text style={[styles.score, { color: c.text }]}>{entry.score}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <LinearGradient colors={[Brand.blue700, Brand.blue400]} style={styles.legendSwatch} />
          <Text style={[styles.legendText, { color: c.textMuted }]}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: BAR_COLORS[0] }]} />
          <Text style={[styles.legendText, { color: c.textMuted }]}>Other players</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(4),
  },
  title: { fontSize: font.subhead, fontWeight: '800' },
  sub: { fontSize: font.micro, marginTop: vs(2), marginBottom: vs(14) },
  chart: { gap: vs(10) },
  row: { flexDirection: 'row', alignItems: 'center', gap: hs(10) },
  labelCol: { width: hs(52) },
  rank: { fontSize: font.micro, fontWeight: '800' },
  name: { fontSize: font.tiny, fontWeight: '700', marginTop: vs(1) },
  barCol: { flex: 1, gap: vs(4) },
  track: {
    height: vs(14),
    borderRadius: ms(7),
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: { height: '100%', borderRadius: ms(7) },
  youDot: {
    position: 'absolute',
    right: hs(4),
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: hs(6) },
  tierDot: { width: 6, height: 6, borderRadius: 3 },
  score: { fontSize: font.micro, fontWeight: '800' },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: hs(20),
    marginTop: vs(14),
    paddingTop: vs(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: hs(6) },
  legendSwatch: { width: hs(16), height: vs(8), borderRadius: ms(4) },
  legendText: { fontSize: font.micro, fontWeight: '600' },
});

export default BattleLeaderboardChart;
