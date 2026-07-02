import React from 'react';
import { View } from 'react-native';

// Web stub: renders SVG containers as plain Views
export const Svg = ({ width, height, style, children }) => (
  <View style={[{ width, height, overflow: 'hidden' }, style]}>{children}</View>
);
export const Circle = () => null;
export const Path = () => null;
export const Rect = () => null;
export const G = ({ children }) => <>{children}</>;
export const Defs = () => null;
export const LinearGradient = ({ children }) => <>{children}</>;
export const Stop = () => null;
export const Text = ({ children, ...p }) => <View />;
export default Svg;
