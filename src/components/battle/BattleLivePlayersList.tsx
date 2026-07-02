import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from '../Icon';
import BattleTierBadge from './BattleTierBadge';
import { Brand } from '../../constants/brand';
import { Shadow } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import type { BattleLeaderboardEntry } from '../../utils/battleMappers';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

export type LivePlayer = BattleLeaderboardEntry & { isOnline?: boolean };

type Props = {
  players: LivePlayer[];
  userId?: string;
  loading?: boolean;
  challengingId?: string | null;
  onChallenge: (player: LivePlayer) => void;
  /** `ranked` = battle leaderboard (no fake online). `live` = real presence when API exists. */
  variant?: 'ranked' | 'live';
};

const BattleLivePlayersList: React.FC<Props> = ({
  players,
  userId,
  loading,
  challengingId,
  onChallenge,
  variant = 'ranked',
}) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter(p => p.name.toLowerCase().includes(q));
  }, [players, query]);

  const showLive = variant === 'live';
  const onlineCount = showLive ? players.filter(p => p.isOnline === true).length : 0;

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: c.text }]}>
          {showLive ? 'Live players' : 'Challenge players'}
        </Text>
        {showLive && onlineCount > 0 ? (
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineBadgeText}>{onlineCount} online</Text>
          </View>
        ) : !showLive ? (
          <Text style={[styles.rankHint, { color: c.textMuted }]}>Battle XP ranks</Text>
        ) : null}
      </View>

      <View style={[styles.search, { backgroundColor: c.background, borderColor: c.border }]}>
        <Icon name="search" size={ms(14)} color={c.textMuted} solid />
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder="Search by name…"
          placeholderTextColor={c.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {loading && players.length === 0 ? (
        <ActivityIndicator color={c.primary} style={{ marginVertical: vs(20) }} />
      ) : filtered.length === 0 ? (
        <Text style={[styles.empty, { color: c.textMuted }]}>
          {query
            ? 'No players match your search.'
            : 'No ranked players yet. Finish a battle or pull to refresh.'}
        </Text>
      ) : (
        filtered.map(player => {
          const isMe = player.studentId === userId;
          const busy = challengingId === player.studentId;
          return (
            <View
              key={player.studentId}
              style={[styles.row, { borderColor: c.border }]}
            >
              <View style={[styles.avatar, { backgroundColor: `${c.primary}18` }]}>
                <Text style={[styles.initial, { color: c.primary }]}>
                  {(player.name || '?')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.meta}>
                <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
                  {player.name}
                </Text>
                <View style={styles.badges}>
                  <BattleTierBadge tier={player.tier} size="sm" />
                  <Text style={[styles.xp, { color: c.textMuted }]}>XP {player.score}</Text>
                  {showLive && player.isOnline ? (
                    <View style={styles.liveChip}>
                      <View style={styles.liveDotSm} />
                      <Text style={styles.liveText}>Online</Text>
                    </View>
                  ) : null}
                  {!showLive && player.rank > 0 ? (
                    <Text style={[styles.rankLbl, { color: c.textMuted }]}>#{player.rank}</Text>
                  ) : null}
                </View>
              </View>
              {isMe ? (
                <Text style={[styles.youLbl, { color: c.textMuted }]}>You</Text>
              ) : (
                <TouchableOpacity
                  style={[styles.challengeBtn, busy && { opacity: 0.6 }]}
                  onPress={() => onChallenge(player)}
                  disabled={busy || !!challengingId}
                  activeOpacity={0.88}
                >
                  {busy ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.challengeText}>Challenge</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: ms(20),
    borderWidth: 1,
    padding: spacing.md,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  title: { fontSize: font.subhead, fontWeight: '800' },
  rankHint: { fontSize: font.micro, fontWeight: '700' },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    backgroundColor: '#ECFDF5',
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(999),
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  onlineBadgeText: { fontSize: font.micro, fontWeight: '800', color: '#15803D' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    borderWidth: 1,
    borderRadius: ms(14),
    paddingHorizontal: hs(12),
    marginBottom: vs(12),
  },
  searchInput: { flex: 1, fontSize: font.body, paddingVertical: vs(10) },
  empty: { fontSize: font.caption, textAlign: 'center', paddingVertical: vs(16) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    paddingVertical: vs(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: hs(44),
    height: hs(44),
    borderRadius: hs(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontSize: font.subhead, fontWeight: '800' },
  meta: { flex: 1, minWidth: 0 },
  name: { fontSize: font.caption, fontWeight: '700', marginBottom: vs(6) },
  badges: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: hs(6) },
  xp: { fontSize: font.micro, fontWeight: '700' },
  rankLbl: { fontSize: font.micro, fontWeight: '800' },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    backgroundColor: '#ECFDF5',
    paddingHorizontal: hs(6),
    paddingVertical: vs(2),
    borderRadius: ms(8),
  },
  liveDotSm: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#22C55E' },
  liveText: { fontSize: font.micro, fontWeight: '700', color: '#15803D' },
  challengeBtn: {
    backgroundColor: Brand.blue700,
    paddingHorizontal: hs(14),
    paddingVertical: vs(10),
    borderRadius: ms(12),
    minWidth: hs(88),
    alignItems: 'center',
  },
  challengeText: { color: '#fff', fontSize: font.micro, fontWeight: '800' },
  youLbl: { fontSize: font.micro, fontWeight: '700' },
});

export default BattleLivePlayersList;
