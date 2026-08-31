import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Dimensions, Alert } from 'react-native';
import { ArrowLeft, Clock, CheckCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

const { width } = Dimensions.get('window');

const MOCK_QUESTIONS = [
  { id: 1, text: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"] },
  { id: 2, text: "Which element has the chemical symbol 'O'?", options: ["Gold", "Oxygen", "Osmium", "Oganesson"] },
  { id: 3, text: "Solve for x: 2x + 5 = 15", options: ["5", "10", "2", "20"] },
  { id: 4, text: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"] },
  { id: 5, text: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"] },
  { id: 6, text: "What is the square root of 144?", options: ["10", "12", "14", "16"] },
  { id: 7, text: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"] },
  { id: 8, text: "In what year did World War II end?", options: ["1941", "1943", "1945", "1947"] },
  { id: 9, text: "What is the chemical formula for water?", options: ["CO2", "H2O", "O2", "NaCl"] },
  { id: 10, text: "Who painted the Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"] },
];

export function ExamScreen({ onNavigate, routeParams }: any) {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>(MOCK_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const startExam = async () => {
      const assessmentId = routeParams?.assessmentId;
      if (!assessmentId) {
        setLoading(false);
        return;
      }
      try {
        const data = await schoolApi.startAssessmentAttempt(assessmentId);
        let apiQuestions = [];
        if (data && Array.isArray(data.questions)) apiQuestions = data.questions;
        else if (data && data.data && Array.isArray(data.data.questions)) apiQuestions = data.data.questions;
        
        if (apiQuestions.length > 0) {
          setQuestions(apiQuestions);
        }
        
        if (data && data.durationSeconds) setTimeLeft(data.durationSeconds);
        else if (data && data.data && data.data.durationSeconds) setTimeLeft(data.data.durationSeconds);
      } catch (err) {
        console.error("Failed to start assessment:", err);
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

  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
    
    const assessmentId = routeParams?.assessmentId;
    if (assessmentId) {
      schoolApi.saveAssessmentAnswer(assessmentId, { questionId, answerIndex: optionIdx }).catch(console.error);
    }
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
            if (assessmentId) {
              try {
                await schoolApi.submitAssessment(assessmentId, { answers });
              } catch (err) { console.error("Submit error", err); }
            } else {
              schoolApi.submitTopicPyq('mock-topic', 'mock-exam', { answers }).catch(() => null);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => onNavigate('assessments')} style={styles.iconBtn}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {routeParams?.title || 'Mock Exam: General Knowledge'}
          </Text>
        </View>
        <View style={[styles.timerBadge, timeLeft < 300 && { backgroundColor: '#FEE2E2' }]}>
          <Clock size={16} color={timeLeft < 300 ? '#EF4444' : theme.primary} />
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
            {currentQ?.options?.map((opt: string, idx: number) => {
              const selected = answers[currentQ.id] === idx;
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[
                    styles.optionBtn, 
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    selected && { borderColor: theme.primary, backgroundColor: theme.primarySoft }
                  ]}
                  onPress={() => handleSelectOption(currentQ.id, idx)}
                  activeOpacity={0.7}
                  disabled={isSubmitted}
                >
                  <View style={[styles.radioOuter, { borderColor: selected ? theme.primary : theme.border }]}>
                    {selected && <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />}
                  </View>
                  <Text style={[styles.optionText, { color: theme.text }, selected && { color: theme.primary, fontWeight: '600' }]}>
                    {opt}
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
          <ChevronLeft size={20} color={currentIdx === 0 ? theme.border : theme.text} />
          <Text style={[styles.footerBtnText, { color: currentIdx === 0 ? theme.border : theme.text }]}>Previous</Text>
        </TouchableOpacity>

        {currentIdx < questions.length - 1 ? (
          <TouchableOpacity 
            style={[styles.footerBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]} 
            onPress={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
          >
            <Text style={[styles.footerBtnText, { color: '#fff' }]}>Next</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.footerBtn, { backgroundColor: '#10B981', borderColor: '#10B981' }]} 
            onPress={handleSubmit}
          >
            <CheckCircle size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.footerBtnText, { color: '#fff' }]}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBtn: { padding: 8, marginRight: 8, marginLeft: -8 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 14,
  },
  body: {
    flex: 1,
    flexDirection: 'column',
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  qNumber: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    marginBottom: 32,
  },
  optionsList: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  navigatorBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  navGrid: {
    gap: 8,
    paddingRight: 16,
  },
  navBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 120,
  },
  footerBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
