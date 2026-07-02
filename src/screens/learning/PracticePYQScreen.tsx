import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import EDDVAScreenHeader from '../../components/EDDVAScreenHeader';
import { useTheme } from '../../context/ThemeContext';
import { useApi } from '../../hooks/useApi';
import { assessmentService } from '../../services/assessment.service';
import { mapPyqTopics, mapSessionQuestions } from '../../utils/assessmentMappers';
import { RootStackParamList } from '../../types/navigation';
import { font, spacing, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'PracticePYQ'>;

const PracticePYQScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const [starting, setStarting] = useState<string | null>(null);

  const { data, loading, refetch } = useApi(() => assessmentService.getProgressOverview(), []);
  const topics = mapPyqTopics(data);

  const startTopic = async (topic: { topicId: string; name: string }) => {
    setStarting(topic.topicId);
    try {
      const { data: sessionData } = await assessmentService.startPyqSession(topic.topicId);
      const sessionId = String(
        (sessionData as Record<string, unknown>)?.sessionId ||
          (sessionData as Record<string, unknown>)?.id ||
          '',
      );
      const mapped = mapSessionQuestions(sessionData);
      if (!mapped.length && !sessionId) {
        Alert.alert(
          'No PYQ available',
          'This topic has no previous-year questions on the server yet.',
        );
        return;
      }
      navigation.navigate('ExamEngine', {
        testId: sessionId || topic.topicId,
        sessionId: sessionId || undefined,
        title: `PYQ · ${topic.name}`,
        topicId: topic.topicId,
        mode: 'pyq',
      });
    } catch {
      navigation.navigate('ExamEngine', {
        testId: topic.topicId,
        title: `PYQ · ${topic.name}`,
        topicId: topic.topicId,
        mode: 'pyq',
      });
    } finally {
      setStarting(null);
    }
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <EDDVAScreenHeader title="Practice PYQ" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={c.primary} />
        }
      >
        <Text style={[styles.hint, { color: c.textMuted }]}>
          Previous-year questions from your enrolled topics. Pull to refresh.
        </Text>
        {loading && topics.length === 0 ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: vs(40) }} />
        ) : topics.length === 0 ? (
          <Text style={[styles.empty, { color: c.textMuted }]}>
            No PYQ topics yet. Open a course topic — PYQ sets load from the server when
            available.
          </Text>
        ) : (
          topics.map(t => (
            <TouchableOpacity
              key={t.topicId}
              style={[styles.row, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => startTopic(t)}
              activeOpacity={0.9}
              disabled={starting === t.topicId}
            >
              <View>
                <Text style={[styles.name, { color: c.text }]}>{t.name}</Text>
                <Text style={[styles.meta, { color: c.textMuted }]}>
                  {t.attempts} attempts · {t.accuracy}% accuracy
                </Text>
              </View>
              {starting === t.topicId ? (
                <ActivityIndicator color={c.primary} />
              ) : (
                <Text style={[styles.start, { color: c.primary }]}>Start</Text>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  scroll: { padding: spacing.md },
  hint: { fontSize: font.caption, marginBottom: vs(14), lineHeight: vs(20) },
  empty: { textAlign: 'center', marginTop: vs(40), fontSize: font.body, lineHeight: vs(24) },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: vs(10),
  },
  name: { fontSize: font.subhead, fontWeight: '800' },
  meta: { fontSize: font.caption, marginTop: vs(4) },
  start: { fontSize: font.caption, fontWeight: '800' },
});

export default PracticePYQScreen;
