import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from '../Icon';
import { useTheme } from '../../context/ThemeContext';
import type { BattleHistoryItem } from '../../utils/battleMappers';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = {
  battles: BattleHistoryItem[];
  loading: boolean;
};

function resultColor(result: string, muted: string): string {
  if (result === 'win') return '#16A34A';
  if (result === 'loss') return '#EF4444';
  return muted;
}

const BattleHistoryPanel: React.FC<Props> = ({ battles, loading }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  const wins = battles.filter(b => b.result === 'win').length;
  const losses = battles.filter(b => b.result === 'loss').length;

  return (
    <View style={styles.wrap}>
      <View style={[styles.summary, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: '#16A34A' }]}>{wins}</Text>
          <Text style={[styles.summaryLbl, { color: c.textMuted }]}>Wins</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: c.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: '#EF4444' }]}>{losses}</Text>
          <Text style={[styles.summaryLbl, { color: c.textMuted }]}>Losses</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: c.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryVal, { color: c.text }]}>{battles.length}</Text>
          <Text style={[styles.summaryLbl, { color: c.textMuted }]}>Total</Text>
        </View>
      </View>

      {loading && battles.length === 0 ? (
        <ActivityIndicator color={c.primary} style={{ marginVertical: vs(24) }} />
      ) : battles.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: c.card, borderColor: c.border }]}>
          <Icon name="swords" size={ms(32)} color={c.border} solid />
          <Text style={[styles.emptyTitle, { color: c.text }]}>No battles yet</Text>
          <Text style={[styles.emptyText, { color: c.textMuted }]}>
            Start a Quick Duel or challenge a friend — your results will show here.
          </Text>
        </View>
      ) : (
        battles.map(b => (
          <View
            key={b.id}
            style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
          >
            <View
              style={[
                styles.resultBadge,
                { backgroundColor: `${resultColor(b.result, c.textMuted)}18` },
              ]}
            >
              <Text
                style={[styles.resultText, { color: resultColor(b.result, c.textMuted) }]}
              >
                {(b.result || 'pending').toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.opponent, { color: c.text }]} numberOfLines={1}>
                vs {b.opponentName}
              </Text>
              <Text style={[styles.meta, { color: c.textMuted }]} numberOfLines={1}>
                {b.myScore} – {b.opponentScore}
                {b.topic ? ` · ${b.topic}` : ''}
              </Text>
            </View>
            {b.xpEarned > 0 ? (
              <View style={styles.xp}>
                <Icon name="star" size={ms(10)} color="#F59E0B" solid />
                <Text style={styles.xpText}>+{b.xpEarned}</Text>
              </View>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: vs(10) },
  summary: {
    flexDirection: 'row',
    borderRadius: ms(16),
    borderWidth: 1,
    paddingVertical: vs(14),
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: font.title, fontWeight: '900' },
  summaryLbl: { fontSize: font.micro, fontWeight: '700', marginTop: vs(2) },
  divider: { width: 1, alignSelf: 'stretch' },
  empty: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: ms(16),
    borderWidth: 1,
    gap: vs(8),
  },
  emptyTitle: { fontSize: font.subhead, fontWeight: '800' },
  emptyText: { fontSize: font.caption, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    padding: spacing.md,
    borderRadius: ms(16),
    borderWidth: 1,
  },
  resultBadge: {
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(8),
  },
  resultText: { fontSize: font.micro, fontWeight: '800' },
  opponent: { fontSize: font.subhead, fontWeight: '700' },
  meta: { fontSize: font.caption, marginTop: vs(2) },
  xp: { flexDirection: 'row', alignItems: 'center', gap: hs(4) },
  xpText: { fontSize: font.caption, fontWeight: '800', color: '#F59E0B' },
});

export default BattleHistoryPanel;
