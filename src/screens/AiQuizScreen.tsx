import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { X, Clock, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

export function AiQuizScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(14 * 60); // 14 mins
  
  useEffect(() => {
    let timerId: any;
    if (!loading && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [loading, timeLeft]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // We use a mock topicId for testing.
        const res = await schoolApi.generateAiQuiz('d9148ab4-22f4-46d4-9602-9b22e1d3b6cb');
        setQuizData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectOption = (qId: number, optIndex: number) => {
    setAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const nextQuestion = () => {
    if (quizData && currentIdx < quizData.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={{ marginTop: vs(16), color: theme.subtext }}>Generating your quiz...</Text>
      </View>
    );
  }

  if (!quizData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#EF4444' }}>Failed to load quiz.</Text>
        <TouchableOpacity style={{ marginTop: vs(16) }} onPress={() => onNavigate('studyPlan')}>
          <Text style={{ color: theme.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQ = quizData.questions[currentIdx];
  const numAnswered = Object.keys(answers).length;
  const totalQ = quizData.questions.length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitleBox}>
            <View style={styles.aiIconBox}>
              <Sparkles size={ms(16)} color={theme.surface} />
            </View>
            <View style={{ marginLeft: hs(12) }}>
              <Text style={styles.headerLabel}>AI Practice Quiz</Text>
              <Text style={styles.headerTitle}>{quizData.title}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
             <TouchableOpacity style={styles.iconBtn} onPress={() => onNavigate('studyPlan')}>
               <X size={ms(18)} color={theme.subtext} />
             </TouchableOpacity>
             <View style={styles.timerBox}>
               <Clock size={ms(14)} color={theme.subtext} />
               <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
             </View>
             <TouchableOpacity style={styles.submitBtn}>
               <Text style={styles.submitBtnText}>Submit</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* TOP META BAR */}
        <View style={styles.metaBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.qIndexBadge}>
               <Text style={styles.qIndexBadgeText}>Question {currentIdx + 1} / {totalQ}</Text>
            </View>
            <Text style={styles.metaText}>{currentQ.type}</Text>
            <Text style={styles.metaText}>Difficulty: {currentQ.difficulty}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.scoreBadgePos}><Text style={styles.scoreBadgeTextPos}>+4</Text></View>
            <View style={styles.scoreBadgeNeg}><Text style={styles.scoreBadgeTextNeg}>-1</Text></View>
          </View>
        </View>

        {/* QUESTION TEXT */}
        <Text style={styles.questionText}>{currentQ.text}</Text>

        {/* OPTIONS */}
        <View style={styles.optionsList}>
          {currentQ.options.map((opt: string, idx: number) => {
            const isSelected = answers[currentQ.id] === idx;
            const letters = ['A', 'B', 'C', 'D', 'E'];
            return (
              <TouchableOpacity 
                key={idx} 
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => handleSelectOption(currentQ.id, idx)}
                activeOpacity={0.7}
              >
                <View style={[styles.optionLetterBox, isSelected && styles.optionLetterBoxSelected]}>
                  <Text style={[styles.optionLetter, isSelected && styles.optionLetterSelected]}>{letters[idx]}</Text>
                </View>
                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* GRID (Moved below options for mobile layout) */}
        <View style={styles.gridContainer}>
           <View style={styles.gridHeader}>
             <Text style={styles.gridTitle}>QUESTION GRID</Text>
             <Text style={styles.gridCount}>{numAnswered}/{totalQ} answered</Text>
           </View>
           
           <View style={styles.gridLegend}>
             <View style={styles.legendItemAnswered}>
               <Text style={styles.legendTextAnswered}>Answered</Text>
             </View>
             <View style={styles.legendItemNotAnswered}>
               <Text style={styles.legendTextNotAnswered}>Not answered</Text>
             </View>
           </View>

           <View style={styles.gridSquares}>
             {quizData.questions.map((q: any, i: number) => {
               const qAnswered = answers[q.id] !== undefined;
               const isCurrent = currentIdx === i;
               
               let squareStyle: any = styles.gridSquareDefault;
               let squareTextStyle = styles.gridSquareTextDefault;
               
               if (qAnswered) {
                 squareStyle = styles.gridSquareAnswered;
                 squareTextStyle = styles.gridSquareTextAnswered;
               } 
               if (isCurrent) {
                 squareStyle = styles.gridSquareCurrent;
                 squareTextStyle = styles.gridSquareTextCurrent;
               }
               
               return (
                 <TouchableOpacity 
                   key={i} 
                   style={squareStyle} 
                   onPress={() => setCurrentIdx(i)}
                 >
                   <Text style={squareTextStyle}>{i + 1}</Text>
                 </TouchableOpacity>
               );
             })}
           </View>
        </View>

      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={styles.footerActions}>
        <TouchableOpacity style={styles.navBtnOutline} onPress={prevQuestion} disabled={currentIdx === 0}>
           <ArrowLeft size={ms(16)} color={currentIdx === 0 ? "#CBD5E1" : "#475569"} style={{marginRight: hs(6)}} />
           <Text style={[styles.navBtnOutlineText, currentIdx === 0 && {color: "#CBD5E1"}]}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
           style={[styles.navBtnSolid, currentIdx === totalQ - 1 && {opacity: 0.5}]} 
           onPress={nextQuestion} 
           disabled={currentIdx === totalQ - 1}
        >
           <Text style={styles.navBtnSolidText}>Next Question</Text>
           <ArrowRight size={ms(16)} color={theme.surface} style={{marginLeft: hs(6)}} />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background },
  header: { paddingTop: vs(12), backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: vs(16) },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: hs(16) },
  headerTitleBox: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  aiIconBox: { width: hs(36), height: hs(36), borderRadius: ms(18), backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center' },
  headerLabel: { fontFamily: 'Poppins-Regular', fontSize: ms(10), color: theme.subtext },
  headerTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: theme.text },
  
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: hs(8) },
  iconBtn: { width: hs(36), height: hs(36), borderRadius: ms(18), backgroundColor: theme.surfaceAlt, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  timerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, paddingHorizontal: hs(12), paddingVertical: vs(8), borderRadius: ms(20), borderWidth: 1, borderColor: theme.border },
  timerText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.subtext, marginLeft: hs(6) },
  submitBtn: { backgroundColor: theme.primary, paddingHorizontal: hs(16), paddingVertical: vs(8), borderRadius: ms(20) },
  submitBtnText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.surface },

  content: { padding: ms(16), paddingBottom: vs(120) },
  
  metaBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: vs(24) },
  qIndexBadge: { backgroundColor: theme.text, paddingHorizontal: hs(12), paddingVertical: vs(6), borderRadius: ms(16), marginRight: hs(12) },
  qIndexBadgeText: { fontFamily: 'Poppins-Medium', fontSize: ms(11), color: theme.surface },
  metaText: { fontFamily: 'Poppins-Medium', fontSize: ms(11), color: theme.subtext, marginRight: hs(12), backgroundColor: theme.surfaceAlt, paddingHorizontal: hs(8), paddingVertical: vs(4), borderRadius: ms(8) },
  
  scoreBadgePos: { backgroundColor: '#ECFDF5', paddingHorizontal: hs(8), paddingVertical: vs(4), borderRadius: ms(12), borderWidth: 1, borderColor: '#A7F3D0', marginRight: hs(8) },
  scoreBadgeTextPos: { fontFamily: 'Poppins-Medium', fontSize: ms(11), color: '#059669' },
  scoreBadgeNeg: { backgroundColor: '#FEF2F2', paddingHorizontal: hs(8), paddingVertical: vs(4), borderRadius: ms(12), borderWidth: 1, borderColor: '#FECACA' },
  scoreBadgeTextNeg: { fontFamily: 'Poppins-Medium', fontSize: ms(11), color: '#EF4444' },

  questionText: { fontFamily: 'Poppins-Medium', fontSize: ms(16), color: theme.text, lineHeight: ms(24), marginBottom: vs(32) },

  optionsList: { gap: vs(12), marginBottom: vs(40) },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, padding: ms(16), borderRadius: ms(12), borderWidth: 1, borderColor: theme.border },
  optionCardSelected: { borderColor: '#8B5CF6', backgroundColor: '#F5F3FF' },
  optionLetterBox: { width: hs(32), height: hs(32), borderRadius: ms(16), backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', marginRight: hs(16), borderWidth: 1, borderColor: theme.border },
  optionLetterBoxSelected: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  optionLetter: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.subtext },
  optionLetterSelected: { color: theme.surface },
  optionText: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: ms(14), color: theme.text },
  optionTextSelected: { color: theme.text, fontFamily: 'Poppins-Medium' },

  gridContainer: { backgroundColor: theme.surface, padding: ms(16), borderRadius: ms(16), borderWidth: 1, borderColor: theme.border },
  gridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: vs(16) },
  gridTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(12), color: theme.subtext, letterSpacing: 0.5 },
  gridCount: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.subtext },
  gridLegend: { flexDirection: 'row', gap: hs(12), marginBottom: vs(16) },
  legendItemAnswered: { backgroundColor: '#ECFDF5', paddingHorizontal: hs(12), paddingVertical: vs(4), borderRadius: ms(12), borderWidth: 1, borderColor: '#A7F3D0' },
  legendTextAnswered: { fontFamily: 'Poppins-Medium', fontSize: ms(11), color: '#059669' },
  legendItemNotAnswered: { backgroundColor: '#FEF2F2', paddingHorizontal: hs(12), paddingVertical: vs(4), borderRadius: ms(12), borderWidth: 1, borderColor: '#FECACA' },
  legendTextNotAnswered: { fontFamily: 'Poppins-Medium', fontSize: ms(11), color: '#EF4444' },
  gridSquares: { flexDirection: 'row', flexWrap: 'wrap', gap: ms(12) },
  
  gridSquareDefault: { width: hs(40), height: hs(40), borderRadius: ms(20), justifyContent: 'center', alignItems: 'center', backgroundColor: theme.surface, borderWidth: 1, borderColor: '#FECACA' },
  gridSquareTextDefault: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: '#EF4444' },
  
  gridSquareAnswered: { width: hs(40), height: hs(40), borderRadius: ms(20), justifyContent: 'center', alignItems: 'center', backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  gridSquareTextAnswered: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: '#059669' },
  
  gridSquareCurrent: { width: hs(40), height: hs(40), borderRadius: ms(20), justifyContent: 'center', alignItems: 'center', backgroundColor: theme.text },
  gridSquareTextCurrent: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.surface },

  footerActions: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.surface, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: hs(16), paddingTop: vs(12), paddingBottom: Platform.OS === 'ios' ? vs(32) : vs(16), borderTopWidth: 1, borderTopColor: theme.border },
  navBtnOutline: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: hs(20), paddingVertical: vs(10), borderRadius: ms(24), backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  navBtnOutlineText: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.subtext },
  navBtnSolid: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8B5CF6', paddingHorizontal: hs(24), paddingVertical: vs(10), borderRadius: ms(24) },
  navBtnSolidText: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.surface },
});
