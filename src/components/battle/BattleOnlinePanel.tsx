import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../Icon';
import BattleTierBadge from './BattleTierBadge';
import { useTheme } from '../../context/ThemeContext';
import type { BattleLeaderboardEntry } from '../../utils/battleMappers';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = {
  leaderboard: BattleLeaderboardEntry[];
  loading: boolean;
  userId?: string;
  onFindMatch: () => void;
  onFriendRoom: () => void;
};

const BattleOnlinePanel: React.FC<Props> = ({
  leaderboard,
  loading,
  userId,
  onFindMatch,
  onFriendRoom,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={styles.wrap}>
      <View style={[styles.info, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
        <Icon name="info-circle" size={ms(16)} color={c.primary} solid />
        <Text style={[styles.infoText, { color: c.textSecondary }]}>
          <Text style={{ fontWeight: '800' }}>Who is online?</Text>
          {' '}The app shows real names only when someone joins{' '}
          <Text style={{ fontWeight: '700' }}>your battle room</Text> (Quick Duel or Friend code).
          There is no global “all online players” list from the server yet.
        </Text>
      </View>

      <Text style={[styles.section, { color: c.text }]}>Where you see live players</Text>

      <View style={[styles.step, { backgroundColor: c.card, borderColor: c.border }]}>
        <Icon name="bolt" size={ms(18)} color={c.primary} solid />
        <View style={{ flex: 1 }}>
          <Text style={[styles.stepTitle, { color: c.text }]}>1v1 Quick Duel</Text>
          <Text style={[styles.stepSub, { color: c.textMuted }]}>
            Tap Find Match — when an opponent joins, their name appears under “In this room”.
          </Text>
        </View>
      </View>

      <View style={[styles.step, { backgroundColor: c.card, borderColor: c.border }]}>
        <Icon name="users" size={ms(18)} color={c.primary} solid />
        <View style={{ flex: 1 }}>
          <Text style={[styles.stepTitle, { color: c.text }]}>Challenge Friend</Text>
          <Text style={[styles.stepSub, { color: c.textMuted }]}>
            After you share a room code, you’ll see their name when they join.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.ctaRow} onPress={onFindMatch} activeOpacity={0.9}>
        <View style={[styles.cta, { backgroundColor: c.primary }]}>
          <Icon name="play" size={ms(14)} color="#fff" solid />
          <Text style={styles.ctaText}>Find Match Now</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={onFriendRoom} activeOpacity={0.88}>
        <Text style={[styles.link, { color: c.primary }]}>Or create a friend room →</Text>
      </TouchableOpacity>

      <Text style={[styles.section, { color: c.text, marginTop: vs(16) }]}>
        Top ranked battlers
      </Text>
      <Text style={[styles.sectionSub, { color: c.textMuted }]}>
        Leaderboard players — not a live online list
      </Text>

      {loading && leaderboard.length === 0 ? (
        <Text style={[styles.sectionSub, { color: c.textMuted }]}>Loading…</Text>
      ) : (
        leaderboard.slice(0, 8).map(entry => {
          const isMe = entry.studentId === userId;
          return (
            <View
              key={entry.studentId || entry.rank}
              style={[styles.lbRow, { backgroundColor: c.card, borderColor: c.border }]}
            >
              <Text style={[styles.rank, { color: c.textMuted }]}>#{entry.rank}</Text>
              <Text style={[styles.lbName, { color: c.text }]} numberOfLines={1}>
                {isMe ? 'You' : entry.name}
              </Text>
              <BattleTierBadge tier={entry.tier} size="sm" showLabel={false} />
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: vs(10) },
  info: {
    flexDirection: 'row',
    gap: hs(10),
    padding: spacing.md,
    borderRadius: ms(14),
    borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: font.caption, lineHeight: vs(18) },
  section: { fontSize: font.caption, fontWeight: '800', marginTop: vs(4) },
  sectionSub: { fontSize: font.micro, marginBottom: vs(6) },
  step: {
    flexDirection: 'row',
    gap: hs(12),
    padding: spacing.md,
    borderRadius: ms(14),
    borderWidth: 1,
  },
  stepTitle: { fontSize: font.caption, fontWeight: '800' },
  stepSub: { fontSize: font.micro, marginTop: vs(4), lineHeight: vs(16) },
  ctaRow: { marginTop: vs(4) },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    paddingVertical: vs(14),
    borderRadius: ms(14),
  },
  ctaText: { color: '#fff', fontSize: font.caption, fontWeight: '800' },
  link: { textAlign: 'center', fontSize: font.caption, fontWeight: '700' },
  lbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    padding: spacing.md,
    borderRadius: ms(12),
    borderWidth: 1,
  },
  rank: { fontSize: font.caption, fontWeight: '800', width: hs(28) },
  lbName: { flex: 1, fontSize: font.caption, fontWeight: '600' },
});

export default BattleOnlinePanel;
