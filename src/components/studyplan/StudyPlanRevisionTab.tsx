import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from '../Icon';
import { BorderRadius, Shadow } from '../../constants/theme';
import { ThemeColors } from '../../constants/themes';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type RevisionCard = {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: string;
  locked: boolean;
};

type Props = {
  colors: ThemeColors;
  cards: RevisionCard[];
  loading: boolean;
  onCardPress?: (cardId: string) => void;
  onBackToHub?: () => void;
};

const StudyPlanRevisionTab: React.FC<Props> = ({ colors: c, cards, loading, onCardPress }) => {
  if (loading) {
    return <ActivityIndicator color={c.primary} style={{ marginVertical: vs(40) }} />;
  }

  return (
    <View>
      <Text style={[styles.title, { color: c.text }]}>Revision Hub</Text>
      <Text style={[styles.sub, { color: c.textMuted }]}>
        Master topics with smart cycles and intensive review.
      </Text>
      {cards.map(card => (
        <TouchableOpacity
          key={card.id}
          activeOpacity={card.locked ? 1 : 0.88}
          disabled={card.locked}
          onPress={() => {
            if (card.locked) {
              Alert.alert('Locked', 'Complete more of your course to unlock intensive revision.');
              return;
            }
            onCardPress?.(card.id);
          }}
          style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}
        >
          <View style={[styles.iconWrap, { backgroundColor: `${c.primary}18` }]}>
            <Icon name={card.icon} size={ms(22)} color={c.primary} solid />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: c.text }]}>{card.title}</Text>
            <Text style={[styles.cardDesc, { color: c.textMuted }]}>{card.description}</Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: card.locked ? c.chipBg : `${c.primary}18`,
                  alignSelf: 'flex-start',
                },
              ]}
            >
              {card.locked ? (
                <Icon name="lock" size={ms(10)} color={c.textMuted} solid />
              ) : null}
              <Text
                style={[
                  styles.badgeText,
                  { color: card.locked ? c.textMuted : c.primary },
                ]}
              >
                {card.badge}
              </Text>
            </View>
          </View>
          {!card.locked ? (
            <Icon name="chevron-right" size={ms(12)} color={c.textMuted} solid />
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: font.subhead, fontWeight: '800', marginBottom: vs(6) },
  sub: { fontSize: font.body, lineHeight: ms(22), marginBottom: vs(16) },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: vs(12),
  },
  iconWrap: {
    width: hs(48),
    height: hs(48),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: font.body, fontWeight: '800', marginBottom: vs(4) },
  cardDesc: { fontSize: font.caption, lineHeight: ms(20), marginBottom: vs(10) },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    paddingHorizontal: hs(10),
    paddingVertical: vs(5),
    borderRadius: ms(12),
  },
  badgeText: { fontSize: font.tiny, fontWeight: '800' },
});

export default StudyPlanRevisionTab;
