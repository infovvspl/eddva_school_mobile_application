import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from '../components/Icon';
import { BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { studyPlanService } from '../services/studyplan.service';
import type { RootStackParamList } from '../types/navigation';
import { hs, ms, spacing, type as t, vs } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'StudyPlanManage'>;

const StudyPlanManageScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId, examType } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const [busy, setBusy] = useState<'regen' | 'reset' | null>(null);

  const handleRegenerate = async () => {
    setBusy('regen');
    try {
      await studyPlanService.regeneratePlan(courseId, { targetExam: examType });
      Alert.alert('Done', 'Your study plan was regenerated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not regenerate');
    } finally {
      setBusy(null);
    }
  };

  const handleReset = () => {
    Alert.alert('Reset plan?', 'This clears your current study plan.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          setBusy('reset');
          try {
            await studyPlanService.resetPlan(courseId);
            Alert.alert('Reset', 'Plan cleared. Generate a new plan from Today.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } finally {
            setBusy(null);
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={ms(18)} color={c.text} solid />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Manage Plan</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.lead, { color: c.textMuted }]}>
          Update or restart your monthly {examType} study plan.
        </Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Icon name="sync" size={ms(24)} color={c.primary} solid />
          <Text style={[styles.cardTitle, { color: c.text }]}>Regenerate Plan</Text>
          <Text style={[styles.cardDesc, { color: c.textMuted }]}>
            Refresh today&apos;s tasks with the next topics from your roadmap.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: c.primary }, busy === 'regen' && { opacity: 0.6 }]}
            onPress={handleRegenerate}
            disabled={!!busy}
          >
            {busy === 'regen' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Regenerate Plan</Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Icon name="undo" size={ms(24)} color={c.danger} solid />
          <Text style={[styles.cardTitle, { color: c.text }]}>Reset & Start Fresh</Text>
          <Text style={[styles.cardDesc, { color: c.textMuted }]}>
            Remove your current plan and start over from the Today tab.
          </Text>
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: c.danger }, busy === 'reset' && { opacity: 0.6 }]}
            onPress={handleReset}
            disabled={!!busy}
          >
            {busy === 'reset' ? (
              <ActivityIndicator color={c.danger} />
            ) : (
              <Text style={[styles.outlineBtnText, { color: c.danger }]}>Reset Plan</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    gap: hs(12),
  },
  backBtn: { padding: ms(4) },
  headerTitle: { ...t.subheadBold, flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: vs(48) },
  lead: { ...t.body, marginBottom: vs(20), lineHeight: ms(24) },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(16),
    alignItems: 'flex-start',
    gap: vs(8),
  },
  cardTitle: { ...t.bodyBold },
  cardDesc: { ...t.caption, lineHeight: ms(22), marginBottom: vs(8) },
  primaryBtn: {
    width: '100%',
    paddingVertical: vs(14),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginTop: vs(4),
  },
  primaryBtnText: { ...t.bodyBold, color: '#fff' },
  outlineBtn: {
    width: '100%',
    paddingVertical: vs(14),
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    marginTop: vs(4),
  },
  outlineBtnText: { ...t.bodyBold },
});

export default StudyPlanManageScreen;
