import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../components/Icon';
import EDDVAScreenHeader from '../../components/EDDVAScreenHeader';
import PrimaryButton from '../../components/PrimaryButton';
import RichText from '../../components/learning/RichText';
import { Brand } from '../../constants/brand';
import { BorderRadius, Shadow } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { battleService } from '../../services/battle.service';
import { useBattleRoom } from '../../hooks/useBattleRoom';
import { mapBattleQuestions, type BattleQuestion } from '../../utils/battleMappers';
import { BattleStackParamList } from '../../types/navigation';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<BattleStackParamList, 'BattleLive'>;

const BattleLiveScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const c = theme.colors;
  const {
    roomCode,
    battleId,
    opponent: routeOpponent = 'Opponent',
    botMode = false,
    subjectId,
    topicId,
  } = route.params;

  const room = useBattleRoom(battleId, 2500, user?.id);
  const opponent =
    room?.opponentName && room.opponentName !== 'Searching…'
      ? room.opponentName
      : routeOpponent;

  const [questions, setQuestions] = useState<BattleQuestion[]>([]);
  const [loadingQs, setLoadingQs] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [myScore, setMyScore] = useState(room?.myScore ?? 0);
  const [oppScore, setOppScore] = useState(room?.opponentScore ?? 0);
  const roundSecs = room?.secondsPerRound ?? 30;
  const [time, setTime] = useState(roundSecs);
  const [pick, setPick] = useState<number | null>(null);
  const [qIndex, setQIndex] = useState(0);

  useEffect(() => {
    if (room) {
      if (room.myScore > 0) setMyScore(room.myScore);
      if (room.opponentScore > 0) setOppScore(room.opponentScore);
      if (room.finished && room.eloDelta != null) {
        navigation.replace('BattleResults', {
          won: room.won ?? room.myScore >= room.opponentScore,
          myScore: room.myScore,
          oppScore: room.opponentScore,
          eloDelta: room.eloDelta,
          roomCode,
          battleId,
        });
      }
    }
  }, [room, navigation, roomCode, battleId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadError(null);
      try {
        let scope: 'subject' | 'chapter' | 'topic' = topicId
          ? 'topic'
          : subjectId
            ? 'subject'
            : 'subject';
        let scopeId = topicId || subjectId || '';

        if (!scopeId) {
          const { data: daily } = await battleService.getDaily();
          const d = daily as Record<string, unknown>;
          scopeId = String(d.topicId ?? d.subjectId ?? d.chapterId ?? '');
          if (d.topicId) scope = 'topic';
          else if (d.chapterId) scope = 'chapter';
        }

        if (scopeId) {
          const { data } = await battleService.getBotQuestions({
            scope,
            scopeId,
            count: room?.totalRounds ?? 5,
            difficulty: 'medium',
          });
          const mapped = mapBattleQuestions(data);
          if (mounted && mapped.length) {
            setQuestions(mapped);
            return;
          }
        }
        if (mounted) {
          setLoadError('Battle questions are not available from the server yet.');
        }
      } catch {
        if (mounted) {
          setLoadError('Could not load battle questions. Try again later.');
        }
      } finally {
        if (mounted) setLoadingQs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [subjectId, topicId, room?.totalRounds]);

  const totalQ = questions.length;
  const q = questions[qIndex];

  useEffect(() => {
    if (time <= 0 || !q) return;
    const iv = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(iv);
  }, [time, qIndex, q]);

  useEffect(() => {
    if (!botMode || time > 0) return;
    setOppScore(s => s + 10);
  }, [botMode, time]);

  const finish = (newMy: number, newOpp: number) => {
    navigation.replace('BattleResults', {
      won: newMy > newOpp,
      myScore: newMy,
      oppScore: newOpp,
      eloDelta: newMy > newOpp ? 18 : newMy === newOpp ? 0 : -12,
      roomCode,
      battleId,
    });
  };

  const submit = () => {
    if (pick == null || !q) return;
    const correct = pick === q.answerIndex;
    const newMy = myScore + (correct ? 40 : 0);
    const newOpp = botMode
      ? oppScore + (Math.random() > 0.4 ? 20 : 0)
      : room?.opponentScore ?? oppScore;

    if (qIndex + 1 >= totalQ) {
      finish(newMy, newOpp);
      return;
    }
    setMyScore(newMy);
    setOppScore(newOpp);
    setQIndex(i => i + 1);
    setPick(null);
    setTime(roundSecs);
  };

  useEffect(() => {
    setTime(roundSecs);
  }, [roundSecs, qIndex]);

  if (loadingQs) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, backgroundColor: c.background }]}>
        <EDDVAScreenHeader title="Battle" subtitle={roomCode ? `Room ${roomCode}` : undefined} onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[styles.muted, { color: c.textMuted }]}>Loading questions…</Text>
        </View>
      </View>
    );
  }

  if (loadError || !q || totalQ === 0) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, backgroundColor: c.background }]}>
        <EDDVAScreenHeader title="Battle" onBack={() => navigation.goBack()} />
        <View style={[styles.errorCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Icon name="exclamation-circle" size={ms(32)} color={c.primary} solid />
          <Text style={[styles.errorTitle, { color: c.text }]}>Cannot start battle</Text>
          <Text style={[styles.muted, { color: c.textMuted }]}>
            {loadError || 'No questions returned for this battle.'}
          </Text>
          <PrimaryButton label="Back to Arena" onPress={() => navigation.navigate('BattleLobby')} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <LinearGradient colors={['#DBEAFE', c.background]} style={styles.headerFade} />
      <EDDVAScreenHeader
        title="Live battle"
        subtitle={roomCode ? `Room ${roomCode}` : undefined}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.scoreCard, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreLbl, { color: c.textMuted }]}>You</Text>
              <Text style={[styles.scoreVal, { color: c.text }]}>{myScore}</Text>
            </View>
            <View style={[styles.timerWrap, { backgroundColor: `${Brand.blue700}15` }]}>
              <Text style={[styles.timer, { color: Brand.blue700 }]}>{time}s</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={[styles.scoreLbl, { color: c.textMuted }]} numberOfLines={1}>
                {opponent}
              </Text>
              <Text style={[styles.scoreVal, { color: c.text }]}>{oppScore}</Text>
            </View>
          </View>
          <View style={[styles.bars, { backgroundColor: c.borderLight }]}>
            <View style={[styles.barYou, { flex: Math.max(myScore, 1) }]} />
            <View style={[styles.barOpp, { flex: Math.max(oppScore, 1) }]} />
          </View>
          {battleId ? (
            <View style={styles.liveRow}>
              <Icon name="circle" size={6} color="#22C55E" solid />
              <Text style={[styles.liveTag, { color: c.textMuted }]}>Live match</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.qCard, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
          <Text style={[styles.qLabel, { color: c.primary }]}>
            Question {qIndex + 1}/{totalQ}
            {botMode ? ' · Practice' : ''}
          </Text>
          <RichText textStyle={[styles.q, { color: c.text }]}>{q.text}</RichText>
          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={`${q.id}-${i}`}
              style={[
                styles.opt,
                { borderColor: c.border, backgroundColor: c.background },
                pick === i && {
                  borderColor: c.primary,
                  backgroundColor: `${c.primary}12`,
                },
              ]}
              onPress={() => setPick(i)}
              activeOpacity={0.88}
            >
              <RichText
                textStyle={[
                  styles.optText,
                  { color: c.text },
                  pick === i && { color: c.primary, fontWeight: '800' },
                ]}
              >
                {opt}
              </RichText>
            </TouchableOpacity>
          ))}
        </View>

        <PrimaryButton
          label="Lock answer"
          onPress={submit}
          disabled={pick == null}
          style={{ marginTop: vs(4) }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: vs(120),
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: vs(12) },
  muted: { fontSize: font.caption, textAlign: 'center' },
  errorCard: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: vs(12),
  },
  errorTitle: { fontSize: font.subhead, fontWeight: '800' },
  scroll: { padding: spacing.md, paddingBottom: vs(32) },
  scoreCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(12),
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreBox: { alignItems: 'center', flex: 1 },
  scoreLbl: { fontSize: font.tiny, fontWeight: '700' },
  scoreVal: { fontSize: font.title, fontWeight: '900' },
  timerWrap: {
    paddingHorizontal: hs(14),
    paddingVertical: vs(8),
    borderRadius: ms(12),
  },
  timer: { fontSize: font.subhead, fontWeight: '900' },
  bars: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: vs(12),
  },
  barYou: { backgroundColor: Brand.blue700 },
  barOpp: { backgroundColor: '#F97316' },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    marginTop: vs(10),
  },
  liveTag: { fontSize: font.micro, fontWeight: '600' },
  qCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
  },
  qLabel: { fontSize: font.caption, fontWeight: '800', marginBottom: vs(10) },
  q: { fontSize: font.subhead, fontWeight: '700', marginBottom: vs(14), lineHeight: ms(22) },
  opt: {
    padding: spacing.md,
    borderRadius: ms(14),
    borderWidth: 1,
    marginBottom: vs(8),
  },
  optText: { fontSize: font.body, fontWeight: '600' },
});

export default BattleLiveScreen;
