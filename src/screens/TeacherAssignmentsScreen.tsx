import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { hs, vs, ms } from '../utils/responsive';

export function TeacherAssignmentsScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await schoolApi.teacher.getAssignments();
        let records = [];
        if (Array.isArray(res)) records = res;
        else if (res && Array.isArray(res.data)) records = res.data;
        else if (res && Array.isArray(res.assignments)) records = res.assignments;

        if (records.length === 0) {
          records = [
            { id: 'a1', subject: 'Mathematics', title: 'Algebra Worksheet Ch. 4', submissions: 32, total: 40, status: 'Active' },
            { id: 'a2', subject: 'Physics', title: 'Lab Report: Refraction', submissions: 15, total: 40, status: 'Active' },
            { id: 'a3', subject: 'English', title: 'Essay: My Favourite Book', submissions: 40, total: 40, status: 'Grading' },
          ];
        }
        setAssignments(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => onNavigate && onNavigate('teacherDashboard')} style={{ marginRight: hs(12) }}>
              <ArrowLeft size={ms(24)} color={theme.text} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Assignments</Text>
              <Text style={[styles.subtitle, { color: theme.subtext }]}>Manage class homework</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.createBtn, { backgroundColor: theme.primary }]}>
            <Plus size={ms(18)} color="#fff" />
            <Text style={styles.createBtnText}>Create</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : assignments.length === 0 ? (
          <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: vs(40) }}>No assignments found.</Text>
        ) : (
          assignments.map(item => (
          <TouchableOpacity key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={[styles.subject, { color: theme.primary }]}>{item.subject}</Text>
                <Text style={[styles.assignmentTitle, { color: theme.text }]}>{item.title}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? '#D1FAE5' : '#FEF3C7' }]}>
                <Text style={[styles.statusText, { color: item.status === 'Active' ? '#059669' : '#D97706' }]}>
                  {item.status}
                </Text>
              </View>
            </View>
            <View style={styles.footer}>
              <Text style={[styles.stats, { color: theme.subtext }]}>
                Submissions: {item.submissions} / {item.total}
              </Text>
            </View>
          </TouchableOpacity>
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
  createBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: hs(12), paddingVertical: vs(8), borderRadius: ms(20) },
  createBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: hs(4) },
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
  statusBadge: { paddingHorizontal: hs(10), paddingVertical: vs(4), borderRadius: ms(12) },
  statusText: { fontSize: ms(12), fontWeight: '700' },
  footer: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: vs(12) },
  stats: { fontSize: ms(13), fontWeight: '500' },
});
