import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatInr } from '../utils/courseImages';

type Props = {
  price: number;
  originalPrice?: number;
  isPaid?: boolean;
  compact?: boolean;
};

const CoursePriceTag: React.FC<Props> = ({ price, originalPrice, isPaid, compact }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  if (!isPaid || price <= 0) {
    return (
      <View style={[styles.free, { backgroundColor: `${c.success}20` }, compact && styles.compact]}>
        <Text style={[styles.freeText, { color: c.success }]}>FREE</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, compact && styles.compact]}>
      {originalPrice && originalPrice > price ? (
        <Text style={[styles.mrp, { color: c.textMuted }]}>{formatInr(originalPrice)}</Text>
      ) : null}
      <Text style={[styles.price, { color: c.text }, compact && styles.priceCompact]}>{formatInr(price)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  compact: {},
  mrp: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  price: { fontSize: 18, fontWeight: '800' },
  priceCompact: { fontSize: 14 },
  free: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  freeText: { fontSize: 12, fontWeight: '800' },
});

export default CoursePriceTag;
