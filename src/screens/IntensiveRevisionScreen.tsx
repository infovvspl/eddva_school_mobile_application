import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/Icon';
import { Brand } from '../constants/brand';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { studyPlanService } from '../services/studyplan.service';
import type { RootStackParamList } from '../types/navigation';
import { asArray } from '../utils/apiData';
import { font, hs, ms, spacing, type as t, vs } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'IntensiveRevision'>;

const CONFIDENCE_LEVELS = [
  { label: 'Again', icon: 'redo', color: '#DC2626', description: 'Completely forgot' },
  { label: 'Hard', icon: 'frown', color: '#F97316', description: 'Struggled a lot' },
  { label: 'Good', icon: 'meh', color: '#EAB308', description: 'Got it with effort' },
  { label: 'Easy', icon: 'smile', color: '#16A34A', description: 'Recalled perfectly' },
];

const IntensiveRevisionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ratings, setRatings] = useState<Record<string, string>>({});
  const [flipped, setFlipped] = useState(false);

  const { data, loading } = useApi(
    () => studyPlanService.getSpacedRevision(courseId),
    [courseId],
  );

  const topics: any[] = asArray(data, ['topics', 'items', 'dueTopics']);

  const currentTopic = topics[currentIdx];
  const isLast = currentIdx >= topics.length - 1;

  const startSession = async () => {
    if (!currentTopic) return;
    setStarting(true);
    try {
      const { data: session } = await studyPlanService.startRevisionSession({
        topicId: String(currentTopic.topicId || currentTopic.id),
        accuracy: 0,
        intervalDays: 1,
      });
      const sessionId = String(
        (session as any)?.sessionId ?? (session as any)?.id ?? '',
      );
      if (sessionId) {
        navigation.navigate('ExamEngine', {
          testId: sessionId,
          sessionId,
          topicId: String(currentTopic.topicId || currentTopic.id),
          title: String(currentTopic.topicName || currentTopic.name || 'Intensive Revision'),
          mode: 'mock',
        });
        return;
      }
    } catch {
      // fallback to card-flip mode
    } finally {
      setStarting(false);
    }
    setSessionStarted(true);
    setFlipped(false);
  };

  const rateAndNext = (level: string) => {
    if (currentTopic) {
      setRatings(prev => ({ ...prev, [String(currentTopic.id || currentIdx)]: level }));
    }
    if (isLast) {
      setSessionDone(true);
    } else {
      setCurrentIdx(i => i + 1);
      setFlipped(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={ms(18)} color={c.text} solid />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>Intensive Revision</Text>
        </View>
        <ActivityIndicator color={c.primary} style={{ marginTop: vs(60) }} />
      </View>
    );
  }

  if (sessionDone) {
    const easyCount = Object.values(ratings).filter(r => r === 'Easy').length;
    const goodCount = Object.values(ratings).filter(r => r === 'Good').length;
    return (
      <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={ms(18)} color={c.text} solid />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>Session Complete</Text>
        </View>
        <ScrollView contentContainerStyle={styles.scroll}>
          <LinearGradient colors={[Brand.blue900, Brand.blue700]} style={styles.doneHero}>
            <Icon name="trophy" size={ms(48)} color="#FFD700" solid />
            <Text style={styles.doneTitle}>Revision Complete!</Text>
            <Text style={styles.doneSub}>
              You reviewed {topics.length} topic{topics.length !== 1 ? 's' : ''} this session.
            </Text>
          </LinearGradient>
          <View style={[styles.statsRow, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
            {[
              { label: 'Easy', count: easyCount, color: '#16A34A', icon: 'smile' },
              { label: 'Good', count: goodCount, color: '#EAB308', icon: 'meh' },
              { label: 'Needs Work', count: topics.length - easyCount - goodCount, color: '#DC2626', icon: 'frown' },
            ].map(s => (
              <View key={s.label} style={styles.statBox}>
                <Icon name={s.icon} size={ms(22)} color={s.color} solid />
                <Text style={[styles.statCount, { color: c.text }]}>{s.count}</Text>
                <Text style={[styles.statLabel, { color: c.textMuted }]}>{s.label}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.finishBtn, { backgroundColor: c.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Icon name="check" size={ms(16)} color="#fff" solid />
            <Text style={styles.finishBtnText}>Back to Study Plan</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (topics.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={ms(18)} color={c.text} solid />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>Intensive Revision</Text>
        </View>
        <View style={styles.emptyWrap}>
          <Icon name="check-circle" size={ms(56)} color={c.success} solid />
          <Text style={[styles.emptyTitle, { color: c.text }]}>All caught up!</Text>
          <Text style={[styles.emptySub, { color: c.textMuted }]}>
            No topics are due for intensive revision right now. Keep completing your daily plan to unlock more.
          </Text>
          <TouchableOpacity
            style={[styles.finishBtn, { backgroundColor: c.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.finishBtnText}>Back to Study Plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={ms(18)} color={c.text} solid />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Intensive Revision</Text>
        <Text style={[styles.headerCount, { color: c.textMuted }]}>
          {currentIdx + 1}/{topics.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: c.borderLight }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.round(((currentIdx + 1) / topics.length) * 100)}%`,
              backgroundColor: c.primary,
            },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {!sessionStarted ? (
          /* Landing / intro card */
          <View>
            <LinearGradient colors={[Brand.blue900, Brand.blue700]} style={styles.introHero}>
              <Icon name="fire" size={ms(40)} color="#FCD34D" solid />
              <Text style={styles.introTitle}>Intensive Revision Mode</Text>
              <Text style={styles.introSub}>
                {topics.length} topic{topics.length !== 1 ? 's' : ''} due for deep review.
                Rate your recall after each card to optimise your next session.
              </Text>
            </LinearGradient>

            <View style={[styles.topicList, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
              <Text style={[styles.listTitle, { color: c.text }]}>Today's Topics</Text>
              {topics.slice(0, 5).map((tp, i) => (
                <View key={tp.id ?? i} style={[styles.topicRow, i > 0 && { borderTopColor: c.border, borderTopWidth: 1 }]}>
                  <View style={[styles.topicDot, { backgroundColor: c.primary }]} />
                  <Text style={[styles.topicRowText, { color: c.text }]} numberOfLines={1}>
                    {tp.topicName || tp.name || 'Topic'}
                  </Text>
                </View>
              ))}
              {topics.length > 5 && (
                <Text style={[styles.moreText, { color: c.textMuted }]}>
                  +{topics.length - 5} more topics
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.startBtn, { backgroundColor: c.primary }, starting && { opacity: 0.7 }]}
              onPress={startSession}
              disabled={starting}
            >
              {starting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="play" size={ms(16)} color="#fff" solid />
                  <Text style={styles.startBtnText}>Start Intensive Revision</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* Flashcard mode */
          <View>
            <View style={[styles.flashCard, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
              <View style={styles.flashMeta}>
                <View style={[styles.typeBadge, { backgroundColor: `${c.primary}18` }]}>
                  <Icon name="brain" size={ms(12)} color={c.primary} solid />
                  <Text style={[styles.typeBadgeText, { color: c.primary }]}>RECALL</Text>
                </View>
                <Text style={[styles.subjectLabel, { color: c.textMuted }]}>
                  {currentTopic?.subject || currentTopic?.subjectName || 'Topic'}
                </Text>
              </View>
              <Text style={[styles.flashQuestion, { color: c.text }]}>
                {currentTopic?.topicName || currentTopic?.name || 'Review this topic'}
              </Text>
              {!flipped ? (
                <TouchableOpacity
                  style={[styles.flipBtn, { borderColor: c.primary }]}
                  onPress={() => setFlipped(true)}
                >
                  <Icon name="eye" size={ms(16)} color={c.primary} solid />
                  <Text style={[styles.flipBtnText, { color: c.primary }]}>Reveal Summary</Text>
                </TouchableOpacity>
              ) : (
                <View style={[styles.answerBox, { backgroundColor: `${c.primary}0D`, borderColor: `${c.primary}30` }]}>
                  <Text style={[styles.answerText, { color: c.text }]}>
                    {currentTopic?.summary ||
                      currentTopic?.description ||
                      'Recall everything you know about this topic — formulas, concepts, and key examples.'}
                  </Text>
                </View>
              )}
            </View>

            {flipped && (
              <View>
                <Text style={[styles.rateTitle, { color: c.text }]}>How well did you recall?</Text>
                <View style={styles.rateRow}>
                  {CONFIDENCE_LEVELS.map(lvl => (
                    <TouchableOpacity
                      key={lvl.label}
                      style={[styles.rateBtn, { borderColor: lvl.color, backgroundColor: `${lvl.color}12` }]}
                      onPress={() => rateAndNext(lvl.label)}
                    >
                      <Icon name={lvl.icon} size={ms(20)} color={lvl.color} solid />
                      <Text style={[styles.rateBtnLabel, { color: lvl.color }]}>{lvl.label}</Text>
                      <Text style={[styles.rateBtnDesc, { color: c.textMuted }]}>{lvl.description}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    gap: hs(12),
  },
  backBtn: { padding: ms(4) },
  headerTitle: { ...t.subheadBold, flex: 1 },
  headerCount: { ...t.captionBold },
  progressTrack: { height: vs(4) },
  progressFill: { height: vs(4) },
  scroll: { padding: spacing.md, paddingBottom: vs(48) },
  introHero: {
    borderRadius: BorderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: vs(10),
    marginBottom: vs(16),
  },
  introTitle: { fontSize: font.subhead, fontWeight: '900', color: '#fff', textAlign: 'center' },
  introSub: { fontSize: font.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: ms(24) },
  topicList: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(16),
  },
  listTitle: { ...t.bodyBold, marginBottom: vs(10) },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    paddingVertical: vs(10),
  },
  topicDot: { width: ms(8), height: ms(8), borderRadius: ms(4) },
  topicRowText: { ...t.body, flex: 1 },
  moreText: { ...t.caption, marginTop: vs(8) },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(10),
    paddingVertical: vs(16),
    borderRadius: BorderRadius.lg,
  },
  startBtnText: { ...t.bodyBold, color: '#fff' },
  flashCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: vs(16),
  },
  flashMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: vs(16) },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(5),
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(10),
  },
  typeBadgeText: { fontSize: font.tiny, fontWeight: '900', letterSpacing: 0.8 },
  subjectLabel: { ...t.caption },
  flashQuestion: { fontSize: font.subhead, fontWeight: '800', lineHeight: ms(32), marginBottom: vs(20) },
  flipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    paddingVertical: vs(14),
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  flipBtnText: { ...t.bodyBold },
  answerBox: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  answerText: { ...t.body, lineHeight: ms(26) },
  rateTitle: { ...t.bodyBold, marginBottom: vs(12), textAlign: 'center' },
  rateRow: { flexDirection: 'row', gap: hs(8), flexWrap: 'wrap' },
  rateBtn: {
    flex: 1,
    minWidth: hs(72),
    alignItems: 'center',
    gap: vs(6),
    paddingVertical: vs(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  rateBtnLabel: { fontSize: font.caption, fontWeight: '800' },
  rateBtnDesc: { fontSize: font.tiny, textAlign: 'center' },
  doneHero: {
    borderRadius: BorderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: vs(10),
    marginBottom: vs(20),
  },
  doneTitle: { fontSize: font.title, fontWeight: '900', color: '#fff' },
  doneSub: { fontSize: font.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  statsRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(20),
  },
  statBox: { flex: 1, alignItems: 'center', gap: vs(6) },
  statCount: { fontSize: font.subhead, fontWeight: '900' },
  statLabel: { ...t.caption },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(10),
    paddingVertical: vs(16),
    borderRadius: BorderRadius.lg,
  },
  finishBtnText: { ...t.bodyBold, color: '#fff' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: vs(12) },
  emptyTitle: { fontSize: font.subhead, fontWeight: '800' },
  emptySub: { ...t.body, textAlign: 'center', lineHeight: ms(26) },
});

export default IntensiveRevisionScreen;
