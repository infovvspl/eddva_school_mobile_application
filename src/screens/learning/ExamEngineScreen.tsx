import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  AppState,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import EDDVAScreenHeader from '../../components/EDDVAScreenHeader';
import RichText from '../../components/learning/RichText';
import { assessmentService } from '../../services/assessment.service';
import { mapSessionQuestions, type ExamQuestion } from '../../utils/assessmentMappers';
import { font, hs, ms, spacing, useScreenLayout, vs } from '../../utils/responsive';
import { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'ExamEngine'>;

const MAX_CHEAT_WARNINGS = 3;

const fmt = (s: number) => {
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
};

const ExamEngineScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { isNarrow, isShort } = useScreenLayout();
  const { sessionId: routeSessionId, title: routeTitle, topicId, mode, testId } = route.params;
  const [sessionId, setSessionId] = useState(routeSessionId || '');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(!!routeSessionId || !!topicId);
  const [submitting, setSubmitting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [remaining, setRemaining] = useState(90 * 60);
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const title = routeTitle || 'Practice Test';
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (routeSessionId) {
          const { data } = await assessmentService.getSession(routeSessionId);
          if (!mounted) return;
          setSessionId(routeSessionId);
          let mapped = mapSessionQuestions(data);
          if (!mapped.length && mode === 'mock' && testId) {
            try {
              const { data: testDetail } = await assessmentService.getMockTest(testId);
              mapped = mapSessionQuestions(testDetail);
            } catch {
              /* ignore */
            }
          }
          if (!mapped.length) {
            Alert.alert(
              'No questions',
              'This test has no questions loaded yet. Try again later or pick another test.',
              [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
            return;
          }
          setQuestions(mapped);
          const mins = Number((data as Record<string, unknown>)?.durationMinutes ?? 90);
          setRemaining(Math.max(60, mins * 60));
        } else if (topicId && mode === 'pyq') {
          const { data } = await assessmentService.startPyqSession(topicId);
          if (!mounted) return;
          const sid = String(
            (data as Record<string, unknown>)?.sessionId ||
              (data as Record<string, unknown>)?.id ||
              '',
          );
          setSessionId(sid);
          const mapped = mapSessionQuestions(data);
          if (!mapped.length) {
            Alert.alert(
              'No PYQ questions',
              'Could not load questions for this topic.',
              [{ text: 'OK', onPress: () => navigation.goBack() }],
            );
            return;
          }
          setQuestions(mapped);
          setRemaining(45 * 60);
        }
      } catch (err: unknown) {
        if (!mounted) return;
        const msg =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response
            ?.data?.message ||
          (err as { message?: string })?.message ||
          'Could not load test';
        Alert.alert('Load failed', msg, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [routeSessionId, topicId, mode, testId, navigation]);

  const attempted = useMemo(() => Object.keys(answers).length, [answers]);
  const q = questions[current] || questions[0];

  useEffect(() => {
    if (loading) return;
    const timer = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          void finishTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading]);

  const persistAnswer = async (questionId: string, optionIndex: number) => {
    if (!sessionId) return;
    try {
      await assessmentService.saveAnswer(sessionId, {
        questionId,
        selectedIndex: optionIndex,
        selectedOption: q?.options?.[optionIndex],
      });
    } catch {
      /* offline tolerant */
    }
  };

  const finishTest = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      if (sessionId) {
        await assessmentService.submitSession(sessionId);
        const { data: result } = await assessmentService.getSessionResult(sessionId);
        const score = (result as any)?.score ?? (result as any)?.percent;
        Alert.alert(
          auto ? 'Time over' : 'Test submitted',
          score != null ? `Your score: ${score}%` : 'Test submitted successfully.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
        );
      } else {
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert('Submit failed', err?.message || 'Could not submit test');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const onBack = () => {
      Alert.alert('Exit test?', 'Submit and leave this test?', [
        { text: 'Continue', style: 'cancel' },
        { text: 'Submit', style: 'destructive', onPress: () => finishTest() },
      ]);
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [sessionId, submitting]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      const wasActive = appStateRef.current === 'active';
      appStateRef.current = nextState;
      if (wasActive && nextState !== 'active') {
        setCheatWarnings(prev => {
          const next = prev + 1;
          if (next >= MAX_CHEAT_WARNINGS) {
            void finishTest(true);
          } else {
            Alert.alert(
              'Warning',
              `Do not leave exam screen.\nWarning ${next}/${MAX_CHEAT_WARNINGS}`,
            );
          }
          return next;
        });
      }
    });
    return () => sub.remove();
  }, [sessionId]);

  const goNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      Alert.alert('Submit test?', 'Review complete. Submit your answers?', [
        { text: 'Review', style: 'cancel' },
        { text: 'Submit', onPress: () => finishTest() },
      ]);
    }
  };

  const goPrev = () => setCurrent(c => Math.max(0, c - 1));

  if (loading) {
    return (
      <View style={[styles.wrap, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color="#3B82F6" size="large" />
        <Text style={styles.loadingText}>Loading test…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <EDDVAScreenHeader
        title={title}
        subtitle={`Q ${current + 1} / ${questions.length}`}
        onBack={() => {
          Alert.alert('Exit test?', 'Submit and leave this test?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Submit', style: 'destructive', onPress: () => finishTest() },
          ]);
        }}
      />
      <View style={[styles.timer, isNarrow && styles.timerNarrow]}>
        <Text style={styles.timerText}>{fmt(remaining)}</Text>
        <Text style={styles.warn} numberOfLines={1}>
          Warnings {cheatWarnings}/{MAX_CHEAT_WARNINGS}
        </Text>
        <TouchableOpacity onPress={() => setPaletteOpen(p => !p)}>
          <Text style={styles.paletteBtn}>Palette</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ruleStrip}>
        <Text style={styles.ruleText}>Real Test Mode · Don't switch apps · No cheating</Text>
      </View>

      {paletteOpen ? (
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          style={[styles.paletteScroll, isShort && styles.paletteScrollShort]}
          contentContainerStyle={styles.palette}
        >
          {questions.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.dot,
                isNarrow && styles.dotNarrow,
                current === i && styles.dotOn,
                answers[item.id] != null && styles.dotDone,
                marked[item.id] && styles.dotMark,
              ]}
              onPress={() => setCurrent(i)}
            >
              <Text style={styles.dotText}>{i + 1}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      <ScrollView
        style={styles.questionScroll}
        contentContainerStyle={[
          styles.qBody,
          { paddingBottom: isShort ? vs(10) : spacing.lg },
        ]}
      >
        <RichText textStyle={styles.q}>{q?.text || ''}</RichText>
        {q?.options?.map((opt, i) => (
          <TouchableOpacity
            key={`${q.id}-${opt}`}
            style={[styles.opt, answers[q.id] === i && styles.optSelected]}
            activeOpacity={0.88}
            onPress={() => {
              setAnswers(prev => ({ ...prev, [q.id]: i }));
              void persistAnswer(q.id, i);
            }}
          >
            <RichText textStyle={styles.optText}>{opt}</RichText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.bottomRow, isNarrow && styles.bottomRowNarrow]}>
        <TouchableOpacity
          style={styles.mark}
          onPress={() => setMarked(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
        >
          <Text style={styles.markText}>{marked[q.id] ? 'Unmark' : 'Mark for Review'}</Text>
        </TouchableOpacity>
        <Text style={styles.progressText} numberOfLines={1}>
          Attempted {attempted}/{questions.length}
        </Text>
      </View>

      <View style={[styles.navRow, { paddingBottom: insets.bottom + vs(8) }]}>
        <TouchableOpacity style={styles.prev} onPress={goPrev} disabled={current === 0}>
          <Text style={[styles.prevText, current === 0 && { opacity: 0.4 }]}>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.next}
          onPress={goNext}
          disabled={submitting}
        >
          <Text style={styles.nextText}>
            {current === questions.length - 1 ? 'Submit Test' : 'Save & Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0F172A' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#94A3B8', marginTop: vs(12), fontWeight: '600' },
  timer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(8),
    alignItems: 'center',
    gap: hs(8),
  },
  timerNarrow: { paddingHorizontal: spacing.md },
  timerText: { color: '#F59E0B', fontWeight: '800', fontSize: font.subhead },
  warn: { color: '#FCA5A5', fontWeight: '700', fontSize: font.tiny, flexShrink: 1 },
  paletteBtn: { color: '#00a6ff', fontWeight: '700', fontSize: font.caption },
  ruleStrip: { paddingHorizontal: spacing.lg, paddingBottom: vs(8) },
  ruleText: { color: '#F8FAFC', fontSize: font.micro, fontWeight: '700', letterSpacing: 0.4 },
  paletteScroll: {
    maxHeight: vs(112),
  },
  paletteScrollShort: {
    maxHeight: vs(78),
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(8),
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(8),
  },
  dot: {
    width: hs(30),
    height: hs(30),
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotNarrow: {
    width: hs(28),
    height: hs(28),
  },
  dotOn: { backgroundColor: '#0066cc' },
  dotDone: { borderWidth: 1.5, borderColor: '#22C55E' },
  dotMark: { borderWidth: 1.5, borderColor: '#F59E0B' },
  dotText: { color: '#fff', fontSize: font.micro, fontWeight: '800' },
  questionScroll: { flex: 1 },
  qBody: { flexGrow: 1, padding: spacing.lg },
  q: {
    color: '#F8FAFC',
    fontSize: font.subhead,
    fontWeight: '800',
    marginBottom: vs(16),
    lineHeight: 24,
  },
  opt: {
    padding: spacing.md,
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  optSelected: { borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.15)' },
  optText: { color: '#E2E8F0', fontWeight: '600' },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(10),
    gap: hs(10),
  },
  bottomRowNarrow: { paddingHorizontal: spacing.md },
  mark: {
    paddingVertical: vs(8),
    paddingHorizontal: hs(10),
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  markText: { color: '#F59E0B', fontSize: font.caption, fontWeight: '700' },
  progressText: { color: '#94A3B8', fontSize: font.caption, fontWeight: '700', flexShrink: 1 },
  navRow: {
    flexDirection: 'row',
    gap: hs(10),
    marginHorizontal: spacing.lg,
    marginTop: vs(4),
  },
  prev: {
    flex: 1,
    backgroundColor: '#334155',
    padding: spacing.md,
    borderRadius: ms(14),
    alignItems: 'center',
  },
  prevText: { color: '#fff', fontWeight: '700' },
  next: {
    flex: 1,
    backgroundColor: '#0066cc',
    padding: spacing.md,
    borderRadius: ms(14),
    alignItems: 'center',
  },
  nextText: { color: '#fff', fontWeight: '800' },
});

export default ExamEngineScreen;
