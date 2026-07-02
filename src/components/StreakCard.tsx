import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Icon from './Icon';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../constants/theme';

interface StreakCardProps {
  streak?: number;
  activityCount?: number;
}

const StreakCard: React.FC<StreakCardProps> = ({ streak = 12, activityCount = 5 }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>
        Your activities{'\n'}today{' '}
        <Text style={styles.headingCount}>({activityCount})</Text>
      </Text>

      <LinearGradient
        colors={[Colors.secondary, Colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.deco1} />
        <View style={styles.deco2} />

        <View style={styles.row}>
          <View>
            <Text style={styles.label}>DAILY STREAK</Text>
            <View style={styles.valueRow}>
              <Text style={styles.number}>{streak}</Text>
              <Text style={styles.unit}> Days</Text>
            </View>
          </View>

          <View style={styles.flameWrapper}>
            <Svg
              style={StyleSheet.absoluteFill}
              viewBox="0 0 36 36"
              rotation={-90}
            >
              <Path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="4"
                strokeDasharray="75, 100"
                strokeLinecap="round"
              />
            </Svg>
            <Icon name="fire" size={26} color="#FDE047" solid />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: Spacing.base,
  },
  heading: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.textMain,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  headingCount: {
    fontWeight: FontWeight.medium,
  },
  card: {
    borderRadius: BorderRadius.xxxl,
    padding: Spacing.xl,
    overflow: 'hidden',
    ...Shadow.glow,
  },
  deco1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  deco2: {
    position: 'absolute',
    bottom: -24,
    left: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  number: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.bold,
    color: Colors.white,
  },
  unit: {
    fontSize: FontSize.lg,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: FontWeight.medium,
  },
  flameWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StreakCard;
