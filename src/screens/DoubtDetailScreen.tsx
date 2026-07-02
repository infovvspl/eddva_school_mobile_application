import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from '../components/Icon';
import MarkdownRenderer from '../components/learning/MarkdownRenderer';
import RichText from '../components/learning/RichText';
import { shouldUseKatex } from '../utils/renderMathHtml';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { doubtService } from '../services/doubt.service';
import type { RootStackParamList } from '../types/navigation';
import { normalizeDoubt, unwrapDoubtPayload } from '../utils/doubtMappers';
import { font, hs, ms, spacing, vs } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'DoubtDetail'>;

const DoubtDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const { doubt: initialDoubt, initialMode } = route.params;
  const [doubt, setDoubt] = useState(initialDoubt);
  const [mode, setMode] = useState<'brief' | 'detailed'>(initialMode || 'brief');
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [sendingToTeacher, setSendingToTeacher] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingDetail(true);
      try {
        const { data } = await doubtService.getById(initialDoubt.id);
        const raw = unwrapDoubtPayload(data);
        if (!cancelled && raw) {
          const full = normalizeDoubt(raw);
          setDoubt(prev => ({ ...prev, ...full }));
          if (!initialMode) {
            if (full.aiAnswerBrief?.trim()) setMode('brief');
            else if (full.aiAnswerDetailed?.trim()) setMode('detailed');
          }
        }
      } catch {
        /* keep list payload */
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialDoubt.id, initialMode]);

  const briefText = doubt.aiAnswerBrief?.trim() || '';
  const detailedText = doubt.aiAnswerDetailed?.trim() || '';
  const hasBrief = Boolean(briefText);
  const hasDetailed = Boolean(detailedText);
  const hasDistinctAnswers = hasBrief && hasDetailed && briefText !== detailedText;
  const hasAiAnswer = hasBrief || hasDetailed;

  const answerText = useMemo(() => {
    if (mode === 'brief') {
      return briefText || detailedText;
    }
    return detailedText || briefText;
  }, [mode, briefText, detailedText]);

  const hasTeacherAnswer = Boolean(doubt.teacherResponse?.trim());
  const waitingForTeacher =
    doubt.channel === 'teacher' && (doubt.status === 'queued' || doubt.status === 'waiting');
  const canEscalateToTeacher =
    !hasTeacherAnswer && !waitingForTeacher && doubt.status !== 'resolved';

  const submitHelpful = async (helpful: boolean) => {
    try {
      await doubtService.markHelpful(doubt.id, helpful);
      if (!helpful) {
        await sendToTeacher('AI answer was not helpful');
        return;
      }
      setDoubt(prev => ({ ...prev, helpfulRating: helpful }));
      Alert.alert('Thanks', 'Your feedback is saved.');
    } catch {
      Alert.alert('Error', 'Could not save feedback right now.');
    }
  };

  const sendToTeacher = async (reason?: string) => {
    setSendingToTeacher(true);
    try {
      await doubtService.reopen(doubt.id, reason || 'Student requested teacher review');
      setDoubt(prev => ({
        ...prev,
        status: 'queued',
        channel: 'teacher',
        answeredBy: 'Teacher',
      }));
      Alert.alert(
        'Sent to teacher',
        'Your doubt has been forwarded to faculty. You will see their response here.',
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not send to teacher');
    } finally {
      setSendingToTeacher(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { borderColor: c.border, backgroundColor: c.card }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={ms(14)} color={c.text} solid />
        </TouchableOpacity>
        <Text style={[styles.title, { color: c.text }]}>Doubt Explanation</Text>
        <View style={styles.headerGap} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, vs(28)) },
        ]}
      >
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
          <Text style={[styles.blockLabel, { color: c.textMuted }]}>YOUR DOUBT</Text>
          <RichText textStyle={[styles.question, { color: c.text }]}>
            {doubt.userQuestion || doubt.question}
          </RichText>
        </View>

        {hasAiAnswer || doubt.status === 'ai_resolved' ? (
          <View style={[styles.card, styles.aiCard]}>
            <View style={styles.aiHead}>
              <Text style={styles.aiLabel}>AI ANSWER</Text>
              {hasDistinctAnswers ? (
                <View style={styles.modeToggle}>
                  <TouchableOpacity
                    style={[styles.modeBtn, mode === 'brief' && styles.modeBtnOn]}
                    onPress={() => setMode('brief')}
                    disabled={!hasBrief && mode !== 'brief'}
                  >
                    <Text style={[styles.modeText, mode === 'brief' && styles.modeTextOn]}>
                      Brief
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeBtn, mode === 'detailed' && styles.modeBtnOn]}
                    onPress={() => setMode('detailed')}
                    disabled={!hasDetailed && mode !== 'detailed'}
                  >
                    <Text style={[styles.modeText, mode === 'detailed' && styles.modeTextOn]}>
                      Detailed
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.modeHint}>Full explanation</Text>
              )}
            </View>

            {loadingDetail ? (
              <ActivityIndicator color="#2563EB" style={{ marginVertical: vs(12) }} />
            ) : answerText ? (
              <MarkdownRenderer
                content={answerText}
                paragraphStyle={styles.answerParagraph}
                enableKatex={shouldUseKatex(answerText)}
              />
            ) : (
              <Text style={styles.answerEmpty}>
                {mode === 'brief'
                  ? 'Brief answer is not available yet. Try Detailed or pull to refresh from the list.'
                  : 'Detailed answer is not available yet.'}
              </Text>
            )}
          </View>
        ) : waitingForTeacher ? (
          <View style={[styles.card, styles.teacherCard]}>
            <Text style={styles.teacherLabel}>TEACHER QUEUE</Text>
            <Text style={[styles.waiting, { color: c.text }]}>
              Your doubt was sent directly to the teacher. Response will appear here soon.
            </Text>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.waiting, { color: c.textMuted }]}>
              Waiting for AI or teacher response…
            </Text>
          </View>
        )}

        {canEscalateToTeacher ? (
          <TouchableOpacity
            style={[styles.escalateBtn, sendingToTeacher && { opacity: 0.6 }]}
            onPress={() => sendToTeacher()}
            disabled={sendingToTeacher}
          >
            {sendingToTeacher ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="user-graduate" size={ms(12)} color="#fff" solid />
                <Text style={styles.escalateText}>Send to teacher</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {hasTeacherAnswer ? (
          <View style={[styles.card, styles.teacherCard]}>
            <Text style={styles.teacherLabel}>TEACHER RESPONSE</Text>
            <MarkdownRenderer
              content={doubt.teacherResponse || ''}
              enableKatex={shouldUseKatex(doubt.teacherResponse || '')}
            />
          </View>
        ) : null}

        {hasAiAnswer && doubt.helpfulRating == null ? (
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.feedbackQ, { color: c.text }]}>Was this explanation helpful?</Text>
            <View style={styles.feedbackRow}>
              <TouchableOpacity style={[styles.feedbackBtn, styles.feedbackYes]} onPress={() => submitHelpful(true)}>
                <Icon name="thumbs-up" size={ms(12)} color="#059669" solid />
                <Text style={styles.feedbackYesText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.feedbackBtn, styles.feedbackNo]} onPress={() => submitHelpful(false)}>
                <Icon name="thumbs-down" size={ms(12)} color="#DC2626" solid />
                <Text style={styles.feedbackNoText}>Not Helpful</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: vs(12),
  },
  backBtn: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: font.subhead, fontWeight: '800' },
  headerGap: { width: ms(36) },
  content: { paddingHorizontal: spacing.md, gap: vs(10) },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: ms(12),
  },
  blockLabel: { fontSize: font.micro, fontWeight: '800', marginBottom: vs(6) },
  question: { fontSize: font.caption, lineHeight: ms(21), fontWeight: '700' },
  aiCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  aiHead: {
    marginBottom: vs(10),
    gap: vs(8),
  },
  aiLabel: { fontSize: font.micro, fontWeight: '900', color: '#1D4ED8' },
  modeHint: {
    fontSize: font.micro,
    fontWeight: '700',
    color: '#64748B',
    alignSelf: 'flex-start',
  },
  modeToggle: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: ms(12),
    padding: 2,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  modeBtn: { paddingHorizontal: hs(12), paddingVertical: vs(6), borderRadius: ms(10) },
  modeBtnOn: { backgroundColor: '#2563EB' },
  modeText: { fontSize: font.caption, fontWeight: '700', color: '#64748B' },
  modeTextOn: { color: '#fff' },
  answerParagraph: {
    fontSize: font.tiny,
    lineHeight: vs(20),
    color: '#1E3A8A',
  },
  answerEmpty: {
    fontSize: font.caption,
    color: '#64748B',
    fontStyle: 'italic',
    lineHeight: vs(20),
  },
  waiting: { fontSize: font.caption, fontStyle: 'italic' },
  teacherCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  teacherLabel: {
    fontSize: font.micro,
    fontWeight: '800',
    color: '#C2410C',
    marginBottom: vs(6),
  },
  feedbackQ: { fontSize: font.caption, fontWeight: '700', marginBottom: vs(10) },
  feedbackRow: { flexDirection: 'row', gap: hs(8) },
  feedbackBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(6),
    paddingVertical: vs(11),
    borderRadius: BorderRadius.md,
  },
  feedbackYes: { backgroundColor: '#ECFDF5' },
  feedbackNo: { backgroundColor: '#FEF2F2' },
  feedbackYesText: { color: '#059669', fontWeight: '800', fontSize: font.caption },
  feedbackNoText: { color: '#DC2626', fontWeight: '800', fontSize: font.caption },
  escalateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    backgroundColor: '#EA580C',
    paddingVertical: vs(12),
    borderRadius: BorderRadius.lg,
    marginBottom: vs(4),
  },
  escalateText: { color: '#fff', fontWeight: '800', fontSize: font.caption },
});

export default DoubtDetailScreen;
