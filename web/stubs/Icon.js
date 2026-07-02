import React from 'react';
import { Text } from 'react-native';

// Web stub: renders icon name as a small text label (invisible in UI, just a placeholder)
const Icon = ({ name = '', size = 16, color = '#000', style }) => (
  <Text style={[{ fontSize: size * 0.75, color, fontFamily: 'monospace' }, style]}>
    {/* Icon: {name} */}
  </Text>
);

export default Icon;
