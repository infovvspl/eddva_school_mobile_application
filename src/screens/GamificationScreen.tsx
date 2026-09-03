import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator,
  TextInput, Alert, Dimensions,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { hs, vs, ms } from '../utils/responsive';
import {
  ArrowLeft, Gamepad2, Wallet, Trophy, Award, ChevronRight, Star, Coins,
  Zap, Compass, Brain, BookOpen, Flame, Lock, Check, History, ArrowUpRight,
} from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { LevelRing } from '../components/LevelRing';

const { width: SCREEN_W } = Dimensions.get('window');
// Two columns inside the 16pt page padding, with a 12pt gutter. Floored: a
// fractional overflow of even half a point makes the pair wrap to one column.
const CARD_W = Math.floor((SCREEN_W - hs(32) - hs(12)) / 2) - 1;
const CARD_H = vs(172);

type Tab = 'arena' | 'wallet' | 'badges' | 'boards';

// 10 coins = ₹1, as stated on the reward wallet.
const COINS_PER_RUPEE = 10;
// Not published by the API; kept here so the curve is visible and adjustable.
const XP_PER_LEVEL = 600;

const RANKS = [
  { at: 0, name: 'Rookie Learner' },
  { at: 3, name: 'Rising Scholar' },
  { at: 5, name: 'Master Scholar' },
  { at: 8, name: 'Grand Scholar' },
  { at: 12, name: 'Legend' },
];

const GAMES = [
  {
    id: 'quiz', tag: 'SPEED RUN', title: 'Quiz Rush', Icon: Zap,
    desc: 'Rapid-fire NCERT questions. Three lives, thirty seconds each, and it only gets harder.',
    from: '#0E7490', to: '#083344', accent: '#22D3EE',
    start: () => schoolApi.startQuizRush(),
    board: () => schoolApi.getQuizRushLeaderboard(),
  },
  {
    id: 'treasure', tag: 'ADVENTURE', title: 'Treasure Hunt', Icon: Compass,
    desc: 'Clear checkpoints, unlock the map and open the chest at the end of the trail.',
    from: '#A16207', to: '#3F2A06', accent: '#FBBF24',
    start: () => schoolApi.getTreasureMaps(),
    board: null,
  },
  {
    id: 'memory', tag: 'BRAIN TRAINING', title: 'Memory Match', Icon: Brain,
    desc: 'Pair up definitions, terms and diagrams in as few turns as you can manage.',
    from: '#3F6212', to: '#1A2E05', accent: '#84CC16',
    start: () => schoolApi.startMemoryMatch(),
    board: () => schoolApi.getMemoryMatchLeaderboard(),
  },
  {
    id: 'word', tag: 'VOCAB PUZZLE', title: 'Word Master', Icon: BookOpen,
    desc: 'Unscramble the letters to match the clue. Academic vocabulary, against the clock.',
    from: '#7E22CE', to: '#2E1065', accent: '#C084FC',
    start: () => schoolApi.startWordMaster(),
    board: () => schoolApi.getWordMasterLeaderboard(),
  },
];

/**
 * Badge catalogue. The API exposes only `unlockedBadges` (names), so tiers and
 * targets live here and progress is measured against real counters.
 */
const BADGES = [
  { id: 'rising', name: 'Rising Star', tier: 'BRONZE', desc: 'Play at least 3 different game types', target: 3, metric: 'games', xp: 100, coins: 15 },
  { id: 'casual', name: 'Casual Gamer', tier: 'BRONZE', desc: 'Play any 3 Arcade games', target: 3, metric: 'plays', xp: 50, coins: 5 },
  { id: 'streak', name: 'Weekly Streak', tier: 'SILVER', desc: 'Keep a 5 day streak', target: 5, metric: 'streak', xp: 350, coins: 50 },
  { id: 'daily', name: 'Daily Player', tier: 'SILVER', desc: 'Play 15 Arcade games', target: 15, metric: 'plays', xp: 200, coins: 30 },
  { id: 'collector', name: 'Master Collector', tier: 'PLATINUM', desc: 'Collect 200 EDDVA Coins', target: 200, metric: 'coins', xp: 800, coins: 150 },
  { id: 'elite', name: 'Elite Gamer', tier: 'GOLD', desc: 'Play 50 Arcade games', target: 50, metric: 'plays', xp: 600, coins: 100 },
  { id: 'hall', name: 'Hall of Fame', tier: 'DIAMOND', desc: 'Play 100 Arcade games', target: 100, metric: 'plays', xp: 1500, coins: 300 },
  { id: 'legend', name: 'Ultimate Legend', tier: 'MYTHIC', desc: 'Earn 5000+ total XP from Arcade games', target: 5000, metric: 'xp', xp: 0, coins: 0 },
];

const TIER_COLOR: Record<string, string> = {
  BRONZE: '#B45309', SILVER: '#94A3B8', GOLD: '#F59E0B',
  PLATINUM: '#22D3EE', DIAMOND: '#60A5FA', MYTHIC: '#C084FC',
};

const CardGradient = ({ from, to, h }: { from: string; to: string; h: number }) => (
  <Svg style={StyleSheet.absoluteFill} width="100%" height={h}>
    <Defs>
      <LinearGradient id={`g${from}`} x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={from} />
        <Stop offset="1" stopColor={to} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height={h} fill={`url(#g${from})`} />
  </Svg>
);

export function GamificationScreen({ onNavigate }: any) {
  const [tab, setTab] = useState<Tab>('arena');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  // Real play counts: the leaderboards are the only place a student's own game
  // sessions are exposed, so they are scanned once and filtered to this student.
  const [myPlays, setMyPlays] = useState(0);
  const [myGameTypes, setMyGameTypes] = useState(0);

  const [boardGame, setBoardGame] = useState('quiz');
  const [board, setBoard] = useState<any[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);

  const [redeem, setRedeem] = useState('10');
  const [upi, setUpi] = useState('');

  useEffect(() => {
    schoolApi
      .getDashboardStats()
      .then((res: any) => setStats(res?.data ?? res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const myId = stats?.student?.id;
    if (!myId) return;
    let cancelled = false;

    Promise.all(
      GAMES.filter(g => g.board).map(async g => {
        try {
          const res: any = await g.board!();
          const list = Array.isArray(res) ? res : (res?.data ?? []);
          return (Array.isArray(list) ? list : []).filter(
            (e: any) => e.studentId === myId,
          ).length;
        } catch {
          return 0;
        }
      }),
    ).then(counts => {
      if (cancelled) return;
      setMyPlays(counts.reduce((a, b) => a + b, 0));
      setMyGameTypes(counts.filter(c => c > 0).length);
    });

    return () => { cancelled = true; };
  }, [stats?.student?.id]);

  useEffect(() => {
    const g = GAMES.find(x => x.id === boardGame);
    if (!g?.board) { setBoard([]); return; }
    setBoardLoading(true);
    g.board()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setBoard(Array.isArray(list) ? list : []);
      })
      .catch(() => setBoard([]))
      .finally(() => setBoardLoading(false));
  }, [boardGame]);

  const xp = Number(stats?.xpTotal) || 0;
  const coins = Number(stats?.eddvaCoins ?? stats?.coins) || 0;
  const streak = Number(stats?.currentStreak) || 0;
  const wallet = coins / COINS_PER_RUPEE;
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const levelPct = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  const rank = [...RANKS].reverse().find(r => level >= r.at)?.name ?? RANKS[0].name;
  const unlocked: string[] = stats?.student?.unlockedBadges ?? [];

  // Progress counters the badge catalogue is measured against.
  const metrics: Record<string, number> = useMemo(
    () => ({ coins, xp, streak, plays: myPlays, games: myGameTypes }),
    [coins, xp, streak, myPlays, myGameTypes],
  );

  const startGame = async (g: (typeof GAMES)[number]) => {
    setStarting(g.id);
    try {
      await g.start();
      Alert.alert(g.title, 'Your session is ready. Gameplay is coming to mobile soon.');
    } catch (e: any) {
      Alert.alert(g.title, e?.message || 'Could not start this game right now.');
    } finally {
      setStarting(null);
    }
  };

  const TABS: { id: Tab; label: string; Icon: any; badge?: string }[] = [
    { id: 'arena', label: 'Arena', Icon: Gamepad2 },
    { id: 'wallet', label: 'Wallet', Icon: Wallet, badge: `₹${Math.floor(wallet)}` },
    { id: 'badges', label: 'Badges', Icon: Award },
    { id: 'boards', label: 'Boards', Icon: Trophy },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={styles.back}>
            <ArrowLeft size={ms(20)} color="#E2E8F0" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>PLAYER HQ</Text>
            <Text style={styles.title}>GAME ARCADE</Text>
          </View>
        </View>
        <Text style={styles.tagline}>
          Play, climb the boards, unlock badges and turn what you learn into reward credits.
        </Text>

        {/* Player summary */}
        <View style={styles.player}>
          {loading ? (
            <ActivityIndicator color="#22D3EE" style={{ paddingVertical: vs(24) }} />
          ) : (
            <>
              <View style={styles.playerTop}>
                <LevelRing level={level} percent={levelPct} size={ms(74)} />
                <View style={{ flex: 1, marginLeft: hs(14) }}>
                  <Text style={styles.rankLabel}>CURRENT RANK</Text>
                  <Text style={styles.rankName} numberOfLines={1}>{rank.toUpperCase()}</Text>
                  <View style={styles.streakRow}>
                    <View style={styles.streakChip}>
                      <Flame size={ms(11)} color="#FB923C" />
                      <Text style={styles.streakText}>{streak} day streak</Text>
                    </View>
                    <Text style={styles.toNext}>
                      {Math.round(levelPct)}% to level {level + 1}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.statRow}>
                {[
                  { Icon: Star, value: xp.toLocaleString(), label: 'XP', color: '#FBBF24' },
                  { Icon: Coins, value: String(coins), label: 'COINS', color: '#C084FC' },
                  { Icon: Wallet, value: `₹${Math.floor(wallet)}`, label: 'WALLET', color: '#4ADE80' },
                ].map(s => (
                  <View key={s.label} style={styles.statBox}>
                    <s.Icon size={ms(13)} color={s.color} />
                    <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabScroll}
          contentContainerStyle={styles.tabRow}
        >
          {TABS.map(t => {
            const on = tab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.tab, on && styles.tabOn]}
                onPress={() => setTab(t.id)}
                activeOpacity={0.85}
              >
                <t.Icon size={ms(13)} color={on ? '#22D3EE' : '#64748B'} />
                <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.label}</Text>
                {!!t.badge && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{t.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {tab === 'arena' && (
          <View style={styles.gameGrid}>
            {GAMES.map(g => (
              <TouchableOpacity
                key={g.id}
                style={styles.gameCard}
                activeOpacity={0.9}
                onPress={() => startGame(g)}
                disabled={starting === g.id}
              >
                <CardGradient from={g.from} to={g.to} h={CARD_H} />
                <View style={styles.gameInner}>
                  <View style={styles.gameTop}>
                    <View style={[styles.gameTag, { borderColor: g.accent }]}>
                      <Text style={[styles.gameTagText, { color: g.accent }]}>{g.tag}</Text>
                    </View>
                    <g.Icon size={ms(20)} color={g.accent} />
                  </View>
                  <Text style={styles.gameTitle} numberOfLines={2}>{g.title.toUpperCase()}</Text>
                  <Text style={styles.gameDesc} numberOfLines={3}>{g.desc}</Text>
                  <View style={styles.gameFoot}>
                    <Text style={[styles.insertCoin, { color: g.accent }]}>
                      {starting === g.id ? 'STARTING…' : 'INSERT COIN'}
                    </Text>
                    <View style={[styles.gameGo, { borderColor: g.accent }]}>
                      {starting === g.id
                        ? <ActivityIndicator size="small" color={g.accent} />
                        : <ChevronRight size={ms(15)} color={g.accent} />}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {tab === 'wallet' && (
          <View style={{ gap: vs(14) }}>
            <View style={styles.panel}>
              <View style={styles.rateChip}>
                <Zap size={ms(11)} color="#4ADE80" />
                <Text style={styles.rateText}>
                  {COINS_PER_RUPEE} COINS = ₹1 REWARD RATE
                </Text>
              </View>
              <Text style={styles.panelTitle}>Reward Wallet</Text>
              <Text style={styles.panelSub}>
                Earn real reward credits for learning activities, games, homework and quizzes.
              </Text>

              <View style={styles.balanceRow}>
                <View style={styles.balanceBox}>
                  <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
                  <Text style={styles.balanceValue}>₹{wallet.toFixed(2)}</Text>
                </View>
                <View style={styles.balanceBox}>
                  <Text style={styles.balanceLabel}>EDDVA COINS</Text>
                  <Text style={[styles.balanceValue, { color: '#FBBF24' }]}>{coins}</Text>
                </View>
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Receive Demo Payout</Text>
              <Text style={styles.panelSub}>Convert your EDDVA Coins to an instant demo payout.</Text>

              <Text style={styles.fieldLabel}>REDEMPTION AMOUNT (₹)</Text>
              <TextInput
                style={styles.input}
                value={redeem}
                onChangeText={setRedeem}
                keyboardType="number-pad"
                placeholderTextColor="#475569"
              />
              <Text style={styles.hint}>
                Requires {(Number(redeem) || 0) * COINS_PER_RUPEE} EDDVA Coins conversion
              </Text>

              <Text style={styles.fieldLabel}>DEMO UPI ID / DETAILS</Text>
              <TextInput
                style={styles.input}
                value={upi}
                onChangeText={setUpi}
                placeholder="student@demo.upi"
                placeholderTextColor="#475569"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={[styles.payBtn, (Number(redeem) || 0) * COINS_PER_RUPEE > coins && styles.payBtnOff]}
                disabled={(Number(redeem) || 0) * COINS_PER_RUPEE > coins}
                onPress={() =>
                  Alert.alert(
                    'Demo payout',
                    'Payout is simulated on the web panel and has no mobile endpoint yet.',
                  )
                }
              >
                <ArrowUpRight size={ms(15)} color="#FFF" />
                <Text style={styles.payBtnText}>Receive Demo Payment (₹{Number(redeem) || 0})</Text>
              </TouchableOpacity>
              {(Number(redeem) || 0) * COINS_PER_RUPEE > coins && (
                <Text style={styles.warn}>
                  You need {(Number(redeem) || 0) * COINS_PER_RUPEE - coins} more coins for this amount.
                </Text>
              )}
            </View>

            <View style={styles.panel}>
              <Text style={styles.panelTitle}>How Coins & Rewards Work</Text>
              {[
                { k: `${COINS_PER_RUPEE} Coins`, v: `Automatically converts into ₹1.00 in your Reward Wallet.`, c: '#FBBF24' },
                { k: 'XP Points', v: 'Track academic progress, level ups, leaderboard standing and badges.', c: '#C084FC' },
                { k: 'Payouts', v: 'Instant demo payout simulation for redemption verification.', c: '#4ADE80' },
              ].map(r => (
                <View key={r.k} style={styles.explainRow}>
                  <View style={[styles.explainKey, { borderColor: r.c }]}>
                    <Text style={[styles.explainKeyText, { color: r.c }]}>{r.k}</Text>
                  </View>
                  <Text style={styles.explainText}>{r.v}</Text>
                </View>
              ))}
            </View>

            <View style={styles.panel}>
              <View style={styles.ledgerHead}>
                <History size={ms(14)} color="#94A3B8" />
                <Text style={styles.panelTitle}>Transaction Ledger</Text>
              </View>
              <Text style={styles.ledgerEmpty}>
                No transaction history yet. Play games and quizzes to earn Coins.
              </Text>
            </View>
          </View>
        )}

        {tab === 'badges' && (
          <View style={styles.panel}>
            <View style={styles.rateChip}>
              <Award size={ms(11)} color="#FBBF24" />
              <Text style={[styles.rateText, { color: '#FBBF24' }]}>
                {unlocked.length} / {BADGES.length} BADGES UNLOCKED
              </Text>
            </View>
            <Text style={styles.panelTitle}>Achievement Showcase</Text>
            <Text style={styles.panelSub}>
              Progress through Bronze → Silver → Gold → Platinum → Diamond → Mythic.
            </Text>

            <View style={{ gap: vs(10), marginTop: vs(12) }}>
              {BADGES.map(b => {
                const have = metrics[b.metric] ?? 0;
                const done = unlocked.includes(b.name) || have >= b.target;
                const pct = Math.min(100, Math.round((have / b.target) * 100));
                const tint = TIER_COLOR[b.tier];
                return (
                  <View key={b.id} style={[styles.badgeCard, done && { borderColor: tint }]}>
                    <View style={styles.badgeTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.badgeName}>{b.name}</Text>
                        <Text style={styles.badgeDesc}>{b.desc}</Text>
                      </View>
                      {done
                        ? <Check size={ms(16)} color={tint} />
                        : <Lock size={ms(14)} color="#475569" />}
                    </View>

                    <View style={styles.badgeMeta}>
                      <View style={[styles.tierChip, { borderColor: tint }]}>
                        <Text style={[styles.tierText, { color: tint }]}>{b.tier}</Text>
                      </View>
                      {!!b.xp && (
                        <Text style={styles.reward}>+{b.xp} XP · +{b.coins} Coins</Text>
                      )}
                      <Text style={styles.badgeCount}>{Math.min(have, b.target)} / {b.target}</Text>
                    </View>

                    <View style={styles.badgeTrack}>
                      <View style={[styles.badgeFill, { width: `${pct}%`, backgroundColor: tint }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {tab === 'boards' && (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Leaderboards</Text>
            <Text style={styles.panelSub}>Climb the ranks across the arcade.</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: vs(12) }}
              contentContainerStyle={{ gap: hs(7) }}
            >
              {GAMES.filter(g => g.board).map(g => {
                const on = boardGame === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.scopeChip, on && { borderColor: g.accent, backgroundColor: 'rgba(255,255,255,0.06)' }]}
                    onPress={() => setBoardGame(g.id)}
                  >
                    <Text style={[styles.scopeText, on && { color: g.accent }]}>{g.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {boardLoading ? (
              <ActivityIndicator color="#22D3EE" style={{ marginTop: vs(30) }} />
            ) : board.length === 0 ? (
              <Text style={styles.ledgerEmpty}>No scores posted for this game yet.</Text>
            ) : (
              <>
                {/* Podium */}
                <View style={styles.podium}>
                  {[1, 0, 2].map(i => {
                    const e = board[i];
                    if (!e) return <View key={i} style={{ flex: 1 }} />;
                    const place = i + 1;
                    const h = place === 1 ? vs(78) : place === 2 ? vs(60) : vs(48);
                    const c = place === 1 ? '#FBBF24' : place === 2 ? '#CBD5E1' : '#B45309';
                    return (
                      <View key={i} style={styles.podiumCol}>
                        <View style={[styles.podiumAvatar, { borderColor: c }]}>
                          <Text style={styles.podiumInitials}>
                            {String(e.name || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                          </Text>
                        </View>
                        <Text style={styles.podiumName} numberOfLines={1}>{e.name}</Text>
                        <Text style={[styles.podiumScore, { color: c }]}>★ {e.score}</Text>
                        <View style={[styles.podiumBar, { height: h, borderColor: c }]}>
                          <Text style={[styles.podiumPlace, { color: c }]}>{place}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>

                {board.slice(3, 12).map((e, i) => (
                  <View key={`${e.studentId}-${i}`} style={styles.boardRow}>
                    <Text style={styles.boardRank}>{e.rank ?? i + 4}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.boardName} numberOfLines={1}>{e.name}</Text>
                      <Text style={styles.boardMeta}>
                        {e.correctAnswers}/{e.totalQuestions} correct
                        {e.maxStreak ? ` · streak ${e.maxStreak}` : ''}
                      </Text>
                    </View>
                    <Text style={styles.boardScore}>{e.score}</Text>
                  </View>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070B18' },
  content: { padding: hs(16), paddingBottom: vs(32) },

  head: { flexDirection: 'row', alignItems: 'center', gap: hs(10) },
  back: { padding: ms(4), marginLeft: -ms(4) },
  kicker: { color: '#F472B6', fontSize: ms(9.5), letterSpacing: 1.4, fontWeight: '700' },
  title: { color: '#FFF', fontSize: ms(26), lineHeight: ms(32), fontWeight: '700', letterSpacing: 0.5 },
  tagline: { color: '#94A3B8', fontSize: ms(12), lineHeight: ms(17), marginTop: vs(4) },

  player: {
    backgroundColor: '#0D1426',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
    borderRadius: ms(18),
    padding: ms(14),
    marginTop: vs(16),
  },
  playerTop: { flexDirection: 'row', alignItems: 'center' },
  rankLabel: { color: '#64748B', fontSize: ms(9), letterSpacing: 1, fontWeight: '700' },
  rankName: { color: '#FFF', fontSize: ms(17), lineHeight: ms(23), fontWeight: '700', marginTop: vs(2) },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: hs(8), marginTop: vs(6), flexWrap: 'wrap' },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: hs(4),
    backgroundColor: 'rgba(251,146,60,0.14)',
    borderRadius: ms(10), paddingHorizontal: hs(7), paddingVertical: vs(3),
  },
  streakText: { color: '#FB923C', fontSize: ms(10.5), fontWeight: '700' },
  toNext: { color: '#64748B', fontSize: ms(10.5) },

  statRow: { flexDirection: 'row', gap: hs(8), marginTop: vs(14) },
  statBox: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(148,163,184,0.14)',
    borderRadius: ms(12), paddingVertical: vs(9),
  },
  statValue: { fontSize: ms(16), lineHeight: ms(22), fontWeight: '700', marginTop: vs(2) },
  statLabel: { color: '#64748B', fontSize: ms(8.5), letterSpacing: 0.8, fontWeight: '700' },

  tabScroll: { flexGrow: 0, marginVertical: vs(16) },
  tabRow: { flexDirection: 'row', gap: hs(8) },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: hs(6),
    paddingHorizontal: hs(13), paddingVertical: vs(8),
    borderRadius: ms(10),
    borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)',
    backgroundColor: '#0D1426',
  },
  tabOn: { borderColor: '#22D3EE', backgroundColor: 'rgba(34,211,238,0.1)' },
  tabText: { color: '#64748B', fontSize: ms(12), lineHeight: ms(17), fontWeight: '700', letterSpacing: 0.4 },
  tabTextOn: { color: '#22D3EE' },
  tabBadge: {
    backgroundColor: 'rgba(74,222,128,0.16)', borderRadius: ms(7),
    paddingHorizontal: hs(5), paddingVertical: vs(1),
  },
  tabBadgeText: { color: '#4ADE80', fontSize: ms(9.5), fontWeight: '700' },

  gameGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(12) },
  gameCard: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: ms(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
  },
  gameInner: { flex: 1, padding: ms(11), justifyContent: 'space-between' },
  gameTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gameTag: { borderWidth: 1, borderRadius: ms(5), paddingHorizontal: hs(5), paddingVertical: vs(2), flexShrink: 1 },
  gameTagText: { fontSize: ms(7.5), letterSpacing: 0.5, fontWeight: '700' },
  gameTitle: { color: '#FFF', fontSize: ms(15), lineHeight: ms(19), fontWeight: '700', marginTop: vs(8) },
  gameDesc: { color: 'rgba(226,232,240,0.8)', fontSize: ms(10.5), lineHeight: ms(14.5), marginTop: vs(4), flex: 1 },
  gameFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: vs(6) },
  insertCoin: { fontSize: ms(9.5), letterSpacing: 0.7, fontWeight: '700' },
  gameGo: {
    width: ms(26), height: ms(26), borderRadius: ms(13),
    borderWidth: 1, justifyContent: 'center', alignItems: 'center',
  },

  panel: {
    backgroundColor: '#0D1426',
    borderWidth: 1, borderColor: 'rgba(148,163,184,0.16)',
    borderRadius: ms(16), padding: ms(14),
  },
  rateChip: {
    flexDirection: 'row', alignItems: 'center', gap: hs(5),
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(74,222,128,0.12)',
    borderRadius: ms(8), paddingHorizontal: hs(8), paddingVertical: vs(3),
    marginBottom: vs(8),
  },
  rateText: { color: '#4ADE80', fontSize: ms(9.5), letterSpacing: 0.6, fontWeight: '700' },
  panelTitle: { color: '#FFF', fontSize: ms(16), lineHeight: ms(22), fontWeight: '700' },
  panelSub: { color: '#94A3B8', fontSize: ms(11.5), lineHeight: ms(16), marginTop: vs(3) },

  balanceRow: { flexDirection: 'row', gap: hs(10), marginTop: vs(14) },
  balanceBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(148,163,184,0.14)',
    borderRadius: ms(12), padding: ms(11),
  },
  balanceLabel: { color: '#64748B', fontSize: ms(8.5), letterSpacing: 0.7, fontWeight: '700' },
  balanceValue: { color: '#4ADE80', fontSize: ms(19), lineHeight: ms(25), fontWeight: '700', marginTop: vs(3) },

  fieldLabel: { color: '#64748B', fontSize: ms(9.5), letterSpacing: 0.8, fontWeight: '700', marginTop: vs(13) },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)',
    borderRadius: ms(10), paddingHorizontal: hs(12), paddingVertical: vs(10),
    color: '#E2E8F0', fontSize: ms(13.5), marginTop: vs(6),
  },
  hint: { color: '#64748B', fontSize: ms(10.5), marginTop: vs(5) },
  warn: { color: '#FCA5A5', fontSize: ms(11), marginTop: vs(7), textAlign: 'center' },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: hs(7),
    backgroundColor: '#059669', borderRadius: ms(11),
    paddingVertical: vs(12), marginTop: vs(16),
  },
  payBtnOff: { opacity: 0.4 },
  payBtnText: { color: '#FFF', fontSize: ms(13.5), fontWeight: '700' },

  explainRow: { flexDirection: 'row', gap: hs(9), alignItems: 'flex-start', marginTop: vs(11) },
  explainKey: { borderWidth: 1, borderRadius: ms(7), paddingHorizontal: hs(7), paddingVertical: vs(3) },
  explainKeyText: { fontSize: ms(10), fontWeight: '700' },
  explainText: { flex: 1, color: '#94A3B8', fontSize: ms(11.5), lineHeight: ms(16) },

  ledgerHead: { flexDirection: 'row', alignItems: 'center', gap: hs(7) },
  ledgerEmpty: { color: '#64748B', fontSize: ms(11.5), textAlign: 'center', paddingVertical: vs(22) },

  badgeCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(148,163,184,0.14)',
    borderRadius: ms(12), padding: ms(11),
  },
  badgeTop: { flexDirection: 'row', alignItems: 'flex-start', gap: hs(8) },
  badgeName: { color: '#F1F5F9', fontSize: ms(13.5), lineHeight: ms(19), fontWeight: '700' },
  badgeDesc: { color: '#94A3B8', fontSize: ms(11), lineHeight: ms(15), marginTop: vs(2) },
  badgeMeta: { flexDirection: 'row', alignItems: 'center', gap: hs(8), marginTop: vs(9), flexWrap: 'wrap' },
  tierChip: { borderWidth: 1, borderRadius: ms(6), paddingHorizontal: hs(6), paddingVertical: vs(2) },
  tierText: { fontSize: ms(9), fontWeight: '700', letterSpacing: 0.6 },
  reward: { color: '#64748B', fontSize: ms(10) },
  badgeCount: { color: '#94A3B8', fontSize: ms(10.5), fontWeight: '700', marginLeft: 'auto' },
  badgeTrack: {
    height: vs(4), borderRadius: ms(2), overflow: 'hidden',
    backgroundColor: 'rgba(148,163,184,0.16)', marginTop: vs(8),
  },
  badgeFill: { height: '100%', borderRadius: ms(2) },

  scopeChip: {
    borderWidth: 1, borderColor: 'rgba(148,163,184,0.2)',
    borderRadius: ms(16), paddingHorizontal: hs(12), paddingVertical: vs(6),
  },
  scopeText: { color: '#64748B', fontSize: ms(11.5), lineHeight: ms(16), fontWeight: '700' },

  podium: { flexDirection: 'row', alignItems: 'flex-end', gap: hs(8), marginTop: vs(18) },
  podiumCol: { flex: 1, alignItems: 'center' },
  podiumAvatar: {
    width: ms(42), height: ms(42), borderRadius: ms(21), borderWidth: 2,
    backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center',
  },
  podiumInitials: { color: '#E2E8F0', fontSize: ms(13), fontWeight: '700' },
  podiumName: { color: '#CBD5E1', fontSize: ms(10.5), fontWeight: '600', marginTop: vs(5) },
  podiumScore: { fontSize: ms(11), fontWeight: '700', marginTop: vs(1) },
  podiumBar: {
    width: '100%', borderWidth: 1, borderBottomWidth: 0,
    borderTopLeftRadius: ms(8), borderTopRightRadius: ms(8),
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center', alignItems: 'center', marginTop: vs(6),
  },
  podiumPlace: { fontSize: ms(20), fontWeight: '700' },

  boardRow: {
    flexDirection: 'row', alignItems: 'center', gap: hs(10),
    borderTopWidth: 1, borderTopColor: 'rgba(148,163,184,0.12)',
    paddingVertical: vs(10), marginTop: vs(2),
  },
  boardRank: { color: '#64748B', fontSize: ms(12), fontWeight: '700', width: hs(20) },
  boardName: { color: '#E2E8F0', fontSize: ms(12.5), lineHeight: ms(17), fontWeight: '600' },
  boardMeta: { color: '#64748B', fontSize: ms(10.5), lineHeight: ms(15) },
  boardScore: { color: '#22D3EE', fontSize: ms(14), fontWeight: '700' },
});
