import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import IconBadge from '../components/IconBadge';
import CourseCoverImage from '../components/CourseCoverImage';
import CoursePriceTag from '../components/CoursePriceTag';
import DemoPaymentModal from '../components/DemoPaymentModal';
import PWScreenHeader from '../components/PWScreenHeader';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useDemo } from '../context/DemoContext';
import { useApi } from '../hooks/useApi';
import { useDemoPurchase } from '../hooks/useDemoPurchase';
import { studentService } from '../services/student.service';
import { formatInr } from '../utils/courseImages';
import { asArray } from '../utils/apiData';
import { normalizeBatchList } from '../utils/courseMappers';
import { font, hs, ms, pagePadding, spacing, vs } from '../utils/responsive';

type Props = { navigation: any };

const CoursesScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const { version } = useDemo();
  const { data, loading, refetch } = useApi(() => studentService.discoverBatches(), [version]);
  const batches: any[] = normalizeBatchList(data);

  const {
    paymentVisible,
    paymentBatch,
    startPurchase,
    closePayment,
    onPaymentSuccess,
  } = useDemoPurchase(refetch);

  const renderBatch = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.batchCard, { backgroundColor: c.card, borderColor: c.border }]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('CourseDetail', { batchId: item.id || item.batchId })}
    >
      <CourseCoverImage course={item} style={styles.cover} />
      <View style={styles.batchBody}>
        <View style={styles.batchHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.batchName, { color: c.text }]} numberOfLines={2}>{item.name || item.batchName}</Text>
            {item.instituteName && <Text style={[styles.instituteName, { color: c.textMuted }]}>{item.instituteName}</Text>}
          </View>
          {item.examType || item.examTarget ? (
            <View style={[styles.examChip, { backgroundColor: `${c.primary}15` }]}>
              <Text style={[styles.examChipText, { color: c.primary }]}>
                {(item.examType || item.examTarget || '').toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>

        {item.description && (
          <Text style={[styles.batchDesc, { color: c.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        )}

        <View style={styles.batchMeta}>
          {item.studentCount != null && (
            <View style={styles.metaItem}>
              <Icon name="users" size={11} color={c.textMuted} solid />
              <Text style={[styles.metaText, { color: c.textMuted }]}>{item.studentCount} students</Text>
            </View>
          )}
          {item.rating != null && (
            <View style={styles.metaItem}>
              <Icon name="star" size={11} color="#FBBF24" solid />
              <Text style={[styles.metaText, { color: c.textMuted }]}>{item.rating}</Text>
            </View>
          )}
        </View>

        <View style={[styles.batchFooter, { borderTopColor: c.borderLight }]}>
          <CoursePriceTag
            price={item.price}
            originalPrice={item.originalPrice}
            isPaid={item.isPaid}
            compact
          />
          <TouchableOpacity
            style={[
              styles.enrollBtn,
              { backgroundColor: c.primary },
              item.isEnrolled && { backgroundColor: `${c.success}20` },
            ]}
            onPress={e => {
              e.stopPropagation?.();
              if (!item.isEnrolled) startPurchase(item);
            }}
            disabled={item.isEnrolled}
            activeOpacity={0.8}
          >
            <Text style={[styles.enrollBtnText, item.isEnrolled && { color: c.success }]}>
              {item.isEnrolled
                ? 'Enrolled ✓'
                : item.isPaid
                  ? `Pay ${formatInr(item.price)}`
                  : 'Enroll Free'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <PWScreenHeader
        title="All Institutes"
        subtitle="Browse & enroll — no institute code needed"
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={batches}
        keyExtractor={item => item.id || item.batchId}
        renderItem={renderBatch}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={c.primary} />}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={c.primary} style={{ marginTop: 48 }} />
          ) : (
            <View style={styles.emptyState}>
              <IconBadge name="search" color={c.primary} size="lg" variant="soft" />
              <Text style={[styles.emptyTitle, { color: c.text }]}>No courses available</Text>
              <Text style={[styles.emptySubtitle, { color: c.textMuted }]}>Check back later for new batches</Text>
            </View>
          )
        }
      />

      <DemoPaymentModal
        visible={paymentVisible}
        batch={paymentBatch}
        onClose={closePayment}
        onSuccess={onPaymentSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: pagePadding },
  batchCard: {
    borderRadius: BorderRadius.xl,
    marginBottom: vs(14),
    overflow: 'hidden',
    borderWidth: 1,
    ...Shadow.soft,
  },
  cover: { width: '100%', height: vs(140) },
  batchBody: { padding: vs(14) },
  batchHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: vs(6) },
  batchName: { fontSize: font.subhead, fontWeight: '700' },
  instituteName: { fontSize: font.tiny, marginTop: vs(2) },
  examChip: { paddingHorizontal: spacing.sm, paddingVertical: vs(3), borderRadius: ms(8) },
  examChipText: { fontSize: font.micro, fontWeight: '700' },
  batchDesc: { fontSize: font.caption, marginBottom: vs(10), lineHeight: ms(18) },
  batchMeta: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { fontSize: font.tiny, fontWeight: '600' },
  batchFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.md, borderTopWidth: 1 },
  enrollBtn: { paddingHorizontal: spacing.md, paddingVertical: vs(10), borderRadius: ms(20) },
  enrollBtnText: { fontSize: font.caption, fontWeight: '700', color: '#fff' },
  emptyState: { alignItems: 'center', paddingVertical: vs(48), gap: vs(10) },
  emptyTitle: { fontSize: font.title, fontWeight: '800' },
  emptySubtitle: { fontSize: font.caption },
});

export default CoursesScreen;
