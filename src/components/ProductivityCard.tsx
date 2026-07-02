import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import CircularProgress from './CircularProgress';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';

interface ProductivityCardProps {
  points?: number;
  percentile?: number;
}

const ProductivityCard: React.FC<ProductivityCardProps> = ({
  points = 240,
  percentile = 72,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="tint" size={14} color={Colors.secondary} solid />
          <Text style={styles.title}>Your productivity</Text>
        </View>
        <TouchableOpacity style={styles.moreBtn} activeOpacity={0.7}>
          <Icon name="ellipsis-h" size={14} color={Colors.textMain} solid />
        </TouchableOpacity>
      </View>

      <View style={styles.chartWrapper}>
        <CircularProgress
          size={176}
          strokeWidth={16}
          progress={0.75}
          value={String(points)}
          label="points"
          strokeColor={Colors.textMain}
          trackColor="rgba(15,23,42,0.1)"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          You're more productive than{' '}
          <Text style={styles.percentile}>{percentile}%</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: `${Colors.accentPurple}33`,
    borderRadius: BorderRadius.xxxl,
    padding: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.textMain,
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  chartWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
  },
  footer: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
    ...Shadow.soft,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.slate600,
  },
  percentile: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});

export default ProductivityCard;
