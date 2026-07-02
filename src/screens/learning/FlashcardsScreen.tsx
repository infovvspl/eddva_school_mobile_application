import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import EDDVAScreenHeader from '../../components/EDDVAScreenHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { RootStackParamList } from '../../types/navigation';
import { font, hs, ms, spacing, useScreenLayout, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Flashcards'>;

const CARDS = [
  { q: 'State Newton\'s Second Law', a: 'F = ma — net force equals mass times acceleration.' },
  { q: 'Define electric flux', a: 'Φ = E·A·cosθ for uniform field through flat surface.' },
];

const FlashcardsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { isShort } = useScreenLayout();
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = CARDS[idx];

  return (
    <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: '#0F0A1A' }]}>
      <EDDVAScreenHeader title="AI Flashcards" onBack={() => navigation.goBack()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + vs(20) }]}
      >
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={() => setFlipped(f => !f)}
          style={[styles.cardWrap, isShort && styles.cardWrapShort]}
        >
          <LinearGradient colors={['#004499', '#0066cc']} style={[styles.card, isShort && styles.cardShort]}>
            <Text style={styles.cardLabel}>{flipped ? 'Answer' : 'Question'}</Text>
            <Text style={styles.cardText}>{flipped ? card.a : card.q}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.hint}>Tap card to flip</Text>
        <View style={styles.actions}>
          <PrimaryButton
            label="Ask AI Explainer"
            onPress={() => navigation.navigate('AIStudyRoom', { title: card.q })}
          />
          <PrimaryButton
            label="Next Card"
            variant="outline"
            style={{ marginTop: vs(10) }}
            onPress={() => {
              setFlipped(false);
              setIdx(i => (i + 1) % CARDS.length);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingBottom: vs(8) },
  scroll: { flexGrow: 1 },
  cardWrap: { marginHorizontal: spacing.lg, marginTop: vs(24) },
  cardWrapShort: { marginTop: vs(12) },
  card: {
    minHeight: vs(260),
    borderRadius: ms(24),
    padding: spacing.lg,
    justifyContent: 'center',
  },
  cardShort: { minHeight: vs(190) },
  cardLabel: { fontSize: font.tiny, color: '#7DD3FC', fontWeight: '800', marginBottom: vs(12) },
  cardText: { fontSize: font.subhead, color: '#fff', fontWeight: '700', lineHeight: ms(24) },
  hint: { textAlign: 'center', color: '#64748B', fontSize: font.caption, marginTop: vs(12) },
  actions: { padding: spacing.lg, marginTop: vs(16) },
});

export default FlashcardsScreen;
