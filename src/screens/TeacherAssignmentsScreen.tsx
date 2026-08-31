import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { ms } from '../utils/responsive';

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
            <TouchableOpacity onPress={() => onNavigate && onNavigate('teacherDashboard')} style={{ marginRight: 12 }}>
              <ArrowLeft size={24} color={theme.text} />
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
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : assignments.length === 0 ? (
          <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: 40 }}>No assignments found.</Text>
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
  content: { padding: 16, paddingBottom: 32, paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  createBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  createBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 4 },
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
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  footer: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  stats: { fontSize: 13, fontWeight: '500' },
});
