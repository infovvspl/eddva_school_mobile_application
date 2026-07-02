import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import EDDVAScreenHeader from '../../components/EDDVAScreenHeader';
import MarkdownRenderer from '../../components/learning/MarkdownRenderer';
import Icon from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import { RootStackParamList } from '../../types/navigation';
import { font, hs, ms, spacing, type as t, vs } from '../../utils/responsive';
import { BorderRadius, Shadow } from '../../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AIStudyRoom'>;

const AIStudyRoomScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const title = route.params?.title || 'Photoelectric Effect';
  const [fontSize, setFontSize] = useState(15);
  const [completed, setCompleted] = useState(false);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <EDDVAScreenHeader title="Topic Workspace" subtitle="AI Study" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerArea}>
          <View style={[styles.guidedNotesPill, { backgroundColor: c.chipBg }]}>
            <Icon name="book-open" size={ms(12)} color={c.textMuted} solid />
            <Text style={[styles.guidedNotesText, { color: c.textMuted }]}>GUIDED NOTES</Text>
          </View>
          
          <Text style={[styles.mainTitle, { color: c.text }]}>Study the notes carefully</Text>
          <Text style={[styles.mainSub, { color: c.textMuted }]}>
            Use zoom controls for comfortable reading, then annotate the parts you want to revise later.
          </Text>
        </View>

        <View style={styles.controlsRow}>
          <View style={[styles.zoomGroup, { borderColor: c.border }]}>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => setFontSize(f => Math.max(12, f - 1))}>
              <Text style={[styles.zoomText, { color: c.textMuted }]}>A-</Text>
            </TouchableOpacity>
            <View style={[styles.zoomDivider, { backgroundColor: c.border }]} />
            <View style={styles.zoomBtnCenter}>
              <Text style={[styles.zoomTextVal, { color: c.primary }]}>100%</Text>
            </View>
            <View style={[styles.zoomDivider, { backgroundColor: c.border }]} />
            <TouchableOpacity style={styles.zoomBtn} onPress={() => setFontSize(f => Math.min(20, f + 1))}>
              <Text style={[styles.zoomText, { color: c.textMuted }]}>A+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.flashcardBtn, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Icon name="layer-group" size={ms(12)} color="#059669" solid />
            <Text style={[styles.flashcardText, { color: '#064E3B' }]}>Flashcards</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.topicHeading, { color: c.text }]}>{title}</Text>

        <MarkdownRenderer
          content={`## 🎯 What You'll Learn\n\nThe photoelectric effect is a fundamental concept in modern physics that explains how light can eject electrons from the surface of a material. This topic is crucial for JEE_MAINS as it tests a student's understanding of the behavior of light and matter at the atomic level.\n\n## 📚 Introduction & Background\n\nThe photoelectric effect is a phenomenon where light hitting a metal surface can cause electrons to be ejected. Classical physics couldn't explain this, leading to the quantum revolution.`}
          paragraphStyle={{ color: c.text, fontSize, lineHeight: fontSize * 1.6, fontWeight: '500' }}
        />
      </ScrollView>

      {/* Floating Bottom Footer Toolkit */}
      <View style={[styles.footer, { backgroundColor: c.card, borderTopColor: c.border }, Shadow.nav]}>
        <View style={styles.footerRow}>
          
          <View style={styles.footerSection}>
             <Text style={[styles.footerTitle, { color: c.textMuted }]}>Study toolkit</Text>
             <View style={styles.toolkitBtns}>
               <TouchableOpacity style={[styles.toolBtn, { borderColor: c.border }]}>
                 <Text style={[styles.toolText, { color: c.text }]}>Highlight</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.toolBtn, { borderColor: c.border }]}>
                 <Text style={[styles.toolText, { color: c.text }]}>Comment</Text>
               </TouchableOpacity>
             </View>
          </View>
          
          <View style={styles.footerDivider} />
          
          <View style={styles.footerSection}>
             <Text style={[styles.footerTitle, { color: c.textMuted }]}>Session progress</Text>
             <TouchableOpacity 
                style={[styles.completeBtn, { backgroundColor: completed ? c.success : c.primary }]}
                onPress={() => setCompleted(!completed)}
             >
                <Icon name={completed ? "check" : "trophy"} size={ms(12)} color="#fff" solid />
                <Text style={styles.completeBtnText}>{completed ? "Topic Completed" : "Mark complete"}</Text>
             </TouchableOpacity>
          </View>
          
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  body: { padding: spacing.lg, paddingBottom: vs(120) },
  
  headerArea: { marginBottom: vs(20) },
  guidedNotesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    alignSelf: 'flex-start',
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: 16,
    marginBottom: vs(12),
  },
  guidedNotesText: { ...t.microBold, letterSpacing: 1 },
  mainTitle: { ...t.headline, marginBottom: vs(8) },
  mainSub: { ...t.body, lineHeight: ms(20) },
  
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(24),
    paddingBottom: vs(24),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  zoomGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  zoomBtn: {
    paddingHorizontal: hs(14),
    paddingVertical: vs(6),
  },
  zoomBtnCenter: {
    paddingHorizontal: hs(14),
    paddingVertical: vs(6),
  },
  zoomText: { ...t.captionBold },
  zoomTextVal: { ...t.captionBold },
  zoomDivider: { width: 1, height: '100%' },
  
  flashcardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    borderWidth: 1,
    paddingHorizontal: hs(14),
    paddingVertical: vs(6),
    borderRadius: 20,
  },
  flashcardText: { ...t.captionBold },
  
  topicHeading: { ...t.title, marginBottom: vs(16) },
  
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingBottom: vs(24),
    paddingTop: vs(16),
    paddingHorizontal: hs(16),
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerSection: {
    flex: 1,
  },
  footerDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: hs(12),
  },
  footerTitle: { ...t.microBold, textTransform: 'uppercase', marginBottom: vs(10), letterSpacing: 0.5 },
  toolkitBtns: { flexDirection: 'row', gap: hs(8), flexWrap: 'wrap' },
  toolBtn: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderRadius: 16,
    borderWidth: 1,
  },
  toolText: { ...t.captionBold },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(6),
    paddingVertical: vs(8),
    borderRadius: 20,
  },
  completeBtnText: { ...t.captionBold, color: '#fff' },
});

export default AIStudyRoomScreen;
