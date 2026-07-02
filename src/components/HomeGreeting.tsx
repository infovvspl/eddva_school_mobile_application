import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';
import { useDemo } from '../context/DemoContext';
import { Brand } from '../constants/brand';
import { BorderRadius, Shadow } from '../constants/theme';
import { font, hs, ms, pagePadding, spacing, vs } from '../utils/responsive';

const HERO_BG_IMAGE = require('../assets/home_header_bg.jpg');
const ACCENT = Brand.blue700;

type Props = {
  navigation: any;
};

type TimeSlot = 'morning' | 'afternoon' | 'evening';

function getTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function formatToday(): string {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

const TIME_META: Record<TimeSlot, { greeting: string; icon: string }> = {
  morning: {
    greeting: 'Good Morning,',
    icon: 'sun',
  },
  afternoon: {
    greeting: 'Good Afternoon,',
    icon: 'cloud-sun',
  },
  evening: {
    greeting: 'Good Evening,',
    icon: 'moon',
  },
};

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || 'Student';
}

const HomeGreeting: React.FC<Props> = () => {
  const { user } = useAuth();
  useDemo();
  const { width } = useWindowDimensions();

  const cardWidth = width - pagePadding * 2;
  const heroHeight = Math.max(vs(220), Math.min(vs(300), cardWidth * 0.58));

  const slot = useMemo(() => getTimeSlot(), []);
  const meta = TIME_META[slot];
  const displayName = user?.fullName || user?.name || 'Student';
  const name = firstName(displayName);
  const dateLine = formatToday();
  const tagLine = user?.examTarget || user?.rankLabel || user?.className || '';

  return (
    <View style={[styles.outer, Shadow.card]}>
      <ImageBackground
        source={HERO_BG_IMAGE}
        style={[styles.heroCard, { height: heroHeight }]}
        imageStyle={styles.heroBgImage}
        resizeMode="cover"
      >
        <View style={styles.leftScrim} pointerEvents="none" />

        <View style={styles.heroContent}>
          <View style={styles.greetRow}>
            <View style={styles.timeIconWrap}>
              <Icon name={meta.icon} size={ms(18)} color="#FBBF24" solid />
            </View>
            <Text style={styles.greetLabel} numberOfLines={1}>
              {meta.greeting}
            </Text>
          </View>

          <Text style={styles.nameLine} numberOfLines={1}>
            {name} 👋
          </Text>
          <Text style={styles.dateLine} numberOfLines={1}>
            {dateLine}
          </Text>

          {tagLine ? (
            <View style={styles.tagPill}>
              <Text style={styles.tagText} numberOfLines={1}>{tagLine}</Text>
            </View>
          ) : null}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: pagePadding,
    marginBottom: vs(16),
    borderRadius: ms(22),
    overflow: 'hidden',
  },
  heroCard: {
    backgroundColor: ACCENT,
    justifyContent: 'center',
    borderRadius: ms(22),
    overflow: 'hidden',
    position: 'relative',
  },
  heroBgImage: {
    borderRadius: ms(22),
  },
  leftScrim: {
    ...StyleSheet.absoluteFillObject,
    width: '48%',
    backgroundColor: 'rgba(0, 50, 130, 0.30)',
    borderTopLeftRadius: ms(22),
    borderBottomLeftRadius: ms(22),
  },
  heroContent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '44%',
    maxWidth: hs(210),
    paddingLeft: spacing.md,
    paddingRight: hs(8),
    paddingTop: vs(22),
    paddingBottom: vs(12),
    justifyContent: 'flex-start',
    zIndex: 1,
  },
  greetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    marginBottom: vs(6),
  },
  timeIconWrap: {
    width: hs(36),
    height: hs(36),
    borderRadius: ms(12),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetLabel: {
    fontSize: font.caption,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
  },
  nameLine: {
    fontSize: font.headline + 1,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.3,
    marginBottom: vs(2),
  },
  dateLine: {
    fontSize: font.subhead,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    marginBottom: vs(10),
  },
  tagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  tagText: {
    fontSize: font.caption,
    fontWeight: '700',
    color: '#fff',
  },
});

export default HomeGreeting;
