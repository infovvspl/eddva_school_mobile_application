import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet, ViewStyle, ImageStyle, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import { Brand } from '../constants/brand';
import { getSubjectAccent } from '../utils/courseImages';
import { getCourseImageKey, getCourseImageSource } from '../utils/courseThumbnails';

type Props = {
  course: { imageUrl?: string; batchId?: string; id?: string; examType?: string };
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  iconSize?: number;
};

const FallbackCover: React.FC<{ style?: ViewStyle; iconSize: number }> = ({ style, iconSize }) => (
  <LinearGradient
    colors={[Brand.blue900, Brand.blue700, Brand.blue400]}
    style={[styles.fallback, style]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <Icon name="book-open" size={iconSize} color="#fff" solid />
  </LinearGradient>
);

const CourseCoverImage: React.FC<Props> = ({ course, style, imageStyle, iconSize = 28 }) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imageKey = getCourseImageKey(course);
  const source = getCourseImageSource(course);
  const accent = getSubjectAccent(course.examType);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [imageKey]);

  if (!source || failed) {
    return <FallbackCover style={style} iconSize={iconSize} />;
  }

  return (
    <View style={[styles.wrap, style]}>
      {!loaded ? (
        <View style={[styles.placeholder, { backgroundColor: `${accent}18` }]}>
          <ActivityIndicator color={accent} />
        </View>
      ) : null}
      <Image
        key={imageKey}
        source={source}
        style={[styles.image, imageStyle, !loaded && styles.hidden]}
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', alignSelf: 'stretch' },
  image: { width: '100%', height: '100%', backgroundColor: '#E0F2FE' },
  hidden: { opacity: 0 },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CourseCoverImage;
