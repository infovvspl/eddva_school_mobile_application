import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import EddvaLogo from '../EddvaLogo';
import type { IntroSlide } from '../../constants/introOnboarding';
import { font, hs, ms, spacing, textFamily, vs } from '../../utils/responsive';

type Props = {
  item: IntroSlide;
  width: number;
  paddingTop: number;
  heroHeight: number;
};

/** Slides 2 & 3 — each uses its own image asset (keyed to avoid FlatList reuse bugs). */
const IntroStandardSlide: React.FC<Props> = ({ item, width, paddingTop, heroHeight }) => (
  <View style={[styles.slide, { width, paddingTop }]}>
    <View style={styles.header}>
      <EddvaLogo size={hs(108)} />
    </View>

    <View style={[styles.hero, { height: heroHeight }]}>
      <Image
        key={`intro-hero-${item.id}`}
        source={item.image}
        style={styles.heroImage}
        resizeMode="contain"
      />
    </View>

    <View style={styles.copy}>
      <Text style={[styles.title, textFamily.bold]}>{item.title}</Text>
      <Text style={[styles.desc, textFamily.regular]}>{item.description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: vs(12),
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: hs(8),
    backgroundColor: '#FFFFFF',
  },
  heroImage: {
    width: '92%',
    height: '100%',
    maxHeight: vs(360),
  },
  copy: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(8),
    paddingBottom: vs(4),
    alignItems: 'center',
  },
  title: {
    fontSize: font.headline + 4,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: vs(8),
  },
  desc: {
    fontSize: font.body,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: ms(22),
    maxWidth: hs(320),
  },
});

export default IntroStandardSlide;
