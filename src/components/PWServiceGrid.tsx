import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from './Icon';
import { Colors, BorderRadius, Shadow } from '../constants/theme';

export type PWServiceItem = {
  icon: string;
  label: string;
  color: string;
  route: string;
  isTab?: boolean;
};

type Props = {
  items: PWServiceItem[];
  onPress: (item: PWServiceItem) => void;
  title?: string;
};

/** PW-style horizontal service shortcuts (Study, Tests, Doubts, etc.) */
const PWServiceGrid: React.FC<Props> = ({ items, onPress, title = 'Study Tools' }) => (
  <View style={styles.section}>
    <Text style={styles.title}>{title}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map(item => (
        <TouchableOpacity
          key={item.label}
          style={styles.tile}
          activeOpacity={0.85}
          onPress={() => onPress(item)}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${item.color}18` }]}>
            <Icon name={item.icon} size={22} color={item.color} solid />
          </View>
          <Text style={styles.label} numberOfLines={2}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  section: { marginBottom: 20 },
  title: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 12, paddingHorizontal: 20 },
  row: { paddingHorizontal: 20, gap: 12 },
  tile: {
    width: 76,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    ...Shadow.soft,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: { fontSize: 10, fontWeight: '700', color: Colors.text, textAlign: 'center' },
});

export default PWServiceGrid;
