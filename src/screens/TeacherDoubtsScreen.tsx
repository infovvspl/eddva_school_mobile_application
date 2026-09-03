import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { hs, vs, ms } from '../utils/responsive';

export function TeacherDoubtsScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  
  const [loading, setLoading] = useState(true);
  const [doubts, setDoubts] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [activeDoubt, setActiveDoubt] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoubts = async () => {
      try {
        const res = await schoolApi.teacher.getDoubts();
        let records = [];
        if (Array.isArray(res)) records = res;
        else if (res && Array.isArray(res.data)) records = res.data;

        if (records.length === 0) {
          records = [
            { id: 'd1', studentName: 'Alice Smith', subject: 'Physics', question: 'I don\'t understand the right hand rule for magnetic fields.', status: 'escalated' },
            { id: 'd2', studentName: 'Charlie Brown', subject: 'Math', question: 'How do you solve quadratic equations using the formula?', status: 'resolved' },
          ];
        }
        setDoubts(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoubts();
  }, []);

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      Alert.alert('Sending...', 'Posting your reply.');
      await schoolApi.teacher.respondToDoubt(id, { message: replyText });
      
      // Optimistically update
      setDoubts(prev => prev.map(d => d.id === id ? { ...d, status: 'resolved' } : d));
      setActiveDoubt(null);
      setReplyText('');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to send reply.');
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('teacherDashboard')} style={{ marginRight: hs(12) }}>
            <ArrowLeft size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Student Doubts</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>Respond to escalated queries</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : doubts.length === 0 ? (
          <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: vs(40) }}>No doubts found.</Text>
        ) : (
          doubts.map(doubt => (
          <View key={doubt.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MessageCircle size={ms(20)} color={theme.primary} style={{ marginRight: hs(8) }} />
                <Text style={[styles.subject, { color: theme.primary }]}>{doubt.subject}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: doubt.status === 'resolved' ? '#D1FAE5' : '#FEE2E2' }]}>
                <Text style={[styles.statusText, { color: doubt.status === 'resolved' ? '#059669' : '#DC2626' }]}>
                  {doubt.status === 'resolved' ? 'Resolved' : 'Needs Reply'}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.studentName, { color: theme.text }]}>{doubt.studentName} asks:</Text>
            <Text style={[styles.questionText, { color: theme.subtext }]}>"{doubt.question}"</Text>

            {doubt.status !== 'resolved' && (
              <>
                {activeDoubt === doubt.id ? (
                  <View style={styles.replyBox}>
                    <TextInput
                      style={styles.input}
                      placeholder="Type your explanation..."
                      placeholderTextColor="#9ca3af"
                      multiline
                      value={replyText}
                      onChangeText={setReplyText}
                    />
                    <View style={styles.replyActions}>
                      <TouchableOpacity onPress={() => { setActiveDoubt(null); setReplyText(''); }}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.primary }]} onPress={() => handleReply(doubt.id)}>
                        <Send size={ms(14)} color="#fff" style={{ marginRight: hs(4) }} />
                        <Text style={styles.sendBtnText}>Send</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setActiveDoubt(doubt.id)}>
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Reply</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8ff' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: hs(16), paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: vs(16), backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { fontSize: ms(24), fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: ms(14), color: '#64748B', marginTop: vs(2) },
  content: { padding: ms(16), paddingBottom: vs(32) },
  card: {
    backgroundColor: '#FFF',
    borderRadius: ms(16),
    padding: ms(16),
    marginBottom: vs(16),
    shadowColor: '#94a3b8',
    shadowOpacity: 0.1,
    shadowRadius: ms(8),
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: vs(12) },
  subject: { fontSize: ms(12), fontWeight: '800', textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: hs(8), paddingVertical: vs(4), borderRadius: ms(12) },
  statusText: { fontSize: ms(10), fontWeight: 'bold', textTransform: 'uppercase' },
  studentName: { fontSize: ms(14), fontWeight: '600', marginBottom: vs(4) },
  questionText: { fontSize: ms(15), fontStyle: 'italic', marginBottom: vs(16), lineHeight: ms(22) },
  actionBtn: { alignSelf: 'flex-start', paddingVertical: vs(8), paddingHorizontal: hs(16), backgroundColor: '#EFF6FF', borderRadius: ms(20) },
  replyBox: { backgroundColor: '#F8FAFC', borderRadius: ms(12), padding: ms(12), borderWidth: 1, borderColor: '#E2E8F0' },
  input: { minHeight: vs(60), textAlignVertical: 'top', color: '#1E293B', fontSize: ms(14) },
  replyActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: vs(12) },
  cancelText: { color: '#64748B', fontWeight: '600', marginRight: hs(16) },
  sendBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: hs(16), paddingVertical: vs(8), borderRadius: ms(20) },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: ms(12) },
});
