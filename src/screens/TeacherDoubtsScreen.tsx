import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform, TextInput, Alert, KeyboardAvoidingView } from 'react-native';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { ms, vs } from '../utils/responsive';

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
          <TouchableOpacity onPress={() => onNavigate && onNavigate('teacherDashboard')} style={{ marginRight: 12 }}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Student Doubts</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>Respond to escalated queries</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : doubts.length === 0 ? (
          <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: 40 }}>No doubts found.</Text>
        ) : (
          doubts.map(doubt => (
          <View key={doubt.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MessageCircle size={ms(20)} color={theme.primary} style={{ marginRight: 8 }} />
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
                        <Send size={ms(14)} color="#fff" style={{ marginRight: 4 }} />
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 16, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#94a3b8',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subject: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  studentName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  questionText: { fontSize: 15, fontStyle: 'italic', marginBottom: 16, lineHeight: 22 },
  actionBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#EFF6FF', borderRadius: 20 },
  replyBox: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  input: { minHeight: 60, textAlignVertical: 'top', color: '#1E293B', fontSize: 14 },
  replyActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 12 },
  cancelText: { color: '#64748B', fontWeight: '600', marginRight: 16 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  sendBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
