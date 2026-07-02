import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  useWindowDimensions,
  NativeScrollEvent,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from '../../components/Icon';
import { Brand } from '../../constants/brand';
import { INTRO_SEEN_STORAGE_KEY, INTRO_SLIDES, IntroSlide } from '../../constants/introOnboarding';
import { AuthStackParamList } from '../../types/navigation';
import IntroWelcomeSlide from '../../components/onboarding/IntroWelcomeSlide';
import IntroStandardSlide from '../../components/onboarding/IntroStandardSlide';
import PrimaryButton from '../../components/PrimaryButton';
import { font, hs, ms, spacing, textFamily, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<AuthStackParamList, 'Intro'>;

const FOOTER_H = vs(150);

const IntroOnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const { width: slideWidth, height: windowHeight } = useWindowDimensions();
  const heroHeight = Math.max(vs(200), windowHeight - FOOTER_H - vs(200));
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<IntroSlide>>(null);
  const [index, setIndex] = useState(0);

  const slide = INTRO_SLIDES[index];
  const isLast = index === INTRO_SLIDES.length - 1;
  const isWelcome = slide?.welcome === true;

  const finishIntro = useCallback(async () => {
    await AsyncStorage.setItem(INTRO_SEEN_STORAGE_KEY, 'true');
    navigation.replace('Login');
  }, [navigation]);

  const goNext = useCallback(() => {
    if (isLast) {
      finishIntro();
      return;
    }
    const next = index + 1;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  }, [index, isLast, finishIntro]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const i = Math.round(e.nativeEvent.contentOffset.x / slideWidth);
      if (i !== index && i >= 0 && i < INTRO_SLIDES.length) {
        setIndex(i);
      }
    },
    [index, slideWidth],
  );

  const renderSlide = useCallback(
    ({ item }: { item: IntroSlide }) => {
      if (item.welcome) {
        return (
          <IntroWelcomeSlide
            key="slide-welcome"
            width={slideWidth}
            paddingTop={insets.top + vs(4)}
          />
        );
      }

      return (
        <IntroStandardSlide
          key={`slide-${item.id}`}
          item={item}
          width={slideWidth}
          paddingTop={insets.top + vs(8)}
          heroHeight={heroHeight}
        />
      );
    },
    [insets.top, slideWidth, heroHeight],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
        removeClippedSubviews={false}
        style={styles.list}
        getItemLayout={(_, i) => ({ length: slideWidth, offset: slideWidth * i, index: i })}
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, vs(14)) }]}>
        <View style={styles.dots}>
          {INTRO_SLIDES.map((s, i) => (
            <View key={s.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>

        {isWelcome ? (
          <>
            <TouchableOpacity
              style={styles.getStartedBtn}
              onPress={goNext}
              activeOpacity={0.9}
            >
              <Text style={[styles.getStartedText, textFamily.bold]}>Get Started</Text>
              <Icon name="arrow-right" size={ms(14)} color="#fff" solid />
            </TouchableOpacity>
            <TouchableOpacity onPress={finishIntro} activeOpacity={0.8}>
              <Text style={[styles.skip, textFamily.semibold]}>Skip</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <PrimaryButton label={slide.primaryLabel} onPress={goNext} style={styles.btn} />
            {isLast ? (
              <View style={styles.signInRow}>
                <Text style={[styles.signInMuted, textFamily.regular]}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={finishIntro} activeOpacity={0.8}>
                  <Text style={[styles.signInLink, textFamily.bold]}>Sign in</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  list: {
    flex: 1,
  },
  slide: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: vs(8),
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: hs(8),
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
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(8),
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEF2F6',
  },
  dots: {
    flexDirection: 'row',
    gap: hs(8),
    marginBottom: vs(14),
    alignItems: 'center',
  },
  dot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: ms(22),
    backgroundColor: Brand.blue700,
  },
  getStartedBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    backgroundColor: Brand.blue700,
    paddingVertical: vs(14),
    borderRadius: ms(14),
    marginBottom: vs(8),
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: font.body,
  },
  btn: {
    width: '100%',
    marginBottom: vs(8),
  },
  skip: {
    fontSize: font.body,
    color: Brand.blue700,
    paddingVertical: vs(4),
  },
  signInRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: vs(6),
  },
  signInMuted: {
    fontSize: font.body,
    color: '#64748B',
  },
  signInLink: {
    fontSize: font.body,
    color: Brand.blue700,
  },
});

export default IntroOnboardingScreen;
