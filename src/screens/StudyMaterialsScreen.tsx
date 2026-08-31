import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Platform, StatusBar, SafeAreaView } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { BookOpen, FileText, Download, ChevronLeft } from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

export function StudyMaterialsScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const mat = await schoolApi.getMaterials();
        let records = [];
        if (Array.isArray(mat)) records = mat;
        else if (mat && Array.isArray(mat.data)) records = mat.data;
        else if (mat && Array.isArray(mat.materials)) records = mat.materials;
        else if (mat && Array.isArray(mat.results)) records = mat.results;
        setMaterials(records);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownload = async (item: any) => {
    Alert.alert('Downloading', `Starting download for ${item.title || 'Document'}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('dashboard')}>
          <ChevronLeft size={ms(24)} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Materials</Text>
        <View style={{ width: ms(32) }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={{ backgroundColor: theme.background }}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : (
          <View style={{ marginTop: vs(16) }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>ALL MATERIALS</Text>
            </View>
            
            {materials.length === 0 ? (
              <View style={styles.emptyCard}><Text style={styles.emptyText}>No materials available.</Text></View>
            ) : (
              materials.map((item: any, idx: number) => (
                <View key={idx} style={styles.materialCard}>
                  <View style={styles.materialIcon}>
                    <FileText size={ms(24)} color={theme.primary} />
                  </View>
                  <View style={styles.materialInfo}>
                    <Text style={styles.materialTitle}>{item.title || 'Study Material'}</Text>
                    <Text style={styles.materialSub}>{item.subject || 'General'} • {item.size || '1.2 MB'}</Text>
                  </View>
                  <TouchableOpacity style={styles.downloadBtn} onPress={() => onNavigate('pdfViewer')}>
                    <Download size={ms(20)} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    paddingVertical: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface
  },
  backBtn: {
    padding: ms(4),
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: ms(18),
    color: theme.text,
  },
  content: {
    padding: ms(16),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  sectionTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: ms(12),
    color: theme.subtext,
    letterSpacing: 1,
  },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: ms(16),
    borderRadius: ms(16),
    marginBottom: vs(12),
    borderWidth: 1,
    borderColor: theme.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  materialIcon: {
    width: hs(48),
    height: vs(48),
    borderRadius: ms(12),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hs(16),
  },
  materialInfo: {
    flex: 1,
  },
  materialTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: ms(14),
    color: theme.text,
    marginBottom: vs(2),
  },
  materialSub: {
    fontFamily: 'Poppins-Medium',
    fontSize: ms(12),
    color: theme.subtext,
  },
  downloadBtn: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    backgroundColor: theme.surface,
    padding: ms(24),
    borderRadius: ms(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: 'Poppins-Medium',
    color: theme.subtext,
    fontSize: ms(14),
  },
});
