import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { ArrowLeft, Check, X, Clock } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { ms } from '../utils/responsive';

export function TeacherAttendanceScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present'|'absent'|'late'>>({});

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await schoolApi.getClassStudents('class-10a');
        let records = [];
        if (Array.isArray(res)) records = res;
        else if (res && Array.isArray(res.data)) records = res.data;

        if (records.length === 0) {
          records = [
            { id: 's1', name: 'Alice Smith', rollNo: '101' },
            { id: 's2', name: 'Bob Johnson', rollNo: '102' },
            { id: 's3', name: 'Charlie Brown', rollNo: '103' },
            { id: 's4', name: 'Diana Prince', rollNo: '104' },
          ];
        }
        setStudents(records);
        // Default everyone to present
        const defaultAtt: any = {};
        records.forEach((s: any) => { defaultAtt[s.id] = 'present'; });
        setAttendance(defaultAtt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleStatusChange = (studentId: string, status: 'present'|'absent'|'late') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    try {
      Alert.alert('Submitting...', 'Saving attendance records.');
      await schoolApi.teacher.markAttendanceSession({ classId: 'class-10a', attendance });
      Alert.alert('Success', 'Attendance marked successfully!');
      if (onNavigate) onNavigate('teacherDashboard');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit attendance.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('teacherDashboard')} style={{ marginRight: 12 }}>
            <ArrowLeft size={24} color={theme.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Attendance</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>Class 10 A • Today</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={submitAttendance}>
          <Text style={styles.submitBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : students.length === 0 ? (
          <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: 40 }}>No students found.</Text>
        ) : (
          students.map(student => (
          <View key={student.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.studentInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={[styles.studentName, { color: theme.text }]}>{student.name}</Text>
                <Text style={[styles.rollNo, { color: theme.subtext }]}>Roll No: {student.rollNo}</Text>
              </View>
            </View>
            <View style={styles.actionGroup}>
              <TouchableOpacity 
                style={[styles.statusBtn, attendance[student.id] === 'present' && styles.presentActive]} 
                onPress={() => handleStatusChange(student.id, 'present')}
              >
                <Check size={ms(18)} color={attendance[student.id] === 'present' ? '#fff' : '#64748B'} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.statusBtn, attendance[student.id] === 'late' && styles.lateActive]} 
                onPress={() => handleStatusChange(student.id, 'late')}
              >
                <Clock size={ms(18)} color={attendance[student.id] === 'late' ? '#fff' : '#64748B'} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.statusBtn, attendance[student.id] === 'absent' && styles.absentActive]} 
                onPress={() => handleStatusChange(student.id, 'absent')}
              >
                <X size={ms(18)} color={attendance[student.id] === 'absent' ? '#fff' : '#64748B'} />
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 16, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  submitBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
  content: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#94a3b8',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#475569' },
  studentName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  rollNo: { fontSize: 12, color: '#64748B', marginTop: 2 },
  actionGroup: { flexDirection: 'row' },
  statusBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  presentActive: { backgroundColor: '#10B981' },
  lateActive: { backgroundColor: '#F59E0B' },
  absentActive: { backgroundColor: '#EF4444' },
});
