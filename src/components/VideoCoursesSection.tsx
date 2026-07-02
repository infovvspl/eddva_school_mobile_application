import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from './Icon';
import LectureThumbnail from './learning/LectureThumbnail';
import LessonVideoPlayer from './learning/LessonVideoPlayer';
import { Brand } from '../constants/brand';
import { Colors, BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import {
  extractCourseImageUrl,
  extractLectureThumbnailUrl,
  resolvePosterUrl,
} from '../utils/mediaUrl';
import { useLectureMetaMap } from '../hooks/useLectureMetaMap';
import { font, hs, ms, pagePadding, useScreenLayout, vs } from '../utils/responsive';
import { toPercent } from '../utils/progress';
import { pickVideoUrlFromRecord } from '../utils/videoSource';

export type VideoLecture = {
  id: string;
  batchId: string;
  lectureId?: string;
  topicId?: string;
  title: string;
  courseName: string;
  duration: string;
  progressPercent: number;
  thumbnailUrl?: string | null;
  course: Record<string, unknown>;
  featured?: boolean;
};

function pickNextLectureId(course: Record<string, unknown>): string | undefined {
  const nested = course.nextLecture;
  if (nested && typeof nested === 'object') {
    const id = (nested as Record<string, unknown>).id;
    if (id) return String(id);
  }
  const direct =
    course.nextLectureId ||
    course.lastLectureId ||
    course.currentLectureId ||
    course.lectureId;
  return direct ? String(direct) : undefined;
}

type Props = {
  continueLearning: Record<string, unknown> | null | undefined;
  courses: Record<string, unknown>[];
  navigation: { navigate: (route: string, params?: object) => void };
  scrollY?: number;
  viewportHeight?: number;
  onMiniPlayerStateChange?: (state: {
    visible: boolean;
    title?: string;
    subtitle?: string;
    progressPercent?: number;
    onPress?: () => void;
  }) => void;
};

function pickCardThumbnail(
  record: Record<string, unknown>,
  course?: Record<string, unknown> | null,
): string | null {
  return (
    extractLectureThumbnailUrl(record) ||
    resolvePosterUrl(record.thumbnailUrl as string) ||
    resolvePosterUrl(record.posterUrl as string) ||
    resolvePosterUrl(record.coverImage as string) ||
    extractCourseImageUrl(record) ||
    extractCourseImageUrl(course || undefined) ||
    resolvePosterUrl(course?.imageUrl as string) ||
    null
  );
}

function buildVideoLectures(
  cl: Record<string, unknown> | null | undefined,
  courses: Record<string, unknown>[],
): VideoLecture[] {
  const out: VideoLecture[] = [];
  const featuredBatchId = cl?.batchId as string | undefined;

  if (featuredBatchId) {
    const match = courses.find(c => (c.batchId || c.id) === featuredBatchId);
    out.push({
      id: `cont-${featuredBatchId}`,
      batchId: featuredBatchId,
      lectureId: cl?.lectureId as string | undefined,
      topicId: cl?.topicId as string | undefined,
      title: String(cl?.lectureTitle || cl?.topicName || 'Continue lesson'),
      courseName: String(
        match?.batchName || match?.name || cl?.subjectName || 'Your course',
      ),
      duration: 'Resume',
      progressPercent: toPercent(cl?.watchPercentage ?? cl?.progressPercent),
      thumbnailUrl: pickCardThumbnail(
        cl as Record<string, unknown>,
        (match as Record<string, unknown>) || null,
      ),
      course: (match as Record<string, unknown>) || { batchId: featuredBatchId },
      featured: true,
    });
  }

  courses.forEach((c, i) => {
    const batchId = String(c.batchId || c.id || `course-${i}`);
    if (featuredBatchId && batchId === featuredBatchId) return;
    const nextLectureId = pickNextLectureId(c);
    const thumb = pickCardThumbnail(c as Record<string, unknown>);
    out.push({
      id: `v-${batchId}`,
      batchId,
      lectureId: nextLectureId,
      title: String(c.nextLectureTitle || `Lecture ${(Number(c.completedTopics) || 0) + 1}`),
      courseName: String(c.batchName || c.name || 'Course'),
      duration: `${14 + i * 6} min`,
      progressPercent: toPercent(c.progressPercent ?? c.progress ?? 0),
      thumbnailUrl: thumb,
      course: c as Record<string, unknown>,
    });
  });

  return out.slice(0, 5);
}

const VideoCoursesSection: React.FC<Props> = ({
  continueLearning,
  courses,
  navigation,
  scrollY = 0,
  viewportHeight = 0,
  onMiniPlayerStateChange,
}) => {
  const { width: screenWidth } = useScreenLayout();
  const { theme } = useTheme();
  const c = theme.colors;
  const thumbWidth = screenWidth - pagePadding * 2;
  const thumbHeight = Math.round(thumbWidth * (9 / 16));

  const baseVideos = useMemo(
    () => buildVideoLectures(continueLearning, courses),
    [continueLearning, courses],
  );

  const lectureIds = useMemo(
    () => baseVideos.map(v => v.lectureId).filter((id): id is string => Boolean(id)),
    [baseVideos],
  );

  const lectureMeta = useLectureMetaMap(lectureIds);

  const videos = useMemo(() => {
    return baseVideos.map(item => {
      if (!item.lectureId) return item;
      const meta = lectureMeta[item.lectureId];
      if (!meta) return item;
      const thumb =
        meta.thumbnailUrl ||
        item.thumbnailUrl ||
        extractCourseImageUrl(item.course);
      return thumb ? { ...item, thumbnailUrl: thumb } : item;
    });
  }, [baseVideos, lectureMeta]);

  const featured = videos.find(v => v.featured) ?? videos[0];
  const moreVideos = featured ? videos.filter(v => v.id !== featured.id) : [];
  const featuredMeta = featured?.lectureId ? lectureMeta[featured.lectureId] : undefined;
  const featuredVideoUrl =
    featuredMeta?.videoUrl ||
    (featured?.featured ? (continueLearning?.videoUrl as string | undefined) : undefined) ||
    (featured?.course ? pickVideoUrlFromRecord(featured.course) : undefined) ||
    undefined;
  const [featuredY, setFeaturedY] = useState(0);
  const [featuredH, setFeaturedH] = useState(0);
  const [resumePercent, setResumePercent] = useState(0);
  const baseResumePercent = featured?.featured
    ? toPercent(continueLearning?.watchPercentage ?? continueLearning?.progressPercent)
    : 0;
  const initialResumePercent = Math.max(baseResumePercent, resumePercent);
  const visibleBottom = scrollY + Math.max(1, viewportHeight);
  const isFeaturedInView =
    featuredH > 0 && viewportHeight > 0
      ? featuredY < visibleBottom && featuredY + featuredH > scrollY
      : true;
  const shouldForcePauseInline = Boolean(featuredVideoUrl) && !isFeaturedInView;
  const canShowMiniPlayer = Boolean(featuredVideoUrl) && resumePercent > 1 && !isFeaturedInView;

  const openVideo = (item: VideoLecture) => {
    if (item.lectureId) {
      const meta = lectureMeta[item.lectureId];
      navigation.navigate('LiveClass', {
        lectureId: item.lectureId,
        topicId: item.topicId,
        batchId: item.batchId,
        title: item.title,
        videoUrl: meta?.videoUrl || (continueLearning?.videoUrl as string) || undefined,
        thumbnailUrl: item.thumbnailUrl || meta?.thumbnailUrl || undefined,
        initialSeekPercent: item.featured ? initialResumePercent : undefined,
      });
      return;
    }
    navigation.navigate('CourseCurriculum', { batchId: item.batchId });
  };

  useEffect(() => {
    onMiniPlayerStateChange?.({
      visible: canShowMiniPlayer,
      title: featured?.title,
      subtitle: featured?.courseName,
      progressPercent: Math.max(initialResumePercent, featured?.progressPercent ?? 0),
      onPress: featured ? () => openVideo(featured) : undefined,
    });
    return () => {
      onMiniPlayerStateChange?.({ visible: false });
    };
  }, [
    canShowMiniPlayer,
    featured?.courseName,
    featured?.progressPercent,
    featured?.title,
    initialResumePercent,
    onMiniPlayerStateChange,
  ]);

  const renderProgress = (pct: number, accent?: boolean) => (
    <View style={styles.progressRow}>
      <View style={[styles.progressTrack, { backgroundColor: accent ? '#E2E8F0' : 'rgba(255,255,255,0.35)' }]}>
        <View style={[styles.progressFill, { width: `${Math.min(100, pct)}%` }]} />
      </View>
      <Text style={[styles.progressPct, accent && { color: c.textMuted }]}>{pct}%</Text>
    </View>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.sectionHead}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Continue watching</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MyCourses')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {videos.length === 0 ? (
        <TouchableOpacity
          style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => navigation.navigate('Courses')}
          activeOpacity={0.9}
        >
          <Icon name="play-circle" size={32} color={Colors.primary} solid />
          <Text style={[styles.emptyTitle, { color: c.text }]}>No videos yet</Text>
          <Text style={[styles.emptySub, { color: c.textMuted }]}>
            Enroll in a course to start watching
          </Text>
        </TouchableOpacity>
      ) : featured ? (
        <>
          <TouchableOpacity
            style={styles.featured}
            activeOpacity={0.92}
            onPress={() => openVideo(featured)}
            onLayout={e => {
              setFeaturedY(e.nativeEvent.layout.y);
              setFeaturedH(e.nativeEvent.layout.height);
            }}
          >
            <View style={[styles.featuredThumb, { width: thumbWidth, height: thumbHeight }]}>
              {featuredVideoUrl ? (
                <LessonVideoPlayer
                  videoUrl={featuredVideoUrl}
                  posterUrl={featured.thumbnailUrl}
                  title={featured.title}
                  embedded
                  forcePaused={shouldForcePauseInline}
                  style={{ width: thumbWidth, height: thumbHeight }}
                  initialSeekPercent={initialResumePercent}
                  onPlaybackProgress={(position, duration) => {
                    if (duration > 0) {
                      setResumePercent(Math.round((position / duration) * 100));
                    }
                  }}
                />
              ) : (
                <LectureThumbnail
                  thumbnailUrl={featured.thumbnailUrl}
                  course={featured.course}
                  style={{ width: thumbWidth, height: thumbHeight }}
                  imageStyle={{ width: thumbWidth, height: thumbHeight }}
                  fill
                  fallbackToCourse
                  showPlay
                  playSize="large"
                />
              )}
              {featuredVideoUrl ? (
                <TouchableOpacity
                  style={styles.openFullBtn}
                  onPress={() => openVideo(featured)}
                  activeOpacity={0.9}
                >
                  <Icon name="expand-arrows-alt" size={ms(11)} color="#fff" solid />
                  <Text style={styles.openFullText}>Open</Text>
                </TouchableOpacity>
              ) : null}
              {featured.featured ? (
                <View style={styles.resumePill}>
                  <Icon name="play" size={8} color="#fff" solid />
                  <Text style={styles.resumePillText}>Resume</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.featuredTitle, { color: c.text }]} numberOfLines={2}>
              {featured.title}
            </Text>
            <Text style={[styles.featuredSub, { color: c.textMuted }]} numberOfLines={1}>
              {featured.courseName}
            </Text>
            {renderProgress(featured.progressPercent, true)}
          </TouchableOpacity>

          {moreVideos.length > 0 ? (
            <View style={[styles.moreList, { borderTopColor: c.border }]}>
              {moreVideos.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.listRow, { borderBottomColor: c.border }]}
                  activeOpacity={0.88}
                  onPress={() => openVideo(item)}
                >
                  <View style={styles.listThumb}>
                    <LectureThumbnail
                      thumbnailUrl={item.thumbnailUrl}
                      course={item.course}
                      style={styles.listThumbImg}
                      fill
                      fallbackToCourse
                      showPlay
                      playSize="small"
                    />
                  </View>
                  <View style={styles.listBody}>
                    <Text style={[styles.listTitle, { color: c.text }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={[styles.listSub, { color: c.textMuted }]} numberOfLines={1}>
                      {item.courseName} · {item.duration}
                    </Text>
                    {renderProgress(item.progressPercent, true)}
                  </View>
                  <Icon name="chevron-right" size={ms(12)} color={c.textMuted} solid />
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: vs(16) },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: pagePadding,
    marginBottom: vs(10),
  },
  sectionTitle: {
    fontSize: font.subhead,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAll: { fontSize: font.tiny, fontWeight: '700', color: Colors.primary },
  featured: {
    paddingHorizontal: pagePadding,
    marginBottom: vs(4),
  },
  featuredThumb: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  openFullBtn: {
    position: 'absolute',
    top: vs(10),
    right: hs(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    backgroundColor: 'rgba(15,23,42,0.72)',
    borderRadius: ms(12),
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    zIndex: 3,
  },
  openFullText: { fontSize: font.micro, fontWeight: '700', color: '#fff' },
  resumePill: {
    position: 'absolute',
    bottom: vs(10),
    left: hs(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    backgroundColor: Brand.blue700,
    paddingHorizontal: hs(10),
    paddingVertical: vs(5),
    borderRadius: ms(6),
    zIndex: 2,
  },
  resumePillText: { fontSize: font.micro, fontWeight: '800', color: '#fff' },
  featuredTitle: {
    fontSize: font.body,
    fontWeight: '800',
    marginTop: vs(10),
    lineHeight: vs(22),
  },
  featuredSub: {
    fontSize: font.caption,
    fontWeight: '600',
    marginTop: vs(2),
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    marginTop: vs(8),
  },
  progressTrack: {
    flex: 1,
    height: vs(4),
    borderRadius: ms(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: ms(2),
    backgroundColor: Brand.blue400,
  },
  progressPct: {
    fontSize: font.micro,
    fontWeight: '700',
    color: Colors.textMuted,
    minWidth: hs(32),
    textAlign: 'right',
  },
  moreList: {
    marginTop: vs(12),
    marginHorizontal: pagePadding,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    paddingVertical: vs(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listThumb: {
    width: hs(120),
    height: hs(68),
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  listThumbImg: { width: '100%', height: '100%' },
  listBody: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: font.caption, fontWeight: '700', lineHeight: vs(18) },
  listSub: { fontSize: font.micro, marginTop: vs(2), fontWeight: '500' },
  emptyCard: {
    marginHorizontal: pagePadding,
    padding: vs(28),
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyTitle: { fontSize: font.subhead, fontWeight: '800', marginTop: vs(12) },
  emptySub: { fontSize: font.tiny, marginTop: vs(4) },
});

export default VideoCoursesSection;
