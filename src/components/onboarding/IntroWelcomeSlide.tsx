import React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import IntroFeatureStrip from './IntroFeatureStrip';
import { Brand } from '../../constants/brand';
import { font, hs, ms, spacing, textFamily, vs } from '../../utils/responsive';

const HERO_IMAGE = require('../../assets/onboarding/intro_welcome_hero.png');
const LOGO_IMAGE = require('../../assets/eddva_logo.png');

type Props = {
  width: number;
  paddingTop: number;
};

/** Welcome intro — large logo, clear text, moderate hero image size. */
const IntroWelcomeSlide: React.FC<Props> = ({ width, paddingTop }) => {
  const { height: screenH } = useWindowDimensions();
  const heroHeight = Math.min(vs(260), screenH * 0.32);

  return (
    <View style={[styles.root, { width, paddingTop }]}>
      <View style={styles.decoTopLeft} pointerEvents="none" />
      <View style={styles.decoDotsTR} pointerEvents="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={`tr-${i}`} style={styles.dot} />
        ))}
      </View>

      <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />
      <Text style={[styles.tagline, textFamily.semibold]} numberOfLines={1}>
        ज्ञानं परमं बलम् — LEARN WITH AI
      </Text>

      <Text style={[styles.headline, textFamily.bold]}>
        Learn <Text style={styles.headlineAccent}>Smarter.</Text>
        {'\n'}
        Achieve <Text style={styles.headlineAccent}>Faster.</Text>
      </Text>
      <Text style={[styles.subhead, textFamily.regular]} numberOfLines={3}>
        AI-powered learning for JEE, NEET, School, Colleges & Competitive Exams.
      </Text>

      <View style={[styles.heroWrap, { height: heroHeight, width: width - spacing.md * 2 }]}>
        <Image
          key="intro-welcome-hero"
          source={HERO_IMAGE}
          style={styles.hero}
          resizeMode="contain"
        />
      </View>

      <View style={styles.featuresZone}>
        <IntroFeatureStrip variant="welcome" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  decoTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: hs(100),
    height: vs(88),
    backgroundColor: Brand.blue700,
    borderBottomRightRadius: ms(72),
    opacity: 0.95,
  },
  decoDotsTR: {
    position: 'absolute',
    top: vs(36),
    right: hs(16),
    width: hs(44),
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hs(5),
    opacity: 0.35,
  },
  dot: {
    width: ms(5),
    height: ms(5),
    borderRadius: ms(3),
    backgroundColor: Brand.blue400,
  },
  logo: {
    width: hs(240),
    height: vs(72),
    marginBottom: vs(8),
  },
  tagline: {
    fontSize: font.caption,
    color: Brand.blue900,
    letterSpacing: 0.4,
    marginBottom: vs(10),
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  headline: {
    fontSize: font.headline + 8,
    color: Brand.blue900,
    textAlign: 'center',
    lineHeight: ms(34),
    marginBottom: vs(8),
    paddingHorizontal: spacing.md,
  },
  headlineAccent: {
    color: Brand.blue700,
  },
  subhead: {
    fontSize: font.caption,
    color: '#334155',
    textAlign: 'center',
    lineHeight: ms(20),
    marginBottom: vs(10),
    paddingHorizontal: spacing.lg,
    fontWeight: '500',
  },
  heroWrap: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(4),
  },
  hero: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  featuresZone: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: vs(10),
    paddingBottom: vs(18),
    minHeight: vs(100),
  },
});

export default IntroWelcomeSlide;
