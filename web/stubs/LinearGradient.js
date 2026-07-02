import React from 'react';
import { View } from 'react-native';

// Web stub: renders the first color as a CSS gradient background
const LinearGradient = ({ colors = [], style, children, start, end, ...rest }) => {
  const angle = start && end
    ? Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI) + 90
    : 135;
  const gradient = colors.length > 1
    ? `linear-gradient(${angle}deg, ${colors.join(', ')})`
    : colors[0] || 'transparent';

  return (
    <View style={[style, { backgroundImage: gradient, background: gradient }]} {...rest}>
      {children}
    </View>
  );
};

export default LinearGradient;
