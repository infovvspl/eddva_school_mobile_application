import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { ArrowLeft, Image as ImageIcon, Sparkles, Send, ChevronDown } from 'lucide-react-native';
import { hs, vs, ms } from '../utils/responsive';
import { useAppTheme } from '../context/ThemeContext';
import { schoolApi } from '../utils/api';

export function AskDoubtScreen({ onNavigate }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (type: string) => {
    if (question.length < 10) {
      Alert.alert('Error', 'Please enter a longer question.');
      return;
    }
    setIsSubmitting(true);
    try {
      await schoolApi.createDoubt({ question, type });
      Alert.alert('Success', 'Doubt submitted successfully!');
      onNavigate('doubt');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit doubt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('doubt')} style={styles.backBtn}>
          <ArrowLeft size={ms(20)} color={theme.text} />
        </TouchableOpacity>
        <View style={{ marginLeft: hs(12) }}>
          <Text style={styles.headerTitle}>Ask a Doubt</Text>
          <Text style={styles.headerSubtitle}>Get instant help from AI or send your question to your subject teacher.</Text>
          <View style={styles.classBadge}>
            <Text style={styles.classBadgeText}>Class 10 • Section A</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <View style={styles.dropdownCol}>
            <Text style={styles.label}>SUBJECT (OPTIONAL)</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>General / any subject</Text>
              <ChevronDown size={ms(16)} color={theme.subtext} />
            </TouchableOpacity>
          </View>
          <View style={styles.dropdownCol}>
            <Text style={styles.label}>TEACHER (FOR DIRECT ASK)</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>Auto-assign (class / subject teacher)</Text>
              <ChevronDown size={ms(16)} color={theme.subtext} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>YOUR QUESTION</Text>
          <TextInput 
            style={styles.textArea}
            placeholder="Describe what you are stuck on (text or image, min. 10 characters if text only)..."
            placeholderTextColor="#94A3B8"
            multiline
            textAlignVertical="top"
            value={question}
            onChangeText={setQuestion}
            editable={!isSubmitting}
          />
        </View>

        <TouchableOpacity style={styles.attachBtn} disabled={isSubmitting}>
          <ImageIcon size={ms(14)} color={theme.subtext} />
          <Text style={styles.attachBtnText}>Attach question image</Text>
        </TouchableOpacity>

        {isSubmitting ? (
          <View style={{ marginTop: vs(20), alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ marginTop: 8, color: theme.subtext }}>Submitting...</Text>
          </View>
        ) : (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#C4B5FD' }]} onPress={() => handleSubmit('ai')}>
              <Sparkles size={ms(16)} color={theme.surface} />
              <Text style={styles.actionBtnText}>Ask AI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#93C5FD' }]} onPress={() => handleSubmit('teacher')}>
              <Send size={ms(16)} color={theme.surface} />
              <Text style={styles.actionBtnText}>Ask Teacher</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <Text style={styles.footerNote}>AI ANSWERS INSTANTLY • TEACHER REPLIES WHEN AVAILABLE</Text>
      </ScrollView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + vs(10) : vs(60),
    paddingHorizontal: hs(20),
    paddingBottom: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backBtn: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    backgroundColor: theme.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(4),
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: '700',
    color: theme.text,
    marginBottom: vs(4),
  },
  headerSubtitle: {
    fontSize: ms(12),
    color: theme.subtext,
    marginBottom: vs(12),
    maxWidth: '90%',
  },
  classBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(6),
    alignSelf: 'flex-start',
  },
  classBadgeText: {
    fontSize: ms(11),
    color: theme.primary,
    fontWeight: '600',
  },
  content: {
    padding: ms(20),
  },
  row: {
    flexDirection: 'row',
    gap: ms(16),
    marginBottom: vs(20),
  },
  dropdownCol: {
    flex: 1,
  },
  label: {
    fontSize: ms(10),
    fontWeight: '700',
    color: theme.subtext,
    letterSpacing: 0.5,
    marginBottom: vs(8),
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: ms(8),
    paddingHorizontal: hs(12),
    paddingVertical: vs(12),
  },
  dropdownText: {
    fontSize: ms(12),
    color: theme.text,
    flex: 1,
  },
  inputSection: {
    marginBottom: vs(16),
  },
  textArea: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: ms(8),
    padding: ms(16),
    height: vs(150),
    fontSize: ms(14),
    color: theme.text,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: hs(12),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    gap: ms(6),
    marginBottom: vs(32),
  },
  attachBtnText: {
    fontSize: ms(12),
    color: theme.subtext,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: ms(16),
    marginBottom: vs(16),
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(14),
    borderRadius: ms(12),
    gap: ms(8),
  },
  actionBtnText: {
    color: theme.surface,
    fontSize: ms(14),
    fontWeight: '600',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: ms(10),
    color: theme.subtext,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
