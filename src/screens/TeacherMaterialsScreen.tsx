import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Platform, Alert, Image } from 'react-native';
import { ArrowLeft, FileText, FileImage, Plus, Wand2 } from 'lucide-react-native';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';
import { ms } from '../utils/responsive';

export function TeacherMaterialsScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await schoolApi.getMaterials();
        let records = [];
        if (Array.isArray(res)) records = res;
        else if (res && Array.isArray(res.data)) records = res.data;

        if (records.length === 0) {
          records = [
            { id: 'm1', title: 'Calculus Fundamentals', subject: 'Math', type: 'ppt', date: 'Today' },
            { id: 'm2', title: 'Photosynthesis Notes', subject: 'Biology', type: 'pdf', date: 'Yesterday' },
          ];
        }
        setMaterials(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const handleGeneratePPT = async () => {
    try {
      Alert.alert('AI PPT Generator', 'Generating a presentation on the current topic... This may take a minute.');
      await schoolApi.teacher.generatePPT({ topic: 'Calculus Fundamentals' });
      Alert.alert('Success', 'PPT generated successfully!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to generate PPT.');
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
            <Text style={[styles.title, { color: theme.text }]}>Materials</Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>Notes & Presentations</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]} onPress={handleGeneratePPT}>
          <Wand2 size={ms(24)} color="#3B82F6" style={{ marginBottom: 8 }} />
          <Text style={[styles.actionCardTitle, { color: '#1D4ED8' }]}>AI PPT</Text>
          <Text style={[styles.actionCardSubtitle, { color: '#60A5FA' }]}>Generate Slides</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE' }]}>
          <Plus size={ms(24)} color="#8B5CF6" style={{ marginBottom: 8 }} />
          <Text style={[styles.actionCardTitle, { color: '#5B21B6' }]}>Upload</Text>
          <Text style={[styles.actionCardSubtitle, { color: '#A78BFA' }]}>PDF or Doc</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Files</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : materials.length === 0 ? (
          <Text style={{ textAlign: 'center', color: theme.subtext, marginTop: 40 }}>No materials found.</Text>
        ) : (
          materials.map(item => (
          <View key={item.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.type === 'ppt' ? (
                  <FileImage size={ms(24)} color="#F59E0B" style={{ marginRight: 12 }} />
                ) : (
                  <FileText size={ms(24)} color="#EF4444" style={{ marginRight: 12 }} />
                )}
                <View>
                  <Text style={[styles.subject, { color: theme.primary }]}>{item.subject}</Text>
                  <Text style={[styles.materialTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.date, { color: theme.subtext }]}>{item.date}</Text>
                </View>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 16, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
  actionRow: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
  actionCard: { flex: 1, marginHorizontal: 4, borderRadius: 16, padding: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  actionCardTitle: { fontSize: 16, fontWeight: 'bold' },
  actionCardSubtitle: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#94a3b8',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subject: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 4 },
  materialTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  date: { fontSize: 12 },
});
