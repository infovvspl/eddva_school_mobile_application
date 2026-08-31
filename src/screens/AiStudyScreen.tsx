import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal, Animated, Alert } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { ChevronLeft, MessageSquare, BookOpen, Clock, FileText, Highlighter, MessageCircle, Copy, Check, ArrowRight, ArrowLeft, Send, Sparkles, Trophy, X } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi, fetchApi } from '../utils/api';

const MOCK_NOTES = `
# Towards Civil Disobedience

## What You'll Learn
This topic is about the movement towards civil disobedience in India during the struggle for independence, why it matters in understanding the country's path to freedom, and what it helps us understand about the power of non-violent resistance in achieving social and political change. By studying this topic, you will gain insights into the historical context and key events that led to the adoption of civil disobedience as a strategy by Indian nationalists. This will also help you appreciate the significance of non-violent movements in shaping the world's political landscape.

## Introduction & Background
The movement towards civil disobedience in India was a significant development in the country's struggle for independence from British rule. It emerged as a response to the failure of the Non-Cooperation Movement...
`;

const MOCK_FLASHCARDS = [
  { q: "What was the primary goal of the Non-Cooperation Movement launched by Gandhiji in 1920?", a: "To resist British rule in India through non-violent means, specifically by refusing to cooperate with the colonial government." },
  { q: "Why was the Simon Commission boycotted?", a: "It was an all-white commission with no Indian members, tasked with constitutional reforms for India." },
  { q: "What event marked the beginning of the Civil Disobedience Movement?", a: "The Salt March (Dandi March) led by Mahatma Gandhi in 1930." }
];

export function AiStudyScreen({ onNavigate, routeParams }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [activeTab, setActiveTab] = useState<'notes' | 'ai'>('notes');
  const [isFlashcardModalVisible, setFlashcardModalVisible] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  const [topicId, setTopicId] = useState<string>(routeParams?.topicId || 'mock-topic');
  const [sessionId, setSessionId] = useState<string>('');

  React.useEffect(() => {
    const initAiSession = async () => {
      try {
        const response = await schoolApi.startAiStudy(topicId);
        if (response && response.sessionId) {
          setSessionId(response.sessionId);
        } else if (response && response.data && response.data.sessionId) {
          setSessionId(response.data.sessionId);
        } else {
          setSessionId('mock-session-123'); // fallback
        }
      } catch (err) {
        console.error("Failed to start AI session", err);
        setSessionId('mock-session-123');
      }
    };
    initAiSession();
  }, [topicId]);
  
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "This topic is about the movement towards civil disobedience in India during the struggle for independence, why it matters in understanding the country's path to freedom, and what it helps us understand about the power of non-violent resistance in achieving social and political change. By studying this topic, you will gain insights into the historical context and key events that led to the adoption of civil disobedience as a strategy by Indian nationalists."
    }
  ]);

  const toggleTab = (tab: 'notes' | 'ai') => setActiveTab(tab);

  const openFlashcards = () => {
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setFlashcardModalVisible(true);
  };

  const nextCard = () => {
    if (currentCardIndex < MOCK_FLASHCARDS.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsCardFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setIsCardFlipped(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const newUserMsg = { id: Date.now(), sender: 'user', text: chatInput };
    setChatHistory([...chatHistory, newUserMsg]);
    setChatInput('');
    
    try {
      const response = await schoolApi.askAiQuestion(topicId, sessionId, { message: chatInput });
      setChatHistory(prev => [...prev, { id: Date.now(), sender: 'ai', text: response.reply || response.data?.reply || "I couldn't process that." }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { id: Date.now(), sender: 'ai', text: "Network error simulating AI response." }]);
    }
  };

  const handleComplete = async () => {
    try {
      await schoolApi.completeAiStudy(topicId, sessionId);
      Alert.alert('Success', 'Topic marked as complete!', [{ text: 'OK', onPress: () => onNavigate('dashboard') }]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to mark as complete.');
    }
  };

  const handleShortcutClick = (text: string) => {
    setChatInput(text);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => onNavigate('dashboard')} style={styles.backBtn}>
            <ChevronLeft size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: hs(12) }}>
            <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI STUDY SESSION</Text></View>
            <Text style={styles.headerTitle}>AI Study</Text>
          </View>
        </View>

        {/* Tab Toggle */}
        <View style={styles.tabToggleRow}>
          <View style={styles.timeSpentBox}>
            <Clock size={ms(14)} color={theme.subtext} />
            <Text style={styles.timeSpentText}>2:25</Text>
          </View>
          <View style={styles.tabToggle}>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'notes' && styles.tabBtnActive]} 
              onPress={() => toggleTab('notes')}
            >
              <BookOpen size={ms(16)} color={activeTab === 'notes' ? theme.surface : theme.subtext} />
              <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBtn, activeTab === 'ai' && styles.tabBtnActive]} 
              onPress={() => toggleTab('ai')}
            >
              <Sparkles size={ms(16)} color={activeTab === 'ai' ? theme.surface : theme.subtext} />
              <Text style={[styles.tabText, activeTab === 'ai' && styles.tabTextActive]}>Ask AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      {activeTab === 'notes' ? (
        <View style={styles.notesContainer}>
          <ScrollView contentContainerStyle={styles.notesContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.notesMarkdownTitle}>Revision Notes</Text>
            <Text style={styles.notesMarkdownHeading}>Towards Civil Disobedience</Text>
            
            <View style={styles.markdownSection}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: vs(8)}}>
                 <Text style={{fontSize: ms(20), marginRight: hs(8)}}>🎯</Text>
                 <Text style={styles.markdownH2}>What You'll Learn</Text>
              </View>
              <Text style={styles.markdownP}>
                This topic is about the movement towards civil disobedience in India during the struggle for independence, why it matters in understanding the country's path to freedom, and what it helps us understand about the power of non-violent resistance in achieving social and political change. By studying this topic, you will gain insights into the historical context and key events that led to the adoption of civil disobedience as a strategy by Indian nationalists. This will also help you appreciate the significance of non-violent movements in shaping the world's political landscape.
              </Text>
            </View>

            <View style={styles.markdownSection}>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: vs(8)}}>
                 <Text style={{fontSize: ms(20), marginRight: hs(8)}}>📖</Text>
                 <Text style={styles.markdownH2}>Introduction & Background</Text>
              </View>
              <Text style={styles.markdownP}>
                The movement towards civil disobedience in India was a significant development in the country's struggle for independence from British rule. It emerged as a response to the failure of the Non-Cooperation Movement...
              </Text>
            </View>

            {/* Session Progress Block */}
            <View style={styles.sessionProgressCard}>
              <View style={styles.sessionProgressHeader}>
                 <Trophy size={ms(20)} color={theme.primary} />
                 <Text style={styles.sessionProgressTitle}>Session progress</Text>
              </View>
              <Text style={styles.sessionProgressSub}>Finish the topic once you are confident with the notes and practice questions.</Text>
              <TouchableOpacity style={styles.btnPrimaryLg} onPress={handleComplete}>
                <Trophy size={ms(18)} color={theme.surface} style={{marginRight: hs(8)}} />
                <Text style={styles.btnPrimaryLgText}>Mark topic complete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnOutlineLg} onPress={() => toggleTab('ai')}>
                <MessageSquare size={ms(18)} color={theme.subtext} style={{marginRight: hs(8)}} />
                <Text style={styles.btnOutlineLgText}>Ask AI before finishing</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Sticky Study Toolkit Bottom Bar */}
          <View style={styles.studyToolkitBar}>
            <View style={styles.toolkitHeader}>
              <Text style={styles.toolkitTitle}>Study toolkit</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolkitBtns}>
              <TouchableOpacity style={styles.toolkitBtnItem}>
                <Highlighter size={ms(16)} color="#D97706" style={{marginRight: hs(6)}} />
                <Text style={[styles.toolkitBtnText, {color: '#D97706'}]}>Highlight</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolkitBtnItem}>
                <MessageCircle size={ms(16)} color={theme.subtext} style={{marginRight: hs(6)}} />
                <Text style={styles.toolkitBtnText}>Comment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.toolkitBtnItem} onPress={openFlashcards}>
                <Copy size={ms(16)} color={theme.subtext} style={{marginRight: hs(6)}} />
                <Text style={styles.toolkitBtnText}>Cards</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      ) : (
        <KeyboardAvoidingView style={styles.aiContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.completionDeskCard}>
               <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: vs(12)}}>
                 <Trophy size={ms(16)} color="#10B981" style={{marginRight: hs(8)}} />
                 <Text style={styles.completionDeskTitle}>Completion Desk</Text>
               </View>
               <TouchableOpacity style={[styles.btnPrimaryLg, {marginBottom: vs(12)}]} onPress={handleComplete}>
                  <Text style={styles.btnPrimaryLgText}>Mark lesson complete</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.btnOutlineLg} onPress={() => toggleTab('notes')}>
                  <Text style={styles.btnOutlineLgText}>Back to notes</Text>
               </TouchableOpacity>
            </View>

            {chatHistory.map((msg) => (
              <View key={msg.id} style={msg.sender === 'ai' ? styles.chatBubbleAiContainer : styles.chatBubbleUserContainer}>
                {msg.sender === 'ai' && (
                  <View style={styles.aiAvatarIcon}>
                    <Sparkles size={ms(16)} color={theme.primary} />
                  </View>
                )}
                <View style={msg.sender === 'ai' ? styles.chatBubbleAi : styles.chatBubbleUser}>
                  <Text style={msg.sender === 'ai' ? styles.chatTextAi : styles.chatTextUser}>{msg.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.chatInputArea}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chatShortcuts}>
              <TouchableOpacity style={styles.shortcutChip} onPress={() => handleShortcutClick("Why do students make this mistake...")}>
                <Text style={styles.shortcutText}>Why do students make this mistake...</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shortcutChip} onPress={() => handleShortcutClick("Walk me through this practice question step by step...")}>
                <Text style={styles.shortcutText}>Walk me through this practice question...</Text>
              </TouchableOpacity>
            </ScrollView>
            
            <View style={styles.chatInputWrapper}>
              <TextInput 
                style={styles.chatInput}
                placeholder="Ask the AI Tutor a question..."
                placeholderTextColor="#94A3B8"
                value={chatInput}
                onChangeText={setChatInput}
                multiline
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSendChat}>
                <Send size={ms(18)} color={theme.surface} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Flashcards Modal */}
      <Modal visible={isFlashcardModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.modalIconBox}><Copy size={ms(20)} color="#10B981" /></View>
                <View style={{marginLeft: hs(12)}}>
                  <Text style={styles.modalTitle}>Flashcards</Text>
                  <Text style={styles.modalSub}>Flip through quick revision cards for this topic.</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setFlashcardModalVisible(false)} style={styles.closeModalBtn}>
                <X size={ms(20)} color={theme.subtext} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardProgressRow}>
              <Text style={styles.cardProgressText}>CARD {currentCardIndex + 1} OF {MOCK_FLASHCARDS.length}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${((currentCardIndex + 1) / MOCK_FLASHCARDS.length) * 100}%` }]} />
              </View>
            </View>

            <TouchableOpacity 
              activeOpacity={0.9} 
              style={[styles.flashcard, isCardFlipped && styles.flashcardFlipped]}
              onPress={() => setIsCardFlipped(!isCardFlipped)}
            >
              <Text style={styles.flashcardLabel}>{isCardFlipped ? "ANSWER" : "QUESTION"}</Text>
              <Text style={styles.flashcardText}>
                {isCardFlipped ? MOCK_FLASHCARDS[currentCardIndex].a : MOCK_FLASHCARDS[currentCardIndex].q}
              </Text>
              {!isCardFlipped && (
                <Text style={styles.flashcardHint}>Click to reveal answer</Text>
              )}
            </TouchableOpacity>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.prevBtn} onPress={prevCard} disabled={currentCardIndex === 0}>
                <Text style={[styles.prevBtnText, currentCardIndex === 0 && {color: theme.border}]}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={nextCard} disabled={currentCardIndex === MOCK_FLASHCARDS.length - 1}>
                <Text style={styles.nextBtnText}>Next</Text>
                <ArrowRight size={ms(16)} color={theme.surface} style={{marginLeft: hs(8)}} />
              </TouchableOpacity>
            </View>

            {/* Doubt Box */}
            <View style={styles.doubtBoxContainer}>
              <Text style={styles.doubtBoxTitle}>Doubt box</Text>
              <View style={styles.doubtBoxSnippet}>
                 <Text style={styles.doubtBoxSnippetText} numberOfLines={4}>
                    This topic is about the movement towards civil disobedience in India during the struggle for independence, why it matters in understanding the country's path to freedom...
                 </Text>
              </View>
              <View style={styles.doubtInputRow}>
                <TextInput style={styles.doubtInput} placeholder="Ask your doubt..." placeholderTextColor="#94A3B8" />
                <TouchableOpacity style={styles.doubtSendBtn}>
                  <Text style={styles.doubtSendBtnText}>Ask</Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>
      </Modal>

    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background },
  header: { paddingTop: Platform.OS === 'android' ? 40 : 60, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: vs(16) },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: hs(16), marginBottom: vs(16) },
  backBtn: { width: hs(40), height: hs(40), borderRadius: ms(20), backgroundColor: theme.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  aiBadge: { alignSelf: 'flex-start', backgroundColor: '#EFF6FF', paddingHorizontal: hs(8), paddingVertical: vs(4), borderRadius: ms(12), marginBottom: vs(4) },
  aiBadgeText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(10), color: theme.primary, letterSpacing: 0.5 },
  headerTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(22), color: theme.text },
  
  tabToggleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: hs(16), justifyContent: 'space-between' },
  timeSpentBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surfaceAlt, paddingHorizontal: hs(12), paddingVertical: vs(6), borderRadius: ms(16) },
  timeSpentText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.subtext, marginLeft: hs(6) },
  
  tabToggle: { flexDirection: 'row', backgroundColor: theme.surfaceAlt, borderRadius: ms(24), padding: ms(4) },
  tabBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: hs(20), paddingVertical: vs(8), borderRadius: ms(20) },
  tabBtnActive: { backgroundColor: theme.primary },
  tabText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.subtext, marginLeft: hs(6) },
  tabTextActive: { color: theme.surface },

  notesContainer: { flex: 1 },
  notesContent: { padding: ms(20), paddingBottom: vs(140) },
  notesMarkdownTitle: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext, marginBottom: vs(8) },
  notesMarkdownHeading: { fontFamily: 'Poppins-SemiBold', fontSize: ms(26), color: theme.text, marginBottom: vs(24) },
  markdownSection: { marginBottom: vs(24) },
  markdownH2: { fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.text },
  markdownP: { fontFamily: 'Poppins-Regular', fontSize: ms(14), color: theme.subtext, lineHeight: ms(24) },

  sessionProgressCard: { backgroundColor: theme.surface, padding: ms(20), borderRadius: ms(16), borderWidth: 1, borderColor: theme.border, marginTop: vs(16) },
  sessionProgressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(8) },
  sessionProgressTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(16), color: theme.text, marginLeft: hs(8) },
  sessionProgressSub: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: theme.subtext, marginBottom: vs(20) },

  studyToolkitBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: theme.surface, padding: ms(16), paddingBottom: Platform.OS === 'ios' ? vs(32) : ms(16), borderTopWidth: 1, borderTopColor: theme.border, shadowColor: '#000', shadowOffset: {width: 0, height: -4}, shadowOpacity: 0.05, shadowRadius: ms(8), elevation: 10 },
  toolkitHeader: { marginBottom: vs(12) },
  toolkitTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: theme.text },
  toolkitBtns: { flexDirection: 'row', gap: ms(12) },
  toolkitBtnItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: hs(16), paddingVertical: vs(10), borderRadius: ms(24), backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  toolkitBtnText: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.subtext },

  aiContainer: { flex: 1, backgroundColor: theme.background },
  chatContent: { padding: ms(16), paddingBottom: vs(100) },
  
  completionDeskCard: { backgroundColor: theme.surface, padding: ms(16), borderRadius: ms(16), borderWidth: 1, borderColor: theme.border, marginBottom: vs(24) },
  completionDeskTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: theme.text },
  
  chatBubbleAiContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: vs(20), maxWidth: '90%' },
  aiAvatarIcon: { width: hs(32), height: hs(32), borderRadius: ms(16), backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: hs(12) },
  chatBubbleAi: { backgroundColor: theme.surfaceAlt, padding: ms(16), borderRadius: ms(16), borderTopLeftRadius: ms(4) },
  chatTextAi: { fontFamily: 'Poppins-Regular', fontSize: ms(14), color: theme.text, lineHeight: ms(22) },

  chatBubbleUserContainer: { alignItems: 'flex-end', marginBottom: vs(20), alignSelf: 'flex-end', maxWidth: '85%' },
  chatBubbleUser: { backgroundColor: theme.primary, padding: ms(16), borderRadius: ms(16), borderTopRightRadius: ms(4) },
  chatTextUser: { fontFamily: 'Poppins-Regular', fontSize: ms(14), color: theme.surface, lineHeight: ms(22) },

  chatInputArea: { backgroundColor: theme.surface, paddingHorizontal: hs(16), paddingTop: vs(12), paddingBottom: Platform.OS === 'ios' ? vs(32) : vs(16), borderTopWidth: 1, borderTopColor: theme.border },
  chatShortcuts: { flexDirection: 'row', marginBottom: vs(12), gap: ms(8) },
  shortcutChip: { backgroundColor: '#EEF2FF', paddingHorizontal: hs(12), paddingVertical: vs(8), borderRadius: ms(16), borderWidth: 1, borderColor: '#C7D2FE' },
  shortcutText: { fontFamily: 'Poppins-Medium', fontSize: ms(11), color: '#4F46E5' },
  
  chatInputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: theme.background, borderRadius: ms(24), borderWidth: 1, borderColor: theme.border, paddingHorizontal: hs(16), paddingVertical: vs(8) },
  chatInput: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: ms(14), color: theme.text, minHeight: vs(40), maxHeight: vs(100) },
  sendBtn: { width: hs(40), height: hs(40), borderRadius: ms(20), backgroundColor: '#8B5CF6', justifyContent: 'center', alignItems: 'center', marginLeft: hs(12), alignSelf: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'center', padding: ms(16) },
  modalContent: { backgroundColor: theme.surface, borderRadius: ms(24), padding: ms(24), overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: vs(24) },
  modalIconBox: { width: hs(48), height: hs(48), borderRadius: ms(24), backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  modalTitle: { fontFamily: 'Poppins-SemiBold', fontSize: ms(18), color: theme.text },
  modalSub: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext, marginTop: vs(2) },
  closeModalBtn: { width: hs(36), height: hs(36), borderRadius: ms(18), backgroundColor: theme.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  
  cardProgressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(16) },
  cardProgressText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(10), color: theme.subtext, letterSpacing: 1, marginRight: hs(12) },
  progressBarBg: { flex: 1, height: vs(4), backgroundColor: theme.surfaceAlt, borderRadius: ms(2) },
  progressBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: ms(2) },
  
  flashcard: { backgroundColor: '#EFF6FF', borderRadius: ms(16), padding: ms(24), minHeight: vs(180), borderWidth: 1, borderColor: '#DBEAFE', justifyContent: 'center' },
  flashcardFlipped: { backgroundColor: theme.background, borderColor: theme.border },
  flashcardLabel: { fontFamily: 'Poppins-SemiBold', fontSize: ms(10), color: theme.primary, letterSpacing: 1, marginBottom: vs(12), alignSelf: 'flex-start' },
  flashcardText: { fontFamily: 'Poppins-Medium', fontSize: ms(16), color: theme.text, lineHeight: ms(24), textAlign: 'center' },
  flashcardHint: { fontFamily: 'Poppins-Regular', fontSize: ms(12), color: theme.subtext, textAlign: 'center', marginTop: vs(24) },
  
  modalActionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: vs(24), marginBottom: vs(24) },
  prevBtn: { paddingHorizontal: hs(20), paddingVertical: vs(12), borderRadius: ms(24), borderWidth: 1, borderColor: theme.border },
  prevBtnText: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.subtext },
  nextBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B981', paddingHorizontal: hs(32), paddingVertical: vs(12), borderRadius: ms(24) },
  nextBtnText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: theme.surface },

  doubtBoxContainer: { backgroundColor: theme.background, borderRadius: ms(16), padding: ms(16), borderWidth: 1, borderColor: theme.border },
  doubtBoxTitle: { fontFamily: 'Poppins-Medium', fontSize: ms(13), color: theme.primary, marginBottom: vs(8) },
  doubtBoxSnippet: { backgroundColor: '#E0E7FF', padding: ms(12), borderRadius: ms(8), marginBottom: vs(12) },
  doubtBoxSnippetText: { fontFamily: 'Poppins-Regular', fontSize: ms(13), color: '#312E81', lineHeight: ms(20) },
  doubtInputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: ms(20), paddingHorizontal: hs(12), paddingVertical: vs(4), borderWidth: 1, borderColor: theme.border },
  doubtInput: { flex: 1, fontFamily: 'Poppins-Regular', fontSize: ms(13), minHeight: vs(36) },
  doubtSendBtn: { backgroundColor: '#8B5CF6', paddingHorizontal: hs(16), paddingVertical: vs(6), borderRadius: ms(14) },
  doubtSendBtnText: { fontFamily: 'Poppins-Medium', fontSize: ms(12), color: theme.surface },

  btnPrimaryLg: { flexDirection: 'row', backgroundColor: theme.primary, paddingVertical: vs(14), borderRadius: ms(12), justifyContent: 'center', alignItems: 'center' },
  btnPrimaryLgText: { fontFamily: 'Poppins-SemiBold', fontSize: ms(14), color: theme.surface },
  btnOutlineLg: { flexDirection: 'row', backgroundColor: theme.surface, paddingVertical: vs(14), borderRadius: ms(12), justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  btnOutlineLgText: { fontFamily: 'Poppins-Medium', fontSize: ms(14), color: theme.subtext }
});
