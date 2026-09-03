import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { ArrowLeft, Clock, CheckCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

const { width } = Dimensions.get('window');

export function ExamScreen({ onNavigate, routeParams }: any) {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const startExam = async () => {
      const assessmentId = routeParams?.assessmentId;
      if (!assessmentId) {
        setLoadError('No assessment selected. Please open a test from the Assessments list.');
        setLoading(false);
        return;
      }
      try {
        const data = await schoolApi.startAssessmentAttempt(assessmentId);
        // Every answer/submit call is scoped to the session opened here.
        setSessionId(data?.sessionId ?? data?.data?.sessionId ?? null);
        let apiQuestions = [];
        if (data && Array.isArray(data.questions)) apiQuestions = data.questions;
        else if (data && data.data && Array.isArray(data.data.questions)) apiQuestions = data.data.questions;
        
        if (apiQuestions.length > 0) {
          setQuestions(apiQuestions);
        } else {
          setLoadError('This assessment has no questions yet.');
        }
        
        if (data && data.durationSeconds) setTimeLeft(data.durationSeconds);
        else if (data && data.data && data.data.durationSeconds) setTimeLeft(data.data.durationSeconds);
      } catch (err: any) {
        console.error("Failed to start assessment:", err);
        setLoadError(err?.message || 'Could not load this assessment. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    startExam();
  }, [routeParams?.assessmentId]);

  // Timer logic
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Options come back either as plain strings or as { id, text } objects; the
  // API wants the option's id, so fall back to the index when there isn't one.
  const optionId = (opt: any, idx: number): string =>
    (opt && typeof opt === 'object' ? opt.id ?? opt.value : undefined) ?? String(idx);

  const handleSelectOption = (question: any, optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [question.id]: optionIdx }));

    const assessmentId = routeParams?.assessmentId;
    if (!assessmentId || !sessionId) return;
    schoolApi
      .saveAssessmentAnswer(assessmentId, {
        sessionId,
        questionId: question.id,
        selectedOptionIds: [optionId(question?.options?.[optionIdx], optionIdx)],
      })
      .catch(console.error);
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    Alert.alert(
      "Submit Exam",
      "Are you sure you want to submit your exam? You cannot change answers after submitting.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Submit", 
          onPress: async () => {
            setIsSubmitted(true);
            const assessmentId = routeParams?.assessmentId;
            try {
              await schoolApi.submitAssessment(assessmentId, sessionId ? { sessionId } : {});
            } catch (err: any) {
              console.error("Submit error", err);
              setIsSubmitted(false);
              Alert.alert("Submission failed", err?.message || 'Your answers were not saved. Please try again.');
              return;
            }
            Alert.alert("Success", "Your exam has been submitted successfully!", [
              { text: "OK", onPress: () => onNavigate('assessments') }
            ]);
          }
        }
      ]
    );
  };

  const currentQ = questions[currentIdx];
  const isAnswered = (idx: number) => answers[questions[idx].id] !== undefined;

  // Without questions there is nothing to sit: say why rather than showing a
  // placeholder paper that cannot be submitted anywhere.
  if (loading || loadError || questions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => onNavigate('assessments')} style={styles.iconBtn}>
              <ArrowLeft size={ms(24)} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {routeParams?.title || 'Assessment'}
            </Text>
          </View>
        </View>
        <View style={styles.stateBox}>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <>
              <Text style={[styles.stateText, { color: theme.subtext }]}>
                {loadError || 'This assessment has no questions yet.'}
              </Text>
              <TouchableOpacity
                style={[styles.stateBtn, { backgroundColor: theme.primary }]}
                onPress={() => onNavigate('assessments')}
              >
                <Text style={styles.stateBtnText}>Back to Assessments</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => onNavigate('assessments')} style={styles.iconBtn}>
            <ArrowLeft size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {routeParams?.title || 'Assessment'}
          </Text>
        </View>
        <View style={[styles.timerBadge, timeLeft < 300 && { backgroundColor: '#FEE2E2' }]}>
          <Clock size={ms(16)} color={timeLeft < 300 ? '#EF4444' : theme.primary} />
          <Text style={[styles.timerText, { color: timeLeft < 300 ? '#EF4444' : theme.primary }]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {/* Main Question Area */}
        <ScrollView style={styles.questionContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.qHeader}>
            <Text style={[styles.qNumber, { color: theme.primary }]}>Question {currentIdx + 1} of {questions.length}</Text>
            <View style={[styles.statusBadge, isAnswered(currentIdx) ? { backgroundColor: '#D1FAE5' } : { backgroundColor: theme.border }]}>
              <Text style={[styles.statusText, isAnswered(currentIdx) ? { color: '#059669' } : { color: theme.subtext }]}>
                {isAnswered(currentIdx) ? 'Answered' : 'Unanswered'}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.questionText, { color: theme.text }]}>{currentQ.text}</Text>

          <View style={styles.optionsList}>
            {currentQ?.options?.map((opt: any, idx: number) => {
              const selected = answers[currentQ.id] === idx;
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[
                    styles.optionBtn, 
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    selected && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                  ]}
                  onPress={() => handleSelectOption(currentQ, idx)}
                  activeOpacity={0.7}
                  disabled={isSubmitted}
                >
                  <View style={[styles.radioOuter, { borderColor: selected ? theme.primary : theme.border }]}>
                    {selected && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
                  </View>
                  <Text style={[styles.optionText, { color: theme.text }, selected && { color: theme.primary, fontWeight: '600' }]}>
                    {typeof opt === 'string' ? opt : opt?.text ?? opt?.label ?? ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Question Navigator Drawer (Right Side or Bottom) */}
        <View style={[styles.navigatorBox, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navGrid}>
            {questions.map((q, idx) => {
              const active = currentIdx === idx;
              const answered = answers[q.id] !== undefined;
              return (
                <TouchableOpacity 
                  key={q.id}
                  style={[
                    styles.navBox,
                    { backgroundColor: theme.background, borderColor: theme.border },
                    answered && { backgroundColor: theme.primary, borderColor: theme.primary },
                    active && { borderWidth: 2, borderColor: theme.text }
                  ]}
                  onPress={() => setCurrentIdx(idx)}
                >
                  <Text style={[styles.navText, { color: answered ? '#fff' : theme.text }, active && { fontWeight: 'bold' }]}>
                    {idx + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Footer Controls */}
      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity 
          style={[styles.footerBtn, { borderColor: theme.border }]} 
          onPress={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
        >
          <ChevronLeft size={ms(20)} color={currentIdx === 0 ? theme.border : theme.text} />
          <Text style={[styles.footerBtnText, { color: currentIdx === 0 ? theme.border : theme.text }]}>Previous</Text>
        </TouchableOpacity>

        {currentIdx < questions.length - 1 ? (
          <TouchableOpacity 
            style={[styles.footerBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]} 
            onPress={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
          >
            <Text style={[styles.footerBtnText, { color: '#fff' }]}>Next</Text>
            <ChevronRight size={ms(20)} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.footerBtn, { backgroundColor: '#10B981', borderColor: '#10B981' }]} 
            onPress={handleSubmit}
          >
            <CheckCircle size={ms(20)} color="#fff" style={{ marginRight: hs(8) }} />
            <Text style={[styles.footerBtnText, { color: '#fff' }]}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stateBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ms(24),
  },
  stateText: {
    fontSize: ms(15),
    textAlign: 'center',
    marginBottom: vs(20),
    lineHeight: ms(22),
  },
  stateBtn: {
    paddingHorizontal: hs(24),
    paddingVertical: vs(12),
    borderRadius: ms(12),
  },
  stateBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: ms(14),
  },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBtn: { padding: ms(8), marginRight: hs(8), marginLeft: hs(-8) },
  title: {
    fontSize: ms(18),
    fontWeight: '700',
    flex: 1,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderRadius: ms(16),
  },
  timerText: {
    marginLeft: hs(6),
    fontWeight: '700',
    fontSize: ms(14),
  },
  body: {
    flex: 1,
    flexDirection: 'column',
  },
  questionContainer: {
    flex: 1,
    padding: ms(20),
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  qNumber: {
    fontSize: ms(14),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(12),
  },
  statusText: {
    fontSize: ms(12),
    fontWeight: '600',
  },
  questionText: {
    fontSize: ms(20),
    fontWeight: '600',
    lineHeight: ms(28),
    marginBottom: vs(32),
  },
  optionsList: {
    gap: ms(12),
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ms(16),
    borderRadius: ms(12),
    borderWidth: 1,
  },
  radioOuter: {
    width: hs(20),
    height: vs(20),
    borderRadius: ms(10),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hs(16),
  },
  radioInner: {
    width: hs(10),
    height: vs(10),
    borderRadius: ms(5),
  },
  optionText: {
    fontSize: ms(16),
    flex: 1,
  },
  navigatorBox: {
    paddingVertical: vs(12),
    paddingHorizontal: hs(16),
    borderTopWidth: 1,
  },
  navGrid: {
    gap: ms(8),
    paddingRight: hs(16),
  },
  navBox: {
    width: hs(44),
    height: vs(44),
    borderRadius: ms(8),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: ms(16),
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: ms(16),
    borderTopWidth: 1,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(12),
    paddingHorizontal: hs(24),
    borderRadius: ms(12),
    borderWidth: 1,
    minWidth: hs(120),
  },
  footerBtnText: {
    fontSize: ms(16),
    fontWeight: '600',
  },
});
