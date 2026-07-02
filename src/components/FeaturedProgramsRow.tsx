import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import CourseCoverImage from './CourseCoverImage';
import { CATALOG } from '../mocks/catalog';
import { FEATURED_BATCH_IDS } from '../utils/courseThumbnails';
import { USE_MOCK } from '../config/appConfig';
import { useApi } from '../hooks/useApi';
import { studentService } from '../services/student.service';
import { asArray } from '../utils/apiData';
import { normalizeBatchList } from '../utils/courseMappers';
import { useTheme } from '../context/ThemeContext';
import { Shadow } from '../constants/theme';
import { font, hs, ms, spacing, useScreenLayout, vs } from '../utils/responsive';

type Props = {
  navigation: any;
  title?: string;
  subtitle?: string;
};

const FeaturedProgramsRow: React.FC<Props> = ({
  navigation,
  title = 'EDDVA Programs',
  subtitle = 'Featured batches from EDDVA',
}) => {
  const { theme } = useTheme();
  const { carouselCardWidth: cardW } = useScreenLayout();
  const imageH = Math.round(cardW * (9 / 16));
  const c = theme.colors;

  const { data: discoverData } = useApi(
    () => (USE_MOCK ? Promise.resolve({ data: null }) : studentService.discoverBatches()),
    [],
  );
  const discover = normalizeBatchList(discoverData);

  const featured = USE_MOCK
    ? (FEATURED_BATCH_IDS.map(id => CATALOG.find(b => b.batchId === id)).filter(Boolean) as typeof CATALOG)
    : discover.slice(0, 4);

  if (!featured.length) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      <Text style={[styles.sub, { color: c.textMuted }]}>
        {USE_MOCK && title === 'EDDVA Programs'
          ? 'All 4 flagship batches — swipe to see each banner'
          : subtitle}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {featured.map(course => (
          <TouchableOpacity
            key={course.batchId}
            style={[
              styles.card,
              { width: cardW, backgroundColor: c.card, borderColor: c.border },
              Shadow.soft,
            ]}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate('CourseDetail', { batchId: course.batchId })
            }
          >
            <CourseCoverImage
              course={course}
              style={[styles.thumb, { width: cardW, height: imageH }]}
              imageStyle={[styles.thumb, { width: cardW, height: imageH }]}
              iconSize={24}
            />
            <Text style={[styles.name, { color: c.text }]} numberOfLines={2}>
              {course.displayTitle || course.batchName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: vs(16) },
  title: {
    fontSize: font.subhead,
    fontWeight: '800',
    paddingHorizontal: spacing.md,
    marginBottom: vs(4),
  },
  sub: {
    fontSize: font.tiny,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    marginBottom: vs(10),
  },
  row: {
    paddingHorizontal: spacing.md,
    gap: hs(12),
  },
  card: {
    borderRadius: ms(16),
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumb: {},
  name: {
    fontSize: font.caption,
    fontWeight: '700',
    paddingHorizontal: hs(10),
    paddingVertical: vs(8),
    minHeight: vs(40),
  },
});

export default FeaturedProgramsRow;
