import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, {
  Defs,
  ClipPath,
  LinearGradient,
  Stop,
  Rect,
  G,
} from 'react-native-svg';

/**
 * Backdrop behind the dashboard header: a plain diagonal blue gradient,
 * clipped to the header's rounded bottom. Earlier versions layered in colour
 * blooms, rings and light streaks; those read as washed-out white patches
 * over the blue rather than texture, so this stays to one clean gradient.
 * Purely presentational and non-interactive.
 */
export function HeaderBackdrop({
  width,
  height,
  radius = 30,
}: {
  width: number;
  height: number;
  radius?: number;
}) {
  // Percentage sizing does not resolve against an absolutely positioned
  // parent here, so the header measures itself and passes pixels in.
  if (!width || !height) return null;

  const W = 400;
  const H = 300;
  // Keep the corner radius visually correct once the box is stretched.
  const rx = (radius / width) * W;
  const ry = (radius / height) * H;

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="base" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#152A66" />
          <Stop offset="1" stopColor="#2C56C7" />
        </LinearGradient>

        {/* Everything is clipped so the artwork honours the rounded bottom. */}
        <ClipPath id="clip">
          <Rect x="0" y="0" width={W} height={H} rx={rx} ry={ry} />
        </ClipPath>
      </Defs>

      <G clipPath="url(#clip)">
        <Rect x="0" y="0" width={W} height={H} fill="url(#base)" />
      </G>
    </Svg>
  );
}
