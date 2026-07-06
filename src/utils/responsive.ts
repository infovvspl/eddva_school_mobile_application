/**

 * Responsive scaling — design baseline iPhone X (375 × 812).

 * Use moderateScale for fonts & mixed sizes, horizontalScale for widths,

 * verticalScale for heights so layouts look similar across phones.

 */

import { useCallback, useMemo } from 'react';
import {
  Dimensions,
  Platform,
  StatusBar,
  TextStyle,
  useWindowDimensions,
} from 'react-native';

import { Fonts } from '../constants/typography';

export { Fonts };

const { width, height } = Dimensions.get('window');

/** Current window size (use for carousel page width, etc.) */

export const screenWidth = width;

export const screenHeight = height;

const guidelineBaseWidth = 375;

const guidelineBaseHeight = 812;

/** Scale horizontal dimensions (padding, widths, border radius) */

export const horizontalScale = (size: number): number =>
  (width / guidelineBaseWidth) * size;

/** Scale vertical dimensions (heights, vertical margins) */

export const verticalScale = (size: number): number =>
  (height / guidelineBaseHeight) * size;

/**

 * Balanced scale — good for font sizes and icons.

 * @param factor 0 = no scale, 1 = full horizontalScale (default 0.5)

 */

export const moderateScale = (size: number, factor = 0.5): number =>
  size + (horizontalScale(size) - size) * factor;

/** Shorthand aliases */

export const hs = horizontalScale;

export const vs = verticalScale;

export const ms = moderateScale;

/** Fixed text scale — matches login “2nd line” (~11px) on all devices */

const tx = (size: number) => ms(size, 0);

/** Shared spacing from the 375pt-wide mock */

export const spacing = {
  xs: ms(4),

  sm: ms(8),

  md: hs(16),

  lg: hs(20),

  xl: hs(24),
};

/**

 * Typography scale

 * - body / caption / tiny / micro → login subhead size (“2nd line”)

 * - subhead+ → headings only

 */

export const font = {
  micro: tx(10),

  tiny: tx(11),

  caption: tx(12),

  body: tx(12),

  subhead: tx(14),

  title: tx(17),

  headline: tx(20),
};

export const lineHeight = {
  ui: tx(17),

  relaxed: tx(18),

  title: tx(22),
};

/** Ready-made text styles — use fontFamily for true Poppins bold on Android */

export const type = {
  micro: {
    fontSize: font.micro,
    fontFamily: Fonts.regular,
    lineHeight: tx(14),
  } as TextStyle,

  microBold: {
    fontSize: font.micro,
    fontFamily: Fonts.semibold,
    lineHeight: tx(14),
  } as TextStyle,

  tiny: {
    fontSize: font.tiny,
    fontFamily: Fonts.regular,
    lineHeight: lineHeight.ui,
  } as TextStyle,

  tinyBold: {
    fontSize: font.tiny,
    fontFamily: Fonts.semibold,
    lineHeight: lineHeight.ui,
  } as TextStyle,

  caption: {
    fontSize: font.caption,
    fontFamily: Fonts.regular,
    lineHeight: lineHeight.ui,
  } as TextStyle,

  captionBold: {
    fontSize: font.caption,
    fontFamily: Fonts.bold,
    lineHeight: lineHeight.ui,
  } as TextStyle,

  body: {
    fontSize: font.body,
    fontFamily: Fonts.regular,
    lineHeight: lineHeight.ui,
  } as TextStyle,

  bodyBold: {
    fontSize: font.body,
    fontFamily: Fonts.bold,
    lineHeight: lineHeight.ui,
  } as TextStyle,

  subhead: {
    fontSize: font.subhead,
    fontFamily: Fonts.semibold,
    lineHeight: lineHeight.relaxed,
  } as TextStyle,

  subheadBold: {
    fontSize: font.subhead,
    fontFamily: Fonts.bold,
    lineHeight: lineHeight.relaxed,
  } as TextStyle,

  title: {
    fontSize: font.title,
    fontFamily: Fonts.bold,
    lineHeight: lineHeight.title,
  } as TextStyle,

  headline: {
    fontSize: font.headline,
    fontFamily: Fonts.bold,
    lineHeight: lineHeight.title,
  } as TextStyle,
};

/** Tab bar & touch targets */

export const tabBar = {
  iconSize: ms(24),

  iconBox: hs(44),

  barMinHeight: vs(58),

  labelSize: tx(10),
};

/** Safe horizontal page padding */

export const pagePadding = hs(16);

/** Top inset that stays correct after Android translucent status-bar screens. */
export function safeTopInset(insetTop: number, extra = 0): number {
  const androidStatusHeight =
    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
  return Math.max(insetTop, androidStatusHeight) + extra;
}

/** Common layout sizes — prefer these over raw numbers in screens */
export const layout = {
  touchTarget: hs(44),
  touchTargetLg: hs(52),
  iconSm: ms(14),
  iconMd: ms(18),
  iconLg: ms(22),
  avatarSm: hs(40),
  avatarMd: hs(56),
  avatarLg: hs(80),
  cardWidthCarousel: Math.min(hs(220), screenWidth * 0.78),
  cardWidthFeatured: Math.min(hs(220), screenWidth * 0.78),
  dot: ms(8),
};

/** Carousel / video card width for current window */
export function carouselCardWidth(windowWidth = screenWidth): number {
  return Math.min(hs(220), Math.round(windowWidth * 0.78));
}

/** 16:9 video height capped for short phones */
export function videoPlayerHeight(
  windowWidth = screenWidth,
  windowHeight = screenHeight,
): number {
  const natural = windowWidth * (9 / 16);
  return Math.min(natural, Math.round(windowHeight * 0.42));
}

export type ScreenLayout = {
  width: number;
  height: number;
  hs: (n: number) => number;
  vs: (n: number) => number;
  ms: (n: number, factor?: number) => number;
  pagePadding: number;
  carouselCardWidth: number;
  videoPlayerHeight: number;
  isNarrow: boolean;
  isShort: boolean;
};

/** Live dimensions — use in screens instead of module-level Dimensions.get */
export function useScreenLayout(): ScreenLayout {
  const { width, height } = useWindowDimensions();

  const scaleH = useCallback(
    (n: number) => (width / guidelineBaseWidth) * n,
    [width],
  );
  const scaleV = useCallback(
    (n: number) => (height / guidelineBaseHeight) * n,
    [height],
  );
  const scaleM = useCallback(
    (n: number, factor = 0.5) => n + (scaleH(n) - n) * factor,
    [scaleH],
  );

  return useMemo(
    () => ({
      width,
      height,
      hs: scaleH,
      vs: scaleV,
      ms: scaleM,
      pagePadding: scaleH(16),
      carouselCardWidth: carouselCardWidth(width),
      videoPlayerHeight: videoPlayerHeight(width, height),
      isNarrow: width < 360,
      isShort: height < 700,
    }),
    [width, height, scaleH, scaleV, scaleM],
  );
}

/** Poppins text styles — prefer fontFamily over fontWeight for correct weights */

export const textFamily = {
  regular: { fontFamily: Fonts.regular } as TextStyle,

  medium: { fontFamily: Fonts.medium } as TextStyle,

  semibold: { fontFamily: Fonts.semibold } as TextStyle,

  bold: { fontFamily: Fonts.bold } as TextStyle,
};
