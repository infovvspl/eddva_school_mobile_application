import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileText,
  FlaskConical,
  MoreVertical,
  Play,
  Trophy,
  type LucideIcon,
} from 'lucide-react-native';
import CourseCoverImage from '../CourseCoverImage';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius, Shadow } from '../../constants/theme';
import { font, hs, ms, vs } from '../../utils/responsive';
import { toPercent } from '../../utils/progress';

type Action = {
  key: string;
  label: string;
  Icon: LucideIcon;
  color: string;
  onPress: () => void;
};

export type CourseQuickTab = 'notes' | 'mock' | 'pyq' | 'dpp';

type Props = {
  course: any;
  onOpenCourse: () => void;
  onResume: () => void;
  onOpenTab?: (tab: CourseQuickTab) => void;
};

const EnrolledCourseCard: React.FC<Props> = ({
  course,
  onOpenCourse,
  onResume,
  onOpenTab,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const title = course.batchName || course.name || 'Course';
  const exam = (course.examType || 'JEE').toUpperCase();
  const progress = toPercent(course.progressPercent ?? course.progress);
  const total = Number(course.totalTopics) || course.topics?.length || 3;
  const done = Number(course.completedTopics) || 0;
  const mode = (course.mode || 'online').toLowerCase();

  const actions: Action[] = [
    {
      key: 'resume',
      label: 'Resume',
      Icon: Play,
      color: c.primary,
      onPress: onResume,
    },
    {
      key: 'notes',
      label: 'Notes',
      Icon: FileText,
      color: '#10B981',
      onPress: () => (onOpenTab ? onOpenTab('notes') : onOpenCourse()),
    },
    {
      key: 'test',
      label: 'Test',
      Icon: FlaskConical,
      color: '#EF4444',
      onPress: () => (onOpenTab ? onOpenTab('mock') : onOpenCourse()),
    },
    {
      key: 'pyq',
      label: 'PYQ',
      Icon: Trophy,
      color: '#8B5CF6',
      onPress: () => (onOpenTab ? onOpenTab('pyq') : onOpenCourse()),
    },
    {
      key: 'dpp',
      label: 'DPP',
      Icon: CalendarDays,
      color: '#F97316',
      onPress: () => (onOpenTab ? onOpenTab('dpp') : onOpenCourse()),
    },
  ];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: c.card, borderColor: c.border },
        Shadow.soft,
      ]}
      onPress={onOpenCourse}
      activeOpacity={0.92}
    >
      <View style={styles.row}>
        <View style={styles.thumbWrap}>
          <CourseCoverImage
            course={course}
            style={styles.thumb}
            imageStyle={styles.thumb}
            iconSize={30}
          />
          <View style={styles.examBadge}>
            <Text style={styles.examText}>{exam}</Text>
          </View>
          {!course.imageUrl && !(course.batchImage || course.thumbnailUrl) ? (
            <BookOpen
              size={ms(38)}
              color="#fff"
              strokeWidth={2.4}
              style={styles.thumbGlyph}
            />
          ) : null}
        </View>

        <View style={styles.main}>
          <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.platformRow}>
            <CheckCircle2
              size={ms(14)}
              color={c.primary}
              fill={c.primary}
              strokeWidth={2.3}
            />
            <Text style={[styles.platform, { color: c.textMuted }]}>
              EDDVA Platform
            </Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: c.textMuted }]}>
              {progress}% complete
            </Text>
            <View
              style={[styles.progressTrack, { backgroundColor: c.borderLight }]}
            >
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: c.primary },
                ]}
              />
            </View>
          </View>
          {course.startsOn ? (
            <Text
              style={[styles.dateText, { color: c.textMuted }]}
              numberOfLines={1}
            >
              {course.startsOn} - {mode}
            </Text>
          ) : null}
        </View>

        <View style={styles.metaCol}>
          <Text style={[styles.topicCount, { color: c.textMuted }]}>
            {done}/{total} topics
          </Text>
          <MoreVertical size={ms(18)} color={c.text} strokeWidth={2.4} />
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: c.border }]} />

      <View style={styles.actions}>
        {actions.map(a => {
          const ActionIcon = a.Icon;
          const isResume = a.key === 'resume';
          return (
            <TouchableOpacity
              key={a.key}
              style={[
                styles.actionBtn,
                isResume
                  ? { backgroundColor: c.primary, borderColor: c.primary }
                  : { backgroundColor: c.card, borderColor: c.border },
              ]}
              onPress={e => {
                e.stopPropagation?.();
                a.onPress();
              }}
              activeOpacity={0.85}
            >
              <ActionIcon
                size={ms(isResume ? 15 : 14)}
                color={isResume ? '#fff' : a.color}
                fill={
                  isResume || a.key === 'pyq'
                    ? isResume
                      ? '#fff'
                      : a.color
                    : 'none'
                }
                strokeWidth={2.4}
              />
              <Text
                style={[
                  styles.actionLabel,
                  { color: isResume ? '#fff' : c.text },
                ]}
              >
                {a.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: ms(10),
    marginBottom: vs(14),
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: hs(14) },
  thumbWrap: {
    width: hs(86),
    height: hs(86),
    borderRadius: ms(18),
    overflow: 'hidden',
  },
  thumb: { width: hs(86), height: hs(86) },
  thumbGlyph: {
    position: 'absolute',
    left: hs(24),
    bottom: vs(16),
  },
  examBadge: {
    position: 'absolute',
    top: vs(8),
    left: hs(8),
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: hs(9),
    paddingVertical: vs(4),
    borderRadius: ms(10),
  },
  examText: { fontSize: font.caption, fontWeight: '900', color: '#0F172A' },
  main: { flex: 1, minWidth: 0, paddingTop: vs(4) },
  title: { fontSize: font.title, fontWeight: '900', lineHeight: ms(23) },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(7),
    marginTop: vs(8),
  },
  platform: { fontSize: font.caption, fontWeight: '700' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    marginTop: vs(10),
  },
  progressLabel: { fontSize: font.caption, fontWeight: '700' },
  progressTrack: {
    flex: 1,
    minWidth: hs(80),
    height: vs(4),
    borderRadius: ms(999),
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: ms(999) },
  dateText: { fontSize: font.micro, fontWeight: '600', marginTop: vs(5) },
  metaCol: { alignItems: 'flex-end', gap: vs(10), paddingTop: vs(6) },
  topicCount: { fontSize: font.caption, fontWeight: '800' },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: vs(14),
    marginBottom: vs(12),
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(10),
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    minWidth: hs(86),
    paddingHorizontal: hs(14),
    paddingVertical: vs(9),
    borderRadius: ms(16),
    borderWidth: 1,
  },
  actionLabel: { fontSize: font.caption, fontWeight: '800' },
});

export default EnrolledCourseCard;
