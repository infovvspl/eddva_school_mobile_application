import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator,
  TextInput, SafeAreaView, Modal,
} from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import {
  ChevronLeft, ChevronRight, ChevronDown, Search, GraduationCap, Library, Tag,
  BookOpen, Presentation, Video, ClipboardList, Layers, GitBranch,
  CircleQuestionMark, ListChecks, Lightbulb, ClipboardCheck, FileQuestionMark,
  FileText, Play, Eye, ExternalLink, Check, X,
} from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';

type Level = 'subjects' | 'chapters' | 'topics' | 'resources';

// The API's fileType is the resource category, not always a literal file --
// dpp/flashcard/key_concepts/pyq/faq/revision_checklist/study_guide/mindmap
// ship as Markdown in `description` with no fileUrl at all; only ebook (pdf),
// ppt (pptx) and notes (mp4, despite the name) carry a real file.
const TYPE_META: Record<string, { label: string; Icon: any; color: string }> = {
  notes: { label: 'Video Lectures', Icon: Video, color: '#0D9488' },
  ebook: { label: 'E-Books', Icon: BookOpen, color: '#DC2626' },
  ppt: { label: 'Slides', Icon: Presentation, color: '#EA580C' },
  dpp: { label: 'DPP', Icon: ClipboardList, color: '#DB2777' },
  flashcard: { label: 'Flashcards', Icon: Layers, color: '#4F46E5' },
  mindmap: { label: 'Mind Maps', Icon: GitBranch, color: '#16A34A' },
  faq: { label: 'FAQ', Icon: CircleQuestionMark, color: '#64748B' },
  revision_checklist: { label: 'Revision Checklist', Icon: ListChecks, color: '#D97706' },
  key_concepts: { label: 'Key Concepts', Icon: Lightbulb, color: '#7C3AED' },
  study_guide: { label: 'Study Guides', Icon: ClipboardCheck, color: '#059669' },
  pyq: { label: 'PYQ', Icon: FileQuestionMark, color: '#2563EB' },
};
const typeMeta = (t: string) => TYPE_META[t] ?? { label: t, Icon: FileText, color: '#64748B' };

// A stable palette per subject, cycling if there end up being more subjects
// than colours -- keeps each subject visually distinct without hardcoding names.
const SUBJECT_COLORS = ['#4F46E5', '#DB2777', '#0D9488', '#EA580C', '#7C3AED', '#16A34A', '#2563EB'];

const isPlayable = (url: string) => /\.mp4(\?|$)/i.test(url);
const isPdf = (url: string) => /\.pdf(\?|$)/i.test(url);

export function StudyMaterialsScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [level, setLevel] = useState<Level>('subjects');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    schoolApi
      .getMaterials()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.data ?? res?.materials ?? []);
        setItems(Array.isArray(list) ? list : []);
      })
      .catch((e: any) => setError(e?.message || 'Could not load study materials.'))
      .finally(() => setLoading(false));
  }, []);

  // --- hierarchy, derived once from the flat list -----------------------
  const subjects = useMemo(() => {
    const map = new Map<string, { id: string; name: string; chapters: Set<string>; topics: Set<string>; count: number }>();
    items.forEach(it => {
      const id = it.subjectIdFk;
      if (!id) return;
      if (!map.has(id)) map.set(id, { id, name: it.subjectName, chapters: new Set(), topics: new Set(), count: 0 });
      const s = map.get(id)!;
      s.chapters.add(it.chapterId);
      // "General Topics" (no topicId) is its own bucket per chapter, not one
      // shared bucket for the whole subject -- each chapter's untagged items
      // count as that chapter's topic. Verified against the live API: this
      // scoped count is what matches the web panel's topic totals exactly
      // (5/21/33 for Democratic Politics/Mathematics/Science); an unscoped
      // set collapses every chapter's "General Topics" into one (1/8/21).
      s.topics.add(`${it.chapterId}:${it.topicId || '__general__'}`);
      s.count += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const chapters = useMemo(() => {
    if (!subjectId) return [];
    const map = new Map<string, { id: string; name: string; sort: number; topics: Set<string>; count: number }>();
    items.filter(it => it.subjectIdFk === subjectId).forEach(it => {
      const id = it.chapterId;
      if (!map.has(id)) {
        map.set(id, { id, name: it.chapterName, sort: it.chapterSortOrder ?? 0, topics: new Set(), count: 0 });
      }
      const c = map.get(id)!;
      c.topics.add(it.topicId || '__general__');
      c.count += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.sort - b.sort);
  }, [items, subjectId]);

  const topics = useMemo(() => {
    if (!chapterId) return [];
    const map = new Map<string, { id: string; name: string; sort: number; count: number }>();
    items.filter(it => it.chapterId === chapterId).forEach(it => {
      const id = it.topicId || '__general__';
      if (!map.has(id)) {
        map.set(id, {
          id,
          name: it.topicId ? it.topicName : 'General Topics',
          sort: it.topicId ? (it.topicSortOrder ?? 999) : -1,
          count: 0,
        });
      }
      map.get(id)!.count += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.sort - b.sort);
  }, [items, chapterId]);

  const resourcesAll = useMemo(() => {
    if (!chapterId || !topicId) return [];
    return items.filter(it => it.chapterId === chapterId && (it.topicId || '__general__') === topicId);
  }, [items, chapterId, topicId]);

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    resourcesAll.forEach(r => { c[r.fileType] = (c[r.fileType] ?? 0) + 1; });
    return c;
  }, [resourcesAll]);

  const resources = useMemo(() => {
    let list = resourcesAll;
    if (typeFilter) list = list.filter(r => r.fileType === typeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r => (r.title || '').toLowerCase().includes(q));
    }
    return list;
  }, [resourcesAll, typeFilter, search]);

  const selectedSubject = subjects.find(s => s.id === subjectId);
  const selectedChapter = chapters.find(c => c.id === chapterId);
  const selectedTopic = topics.find(t => t.id === topicId);

  const openSubject = (id: string) => { setSubjectId(id); setChapterId(null); setTopicId(null); setTypeFilter(null); setSearch(''); setLevel('chapters'); };
  const openChapter = (id: string) => { setChapterId(id); setTopicId(null); setTypeFilter(null); setSearch(''); setLevel('topics'); };
  const openTopic = (id: string) => { setTopicId(id); setTypeFilter(null); setSearch(''); setLevel('resources'); };

  const goBack = () => {
    if (level === 'resources') { setLevel('topics'); setTopicId(null); return; }
    if (level === 'topics') { setLevel('chapters'); setChapterId(null); return; }
    if (level === 'chapters') { setLevel('subjects'); setSubjectId(null); return; }
    onNavigate('dashboard');
  };

  const openResource = (item: any) => {
    const url = item.fileUrl || item.file_url;
    if (url && isPdf(url)) {
      onNavigate('pdfViewer', { url, title: item.title });
    } else if (url && isPlayable(url)) {
      onNavigate('materialViewer', { item });
    } else if (url) {
      // pptx and anything else with a real file: rendered through Google's
      // document viewer, since there is no native Office renderer here.
      onNavigate('materialViewer', { item });
    } else if (item.description) {
      // dpp/flashcard/key_concepts/etc: AI-authored Markdown, no file at all.
      onNavigate('materialViewer', { item });
    }
  };

  const title =
    level === 'subjects' ? 'Study Materials'
    : level === 'chapters' ? selectedSubject?.name ?? 'Study Materials'
    : level === 'topics' ? selectedChapter?.name ?? 'Study Materials'
    : selectedTopic?.name ?? 'Study Materials';

  const subtitle =
    level === 'subjects' ? 'Browse notes, videos, slides and practice resources by subject.'
    : level === 'chapters' ? `Browse chapters for ${selectedSubject?.name ?? ''}.`
    : level === 'topics' ? `Choose a topic from ${selectedChapter?.name ?? ''}.`
    : `${resourcesAll.length} resource${resourcesAll.length === 1 ? '' : 's'} in this topic.`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <ChevronLeft size={ms(24)} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.headerSub} numberOfLines={2}>{subtitle}</Text>
        </View>
      </View>

      {level !== 'subjects' && (
        <View style={styles.crumbRow}>
          <TouchableOpacity onPress={() => { setLevel('subjects'); setSubjectId(null); setChapterId(null); setTopicId(null); }}>
            <Text style={styles.crumbLink}>All Subjects</Text>
          </TouchableOpacity>
          {!!selectedSubject && (
            <>
              <Text style={styles.crumbSep}>›</Text>
              <TouchableOpacity onPress={() => { setLevel('chapters'); setChapterId(null); setTopicId(null); }} disabled={level === 'chapters'}>
                <Text style={level === 'chapters' ? styles.crumbCurrent : styles.crumbLink}>{selectedSubject.name}</Text>
              </TouchableOpacity>
            </>
          )}
          {!!selectedChapter && (
            <>
              <Text style={styles.crumbSep}>›</Text>
              <TouchableOpacity onPress={() => { setLevel('topics'); setTopicId(null); }} disabled={level === 'topics'}>
                <Text style={level === 'topics' ? styles.crumbCurrent : styles.crumbLink} numberOfLines={1}>
                  {selectedChapter.name}
                </Text>
              </TouchableOpacity>
            </>
          )}
          {!!selectedTopic && (
            <>
              <Text style={styles.crumbSep}>›</Text>
              <Text style={styles.crumbCurrent} numberOfLines={1}>{selectedTopic.name}</Text>
            </>
          )}
        </View>
      )}

      {level === 'resources' && (
        <View style={styles.searchRow}>
          <Search size={ms(15)} color={theme.subtext} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search in this topic..."
            placeholderTextColor={theme.subtext}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
      ) : error ? (
        <Text style={styles.empty}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {level === 'subjects' && (
            <View style={styles.grid}>
              {subjects.map((s, i) => (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.tile, { borderTopColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }]}
                  onPress={() => openSubject(s.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.tileTop}>
                    <View style={[styles.tileIcon, { backgroundColor: SUBJECT_COLORS[i % SUBJECT_COLORS.length] }]}>
                      <Library size={ms(16)} color="#fff" />
                    </View>
                    <View style={styles.openPill}><Text style={styles.openPillText}>Open</Text></View>
                  </View>
                  <Text style={styles.tileTitle} numberOfLines={2}>{s.name}</Text>
                  <View style={styles.tileMetaRow}>
                    <Text style={styles.tileMeta}>{s.chapters.size} ch</Text>
                    <Text style={styles.tileMeta}>{s.topics.size} topics</Text>
                    <Text style={styles.tileMeta}>{s.count} files</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {level === 'chapters' && (
            <View style={styles.grid}>
              {chapters.map((c, i) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.tile}
                  onPress={() => openChapter(c.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.tileTop}>
                    <View style={styles.numberBadge}><Text style={styles.numberBadgeText}>{i + 1}</Text></View>
                  </View>
                  <Text style={styles.tileTitle} numberOfLines={2}>{c.name}</Text>
                  <View style={styles.tileMetaRow}>
                    <Text style={styles.tileMeta}>{c.topics.size} topics</Text>
                    <Text style={styles.tileMeta}>{c.count} files</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {level === 'topics' && (
            <View style={styles.grid}>
              {topics.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.tile}
                  onPress={() => openTopic(t.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.tileTop}>
                    <View style={styles.tagBadge}><Tag size={ms(12)} color={theme.primary} /></View>
                  </View>
                  <Text style={styles.tileTitle} numberOfLines={2}>{t.name}</Text>
                  <View style={styles.tileMetaRow}>
                    <Text style={styles.tileMeta}>{t.count} files</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {level === 'resources' && (
            <>
              <TouchableOpacity
                style={styles.typeDropdownBtn}
                onPress={() => setTypeFilterOpen(true)}
                activeOpacity={0.8}
              >
                {typeFilter ? (
                  <View style={[styles.typeDropdownDot, { backgroundColor: typeMeta(typeFilter).color }]} />
                ) : (
                  <Tag size={ms(14)} color={theme.subtext} />
                )}
                <Text style={styles.typeDropdownText} numberOfLines={1}>
                  {typeFilter ? typeMeta(typeFilter).label : 'All Types'} (
                  {typeFilter ? typeCounts[typeFilter] ?? 0 : resourcesAll.length})
                </Text>
                <ChevronDown size={ms(15)} color={theme.subtext} />
              </TouchableOpacity>

              {resources.length === 0 ? (
                <Text style={styles.empty}>No resources match this filter.</Text>
              ) : (
                <View style={{ gap: vs(10), marginTop: vs(14) }}>
                  {resources.map(item => {
                    const meta = typeMeta(item.fileType);
                    const url = item.fileUrl || item.file_url;
                    const playable = !!url && isPlayable(url);
                    const hasFile = !!url;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.resCard, { borderTopColor: meta.color }]}
                        onPress={() => openResource(item)}
                        activeOpacity={0.85}
                      >
                        <View style={styles.resTop}>
                          <View style={[styles.resIcon, { backgroundColor: meta.color + '1A' }]}>
                            <meta.Icon size={ms(16)} color={meta.color} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.resTitle} numberOfLines={2}>{item.title}</Text>
                            {!!item.uploaded_by_name && (
                              <Text style={styles.resBy}>{item.uploaded_by_name}</Text>
                            )}
                          </View>
                          <View style={[styles.typeBadge, { backgroundColor: meta.color + '1A' }]}>
                            <Text style={[styles.typeBadgeText, { color: meta.color }]}>{meta.label}</Text>
                          </View>
                        </View>
                        <View style={styles.resActionRow}>
                          {playable
                            ? <Play size={ms(13)} color={meta.color} />
                            : hasFile
                            ? <ExternalLink size={ms(13)} color={meta.color} />
                            : <Eye size={ms(13)} color={meta.color} />}
                          <Text style={[styles.resActionText, { color: meta.color }]}>
                            {playable ? 'Play' : hasFile ? 'Open' : 'View'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      <Modal
        visible={typeFilterOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setTypeFilterOpen(false)}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setTypeFilterOpen(false)}>
          <TouchableOpacity style={styles.sheet} activeOpacity={1}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Resource type</Text>
              <TouchableOpacity onPress={() => setTypeFilterOpen(false)} style={{ padding: ms(4) }}>
                <X size={ms(20)} color={theme.subtext} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={styles.sheetRow}
                onPress={() => { setTypeFilter(null); setTypeFilterOpen(false); }}
              >
                <Tag size={ms(16)} color={theme.subtext} style={{ marginRight: hs(10) }} />
                <Text style={[styles.sheetRowText, !typeFilter && styles.sheetRowTextOn]}>
                  All Types ({resourcesAll.length})
                </Text>
                {!typeFilter && <Check size={ms(17)} color={theme.primary} />}
              </TouchableOpacity>
              {Object.keys(typeCounts).map(ft => {
                const meta = typeMeta(ft);
                const on = typeFilter === ft;
                return (
                  <TouchableOpacity
                    key={ft}
                    style={styles.sheetRow}
                    onPress={() => { setTypeFilter(ft); setTypeFilterOpen(false); }}
                  >
                    <meta.Icon size={ms(16)} color={meta.color} style={{ marginRight: hs(10) }} />
                    <Text style={[styles.sheetRowText, on && { color: meta.color, fontWeight: '700' }]}>
                      {meta.label} ({typeCounts[ft]})
                    </Text>
                    {on && <Check size={ms(17)} color={meta.color} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: hs(16),
    paddingTop: vs(10),
    paddingBottom: vs(14),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backBtn: { padding: ms(4), marginRight: hs(10) },
  headerTitle: { fontSize: ms(19), fontWeight: '700', color: theme.text },
  headerSub: { fontSize: ms(11.5), lineHeight: ms(16), color: theme.subtext, marginTop: vs(2) },

  crumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: hs(4),
    paddingHorizontal: hs(16),
    paddingVertical: vs(9),
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  crumbLink: { fontSize: ms(11.5), color: theme.primary, fontWeight: '600' },
  crumbCurrent: { fontSize: ms(11.5), color: theme.subtext, fontWeight: '600', maxWidth: hs(160) },
  crumbSep: { fontSize: ms(11.5), color: theme.subtext },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    margin: hs(16),
    marginBottom: 0,
    paddingHorizontal: hs(12),
    paddingVertical: vs(9),
    borderRadius: ms(10),
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  searchInput: { flex: 1, fontSize: ms(13), color: theme.text, padding: 0 },

  content: { padding: hs(16), paddingBottom: vs(60) },
  empty: { textAlign: 'center', color: theme.subtext, fontSize: ms(13), marginTop: vs(30) },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(12) },
  tile: {
    width: '47%',
    backgroundColor: theme.surface,
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: theme.border,
    borderTopWidth: 3,
    borderTopColor: theme.primary,
    padding: ms(12),
    minHeight: vs(118),
  },
  tileTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tileIcon: { width: ms(30), height: ms(30), borderRadius: ms(9), justifyContent: 'center', alignItems: 'center' },
  numberBadge: {
    width: ms(24), height: ms(24), borderRadius: ms(12),
    backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center',
  },
  numberBadgeText: { fontSize: ms(11), fontWeight: '700', color: theme.subtext },
  tagBadge: {
    width: ms(26), height: ms(26), borderRadius: ms(8),
    backgroundColor: theme.primarySoft ?? '#EEF2FF', justifyContent: 'center', alignItems: 'center',
  },
  openPill: { backgroundColor: theme.background, borderRadius: ms(10), paddingHorizontal: hs(8), paddingVertical: vs(3) },
  openPillText: { fontSize: ms(10.5), fontWeight: '700', color: theme.primary },
  tileTitle: { fontSize: ms(13.5), lineHeight: ms(18), fontWeight: '700', color: theme.text, marginTop: vs(10) },
  tileMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(8), marginTop: vs(8) },
  tileMeta: { fontSize: ms(10.5), color: theme.subtext, fontWeight: '600' },

  typeDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    marginTop: vs(4),
    paddingHorizontal: hs(12),
    paddingVertical: vs(10),
    borderRadius: ms(10),
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  typeDropdownDot: { width: ms(10), height: ms(10), borderRadius: ms(5) },
  typeDropdownText: { flex: 1, fontSize: ms(13), fontWeight: '600', color: theme.text },

  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    paddingBottom: vs(24),
    maxHeight: '75%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hs(20),
    paddingTop: vs(16),
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sheetTitle: { fontSize: ms(16), fontWeight: '700', color: theme.text },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    paddingVertical: vs(14),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sheetRowText: { flex: 1, fontSize: ms(14), color: theme.text },
  sheetRowTextOn: { color: theme.primary, fontWeight: '700' },

  resCard: {
    backgroundColor: theme.surface,
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: theme.border,
    borderTopWidth: 3,
    padding: ms(12),
  },
  resTop: { flexDirection: 'row', alignItems: 'flex-start', gap: hs(10) },
  resIcon: { width: ms(34), height: ms(34), borderRadius: ms(10), justifyContent: 'center', alignItems: 'center' },
  resTitle: { fontSize: ms(13.5), lineHeight: ms(18), fontWeight: '700', color: theme.text },
  resBy: { fontSize: ms(11), color: theme.subtext, marginTop: vs(2) },
  typeBadge: { borderRadius: ms(8), paddingHorizontal: hs(7), paddingVertical: vs(3) },
  typeBadgeText: { fontSize: ms(9.5), fontWeight: '700' },
  resActionRow: { flexDirection: 'row', alignItems: 'center', gap: hs(5), marginTop: vs(10) },
  resActionText: { fontSize: ms(12), fontWeight: '700' },
});
