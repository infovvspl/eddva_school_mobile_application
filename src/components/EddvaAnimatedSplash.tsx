import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { splashSvg } from '../assets/eddva_splash_assets/splashSvgXml';
import { Brand } from '../constants/brand';
import { hs, ms, vs } from '../utils/responsive';

type Props = {
  onFinish?: () => void;
  durationMs?: number;
  canFinish?: boolean;
};

type BubbleItem = {
  key: string;
  icon: keyof typeof splashSvg;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  size: number;
  iconSize: number;
  delay?: number;
  reverse?: boolean;
};

const BUBBLES: BubbleItem[] = [
  { key: 'atom', icon: 'atom', left: 38, top: 7, size: 72, iconSize: 35 },
  { key: 'dna', icon: 'dna', right: -8, top: 10, size: 114, iconSize: 58, reverse: true },
  { key: 'graduationCap', icon: 'graduationCap', left: 11, top: 20, size: 70, iconSize: 39, delay: 90 },
  { key: 'bot', icon: 'aiBot', right: 28, top: 27, size: 76, iconSize: 38, reverse: true, delay: 120 },
  { key: 'microscope', icon: 'microscope', right: 6, top: 37, size: 82, iconSize: 43, delay: 80 },
  { key: 'target', icon: 'target', left: 5, bottom: 32, size: 72, iconSize: 39, reverse: true, delay: 120 },
  { key: 'stethoscope', icon: 'stethoscope', right: 8, bottom: 31, size: 82, iconSize: 41, delay: 160 },
  { key: 'book', icon: 'book', left: 30, bottom: 17, size: 82, iconSize: 41, reverse: true, delay: 60 },
];

const EddvaAnimatedSplash: React.FC<Props> = ({ onFinish, durationMs = 3400, canFinish = true }) => {
  const { width } = useWindowDimensions();
  const exitFade = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;
  const sceneFade = useRef(new Animated.Value(0)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.94)).current;
  const logoLift = useRef(new Animated.Value(10)).current;
  const float = useRef(new Animated.Value(0)).current;
  const minTimeDone = useRef(false);
  const finished = useRef(false);
  const canFinishRef = useRef(canFinish);
  const onFinishRef = useRef(onFinish);

  canFinishRef.current = canFinish;
  onFinishRef.current = onFinish;

  useEffect(() => {
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor('transparent', true);
    StatusBar.setHidden(true, 'fade');

    const entryAnim = Animated.parallel([
      Animated.timing(sceneFade, {
        toValue: 1,
        duration: 760,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 720,
        delay: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoLift, {
        toValue: 0,
        duration: 700,
        delay: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.012,
          duration: 760,
          delay: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]);

    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    entryAnim.start();
    floatAnim.start();

    const timer = setTimeout(() => {
      minTimeDone.current = true;
      if (canFinishRef.current && !finished.current) {
        finished.current = true;
        Animated.parallel([
          Animated.timing(exitFade, {
            toValue: 0,
            duration: 560,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(exitScale, {
            toValue: 1.006,
            duration: 560,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => onFinishRef.current?.());
      }
    }, durationMs);

    return () => {
      clearTimeout(timer);
      floatAnim.stop();
      StatusBar.setHidden(false, 'fade');
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor('#FFFFFF', true);
    };
  }, [durationMs, exitFade, exitScale, float, logoFade, logoLift, logoScale, sceneFade]);

  useEffect(() => {
    if (!canFinish || !minTimeDone.current || finished.current) return;
    finished.current = true;
    Animated.parallel([
      Animated.timing(exitFade, {
        toValue: 0,
        duration: 560,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(exitScale, {
        toValue: 1.006,
        duration: 560,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => onFinishRef.current?.());
  }, [canFinish, exitFade, exitScale]);

  const floatUp = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });
  const floatDown = float.interpolate({
    inputRange: [0, 1],
    outputRange: [-4, 4],
  });

  const logoWidth = Math.min(width * 0.75, hs(360));
  const logoHeight = logoWidth * 0.3; // Give it a proportional height
  const topDiscSize = width * 0.88;
  const bottomDiscSize = width * 1.08;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: exitFade,
          transform: [{ scale: exitScale }],
        },
      ]}
    >
      <StatusBar hidden translucent backgroundColor="transparent" />

      <Animated.View style={[styles.background, { opacity: sceneFade }]}>
        <SvgXml
          xml={splashSvg.backgroundBase}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
        />
        <SvgXml
          xml={splashSvg.largeGradientCircle}
          width={topDiscSize}
          height={topDiscSize}
          style={styles.topAssetCircle}
        />
        <SvgXml
          xml={splashSvg.largeGradientCircle}
          width={bottomDiscSize}
          height={bottomDiscSize}
          style={styles.bottomAssetCircle}
        />
        <View style={[styles.ring, styles.ringTopLeft]} />
        <View style={[styles.ring, styles.ringBottomLeft]} />
        <View style={[styles.ring, styles.ringBottomRight]} />
        <View style={styles.centerGlow} />
        <SvgXml xml={splashSvg.dotPattern} width={hs(64)} height={hs(64)} style={styles.assetDotBottom} />
        <SvgXml xml={splashSvg.dotPattern} width={hs(48)} height={hs(48)} style={styles.assetDotTop} />
        <SvgXml xml={splashSvg.graph} width={hs(104)} height={hs(104)} style={styles.assetGraph} />
        <DecorativeMath />
      </Animated.View>

      {BUBBLES.map(item => {
        const floatY = item.reverse ? floatDown : floatUp;
        return (
          <Animated.View
            key={item.key}
            style={[
              styles.glassBubble,
              {
                width: hs(item.size),
                height: hs(item.size),
                borderRadius: hs(item.size / 2),
                left: item.left == null ? undefined : `${item.left}%`,
                right: item.right == null ? undefined : `${item.right}%`,
                top: item.top == null ? undefined : `${item.top}%`,
                bottom: item.bottom == null ? undefined : `${item.bottom}%`,
                opacity: sceneFade,
                transform: [{ translateY: floatY }],
              },
            ]}
          >
            <SvgXml xml={splashSvg.glassBubble} width="100%" height="100%" />
            <SvgXml
              xml={splashSvg[item.icon]}
              width={ms(item.iconSize)}
              height={ms(item.iconSize)}
              style={styles.assetIcon}
            />
          </Animated.View>
        );
      })}

      <Animated.View
        style={[
          styles.brandBlock,
          {
            opacity: logoFade,
            transform: [{ translateY: logoLift }, { scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require('../assets/eddva_logo.png')}
          style={[styles.logo, { width: logoWidth, height: logoHeight }]}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
};

const DecorativeMath = () => (
  <>
    <Text style={[styles.formula, styles.formulaEnergy]}>E = mc²</Text>
    <Text style={[styles.formula, styles.formulaEnergyClean]}>E = mc^2</Text>
    <Text style={[styles.formula, styles.formulaForce]}>F = ma</Text>
    <View style={styles.triangleWrap}>
      <Text style={[styles.geoLabel, styles.geoA]}>A</Text>
      <Text style={[styles.geoLabel, styles.geoB]}>B</Text>
      <Text style={[styles.geoLabel, styles.geoC]}>C</Text>
      <View style={styles.triangle} />
      <View style={styles.triangleBase} />
      <View style={styles.triangleMid} />
    </View>
    <View style={styles.graph}>
      <View style={styles.graphY} />
      <View style={styles.graphX} />
      <View style={styles.graphCurve} />
      <Text style={[styles.graphLabel, styles.graphLabelY]}>y</Text>
      <Text style={[styles.graphLabel, styles.graphLabelX]}>x</Text>
    </View>
    <View style={styles.dotGrid}>
      {Array.from({ length: 12 }).map((_, index) => (
        <View key={index} style={styles.dot} />
      ))}
    </View>
    <View style={styles.dotGridSmall}>
      {Array.from({ length: 9 }).map((_, index) => (
        <View key={index} style={styles.dotSmall} />
      ))}
    </View>
    <View style={styles.molecule}>
      <View style={[styles.moleculeDot, styles.moleculeDotA]} />
      <View style={[styles.moleculeDot, styles.moleculeDotB]} />
      <View style={[styles.moleculeDot, styles.moleculeDotC]} />
      <View style={[styles.moleculeLine, styles.moleculeLineA]} />
      <View style={[styles.moleculeLine, styles.moleculeLineB]} />
    </View>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#F8FCFF',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#F8FCFF',
  },
  bgGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  topAssetCircle: {
    position: 'absolute',
    left: hs(-198),
    top: vs(-194),
    opacity: 0.42,
  },
  bottomAssetCircle: {
    position: 'absolute',
    left: hs(-236),
    bottom: vs(-246),
    opacity: 0.46,
  },
  assetDotTop: {
    position: 'absolute',
    right: '24%',
    top: '7%',
    opacity: 0.18,
  },
  assetDotBottom: {
    position: 'absolute',
    left: '31%',
    bottom: '7%',
    opacity: 0.28,
  },
  assetGraph: {
    position: 'absolute',
    right: '16%',
    bottom: '25%',
    opacity: 0.1,
  },
  centerGlow: {
    position: 'absolute',
    left: '10%',
    right: '10%',
    top: '36.5%',
    height: vs(138),
    borderRadius: ms(80),
    backgroundColor: 'rgba(255,255,255,0.42)',
    shadowColor: Brand.blue700,
    shadowOpacity: 0.04,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
  },
  cornerDisc: {
    position: 'absolute',
    backgroundColor: 'rgba(66, 171, 245, 0.62)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.72)',
    shadowColor: Brand.blue700,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  cornerDiscTop: {
    left: hs(-176),
    top: vs(-170),
  },
  cornerDiscBottom: {
    left: hs(-190),
    bottom: vs(-194),
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(120, 188, 255, 0.18)',
  },
  ringTopLeft: {
    width: hs(236),
    height: hs(236),
    borderRadius: hs(118),
    left: hs(-92),
    top: vs(-78),
  },
  ringBottomLeft: {
    width: hs(278),
    height: hs(278),
    borderRadius: hs(139),
    left: hs(-128),
    bottom: vs(-118),
  },
  ringBottomRight: {
    width: hs(120),
    height: hs(120),
    borderRadius: hs(60),
    right: hs(-42),
    bottom: vs(-12),
  },
  glassBubble: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    shadowColor: Brand.blue700,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  bubbleHighlight: {
    position: 'absolute',
    left: '10%',
    top: '8%',
    width: '38%',
    height: '30%',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  bubbleCore: {
    position: 'absolute',
    width: '66%',
    height: '66%',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.84)',
    transform: [{ rotate: '45deg' }],
  },
  assetIcon: {
    position: 'absolute',
  },
  brandBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
  },
  logo: {
    minWidth: hs(260),
  },
  formula: {
    position: 'absolute',
    color: 'rgba(53, 150, 245, 0.18)',
    fontSize: ms(16),
    fontWeight: '800',
  },
  formulaEnergy: {
    opacity: 0,
  },
  formulaEnergyClean: {
    right: '29%',
    top: '16%',
    transform: [{ rotate: '2deg' }],
  },
  formulaForce: {
    left: '13%',
    bottom: '29%',
    transform: [{ rotate: '-11deg' }],
  },
  triangleWrap: {
    position: 'absolute',
    left: '7%',
    top: '29%',
    width: hs(68),
    height: hs(68),
    opacity: 0.16,
  },
  triangle: {
    position: 'absolute',
    left: hs(18),
    top: hs(8),
    width: 0,
    height: 0,
    borderLeftWidth: hs(27),
    borderRightWidth: hs(27),
    borderBottomWidth: hs(54),
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(78, 160, 245, 0.36)',
  },
  triangleBase: {
    position: 'absolute',
    left: hs(21),
    bottom: hs(7),
    width: hs(51),
    height: 1,
    backgroundColor: 'rgba(78, 160, 245, 0.66)',
  },
  triangleMid: {
    position: 'absolute',
    left: hs(45),
    top: hs(18),
    width: 1,
    height: hs(43),
    backgroundColor: 'rgba(78, 160, 245, 0.48)',
  },
  geoLabel: {
    position: 'absolute',
    color: 'rgba(53, 150, 245, 0.58)',
    fontSize: ms(14),
    fontWeight: '800',
  },
  geoA: { left: hs(41), top: 0 },
  geoB: { left: 0, bottom: hs(2) },
  geoC: { right: 0, bottom: hs(2) },
  graph: {
    position: 'absolute',
    right: '18%',
    bottom: '29%',
    width: hs(86),
    height: hs(70),
    opacity: 0.12,
  },
  graphY: {
    position: 'absolute',
    left: hs(10),
    top: 0,
    bottom: hs(6),
    width: 1,
    backgroundColor: 'rgba(53, 150, 245, 0.72)',
  },
  graphX: {
    position: 'absolute',
    left: hs(10),
    bottom: hs(6),
    right: 0,
    height: 1,
    backgroundColor: 'rgba(53, 150, 245, 0.72)',
  },
  graphCurve: {
    position: 'absolute',
    left: hs(12),
    bottom: hs(7),
    width: hs(74),
    height: hs(48),
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderColor: 'rgba(53, 150, 245, 0.58)',
    borderTopLeftRadius: hs(70),
    transform: [{ rotate: '-12deg' }],
  },
  graphLabel: {
    position: 'absolute',
    color: 'rgba(53, 150, 245, 0.62)',
    fontSize: ms(12),
    fontWeight: '800',
  },
  graphLabelY: { left: hs(3), top: hs(-6) },
  graphLabelX: { right: hs(-8), bottom: hs(-4) },
  dotGrid: {
    position: 'absolute',
    left: '30%',
    bottom: '6%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: hs(42),
    gap: hs(7),
    opacity: 0.22,
  },
  dotGridSmall: {
    position: 'absolute',
    right: '23%',
    top: '6%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: hs(36),
    gap: hs(7),
    opacity: 0.14,
  },
  dot: {
    width: hs(4),
    height: hs(4),
    borderRadius: hs(2),
    backgroundColor: 'rgba(53, 150, 245, 0.72)',
  },
  dotSmall: {
    width: hs(3),
    height: hs(3),
    borderRadius: hs(1.5),
    backgroundColor: 'rgba(53, 150, 245, 0.55)',
  },
  molecule: {
    position: 'absolute',
    right: '-4%',
    top: '38%',
    width: hs(120),
    height: hs(150),
    opacity: 0.1,
  },
  moleculeDot: {
    position: 'absolute',
    width: hs(8),
    height: hs(8),
    borderRadius: hs(4),
    backgroundColor: Brand.blue400,
  },
  moleculeDotA: { left: hs(20), top: hs(18) },
  moleculeDotB: { right: hs(28), top: hs(54) },
  moleculeDotC: { left: hs(42), bottom: hs(22) },
  moleculeLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: Brand.blue400,
  },
  moleculeLineA: {
    left: hs(27),
    top: hs(34),
    width: hs(54),
    transform: [{ rotate: '31deg' }],
  },
  moleculeLineB: {
    left: hs(56),
    top: hs(86),
    width: hs(54),
    transform: [{ rotate: '107deg' }],
  },
});

export default EddvaAnimatedSplash;
