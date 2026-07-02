import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import CourseCoverImage from './CourseCoverImage';
import CoursePriceTag from './CoursePriceTag';
import { Colors, BorderRadius, Shadow } from '../constants/theme';
import { formatInr } from '../utils/courseImages';

type Props = {
  course: any;
  onPress: () => void;
};

/** Physics Wallah–style vertical batch row: thumb left, info + price right */
const PwCourseRow: React.FC<Props> = ({ course, onPress }) => {
  const name = course.batchName || course.name || 'Course';
  const enrolled = !!course.isEnrolled;

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.88}>
      <CourseCoverImage course={course} style={styles.thumb} iconSize={22} />
      <View style={styles.content}>
        <View style={styles.tagRow}>
          {course.examType ? (
            <View style={styles.examTag}>
              <Text style={styles.examText}>{course.examType}</Text>
            </View>
          ) : null}
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{name}</Text>
        <Text style={styles.teacher} numberOfLines={1}>
          {course.teacherName || 'EDDVA Faculty'}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{course.totalHours || 16} hrs</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{course.studentCount || 0}+ students</Text>
          <Text style={styles.metaDot}>·</Text>
          <Icon name="star" size={10} color="#FBBF24" solid />
          <Text style={styles.metaText}>{course.rating || 4.5}</Text>
        </View>
        <View style={styles.footer}>
          <CoursePriceTag
            price={course.price}
            originalPrice={course.originalPrice}
            isPaid={course.isPaid}
            compact
          />
          <View style={[styles.cta, enrolled && styles.ctaEnrolled]}>
            <Text style={styles.ctaText}>
              {enrolled ? 'OPEN' : course.isPaid ? `BUY ${formatInr(course.price)}` : 'ENROLL FREE'}
            </Text>
            <Icon name="chevron-right" size={10} color={Colors.white} solid />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadow.soft,
  },
  thumb: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  content: { flex: 1, justifyContent: 'space-between', minHeight: 100 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  examTag: {
    backgroundColor: `${Colors.primary}12`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  examText: { fontSize: 9, fontWeight: '800', color: Colors.primary },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.danger },
  liveText: { fontSize: 9, fontWeight: '800', color: Colors.danger },
  title: { fontSize: 14, fontWeight: '800', color: Colors.text, lineHeight: 18 },
  teacher: { fontSize: 11, color: Colors.textMuted, marginTop: 2, marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  metaText: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  metaDot: { fontSize: 10, color: Colors.textMuted },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ctaEnrolled: { backgroundColor: Colors.primary },
  ctaText: { fontSize: 10, fontWeight: '800', color: Colors.white },
});

export default PwCourseRow;
