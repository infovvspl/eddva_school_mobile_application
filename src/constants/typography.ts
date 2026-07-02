/** Poppins — linked from assets/fonts via react-native.config.js */
export const Fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semibold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
};

export type FontWeightKey = keyof typeof Fonts;

export function fontFamily(weight: FontWeightKey = 'regular'): string {
  return Fonts[weight];
}
