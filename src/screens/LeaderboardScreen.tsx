import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/Icon';
import PWScreenHeader from '../components/PWScreenHeader';
import LeaderboardLockedScreen from './leaderboard/LeaderboardLockedScreen';
import { Brand } from '../constants/brand';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { leaderboardService } from '../services/leaderboard.service';
import type { LeaderboardEntry } from '../mocks/mockLeaderboardService';
import { asArray } from '../utils/apiData';
import { font, hs, ms, spacing, vs } from '../utils/responsive';

type Props = { navigation: any };
type Tab = 'group' | 'mock';

const PODIUM_ORDER = [1, 0, 2];
const PODIUM_HEIGHTS = [vs(72), vs(96), vs(56)];
const MEDALS = ['#FFD700', '#C0C0C0', '#CD7F32'];

const LeaderboardScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const [tab, setTab] = useState<Tab>('group');

  const meQuery = useApi(() => leaderboardService.getMe(), []);
  const groupQuery = useApi(() => leaderboardService.getGroup(), []);
  const mockQuery = useApi(() => leaderboardService.getMockRank('JEE'), []);

  const me = meQuery.data as any;
  const isUnlocked = me?.leaderboardUnlocked === true;
  const groupData = groupQuery.data as any;
  const mockData = mockQuery.data as any;

  const entries: LeaderboardEntry[] = useMemo(() => {
    const list =
      tab === 'group'
        ? (asArray(groupData, ['entries']) as LeaderboardEntry[])
        : (asArray(mockData, ['entries', 'leaderboard']) as LeaderboardEntry[]);
    return [...list].sort((a, b) => a.rank - b.rank);
  }, [tab, groupData, mockData]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const loading = meQuery.loading || groupQuery.loading;
  const onRefresh = () => {
    meQuery.refetch();
    groupQuery.refetch();
    mockQuery.refetch();
  };

  if (meQuery.loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top, backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  if (!isUnlocked) {
    return (
      <LeaderboardLockedScreen
        gems={me?.gems ?? 0}
        onBack={() => navigation.goBack()}
        onInfo={() => navigation.navigate('LeaderboardInfo')}
        onEarnXp={() => {
          const parent = navigation.getParent?.();
          parent?.navigate('Learn');
        }}
      />
    );
  }

  const zoneBadge = (zone: LeaderboardEntry['zone']) => {
    if (zone === 'promotion') return { label: 'PROMOTION ZONE', bg: '#ECFDF5', color: '#059669' };
    if (zone === 'danger') return { label: 'DEMOTION RISK', bg: '#FEF2F2', color: '#DC2626' };
    return { label: 'SAFE ZONE', bg: '#EFF6FF', color: '#2563EB' };
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <PWScreenHeader
        title="Group Leaderboard"
        subtitle={`Season ${me?.season ?? 4} · ${groupData?.cycleLabel ?? '14-DAY CYCLE'}`}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('LeaderboardInfo')}
            style={[styles.infoBtn, { backgroundColor: c.chipBg }]}
            activeOpacity={0.85}
          >
            <Icon name="info-circle" size={ms(18)} color={c.primary} solid />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={c.primary} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + vs(32) }}
      >
        <View style={styles.statGrid}>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={styles.statCardLabel}>CYCLE XP</Text>
            <Text style={[styles.statCardValue, { color: '#1D4ED8' }]}>
              {(me?.cycleXp ?? 0).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFFBEB' }]}>
            <Text style={styles.statCardLabel}>GROUP RANK</Text>
            <Text style={[styles.statCardValue, { color: '#D97706' }]}>#{me?.rank ?? '—'}</Text>
            <Text style={styles.statCardSub}>in your group</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#ECFDF5' }]}>
            <Text style={styles.statCardLabel}>LEVEL</Text>
            <Text style={[styles.statCardValue, { color: '#059669' }]}>{me?.level ?? 1}</Text>
            <Text style={styles.statCardSub}>{me?.levelProgress ?? 0}% to next</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F5F3FF' }]}>
            <Text style={styles.statCardLabel}>RESET IN</Text>
            <Text style={[styles.statCardValue, { color: '#7C3AED' }]}>
              {me?.daysLeft ?? groupData?.daysLeft ?? 9}d
            </Text>
            <Text style={styles.statCardSub}>cycle ends soon</Text>
          </View>
        </View>

        {me?.promotionXpAway != null ? (
          <View style={[styles.promoCard, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
            <Icon name="arrow-up" size={ms(14)} color="#EA580C" solid />
            <View style={styles.flex}>
              <Text style={styles.promoTitle}>{me.promotionXpAway} XP away</Text>
              <Text style={styles.promoSub}>Keep going — promotion is close!</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.sideStats}>
          <View style={[styles.miniStat, { backgroundColor: c.card, borderColor: c.border }]}>
            <Icon name="fire" size={ms(14)} color="#F59E0B" solid />
            <Text style={[styles.miniVal, { color: c.text }]}>{me?.streak ?? 0}</Text>
            <Text style={[styles.miniLbl, { color: c.textMuted }]}>DAY STREAK</Text>
          </View>
          <View style={[styles.miniStat, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Icon name="level-up-alt" size={ms(14)} color="#059669" solid />
            <Text style={[styles.miniVal, { color: '#059669' }]}>PROMOTION</Text>
            <Text style={[styles.miniLbl, { color: '#059669' }]}>ZONE</Text>
          </View>
        </View>

        <View style={[styles.tabRow, { backgroundColor: c.chipBg }]}>
          {([
            ['group', 'GROUP RANK'],
            ['mock', 'MOCK TEST RANK'],
          ] as [Tab, string][]).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.tabBtn, tab === key && { backgroundColor: c.primary }]}
              onPress={() => setTab(key)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: tab === key ? '#fff' : c.textMuted },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && entries.length === 0 ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: vs(40) }} />
        ) : entries.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="trophy" size={ms(40)} color={c.textMuted} solid />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No rankings yet</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              Enroll in a course and earn XP to join the leaderboard
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.podium}>
              {PODIUM_ORDER.map((slot, visualIndex) => {
                const entry = top3[slot];
                if (!entry) return <View key={slot} style={styles.podiumSlot} />;
                const isMe = entry.isMe;
                return (
                  <View key={entry.id} style={[styles.podiumSlot, visualIndex === 1 && styles.podiumCenter]}>
                    {visualIndex === 1 ? (
                      <Icon name="crown" size={ms(18)} color="#FFD700" solid style={styles.crown} />
                    ) : null}
                    <View
                      style={[
                        styles.podiumAvatar,
                        { height: PODIUM_HEIGHTS[visualIndex], backgroundColor: isMe ? c.primary : '#94A3B8' },
                      ]}
                    >
                      <Text style={styles.podiumInitial}>{entry.avatarInitial}</Text>
                    </View>
                    <View style={[styles.medal, { backgroundColor: MEDALS[visualIndex] }]}>
                      <Text style={styles.medalText}>{entry.rank}</Text>
                    </View>
                    <Text style={[styles.podiumName, { color: c.text }]} numberOfLines={1}>
                      {isMe ? 'You' : entry.name.split(' ')[0]}
                    </Text>
                    <Text style={[styles.podiumXp, { color: c.textMuted }]}>
                      {entry.xp.toLocaleString()} {tab === 'mock' ? '%' : 'XP'}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.tableHead}>
              <Text style={[styles.th, { color: c.textMuted, width: hs(32) }]}>#</Text>
              <Text style={[styles.th, { color: c.textMuted, flex: 1 }]}>Student</Text>
              <Text style={[styles.th, { color: c.textMuted }]}>Zone</Text>
            </View>

            {rest.map(entry => {
              const zone = zoneBadge(entry.zone);
              const isMe = entry.isMe;
              return (
                <View
                  key={entry.id}
                  style={[
                    styles.row,
                    { backgroundColor: c.card, borderColor: c.border },
                    isMe && { borderColor: c.primary, borderWidth: 2, backgroundColor: '#EFF6FF' },
                    Shadow.soft,
                  ]}
                >
                  <Text style={[styles.rank, { color: c.textMuted }]}>{entry.rank}</Text>
                  <View style={[styles.rowAvatar, { backgroundColor: isMe ? c.primary : '#CBD5E1' }]}>
                    <Text style={styles.rowInitial}>{entry.avatarInitial}</Text>
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.nameRow}>
                      <Text style={[styles.rowName, { color: c.text }]} numberOfLines={1}>
                        {entry.name}
                      </Text>
                      {isMe ? (
                        <View style={[styles.youBadge, { backgroundColor: c.primary }]}>
                          <Text style={styles.youText}>YOU</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.rowXp, { color: c.textMuted }]}>
                      {entry.xp.toLocaleString()} {tab === 'mock' ? '% score' : 'XP'}
                    </Text>
                  </View>
                  <View style={[styles.zonePill, { backgroundColor: zone.bg }]}>
                    <Text style={[styles.zoneText, { color: zone.color }]}>{zone.label}</Text>
                  </View>
                </View>
              );
            })}

          </>
        )}

        <View style={[styles.levelCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.levelTitle, { color: c.text }]}>Level {me?.level ?? 2} progress</Text>
          <View style={[styles.levelTrack, { backgroundColor: c.borderLight }]}>
            <LinearGradient
              colors={[...Brand.gradient]}
              style={[styles.levelFill, { width: `${Math.min(100, me?.levelProgress ?? 100)}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={[styles.levelMeta, { color: c.textMuted }]}>
            {me?.levelXp ?? me?.cycleXp ?? 0} / {me?.levelTarget ?? 1200} XP · {me?.daysLeft ?? 9}d left in cycle
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center' },
  infoBtn: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(10),
    paddingHorizontal: spacing.md,
    marginBottom: vs(12),
  },
  statCard: {
    width: '47%',
    padding: ms(12),
    borderRadius: BorderRadius.lg,
  },
  statCardLabel: { fontSize: font.micro, fontWeight: '800', color: '#64748B', letterSpacing: 0.3 },
  statCardValue: { fontSize: font.subhead, fontWeight: '900', marginTop: vs(4) },
  statCardSub: { fontSize: font.micro, fontWeight: '600', color: '#64748B', marginTop: vs(2) },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    marginHorizontal: spacing.md,
    marginBottom: vs(12),
    padding: ms(14),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  promoTitle: { fontSize: font.caption, fontWeight: '800', color: '#C2410C' },
  promoSub: { fontSize: font.tiny, color: '#EA580C', marginTop: vs(2) },
  flex: { flex: 1, minWidth: 0 },
  sideStats: {
    flexDirection: 'row',
    gap: hs(10),
    paddingHorizontal: spacing.md,
    marginBottom: vs(14),
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
    padding: ms(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: vs(4),
  },
  miniVal: { fontSize: font.caption, fontWeight: '900' },
  miniLbl: { fontSize: font.micro, fontWeight: '700' },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: vs(16),
    borderRadius: ms(12),
    padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: vs(10), alignItems: 'center', borderRadius: ms(10) },
  tabBtnText: { fontSize: font.tiny, fontWeight: '800' },
  empty: { alignItems: 'center', padding: spacing.lg, gap: vs(8) },
  emptyTitle: { fontSize: font.subhead, fontWeight: '800' },
  emptySub: { fontSize: font.caption, textAlign: 'center' },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: vs(20),
    gap: hs(12),
  },
  podiumSlot: { flex: 1, alignItems: 'center', maxWidth: hs(110) },
  podiumCenter: { marginBottom: vs(12) },
  crown: { marginBottom: vs(4) },
  podiumAvatar: {
    width: hs(56),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: vs(8),
  },
  podiumInitial: { fontSize: font.title, fontWeight: '900', color: '#fff' },
  medal: {
    width: hs(24),
    height: hs(24),
    borderRadius: hs(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(-12),
    marginBottom: vs(6),
  },
  medalText: { fontSize: font.tiny, fontWeight: '900', color: '#fff' },
  podiumName: { fontSize: font.tiny, fontWeight: '800', textAlign: 'center' },
  podiumXp: { fontSize: font.micro, fontWeight: '600', marginTop: vs(2) },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: vs(8),
    gap: hs(10),
  },
  th: { fontSize: font.micro, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: vs(8),
    padding: ms(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: hs(10),
  },
  rank: { width: hs(24), fontSize: font.caption, fontWeight: '800', textAlign: 'center' },
  rowAvatar: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInitial: { color: '#fff', fontWeight: '800', fontSize: font.caption },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: hs(6) },
  rowName: { fontSize: font.caption, fontWeight: '700', flexShrink: 1 },
  youBadge: { paddingHorizontal: hs(6), paddingVertical: vs(2), borderRadius: ms(6) },
  youText: { fontSize: font.micro, fontWeight: '900', color: '#fff' },
  rowXp: { fontSize: font.tiny, marginTop: vs(2) },
  zonePill: { paddingHorizontal: hs(8), paddingVertical: vs(4), borderRadius: ms(8) },
  zoneText: { fontSize: font.micro, fontWeight: '800' },
  levelCard: {
    marginHorizontal: spacing.md,
    marginTop: vs(16),
    padding: ms(14),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  levelTitle: { fontSize: font.caption, fontWeight: '800', marginBottom: vs(10) },
  levelTrack: { height: vs(8), borderRadius: ms(4), overflow: 'hidden' },
  levelFill: { height: '100%', borderRadius: ms(4) },
  levelMeta: { fontSize: font.tiny, marginTop: vs(8), fontWeight: '600' },
});

export default LeaderboardScreen;
