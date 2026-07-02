import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import Icon from '../Icon';
import { Brand } from '../../constants/brand';
import { getSubjectAccent } from '../../utils/courseImages';
import {
  resolveVideoCardImage,
  type VideoCardImageTier,
} from '../../utils/videoCardImage';
import { hs, vs } from '../../utils/responsive';

const LOAD_TIMEOUT_MS = 8000;

type Props = {
  thumbnailUrl?: string | null;
  course?: Record<string, unknown> | null;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  /** Fill parent — full-bleed card thumbnail */
  fill?: boolean;
  /** When false, only show lecture/video poster — not course cover art */
  fallbackToCourse?: boolean;
  showPlay?: boolean;
  playSize?: 'small' | 'large';
};

const TIER_ORDER: VideoCardImageTier[] = ['poster', 'course', 'fallback'];

/** Video card thumbnail — lecture poster, course cover, stock photo, or bundled art. */
const LectureThumbnail: React.FC<Props> = ({
  thumbnailUrl,
  course,
  style,
  imageStyle,
  fill = false,
  fallbackToCourse = true,
  showPlay = true,
  playSize = 'large',
}) => {
  const [tierIndex, setTierIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const tier = fallbackToCourse ? TIER_ORDER[tierIndex] ?? 'fallback' : 'poster';
  const source = useMemo(
    () => resolveVideoCardImage(thumbnailUrl, course, tier),
    [thumbnailUrl, course, tier],
  );
  const backdropSource = useMemo(() => {
    if (!fallbackToCourse || tier === 'course' || tier === 'fallback') return null;
    return resolveVideoCardImage(thumbnailUrl, course, 'course');
  }, [thumbnailUrl, course, tier, fallbackToCourse]);

  const sourceKey = useMemo(() => {
    if (!source) return 'none';
    if ('uri' in source && source.uri) return source.uri;
    return 'bundled';
  }, [source]);

  useEffect(() => {
    setTierIndex(0);
    setLoaded(false);
  }, [thumbnailUrl, course?.batchId, course?.id, course?.imageUrl, fallbackToCourse]);

  const advanceTier = useCallback(() => {
    setLoaded(false);
    if (!fallbackToCourse) return;
    setTierIndex(i => (i < TIER_ORDER.length - 1 ? i + 1 : i));
  }, [fallbackToCourse]);

  useEffect(() => {
    if (!source || loaded) return;
    const timer = setTimeout(() => advanceTier(), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [sourceKey, source, loaded, advanceTier]);

  const examType = String(
    (course as Record<string, unknown> | undefined)?.examType || '',
  );
  const accent = getSubjectAccent(examType);
  const showImage = Boolean(source);

  return (
    <View style={[styles.wrap, style]}>
      {backdropSource ? (
        <Image
          source={backdropSource}
          style={[styles.image, imageStyle]}
          resizeMode="cover"
        />
      ) : null}
      {showImage ? (
        <>
          <Image
            key={sourceKey}
            source={source!}
            style={[styles.image, imageStyle, !loaded && styles.hidden]}
            resizeMode="cover"
            onLoad={() => setLoaded(true)}
            onError={advanceTier}
          />
        </>
      ) : (
        <View style={[styles.placeholder, { backgroundColor: `${accent}20` }]}>
          <Icon name="play-circle" size={fill ? 36 : 28} color={accent} solid />
        </View>
      )}
      {showPlay && (showImage || backdropSource) ? (
        <View style={[styles.playOverlay, playSize === 'small' && styles.playOverlaySmall]}>
          <View style={[styles.playCircle, playSize === 'small' && styles.playCircleSmall]}>
            <Icon
              name="play"
              size={playSize === 'small' ? 10 : 18}
              color={Brand.blue900}
              solid
            />
          </View>
        </View>
      ) : null}
      {fill && (showImage || backdropSource) ? (
        <View style={styles.bottomFadeLight} pointerEvents="none" />
      ) : showImage ? (
        <View style={styles.bottomFade} pointerEvents="none" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hidden: { opacity: 0 },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 36,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  bottomFadeLight: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '38%',
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  playOverlaySmall: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingRight: hs(8),
    paddingTop: vs(8),
  },
  playCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    paddingLeft: 2,
    opacity: 0.95,
  },
});

export default LectureThumbnail;
