import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LB_COLORS } from '../../constants/leaderboardXp';
import { font, hs, ms, vs } from '../../utils/responsive';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
};

const SIZES = {
  sm: { box: hs(28), font: font.micro },
  md: { box: hs(44), font: font.caption },
  lg: { box: hs(72), font: font.subhead },
};

const XpHexBadge: React.FC<Props> = ({ size = 'md', label = 'XP' }) => {
  const s = SIZES[size];
  return (
    <View style={[styles.hex, { width: s.box, height: s.box * 1.08 }]}>
      <Text style={[styles.text, { fontSize: s.font }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  hex: {
    backgroundColor: LB_COLORS.peach,
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '0deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.35,
    shadowRadius: ms(6),
    elevation: 6,
  },
  text: { fontWeight: '900', color: '#1A1A1A' },
});

export default XpHexBadge;
