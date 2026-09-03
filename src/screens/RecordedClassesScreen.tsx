import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Dimensions, Platform, StatusBar, SafeAreaView, Modal, PanResponder, Pressable, TextInput, KeyboardAvoidingView, Alert, Image } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import {
  Video, Sparkles, FileText, Loader, Play, Clock, Calendar, ChevronLeft, Search, Bell, X,
  Pause, RotateCcw, Volume2, VolumeX, Maximize, Minimize, CheckCircle2, XCircle,
  BookOpen, ListChecks, NotebookPen, PenLine, Check, MessageCircle, GraduationCap, Send,
  ChevronDown, SlidersHorizontal,
} from 'lucide-react-native';
import { schoolApi } from '../utils/api';
import { useAppTheme } from '../context/ThemeContext';
import { Markdown } from '../components/Markdown';
import { recordWatch, updateWatchProgress } from '../utils/watchHistory';
import VideoPlayer from 'react-native-video';

const { width, height } = Dimensions.get('window');

// The recordings payload is snake_case (recorded_date, video_url) and its
// duration is already a string in MINUTES, not seconds.
const normalizeRecording = (r: any) => ({
  ...r,
  title: r.title ?? '',
  subjectName: r.subjectName ?? r.subject_name ?? '',
  teacherName: r.teacherName ?? r.teacher_name ?? '',
  durationMins: Math.max(1, Math.round(Number(r.duration) || 0)),
  recordedDate: r.recorded_date ?? r.recordedAt ?? null,
  thumbnailUrl: r.thumbnail_url ?? r.thumbnailUrl ?? null,
  // In-video questions, each pinned to a percentage of the timeline.
  quiz: (Array.isArray(r.quiz) ? r.quiz : []).filter((q: any) => q && q.questionText),
  // Notes and transcript ship with the list response; no extra request needed.
  notes: typeof r.notes === 'string' ? r.notes : '',
  transcript: typeof r.transcript === 'string' ? r.transcript : '',
});

const SPEEDS = [1, 1.25, 1.5, 2, 0.5];

const formatTime = (secs: number) => {
  if (!isFinite(secs) || secs < 0) secs = 0;
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

export function RecordedClassesScreen({ onNavigate, embedded = false, resumeRecordingId = null }: any) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);

  const [loading, setLoading] = useState(true);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // --- subject / chapter / topic filters --------------------------------
  const [fSubject, setFSubject] = useState<string | null>(null);
  const [fChapter, setFChapter] = useState<string | null>(null);
  const [fTopic, setFTopic] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState<null | 'subject' | 'chapter' | 'topic'>(null);

  const uniq = (xs: any[]) => Array.from(new Set(xs.filter(Boolean))).sort();

  // Each level is drawn from what the level above still allows, so the lists
  // never offer a combination that yields nothing.
  const subjectOptions = uniq(recordings.map(r => r.subject_name));
  const chapterOptions = uniq(
    recordings
      .filter(r => !fSubject || r.subject_name === fSubject)
      .map(r => r.chapter_name),
  );
  const topicOptions = uniq(
    recordings
      .filter(r => (!fSubject || r.subject_name === fSubject) &&
                   (!fChapter || r.chapter_name === fChapter))
      .map(r => r.topic_name),
  );

  const visibleRecordings = recordings.filter(
    r =>
      (!fSubject || r.subject_name === fSubject) &&
      (!fChapter || r.chapter_name === fChapter) &&
      (!fTopic || r.topic_name === fTopic),
  );

  const activeFilters = [fSubject, fChapter, fTopic].filter(Boolean).length;

  const pickFilter = (value: string | null) => {
    // Narrowing an upper level invalidates the ones below it.
    if (filterOpen === 'subject') {
      setFSubject(value); setFChapter(null); setFTopic(null);
    } else if (filterOpen === 'chapter') {
      setFChapter(value); setFTopic(null);
    } else {
      setFTopic(value);
    }
    setFilterOpen(null);
  };

  const clearFilters = () => { setFSubject(null); setFChapter(null); setFTopic(null); };
  const [resumeSeconds, setResumeSeconds] = useState(0);
  // Watch progress is upserted on a timer, not on every onProgress tick
  // (which fires several times a second).
  const lastReportedRef = useRef(0);
  const durationRef = useRef(0);

  // --- player transport -------------------------------------------------
  const playerRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const hideTimer = useRef<any>(null);

  // Quiz gating: each question fires once, when playback passes its mark.
  const [panelTab, setPanelTab] =
    useState<'notes' | 'mynotes' | 'transcript' | 'quiz' | 'doubts'>('notes');

  // --- ask a doubt about this lecture ----------------------------------
  const LANGS = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिंदी' },
    { id: 'odia', label: 'ଓଡ଼ିଆ' },
  ];
  const [doubtText, setDoubtText] = useState('');
  const [doubtTarget, setDoubtTarget] = useState<'ai' | 'teacher'>('ai');
  const [doubtLang, setDoubtLang] = useState('en');
  const [doubtSending, setDoubtSending] = useState(false);
  const [pastDoubts, setPastDoubts] = useState<any[]>([]);
  const [pastFilter, setPastFilter] = useState<'ai' | 'teacher'>('ai');

  const loadPastDoubts = (recordingId: string) => {
    schoolApi
      .getDoubts()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setPastDoubts(list.filter((d: any) => d.recordingId === recordingId));
      })
      .catch(() => setPastDoubts([]));
  };

  const askDoubt = async () => {
    const body = doubtText.trim();
    if (body.length < 10) {
      Alert.alert('Add a bit more', 'Please describe your doubt in at least 10 characters.');
      return;
    }
    setDoubtSending(true);
    try {
      // Same shape the web client sends, so both surfaces read alike.
      const stamped =
        `${body} (At segment timestamp: ${formatTime(currentTime)})` +
        `\n\nLecture: ${activeVideo.title}`;
      await schoolApi.createDoubt({
        questionText: stamped,
        askTeacher: doubtTarget === 'teacher',
        recordingId: activeVideo.id,
        lectureTitle: activeVideo.title,
        timestampSeconds: Math.floor(currentTime),
        language: doubtLang,
        ...(activeVideo.subject_id
          ? { subjectId: activeVideo.subject_id, subjectName: activeVideo.subjectName }
          : {}),
      });
      setDoubtText('');
      setPastFilter(doubtTarget);
      loadPastDoubts(activeVideo.id);
      Alert.alert(
        'Doubt sent',
        doubtTarget === 'ai' ? 'The AI is answering your doubt.' : 'Your teacher has been notified.',
      );
    } catch (err: any) {
      Alert.alert('Could not send', err?.message || 'Your doubt was not submitted.');
    } finally {
      setDoubtSending(false);
    }
  };

  // --- personal notes (per recording) ----------------------------------
  const [myNotes, setMyNotes] = useState('');
  const [savedNotes, setSavedNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSavedAt, setNotesSavedAt] = useState<number | null>(null);
  const notesDirty = myNotes !== savedNotes;

  const saveMyNotes = async () => {
    if (!activeVideo?.id || notesSaving || !notesDirty) return;
    setNotesSaving(true);
    try {
      const res = await schoolApi.saveStudentNote(activeVideo.id, myNotes);
      const stored = typeof res?.notes === 'string' ? res.notes : myNotes;
      setSavedNotes(stored);
      setNotesSavedAt(Date.now());
    } catch (err: any) {
      Alert.alert('Could not save', err?.message || 'Your note was not saved.');
    } finally {
      setNotesSaving(false);
    }
  };
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const answeredRef = useRef<string[]>([]);
  answeredRef.current = answeredIds;

  const bumpControls = () => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3500);
  };

  useEffect(() => () => hideTimer.current && clearTimeout(hideTimer.current), []);

  const seekTo = (secs: number) => {
    const target = Math.max(0, Math.min(secs, durationRef.current || secs));
    playerRef.current?.seek(target);
    setCurrentTime(target);
  };

  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length];
    setRate(next);
    bumpControls();
  };

  // Scrub anywhere on the bar, by tap or drag.
  const seekFromX = (x: number) => {
    if (!barWidth || !durationRef.current) return;
    seekTo((Math.max(0, Math.min(x, barWidth)) / barWidth) * durationRef.current);
  };

  const barPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: e => {
        setScrubbing(true);
        seekFromXRef.current(e.nativeEvent.locationX);
      },
      onPanResponderMove: e => seekFromXRef.current(e.nativeEvent.locationX),
      onPanResponderRelease: () => {
        setScrubbing(false);
        bumpControlsRef.current();
      },
    }),
  ).current;
  // PanResponder is created once, so it reaches the latest closures by ref.
  const seekFromXRef = useRef(seekFromX);
  seekFromXRef.current = seekFromX;
  const bumpControlsRef = useRef(bumpControls);
  bumpControlsRef.current = bumpControls;

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const answerQuiz = (option: any) => {
    if (picked) return;
    setPicked(option.label);
    schoolApi
      .submitVideoQuizResponse(activeVideo.id, {
        questionId: activeQuiz.id,
        selectedOption: option.label,
      })
      .catch(() => {});
  };

  // Fires a question the first time playback passes its mark. Seeking backwards
  // does not re-ask: answered ids are remembered for the session.
  const maybeTriggerQuiz = (t: number) => {
    const list = activeVideo?.quiz;
    if (!list?.length || !durationRef.current) return;
    const pct = (t / durationRef.current) * 100;
    const due = list.find(
      (q: any) =>
        !answeredRef.current.includes(q.id) &&
        pct >= (Number(q.triggerAtPercent) || 0) &&
        pct < (Number(q.triggerAtPercent) || 0) + 8,
    );
    if (due) {
      setActiveQuiz(due);
      setPicked(null);
      setControlsVisible(true);
    }
  };

  const dismissQuiz = () => {
    if (activeQuiz) setAnsweredIds(prev => [...prev, activeQuiz.id]);
    setActiveQuiz(null);
    setPicked(null);
    setPaused(false);
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      try {
        const data = await schoolApi.getRecordings();
        let records = [];
        if (Array.isArray(data)) records = data;
        else if (data && Array.isArray(data.data)) records = data.data;
        else if (data && Array.isArray(data.recordings)) records = data.recordings;
        
        setRecordings(records.map(normalizeRecording));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecordings();
  }, []);

  // Arriving from the dashboard's Continue Learning shelf: open that recording
  // straight away. Guarded so it fires once, not on every re-render.
  const resumedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!resumeRecordingId || resumedRef.current === resumeRecordingId) return;
    const target = recordings.find((r: any) => r.id === resumeRecordingId);
    if (!target) return;
    resumedRef.current = resumeRecordingId;
    handlePlayVideo(target);
  }, [resumeRecordingId, recordings]);

  // The list's video_url is not reliably playable, so the play-url endpoint is
  // resolved right before playback. Fall back to the list URL only if it fails.
  const handlePlayVideo = async (item: any) => {
    // Feeds the dashboard's "Continue Learning" shelf.
    void recordWatch({
      id: item.id,
      title: item.title,
      subjectName: item.subjectName,
      teacherName: item.teacherName,
      thumbnailUrl: item.thumbnailUrl,
      durationMins: item.durationMins,
    });
    setIsVideoLoading(true);
    setVideoError(null);
    setActiveVideo({ ...item, playUrl: null });
    setResumeSeconds(0);
    lastReportedRef.current = 0;
    setPaused(false);
    setCurrentTime(0);
    setDuration(0);
    setRate(1);
    setFullscreen(false);
    setActiveQuiz(null);
    setPicked(null);
    setAnsweredIds([]);
    setPanelTab('notes');
    setMyNotes('');
    setSavedNotes('');
    setNotesSavedAt(null);
    setDoubtText('');
    setDoubtTarget('ai');
    setPastDoubts([]);
    loadPastDoubts(item.id);
    setNotesLoading(true);
    schoolApi
      .getStudentNotes(item.id)
      .then((res: any) => {
        const text = typeof res?.notes === 'string' ? res.notes : '';
        setMyNotes(text);
        setSavedNotes(text);
      })
      .catch(() => {})
      .finally(() => setNotesLoading(false));
    try {
      // Resume point is best-effort: a failure here must not block playback.
      schoolApi
        .getRecordingProgress(item.id)
        .then((p: any) => {
          const payload = p?.data ?? p;
          setResumeSeconds(Number(payload?.last_position_seconds) || 0);
        })
        .catch(() => {});

      const res = await schoolApi.getRecordingPlayUrl(item.id);
      const payload = res?.data ?? res;
      const url = payload?.videoUrl ?? item.video_url;
      if (!url) throw new Error('No playable URL was returned for this recording.');
      setActiveVideo({ ...item, playUrl: url });
    } catch (err: any) {
      const fallback = item.video_url;
      if (fallback) {
        setActiveVideo({ ...item, playUrl: fallback });
      } else {
        setIsVideoLoading(false);
        setVideoError(err?.message || 'Could not load this video.');
      }
    }
  };

  const reportProgress = (currentTime: number, duration: number, force = false) => {
    if (!activeVideo?.id || !currentTime) return;
    if (!force && currentTime - lastReportedRef.current < 15) return;
    lastReportedRef.current = currentTime;
    const pct = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
    schoolApi
      .upsertRecordingProgress(activeVideo.id, {
        watchPercentage: pct,
        lastPositionSeconds: Math.floor(currentTime),
        completed: pct >= 95,
      })
      .catch(() => {});
    void updateWatchProgress(activeVideo.id, pct, currentTime);
  };

  const closeVideo = () => {
    setActiveVideo(null);
    setIsVideoLoading(false);
    setVideoError(null);
    setResumeSeconds(0);
  };

  const renderStatCard = (icon: any, title: string, value: string | number, bg: string, color: string) => (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statTitle, { color }]} numberOfLines={1}>{title}</Text>
    </View>
  );

  if (activeVideo) {
    return (
      // A Modal so playback covers the whole screen. Rendered inline it would
      // sit inside the Videos tab body, boxed under that header and the tab bar.
      <Modal
        visible
        animationType="slide"
        onRequestClose={closeVideo}
        supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
        statusBarTranslucent
      >
      <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
        <View style={styles.videoHeader}>
          <TouchableOpacity style={styles.iconBtn} onPress={closeVideo}>
            <ChevronLeft size={ms(24)} color="#FFF" />
          </TouchableOpacity>
          <Text style={[styles.navTitle, styles.videoHeaderTitle]} numberOfLines={1}>
            {activeVideo.title}
          </Text>
        </View>
        <View style={styles.playerStage}>
        <View style={fullscreen ? styles.playerBoxFull : styles.playerBox}>
          {isVideoLoading && (
            <View style={styles.videoLoader}>
              <ActivityIndicator size="large" color="#FFF" />
            </View>
          )}

          {videoError ? (
            <View style={styles.videoLoader}>
              <Text style={styles.videoErrorText}>{videoError}</Text>
            </View>
          ) : activeVideo.playUrl ? (
            <Pressable style={styles.videoTapArea} onPress={bumpControls}>
              <VideoPlayer
                ref={playerRef}
                source={{ uri: activeVideo.playUrl, startPosition: resumeSeconds * 1000 }}
                style={styles.videoSurface}
                paused={paused || !!activeQuiz}
                rate={rate}
                muted={muted}
                resizeMode="contain"
                progressUpdateInterval={250}
                onProgress={({ currentTime: t, seekableDuration }) => {
                  if (!scrubbing) setCurrentTime(t);
                  reportProgress(t, seekableDuration);
                  maybeTriggerQuiz(t);
                }}
                onEnd={() => {
                  reportProgress(durationRef.current, durationRef.current, true);
                  setPaused(true);
                }}
                onLoad={({ duration: d }) => {
                  durationRef.current = d || 0;
                  setDuration(d || 0);
                  setIsVideoLoading(false);
                  bumpControls();
                }}
                onError={(e) => {
                  console.error('Video error:', e);
                  setIsVideoLoading(false);
                  setVideoError('This video could not be played.');
                }}
              />

              {/* Big centre play affordance while paused */}
              {paused && !activeQuiz && controlsVisible && (
                <TouchableOpacity
                  style={styles.centrePlay}
                  onPress={() => { setPaused(false); bumpControls(); }}
                  activeOpacity={0.85}
                >
                  <Play size={ms(30)} color="#FFF" fill="#FFF" />
                </TouchableOpacity>
              )}

              {controlsVisible && !activeQuiz && (
                <View style={styles.controlBar}>
                  {/* Scrub bar with quiz markers */}
                  <View style={styles.barRow} {...barPan.panHandlers}>
                    <View
                      style={styles.barTrack}
                      onLayout={e => setBarWidth(e.nativeEvent.layout.width)}
                    >
                      <View style={[styles.barFill, { width: `${progressPct}%` }]} />
                      {(activeVideo.quiz ?? []).map((q: any) => (
                        <View
                          key={q.id}
                          style={[
                            styles.quizMark,
                            { left: `${Math.min(99, Number(q.triggerAtPercent) || 0)}%` },
                            answeredIds.includes(q.id) && styles.quizMarkDone,
                          ]}
                        />
                      ))}
                      <View style={[styles.barThumb, { left: `${progressPct}%` }]} />
                    </View>
                  </View>

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      onPress={() => { setPaused(p => !p); bumpControls(); }}
                      style={styles.ctrlBtn}
                    >
                      {paused ? (
                        <Play size={ms(18)} color="#FFF" fill="#FFF" />
                      ) : (
                        <Pause size={ms(18)} color="#FFF" fill="#FFF" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => { seekTo(currentTime - 10); bumpControls(); }}
                      style={styles.ctrlBtn}
                    >
                      <RotateCcw size={ms(17)} color="#FFF" />
                    </TouchableOpacity>

                    <Text style={styles.timeText}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </Text>

                    <View style={{ flex: 1 }} />

                    <TouchableOpacity onPress={cycleSpeed} style={styles.speedBtn}>
                      <Text style={styles.speedText}>{rate}x</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => { setMuted(m => !m); bumpControls(); }}
                      style={styles.ctrlBtn}
                    >
                      {muted ? <VolumeX size={ms(17)} color="#FFF" /> : <Volume2 size={ms(17)} color="#FFF" />}
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => { setFullscreen(f => !f); bumpControls(); }}
                      style={styles.ctrlBtn}
                    >
                      {fullscreen ? <Minimize size={ms(17)} color="#FFF" /> : <Maximize size={ms(17)} color="#FFF" />}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Pressable>
          ) : null}

        </View>
          {/* Study panel. The web build puts these in a right sidebar; on a
              narrow screen they belong under the video as tabs. */}
          {!fullscreen && (
            <KeyboardAvoidingView
              style={styles.panel}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              keyboardVerticalOffset={vs(90)}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.panelTabsScroll}
                contentContainerStyle={styles.panelTabs}
              >
                {([
                  { id: 'notes', label: 'AI Notes', Icon: BookOpen },
                  { id: 'mynotes', label: 'My Notes', Icon: PenLine },
                  { id: 'transcript', label: 'Transcript', Icon: NotebookPen },
                  { id: 'quiz', label: 'Quiz', Icon: ListChecks },
                  { id: 'doubts', label: 'Ask', Icon: MessageCircle },
                ] as const).map(t => {
                  const on = panelTab === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.panelTab, on && styles.panelTabOn]}
                      onPress={() => setPanelTab(t.id)}
                      activeOpacity={0.8}
                    >
                      <t.Icon size={ms(14)} color={on ? theme.primary : theme.subtext} />
                      <Text
                        style={[styles.panelTabText, on && styles.panelTabTextOn]}
                        numberOfLines={1}
                      >
                        {t.label}
                      </Text>
                      {t.id === 'quiz' && !!activeVideo.quiz?.length && (
                        <View style={styles.panelCount}>
                          <Text style={styles.panelCountText}>{activeVideo.quiz.length}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <ScrollView
                style={styles.panelBody}
                contentContainerStyle={styles.panelContent}
                showsVerticalScrollIndicator
              >
                {panelTab === 'notes' &&
                  (activeVideo.notes ? (
                    <Markdown value={activeVideo.notes} theme={theme} compact />
                  ) : (
                    <Text style={styles.panelEmpty}>
                      {activeVideo.notes_status === 'processing'
                        ? 'AI notes are still being generated for this lecture.'
                        : 'No AI notes for this lecture yet.'}
                    </Text>
                  ))}

                {panelTab === 'mynotes' && (
                  notesLoading ? (
                    <ActivityIndicator color={theme.primary} style={{ marginTop: vs(24) }} />
                  ) : (
                    <View>
                      <Text style={styles.myNotesHint}>
                        Your own notes for this lecture. Only you can see them.
                      </Text>
                      <TextInput
                        style={styles.myNotesInput}
                        value={myNotes}
                        onChangeText={setMyNotes}
                        placeholder="Jot down what stood out in this lecture..."
                        placeholderTextColor={theme.subtext}
                        multiline
                        textAlignVertical="top"
                        editable={!notesSaving}
                      />
                      <View style={styles.myNotesFooter}>
                        <Text style={styles.myNotesStatus}>
                          {notesSaving
                            ? 'Saving...'
                            : notesDirty
                            ? 'Unsaved changes'
                            : notesSavedAt
                            ? 'Saved'
                            : ' '}
                        </Text>
                        <TouchableOpacity
                          style={[styles.myNotesSave, (!notesDirty || notesSaving) && styles.myNotesSaveOff]}
                          onPress={saveMyNotes}
                          disabled={!notesDirty || notesSaving}
                        >
                          <Check size={ms(15)} color="#FFF" />
                          <Text style={styles.myNotesSaveText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                )}

                {panelTab === 'doubts' && (
                  <View>
                    <View style={styles.doubtChips}>
                      <View style={styles.doubtChip}>
                        <Clock size={ms(12)} color={theme.primary} />
                        <Text style={styles.doubtChipText}>{formatTime(currentTime)}</Text>
                      </View>
                      {!!activeVideo.subjectName && (
                        <View style={styles.doubtChip}>
                          <BookOpen size={ms(12)} color={theme.primary} />
                          <Text style={styles.doubtChipText}>{activeVideo.subjectName}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.doubtToggle}>
                      {([
                        { id: 'ai', label: 'Ask AI', Icon: Sparkles },
                        { id: 'teacher', label: 'Ask Teacher', Icon: GraduationCap },
                      ] as const).map(o => {
                        const on = doubtTarget === o.id;
                        return (
                          <TouchableOpacity
                            key={o.id}
                            style={[styles.doubtToggleBtn, on && styles.doubtToggleBtnOn]}
                            onPress={() => setDoubtTarget(o.id)}
                            activeOpacity={0.85}
                          >
                            <o.Icon size={ms(14)} color={on ? theme.primary : theme.subtext} />
                            <Text style={[styles.doubtToggleText, on && styles.doubtToggleTextOn]}>
                              {o.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <TextInput
                      style={styles.doubtInput}
                      value={doubtText}
                      onChangeText={setDoubtText}
                      placeholder="What part of the lecture isn't clear? Be specific for a better answer..."
                      placeholderTextColor={theme.subtext}
                      multiline
                      textAlignVertical="top"
                      editable={!doubtSending}
                    />

                    <Text style={styles.doubtLabel}>RESPONSE LANGUAGE</Text>
                    <View style={styles.doubtLangRow}>
                      {LANGS.map(l => {
                        const on = doubtLang === l.id;
                        return (
                          <TouchableOpacity
                            key={l.id}
                            style={[styles.doubtLang, on && styles.doubtLangOn]}
                            onPress={() => setDoubtLang(l.id)}
                          >
                            <Text style={[styles.doubtLangText, on && styles.doubtLangTextOn]}>
                              {l.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <TouchableOpacity
                      style={[styles.doubtSend, doubtSending && styles.myNotesSaveOff]}
                      onPress={askDoubt}
                      disabled={doubtSending}
                      activeOpacity={0.85}
                    >
                      {doubtSending ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <>
                          {doubtTarget === 'ai'
                            ? <Sparkles size={ms(16)} color="#FFF" />
                            : <Send size={ms(15)} color="#FFF" />}
                          <Text style={styles.doubtSendText}>
                            {doubtTarget === 'ai' ? 'Get AI Answer' : 'Send to Teacher'}
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <View style={styles.pastHeader}>
                      <Text style={styles.pastTitle}>MY PAST DOUBTS</Text>
                      <View style={styles.pastFilter}>
                        {([
                          { id: 'ai', label: 'AI' },
                          { id: 'teacher', label: 'Teacher' },
                        ] as const).map(f => {
                          const n = pastDoubts.filter((d: any) =>
                            f.id === 'ai' ? d.channel === 'ai' : d.channel === 'teacher',
                          ).length;
                          const on = pastFilter === f.id;
                          return (
                            <TouchableOpacity
                              key={f.id}
                              style={[styles.pastFilterBtn, on && styles.pastFilterBtnOn]}
                              onPress={() => setPastFilter(f.id)}
                            >
                              <Text style={[styles.pastFilterText, on && styles.pastFilterTextOn]}>
                                {f.label} ({n})
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>

                    {(() => {
                      const shown = pastDoubts.filter((d: any) =>
                        pastFilter === 'ai' ? d.channel === 'ai' : d.channel === 'teacher',
                      );
                      if (!shown.length) {
                        return (
                          <Text style={styles.panelEmpty}>
                            No {pastFilter === 'ai' ? 'AI' : 'teacher'} doubts for this lecture yet.
                          </Text>
                        );
                      }
                      return shown.map((d: any) => (
                        <View key={d.id} style={styles.pastCard}>
                          <Text style={styles.pastQ} numberOfLines={2}>
                            {String(d.questionText).split('(At segment timestamp')[0].trim()}
                          </Text>
                          <Text style={styles.pastMeta}>
                            {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}
                            {d.status ? `  ·  ${String(d.status).replace(/_/g, ' ')}` : ''}
                          </Text>
                        </View>
                      ));
                    })()}
                  </View>
                )}

                {panelTab === 'transcript' &&
                  (activeVideo.transcript ? (
                    <Text style={styles.transcriptText}>{activeVideo.transcript}</Text>
                  ) : (
                    <Text style={styles.panelEmpty}>
                      {activeVideo.transcript_status === 'processing'
                        ? 'The transcript is still being generated.'
                        : 'No transcript for this lecture yet.'}
                    </Text>
                  ))}

                {panelTab === 'quiz' &&
                  (activeVideo.quiz?.length ? (
                    activeVideo.quiz.map((q: any, i: number) => (
                      <TouchableOpacity
                        key={q.id}
                        style={styles.quizCard}
                        activeOpacity={0.8}
                        onPress={() => {
                          // Jump to where the question fires and re-ask it.
                          const at = ((Number(q.triggerAtPercent) || 0) / 100) * (durationRef.current || 0);
                          seekTo(Math.max(0, at - 1));
                          setAnsweredIds(prev => prev.filter(id => id !== q.id));
                          setPicked(null);
                          setActiveQuiz(q);
                        }}
                      >
                        <View style={styles.quizCardTop}>
                          <Text style={styles.quizCardSeg}>
                            {q.segmentTitle ?? `Question ${i + 1}`}
                          </Text>
                          <Text style={styles.quizCardAt}>{q.triggerAtPercent}%</Text>
                        </View>
                        <Text style={styles.quizCardQ} numberOfLines={3}>
                          {String(q.questionText).replace(/\*+/g, '')}
                        </Text>
                        {answeredIds.includes(q.id) && (
                          <Text style={styles.quizCardDone}>✓ Answered</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.panelEmpty}>No quiz for this lecture yet.</Text>
                  ))}
              </ScrollView>
            </KeyboardAvoidingView>
          )}

          {/* In-video quiz: playback is held until it is dismissed. */}
          {activeQuiz && (
            <View style={styles.quizOverlay}>
              <ScrollView contentContainerStyle={styles.quizScroll}>
                <Text style={styles.quizSegment}>{activeQuiz.segmentTitle ?? 'Quick check'}</Text>
                <Text style={styles.quizQuestion}>{String(activeQuiz.questionText).replace(/\*+/g, '')}</Text>

                {(activeQuiz.options ?? []).map((opt: any) => {
                  const isPicked = picked === opt.label;
                  const isCorrect = opt.label === activeQuiz.correctOption;
                  const reveal = picked !== null;
                  return (
                    <TouchableOpacity
                      key={opt.label}
                      style={[
                        styles.quizOption,
                        reveal && isCorrect && styles.quizOptionCorrect,
                        reveal && isPicked && !isCorrect && styles.quizOptionWrong,
                      ]}
                      onPress={() => answerQuiz(opt)}
                      disabled={reveal}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.quizOptionLabel}>{opt.label}</Text>
                      <Text style={styles.quizOptionText}>{opt.text}</Text>
                      {reveal && isCorrect && <CheckCircle2 size={ms(18)} color="#10B981" />}
                      {reveal && isPicked && !isCorrect && <XCircle size={ms(18)} color="#EF4444" />}
                    </TouchableOpacity>
                  );
                })}

                {picked !== null && !!activeQuiz.explanation && (
                  <Text style={styles.quizExplain}>
                    {activeQuiz.explanation.replace(/\*+/g, '')}
                  </Text>
                )}

                <TouchableOpacity style={styles.quizContinue} onPress={dismissQuiz}>
                  <Text style={styles.quizContinueText}>
                    {picked === null ? 'Skip' : 'Continue watching'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </View>
      </SafeAreaView>
      </Modal>
    );
  }

  // Inside the Videos tab the parent supplies the frame and title.
  const Frame: any = embedded ? View : SafeAreaView;

  return (
    <Frame style={styles.container}>
      {!embedded && (
        <View style={styles.topNav}>
          <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate && onNavigate('videos')}>
            <ChevronLeft size={ms(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Recorded Classes</Text>
          <View style={styles.navActions}>
            <TouchableOpacity style={styles.iconBtn}><Search size={ms(20)} color={theme.subtext} /></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}><Bell size={ms(20)} color={theme.subtext} /></TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} style={{ backgroundColor: theme.background }}>
        
        {!embedded && (
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Recorded Classes</Text>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
          {renderStatCard(<Video size={ms(15)} color={theme.primary} />, 'LECTURES', visibleRecordings.length, '#EFF6FF', theme.primary)}
          {renderStatCard(<Sparkles size={ms(15)} color="#10B981" />, 'AI NOTES', 0, '#ECFDF5', '#10B981')}
        </ScrollView>

        {/* Subject -> chapter -> topic, each narrowing the next. */}
        <View style={styles.filterRow}>
          {([
            { id: 'subject', label: 'All Subjects', value: fSubject, count: subjectOptions.length },
            { id: 'chapter', label: 'All Chapters', value: fChapter, count: chapterOptions.length },
            { id: 'topic', label: 'All Topics', value: fTopic, count: topicOptions.length },
          ] as const).map(f => {
            const on = !!f.value;
            const empty = f.count === 0;
            return (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, on && styles.filterChipOn, empty && styles.filterChipOff]}
                onPress={() => !empty && setFilterOpen(f.id)}
                disabled={empty}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.filterChipText, on && styles.filterChipTextOn]}
                  numberOfLines={1}
                >
                  {f.value ?? f.label}
                </Text>
                <ChevronDown size={ms(13)} color={on ? theme.primary : theme.subtext} />
              </TouchableOpacity>
            );
          })}
        </View>

        {activeFilters > 0 && (
          <View style={styles.filterSummary}>
            <SlidersHorizontal size={ms(13)} color={theme.subtext} />
            <Text style={styles.filterSummaryText}>
              {visibleRecordings.length} of {recordings.length} lectures
            </Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={styles.filterClear}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: vs(40) }} />
        ) : visibleRecordings.length === 0 ? (
          <Text style={styles.filterEmpty}>No lectures match these filters.</Text>
        ) : (
          <View style={styles.listContainer}>
            {visibleRecordings.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                style={styles.card}
                onPress={() => handlePlayVideo(item)}
                activeOpacity={0.85}
              >
                <View style={styles.thumbnailContainer}>
                  {/* The dark container stays as the backdrop, so a missing or
                      slow thumbnail still reads as a video tile. */}
                  {!!item.thumbnailUrl && (
                    <Image
                      source={{ uri: item.thumbnailUrl }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.thumbnailOverlay}>
                    <Play size={ms(32)} color={theme.surface} fill="#FFF" />
                  </View>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{item.durationMins} mins</Text>
                  </View>
                  <View style={styles.thumbnailLabel}>
                    <Text style={styles.thumbnailLabelText}>{item.subjectName}</Text>
                  </View>
                </View>

                <View style={styles.cardContent}>
                  <Text style={styles.subjectText}>{item.subjectName}</Text>
                  <Text style={styles.titleText}>{item.title}</Text>
                  <Text style={styles.chapterText}>{item.teacherName}</Text>
                  
                  {/* Date on the left, the play action opposite it. */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <Calendar size={ms(14)} color={theme.subtext} />
                      <Text style={styles.metaText}>{item.recordedDate ? new Date(item.recordedDate).toLocaleDateString() : '--'}</Text>
                    </View>

                    <TouchableOpacity style={styles.watchBtn} onPress={() => handlePlayVideo(item)}>
                      <Play size={ms(12)} color={theme.surface} fill="#FFF" style={{ marginRight: hs(5) }} />
                      <Text style={styles.watchBtnText}>Watch Video</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={filterOpen !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterOpen(null)}
      >
        <TouchableOpacity
          style={styles.sheetBackdrop}
          activeOpacity={1}
          onPress={() => setFilterOpen(null)}
        >
          <TouchableOpacity style={styles.sheet} activeOpacity={1}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {filterOpen === 'subject' ? 'Subject' : filterOpen === 'chapter' ? 'Chapter' : 'Topic'}
              </Text>
              <TouchableOpacity onPress={() => setFilterOpen(null)} style={{ padding: ms(4) }}>
                <X size={ms(20)} color={theme.subtext} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[null,
                ...(filterOpen === 'subject'
                  ? subjectOptions
                  : filterOpen === 'chapter'
                  ? chapterOptions
                  : topicOptions),
              ].map((opt, i) => {
                const current =
                  filterOpen === 'subject' ? fSubject : filterOpen === 'chapter' ? fChapter : fTopic;
                const selected = current === opt;
                const allLabel =
                  filterOpen === 'subject' ? 'All Subjects'
                  : filterOpen === 'chapter' ? 'All Chapters' : 'All Topics';
                return (
                  <TouchableOpacity
                    key={opt ?? `all-${i}`}
                    style={styles.sheetRow}
                    onPress={() => pickFilter(opt)}
                  >
                    <Text style={[styles.sheetRowText, selected && styles.sheetRowTextOn]}>
                      {opt ?? allLabel}
                    </Text>
                    {selected && <Check size={ms(17)} color={theme.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Frame>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    paddingVertical: vs(12),
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.surfaceAlt,
  },
  backBtn: {
    padding: hs(4),
  },
  navTitle: {
    flex: 1,
    fontSize: ms(18),
    fontWeight: '600',
    color: theme.text,
    marginLeft: hs(12),
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(16),
  },
  iconBtn: {
    padding: hs(4),
  },
  content: {
    padding: hs(20),
    paddingBottom: vs(40),
  },
  header: {
    marginBottom: vs(24),
  },
  pageTitle: {
    fontSize: ms(24),
    fontWeight: '700',
    color: theme.text,
    marginBottom: vs(8),
  },
  statsContainer: {
    flexDirection: 'row',
    gap: hs(10),
    marginBottom: vs(18),
  },
  // One compact row: icon, count, label. The old card stacked these with a
  // restating subtitle and ate a sixth of the screen.
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    paddingHorizontal: hs(12),
    paddingVertical: vs(8),
    borderRadius: ms(12),
  },
  statTitle: {
    fontSize: ms(10.5),
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: ms(16),
    fontWeight: '700',
    color: theme.text,
  },
  filterRow: {
    flexDirection: 'row',
    gap: hs(8),
    marginBottom: vs(12),
  },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: hs(4),
    paddingHorizontal: hs(10),
    paddingVertical: vs(8),
    borderRadius: ms(10),
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  filterChipOn: {
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft ?? '#EFF6FF',
  },
  filterChipOff: {
    opacity: 0.45,
  },
  filterChipText: {
    flex: 1,
    fontSize: ms(11.5),
    fontWeight: '600',
    color: theme.subtext,
  },
  filterChipTextOn: {
    color: theme.primary,
  },
  filterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    marginBottom: vs(12),
  },
  filterSummaryText: {
    flex: 1,
    fontSize: ms(11.5),
    color: theme.subtext,
  },
  filterClear: {
    fontSize: ms(12),
    fontWeight: '700',
    color: theme.primary,
  },
  filterEmpty: {
    textAlign: 'center',
    color: theme.subtext,
    fontSize: ms(13),
    paddingVertical: vs(40),
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: ms(20),
    borderTopRightRadius: ms(20),
    paddingBottom: vs(24),
    maxHeight: '70%',
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
  sheetTitle: {
    fontSize: ms(16),
    fontWeight: '700',
    color: theme.text,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: hs(20),
    paddingVertical: vs(14),
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sheetRowText: {
    fontSize: ms(14),
    color: theme.text,
    flex: 1,
  },
  sheetRowTextOn: {
    color: theme.primary,
    fontWeight: '700',
  },
  listContainer: {
    gap: vs(16),
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: ms(16),
    padding: hs(16),
    flexDirection: 'column',
    gap: vs(16),
    borderWidth: 1,
    borderColor: theme.surfaceAlt,
    ...Platform.select({
      ios: {
        shadowColor: theme.subtext,
        shadowOffset: { width: 0, height: vs(4) },
        shadowOpacity: 0.05,
        shadowRadius: ms(12),
      },
      android: {
        elevation: 2,
      },
    }),
  },
  thumbnailContainer: {
    width: '100%',
    height: vs(160),
    backgroundColor: theme.text, // Dark gradient placeholder
    borderRadius: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  // A white scrim read fine against the old dark placeholder but disappears
  // on a real (often light) thumbnail, so the disc is dark now.
  thumbnailOverlay: {
    width: ms(60),
    height: ms(60),
    borderRadius: ms(30),
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: hs(12),
    right: hs(12),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(6),
  },
  durationText: {
    color: theme.surface,
    fontSize: ms(11),
    fontWeight: '600',
  },
  thumbnailLabel: {
    position: 'absolute',
    top: hs(12),
    left: hs(12),
    backgroundColor: theme.primary,
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(4),
  },
  thumbnailLabelText: {
    color: theme.surface,
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
  },
  subjectText: {
    fontSize: ms(11),
    fontWeight: '700',
    color: theme.subtext,
    letterSpacing: 1,
    marginBottom: vs(4),
  },
  titleText: {
    fontSize: ms(16),
    fontWeight: '700',
    color: theme.text,
    marginBottom: vs(4),
  },
  chapterText: {
    fontSize: ms(14),
    color: theme.subtext,
    marginBottom: vs(12),
  },
  aiNotesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: ms(20),
    marginBottom: vs(16),
  },
  aiNotesText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: '#10B981',
    marginLeft: hs(6),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: hs(12),
    marginTop: vs(4),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: ms(12),
    color: theme.subtext,
    marginLeft: hs(6),
  },
  notesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(12),
  },
  notesPillText: {
    fontSize: ms(11),
    fontWeight: '600',
    color: '#10B981',
    marginLeft: hs(4),
  },
  // The whole card plays now, so this is a secondary affordance: sized to its
  // label rather than a full-width primary action.
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primary,
    paddingVertical: vs(7),
    paddingHorizontal: hs(14),
    borderRadius: ms(18),
  },
  watchBtnText: {
    fontSize: ms(12.5),
    fontWeight: '600',
    color: theme.surface,
  },
  videoHeaderTitle: {
    color: '#FFF',
    flex: 1,
    marginLeft: hs(8),
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(20),
    paddingVertical: vs(12),
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  // 16:9 keeps the picture correctly proportioned and centred; fullscreen
  // lets it fill whatever space is left below the header.
  // The quiz needs the whole area below the header, not just the 16:9 box.
  playerStage: {
    flex: 1,
  },
  playerBox: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  playerBoxFull: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  videoTapArea: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  videoSurface: {
    ...StyleSheet.absoluteFillObject,
  },
  centrePlay: {
    alignSelf: 'center',
    width: ms(58),
    height: ms(58),
    borderRadius: ms(29),
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: hs(10),
    paddingBottom: vs(8),
    paddingTop: vs(20),
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  barRow: {
    paddingVertical: vs(8),
    justifyContent: 'center',
  },
  barTrack: {
    height: vs(3),
    borderRadius: ms(2),
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
  },
  barFill: {
    height: vs(3),
    borderRadius: ms(2),
    backgroundColor: '#2563EB',
  },
  barThumb: {
    position: 'absolute',
    width: ms(11),
    height: ms(11),
    borderRadius: ms(6),
    backgroundColor: '#FFF',
    marginLeft: -ms(5.5),
  },
  // The web build marks in-video questions on the timeline; same idea here.
  quizMark: {
    position: 'absolute',
    width: ms(7),
    height: ms(7),
    borderRadius: ms(4),
    backgroundColor: '#F59E0B',
    marginLeft: -ms(3.5),
  },
  quizMarkDone: {
    backgroundColor: '#10B981',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
  },
  ctrlBtn: {
    padding: ms(6),
  },
  timeText: {
    color: '#FFF',
    fontSize: ms(11),
    marginLeft: hs(4),
    fontVariant: ['tabular-nums'],
  },
  speedBtn: {
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    borderRadius: ms(6),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginRight: hs(2),
  },
  speedText: {
    color: '#FFF',
    fontSize: ms(11),
    fontWeight: '700',
  },
  panel: {
    flex: 1,
    backgroundColor: theme.background,
  },
  panelTabsScroll: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  panelTabs: {
    flexDirection: 'row',
    paddingHorizontal: hs(4),
  },
  // Five tabs scroll horizontally, so each sizes to its label instead of
  // being squeezed into an equal share of the width.
  panelTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(5),
    paddingVertical: vs(11),
    paddingHorizontal: hs(12),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  panelTabOn: {
    borderBottomColor: theme.primary,
  },
  panelTabText: {
    fontSize: ms(12),
    fontWeight: '600',
    color: theme.subtext,
  },
  panelTabTextOn: {
    color: theme.primary,
  },
  panelCount: {
    minWidth: ms(16),
    paddingHorizontal: hs(4),
    paddingVertical: vs(1),
    borderRadius: ms(8),
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  panelCountText: {
    color: '#FFF',
    fontSize: ms(9),
    fontWeight: '700',
  },
  panelBody: {
    flex: 1,
  },
  panelContent: {
    padding: ms(16),
    paddingBottom: vs(40),
  },
  myNotesHint: {
    fontSize: ms(11.5),
    color: theme.subtext,
    marginBottom: vs(8),
  },
  myNotesInput: {
    minHeight: vs(150),
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: ms(12),
    backgroundColor: theme.surface,
    padding: ms(12),
    fontSize: ms(13.5),
    lineHeight: ms(20),
    color: theme.text,
  },
  myNotesFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vs(10),
  },
  myNotesStatus: {
    fontSize: ms(11.5),
    color: theme.subtext,
  },
  myNotesSave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(5),
    backgroundColor: theme.primary,
    paddingHorizontal: hs(16),
    paddingVertical: vs(8),
    borderRadius: ms(20),
  },
  myNotesSaveOff: {
    opacity: 0.45,
  },
  myNotesSaveText: {
    color: '#FFF',
    fontSize: ms(13),
    fontWeight: '700',
  },
  doubtChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(8),
    marginBottom: vs(12),
  },
  doubtChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(5),
    paddingHorizontal: hs(10),
    paddingVertical: vs(5),
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft ?? '#EFF6FF',
  },
  doubtChipText: {
    fontSize: ms(11.5),
    fontWeight: '600',
    color: theme.primary,
  },
  doubtToggle: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    borderRadius: ms(12),
    padding: ms(4),
    gap: hs(4),
    marginBottom: vs(12),
  },
  doubtToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(6),
    paddingVertical: vs(9),
    borderRadius: ms(9),
  },
  doubtToggleBtnOn: {
    backgroundColor: theme.surface,
  },
  doubtToggleText: {
    fontSize: ms(13),
    fontWeight: '600',
    color: theme.subtext,
  },
  doubtToggleTextOn: {
    color: theme.primary,
  },
  doubtInput: {
    minHeight: vs(110),
    borderWidth: 1,
    borderColor: theme.primary,
    borderRadius: ms(12),
    backgroundColor: theme.surface,
    padding: ms(12),
    fontSize: ms(13.5),
    lineHeight: ms(20),
    color: theme.text,
  },
  doubtLabel: {
    fontSize: ms(10.5),
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.subtext,
    marginTop: vs(14),
    marginBottom: vs(6),
  },
  doubtLangRow: {
    flexDirection: 'row',
    gap: hs(8),
  },
  doubtLang: {
    paddingHorizontal: hs(14),
    paddingVertical: vs(7),
    borderRadius: ms(18),
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  doubtLangOn: {
    borderColor: theme.primary,
    backgroundColor: theme.primarySoft ?? '#EFF6FF',
  },
  doubtLangText: {
    fontSize: ms(12.5),
    color: theme.subtext,
    fontWeight: '600',
  },
  doubtLangTextOn: {
    color: theme.primary,
  },
  doubtSend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    backgroundColor: theme.primary,
    borderRadius: ms(12),
    paddingVertical: vs(13),
    marginTop: vs(16),
  },
  doubtSendText: {
    color: '#FFF',
    fontSize: ms(14.5),
    fontWeight: '700',
  },
  pastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vs(24),
    marginBottom: vs(10),
    paddingTop: vs(16),
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  pastTitle: {
    fontSize: ms(11),
    fontWeight: '700',
    letterSpacing: 0.8,
    color: theme.subtext,
  },
  pastFilter: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    borderRadius: ms(10),
    padding: ms(3),
    gap: hs(2),
  },
  pastFilterBtn: {
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(8),
  },
  pastFilterBtnOn: {
    backgroundColor: theme.surface,
  },
  pastFilterText: {
    fontSize: ms(11.5),
    fontWeight: '600',
    color: theme.subtext,
  },
  pastFilterTextOn: {
    color: theme.primary,
  },
  pastCard: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: ms(10),
    padding: ms(11),
    marginBottom: vs(8),
  },
  pastQ: {
    fontSize: ms(13),
    lineHeight: ms(19),
    color: theme.text,
  },
  pastMeta: {
    fontSize: ms(11),
    color: theme.subtext,
    marginTop: vs(5),
  },
  panelEmpty: {
    fontSize: ms(13),
    color: theme.subtext,
    textAlign: 'center',
    paddingVertical: vs(30),
  },
  transcriptText: {
    fontSize: ms(13),
    lineHeight: ms(21),
    color: theme.text,
  },
  quizCard: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: ms(12),
    padding: ms(12),
    marginBottom: vs(10),
  },
  quizCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(6),
  },
  quizCardSeg: {
    fontSize: ms(10.5),
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#F59E0B',
    textTransform: 'uppercase',
  },
  quizCardAt: {
    fontSize: ms(11),
    color: theme.subtext,
  },
  quizCardQ: {
    fontSize: ms(13),
    lineHeight: ms(19),
    color: theme.text,
  },
  quizCardDone: {
    marginTop: vs(6),
    fontSize: ms(11),
    fontWeight: '700',
    color: '#10B981',
  },
  quizOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2,6,23,0.94)',
  },
  quizScroll: {
    padding: ms(16),
    paddingBottom: vs(24),
  },
  quizSegment: {
    color: '#F59E0B',
    fontSize: ms(11),
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: vs(6),
  },
  quizQuestion: {
    color: '#FFF',
    fontSize: ms(14),
    fontWeight: '600',
    lineHeight: ms(20),
    marginBottom: vs(12),
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: ms(10),
    paddingHorizontal: hs(12),
    paddingVertical: vs(10),
    marginBottom: vs(8),
  },
  quizOptionCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  quizOptionWrong: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  quizOptionLabel: {
    color: '#93C5FD',
    fontSize: ms(12),
    fontWeight: '700',
    width: hs(16),
  },
  quizOptionText: {
    color: '#E2E8F0',
    fontSize: ms(13),
    flex: 1,
  },
  quizExplain: {
    color: '#94A3B8',
    fontSize: ms(12),
    lineHeight: ms(18),
    marginTop: vs(4),
    marginBottom: vs(10),
  },
  quizContinue: {
    backgroundColor: '#2563EB',
    borderRadius: ms(10),
    paddingVertical: vs(11),
    alignItems: 'center',
    marginTop: vs(4),
  },
  quizContinueText: {
    color: '#FFF',
    fontSize: ms(14),
    fontWeight: '700',
  },
  videoLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  videoErrorText: {
    color: '#FFF',
    fontSize: ms(13),
    textAlign: 'center',
    paddingHorizontal: hs(24),
  },
  // 16:9 keeps the picture correctly proportioned and centred, rather than
  // stretching the surface to the full container height and letterboxing it.
});
