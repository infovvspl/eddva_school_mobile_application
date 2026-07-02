import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from '../components/Icon';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { studyPlanService } from '../services/studyplan.service';
import type { RootStackParamList } from '../types/navigation';
import { asArray } from '../utils/apiData';
import { hs, ms, spacing, type as t, vs } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'StudyPlanWeakDetail'>;

const StudyPlanWeakDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId, areaId, title } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;

  const { data, loading } = useApi(
    () => studyPlanService.getWeakAreaItems(courseId, areaId),
    [courseId, areaId],
  );
  const items: any[] = asArray(data, ['items']);

  const practiceItem = (item: any) => {
    const topicId = item.topicId ? String(item.topicId) : String(item.id || '');
    const itemTitle = String(item.title || title);

    if (item.testId) {
      navigation.navigate('ExamEngine', {
        testId: String(item.testId),
        topicId,
        title: itemTitle,
        mode: 'mock',
      });
      return;
    }

    navigation.navigate('AIStudyRoom', { topicId, title: itemTitle });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={ms(18)} color={c.text} solid />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: vs(40) }} />
        ) : items.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: c.card, borderColor: c.border }]}>
            <Icon name="check-circle" size={ms(40)} color={c.success} solid />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No weak items</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              Great work — nothing flagged in this category right now.
            </Text>
          </View>
        ) : (
          items.map(item => (
            <View
              key={item.id}
              style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: c.text }]}>{item.title}</Text>
                <Text style={[styles.cardMeta, { color: c.textMuted }]}>
                  {item.subject} · {item.accuracy}% accuracy
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.practiceBtn, { backgroundColor: c.primary }]}
                onPress={() => practiceItem(item)}
              >
                <Text style={styles.practiceText}>Practice</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
  empty: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    gap: vs(10),
  },
  emptyTitle: { ...t.subheadBold },
  emptySub: { ...t.body, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: vs(10),
  },
  cardTitle: { ...t.bodyBold, marginBottom: vs(4) },
  cardMeta: { ...t.captionBold },
  practiceBtn: {
    paddingHorizontal: hs(14),
    paddingVertical: vs(10),
    borderRadius: BorderRadius.md,
  },
  practiceText: { ...t.captionBold, color: '#fff' },
});

export default StudyPlanWeakDetailScreen;
