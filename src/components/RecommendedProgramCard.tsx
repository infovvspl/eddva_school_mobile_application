import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bot, ChevronRight, Laptop, Star } from 'lucide-react-native';
import CourseCoverImage from './CourseCoverImage';
import { Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { hs, ms, spacing, type as t, vs } from '../utils/responsive';

const ICON_SM = ms(11);
const ICON_MD = ms(13);

type Props = {
  course: any;
  onPress: () => void;
  popular?: boolean;
};

const IMG = hs(108);

const RecommendedProgramCard: React.FC<Props> = ({ course, onPress, popular }) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const title = course.displayTitle || course.batchName || course.name || 'Program';
  const desc =
    course.description ||
    'Complete preparation with live classes, practice tests & expert guidance.';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.card]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={styles.imageWrap}>
        <CourseCoverImage course={course} style={styles.image} />
        <View style={styles.imageTint} />
        {popular ? (
          <View style={styles.popularBadge}>
            <Star size={ms(9)} color="#CA8A04" fill="#CA8A04" strokeWidth={2} />
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: c.text }]} numberOfLines={2}>
          {title}
        </Text>
        {course.instituteName ? (
          <Text style={[styles.institute, { color: c.primary }]} numberOfLines={1}>
            {course.instituteName}
          </Text>
        ) : null}
        <Text style={[styles.desc, { color: c.textMuted }]} numberOfLines={2}>
          {desc}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.metaChip, { backgroundColor: c.chipBg, borderColor: c.border }]}>
            <Laptop size={ICON_SM} color={c.textMuted} strokeWidth={2} />
            <Text style={[styles.metaText, { color: c.textMuted }]}>Live + Recorded</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: c.chipBg, borderColor: c.border }]}>
            <Bot size={ICON_SM} color={c.textMuted} strokeWidth={2} />
            <Text style={[styles.metaText, { color: c.textMuted }]}>AI Support</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.arrowBtn, { backgroundColor: '#F1F5F9', borderColor: c.border }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <ChevronRight size={ICON_MD} color={c.text} strokeWidth={2.25} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: ms(18),
    borderWidth: 1,
    padding: spacing.sm + 4,
    gap: hs(12),
    marginHorizontal: spacing.md,
  },
  imageWrap: {
    width: IMG,
    height: IMG,
    borderRadius: ms(14),
    overflow: 'hidden',
    flexShrink: 0,
  },
  image: { width: '100%', height: '100%' },
  imageTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(91,33,182,0.22)',
  },
  popularBadge: {
    position: 'absolute',
    top: vs(8),
    left: hs(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    backgroundColor: '#FEF3C7',
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(8),
  },
  popularText: { ...t.microBold, color: '#92400E', letterSpacing: 0.3 },
  body: { flex: 1, minWidth: 0 },
  title: { ...t.subheadBold, marginBottom: vs(2) },
  institute: { ...t.captionBold, marginBottom: vs(4) },
  desc: { ...t.caption, marginBottom: vs(8) },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(6) },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(4),
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    borderRadius: ms(8),
    borderWidth: 1,
  },
  metaText: { ...t.microBold },
  arrowBtn: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

export default RecommendedProgramCard;
