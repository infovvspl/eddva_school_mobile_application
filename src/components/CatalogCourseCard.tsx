import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import CourseCoverImage from './CourseCoverImage';
import { Brand } from '../constants/brand';
import { Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { formatInr, getSubjectAccent } from '../utils/courseImages';
import { font, hs, ms, spacing, textFamily, vs } from '../utils/responsive';

type Props = {
  course: any;
  onPress: () => void;
  featured?: boolean;
};

const CatalogCourseCard: React.FC<Props> = ({ course, onPress, featured }) => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const c = theme.colors;
  const cardWidth = Math.max(280, width - spacing.md * 2);
  const imageHeight = Math.round(cardWidth * (9 / 16));
  const title = course.displayTitle || course.batchName || course.name || 'Program';
  const exam = (course.examType || course.examTarget || 'JEE').toUpperCase();
  const accent = getSubjectAccent(course.examType || course.examTarget);
  const isFree = !course.isPaid || (course.price ?? 0) === 0;
  const rating = course.rating ?? 4.5;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.card]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={[styles.imageBlock, { height: imageHeight }]}>
        <CourseCoverImage
          course={course}
          style={[styles.image, { height: imageHeight }]}
          imageStyle={styles.image}
          iconSize={ms(36)}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.imageOverlay}
        />
        <View style={styles.topBadges}>
          <View style={[styles.examBadge, { backgroundColor: accent }]}>
            <Text style={styles.examText}>{exam}</Text>
          </View>
          {featured ? (
            <View style={styles.featuredBadge}>
              <Icon name="star" size={ms(9)} color="#CA8A04" solid />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles.overlayTitle} numberOfLines={2}>
            {title}
          </Text>
          {course.instituteName ? (
            <Text style={styles.overlayInstitute} numberOfLines={1}>
              {course.instituteName}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Icon name="star" size={ms(11)} color="#F59E0B" solid />
            <Text style={[styles.ratingText, { color: c.text }]}>{rating.toFixed(1)}</Text>
            {course.studentCount ? (
              <Text style={[styles.students, { color: c.textMuted }]}>
                · {(course.studentCount / 1000).toFixed(1)}k students
              </Text>
            ) : null}
          </View>
          {isFree ? (
            <View style={[styles.pricePill, { backgroundColor: '#DCFCE7' }]}>
              <Text style={styles.freeText}>FREE</Text>
            </View>
          ) : (
            <View style={styles.priceCol}>
              <Text style={[styles.price, { color: c.text }]}>{formatInr(course.price)}</Text>
              {course.originalPrice ? (
                <Text style={[styles.mrp, { color: c.textMuted }]}>
                  {formatInr(course.originalPrice)}
                </Text>
              ) : null}
            </View>
          )}
        </View>

        <Text style={[styles.desc, { color: c.textMuted }]} numberOfLines={2}>
          {course.description || 'Live classes, tests & AI doubt support.'}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.viewDetail, { color: c.primary }]}>View program</Text>
          <LinearGradient
            colors={[...Brand.gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            <Text style={[styles.ctaText, textFamily.semibold]}>Explore</Text>
            <Icon name="arrow-right" size={ms(11)} color="#fff" solid />
          </LinearGradient>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: ms(20),
    borderWidth: 1,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  imageBlock: {
    width: '100%',
    backgroundColor: '#E0F2FE',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBadges: {
    position: 'absolute',
    top: vs(12),
    left: hs(12),
    right: hs(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  examBadge: {
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(8),
  },
  examText: {
    fontSize: font.micro,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(8),
  },
  featuredText: {
    fontSize: font.micro,
    fontWeight: '800',
    color: '#92400E',
  },
  bottomOverlay: {
    position: 'absolute',
    left: hs(12),
    right: hs(12),
    bottom: vs(12),
  },
  overlayTitle: {
    fontSize: font.title,
    fontWeight: '900',
    color: '#fff',
    lineHeight: ms(22),
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  overlayInstitute: {
    fontSize: font.caption,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: vs(4),
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: vs(12),
    paddingBottom: vs(14),
    gap: vs(10),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: hs(8),
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: hs(4), flex: 1 },
  ratingText: { fontSize: font.caption, fontWeight: '800' },
  students: { fontSize: font.tiny, fontWeight: '600' },
  priceCol: { alignItems: 'flex-end', flexShrink: 0 },
  price: { fontSize: font.subhead, fontWeight: '900' },
  mrp: {
    fontSize: font.tiny,
    fontWeight: '600',
    textDecorationLine: 'line-through',
  },
  pricePill: {
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: ms(8),
  },
  freeText: { fontSize: font.caption, fontWeight: '900', color: '#166534' },
  desc: { fontSize: font.caption, lineHeight: ms(18), fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vs(2),
    gap: hs(10),
  },
  viewDetail: { fontSize: font.caption, fontWeight: '700', flex: 1 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    paddingHorizontal: hs(14),
    paddingVertical: vs(8),
    borderRadius: ms(12),
  },
  ctaText: { fontSize: font.caption, color: '#fff' },
});

export default CatalogCourseCard;
