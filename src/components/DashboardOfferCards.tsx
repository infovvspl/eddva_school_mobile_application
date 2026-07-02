import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import { Brand } from '../constants/brand';
import { Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { font, hs, ms, spacing, vs } from '../utils/responsive';

export type OfferItem = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  cta: string;
  colors: string[];
  icon: string;
  onPress?: () => void;
};

const DEFAULT_OFFERS: OfferItem[] = [
  {
    id: 'launch',
    tag: 'LIMITED',
    title: '40% OFF',
    subtitle: 'On your first batch enrollment',
    cta: 'Grab offer',
    colors: ['#EA580C', '#F97316'],
    icon: 'percent',
  },
  {
    id: 'scholarship',
    tag: 'NEW',
    title: 'Scholarship',
    subtitle: 'Merit seats for top rankers',
    cta: 'Apply now',
    colors: [...Brand.gradient],
    icon: 'award',
  },
  {
    id: 'trial',
    tag: 'FREE',
    title: '7-Day Trial',
    subtitle: 'Try live classes & DPP free',
    cta: 'Start trial',
    colors: ['#059669', '#10B981'],
    icon: 'play-circle',
  },
  {
    id: 'refer',
    tag: 'EARN',
    title: 'Refer & Win',
    subtitle: '₹500 wallet per friend join',
    cta: 'Invite',
    colors: ['#7C3AED', '#A855F7'],
    icon: 'gift',
  },
];

type Props = {
  offers?: OfferItem[];
  onOfferPress?: (offer: OfferItem) => void;
};

const CARD_W = hs(260);

const DashboardOfferCards: React.FC<Props> = ({ offers = DEFAULT_OFFERS, onOfferPress }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={[styles.title, { color: c.text }]}>Offers for you</Text>
        <Text style={[styles.seeAll, { color: c.primary }]}>See all</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {offers.map(offer => (
          <TouchableOpacity
            key={offer.id}
            activeOpacity={0.9}
            onPress={() => onOfferPress?.(offer)}
          >
            <LinearGradient
              colors={offer.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, Shadow.card]}
            >
              <View style={styles.tag}>
                <Text style={styles.tagText}>{offer.tag}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.iconWrap}>
                  <Icon name={offer.icon} size={ms(20)} color="#fff" solid />
                </View>
                <View style={styles.textBlock}>
                  <Text style={styles.cardTitle}>{offer.title}</Text>
                  <Text style={styles.cardSub} numberOfLines={2}>
                    {offer.subtitle}
                  </Text>
                </View>
              </View>
              <View style={styles.ctaRow}>
                <Text style={styles.cta}>{offer.cta}</Text>
                <Icon name="arrow-right" size={ms(11)} color="#fff" solid />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: vs(18) },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: vs(10),
  },
  title: { fontSize: font.subhead, fontWeight: '800' },
  seeAll: { fontSize: font.caption, fontWeight: '700' },
  row: { paddingHorizontal: spacing.md, gap: hs(12) },
  card: {
    width: CARD_W,
    borderRadius: ms(18),
    padding: spacing.md,
    minHeight: vs(130),
    justifyContent: 'space-between',
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    borderRadius: ms(6),
    marginBottom: vs(8),
  },
  tagText: { fontSize: font.micro, fontWeight: '900', color: '#fff', letterSpacing: 0.6 },
  cardBody: { flexDirection: 'row', alignItems: 'flex-start', gap: hs(10) },
  iconWrap: {
    width: hs(40),
    height: hs(40),
    borderRadius: ms(12),
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1 },
  cardTitle: { fontSize: font.title, fontWeight: '900', color: '#fff', marginBottom: vs(4) },
  cardSub: { fontSize: font.caption, color: 'rgba(255,255,255,0.92)', lineHeight: vs(18) },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: hs(6), marginTop: vs(10) },
  cta: { fontSize: font.caption, fontWeight: '800', color: '#fff' },
});

export default DashboardOfferCards;
