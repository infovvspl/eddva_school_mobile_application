import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { ArrowLeft, PlayCircle, Cpu } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { hs, vs, ms } from '../utils/responsive';

export function TeacherRecordingsScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  
  const [loading, setLoading] = useState(true);
  const [recordings, setRecordings] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const res = await schoolApi.teacher.getRecordings('me');
        let records = [];
        if (Array.isArray(res)) records = res;
        else if (res && Array.isArray(res.data)) records = res.data;

        if (records.length === 0) {
          records = [
            { id: 'r1', subject: 'Mathematics', title: 'Algebra Chapter 4', duration: '45 mins', date: 'Today, 10:00 AM' },
            { id: 'r2', subject: 'Physics', title: 'Refraction Lab', duration: '1 hr 10 mins', date: 'Yesterday, 1:00 PM' },
          ];
        }
        setRecordings(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecordings();
  }, []);

  const handleAnalyze = async (recordingId: string) => {
    try {
      Alert.alert('AI Analysis', 'Generating notes and quizzes from this recording...');
      await schoolApi.teacher.analyzeRecording('me', recordingId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => onNavigate && onNavigate('teacherDashboard')} style={{ marginRight: hs(12) }}>
              <ArrowLeft size={ms(24)} color={theme.text} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Recordings</Text>
              <Text style={[styles.subtitle, { color: theme.subtext }]}>Manage your class lectures</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : recordings.length === 0 ? (
          <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: vs(40) }}>No recordings found.</Text>
        ) : (
          recordings.map(item => (
          <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <PlayCircle size={ms(24)} color={theme.primary} style={{ marginRight: hs(10) }} />
                <View>
                  <Text style={[styles.subject, { color: theme.primary }]}>{item.subject}</Text>
                  <Text style={[styles.assignmentTitle, { color: theme.text }]}>{item.title}</Text>
                </View>
              </View>
            </View>
            <View style={styles.footer}>
              <Text style={[styles.stats, { color: theme.subtext }]}>
                {item.date} • {item.duration}
              </Text>
              <TouchableOpacity onPress={() => handleAnalyze(item.id)} style={[styles.actionBtn, { backgroundColor: '#F5F3FF' }]}>
                <Cpu size={ms(16)} color="#8B5CF6" />
                <Text style={{ color: '#8B5CF6', fontWeight: 'bold', marginLeft: hs(4), fontSize: ms(12) }}>AI Analyze</Text>
              </TouchableOpacity>
            </View>
          </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8ff' },
  content: { padding: ms(16), paddingBottom: vs(32), paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: vs(20) },
  title: { fontSize: ms(24), fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: ms(14), color: '#64748B', marginTop: vs(2) },
  card: {
    backgroundColor: '#FFF',
    borderRadius: ms(18),
    padding: ms(16),
    marginBottom: vs(16),
    shadowColor: '#94a3b8',
    shadowOpacity: 0.15,
    shadowRadius: ms(12),
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subject: { fontSize: ms(12), fontWeight: '800', color: '#4F46E5', textTransform: 'uppercase', marginBottom: vs(4) },
  assignmentTitle: { fontSize: ms(16), fontWeight: '700', color: '#1E293B', marginBottom: vs(12) },
  footer: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: vs(12), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stats: { fontSize: ms(13), fontWeight: '500' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: hs(12), paddingVertical: vs(6), borderRadius: ms(12) },
});
