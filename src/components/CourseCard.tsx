import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';
import { hs, vs } from '../utils/responsive';

interface CourseCardProps {
  title: string;
  category: string;
  categoryIcon: string;
  bgColor: string;
  rating?: number;
  avatarUris?: string[];
  extraCount?: number;
  onPress?: () => void;
  description?: string;
  timeLabel?: string;
  dateLabel?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  category,
  categoryIcon,
  bgColor,
  rating,
  avatarUris = [],
  extraCount = 6,
  onPress,
  description,
  timeLabel,
  dateLabel,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Icon name={categoryIcon} size={10} color={Colors.textMain} solid />
          <Text style={styles.badgeText}>{category}</Text>
        </View>
        <View style={styles.arrowBtn}>
          <Icon name="arrow-circle-right" size={16} color={Colors.textMain} solid />
        </View>
      </View>

      <Text style={styles.title}>{title}</Text>

      {description ? (
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
      ) : null}

      {(timeLabel || dateLabel) ? (
        <View style={styles.metaRow}>
          {timeLabel ? (
            <View style={styles.metaItem}>
              <Icon name="clock" size={11} color={Colors.secondary} solid />
              <Text style={styles.metaText}>{timeLabel}</Text>
            </View>
          ) : null}
          {dateLabel ? (
            <View style={styles.metaItem}>
              <Icon name="calendar-day" size={11} color={Colors.secondary} solid />
              <Text style={styles.metaText}>{dateLabel}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {(avatarUris.length > 0 || rating) ? (
        <View style={styles.bottomRow}>
          {avatarUris.length > 0 && (
            <View style={styles.avatarGroup}>
              {avatarUris.slice(0, 3).map((uri, i) => (
                <Image
                  key={i}
                  source={{ uri }}
                  style={[styles.avatar, { marginLeft: i > 0 ? -12 : 0 }]}
                />
              ))}
              <View style={[styles.avatar, styles.extraCount, { marginLeft: -12 }]}>
                <Text style={styles.extraText}>+{extraCount}</Text>
              </View>
            </View>
          )}
          {rating ? (
            <View style={styles.ratingBadge}>
              <Icon name="star" size={10} color={Colors.yellowGold} solid />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xxxl,
    padding: Spacing.xl,
    overflow: 'hidden',
    ...Shadow.soft,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: Spacing.base,
    paddingVertical: vs(8),
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMain,
  },
  arrowBtn: {
    width: hs(44),
    height: hs(44),
    borderRadius: hs(22),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textMain,
    marginBottom: Spacing.base,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.slate600,
    lineHeight: vs(20),
    marginBottom: Spacing.base,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.base,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.sm,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: hs(44),
    height: hs(44),
    borderRadius: hs(22),
    borderWidth: 2,
    borderColor: Colors.white,
  },
  extraCount: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textMain,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.base,
    paddingVertical: vs(8),
    borderRadius: BorderRadius.full,
    ...Shadow.soft,
  },
  ratingText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textMain,
  },
  yellowGold: {
    color: '#F59E0B',
  },
});

export default CourseCard;
