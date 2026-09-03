import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { ChevronDown, Send, Hand, X, Users, MessageSquare, BarChart2, CheckCircle2 } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { hs, vs, ms } from '../utils/responsive';
import { schoolApi } from '../utils/api';
import VideoPlayer from 'react-native-video';

const { width, height } = Dimensions.get('window');

export function LiveClassRoomScreen({ onNavigate, routeParams }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [activeTab, setActiveTab] = useState<'chat' | 'polls'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activePoll, setActivePoll] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pollVoted, setPollVoted] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);

  const classId: string | undefined = routeParams?.id;

  useEffect(() => {
    fetchInitialData();
  }, [classId]);

  const fetchInitialData = async () => {
    // Nothing to join without a class id; the screen used to fall back to a
    // hardcoded UUID that pointed at somebody else's lecture.
    if (!classId) return;
    try {
      const [chatData, pollData] = await Promise.all([
        schoolApi.getLiveChat(classId).catch(() => []),
        schoolApi.getActivePoll(classId).catch(() => null)
      ]);
      setChatHistory(Array.isArray(chatData) ? chatData : (chatData?.data || []));
      setActivePoll(pollData?.id ? pollData : (pollData?.data?.id ? pollData.data : null));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      userId: 'me',
      userName: 'You',
      message: chatInput,
      createdAt: new Date().toISOString()
    };
    setChatHistory([...chatHistory, newMsg]);
    setChatInput('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleToggleHand = async () => {
    if (!classId) return;
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    try {
      await schoolApi.raiseHand(classId, newState);
    } catch (e) {
      // Raising a hand is best-effort; don't block the lecture UI on it.
      setIsHandRaised(!newState);
    }
  };

  const handleVotePoll = async () => {
    if (!selectedOption || !activePoll || !classId) return;
    setPollVoted(true);
    try {
      await schoolApi.votePoll(classId, activePoll.id, selectedOption);
    } catch (e) {
      // Ignore
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Video Player Area */}
      <View style={styles.videoArea}>
        {/* Header Overlay */}
        <View style={styles.videoHeader}>
          <TouchableOpacity onPress={() => onNavigate('learn')} style={styles.iconBtn}>
            <ChevronDown size={ms(24)} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <View style={styles.viewerBadge}>
            <Users size={ms(14)} color="#FFF" style={{marginRight: hs(4)}} />
            <Text style={styles.viewerText}>1.2k</Text>
          </View>
        </View>

        {isVideoLoading && (
          <View style={styles.videoLoader}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}
        <VideoPlayer
          source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }}
          style={styles.fullScreenVideo}
          controls={false}
          resizeMode="cover"
          repeat={true}
          onLoad={() => setIsVideoLoading(false)}
          onError={(e) => {
            console.error("Video error:", e);
            setIsVideoLoading(false);
          }}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'chat' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('chat')}
        >
          <MessageSquare size={ms(16)} color={activeTab === 'chat' ? theme.primary : theme.subtext} />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>Live Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'polls' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('polls')}
        >
          <BarChart2 size={ms(16)} color={activeTab === 'polls' ? theme.primary : theme.subtext} />
          <Text style={[styles.tabText, activeTab === 'polls' && styles.tabTextActive]}>Polls {activePoll && !pollVoted ? '(1)' : ''}</Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Content */}
      <KeyboardAvoidingView style={styles.interactiveArea} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        {activeTab === 'chat' ? (
          <>
            <ScrollView ref={scrollViewRef} style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
              {chatHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Say hello to start the chat!</Text>
                </View>
              ) : (
                chatHistory.map((msg, idx) => {
                  const isMe = msg.userName === 'You' || msg.userId === 'me';
                  return (
                    <View key={idx} style={[styles.chatBubbleContainer, isMe ? styles.chatBubbleRight : styles.chatBubbleLeft]}>
                      {!isMe && <Text style={styles.chatName}>{msg.userName}</Text>}
                      <View style={[styles.chatBubble, isMe ? styles.chatBubbleMe : styles.chatBubbleOther]}>
                        <Text style={[styles.chatText, isMe ? styles.chatTextMe : styles.chatTextOther]}>{msg.message}</Text>
                      </View>
                    </View>
                  )
                })
              )}
            </ScrollView>
            
            <View style={styles.inputArea}>
              {/* Raise Hand Toggle */}
              <TouchableOpacity 
                style={[styles.handBtn, isHandRaised && styles.handBtnActive]} 
                onPress={handleToggleHand}
              >
                <Hand size={ms(20)} color={isHandRaised ? '#FFF' : theme.subtext} />
              </TouchableOpacity>

              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Type a message..."
                  placeholderTextColor={theme.subtext}
                  value={chatInput}
                  onChangeText={setChatInput}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={handleSendChat}>
                  <Send size={ms(16)} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <ScrollView style={styles.pollScroll} contentContainerStyle={styles.pollContent}>
            {!activePoll ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No active polls right now.</Text>
              </View>
            ) : (
              <View style={styles.pollCard}>
                <View style={styles.pollHeaderRow}>
                  <View style={styles.liveBadge}><Text style={styles.liveText}>ACTIVE</Text></View>
                  <Text style={styles.pollTimer}>00:45</Text>
                </View>
                <Text style={styles.pollQuestion}>{activePoll.question}</Text>
                
                {activePoll.options.map((opt: string, idx: number) => {
                  const isSelected = selectedOption === opt;
                  return (
                    <TouchableOpacity 
                      key={idx} 
                      style={[
                        styles.pollOption, 
                        isSelected && styles.pollOptionSelected,
                        pollVoted && styles.pollOptionVoted
                      ]}
                      onPress={() => !pollVoted && setSelectedOption(opt)}
                      activeOpacity={pollVoted ? 1 : 0.7}
                    >
                      <View style={styles.pollOptionLeft}>
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                        <Text style={[styles.pollOptionText, isSelected && styles.pollOptionTextSelected]}>{opt}</Text>
                      </View>
                      {pollVoted && isSelected && <CheckCircle2 size={ms(18)} color={theme.primary} />}
                    </TouchableOpacity>
                  )
                })}

                {!pollVoted ? (
                  <TouchableOpacity 
                    style={[styles.submitPollBtn, !selectedOption && styles.submitPollBtnDisabled]}
                    disabled={!selectedOption}
                    onPress={handleVotePoll}
                  >
                    <Text style={styles.submitPollText}>Submit Vote</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.votedText}>Your vote has been recorded.</Text>
                )}
              </View>
            )}
          </ScrollView>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  videoArea: {
    height: height * 0.35,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? vs(50) : vs(20),
    left: hs(16),
    right: hs(16),
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  iconBtn: {
    padding: hs(8),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: ms(20),
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(6),
    marginLeft: hs(12),
  },
  liveDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#FFF',
    marginRight: hs(4),
  },
  liveText: {
    color: '#FFF',
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: 1,
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(6),
    marginLeft: 'auto',
  },
  viewerText: {
    color: '#FFF',
    fontSize: ms(12),
    fontWeight: '600',
  },
  videoCenter: {
    alignItems: 'center',
  },
  videoPlaceholderText: {
    color: '#FFF',
    fontSize: ms(20),
    fontWeight: '700',
    marginBottom: vs(8),
  },
  videoSubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: ms(12),
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(16),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: theme.primary,
  },
  tabText: {
    marginLeft: hs(8),
    fontSize: ms(14),
    color: theme.subtext,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.primary,
  },
  interactiveArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: hs(16),
    paddingBottom: vs(20),
  },
  chatBubbleContainer: {
    marginBottom: vs(16),
    maxWidth: '85%',
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
  },
  chatName: {
    fontSize: ms(12),
    color: theme.subtext,
    marginBottom: vs(4),
    marginLeft: hs(4),
  },
  chatBubble: {
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    borderRadius: ms(16),
  },
  chatBubbleOther: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: ms(4),
    borderWidth: 1,
    borderColor: theme.border,
  },
  chatBubbleMe: {
    backgroundColor: theme.primary,
    borderTopRightRadius: ms(4),
  },
  chatText: {
    fontSize: ms(14),
    lineHeight: ms(20),
  },
  chatTextOther: {
    color: theme.text,
  },
  chatTextMe: {
    color: '#FFF',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  handBtn: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hs(12),
    borderWidth: 1,
    borderColor: theme.border,
  },
  handBtnActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    borderRadius: ms(24),
    paddingHorizontal: hs(16),
    borderWidth: 1,
    borderColor: theme.border,
  },
  textInput: {
    flex: 1,
    height: ms(44),
    color: theme.text,
  },
  sendBtn: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: hs(8),
  },
  pollScroll: {
    flex: 1,
  },
  pollContent: {
    padding: hs(16),
  },
  pollCard: {
    backgroundColor: theme.surface,
    borderRadius: ms(16),
    padding: hs(20),
    borderWidth: 1,
    borderColor: theme.border,
  },
  pollHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  pollTimer: {
    color: '#EF4444',
    fontSize: ms(14),
    fontWeight: '600',
  },
  pollQuestion: {
    fontSize: ms(16),
    fontWeight: '700',
    color: theme.text,
    lineHeight: ms(24),
    marginBottom: vs(24),
  },
  pollOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hs(16),
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: vs(12),
    backgroundColor: theme.background,
  },
  pollOptionSelected: {
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft || '#EEF2FF',
  },
  pollOptionVoted: {
    opacity: 0.8,
  },
  pollOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: ms(20),
    height: ms(20),
    borderRadius: ms(10),
    borderWidth: 2,
    borderColor: theme.subtext,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hs(12),
  },
  radioCircleSelected: {
    borderColor: theme.primary,
  },
  radioDot: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    backgroundColor: theme.primary,
  },
  pollOptionText: {
    fontSize: ms(14),
    color: theme.text,
  },
  pollOptionTextSelected: {
    fontWeight: '600',
    color: theme.text,
  },
  submitPollBtn: {
    backgroundColor: theme.primary,
    paddingVertical: vs(16),
    borderRadius: ms(12),
    alignItems: 'center',
    marginTop: vs(12),
  },
  submitPollBtnDisabled: {
    backgroundColor: theme.border,
  },
  submitPollText: {
    color: '#FFF',
    fontSize: ms(16),
    fontWeight: '600',
  },
  votedText: {
    textAlign: 'center',
    color: '#10B981',
    fontSize: ms(14),
    fontWeight: '600',
    marginTop: vs(16),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(60),
  },
  emptyText: {
    color: theme.subtext,
    fontSize: ms(14),
  },
  videoLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -ms(20) }, { translateY: -vs(20) }],
    zIndex: 1,
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  }
});
