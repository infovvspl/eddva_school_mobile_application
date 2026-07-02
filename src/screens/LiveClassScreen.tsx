import React, { useState, useEffect, useRef, useCallback } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from '../components/Icon';

import { USE_MOCK } from '../config/appConfig';

import LessonVideoPlayer, {
  type LessonVideoPlayerRef,
} from '../components/learning/LessonVideoPlayer';
import AgoraLivePlayer from '../components/learning/AgoraLivePlayer';
import MarkdownRenderer from '../components/learning/MarkdownRenderer';
import RichText from '../components/learning/RichText';
import { normalizeQuizCheckpoints } from '../utils/videoQuizCheckpoints';
import { normalizeNotesContent } from '../utils/formatNotes';
import { shouldUseKatex } from '../utils/renderMathHtml';
import { extractLectureThumbnailUrl, resolveMediaUrl } from '../utils/mediaUrl';
import { pickVideoUrlFromRecord, resolveVideoUrl } from '../utils/videoSource';
import { pickLiveStreamUrl } from '../utils/liveStreamUrl';
import {
  isAgoraStreamType,
  parseAgoraJoinConfig,
  type AgoraJoinConfig,
} from '../utils/agoraLive';

import { DEMO_LECTURE_VIDEO_URL } from '../mocks/mockLiveClassService';

import { Colors } from '../constants/theme';

import { liveClassService } from '../services/liveclass.service';
import { asArray } from '../utils/apiData';

import { contentService } from '../services/content.service';

import { toPercent } from '../utils/progress';

import {
  fetchLectureById,
  resolveLecturePlayback,
  type LecturePlayback,
} from '../utils/lecturePlayback';

import {
  font,
  hs,
  ms,
  spacing,
  useScreenLayout,
  vs,
} from '../utils/responsive';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveClass'>;

type AiTab = 'notes' | 'transcript' | 'quiz' | 'doubt';
type SpeechChunk = {
  id: string;
  text: string;
};

const AI_TABS: { key: AiTab; label: string }[] = [
  { key: 'notes', label: 'AI Notes' },

  { key: 'transcript', label: 'Transcript' },

  { key: 'quiz', label: 'Quiz' },

  { key: 'doubt', label: 'Ask Doubt' },
];

const LIVE_STATUSES = new Set(['live', 'ongoing', 'active']);

function isStreamLive(
  stream?: Record<string, unknown> | null,
  session?: Record<string, unknown> | null,
): boolean {
  if (stream?.isLive === true || stream?.is_live === true) return true;
  const hls = pickLiveStreamUrl(stream, session);
  if (hls && (stream?.isLive === true || stream?.is_live === true)) return true;
  const status = String(session?.status ?? stream?.status ?? '').toLowerCase();
  return LIVE_STATUSES.has(status);
}

function mergeStreamPayload(
  stream?: Record<string, unknown> | null,
  session?: Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!stream && !session) return null;
  return { ...(session ?? {}), ...(stream ?? {}) };
}

function formatLectureDate(iso?: string | null): string {
  if (!iso) return '';

  const d = new Date(iso);

  if (Number.isNaN(d.getTime())) return '';

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}



const LiveClassScreen: React.FC<Props> = ({ navigation, route }) => {
  const screen = useScreenLayout();
  const insets = useSafeAreaInsets();

  const {
    lectureId,
    title,
    teacherName,
    batchId,
    topicId,
    initialSeekPercent,
    videoUrl: routeVideoUrl,
    thumbnailUrl: routeThumbnailUrl,
  } = route.params;

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState<string | null>(null);

  const [lecture, setLecture] = useState<LecturePlayback | null>(null);

  const [resolvedLectureId, setResolvedLectureId] = useState(lectureId);

  const [liveSession, setLiveSession] = useState<Record<
    string,
    unknown
  > | null>(null);

  const [streamStatus, setStreamStatus] = useState<Record<
    string,
    unknown
  > | null>(null);

  const [streamLive, setStreamLive] = useState(false);

  const [agoraConfig, setAgoraConfig] = useState<AgoraJoinConfig | null>(null);

  const [chatMessages, setChatMessages] = useState<
    { id: string; senderName?: string; message: string; isMe?: boolean }[]
  >([]);

  const [aiTab, setAiTab] = useState<AiTab>('notes');

  const [doubtText, setDoubtText] = useState('');

  const [hindiNotes, setHindiNotes] = useState(false);

  const [hindiTranscript, setHindiTranscript] = useState(false);

  const [notesHi, setNotesHi] = useState<string | null>(null);

  const [translating, setTranslating] = useState(false);

  const [progressPct, setProgressPct] = useState(0);


  const lastSaveRef = useRef(0);

  const watchRef = useRef({ position: 0, duration: 0 });

  const videoPlayerRef = useRef<LessonVideoPlayerRef>(null);


  const lessonTitle = lecture?.title || title || 'Lesson';

  const videoUrl =
    resolveVideoUrl(lecture?.videoUrl) ||
    resolveVideoUrl(routeVideoUrl) ||
    pickLiveStreamUrl(liveSession, streamStatus) ||
    pickVideoUrlFromRecord(liveSession) ||
    pickVideoUrlFromRecord(streamStatus) ||
    (USE_MOCK && streamLive ? DEMO_LECTURE_VIDEO_URL : '');

  const quizItems = normalizeQuizCheckpoints(lecture?.quizCheckpoints ?? []);

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    setLoadError(null);

    setLecture(null);

    setNotesHi(null);

    setLiveSession(null);

    setStreamStatus(null);

    setStreamLive(false);

    setAgoraConfig(null);

    setHindiNotes(false);

    setHindiTranscript(false);

    (async () => {
      try {
        const resolved = await resolveLecturePlayback({
          lectureId,
          topicId,
          batchId,
        });

        if (!mounted) return;

        if (!resolved?.id) {
          setLoadError(
            'Could not load this lecture. Enroll in the course to watch.',
          );
          return;
        }

        setLecture(resolved);
        setResolvedLectureId(resolved.id);

        const loadLiveStream = async (id: string) => {
          const [streamRes, sessionRes] = await Promise.all([
            liveClassService.getStreamStatus(id).catch(() => ({ data: null })),
            liveClassService.getSession(id).catch(() => ({ data: null })),
          ]);
          const stream = streamRes.data as Record<string, unknown> | null;
          const session = sessionRes.data as Record<string, unknown> | null;
          const merged = mergeStreamPayload(stream, session);
          const bunnyUrl = pickLiveStreamUrl(stream, session);
          const sessionStatus = String(session?.status ?? '').toLowerCase();
          const live =
            isStreamLive(stream, session) ||
            Boolean(bunnyUrl && stream?.isLive) ||
            sessionStatus === 'live';

          if (!mounted) return;

          setStreamStatus(stream);
          setStreamLive(live || Boolean(bunnyUrl));

          if (merged) {
            setLiveSession(merged);
          }

          const streamType = String(
            session?.streamType ?? stream?.streamType ?? '',
          ).toLowerCase();
          const isAgora =
            streamType === 'agora' ||
            isAgoraStreamType(session) ||
            isAgoraStreamType(stream);

          if (isAgora && live && !bunnyUrl) {
            try {
              const { data: tokenData } = await liveClassService.getToken({
                lectureId: id,
                role: 'audience',
              });
              if (!mounted) return;
              const cfg = parseAgoraJoinConfig(merged, tokenData);
              setAgoraConfig(cfg);
              setLiveSession(prev => ({
                ...(prev ?? {}),
                ...(merged ?? {}),
                token: tokenData,
              }));
            } catch {
              if (!mounted) return;
              setAgoraConfig(null);
            }
          } else {
            setAgoraConfig(null);
          }
        };

        await loadLiveStream(resolved.id);

        if (!mounted) return;

        if (!resolved.aiNotesMarkdown && resolved.id) {
          const withNotes = await fetchLectureById(resolved.id);
          if (mounted && withNotes?.aiNotesMarkdown) {
            setLecture(prev =>
              prev
                ? { ...prev, aiNotesMarkdown: withNotes.aiNotesMarkdown }
                : withNotes,
            );
          }
        }
      } catch {
        if (mounted) {
          setLoadError(
            'Could not load this lecture. Enroll in the course to watch.',
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [lectureId, topicId, batchId]);

  useEffect(() => {
    if (!resolvedLectureId || videoUrl) return;

    let mounted = true;

    const poll = async () => {
      try {
        const [streamRes, sessionRes] = await Promise.all([
          liveClassService
            .getStreamStatus(resolvedLectureId)
            .catch(() => ({ data: null })),
          liveClassService
            .getSession(resolvedLectureId)
            .catch(() => ({ data: null })),
        ]);
        if (!mounted) return;

        const stream = streamRes.data as Record<string, unknown> | null;
        const session = sessionRes.data as Record<string, unknown> | null;
        const bunnyUrl = pickLiveStreamUrl(stream, session);
        const sessionStatus = String(session?.status ?? '').toLowerCase();
        const live =
          isStreamLive(stream, session) ||
          Boolean(bunnyUrl && stream?.isLive) ||
          sessionStatus === 'live';

        setStreamStatus(stream);
        setStreamLive(live || Boolean(bunnyUrl));

        if (stream || session) {
          const merged = mergeStreamPayload(stream, session);
          if (merged) {
            setLiveSession(prev => ({ ...(prev ?? {}), ...merged }));
          }
        }

        const streamType = String(
          session?.streamType ?? stream?.streamType ?? '',
        ).toLowerCase();
        const isAgora =
          streamType === 'agora' ||
          isAgoraStreamType(session) ||
          isAgoraStreamType(stream);
        if (isAgora && live && !bunnyUrl && !agoraConfig) {
          try {
            const { data: tokenData } = await liveClassService.getToken({
              lectureId: resolvedLectureId,
              role: 'audience',
            });
            if (!mounted) return;
            const merged = mergeStreamPayload(stream, session);
            const cfg = parseAgoraJoinConfig(merged, tokenData);
            if (cfg) setAgoraConfig(cfg);
          } catch {
            /* retry on next poll */
          }
        }
      } catch {
        /* keep polling */
      }
    };

    void poll();
    const timer = setInterval(poll, 10000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [resolvedLectureId, videoUrl, agoraConfig]);

  useEffect(() => {
    const sessionId = String(
      liveSession?.id ?? liveSession?.liveSessionId ?? '',
    ).trim();
    if (!streamLive || !sessionId) {
      setChatMessages([]);
      return;
    }

    let mounted = true;
    const loadChat = async () => {
      try {
        const { data } = await liveClassService.getChat(sessionId);
        const rows = asArray<Record<string, unknown>>(
          (data as Record<string, unknown>)?.messages ?? data,
        );
        if (!mounted) return;
        setChatMessages(
          rows
            .map((row, i) => ({
              id: String(row.id ?? `chat-${i}`),
              senderName: String(
                row.senderName ?? row.userName ?? row.name ?? 'User',
              ),
              message: String(row.message ?? row.text ?? ''),
              isMe: Boolean(row.isMe),
            }))
            .filter(m => m.message),
        );
      } catch {
        /* chat optional */
      }
    };

    void loadChat();
    const timer = setInterval(loadChat, 5000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [streamLive, liveSession?.id, liveSession?.liveSessionId]);

  useEffect(() => {
    if (!resolvedLectureId) return;

    let mounted = true;

    (async () => {
      try {
        const { data } = await contentService.getLectureProgress(
          resolvedLectureId,
        );

        if (!mounted) return;

        const pct = toPercent(
          (data as any)?.progressPercent ?? (data as any)?.progress,
        );

        setProgressPct(pct);
      } catch {
        /* no saved progress */
      }
    })();

    return () => {
      mounted = false;
    };
  }, [resolvedLectureId]);

  const saveProgress = useCallback(
    async (position: number, duration: number) => {
      if (!duration || duration <= 0 || !resolvedLectureId) return;

      const pct = toPercent((position / duration) * 100);

      setProgressPct(pct);

      try {
        await contentService.updateLectureProgress(resolvedLectureId, {
          watchedSeconds: Math.floor(position),

          durationSeconds: Math.floor(duration),

          progressPercent: pct,

          completed: pct >= 95,
        });
      } catch {
        /* ignore transient save errors */
      }
    },

    [resolvedLectureId],
  );

  useEffect(() => {
    return () => {
      const { position, duration } = watchRef.current;

      if (duration > 0) {
        void saveProgress(position, duration);
      }
    };
  }, [resolvedLectureId, saveProgress]);

  const onPlaybackProgress = (position: number, duration: number) => {
    watchRef.current = { position, duration };

    const pct = duration > 0 ? toPercent((position / duration) * 100) : 0;

    setProgressPct(pct);

    const now = Date.now();

    if (now - lastSaveRef.current > 15000) {
      lastSaveRef.current = now;

      void saveProgress(position, duration);
    }
  };

  const toggleHindiNotes = async () => {
    if (hindiNotes) {
      setHindiNotes(false);

      return;
    }

    if (notesHi) {
      setHindiNotes(true);

      return;
    }

    if (!resolvedLectureId) return;

    setTranslating(true);

    try {
      const { data } = await contentService.translateNotes(resolvedLectureId);

      const text =
        (data as any)?.aiNotesMarkdown ||
        (data as any)?.aiNotesHindi ||
        (data as any)?.notesHindi ||
        '';

      setNotesHi(text || null);

      setHindiNotes(true);
    } catch {
      Alert.alert(
        'Translation',
        'Hindi notes are not available for this lecture yet.',
      );
    } finally {
      setTranslating(false);
    }
  };

  const toggleHindiTranscript = async () => {
    if (hindiTranscript) {
      setHindiTranscript(false);

      return;
    }

    if (lecture?.transcriptHi) {
      setHindiTranscript(true);

      return;
    }

    if (!resolvedLectureId) return;

    setTranslating(true);

    try {
      const { data } = await contentService.translateTranscript(
        resolvedLectureId,
      );

      const text =
        (data as any)?.transcriptHi || (data as any)?.transcript || '';

      if (text) {
        setLecture(prev => (prev ? { ...prev, transcriptHi: text } : prev));

        setHindiTranscript(true);
      } else {
        Alert.alert('Translation', 'Hindi transcript is not available yet.');
      }
    } catch {
      Alert.alert('Translation', 'Hindi transcript is not available yet.');
    } finally {
      setTranslating(false);
    }
  };

  const submitDoubt = async () => {
    if (!doubtText.trim()) return;

    const sessionId = String(
      liveSession?.id ?? liveSession?.liveSessionId ?? '',
    ).trim();
    if (streamLive && sessionId) {
      try {
        await liveClassService.sendChat(sessionId, doubtText.trim());
        setDoubtText('');
      } catch {
        Alert.alert('Chat', 'Could not send message. Try again.');
      }
      return;
    }

    Alert.alert('Doubt submitted', 'Your doubt was sent to the faculty queue.');
    setDoubtText('');
  };

  const notesText = normalizeNotesContent(
    hindiNotes ? notesHi || lecture?.aiNotesMarkdown : lecture?.aiNotesMarkdown,
  );

  const posterUrl =
    resolveMediaUrl(routeThumbnailUrl) ||
    extractLectureThumbnailUrl(lecture as Record<string, any>) ||
    resolveMediaUrl(lecture?.thumbnailUrl as string);

  const transcriptText = hindiTranscript
    ? lecture?.transcriptHi || lecture?.transcript
    : lecture?.transcript;

  

  

  const metaDate = formatLectureDate(lecture?.scheduledAt);

  const isLive = streamLive;

  const playerPlaceholder = (() => {
    if (loadError) return loadError;
    if (streamLive && !videoUrl) return 'Connecting to live stream…';
    if (lecture?.type === 'live' && !streamLive) {
      return 'Waiting for teacher to start the live class.';
    }
    if (lecture?.type === 'live') {
      return 'Live stream is not available yet. Pull to refresh or try again shortly.';
    }
    if (lecture?.status === 'processing') {
      return 'Video is still processing. Try again shortly.';
    }
    return 'Video unavailable for this lecture';
  })();

  const playerMaxWidth = Math.min(screen.width, 720);
  const playerHorizontalPadding =
    screen.width > playerMaxWidth ? 0 : screen.isNarrow ? 0 : hs(10);
  const playerWidth = Math.round(
    Math.min(playerMaxWidth, screen.width - playerHorizontalPadding * 2),
  );
  const naturalPlayerHeight = Math.round(playerWidth * (9 / 16));
  const playerHeight = Math.max(
    vs(190),
    Math.min(
      naturalPlayerHeight,
      Math.round(screen.height * (screen.isShort ? 0.34 : 0.38)),
    ),
  );
  const playerFrameStyle = { width: playerWidth, height: playerHeight };
  const channelName = teacherName || 'EDDVA Faculty';
  const channelInitial = (channelName[0] || 'E').toUpperCase();
  const liveSessionId = String(
    liveSession?.id ?? liveSession?.liveSessionId ?? '',
  ).trim();
  const isAgoraLive = isAgoraStreamType(liveSession ?? streamStatus);
  const useAgoraPlayer = streamLive && !videoUrl && isAgoraLive;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View
          style={[
            styles.playerSection,
            { paddingTop: Math.max(insets.top, vs(10)) },
          ]}
        >
          <View
            style={[styles.playerWrap, playerFrameStyle]}
            pointerEvents="box-none"
          >
            {loading ? (
              <View style={[styles.playerLoading, playerFrameStyle]}>
                <ActivityIndicator size="large" color={Colors.white} />
                <Text style={styles.playerLoadingText}>Preparing lecture…</Text>
              </View>
            ) : useAgoraPlayer && agoraConfig ? (
              <AgoraLivePlayer config={agoraConfig} style={playerFrameStyle} />
            ) : useAgoraPlayer ? (
              <View style={[styles.playerLoading, playerFrameStyle]}>
                <ActivityIndicator size="large" color={Colors.white} />
                <Text style={styles.playerLoadingText}>
                  Joining live class…
                </Text>
              </View>
            ) : !videoUrl ? (
              <View style={[styles.playerLoading, playerFrameStyle]}>
                {streamLive && !loadError ? (
                  <ActivityIndicator size="large" color={Colors.white} />
                ) : (
                  <Icon
                    name="video-slash"
                    size={ms(32)}
                    color={Colors.white}
                    solid
                  />
                )}
                <Text style={styles.playerLoadingText}>
                  {playerPlaceholder}
                </Text>
              </View>
            ) : (
              <LessonVideoPlayer
                ref={videoPlayerRef}
                videoUrl={videoUrl}
                posterUrl={posterUrl}
                embedded
                liveStream={streamLive}
                style={playerFrameStyle}
                quizCheckpoints={lecture?.quizCheckpoints}
                autoPlay
                initialSeekPercent={initialSeekPercent}
                onPlaybackProgress={onPlaybackProgress}
              />
            )}

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backFloat, { top: vs(8) }]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <View style={styles.backCircle}>
                <Icon name="arrow-left" size={16} color="#0F0F0F" solid />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + vs(28) }}
        >
          <View style={styles.videoMeta}>
            <Text style={styles.videoTitle} numberOfLines={3}>
              {lessonTitle}
            </Text>
            <View style={styles.statsRow}>
              {isLive ? (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveBadgeText}>LIVE</Text>
                </View>
              ) : (
                <Text style={styles.statsText}>Recorded</Text>
              )}
              {metaDate ? (
                <Text style={styles.statsText}> · {metaDate}</Text>
              ) : null}
              {quizItems.length > 0 ? (
                <Text style={styles.statsText}>
                  {' · '}
                  {quizItems.length} in-video quiz
                  {quizItems.length > 1 ? 'zes' : ''}
                </Text>
              ) : null}
            </View>
            {progressPct > 0 ? (
              <View style={styles.watchProgress}>
                <View style={styles.watchTrack}>
                  <View
                    style={[styles.watchFill, { width: `${progressPct}%` }]}
                  />
                </View>
                <Text style={styles.watchLabel}>{progressPct}% watched</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.channelRow}>
            <View style={styles.channelAvatar}>
              <Text style={styles.channelInitial}>{channelInitial}</Text>
            </View>
            <View style={styles.channelInfo}>
              <Text style={styles.channelName} numberOfLines={1}>
                {channelName}
              </Text>
              <Text style={styles.channelSub}>Course instructor</Text>
            </View>
          </View>

          <View style={styles.tabBar}>
            {AI_TABS.map(t => (
              <TouchableOpacity
                key={t.key}
                style={styles.tabItem}
                onPress={() => setAiTab(t.key)}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    aiTab === t.key && styles.tabLabelActive,
                  ]}
                >
                  {t.key === 'notes'
                    ? 'Notes'
                    : t.key === 'transcript'
                    ? 'Transcript'
                    : t.key === 'quiz'
                    ? quizItems.length > 0
                      ? `Quiz (${quizItems.length})`
                      : 'Quiz'
                    : streamLive && liveSessionId
                    ? 'Chat'
                    : 'Doubt'}
                </Text>
                {aiTab === t.key ? <View style={styles.tabIndicator} /> : null}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.contentArea}>
            {aiTab === 'notes' && (
              <View>
                {lecture?.aiNotesMarkdown || notesHi ? (
                  <TouchableOpacity
                    style={styles.langLink}
                    onPress={() => void toggleHindiNotes()}
                    disabled={translating || !lecture?.aiNotesMarkdown}
                  >
                    <Text style={styles.langLinkText}>
                      {translating
                        ? 'Loading…'
                        : hindiNotes
                        ? 'Show in English'
                        : 'Show in Hindi'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {notesText ? (
                  <TouchableOpacity
                    style={[
                      styles.readAloudBtn,
                      speakingTarget === 'notes' && styles.readAloudBtnActive,
                    ]}
                    onPress={() =>
                      speakingTarget === 'notes'
                        ? stopReadAloud()
                        : void startReadAloud(
                            'notes',
                            notesText,
                            hindiNotes ? 'hi' : 'en',
                          )
                    }
                    activeOpacity={0.85}
                  >
                    <Icon
                      name={speakingTarget === 'notes' ? 'stop' : 'volume-up'}
                      size={ms(13)}
                      color={speakingTarget === 'notes' ? '#fff' : '#065FD4'}
                      solid
                    />
                    <Text
                      style={[
                        styles.readAloudText,
                        speakingTarget === 'notes' &&
                          styles.readAloudTextActive,
                      ]}
                    >
                      {speakingTarget === 'notes'
                        ? 'Stop reading'
                        : 'Read notes'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {notesText ? (
                  <MarkdownRenderer
                    content={notesText}
                    enableKatex={shouldUseKatex(notesText)}
                  />
                ) : (
                  <Text style={styles.emptyBody}>
                    Notes for this lecture are not available yet.
                  </Text>
                )}
              </View>
            )}

            {aiTab === 'transcript' && (
              <View>
                {lecture?.transcript ? (
                  <TouchableOpacity
                    style={styles.langLink}
                    onPress={() => void toggleHindiTranscript()}
                    disabled={translating}
                  >
                    <Text style={styles.langLinkText}>
                      {translating
                        ? 'Loading…'
                        : hindiTranscript
                        ? 'Show in English'
                        : 'Show in Hindi'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {transcriptText ? (
                  <TouchableOpacity
                    style={[
                      styles.readAloudBtn,
                      speakingTarget === 'transcript' &&
                        styles.readAloudBtnActive,
                    ]}
                    onPress={() =>
                      speakingTarget === 'transcript'
                        ? stopReadAloud()
                        : void startReadAloud(
                            'transcript',
                            transcriptText,
                            hindiTranscript ? 'hi' : 'en',
                          )
                    }
                    activeOpacity={0.85}
                  >
                    <Icon
                      name={
                        speakingTarget === 'transcript' ? 'stop' : 'volume-up'
                      }
                      size={ms(13)}
                      color={
                        speakingTarget === 'transcript' ? '#fff' : '#065FD4'
                      }
                      solid
                    />
                    <Text
                      style={[
                        styles.readAloudText,
                        speakingTarget === 'transcript' &&
                          styles.readAloudTextActive,
                      ]}
                    >
                      {speakingTarget === 'transcript'
                        ? 'Stop reading'
                        : 'Read transcript'}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {transcriptText ? (
                  <Text style={styles.transcriptBody}>{transcriptText}</Text>
                ) : (
                  <Text style={styles.emptyBody}>
                    Transcript for this lecture is not available yet.
                  </Text>
                )}
              </View>
            )}

            {aiTab === 'quiz' && (
              <View style={styles.quizList}>
                {quizItems.length > 0 ? (
                  quizItems.map((q, i) => (
                    <TouchableOpacity
                      key={q.id}
                      style={styles.quizRow}
                      onPress={() =>
                        videoPlayerRef.current?.seekToPercent(
                          q.triggerAtPercent,
                        )
                      }
                      activeOpacity={0.85}
                    >
                      <View style={styles.quizIndex}>
                        <Text style={styles.quizIndexText}>{i + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <RichText textStyle={styles.quizQ}>
                          {q.questionText}
                        </RichText>
                        <Text style={styles.quizMeta}>
                          {q.triggerAtPercent}% into video · tap to jump
                        </Text>
                      </View>
                      <Icon
                        name="play-circle"
                        size={ms(18)}
                        color="#606060"
                        solid
                      />
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyBody}>
                    No quiz checkpoints for this lecture yet.
                  </Text>
                )}
              </View>
            )}

            {aiTab === 'doubt' && (
              <View>
                {streamLive && liveSessionId ? (
                  <>
                    <View style={styles.chatList}>
                      {chatMessages.length === 0 ? (
                        <Text style={styles.emptyBody}>
                          No messages yet. Say hello!
                        </Text>
                      ) : (
                        chatMessages.map(msg => (
                          <View
                            key={msg.id}
                            style={[
                              styles.chatRow,
                              msg.isMe && styles.chatRowMe,
                            ]}
                          >
                            <Text style={styles.chatSender}>
                              {msg.senderName || 'User'}
                            </Text>
                            <Text style={styles.chatBody}>{msg.message}</Text>
                          </View>
                        ))
                      )}
                    </View>
                    <TextInput
                      style={styles.doubtInput}
                      placeholder="Message class chat…"
                      placeholderTextColor="#909090"
                      value={doubtText}
                      onChangeText={setDoubtText}
                      multiline
                    />
                    <TouchableOpacity
                      style={[
                        styles.doubtBtn,
                        !doubtText.trim() && styles.doubtBtnDisabled,
                      ]}
                      onPress={() => void submitDoubt()}
                      disabled={!doubtText.trim()}
                    >
                      <Text style={styles.doubtBtnText}>Send</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.doubtHint}>
                      Ask a question about this lesson. Faculty will reply in
                      your doubts inbox.
                    </Text>
                    <TextInput
                      style={styles.doubtInput}
                      placeholder="Add a comment…"
                      placeholderTextColor="#909090"
                      value={doubtText}
                      onChangeText={setDoubtText}
                      multiline
                    />
                    <TouchableOpacity
                      style={[
                        styles.doubtBtn,
                        !doubtText.trim() && styles.doubtBtnDisabled,
                      ]}
                      onPress={() => void submitDoubt()}
                      disabled={!doubtText.trim()}
                    >
                      <Text style={styles.doubtBtnText}>Post</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const YT = {
  bg: '#FFFFFF',
  text: '#0F0F0F',
  muted: '#606060',
  line: '#E5E5E5',
  chip: '#F2F2F2',
  red: '#CC0000',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: YT.bg },
  scroll: { flex: 1 },
  playerSection: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: YT.bg,
    paddingBottom: vs(8),
  },
  playerWrap: {
    backgroundColor: '#000',
    position: 'relative',
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: ms(10),
  },
  playerLoading: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(10),
    paddingHorizontal: spacing.lg,
  },
  playerLoadingText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: font.caption,
    fontWeight: '500',
    textAlign: 'center',
  },
  backFloat: {
    position: 'absolute',
    left: hs(12),
    zIndex: 200,
    elevation: 200,
  },
  backCircle: {
    width: hs(36),
    height: hs(36),
    borderRadius: hs(18),
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoMeta: {
    paddingHorizontal: spacing.md,
    paddingTop: vs(12),
    paddingBottom: vs(8),
  },
  videoTitle: {
    fontSize: font.subhead,
    fontWeight: '700',
    color: YT.text,
    lineHeight: vs(24),
    letterSpacing: -0.2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: vs(6),
  },
  statsText: { fontSize: font.caption, color: YT.muted, fontWeight: '500' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    backgroundColor: '#FF0000',
    paddingHorizontal: hs(6),
    paddingVertical: vs(2),
    borderRadius: ms(4),
    marginRight: hs(6),
  },
  liveDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#fff',
  },
  liveBadgeText: { color: '#fff', fontSize: font.micro, fontWeight: '800' },
  watchProgress: { marginTop: vs(10) },
  watchTrack: {
    height: vs(3),
    borderRadius: ms(2),
    backgroundColor: YT.chip,
    overflow: 'hidden',
  },
  watchFill: { height: '100%', backgroundColor: YT.red },
  watchLabel: {
    fontSize: font.micro,
    color: YT.muted,
    marginTop: vs(4),
    fontWeight: '600',
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: vs(10),
    gap: hs(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: YT.line,
  },
  channelAvatar: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    backgroundColor: '#282828',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelInitial: { color: '#fff', fontSize: font.body, fontWeight: '700' },
  channelInfo: { flex: 1, minWidth: 0 },
  channelName: { fontSize: font.body, fontWeight: '700', color: YT.text },
  channelSub: { fontSize: font.caption, color: YT.muted, marginTop: vs(2) },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: YT.line,
    paddingHorizontal: spacing.md,
  },
  tabItem: {
    marginRight: hs(20),
    paddingVertical: vs(12),
    position: 'relative',
  },
  tabLabel: { fontSize: font.caption, fontWeight: '600', color: YT.muted },
  tabLabelActive: { color: YT.text, fontWeight: '700' },
  tabIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: YT.text,
    borderRadius: 1,
  },
  contentArea: {
    paddingHorizontal: spacing.md,
    paddingTop: vs(14),
    minHeight: vs(200),
  },
  langLink: { alignSelf: 'flex-start', marginBottom: vs(12) },
  langLinkText: { fontSize: font.caption, fontWeight: '600', color: '#065FD4' },
  readAloudBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(7),
    paddingHorizontal: hs(12),
    paddingVertical: vs(7),
    borderRadius: ms(18),
    backgroundColor: '#EAF2FF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#B8D7FF',
    marginBottom: vs(12),
  },
  readAloudBtnActive: {
    backgroundColor: '#065FD4',
    borderColor: '#065FD4',
  },
  readAloudText: {
    fontSize: font.caption,
    fontWeight: '800',
    color: '#065FD4',
  },
  readAloudTextActive: { color: '#fff' },
  emptyBody: { fontSize: font.body, lineHeight: vs(22), color: YT.muted },
  transcriptBody: { fontSize: font.body, lineHeight: vs(24), color: YT.text },
  quizList: { gap: vs(2) },
  quizRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    paddingVertical: vs(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: YT.line,
  },
  quizIndex: {
    width: hs(28),
    height: hs(28),
    borderRadius: hs(14),
    backgroundColor: YT.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizIndexText: { fontSize: font.caption, fontWeight: '700', color: YT.text },
  quizQ: {
    fontSize: font.body,
    fontWeight: '500',
    color: YT.text,
    lineHeight: vs(20),
  },
  quizMeta: { fontSize: font.caption, color: YT.muted, marginTop: vs(4) },
  doubtHint: {
    fontSize: font.caption,
    color: YT.muted,
    marginBottom: vs(12),
    lineHeight: vs(18),
  },
  doubtInput: {
    minHeight: vs(88),
    borderWidth: 0,
    borderRadius: ms(12),
    padding: spacing.md,
    fontSize: font.body,
    color: YT.text,
    backgroundColor: YT.chip,
    textAlignVertical: 'top',
    marginBottom: vs(12),
  },
  doubtBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#065FD4',
    paddingHorizontal: hs(20),
    paddingVertical: vs(10),
    borderRadius: ms(18),
  },
  doubtBtnDisabled: { opacity: 0.45 },
  doubtBtnText: { color: '#fff', fontWeight: '700', fontSize: font.caption },
  liveWebHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: vs(8),
    gap: hs(10),
  },
  liveWebHeadText: { flex: 1, minWidth: 0 },
  liveWebTitle: { color: '#fff', fontSize: font.body, fontWeight: '700' },
  liveWebBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(4),
    gap: hs(8),
  },
  liveWebSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: font.micro,
    fontWeight: '600',
  },
  chatList: { gap: vs(10), marginBottom: vs(12), maxHeight: vs(220) },
  chatRow: {
    backgroundColor: YT.chip,
    borderRadius: ms(10),
    padding: spacing.sm,
  },
  chatRowMe: { backgroundColor: '#E8F0FE' },
  chatSender: {
    fontSize: font.micro,
    fontWeight: '700',
    color: YT.muted,
    marginBottom: vs(2),
  },
  chatBody: { fontSize: font.body, color: YT.text, lineHeight: vs(20) },
});

export default LiveClassScreen;
