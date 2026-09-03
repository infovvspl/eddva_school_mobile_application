import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { ArrowLeft, Plus, Sparkles, ThumbsUp, ThumbsDown, Image as ImageIcon } from 'lucide-react-native';
import { hs, vs, ms } from '../utils/responsive';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { splitMath } from '../utils/latex';

// Human labels for the API's status values.
const STATUS_LABELS: Record<string, string> = {
  ai_answered: 'AI ANSWERED',
  teacher_answered: 'TEACHER ANSWERED',
  escalated: 'PENDING TEACHER',
  open: 'OPEN',
};

/**
 * aiExplanation arrives as a JSON *string*. When the AI fails the server sends
 * a plain sentence instead, so a parse failure is an expected case, not an error.
 */
const readAiExplanation = (raw: any): string => {
  if (!raw || typeof raw !== 'string') return '';
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return raw.trim();
  }
  // The payload comes in two shapes in practice:
  //   { brief:{answer,question_nature}, detailed:{solution,final_answer,...} }
  //   { brief:{final_answer,steps,...},  detailed:{explanation,final_answer,...} }
  // Only the second is documented, so both are read here.
  return (
    parsed?.brief?.answer ||
    parsed?.brief?.final_answer ||
    parsed?.detailed?.solution ||
    parsed?.detailed?.explanation ||
    parsed?.brief?.steps ||
    parsed?.detailed?.final_answer ||
    ''
  );
};

// Map the documented doubt shape onto the fields this card renders.
const normalizeDoubt = (d: any) => ({
  ...d,
  id: d.id,
  statusKey: d.status,
  status: STATUS_LABELS[d.status] ?? String(d.status ?? '').toUpperCase(),
  subject: d.subjectName ?? 'General',
  question: d.questionText ?? '',
  explanation: d.teacherResponse || readAiExplanation(d.aiExplanation),
  hasImage: Boolean(d.questionImageUrl),
  date: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '',
  actionStatus:
    d.isAiHelpful === true ? 'helpful' : d.status === 'escalated' ? 'escalated' : undefined,
});

// Status -> badge colours, so the card matches the legend above the list.
const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  ai_answered: { bg: '#EEF2FF', fg: '#6366F1' },
  teacher_answered: { bg: '#ECFDF5', fg: '#10B981' },
  escalated: { bg: '#FFFBEB', fg: '#F59E0B' },
  open: { bg: '#FFFBEB', fg: '#F59E0B' },
};

/**
 * The AI returns Markdown, which React Native's <Text> renders literally
 * ("**bold**", "### Heading"). This is a deliberately small renderer covering
 * what the explanations actually use: headings, bullets and inline bold.
 */
const MarkdownText = ({ value, styles }: { value: string; styles: any }) => {
  const lines = String(value).replace(/\r\n/g, '\n').split('\n');

  // Math spans are extracted first so LaTeX like $a_1$ is never mistaken for
  // Markdown emphasis; **bold** is then applied to the prose between them.
  const inline = (text: string, key: string) =>
    splitMath(text).flatMap((seg, s) => {
      if (seg.math) {
        return [
          <Text key={`${key}-m${s}`} style={styles.mdMath}>{seg.text}</Text>,
        ];
      }
      return seg.text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 === 1 ? (
          <Text key={`${key}-${s}b${i}`} style={styles.mdBold}>{part}</Text>
        ) : (
          <Text key={`${key}-${s}t${i}`}>{part}</Text>
        ),
      );
    });

  return (
    <View>
      {lines.map((raw, i) => {
        const line = raw.trimEnd();
        if (!line.trim()) return <View key={`sp${i}`} style={styles.mdSpacer} />;

        const heading = line.match(/^(#{1,6})\s+(.*)$/);
        if (heading) {
          return (
            <Text key={`h${i}`} style={styles.mdHeading}>{heading[2]}</Text>
          );
        }

        const bullet = line.match(/^\s*([•\-*])\s+(.*)$/);
        if (bullet) {
          return (
            <View key={`li${i}`} style={styles.mdBulletRow}>
              <Text style={styles.mdBulletDot}>•</Text>
              <Text style={styles.mdBody}>{inline(bullet[2], `li${i}`)}</Text>
            </View>
          );
        }

        return (
          <Text key={`p${i}`} style={styles.mdBody}>{inline(line, `p${i}`)}</Text>
        );
      })}
    </View>
  );
};

export function DoubtScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [isLoading, setIsLoading] = useState(true);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [isAiDisabled, setAiDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  // Explanations run long; collapse them so the list stays scannable.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const handleHelpful = async (id: string) => {
    setLoadingActions(prev => ({ ...prev, [id]: true }));
    try {
      await schoolApi.markDoubtHelpful(id, { isHelpful: true });
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
        const res = await schoolApi.getDoubts();
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setDoubts((Array.isArray(list) ? list : []).map(normalizeDoubt));
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
          <Text style={{ marginTop: vs(10), color: theme.subtext }}>Loading your doubts...</Text>
        </View>
      ) : isAiDisabled ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: ms(20) }}>
          <Text style={{ textAlign: 'center', color: theme.subtext, fontSize: ms(16) }}>
            The AI Doubt Solver feature is currently disabled for your institution.
          </Text>
        </View>
      ) : errorMessage ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: ms(20) }}>
          <Text style={{ textAlign: 'center', color: '#EF4444', fontSize: ms(16), fontFamily: 'Poppins-Medium' }}>
            {errorMessage}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true}
        >
          {doubts.map((item, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[item.statusKey] ?? STATUS_COLORS.ai_answered).bg }]}>
                  <Text style={[styles.badgeText, { color: (STATUS_COLORS[item.statusKey] ?? STATUS_COLORS.ai_answered).fg }]}>{item.status}</Text>
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
                  <View style={!expanded[item.id] && styles.aiClamp}>
                    <MarkdownText value={item.explanation} styles={styles} />
                  </View>
                  {item.explanation.length > 320 && (
                    <TouchableOpacity
                      onPress={() =>
                        setExpanded(prev => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      style={styles.moreBtn}
                    >
                      <Text style={styles.moreBtnText}>
                        {expanded[item.id] ? 'Show less' : 'Show more'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
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
    // The root SafeAreaView already insets the status bar on both platforms,
    // so this only needs breathing room below it -- not a second status bar.
    paddingTop: vs(12),
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
  scroll: {
    flex: 1,
  },
  mdBody: {
    fontSize: ms(13),
    lineHeight: ms(20),
    color: theme.text,
  },
  mdBold: {
    fontWeight: '700',
    color: theme.text,
  },
  // Math reads as math: tabular figures, slightly tinted, never wrapped mid-symbol.
  mdMath: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: ms(12.5),
    color: '#1e3a8a',
  },
  mdHeading: {
    fontSize: ms(13),
    lineHeight: ms(20),
    fontWeight: '700',
    color: theme.text,
    marginTop: vs(6),
    marginBottom: vs(2),
  },
  mdBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: hs(6),
    paddingRight: hs(10),
  },
  mdBulletDot: {
    fontSize: ms(13),
    lineHeight: ms(20),
    color: '#6366F1',
  },
  mdSpacer: {
    height: vs(6),
  },
  // ~9 lines before the fold; enough to judge the answer, short enough to scan.
  aiClamp: {
    maxHeight: ms(20) * 9,
    overflow: 'hidden',
  },
  moreBtn: {
    marginTop: vs(6),
    alignSelf: 'flex-start',
  },
  moreBtnText: {
    fontSize: ms(12),
    fontWeight: '700',
    color: '#6366F1',
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
    shadowOffset: { width: 0, height: vs(2) },
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
