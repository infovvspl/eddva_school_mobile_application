import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import { Colors, BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import type { LiveClassEvent } from '../utils/liveClassEvents';
import { font, hs, ms, pagePadding, spacing, vs } from '../utils/responsive';

type Props = {
  events: LiveClassEvent[];
  loading?: boolean;
  navigation: { navigate: (name: string, params?: object) => void };
};

const DashboardLiveClassesSection: React.FC<Props> = ({ events, loading, navigation }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  if (!loading && events.length === 0) return null;

  const openLive = (ev: LiveClassEvent) => {
    navigation.navigate('LiveClass', {
      lectureId: ev.lectureId || ev.id,
      title: ev.title,
      teacherName: ev.teacherName,
      batchId: ev.batchId,
      topicId: ev.topicId,
    });
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.livePillText}>LIVE NOW</Text>
          </View>
          <Text style={[styles.title, { color: c.text }]}>Join live class</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={() => navigation.navigate('BatchListing', { initialTab: 'live' })}
        >
          <Text style={styles.seeAll}>See all</Text>
          <Icon name="arrow-right" size={ms(10)} color={Colors.primary} solid />
        </TouchableOpacity>
      </View>

      {loading && events.length === 0 ? (
        <ActivityIndicator color={c.primary} style={styles.loader} />
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {events.map(ev => (
            <TouchableOpacity
              key={ev.id}
              style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
              activeOpacity={0.9}
              onPress={() => openLive(ev)}
            >
              <LinearGradient
                colors={['#DC2626', '#B91C1C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.banner}
              >
                <View style={styles.bannerLive}>
                  <View style={styles.liveDot} />
                  <Text style={styles.bannerLiveText}>LIVE</Text>
                </View>
                <Icon name="video" size={ms(22)} color="#fff" solid />
              </LinearGradient>
              <View style={styles.body}>
                <Text style={[styles.cardTitle, { color: c.text }]} numberOfLines={2}>
                  {ev.title}
                </Text>
                {ev.teacherName ? (
                  <Text style={[styles.meta, { color: c.textMuted }]} numberOfLines={1}>
                    {ev.teacherName}
                  </Text>
                ) : null}
                {ev.batchName ? (
                  <Text style={[styles.meta, { color: c.textMuted }]} numberOfLines={1}>
                    {ev.batchName}
                  </Text>
                ) : null}
                <View style={styles.joinRow}>
                  <Text style={[styles.joinText, { color: c.primary }]}>Join now</Text>
                  <Icon name="play-circle" size={ms(14)} color={c.primary} solid />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: vs(20) },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: pagePadding,
    marginBottom: vs(12),
  },
  headLeft: { flex: 1, gap: vs(6) },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: hs(6),
    backgroundColor: '#FEE2E2',
    paddingHorizontal: hs(10),
    paddingVertical: vs(4),
    borderRadius: BorderRadius.full,
  },
  livePillText: { fontSize: font.micro, fontWeight: '800', color: '#DC2626' },
  liveDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#DC2626',
  },
  title: { fontSize: font.subhead, fontWeight: '800', letterSpacing: -0.3 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: hs(4), paddingTop: vs(4) },
  seeAll: { fontSize: font.caption, fontWeight: '700', color: Colors.primary },
  loader: { marginVertical: vs(24) },
  row: { paddingHorizontal: pagePadding, gap: hs(12), paddingBottom: vs(4) },
  card: {
    width: hs(260),
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  banner: {
    height: vs(72),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerLive: {
    position: 'absolute',
    top: vs(8),
    left: hs(8),
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(5),
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    borderRadius: BorderRadius.full,
  },
  bannerLiveText: { color: '#fff', fontSize: font.micro, fontWeight: '800' },
  body: { padding: spacing.md, gap: vs(4) },
  cardTitle: { fontSize: font.body, fontWeight: '800', lineHeight: vs(20), minHeight: vs(40) },
  meta: { fontSize: font.tiny, fontWeight: '500' },
  joinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    marginTop: vs(8),
  },
  joinText: { fontSize: font.caption, fontWeight: '800' },
});

export default DashboardLiveClassesSection;
