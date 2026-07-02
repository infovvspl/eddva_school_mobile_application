import React from 'react';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import type { ColorValue, StyleProp, TextStyle } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: ColorValue;
  solid?: boolean;
  brand?: boolean;
  style?: StyleProp<TextStyle>;
}

/**
 * Thin wrapper around @react-native-vector-icons/fontawesome5 that maps the
 * legacy `solid`/`brand` boolean props to `iconStyle` and accepts `name` as a
 * plain string so callers don't need to narrow to the exhaustive icon union.
 */
const Icon: React.FC<IconProps> = ({ name, size = 16, color = '#000000', solid = false, brand = false, style }) => (
  <FontAwesome5
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name={name as any}
    size={size}
    color={color as string}
    iconStyle={brand ? 'brand' : solid ? 'solid' : 'regular'}
    style={style}
  />
);

export default Icon;
