import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

/**
 * Applies Poppins app-wide.
 *
 * Setting a single default family is not enough: iOS picks a face by
 * PostScript name, so `fontWeight: '700'` against `Poppins-Regular` renders
 * regular (or a synthesised fake bold). Each weight is therefore mapped to its
 * real file, and fontWeight is normalised so the platform does not synthesise
 * on top of an already-bold face.
 *
 * Styles that name a fontFamily themselves are left untouched.
 */
const FACE_BY_WEIGHT: Record<string, string> = {
  '100': 'Poppins-Regular',
  '200': 'Poppins-Regular',
  '300': 'Poppins-Regular',
  '400': 'Poppins-Regular',
  normal: 'Poppins-Regular',
  '500': 'Poppins-Medium',
  '600': 'Poppins-SemiBold',
  // Poppins-Bold read too heavy across the app (headers, titles, buttons), so
  // every weight from 700 up renders as Medium instead -- there is no
  // Poppins-Bold face in use anywhere now.
  '700': 'Poppins-Medium',
  '800': 'Poppins-Medium',
  '900': 'Poppins-Medium',
  bold: 'Poppins-Medium',
};

const withPoppins = (style: any) => {
  const flat = StyleSheet.flatten(style) || ({} as any);
  // An explicit family wins: those screens already chose a face on purpose.
  if (flat.fontFamily) return style;

  const face = FACE_BY_WEIGHT[String(flat.fontWeight ?? 'normal')] ?? 'Poppins-Regular';
  return [style, { fontFamily: face, fontWeight: 'normal' as const }];
};

export const applyPoppins = () => {
  const AnyText = Text as any;
  const AnyInput = TextInput as any;

  if (AnyText.render && !AnyText.__poppins) {
    const base = AnyText.render;
    AnyText.render = function render(...args: any[]) {
      const el = base.apply(this, args);
      return React.cloneElement(el, { style: withPoppins(el.props.style) });
    };
    AnyText.__poppins = true;
  }

  if (AnyInput.render && !AnyInput.__poppins) {
    const base = AnyInput.render;
    AnyInput.render = function render(...args: any[]) {
      const el = base.apply(this, args);
      return React.cloneElement(el, { style: withPoppins(el.props.style) });
    };
    AnyInput.__poppins = true;
  }
};
