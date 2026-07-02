import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/Icon';
import { Brand } from '../constants/brand';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { studyPlanService } from '../services/studyplan.service';
import type { RootStackParamList } from '../types/navigation';
import { asArray } from '../utils/apiData';
import { font, hs, ms, spacing, type as t, vs } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'RevisionNotes'>;

type NoteCard = {
  id: string;
  topicName: string;
  subject: string;
  keyPoints: string[];
  formulae?: string[];
  mnemonics?: string;
  lastReviewed?: string;
};

/** Map raw API data → NoteCard array */
const mapNotes = (raw: unknown): NoteCard[] => {
  if (!raw) return [];
  const items = asArray(raw, ['notes', 'cards', 'items', 'topics']);
  return items.map((item: any, i: number) => ({
    id: String(item.id ?? item.topicId ?? i),
    topicName: String(item.topicName ?? item.name ?? item.title ?? 'Topic'),
    subject: String(item.subject ?? item.subjectName ?? ''),
    keyPoints: asArray(item.keyPoints ?? item.points ?? item.bullets, []),
    formulae: asArray(item.formulae ?? item.formulas, []),
    mnemonics: item.mnemonics ?? item.mnemonic,
    lastReviewed: item.lastReviewed ?? item.updatedAt,
  }));
};

const RevisionNotesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { courseId } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch AI-generated revision notes from the revision/notes endpoint
  const { data, loading } = useApi(
    () => studyPlanService.getRevisionNotes(courseId),
    [courseId],
  );

  const allNotes: NoteCard[] = mapNotes(data);
  const notes = search.trim()
    ? allNotes.filter(
        n =>
          n.topicName.toLowerCase().includes(search.toLowerCase()) ||
          n.subject.toLowerCase().includes(search.toLowerCase()),
      )
    : allNotes;

  const toggle = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <View style={[styles.container, { backgroundColor: c.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={ms(18)} color={c.text} solid />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: c.text }]}>AI Revision Notes</Text>
          <Text style={[styles.headerSub, { color: c.textMuted }]}>
            Smart summaries · Key formulae · Mnemonics
          </Text>
        </View>
        <View style={[styles.aiPill, { backgroundColor: `${c.primary}18` }]}>
          <Icon name="robot" size={ms(12)} color={c.primary} solid />
          <Text style={[styles.aiPillText, { color: c.primary }]}>AI</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: c.card, borderColor: c.border }]}>
        <Icon name="search" size={ms(14)} color={c.textMuted} solid />
        <TextInput
          style={[styles.searchInput, { color: c.text }]}
          placeholder="Search topics…"
          placeholderTextColor={c.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="times" size={ms(14)} color={c.textMuted} solid />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={c.primary} style={{ marginTop: vs(60) }} />
      ) : notes.length === 0 ? (
        <View style={styles.emptyWrap}>
          <LinearGradient colors={[Brand.blue900, Brand.blue700]} style={styles.emptyGradient}>
            <Icon name="file-alt" size={ms(48)} color="rgba(255,255,255,0.9)" solid />
            <Text style={styles.emptyTitle}>
              {search ? 'No matches' : 'No revision notes yet'}
            </Text>
            <Text style={styles.emptySub}>
              {search
                ? 'Try a different topic or subject name.'
                : 'Complete more of your study plan. AI-generated notes appear here as you progress.'}
            </Text>
          </LinearGradient>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.countText, { color: c.textMuted }]}>
            {notes.length} note sheet{notes.length !== 1 ? 's' : ''}
          </Text>
          {notes.map(note => {
            const open = expandedId === note.id;
            return (
              <View
                key={note.id}
                style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
              >
                {/* Card header */}
                <TouchableOpacity style={styles.cardHeader} onPress={() => toggle(note.id)} activeOpacity={0.85}>
                  <View style={[styles.iconWrap, { backgroundColor: `${c.primary}18` }]}>
                    <Icon name="file-alt" size={ms(18)} color={c.primary} solid />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.topicName, { color: c.text }]} numberOfLines={open ? undefined : 1}>
                      {note.topicName}
                    </Text>
                    {note.subject ? (
                      <Text style={[styles.subjectName, { color: c.textMuted }]}>{note.subject}</Text>
                    ) : null}
                  </View>
                  <Icon
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={ms(12)}
                    color={c.textMuted}
                    solid
                  />
                </TouchableOpacity>

                {/* Expanded content */}
                {open && (
                  <View style={[styles.cardBody, { borderTopColor: c.border }]}>
                    {note.keyPoints.length > 0 && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Icon name="list" size={ms(12)} color={c.primary} solid />
                          <Text style={[styles.sectionTitle, { color: c.text }]}>Key Points</Text>
                        </View>
                        {note.keyPoints.map((pt, i) => (
                          <View key={i} style={styles.bulletRow}>
                            <View style={[styles.bullet, { backgroundColor: c.primary }]} />
                            <Text style={[styles.bulletText, { color: c.text }]}>{pt}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {(note.formulae ?? []).length > 0 && (
                      <View style={[styles.section, styles.formulaeBox, { backgroundColor: `${Brand.blue900}18`, borderColor: `${Brand.blue900}30` }]}>
                        <View style={styles.sectionHeader}>
                          <Icon name="square-root-alt" size={ms(12)} color={Brand.blue700} solid />
                          <Text style={[styles.sectionTitle, { color: Brand.blue700 }]}>Formulae</Text>
                        </View>
                        {(note.formulae ?? []).map((f, i) => (
                          <Text key={i} style={[styles.formulaText, { color: c.text }]}>
                            {f}
                          </Text>
                        ))}
                      </View>
                    )}

                    {note.mnemonics ? (
                      <View style={[styles.section, styles.mnemonicBox, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
                        <View style={styles.sectionHeader}>
                          <Icon name="lightbulb" size={ms(12)} color="#D97706" solid />
                          <Text style={[styles.sectionTitle, { color: '#D97706' }]}>Mnemonic</Text>
                        </View>
                        <Text style={[styles.mnemonicText, { color: '#92400E' }]}>{note.mnemonics}</Text>
                      </View>
                    ) : null}

                    {note.lastReviewed ? (
                      <Text style={[styles.reviewed, { color: c.textMuted }]}>
                        Last reviewed: {note.lastReviewed}
                      </Text>
                    ) : null}

                    <TouchableOpacity
                      style={[styles.practiceBtn, { borderColor: c.primary }]}
                      onPress={() =>
                        navigation.navigate('AIStudyRoom', {
                          topicId: note.id,
                          title: note.topicName,
                        })
                      }
                    >
                      <Icon name="robot" size={ms(14)} color={c.primary} solid />
                      <Text style={[styles.practiceBtnText, { color: c.primary }]}>
                        Study with AI
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
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
  headerTitle: { ...t.subheadBold },
  headerSub: { ...t.caption, marginTop: vs(2) },
  aiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(12),
  },
  aiPillText: { fontSize: font.tiny, fontWeight: '900', letterSpacing: 0.6 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    marginHorizontal: spacing.md,
    marginVertical: vs(10),
    paddingHorizontal: hs(14),
    paddingVertical: vs(10),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  searchInput: { ...t.body, flex: 1, padding: 0 },
  scroll: { padding: spacing.md, paddingBottom: vs(48) },
  countText: { ...t.captionBold, marginBottom: vs(12) },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: vs(12),
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: spacing.md,
  },
  iconWrap: {
    width: hs(40),
    height: hs(40),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicName: { ...t.bodyBold },
  subjectName: { ...t.caption, marginTop: vs(2) },
  cardBody: {
    borderTopWidth: 1,
    padding: spacing.md,
    gap: vs(12),
  },
  section: { gap: vs(8) },
  formulaeBox: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  mnemonicBox: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: hs(6) },
  sectionTitle: { ...t.captionBold, textTransform: 'uppercase', letterSpacing: 0.6 },
  bulletRow: { flexDirection: 'row', gap: hs(8), alignItems: 'flex-start' },
  bullet: { width: ms(6), height: ms(6), borderRadius: ms(3), marginTop: vs(7) },
  bulletText: { ...t.body, flex: 1, lineHeight: ms(24) },
  formulaText: { ...t.bodyBold, fontFamily: 'monospace', lineHeight: ms(26) },
  mnemonicText: { ...t.body, fontStyle: 'italic', lineHeight: ms(24) },
  reviewed: { ...t.caption },
  practiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    paddingVertical: vs(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginTop: vs(4),
  },
  practiceBtnText: { ...t.captionBold },
  emptyWrap: { flex: 1, padding: spacing.md, paddingTop: vs(20) },
  emptyGradient: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: vs(12),
  },
  emptyTitle: { fontSize: font.subhead, fontWeight: '900', color: '#fff', textAlign: 'center' },
  emptySub: { fontSize: font.body, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: ms(26) },
});

export default RevisionNotesScreen;
