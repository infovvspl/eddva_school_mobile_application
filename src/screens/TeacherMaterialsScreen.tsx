import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import {
  ArrowLeft, BookOpen, ChevronRight, ClipboardCheck, ClipboardList, CircleQuestionMark,
  Download, Eye, FileText, GitBranch, GraduationCap, Home, Layers, Library, Lightbulb,
  ListChecks, Presentation, Search, Sparkles, Trash2, Users, Video, X, FileQuestionMark,
} from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';
import { hs, vs, ms } from '../utils/responsive';
import { Markdown } from '../components/Markdown';

type Level = 'classes' | 'sections' | 'subjects' | 'chapters' | 'materials';

/**
 * fileType is the material's category, and it also tells us whether there is a
 * real file behind it. Verified against all 658 live materials: the split is
 * exact, with no overlap -- ebook/notes/ppt always carry a fileUrl, and every
 * other type never does, shipping its content as Markdown in `description`.
 * Labels here follow the web Course Content panel rather than the student app.
 */
const TYPE_META: Record<string, { label: string; Icon: any; color: string }> = {
  study_guide: { label: 'Study Guide', Icon: ClipboardCheck, color: '#059669' },
  key_concepts: { label: 'Key Concepts', Icon: Lightbulb, color: '#7C3AED' },
  flashcard: { label: 'Flashcards', Icon: Layers, color: '#4F46E5' },
  revision_checklist: { label: 'Revision Checklist', Icon: ListChecks, color: '#D97706' },
  pyq: { label: 'PYQ', Icon: FileQuestionMark, color: '#2563EB' },
  dpp: { label: 'Daily Assessment', Icon: ClipboardList, color: '#DB2777' },
  mindmap: { label: 'Mindmap', Icon: GitBranch, color: '#16A34A' },
  faq: { label: 'FAQ', Icon: CircleQuestionMark, color: '#64748B' },
  ppt: { label: 'Presentation', Icon: Presentation, color: '#EA580C' },
  ebook: { label: 'E-book', Icon: BookOpen, color: '#DC2626' },
  notes: { label: 'Notes', Icon: Video, color: '#0D9488' },
};
const typeMeta = (t: string) => TYPE_META[t] ?? { label: t, Icon: FileText, color: '#64748B' };
const hasFile = (m: any) => !!String(m?.fileUrl ?? m?.file_url ?? '').trim();

// fileSizeKb is in KB, and plenty of real files are well under a megabyte, so
// anything below 1 MB stays in KB rather than being rounded up to "1 MB".
const fileSize = (kb: any) => {
  const n = Number(kb);
  if (!Number.isFinite(n) || n <= 0) return 'File';
  return n < 1024 ? `${Math.round(n)} KB` : `${Math.round((n / 1024) * 10) / 10} MB`;
};

// The AI generator's content types, in the order the web panel lists them.
// `key` is sent to the API and is the same vocabulary fileType comes back in.
const AI_TYPES = [
  { key: 'study_guide', label: 'Study Guide', hint: 'Exam-ready summary of must-know points' },
  { key: 'key_concepts', label: 'Key Concepts', hint: 'Bulleted concepts, formulas & definitions' },
  { key: 'flashcard', label: 'Flashcards', hint: 'Bite-sized Q&A cards for quick recall' },
  { key: 'revision_checklist', label: 'Revision Checklist', hint: 'Subtopic checklist students can tick off' },
  { key: 'mindmap', label: 'Mindmap', hint: 'Hierarchical breakdown of the topic' },
  { key: 'faq', label: 'FAQ', hint: 'Frequently asked questions with answers' },
  { key: 'pyq', label: 'PYQ Practice', hint: 'Previous-year style paper with solutions' },
  { key: 'dpp', label: 'Daily Assessment', hint: 'Practice problems with MCQs & answer key' },
];
const AI_LANGUAGES = [
  { key: 'english', label: 'English' },
  { key: 'hindi', label: 'Hindi (हिंदी)' },
  { key: 'odia', label: 'Odia (ଓଡ଼ିଆ)' },
];

const unwrap = (res: any) => (Array.isArray(res) ? res : res?.data ?? []);


export function TeacherMaterialsScreen({ onNavigate }: any) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  const [level, setLevel] = useState<Level>('classes');
  const [classes, setClasses] = useState<any[]>([]);
  const [myName, setMyName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [cls, setCls] = useState<any>(null);
  const [section, setSection] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [chapter, setChapter] = useState<any>(null);

  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [activeTopic, setActiveTopic] = useState<any>(null); // null = chapter-level
  const [materials, setMaterials] = useState<any[]>([]);
  const [matLoading, setMatLoading] = useState(false);

  const [aiOpen, setAiOpen] = useState(false);
  const [aiType, setAiType] = useState<string>('study_guide');
  const [aiLang, setAiLang] = useState<string>('english');
  const [aiBusy, setAiBusy] = useState(false);
  // Generating and keeping are two separate calls: the generator hands back
  // content without storing it, so the teacher reviews the draft first and
  // only then does it get written to the library.
  const [aiDraft, setAiDraft] = useState<{ content: string; contentType: string } | null>(null);
  const [aiSaving, setAiSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([
      schoolApi.getAcademicClasses().catch((e: any) => { throw e; }),
      schoolApi.getMe().catch(() => null),
    ])
      .then(([res, me]: any[]) => {
        if (!alive) return;
        setClasses(unwrap(res));
        setMyName((me?.data ?? me)?.name ?? '');
      })
      .catch((e: any) => alive && setError(e?.message || 'Could not load classes.'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  // --- navigation between levels -----------------------------------------
  const openClass = (c: any) => { setCls(c); setSearch(''); setLevel('sections'); };

  const openSection = (s: any) => {
    setSection(s);
    setSearch('');
    setLevel('subjects');
    setSubjects([]);
    setSubjectsLoading(true);
    schoolApi.getSubjectsForSection(cls.id, s.id)
      .then((res: any) => setSubjects(unwrap(res)))
      .catch(() => setSubjects([]))
      .finally(() => setSubjectsLoading(false));
  };

  const openSubject = (sj: any) => { setSubject(sj); setSearch(''); setLevel('chapters'); };

  const loadMaterials = useCallback((chapterId: string, topic: any) => {
    setMatLoading(true);
    const req = topic
      ? schoolApi.getTopicMaterials(topic.id)
      : schoolApi.getChapterMaterials(chapterId);
    return req
      .then((res: any) => setMaterials(unwrap(res)))
      .catch(() => setMaterials([]))
      .finally(() => setMatLoading(false));
  }, []);

  const openChapter = (ch: any) => {
    setChapter(ch);
    setSearch('');
    setActiveTopic(null);
    setTopics([]);
    setLevel('materials');
    schoolApi.getChapterTopics(ch.id).then((res: any) => setTopics(unwrap(res))).catch(() => setTopics([]));
    loadMaterials(ch.id, null);
  };

  const selectTopic = (t: any) => {
    setActiveTopic(t);
    loadMaterials(chapter.id, t);
  };

  const goBack = () => {
    setSearch('');
    if (level === 'materials') { setLevel('chapters'); setChapter(null); setMaterials([]); setTopics([]); setActiveTopic(null); }
    else if (level === 'chapters') { setLevel('subjects'); setSubject(null); }
    else if (level === 'subjects') { setLevel('sections'); setSection(null); setSubjects([]); }
    else if (level === 'sections') { setLevel('classes'); setCls(null); }
    else onNavigate && onNavigate('teacherDashboard');
  };

  // --- derived lists ------------------------------------------------------
  const q = search.trim().toLowerCase();
  const match = (s: any) => !q || String(s ?? '').toLowerCase().includes(q);

  const visibleClasses = useMemo(
    () => classes.filter(c => match(c.name)),
    [classes, q],
  );

  const sections = useMemo(() => (cls?.sections ?? []).filter((s: any) => match(s.name)), [cls, q]);

  const visibleSubjects = useMemo(() => {
    const seen = new Set<string>();
    return subjects
      .filter(s => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return match(s.name);
      })
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }, [subjects, q]);

  // The API hands back the chapters of every subject sharing this subject's
  // name across all classes, so the rows have to be narrowed to this subject's
  // own id -- otherwise Class 10 Science shows 68 chapters instead of its 13.
  const chapters = useMemo(() => {
    if (!subject) return [];
    return (subject.chapters ?? [])
      .filter((c: any) => c.subjectId === subject.id)
      .filter((c: any) => match(c.name))
      .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [subject, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();
    materials.filter(m => match(m.title)).forEach(m => {
      const k = m.fileType || 'other';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    });
    return Array.from(map.entries());
  }, [materials, q]);

  // --- actions ------------------------------------------------------------
  const openMaterial = (m: any) => {
    onNavigate && onNavigate('materialViewer', { item: m, backTo: 'teacherMaterials' });
  };

  const confirmDelete = (m: any) => {
    Alert.alert('Delete material', `Remove "${m.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          schoolApi.deleteMaterial(m.id)
            .then(() => loadMaterials(chapter.id, activeTopic))
            .catch((e: any) => Alert.alert('Could not delete', e?.message || 'Please try again.'));
        },
      },
    ]);
  };

  const runAiGenerate = () => {
    setAiBusy(true);
    setAiDraft(null);
    // The generator is scoped to whichever node is open: a topic when one is
    // selected, otherwise the chapter itself.
    const scope = activeTopic ? { topicId: activeTopic.id } : { chapterId: chapter.id };
    schoolApi.teacher.aiGenerateMaterial({ ...scope, contentType: aiType, language: aiLang })
      .then((res: any) => {
        const d = res?.data ?? res;
        if (!d?.content) throw new Error('The generator returned no content.');
        setAiDraft({ content: d.content, contentType: d.contentType || aiType });
      })
      .catch((e: any) => Alert.alert('Generation failed', e?.message || 'Please try again.'))
      .finally(() => setAiBusy(false));
  };

  const saveAiDraft = () => {
    if (!aiDraft) return;
    setAiSaving(true);
    const scopeName = activeTopic ? activeTopic.name : chapter.name;
    schoolApi.teacher.createMaterial({
      title: `${typeMeta(aiDraft.contentType).label} — ${scopeName}`,
      description: aiDraft.content,
      fileType: aiDraft.contentType,
      chapterId: chapter.id,
      ...(activeTopic ? { topicId: activeTopic.id } : {}),
      subjectId: subject.id,
      classId: cls.id,
      ...(section?.id ? { sectionId: section.id } : {}),
    })
      .then(() => {
        setAiOpen(false);
        setAiDraft(null);
        return loadMaterials(chapter.id, activeTopic);
      })
      .catch((e: any) => Alert.alert('Could not save', e?.message || 'Please try again.'))
      .finally(() => setAiSaving(false));
  };

  const closeAiSheet = () => { setAiOpen(false); setAiDraft(null); };

  // --- header -------------------------------------------------------------
  const crumbs = [
    { key: 'classes', label: 'Classes', on: () => { setLevel('classes'); setCls(null); setSection(null); setSubject(null); setChapter(null); setSearch(''); } },
    cls && { key: 'c', label: cls.name, on: () => { setLevel('sections'); setSection(null); setSubject(null); setChapter(null); setSearch(''); } },
    section && { key: 's', label: section.name, on: () => { setLevel('subjects'); setSubject(null); setChapter(null); setSearch(''); } },
    subject && { key: 'sj', label: subject.name, on: () => { setLevel('chapters'); setChapter(null); setSearch(''); } },
    chapter && { key: 'ch', label: chapter.name, on: () => {} },
  ].filter(Boolean) as Array<{ key: string; label: string; on: () => void }>;

  const searchPlaceholder =
    level === 'classes' ? 'Search classes...'
      : level === 'sections' ? 'Search sections...'
        : level === 'subjects' ? 'Search subjects...'
          : level === 'chapters' ? 'Search chapters...'
            : 'Search materials...';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={goBack}>
          <ArrowLeft size={ms(22)} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Course Content</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Browse your classes, drill into subjects and manage the curriculum.
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.crumbBar}
        contentContainerStyle={styles.crumbBarInner}
      >
        {crumbs.map((c, i) => (
          <React.Fragment key={c.key}>
            {i > 0 && <ChevronRight size={ms(13)} color={theme.subtext} style={{ marginHorizontal: hs(2) }} />}
            <TouchableOpacity
              style={[styles.crumb, i === crumbs.length - 1 && styles.crumbOn]}
              onPress={c.on}
              disabled={i === crumbs.length - 1}
            >
              {i === 0 && <Home size={ms(12)} color={i === crumbs.length - 1 ? theme.primary : theme.subtext} />}
              <Text
                style={[styles.crumbText, i === crumbs.length - 1 && styles.crumbTextOn]}
                numberOfLines={1}
              >
                {c.label}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </ScrollView>

      <View style={styles.searchWrap}>
        <Search size={ms(15)} color={theme.subtext} />
        <TextInput
          style={styles.searchInput}
          placeholder={searchPlaceholder}
          placeholderTextColor={theme.subtext}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <X size={ms(15)} color={theme.subtext} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={theme.primary} /></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
          {/* ---------------- CLASSES ---------------- */}
          {level === 'classes' && (
            visibleClasses.length === 0 ? <Text style={styles.empty}>No classes found.</Text> :
              visibleClasses.map(c => {
                const secs = c.sections ?? [];
                const isClassTeacher = !!myName && c.classTeacherName === myName;
                return (
                  <TouchableOpacity key={c.id} style={styles.card} onPress={() => openClass(c)} activeOpacity={0.8}>
                    <View style={styles.cardTop}>
                      <View style={[styles.cardIcon, { backgroundColor: '#EEF2FF' }]}>
                        <GraduationCap size={ms(19)} color="#4F46E5" />
                      </View>
                      {isClassTeacher && (
                        <View style={styles.badge}><Text style={styles.badgeText}>Class Teacher</Text></View>
                      )}
                    </View>
                    <Text style={styles.cardTitle}>{c.name}</Text>
                    <View style={styles.metaRow}>
                      <Users size={ms(12)} color={theme.subtext} />
                      <Text style={styles.metaText}>
                        {secs.length} section{secs.length === 1 ? '' : 's'}
                        {typeof c.totalStudents === 'number' ? ` • ${c.totalStudents} students` : ''}
                      </Text>
                    </View>
                    <View style={styles.cardFoot}>
                      <Text style={styles.cardLink}>View sections</Text>
                      <ChevronRight size={ms(15)} color={theme.primary} />
                    </View>
                  </TouchableOpacity>
                );
              })
          )}

          {/* ---------------- SECTIONS ---------------- */}
          {level === 'sections' && (
            sections.length === 0 ? <Text style={styles.empty}>No sections in this class.</Text> :
              sections.map((s: any) => (
                <TouchableOpacity key={s.id} style={styles.card} onPress={() => openSection(s)} activeOpacity={0.8}>
                  <View style={styles.cardTop}>
                    <View style={[styles.cardIcon, { backgroundColor: '#F5F3FF' }]}>
                      <Layers size={ms(19)} color="#7C3AED" />
                    </View>
                    {!!myName && s.classTeacherName === myName && (
                      <View style={styles.badge}><Text style={styles.badgeText}>Class Teacher</Text></View>
                    )}
                  </View>
                  <Text style={styles.cardTitle}>Section {s.name}</Text>
                  <View style={styles.metaRow}>
                    <Users size={ms(12)} color={theme.subtext} />
                    <Text style={styles.metaText}>
                      {typeof s.totalStudents === 'number' ? `${s.totalStudents} students` : '—'}
                    </Text>
                  </View>
                  <View style={styles.cardFoot}>
                    <Text style={styles.cardLink}>View subjects</Text>
                    <ChevronRight size={ms(15)} color={theme.primary} />
                  </View>
                </TouchableOpacity>
              ))
          )}

          {/* ---------------- SUBJECTS ---------------- */}
          {level === 'subjects' && (
            subjectsLoading ? <ActivityIndicator color={theme.primary} style={{ marginTop: vs(28) }} /> :
              visibleSubjects.length === 0 ? <Text style={styles.empty}>No subjects for this section.</Text> :
                visibleSubjects.map(sj => {
                  const n = (sj.chapters ?? []).filter((c: any) => c.subjectId === sj.id).length;
                  return (
                    <TouchableOpacity key={sj.id} style={styles.card} onPress={() => openSubject(sj)} activeOpacity={0.8}>
                      <View style={styles.cardTop}>
                        <View style={[styles.cardIcon, { backgroundColor: '#ECFDF5' }]}>
                          <Library size={ms(19)} color="#059669" />
                        </View>
                      </View>
                      <Text style={styles.cardTitle}>{sj.name}</Text>
                      <View style={styles.metaRow}>
                        <BookOpen size={ms(12)} color={theme.subtext} />
                        <Text style={styles.metaText}>{n} chapter{n === 1 ? '' : 's'}</Text>
                      </View>
                      <View style={styles.cardFoot}>
                        <Text style={[styles.cardLink, { color: '#059669' }]}>Open curriculum</Text>
                        <ChevronRight size={ms(15)} color="#059669" />
                      </View>
                    </TouchableOpacity>
                  );
                })
          )}

          {/* ---------------- CHAPTERS ---------------- */}
          {level === 'chapters' && (
            chapters.length === 0 ? <Text style={styles.empty}>No chapters in this subject yet.</Text> :
              chapters.map((ch: any, i: number) => (
                <TouchableOpacity key={ch.id} style={styles.rowCard} onPress={() => openChapter(ch)} activeOpacity={0.8}>
                  <View style={styles.numChip}><Text style={styles.numChipText}>{ch.sortOrder ?? i + 1}</Text></View>
                  <Text style={styles.rowTitle} numberOfLines={2}>{ch.name}</Text>
                  <ChevronRight size={ms(16)} color={theme.subtext} />
                </TouchableOpacity>
              ))
          )}

          {/* ---------------- MATERIALS ---------------- */}
          {level === 'materials' && (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: vs(12) }}
                contentContainerStyle={{ gap: hs(8), paddingRight: hs(16) }}
              >
                <TouchableOpacity
                  style={[styles.chip, !activeTopic && styles.chipOn]}
                  onPress={() => selectTopic(null)}
                >
                  <Text style={[styles.chipText, !activeTopic && styles.chipTextOn]}>Chapter Materials</Text>
                </TouchableOpacity>
                {topics.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.chip, activeTopic?.id === t.id && styles.chipOn]}
                    onPress={() => selectTopic(t)}
                  >
                    <Text
                      style={[styles.chipText, activeTopic?.id === t.id && styles.chipTextOn]}
                      numberOfLines={1}
                    >
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.matHeader}>
                <Text style={styles.matCount}>
                  {matLoading ? 'Loading…' : `${materials.length} item${materials.length === 1 ? '' : 's'}`}
                </Text>
                <TouchableOpacity style={styles.aiBtn} onPress={() => setAiOpen(true)}>
                  <Sparkles size={ms(14)} color="#fff" />
                  <Text style={styles.aiBtnText}>AI Generate</Text>
                </TouchableOpacity>
              </View>

              {matLoading ? (
                <ActivityIndicator color={theme.primary} style={{ marginTop: vs(28) }} />
              ) : grouped.length === 0 ? (
                <Text style={styles.empty}>
                  {search ? 'No materials match your search.' : 'No materials here yet. Use AI Generate to create some.'}
                </Text>
              ) : (
                grouped.map(([ft, items]) => {
                  const meta = typeMeta(ft);
                  return (
                    <View key={ft} style={{ marginBottom: vs(14) }}>
                      <View style={styles.groupHead}>
                        <meta.Icon size={ms(15)} color={meta.color} />
                        <Text style={[styles.groupTitle, { color: meta.color }]}>{meta.label}</Text>
                        <Text style={styles.groupCount}>{items.length}</Text>
                      </View>
                      {items.map(m => (
                        <View key={m.id} style={[styles.matCard, { borderLeftColor: meta.color }]}>
                          <TouchableOpacity style={{ flex: 1 }} onPress={() => openMaterial(m)} activeOpacity={0.7}>
                            <Text style={styles.matTitle} numberOfLines={2}>{m.title}</Text>
                            <View style={styles.matMetaRow}>
                              {hasFile(m) ? (
                                <>
                                  <Download size={ms(11)} color={theme.subtext} />
                                  <Text style={styles.matMeta}>{fileSize(m.fileSizeKb)}</Text>
                                </>
                              ) : (
                                <>
                                  <Sparkles size={ms(11)} color="#7C3AED" />
                                  <Text style={[styles.matMeta, { color: '#7C3AED' }]}>AI GENERATED</Text>
                                </>
                              )}
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.matAction} onPress={() => openMaterial(m)}>
                            <Eye size={ms(16)} color={theme.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.matAction} onPress={() => confirmDelete(m)}>
                            <Trash2 size={ms(16)} color={theme.danger} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* ---------------- AI GENERATE SHEET ---------------- */}
      <Modal visible={aiOpen} transparent animationType="slide" onRequestClose={closeAiSheet}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>
                  {aiDraft ? 'Review generated content' : 'AI Content Generator'}
                </Text>
                <Text style={styles.sheetSub} numberOfLines={1}>
                  {activeTopic ? activeTopic.name : chapter?.name}
                </Text>
              </View>
              <TouchableOpacity onPress={closeAiSheet}><X size={ms(20)} color={theme.subtext} /></TouchableOpacity>
            </View>

            {aiDraft ? (
              <>
                <ScrollView style={{ maxHeight: vs(400) }} contentContainerStyle={{ padding: ms(16) }}>
                  <Markdown value={aiDraft.content} theme={theme} />
                </ScrollView>
                <View style={styles.draftActions}>
                  <TouchableOpacity
                    style={[styles.secondaryBtn, aiSaving && { opacity: 0.6 }]}
                    onPress={() => setAiDraft(null)}
                    disabled={aiSaving}
                  >
                    <Text style={styles.secondaryBtnText}>Discard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.generateBtn, { flex: 1, marginHorizontal: 0, marginTop: 0 }, aiSaving && { opacity: 0.6 }]}
                    onPress={saveAiDraft}
                    disabled={aiSaving}
                  >
                    {aiSaving
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={styles.generateBtnText}>Save to library</Text>}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <ScrollView style={{ maxHeight: vs(340) }}>
                  <Text style={styles.sheetLabel}>1 · CHOOSE CONTENT TYPE</Text>
                  {AI_TYPES.map(t => {
                    const meta = typeMeta(t.key);
                    const on = aiType === t.key;
                    return (
                      <TouchableOpacity
                        key={t.key}
                        style={[styles.aiRow, on && { borderColor: meta.color, backgroundColor: theme.surfaceAlt }]}
                        onPress={() => setAiType(t.key)}
                      >
                        <meta.Icon size={ms(17)} color={meta.color} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.aiRowTitle, on && { color: meta.color }]}>{t.label}</Text>
                          <Text style={styles.aiRowHint} numberOfLines={1}>{t.hint}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  <Text style={[styles.sheetLabel, { marginTop: vs(12) }]}>2 · LANGUAGE</Text>
                  <View style={styles.langRow}>
                    {AI_LANGUAGES.map(l => (
                      <TouchableOpacity
                        key={l.key}
                        style={[styles.chip, aiLang === l.key && styles.chipOn]}
                        onPress={() => setAiLang(l.key)}
                      >
                        <Text style={[styles.chipText, aiLang === l.key && styles.chipTextOn]}>{l.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.generateBtn, aiBusy && { opacity: 0.6 }]}
                  onPress={runAiGenerate}
                  disabled={aiBusy}
                >
                  {aiBusy
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.generateBtnText}>Generate</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  // The root SafeAreaView already applies the top inset for this screen.
  header: {
    flexDirection: 'row', alignItems: 'center', gap: hs(10),
    paddingHorizontal: hs(16), paddingTop: vs(12), paddingBottom: vs(10),
  },
  iconBtn: {
    width: hs(36), height: hs(36), borderRadius: ms(10), alignItems: 'center',
    justifyContent: 'center', backgroundColor: theme.surface,
    borderWidth: 1, borderColor: theme.border,
  },
  title: { fontSize: ms(20), fontWeight: '700', color: theme.text },
  subtitle: { fontSize: ms(11.5), color: theme.subtext, marginTop: vs(1) },

  crumbBar: { maxHeight: vs(38), flexGrow: 0 },
  crumbBarInner: { alignItems: 'center', paddingHorizontal: hs(16), gap: hs(2) },
  crumb: {
    flexDirection: 'row', alignItems: 'center', gap: hs(4),
    paddingHorizontal: hs(10), paddingVertical: vs(5), borderRadius: ms(20),
  },
  crumbOn: { backgroundColor: theme.primarySoft },
  crumbText: { fontSize: ms(12), color: theme.subtext, maxWidth: hs(130) },
  crumbTextOn: { color: theme.primary, fontWeight: '700' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: hs(8),
    marginHorizontal: hs(16), marginTop: vs(8), marginBottom: vs(4),
    paddingHorizontal: hs(12), height: vs(40), borderRadius: ms(12),
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
  },
  searchInput: { flex: 1, fontSize: ms(13.5), color: theme.text, padding: 0 },

  content: { paddingHorizontal: hs(16), paddingTop: vs(10), paddingBottom: vs(28) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: theme.danger, fontSize: ms(13.5), textAlign: 'center', paddingHorizontal: hs(30) },
  empty: { color: theme.subtext, fontSize: ms(13), textAlign: 'center', marginTop: vs(34) },

  card: {
    backgroundColor: theme.surface, borderRadius: ms(16), borderWidth: 1,
    borderColor: theme.border, padding: ms(14), marginBottom: vs(12),
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardIcon: { width: hs(38), height: hs(38), borderRadius: ms(11), alignItems: 'center', justifyContent: 'center' },
  badge: { backgroundColor: '#DCFCE7', paddingHorizontal: hs(9), paddingVertical: vs(3), borderRadius: ms(20) },
  badgeText: { fontSize: ms(10), fontWeight: '700', color: '#15803D' },
  cardTitle: { fontSize: ms(16.5), fontWeight: '700', color: theme.text, marginTop: vs(10) },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: hs(5), marginTop: vs(4) },
  metaText: { fontSize: ms(11.5), color: theme.subtext },
  cardFoot: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: theme.border, marginTop: vs(11), paddingTop: vs(9),
  },
  cardLink: { fontSize: ms(13), fontWeight: '600', color: theme.primary },

  rowCard: {
    flexDirection: 'row', alignItems: 'center', gap: hs(11),
    backgroundColor: theme.surface, borderRadius: ms(13), borderWidth: 1,
    borderColor: theme.border, padding: ms(13), marginBottom: vs(9),
  },
  numChip: {
    width: hs(27), height: hs(27), borderRadius: ms(14), backgroundColor: theme.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  numChipText: { fontSize: ms(12), fontWeight: '700', color: theme.primary },
  rowTitle: { flex: 1, fontSize: ms(14), fontWeight: '600', color: theme.text },

  chip: {
    paddingHorizontal: hs(13), paddingVertical: vs(7), borderRadius: ms(20),
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
  },
  chipOn: { backgroundColor: theme.primarySoft, borderColor: theme.primary },
  chipText: { fontSize: ms(12), color: theme.subtext, maxWidth: hs(160) },
  chipTextOn: { color: theme.primary, fontWeight: '700' },

  matHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: vs(12) },
  matCount: { fontSize: ms(12.5), color: theme.subtext, fontWeight: '600' },
  aiBtn: {
    flexDirection: 'row', alignItems: 'center', gap: hs(6),
    backgroundColor: '#7C3AED', paddingHorizontal: hs(13), paddingVertical: vs(8), borderRadius: ms(11),
  },
  aiBtnText: { color: '#fff', fontSize: ms(12.5), fontWeight: '700' },

  groupHead: { flexDirection: 'row', alignItems: 'center', gap: hs(7), marginBottom: vs(7) },
  groupTitle: { fontSize: ms(13.5), fontWeight: '700' },
  groupCount: {
    fontSize: ms(11), color: theme.subtext, backgroundColor: theme.surfaceAlt,
    paddingHorizontal: hs(7), paddingVertical: vs(1), borderRadius: ms(9), overflow: 'hidden',
  },
  matCard: {
    flexDirection: 'row', alignItems: 'center', gap: hs(8),
    backgroundColor: theme.surface, borderRadius: ms(12), borderWidth: 1,
    borderColor: theme.border, borderLeftWidth: ms(3.5),
    padding: ms(12), marginBottom: vs(8),
  },
  matTitle: { fontSize: ms(13.5), fontWeight: '600', color: theme.text },
  matMetaRow: { flexDirection: 'row', alignItems: 'center', gap: hs(4), marginTop: vs(3) },
  matMeta: { fontSize: ms(10), color: theme.subtext, fontWeight: '600' },
  matAction: {
    width: hs(32), height: hs(32), borderRadius: ms(9), alignItems: 'center',
    justifyContent: 'center', backgroundColor: theme.surfaceAlt,
  },

  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: theme.surface, borderTopLeftRadius: ms(20), borderTopRightRadius: ms(20),
    paddingBottom: vs(24), maxHeight: '86%',
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'center', gap: hs(10),
    paddingHorizontal: hs(20), paddingTop: vs(16), paddingBottom: vs(12),
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  sheetTitle: { fontSize: ms(16), fontWeight: '700', color: theme.text },
  sheetSub: { fontSize: ms(11.5), color: theme.subtext, marginTop: vs(1) },
  sheetLabel: {
    fontSize: ms(10.5), fontWeight: '700', color: theme.subtext,
    letterSpacing: 0.6, paddingHorizontal: hs(20), paddingTop: vs(14), paddingBottom: vs(8),
  },
  aiRow: {
    flexDirection: 'row', alignItems: 'center', gap: hs(11),
    marginHorizontal: hs(16), marginBottom: vs(8), padding: ms(12),
    borderRadius: ms(12), borderWidth: 1, borderColor: theme.border,
  },
  aiRowTitle: { fontSize: ms(13.5), fontWeight: '700', color: theme.text },
  aiRowHint: { fontSize: ms(11), color: theme.subtext, marginTop: vs(1) },
  langRow: { flexDirection: 'row', gap: hs(8), paddingHorizontal: hs(16), paddingBottom: vs(6) },

  generateBtn: {
    marginHorizontal: hs(16), marginTop: vs(12), height: vs(46), borderRadius: ms(13),
    backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center',
  },
  generateBtnText: { color: '#fff', fontSize: ms(15), fontWeight: '700' },
  draftActions: {
    flexDirection: 'row', alignItems: 'center', gap: hs(10),
    paddingHorizontal: hs(16), paddingTop: vs(12),
    borderTopWidth: 1, borderTopColor: theme.border,
  },
  secondaryBtn: {
    height: vs(46), paddingHorizontal: hs(18), borderRadius: ms(13),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border,
  },
  secondaryBtnText: { color: theme.text, fontSize: ms(14), fontWeight: '600' },
});
