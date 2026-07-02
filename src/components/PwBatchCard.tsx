import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import IconBadge from './IconBadge';
import CourseCoverImage from './CourseCoverImage';
import { Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { formatInr, getHeroTheme, getSubjectAccent } from '../utils/courseImages';
import { font, hs, ms, vs } from '../utils/responsive';

type Props = {
  course: any;
  onOpenDetails: () => void;
  onBuy: () => void;
};

function discountPercent(price: number, original?: number): number | null {
  if (!original || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
}

/**
 * PW-inspired card: branding panel + photo panel (no overlapping text on image).
 * All readable content sits in the white body below.
 */
const PwBatchCard: React.FC<Props> = ({ course, onOpenDetails, onBuy }) => {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const c = theme.colors;
  const isNarrow = width < 360;
  const title = course.displayTitle || course.batchName || course.name || 'Course';
  const target = course.targetLabel || `Class 12+ ${course.examType || 'JEE'}`;
  const language = course.language || 'HINGLISH';
  const examYear = course.examYear || `${course.examType || 'JEE'} 2027`;
  const startsOn = course.startsOn || "8th Jun'26";
  const planLabel = course.planLabel || 'Multiple plans inside: Infinity, Pro';
  const price = course.price ?? 0;
  const original = course.originalPrice;
  const discount = discountPercent(price, original);
  const enrolled = !!course.isEnrolled;
  const isPaid = !!course.isPaid && price > 0;
  const targetColor = getSubjectAccent(course.examType);
  const hero = getHeroTheme(course);
  const isOffline = course.mode === 'offline' || course.mode === 'hybrid';

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={[styles.planStrip, { backgroundColor: theme.mode === 'dark' ? c.borderLight : '#FAFAFA', borderBottomColor: c.border }]}>
        <IconBadge name="layer-group" color="#CA8A04" size="sm" variant="soft" />
        <Text style={[styles.planText, { color: c.textMuted }]} numberOfLines={1}>{planLabel}</Text>
      </View>

      {/* Hero: text panel | image panel — strictly side by side */}
      <TouchableOpacity activeOpacity={0.95} onPress={onOpenDetails}>
        <View style={[styles.heroRow, isNarrow && styles.heroRowNarrow]}>
          <LinearGradient
            colors={[hero.colorStart, hero.colorEnd]}
            style={styles.heroTextPanel}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.dropperBadge}>
              <Text style={styles.dropperText}>DROPPER</Text>
            </View>
            <Text style={[styles.brandLine1, { color: hero.accent }]}>{hero.brandLine1}</Text>
            <Text style={styles.brandLine2}>{hero.brandLine2}</Text>
            {isOffline ? (
              <View style={styles.offlineMini}>
                <Text style={styles.offlineMiniText}>OFFLINE</Text>
              </View>
            ) : null}
          </LinearGradient>

          <View style={[styles.heroImagePanel, isNarrow && styles.heroImagePanelNarrow]}>
            <CourseCoverImage course={course} style={styles.heroImage} />
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.body}>
        <View style={styles.metaTop}>
          <Text style={[styles.target, { color: targetColor }]}>{target}</Text>
          <View style={[styles.langChip, { borderColor: c.border, backgroundColor: c.surface }]}>
            <Text style={[styles.langText, { color: c.text }]}>{language}</Text>
          </View>
        </View>

        <Text style={[styles.title, { color: c.text }]}>{title}</Text>

        <View style={styles.infoBlock}>
          <View style={styles.infoRow}>
            <IconBadge name="book-open" color={targetColor} size="sm" variant="soft" />
            <Text style={[styles.infoText, { color: c.textMuted }]} numberOfLines={1}>{examYear}</Text>
          </View>
          <View style={styles.infoRow}>
            <IconBadge name="calendar-day" color={c.primary} size="sm" variant="soft" />
            <Text style={[styles.infoText, { color: c.textMuted }]} numberOfLines={1}>Starts on {startsOn}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        <View style={[styles.footer, isNarrow && styles.footerNarrow]}>
          {isPaid ? (
            <View style={styles.priceCol}>
              <View style={styles.priceLine}>
                <Text style={[styles.priceNow, { color: c.text }]}>{formatInr(price)}</Text>
                {original && original > price ? (
                  <Text style={[styles.priceMrp, { color: c.textMuted }]}>{formatInr(original)}</Text>
                ) : null}
              </View>
              {discount ? (
                <Text style={[styles.priceOff, { color: c.success }]}>{discount}% OFF</Text>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.freeLabel, { color: c.success }]}>FREE</Text>
          )}

          <View style={[styles.actions, isNarrow && styles.actionsNarrow]}>
            <TouchableOpacity
              style={[
                styles.buyBtn,
                { backgroundColor: enrolled ? c.primary : theme.mode === 'dark' ? c.primary : '#111827' },
              ]}
              onPress={enrolled ? onOpenDetails : onBuy}
              activeOpacity={0.88}
            >
              <Text style={styles.buyBtnText}>
                {enrolled ? 'Open' : isPaid ? 'Buy Now' : 'Enroll Free'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowBtn, { borderColor: `${c.primary}40`, backgroundColor: `${c.primary}12` }]}
              onPress={onOpenDetails}
              activeOpacity={0.88}
            >
              <Icon name="arrow-right" size={14} color={c.primary} solid />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: ms(18),
    overflow: 'hidden',
    borderWidth: 1,
    ...Shadow.card,
  },
  planStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: vs(10),
    paddingHorizontal: hs(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  planText: {
    fontSize: font.tiny,
    fontWeight: '600',
    flexShrink: 1,
  },
  heroRow: {
    flexDirection: 'row',
    minHeight: vs(148),
    overflow: 'hidden',
  },
  heroRowNarrow: {
    minHeight: vs(132),
  },
  heroTextPanel: {
    flex: 1,
    paddingHorizontal: hs(14),
    paddingVertical: vs(14),
    justifyContent: 'center',
    minWidth: 0,
  },
  dropperBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#78350F',
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    borderRadius: ms(4),
    marginBottom: vs(8),
  },
  dropperText: {
    fontSize: font.micro,
    fontWeight: '900',
    color: '#FEF3C7',
    letterSpacing: 0.5,
  },
  brandLine1: {
    fontSize: font.headline,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: ms(26),
  },
  brandLine2: {
    fontSize: font.subhead,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
    lineHeight: ms(20),
  },
  offlineMini: {
    alignSelf: 'flex-start',
    marginTop: vs(8),
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: hs(6),
    paddingVertical: vs(2),
    borderRadius: ms(4),
  },
  offlineMiniText: { fontSize: font.micro, fontWeight: '900', color: '#fff' },
  heroImagePanel: {
    width: '42%',
    maxWidth: hs(160),
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
  },
  heroImagePanelNarrow: {
    width: '36%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  body: {
    paddingHorizontal: hs(16),
    paddingTop: vs(14),
    paddingBottom: vs(16),
  },
  metaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(6),
    gap: hs(8),
  },
  target: {
    fontSize: font.caption,
    fontWeight: '800',
  },
  langChip: {
    borderWidth: 1,
    borderRadius: ms(4),
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
  },
  langText: {
    fontSize: font.micro,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: font.title,
    fontWeight: '800',
    lineHeight: ms(24),
    marginBottom: vs(12),
  },
  infoBlock: { gap: vs(6), marginBottom: vs(4) },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
  },
  infoText: {
    flex: 1,
    fontSize: font.caption,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: vs(14),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: hs(12),
  },
  footerNarrow: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  priceCol: { flex: 1, minWidth: 0 },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: hs(8),
  },
  actionsNarrow: {
    alignSelf: 'stretch',
  },
  priceNow: {
    fontSize: font.headline,
    fontWeight: '900',
  },
  priceMrp: {
    fontSize: font.caption,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  priceOff: {
    fontSize: font.caption,
    fontWeight: '800',
    marginTop: vs(4),
  },
  freeLabel: {
    fontSize: font.headline,
    fontWeight: '900',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  buyBtn: {
    paddingHorizontal: hs(18),
    paddingVertical: vs(12),
    borderRadius: ms(12),
    minWidth: hs(96),
    alignItems: 'center',
    flexShrink: 1,
  },
  buyBtnText: {
    fontSize: font.caption,
    fontWeight: '800',
    color: '#fff',
  },
  arrowBtn: {
    width: hs(44),
    height: hs(44),
    borderRadius: hs(22),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PwBatchCard;
