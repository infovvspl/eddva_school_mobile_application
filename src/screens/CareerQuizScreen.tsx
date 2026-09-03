import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, ChevronRight, Target } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { hs, vs, ms } from '../utils/responsive';

export function CareerQuizScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await schoolApi.getCareerQuizQuestions();
        if (res && res.questions) {
          setQuestions(res.questions);
        } else if (res && Array.isArray(res)) {
          setQuestions(res);
        } else {
          setQuestions([
            { id: 1, text: 'I enjoy solving complex math problems.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
            { id: 2, text: 'I like organizing events and leading teams.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
            { id: 3, text: 'I prefer working independently on creative tasks.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
          ]);
        }
      } catch (err) {
        console.error(err);
        setQuestions([
          { id: 1, text: 'I enjoy solving complex math problems.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
          { id: 2, text: 'I like organizing events and leading teams.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
          { id: 3, text: 'I prefer working independently on creative tasks.', options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleSelect = (idx: number) => {
    const q = questions[currentIdx];
    setAnswers(prev => ({ ...prev, [q.id]: idx }));
    
    if (currentIdx < questions.length - 1) {
      setTimeout(() => setCurrentIdx(currentIdx + 1), 300);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await schoolApi.submitCareerQuiz({ answers });
      await schoolApi.generateCareerReport(); 
      Alert.alert('Success', 'Your AI career report is ready!', [
        { text: 'View Report', onPress: () => onNavigate('careers') }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }]}><ActivityIndicator color={theme.primary} size="large" /></View>;
  }

  const currentQ = questions[currentIdx];
  const selectedIdx = answers[currentQ?.id];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => onNavigate('careers')} style={styles.iconBtn}>
          <ArrowLeft size={ms(24)} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Career Aptitude Test</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: ms(16) }}>
        <View style={styles.progressRow}>
          <Text style={{ color: theme.primary, fontFamily: 'Poppins-SemiBold', fontSize: ms(14) }}>Question {currentIdx + 1} of {questions.length}</Text>
          <View style={{ flex: 1, height: vs(6), backgroundColor: theme.border, marginLeft: hs(12), borderRadius: ms(3) }}>
            <View style={{ height: vs(6), backgroundColor: theme.primary, borderRadius: ms(3), width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Target size={ms(32)} color={theme.primary} style={{ marginBottom: vs(16) }} />
          <Text style={[styles.questionText, { color: theme.text }]}>{currentQ?.text}</Text>
          
          <View style={{ marginTop: vs(24), gap: vs(12) }}>
            {currentQ?.options?.map((opt: string, idx: number) => {
              const isSelected = selectedIdx === idx;
              return (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.optionBtn, { borderColor: isSelected ? theme.primary : theme.border, backgroundColor: isSelected ? theme.primary + '11' : theme.surface }]}
                  onPress={() => handleSelect(idx)}
                >
                  <View style={[styles.radio, { borderColor: isSelected ? theme.primary : theme.subtext }]}>
                    {isSelected && <View style={[styles.radioFill, { backgroundColor: theme.primary }]} />}
                  </View>
                  <Text style={[styles.optionText, { color: isSelected ? theme.primary : theme.text }]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.navBtn, { borderColor: theme.border, opacity: currentIdx === 0 ? 0.5 : 1 }]}
            onPress={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
          >
            <Text style={[styles.navBtnText, { color: theme.text }]}>Previous</Text>
          </TouchableOpacity>
          
          {currentIdx === questions.length - 1 ? (
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color={theme.surface} />
              ) : (
                <Text style={[styles.submitBtnText, { color: theme.surface }]}>Submit</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}>
              <Text style={[styles.submitBtnText, { color: theme.surface }]}>Next</Text>
              <ChevronRight size={ms(20)} color={theme.surface} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: hs(16), paddingVertical: vs(16), borderBottomWidth: 1 },
  iconBtn: { padding: ms(8), marginLeft: -ms(8) },
  title: { fontSize: ms(18), fontFamily: 'Poppins-SemiBold', marginLeft: hs(12) },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(24) },
  card: { padding: ms(20), borderRadius: ms(16), borderWidth: 1 },
  questionText: { fontSize: ms(18), fontFamily: 'Poppins-Medium', lineHeight: ms(26) },
  optionBtn: { flexDirection: 'row', alignItems: 'center', padding: ms(16), borderRadius: ms(12), borderWidth: 1 },
  radio: { width: ms(20), height: ms(20), borderRadius: ms(10), borderWidth: 2, marginRight: hs(12), justifyContent: 'center', alignItems: 'center' },
  radioFill: { width: ms(10), height: ms(10), borderRadius: ms(5) },
  optionText: { fontSize: ms(14), fontFamily: 'Poppins-Medium', flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: vs(32) },
  navBtn: { paddingHorizontal: hs(24), paddingVertical: vs(12), borderRadius: ms(24), borderWidth: 1, justifyContent: 'center' },
  navBtnText: { fontFamily: 'Poppins-Medium', fontSize: ms(14) },
  submitBtn: { flexDirection: 'row', paddingHorizontal: hs(32), paddingVertical: vs(12), borderRadius: ms(24), justifyContent: 'center', alignItems: 'center' },
  submitBtnText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), marginRight: hs(4) }
});
