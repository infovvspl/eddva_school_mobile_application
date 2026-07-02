import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../constants/theme';

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress?: number;
  value?: string;
  label?: string;
  strokeColor?: string;
  trackColor?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 160,
  strokeWidth = 14,
  progress = 0.75,
  value = '240',
  label = 'points',
  strokeColor = Colors.textMain,
  trackColor = 'rgba(15,23,42,0.12)',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashArray = circumference;
  const dashOffset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashArray}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.content}>
        <Text style={[styles.value, { color: strokeColor }]}>{value}</Text>
        <Text style={[styles.label, { color: strokeColor }]}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    opacity: 0.75,
  },
});

export default CircularProgress;
