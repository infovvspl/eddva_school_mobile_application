import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Plus, Sparkles, ThumbsUp, ThumbsDown, Image as ImageIcon } from 'lucide-react-native';
import { hs, vs, ms } from '../utils/responsive';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

export function DoubtScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [isLoading, setIsLoading] = useState(true);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [isAiDisabled, setAiDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const handleHelpful = async (id: string) => {
    setLoadingActions(prev => ({ ...prev, [id]: true }));
    try {
      await schoolApi.markDoubtHelpful(id, { helpful: true });
      setDoubts(prev => prev.map(d => d.id === id ? { ...d, actionStatus: 'helpful' } : d));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to mark helpful');
    } finally {
      setLoadingActions(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleEscalate = async (id: string) => {
    setLoadingActions(prev => ({ ...prev, [id]: true }));
    try {
      await schoolApi.escalateDoubt(id);
      setDoubts(prev => prev.map(d => d.id === id ? { ...d, actionStatus: 'escalated', status: 'PENDING TEACHER' } : d));
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to escalate doubt');
    } finally {
      setLoadingActions(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const data = await schoolApi.getMyDoubts();
        setDoubts(data || []);
      } catch (err: any) {
        if (err.message && err.message.includes('disabled for your institution')) {
          setAiDisabled(true);
        } else {
          setErrorMessage(err.message || 'Failed to fetch doubts');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoubts();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => onNavigate('dashboard')} style={styles.backBtn}>
            <ArrowLeft size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.askBtn} onPress={() => onNavigate('askDoubt')}>
            <Plus size={ms(18)} color={theme.surface} />
            <Text style={styles.askBtnText}>Ask a Doubt</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>My Doubts</Text>
        <Text style={styles.headerSubtitle}>Track your questions and teacher replies.</Text>
        <Text style={styles.classInfo}>Class 10 • Section A</Text>

        <View style={styles.statusLegend}>
          <Text style={[styles.legendText, { color: '#F59E0B' }]}>PENDING</Text>
          <Text style={styles.legendDot}>•</Text>
          <Text style={[styles.legendText, { color: '#10B981' }]}>TEACHER ANSWERED</Text>
          <Text style={styles.legendDot}>•</Text>
          <Text style={[styles.legendText, { color: theme.subtext }]}>RESOLVED</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ marginTop: 10, color: theme.subtext }}>Loading your doubts...</Text>
        </View>
      ) : isAiDisabled ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ textAlign: 'center', color: theme.subtext, fontSize: 16 }}>
            The AI Doubt Solver feature is currently disabled for your institution.
          </Text>
        </View>
      ) : errorMessage ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ textAlign: 'center', color: '#EF4444', fontSize: 16, fontFamily: 'Poppins-Medium' }}>
            {errorMessage}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {doubts.map((item, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={[styles.badgeText, { color: '#6366F1' }]}>{item.status}</Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              {item.hasImage && (
                <View style={styles.imagePlaceholder}>
                  <ImageIcon size={ms(24)} color={theme.subtext} />
                  <Text style={styles.imagePlaceholderText}>Question image attached</Text>
                </View>
              )}
              <Text style={styles.subjectText}>Subject: {item.subject}</Text>
              <Text style={styles.questionText}>{item.question}</Text>
              
              {item.explanation && (
                <View style={styles.aiBox}>
                  <View style={styles.aiHeader}>
                    <Sparkles size={ms(14)} color="#6366F1" />
                    <Text style={styles.aiTitle}>AI EXPLANATION</Text>
                  </View>
                  <Text style={styles.aiExplanation}>{item.explanation}</Text>
                  
                  {item.actionStatus === 'helpful' ? (
                    <Text style={{ color: '#10B981', fontFamily: 'Poppins-Medium', fontSize: ms(12), marginTop: vs(8) }}>✓ Marked as helpful</Text>
                  ) : item.actionStatus === 'escalated' ? (
                    <Text style={{ color: '#F59E0B', fontFamily: 'Poppins-Medium', fontSize: ms(12), marginTop: vs(8) }}>⏳ Escalated to teacher</Text>
                  ) : (
                    <View style={styles.actionRow}>
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: '#10B981', opacity: loadingActions[item.id] ? 0.5 : 1 }]}
                        onPress={() => handleHelpful(item.id)}
                        disabled={loadingActions[item.id]}
                      >
                        <ThumbsUp size={ms(14)} color={theme.surface} />
                        <Text style={[styles.actionBtnText, { color: theme.surface }]}>Helpful</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionBtnOutline, { opacity: loadingActions[item.id] ? 0.5 : 1 }]}
                        onPress={() => handleEscalate(item.id)}
                        disabled={loadingActions[item.id]}
                      >
                        <ThumbsDown size={ms(14)} color={theme.subtext} />
                        <Text style={styles.actionBtnOutlineText}>Ask teacher instead</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    backgroundColor: theme.surface,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + hs(10) : hs(60),
    paddingHorizontal: hs(20),
    paddingBottom: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(16),
  },
  backBtn: {
    padding: ms(4),
    marginLeft: -ms(4),
  },
  askBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: hs(16),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    gap: ms(6),
  },
  askBtnText: {
    color: theme.surface,
    fontSize: ms(13),
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: ms(24),
    fontWeight: '700',
    color: theme.text,
    marginBottom: vs(4),
  },
  headerSubtitle: {
    fontSize: ms(14),
    color: theme.subtext,
    marginBottom: vs(8),
  },
  classInfo: {
    fontSize: ms(13),
    color: theme.primary,
    fontWeight: '600',
    marginBottom: vs(16),
  },
  statusLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  legendText: {
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  legendDot: {
    color: theme.border,
    marginHorizontal: hs(6),
  },
  content: {
    padding: ms(16),
    paddingBottom: vs(100),
    gap: ms(16),
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: ms(16),
    padding: ms(16),
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.subtext,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: ms(4),
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  badge: {
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(6),
  },
  badgeText: {
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: ms(11),
    color: theme.subtext,
    fontWeight: '500',
  },
  subjectText: {
    fontSize: ms(13),
    color: theme.subtext,
    marginBottom: vs(4),
  },
  teacherText: {
    fontSize: ms(13),
    color: theme.primary,
    fontWeight: '500',
    marginBottom: vs(4),
  },
  questionText: {
    fontSize: ms(15),
    color: theme.text,
    fontWeight: '500',
    lineHeight: ms(22),
    marginBottom: vs(16),
  },
  imagePlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    padding: ms(12),
    borderRadius: ms(8),
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
    marginBottom: vs(16),
    gap: ms(8),
  },
  imagePlaceholderText: {
    fontSize: ms(13),
    color: theme.subtext,
  },
  aiBox: {
    backgroundColor: theme.background,
    borderRadius: ms(12),
    padding: ms(16),
    borderWidth: 1,
    borderColor: theme.border,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
    marginBottom: vs(8),
  },
  aiTitle: {
    fontSize: ms(11),
    fontWeight: '700',
    color: '#6366F1',
    letterSpacing: 0.5,
  },
  aiExplanation: {
    fontSize: ms(14),
    color: theme.subtext,
    lineHeight: ms(20),
    marginBottom: vs(16),
  },
  actionRow: {
    flexDirection: 'row',
    gap: ms(12),
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderRadius: ms(20),
    gap: ms(6),
  },
  actionBtnText: {
    fontSize: ms(13),
    fontWeight: '600',
  },
  actionBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    gap: ms(6),
  },
  actionBtnOutlineText: {
    fontSize: ms(13),
    fontWeight: '500',
    color: theme.subtext,
  },
});
