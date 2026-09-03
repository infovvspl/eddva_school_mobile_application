import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ms } from '../utils/responsive';

/** Circular level meter for the arcade header. Presentational only. */
export function LevelRing({
  level,
  percent,
  size = 74,
}: {
  level: number;
  percent: number;
  size?: number;
}) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(100, percent)) / 100;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#22D3EE" />
            <Stop offset="1" stopColor="#6366F1" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#ring)" strokeWidth={stroke} fill="none"
          strokeDasharray={`${c * filled} ${c}`}
          strokeLinecap="round"
          // Start the sweep at 12 o'clock rather than 3.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.label}>LEVEL</Text>
        <Text style={styles.value}>{level}</Text>
        <Text style={styles.pct}>{Math.round(percent)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  label: { color: '#94A3B8', fontSize: ms(7), letterSpacing: 0.8, lineHeight: ms(10) },
  value: { color: '#FFF', fontSize: ms(20), fontWeight: '700', lineHeight: ms(24) },
  pct: { color: '#22D3EE', fontSize: ms(8), lineHeight: ms(11) },
});
