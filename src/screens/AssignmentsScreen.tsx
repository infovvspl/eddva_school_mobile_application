import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

export function AssignmentsScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);
  
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await schoolApi.getAssignments();
        let records = [];
        if (Array.isArray(res)) records = res;
        else if (res && Array.isArray(res.data)) records = res.data;
        else if (res && Array.isArray(res.assignments)) records = res.assignments;

        if (records.length === 0) {
          records = [
            { id: 'a1', subject: 'Mathematics', title: 'Algebra Worksheet Ch. 4', status: 'pending', dueDate: 'Tomorrow' },
            { id: 'a2', subject: 'Physics', title: 'Lab Report: Refraction', status: 'pending', dueDate: 'Next Week' },
            { id: 'a3', subject: 'English', title: 'Essay: My Favourite Book', status: 'submitted', dueDate: 'Submitted' },
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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('dashboard')} style={{ marginRight: 12 }}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Assignments</Text>
          <Text style={[styles.subtitle, { color: theme.subtext, marginBottom: 0 }]}>Stay on top of your work</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : assignments.length === 0 ? (
        <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: 40 }}>No assignments found.</Text>
      ) : (
        assignments.map(item => (
        <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.subject, { color: theme.primary }]}>{item.subject}</Text>
              <Text style={[styles.assignmentTitle, { color: theme.text }]}>{item.title}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'pending' ? '#FEF3C7' : '#D1FAE5' }]}>
              <Text style={[styles.statusText, { color: item.status === 'pending' ? '#D97706' : '#059669' }]}>
                {item.status}
              </Text>
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={[styles.dueDate, { color: theme.subtext }]}>Status: {item.status}</Text>
          </View>
        </View>
        ))
      )}
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8ff' },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 14 },
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  subject: { fontSize: 12, fontWeight: '800', color: '#4F46E5', textTransform: 'uppercase', marginBottom: 4 },
  assignmentTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  footer: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  dueDate: { fontSize: 12, color: '#64748B', fontWeight: '500' }
});
