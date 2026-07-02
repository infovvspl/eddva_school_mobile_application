import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import { horizontalScale as hs, moderateScale as ms } from '../utils/responsive';

type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, { box: number; radius: number; icon: number }> = {
  sm: { box: hs(32), radius: ms(10), icon: ms(14) },
  md: { box: hs(44), radius: ms(14), icon: ms(18) },
  lg: { box: hs(52), radius: ms(16), icon: ms(22) },
};

type Props = {
  name: string;
  color: string;
  size?: Size;
  style?: ViewStyle;
  variant?: 'gradient' | 'soft';
};

const IconBadge: React.FC<Props> = ({
  name,
  color,
  size = 'md',
  style,
  variant = 'gradient',
}) => {
  const dim = SIZES[size];
  const gradientEnd = shadeColor(color, -28);

  if (variant === 'soft') {
    return (
      <View
        style={[
          styles.soft,
          {
            width: dim.box,
            height: dim.box,
            borderRadius: dim.radius,
            backgroundColor: `${color}18`,
          },
          style,
        ]}
      >
        <Icon name={name} size={dim.icon} color={color} solid />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[color, gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradient,
        {
          width: dim.box,
          height: dim.box,
          borderRadius: dim.radius,
        },
        style,
      ]}
    >
      <Icon name={name} size={dim.icon} color="#FFFFFF" solid />
    </LinearGradient>
  );
};

function shadeColor(hex: string, percent: number): string {
  const n = hex.replace('#', '');
  if (n.length !== 6) return hex;
  const num = parseInt(n, 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0xff) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: ms(3) },
    shadowOpacity: 0.12,
    shadowRadius: ms(6),
    elevation: 3,
  },
  soft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconBadge;
