import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { ArrowLeft, Users, TrendingUp } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { ms } from '../utils/responsive';

export function TeacherClassesScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await schoolApi.teacher.getClasses();
        let records = [];
        if (Array.isArray(res)) records = res;
        else if (res && Array.isArray(res.data)) records = res.data;

        if (records.length === 0) {
          records = [
            { id: 'c1', name: 'Class 10 A', subject: 'Mathematics', students: 40, avgScore: '85%' },
            { id: 'c2', name: 'Class 9 B', subject: 'Physics', students: 38, avgScore: '78%' },
          ];
        }
        setClasses(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => onNavigate && onNavigate('teacherDashboard')} style={{ marginRight: 12 }}>
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>My Classes</Text>
              <Text style={[styles.subtitle, { color: theme.subtext }]}>Assigned subjects and reports</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : classes.length === 0 ? (
          <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: 40 }}>No classes assigned.</Text>
        ) : (
          classes.map(item => (
          <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.subject, { color: theme.primary }]}>{item.subject}</Text>
                <Text style={[styles.assignmentTitle, { color: theme.text }]}>{item.name}</Text>
              </View>
            </View>
            <View style={styles.footer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Users size={ms(16)} color={theme.subtext} style={{ marginRight: 4 }} />
                <Text style={[styles.stats, { color: theme.subtext }]}>{item.students} Students</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TrendingUp size={ms(16)} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={[styles.stats, { color: '#10B981', fontWeight: 'bold' }]}>Avg {item.avgScore}</Text>
              </View>
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
  content: { padding: 16, paddingBottom: 32, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#94a3b8',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subject: { fontSize: 12, fontWeight: '800', color: '#4F46E5', textTransform: 'uppercase', marginBottom: 4 },
  assignmentTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  footer: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stats: { fontSize: 13, fontWeight: '500' },
});
