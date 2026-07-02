import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Pressable,
  Modal,
  StatusBar,
  LayoutChangeEvent,
  useWindowDimensions,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video, {
  type VideoRef,
  type OnLoadData,
  type OnProgressData,
} from 'react-native-video';
import Icon from '../Icon';
import { USE_MOCK } from '../../config/appConfig';
import { DEMO_LECTURE_VIDEO_URL } from '../../mocks/mockLiveClassService';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';
import VideoQuizOverlay from './VideoQuizOverlay';
import {
  normalizeQuizCheckpoints,
  type VideoQuizCheckpoint,
} from '../../utils/videoQuizCheckpoints';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import {
  buildVideoSource,
  loadVideoAuthToken,
  resolveVideoUrl,
  videoUriNeedsAuth,
} from '../../utils/videoSource';
import {
  lockVideoLandscape,
  unlockVideoPortrait,
} from '../../utils/orientationLock';

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
const YT_RED = '#FF0000';
const CONTROLS_HIDE_MS = 4000;
const SKIP_SEC = 10;

export type LessonVideoPlayerRef = {
  seek: (seconds: number) => void;
  seekToPercent: (percent: number) => void;
};

type Props = {
  videoUrl?: string | null;
  posterUrl?: string | null;
  title?: string;
  style?: object;
  embedded?: boolean;
  quizCheckpoints?: unknown;
  autoPlay?: boolean;
  forcePaused?: boolean;
  initialSeekPercent?: number;
  /** Bunny/HLS live — use low-latency playback settings */
  liveStream?: boolean;
  onPlaybackProgress?: (position: number, duration: number) => void;
  onQuizAnswered?: (checkpointId: string, correct: boolean) => void;
};

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  }
  return `${m}:${String(r).padStart(2, '0')}`;
}

function SkipButton({
  seconds,
  direction,
  onPress,
}: {
  seconds: number;
  direction: 'back' | 'forward';
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      style={styles.skipBtn}
    >
      <Icon
        name={direction === 'back' ? 'undo' : 'redo'}
        size={ms(15)}
        color="#fff"
        solid
      />
      <Text style={styles.skipLabel}>{seconds}</Text>
    </TouchableOpacity>
  );
}

const LessonVideoPlayer = forwardRef<LessonVideoPlayerRef, Props>(
  (
    {
      videoUrl,
      posterUrl,
      title,
      style,
      embedded = false,
      quizCheckpoints,
      autoPlay = false,
      forcePaused = false,
      initialSeekPercent = 0,
      liveStream = false,
      onPlaybackProgress,
      onQuizAnswered,
    },
    ref,
  ) => {
    const videoRef = useRef<VideoRef>(null);
    const positionRef = useRef(0);
    const durationRef = useRef(0);
    const { width: winW, height: winH } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const rawUri =
      resolveVideoUrl(videoUrl) ||
      videoUrl ||
      (USE_MOCK ? DEMO_LECTURE_VIDEO_URL : '');
    const poster = resolveMediaUrl(posterUrl) || posterUrl || undefined;
    const checkpoints = normalizeQuizCheckpoints(quizCheckpoints ?? []);

    const flatStyle = StyleSheet.flatten(style) || {};
    const fixedHeight = typeof flatStyle.height === 'number';

    const [videoSource, setVideoSource] =
      useState<ReturnType<typeof buildVideoSource>>(null);
    const [sourceReady, setSourceReady] = useState(false);
    const uri = videoSource?.uri || rawUri;
    const requiresAuth = videoUriNeedsAuth(rawUri);

    const [paused, setPaused] = useState(!autoPlay);
    const [loading, setLoading] = useState(true);
    const [readyForDisplay, setReadyForDisplay] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const initialSeekDoneRef = useRef(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [buffering, setBuffering] = useState(false);
    const [progressBarWidth, setProgressBarWidth] = useState(0);
    const [fsSize, setFsSize] = useState({ width: winW, height: winH });

    const [activeQuiz, setActiveQuiz] = useState<VideoQuizCheckpoint | null>(
      null,
    );
    const [answeredQuizIds, setAnsweredQuizIds] = useState<Set<string>>(
      () => new Set(),
    );
    const quizTriggeredRef = useRef<Set<string>>(new Set());

    const clearHideTimer = useCallback(() => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    }, []);

    /** Lesson screen: keep controls visible — native video often eats taps on Android. */
    const pinnedControls = embedded;

    const scheduleHideControls = useCallback(() => {
      if (pinnedControls) return;
      clearHideTimer();
      if (paused || activeQuiz || showSettings) return;
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, CONTROLS_HIDE_MS);
    }, [pinnedControls, paused, activeQuiz, showSettings, clearHideTimer]);

    const revealControls = useCallback(() => {
      setShowControls(true);
      if (!pinnedControls) scheduleHideControls();
    }, [pinnedControls, scheduleHideControls]);

    useEffect(() => {
      if (pinnedControls) return clearHideTimer;
      if (showControls && !paused && !activeQuiz && !showSettings) {
        scheduleHideControls();
      }
      return clearHideTimer;
    }, [
      pinnedControls,
      showControls,
      paused,
      activeQuiz,
      showSettings,
      scheduleHideControls,
      clearHideTimer,
    ]);

    useEffect(() => {
      if (!fullscreen) return;
      setFsSize({ width: winW, height: winH });
      const sub = Dimensions.addEventListener('change', ({ window }) => {
        setFsSize({ width: window.width, height: window.height });
      });
      return () => sub.remove();
    }, [fullscreen, winW, winH]);

    useImperativeHandle(ref, () => ({
      seek: (seconds: number) => {
        const max = durationRef.current || seconds;
        const t = Math.max(0, Math.min(seconds, max));
        videoRef.current?.seek(t);
        positionRef.current = t;
        setPosition(t);
      },
      seekToPercent: (percent: number) => {
        const max = durationRef.current;
        if (!max) return;
        const t = (Math.min(100, Math.max(0, percent)) / 100) * max;
        videoRef.current?.seek(t);
        positionRef.current = t;
        setPosition(t);
      },
    }));

    useEffect(() => {
      let mounted = true;
      setSourceReady(false);
      setVideoSource(null);
      (async () => {
        const token = await loadVideoAuthToken();
        if (!mounted) return;
        const src = buildVideoSource(rawUri, token) || buildVideoSource(rawUri);
        setVideoSource(src);
        setSourceReady(true);
      })();
      return () => {
        mounted = false;
      };
    }, [rawUri]);

    useEffect(() => {
      setAnsweredQuizIds(new Set());
      quizTriggeredRef.current = new Set();
      setActiveQuiz(null);
      setPaused(!autoPlay);
      setLoading(true);
      setBuffering(false);
      setReadyForDisplay(false);
      setError(null);
      initialSeekDoneRef.current = false;
      setShowControls(true);
      setShowSettings(false);
    }, [uri, quizCheckpoints, autoPlay]);

    const onLoad = useCallback(
      (data: OnLoadData) => {
        setLoading(false);
        setError(null);
        durationRef.current = data.duration;
        setDuration(data.duration);

        let seekTo = positionRef.current;
        if (
          !initialSeekDoneRef.current &&
          initialSeekPercent > 0 &&
          data.duration > 0
        ) {
          seekTo = Math.min(
            data.duration - 1,
            (initialSeekPercent / 100) * data.duration,
          );
          initialSeekDoneRef.current = true;
        } else if (seekTo > 0.5 && data.duration > 0) {
          seekTo = Math.min(seekTo, data.duration - 0.5);
        }

        if (seekTo > 0) {
          setTimeout(() => {
            videoRef.current?.seek(seekTo);
            positionRef.current = seekTo;
            setPosition(seekTo);
          }, 150);
        } else {
          positionRef.current = seekTo;
          setPosition(seekTo);
        }
      },
      [initialSeekPercent],
    );

    const onBuffer = useCallback((e: { isBuffering: boolean }) => {
      setBuffering(e.isBuffering);
      if (!e.isBuffering) {
        setLoading(false);
      }
    }, []);

    const maybeTriggerQuiz = useCallback(
      (currentTime: number, totalDuration: number) => {
        if (!totalDuration || activeQuiz || checkpoints.length === 0) return;
        const pct = (currentTime / totalDuration) * 100;

        for (const cp of checkpoints) {
          if (quizTriggeredRef.current.has(cp.id)) continue;
          if (pct >= cp.triggerAtPercent - 0.5) {
            quizTriggeredRef.current.add(cp.id);
            setPaused(true);
            setActiveQuiz(cp);
            setShowControls(true);
            clearHideTimer();
            break;
          }
        }
      },
      [activeQuiz, checkpoints, clearHideTimer],
    );

    const onProgress = useCallback(
      (data: OnProgressData) => {
        positionRef.current = data.currentTime;
        setPosition(data.currentTime);
        if (data.currentTime > 0.05) {
          setReadyForDisplay(true);
          setLoading(false);
        }
        const total = durationRef.current || data.seekableDuration || 0;
        if (data.seekableDuration > 0 && durationRef.current === 0) {
          durationRef.current = data.seekableDuration;
          setDuration(data.seekableDuration);
        }
        onPlaybackProgress?.(data.currentTime, total);
        maybeTriggerQuiz(data.currentTime, total);
      },
      [onPlaybackProgress, maybeTriggerQuiz],
    );

    const onError = useCallback(
      (e?: { error?: { errorString?: string } }) => {
        setLoading(false);
        setReadyForDisplay(false);
        const detail = e?.error?.errorString;
        if (__DEV__ && detail) {
          console.warn('[LessonVideoPlayer]', detail, uri);
        }
        setError(
          'Could not load video. Check your internet connection and try again.',
        );
      },
      [uri],
    );

    const togglePlay = useCallback(() => {
      if (activeQuiz) return;
      setPaused(p => !p);
      revealControls();
    }, [activeQuiz, revealControls]);

    const seekRelative = useCallback(
      (delta: number) => {
        const max = durationRef.current;
        if (max <= 0) return;
        const next = Math.min(Math.max(0, positionRef.current + delta), max);
        videoRef.current?.seek(next);
        positionRef.current = next;
        setPosition(next);
        revealControls();
      },
      [revealControls],
    );

    const seekFromProgressTap = useCallback(
      (locationX: number) => {
        const max = durationRef.current;
        if (!max || progressBarWidth <= 0) return;
        const ratio = Math.min(1, Math.max(0, locationX / progressBarWidth));
        const next = ratio * max;
        videoRef.current?.seek(next);
        positionRef.current = next;
        setPosition(next);
        revealControls();
      },
      [progressBarWidth, revealControls],
    );

    const enterFullscreen = useCallback(() => {
      lockVideoLandscape();
      setFullscreen(true);
      setShowControls(true);
      setShowSettings(false);
      clearHideTimer();
    }, [clearHideTimer]);

    const exitFullscreen = useCallback(() => {
      unlockVideoPortrait();
      setFullscreen(false);
      setShowSettings(false);
      revealControls();
    }, [revealControls]);

    useEffect(() => {
      return () => {
        unlockVideoPortrait();
      };
    }, []);

    const openSettings = useCallback(() => {
      clearHideTimer();
      setShowSettings(true);
      setShowControls(true);
    }, [clearHideTimer]);

    const pickSpeed = useCallback(
      (speed: number) => {
        setPlaybackRate(speed);
        setShowSettings(false);
        revealControls();
      },
      [revealControls],
    );

    const handleQuizSubmit = useCallback(
      (correct: boolean) => {
        if (activeQuiz) {
          setAnsweredQuizIds(prev => new Set(prev).add(activeQuiz.id));
          onQuizAnswered?.(activeQuiz.id, correct);
        }
        setActiveQuiz(null);
        setPaused(false);
        revealControls();
      },
      [activeQuiz, onQuizAnswered, revealControls],
    );

    const handleQuizSkip = useCallback(() => {
      if (activeQuiz) {
        setAnsweredQuizIds(prev => new Set(prev).add(activeQuiz.id));
      }
      setActiveQuiz(null);
      setPaused(false);
      revealControls();
    }, [activeQuiz, revealControls]);

    /** Tap video: show controls (never hide on tap — auto-hide timer only). */
    const onSurfacePress = useCallback(() => {
      if (showSettings) {
        setShowSettings(false);
        return;
      }
      revealControls();
    }, [showSettings, revealControls]);

    const progressPct = duration > 0 ? (position / duration) * 100 : 0;
    const speedLabel =
      playbackRate === 1 ? 'Normal' : `${playbackRate}×`.replace('.0', '');
    const isLandscapeFs = fullscreen && fsSize.width > fsSize.height;
    const controlsVisible = pinnedControls || showControls;
    const playbackSource =
      videoSource || (!requiresAuth ? buildVideoSource(rawUri) : null);
    const videoBufferConfig =
      liveStream || playbackSource?.type === 'm3u8'
        ? {
            minBufferMs: 1500,
            maxBufferMs: 8000,
            bufferForPlaybackMs: 1000,
            bufferForPlaybackAfterRebufferMs: 1500,
          }
        : {
            minBufferMs: 5000,
            maxBufferMs: 30000,
            bufferForPlaybackMs: 800,
            bufferForPlaybackAfterRebufferMs: 1500,
          };
    const waitingForSource = Boolean(rawUri && requiresAuth && !sourceReady);
    const showSpinner =
      !error &&
      (waitingForSource ||
        (loading && !readyForDisplay) ||
        (buffering && readyForDisplay));
    const spinnerLabel =
      waitingForSource || (loading && !readyForDisplay)
        ? 'Loading…'
        : 'Buffering…';

    const renderControlChrome = (fullScreenLayout: boolean) => (
      <>
        {fullScreenLayout ? (
          <TouchableOpacity
            style={[
              styles.fsBack,
              { top: insets.top + vs(8), left: insets.left + hs(8) },
            ]}
            onPress={exitFullscreen}
            hitSlop={12}
          >
            <Icon name="chevron-down" size={ms(22)} color="#fff" solid />
          </TouchableOpacity>
        ) : pinnedControls ? (
          <View
            style={[styles.topChrome, { top: vs(8), right: hs(8) }]}
            pointerEvents="box-none"
          >
            <TouchableOpacity
              style={styles.topChromeBtn}
              onPress={enterFullscreen}
              hitSlop={10}
              accessibilityLabel="Landscape fullscreen"
            >
              <Icon name="expand" size={ms(18)} color="#fff" solid />
              <Text style={styles.topChromeLabel}>Landscape</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {paused && !activeQuiz ? (
          <TouchableOpacity
            style={styles.centerPlay}
            onPress={togglePlay}
            activeOpacity={0.9}
          >
            <View style={styles.centerPlayCircle}>
              <Icon name="play" size={ms(28)} color="#0F0F0F" solid />
            </View>
          </TouchableOpacity>
        ) : null}

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.92)']}
          locations={[0, 0.35, 1]}
          style={[
            styles.bottomChrome,
            fullScreenLayout && {
              paddingBottom: Math.max(insets.bottom, vs(12)) + vs(8),
              paddingLeft: insets.left + hs(8),
              paddingRight: insets.right + hs(8),
            },
          ]}
          pointerEvents="auto"
          collapsable={false}
        >
          <Pressable
            style={styles.progressHit}
            onLayout={(e: LayoutChangeEvent) =>
              setProgressBarWidth(e.nativeEvent.layout.width)
            }
            onPress={e => seekFromProgressTap(e.nativeEvent.locationX)}
          >
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressPlayed, { width: `${progressPct}%` }]}
              />
              {checkpoints.map(cp => (
                <View
                  key={cp.id}
                  style={[
                    styles.quizTick,
                    { left: `${cp.triggerAtPercent}%` },
                    answeredQuizIds.has(cp.id) && styles.quizTickDone,
                  ]}
                />
              ))}
              {duration > 0 ? (
                <View style={[styles.scrubber, { left: `${progressPct}%` }]} />
              ) : null}
            </View>
          </Pressable>

          <View style={styles.controlRow}>
            <TouchableOpacity onPress={togglePlay} style={styles.ctrlBtn}>
              <Icon
                name={paused ? 'play' : 'pause'}
                size={ms(22)}
                color="#fff"
                solid
              />
            </TouchableOpacity>

            <SkipButton
              seconds={SKIP_SEC}
              direction="back"
              onPress={() => seekRelative(-SKIP_SEC)}
            />
            <SkipButton
              seconds={SKIP_SEC}
              direction="forward"
              onPress={() => seekRelative(SKIP_SEC)}
            />

            <Text style={styles.timeLabel}>
              {formatTime(position)}
              <Text style={styles.timeSep}> / </Text>
              {formatTime(duration)}
            </Text>

            <View style={styles.ctrlSpacer} />

            <TouchableOpacity style={styles.settingsBtn} onPress={openSettings}>
              <Icon name="cog" size={ms(18)} color="#fff" solid />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ctrlBtn}
              onPress={fullScreenLayout ? exitFullscreen : enterFullscreen}
            >
              <Icon
                name={fullScreenLayout ? 'compress' : 'expand'}
                size={ms(20)}
                color="#fff"
                solid
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </>
    );

    const renderVideoSurface = (fullScreenLayout: boolean) => (
      <View
        style={[
          styles.surface,
          fullScreenLayout
            ? { width: fsSize.width, height: fsSize.height }
            : fixedHeight
            ? styles.surfaceFixed
            : styles.surfaceInline,
          !fullScreenLayout && style,
        ]}
      >
        <View style={styles.videoHost} pointerEvents="none" collapsable={false}>
          {playbackSource ? (
            <Video
              key={playbackSource.uri}
              ref={videoRef}
              source={playbackSource}
              style={styles.video}
              resizeMode={fullScreenLayout ? 'contain' : 'cover'}
              paused={paused || forcePaused || !!activeQuiz || waitingForSource}
              rate={playbackRate}
              progressUpdateInterval={500}
              onLoad={onLoad}
              onProgress={onProgress}
              onBuffer={onBuffer}
              onError={onError}
              onReadyForDisplay={() => {
                setReadyForDisplay(true);
                setLoading(false);
                setBuffering(false);
              }}
              onEnd={() => {
                setPaused(true);
                setShowControls(true);
                clearHideTimer();
              }}
              ignoreSilentSwitch="ignore"
              playInBackground={false}
              playWhenInactive={false}
              controls={false}
              live={liveStream || playbackSource?.type === 'm3u8'}
              bufferConfig={videoBufferConfig}
              useTextureView={Platform.OS === 'android'}
              shutterColor="transparent"
              poster={poster}
              posterResizeMode="cover"
              preferredForwardBufferDuration={2}
            />
          ) : null}
        </View>

        {poster && !readyForDisplay && !error ? (
          <Image
            source={{ uri: poster }}
            style={[styles.video, styles.posterLayer]}
            resizeMode="cover"
            pointerEvents="none"
          />
        ) : null}

        {showSpinner ? (
          <View style={styles.overlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.overlayText}>{spinnerLabel}</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.overlay}>
            <Icon name="exclamation-circle" size={ms(32)} color="#fff" solid />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => {
                setError(null);
                setLoading(true);
                setPaused(false);
                videoRef.current?.seek(0);
              }}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {!error ? (
          <View
            style={[
              styles.controlsLayer,
              Platform.OS === 'android' && styles.controlsLayerAndroid,
            ]}
            collapsable={false}
            pointerEvents="box-none"
          >
            {!pinnedControls && !controlsVisible ? (
              <TouchableWithoutFeedback onPress={onSurfacePress}>
                <View style={styles.tapCatcher} />
              </TouchableWithoutFeedback>
            ) : null}

            {controlsVisible ? renderControlChrome(fullScreenLayout) : null}
          </View>
        ) : null}
      </View>
    );

    const settingsModal = (
      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSettings(false)}>
          <View style={styles.settingsBackdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.settingsSheet,
                  isLandscapeFs && styles.settingsSheetLandscape,
                ]}
              >
                <Text style={styles.settingsTitle}>Playback speed</Text>
                <Text style={styles.settingsCurrent}>{speedLabel}</Text>
                {PLAYBACK_SPEEDS.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.settingsRow,
                      playbackRate === s && styles.settingsRowActive,
                    ]}
                    onPress={() => pickSpeed(s)}
                  >
                    <Text
                      style={[
                        styles.settingsRowText,
                        playbackRate === s && styles.settingsRowTextActive,
                      ]}
                    >
                      {s === 1 ? 'Normal' : `${s}×`}
                    </Text>
                    {playbackRate === s ? (
                      <Icon name="check" size={ms(14)} color={YT_RED} solid />
                    ) : (
                      <View style={styles.settingsCheckPlaceholder} />
                    )}
                  </TouchableOpacity>
                ))}
                <Text style={styles.settingsHint}>
                  Tap the expand icon for landscape fullscreen
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );

    if (!uri) {
      return (
        <View style={[styles.wrap, style]}>
          <View style={styles.overlay}>
            <Icon name="video-slash" size={ms(32)} color="#fff" solid />
            <Text style={styles.errorText}>Video unavailable</Text>
          </View>
        </View>
      );
    }

    return (
      <>
        <View style={[styles.wrap, !embedded && styles.wrapEmbedded, style]}>
          {!fullscreen ? (
            renderVideoSurface(false)
          ) : (
            <View
              style={[
                styles.inlinePlaceholder,
                fixedHeight && { height: flatStyle.height as number },
                !fixedHeight && styles.surfaceInline,
              ]}
            />
          )}
          {!embedded && title && !fullscreen ? (
            <Text style={styles.caption} numberOfLines={2}>
              {title}
            </Text>
          ) : null}
        </View>

        <Modal
          visible={fullscreen}
          animationType="fade"
          supportedOrientations={[
            'landscape',
            'landscape-left',
            'landscape-right',
          ]}
          onRequestClose={exitFullscreen}
          statusBarTranslucent
        >
          <StatusBar hidden />
          <View
            style={[
              styles.fullscreenRoot,
              { width: fsSize.width, height: fsSize.height },
            ]}
          >
            {renderVideoSurface(true)}
          </View>
        </Modal>

        {settingsModal}

        <VideoQuizOverlay
          visible={!!activeQuiz}
          checkpoint={activeQuiz}
          onSubmit={handleQuizSubmit}
          onSkip={handleQuizSkip}
        />
      </>
    );
  },
);

LessonVideoPlayer.displayName = 'LessonVideoPlayer';

const styles = StyleSheet.create({
  wrap: { backgroundColor: '#000', overflow: 'hidden' },
  wrapEmbedded: {},
  surface: { backgroundColor: '#000', overflow: 'hidden' },
  surfaceInline: { width: '100%', aspectRatio: 16 / 9 },
  surfaceFixed: { width: '100%', height: '100%' },
  videoHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  posterLayer: { zIndex: 2 },
  controlsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  controlsLayerAndroid: {
    elevation: 200,
  },
  tapCatcher: {
    ...StyleSheet.absoluteFillObject,
  },
  controlsHint: {
    position: 'absolute',
    bottom: vs(12),
    alignSelf: 'center',
    left: '20%',
    right: '20%',
    alignItems: 'center',
  },
  controlsHintText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: font.micro,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(8),
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 10,
    zIndex: 8,
  },
  overlayText: { color: '#fff', fontSize: font.caption, fontWeight: '500' },
  errorText: {
    color: '#fff',
    fontSize: font.caption,
    textAlign: 'center',
    lineHeight: ms(20),
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: YT_RED,
    borderRadius: 20,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: font.caption },
  topChrome: {
    position: 'absolute',
    zIndex: 220,
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
  },
  topChromeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: hs(10),
    paddingVertical: vs(6),
    borderRadius: ms(8),
  },
  topChromeLabel: {
    color: '#fff',
    fontSize: font.micro,
    fontWeight: '700',
  },
  centerPlay: {
    position: 'absolute',
    top: '38%',
    left: 0,
    right: 0,
    zIndex: 205,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPlayCircle: {
    width: ms(68),
    height: ms(68),
    borderRadius: ms(34),
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: hs(4),
  },
  fsBack: {
    position: 'absolute',
    zIndex: 12,
    width: hs(44),
    height: hs(44),
    borderRadius: hs(22),
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomChrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 210,
    paddingTop: vs(42),
    paddingHorizontal: hs(14),
    paddingBottom: vs(14),
    ...(Platform.OS === 'android' ? { elevation: 110 } : {}),
  },
  progressHit: {
    paddingTop: vs(10),
    paddingBottom: vs(14),
    marginBottom: vs(2),
  },
  progressTrack: {
    height: vs(6),
    borderRadius: ms(999),
    backgroundColor: 'rgba(255,255,255,0.28)',
    overflow: 'visible',
    position: 'relative',
  },
  progressPlayed: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: YT_RED,
    borderRadius: ms(999),
  },
  scrubber: {
    position: 'absolute',
    top: -vs(6),
    width: ms(18),
    height: ms(18),
    marginLeft: -ms(9),
    borderRadius: ms(9),
    backgroundColor: YT_RED,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  quizTick: {
    position: 'absolute',
    top: -vs(3),
    width: ms(5),
    height: vs(12),
    marginLeft: -ms(2.5),
    borderRadius: ms(3),
    backgroundColor: '#FCD34D',
  },
  quizTickDone: { backgroundColor: '#4ADE80' },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    minHeight: vs(44),
  },
  ctrlBtn: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtn: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: {
    color: '#fff',
    fontSize: font.micro,
    fontWeight: '800',
    marginTop: -vs(2),
  },
  timeLabel: {
    color: '#fff',
    fontSize: font.tiny,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginLeft: hs(4),
    minWidth: hs(94),
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.42)',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(999),
    overflow: 'hidden',
  },
  timeSep: { color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  ctrlSpacer: { flex: 1 },
  settingsBtn: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  settingsSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: ms(16),
    borderTopRightRadius: ms(16),
    paddingTop: vs(16),
    paddingBottom: vs(28),
    paddingHorizontal: hs(16),
    maxHeight: '70%',
  },
  settingsSheetLandscape: {
    alignSelf: 'center',
    width: '55%',
    borderRadius: ms(16),
    marginBottom: vs(24),
  },
  settingsTitle: {
    fontSize: font.subhead,
    fontWeight: '800',
    color: '#0F0F0F',
    marginBottom: vs(4),
  },
  settingsCurrent: {
    fontSize: font.caption,
    color: '#606060',
    marginBottom: vs(12),
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(14),
    paddingHorizontal: hs(8),
    borderRadius: ms(8),
  },
  settingsRowActive: { backgroundColor: '#F2F2F2' },
  settingsRowText: {
    fontSize: font.body,
    color: '#0F0F0F',
    fontWeight: '500',
  },
  settingsRowTextActive: { fontWeight: '800', color: YT_RED },
  settingsCheckPlaceholder: { width: ms(14) },
  settingsHint: {
    fontSize: font.micro,
    color: '#909090',
    textAlign: 'center',
    marginTop: vs(12),
  },
  fullscreenRoot: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlinePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderImg: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  placeholderOverlay: {
    alignItems: 'center',
    gap: vs(10),
    padding: spacing.md,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: font.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  exitFsBtn: {
    marginTop: vs(8),
    paddingHorizontal: hs(16),
    paddingVertical: vs(8),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: ms(20),
  },
  exitFsBtnText: { color: '#fff', fontWeight: '700', fontSize: font.caption },
  caption: {
    paddingHorizontal: hs(14),
    paddingVertical: vs(9),
    fontSize: font.caption,
    fontWeight: '700',
    lineHeight: ms(19),
    color: '#EAF2FF',
    backgroundColor: '#061B3D',
  },
});

export default LessonVideoPlayer;
