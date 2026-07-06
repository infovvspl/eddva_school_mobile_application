import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  useWindowDimensions,
  NativeScrollEvent,
  Image,
  ImageSourcePropType,
  SafeAreaView
} from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import { ArrowRight } from 'lucide-react-native';

type IntroSlide = {
  id: string;
  titleTop: string;
  titleBottom: string;
  description: string;
  image: ImageSourcePropType;
};

const INTRO_SLIDES: IntroSlide[] = [
  {
    id: 'learn',
    titleTop: 'Learn Better,',
    titleBottom: 'Achieve More',
    description: 'AI-powered learning that understands you\nand helps you reach your full potential.',
    image: require('../../assets/intro1.png'),
  },
  {
    id: 'supercharged',
    titleTop: 'Your Learning,',
    titleBottom: 'Supercharged.',
    description: 'Personalized study plans, real-time progress\ntracking, and AI support—designed to help\nyou succeed.',
    image: require('../../assets/intro2.png'),
  },
];

export function OnboardingScreen({
  onContinue,
}: {
  theme: { background: string; surface: string; text: string; subtext: string; primary: string; primarySoft: string; border: string; accent: string };
  onContinue: () => void;
}) {
  const { width: slideWidth } = useWindowDimensions();
  const listRef = useRef<FlatList<IntroSlide>>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === INTRO_SLIDES.length - 1;

  const goNext = () => {
    if (isLast) {
      onContinue();
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
    if (i !== index && i >= 0 && i < INTRO_SLIDES.length) {
      setIndex(i);
    }
  };

  const renderSlide = ({ item }: { item: IntroSlide }) => {
    return (
      <View style={[styles.slide, { width: slideWidth }]}>
        {/* Full Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          <Text style={styles.titleTop}>{item.titleTop}</Text>
          <Text style={styles.titleBottom}>{item.titleBottom}</Text>
          
          <Text style={styles.desc}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Top Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onContinue} activeOpacity={0.8} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        data={INTRO_SLIDES}
        renderItem={renderSlide}
        keyExtractor={s => s.id}
        extraData={index}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        bounces={false}
        getItemLayout={(_, i) => ({ length: slideWidth, offset: slideWidth * i, index: i })}
      />

      <View style={styles.footer}>
        {/* Empty left view to balance the flex layout */}
        <View style={styles.footerSpacer} />

        {/* Dots centered */}
        <View style={styles.dots}>
          {INTRO_SLIDES.map((s, i) => (
            <View key={s.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
          {/* Third dot placeholder to match the reference mockup which has 3 dots */}
          <View style={[styles.dot, index === 2 && styles.dotActive]} /> 
        </View>
        
        {/* Right Arrow Button */}
        <View style={styles.footerSpacer}>
          <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.8}>
            <ArrowRight size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: hs(24),
    paddingTop: vs(16),
    zIndex: 10,
  },
  skipBtn: {
    paddingVertical: vs(8),
    paddingHorizontal: hs(12),
  },
  skipText: {
    fontFamily: 'Poppins-Medium',
    fontSize: ms(16),
    color: '#475569',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: '55%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(-20), // offset slightly up
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: hs(32),
    marginTop: vs(10),
  },
  titleTop: {
    fontFamily: 'Poppins-Bold',
    fontSize: ms(32),
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: ms(40),
  },
  titleBottom: {
    fontFamily: 'Poppins-Bold',
    fontSize: ms(32),
    color: '#6366F1', // Purple color
    textAlign: 'center',
    lineHeight: ms(40),
    marginBottom: vs(20),
  },
  desc: {
    fontFamily: 'Poppins-Regular',
    fontSize: ms(15),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: ms(24),
  },
  footer: {
    flexDirection: 'row',
    height: vs(100),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: hs(24),
    paddingBottom: vs(24),
  },
  footerSpacer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dots: {
    flexDirection: 'row',
    gap: hs(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    backgroundColor: '#E2E8F0',
  },
  dotActive: {
    backgroundColor: '#6366F1', // Purple color
  },
  nextBtn: {
    width: ms(60),
    height: ms(60),
    borderRadius: ms(30),
    backgroundColor: '#6366F1', // Purple color
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.3,
    shadowRadius: ms(8),
    elevation: 5,
  },
});
