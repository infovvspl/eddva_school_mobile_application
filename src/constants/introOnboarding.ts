import { ImageSourcePropType } from 'react-native';

export const INTRO_SEEN_STORAGE_KEY = 'eddva_intro_onboarding_seen';
/** When APP_BUILD_LABEL changes, intro slides show again once. */
export const INTRO_BUILD_STORAGE_KEY = 'eddva_intro_build_label';

export type IntroSlide = {
  id: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
  welcome?: boolean;
  primaryLabel: string;
  secondaryLabel?: string;
};

/** 3-screen EDDVA intro — welcome + features, learn + features, AI */
export const INTRO_SLIDES: IntroSlide[] = [
  {
    id: 'welcome',
    title: 'Learn Smarter. Achieve Faster.',
    description:
      'AI-powered learning for JEE, NEET, School, Colleges & Competitive Exams.',
    image: require('../assets/onboarding/intro_welcome_hero.png'),
    welcome: true,
    primaryLabel: 'Get Started',
    secondaryLabel: 'Skip',
  },
  {
    id: 'learn',
    title: 'Learn Your Way',
    description: 'Explore expert designed programs, live classes and self-paced learning.',
    image: require('../assets/onboarding/intro-learn.png'),
    primaryLabel: 'Next',
  },
  {
    id: 'ai',
    title: 'AI That Supports You',
    description: 'Get instant help from AI Guru, smart recommendations and personalized guidance.',
    image: require('../assets/onboarding/intro-ai.png'),
    primaryLabel: "Let's Go!",
  },
];
