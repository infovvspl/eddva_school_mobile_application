import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const horizontalScale = (size: number): number => (width / guidelineBaseWidth) * size;
export const verticalScale = (size: number): number => (height / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5): number => size + (horizontalScale(size) - size) * factor;

export const hs = horizontalScale;
export const vs = verticalScale;
export const ms = moderateScale;
