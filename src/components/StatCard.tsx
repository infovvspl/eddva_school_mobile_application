import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from './Icon';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';
import { hs, layout, ms } from '../utils/responsive';

interface StatCardProps {
  label: string;
  value: string | number;
  unit: string;
  bgColor: string;
  iconName: string;
  iconColor: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  bgColor,
  iconName,
  iconColor,
  onPress,
}) => {
  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Icon name={iconName} size={layout.iconSm} color={iconColor} solid />
        </View>
        <TouchableOpacity style={styles.arrowBtn} onPress={onPress} activeOpacity={0.7}>
          <Icon name="arrow-circle-right" size={14} color={Colors.textMuted} solid />
        </TouchableOpacity>
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value} <Text style={styles.unit}>{unit}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    overflow: 'hidden',
    ...Shadow.soft,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  iconCircle: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    borderRadius: layout.touchTarget / 2,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  arrowBtn: {
    width: hs(36),
    height: hs(36),
    borderRadius: hs(18),
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textMain,
    fontWeight: FontWeight.semibold,
    marginBottom: 4,
  },
  value: {
    fontSize: FontSize.xxl,
    color: Colors.textMain,
    fontWeight: FontWeight.bold,
  },
  unit: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.slate600,
  },
});

export default StatCard;
