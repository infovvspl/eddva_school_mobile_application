import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../components/Icon';
import PrimaryButton from '../../components/PrimaryButton';
import { Brand } from '../../constants/brand';
import { BorderRadius, Shadow } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { BattleStackParamList } from '../../types/navigation';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<BattleStackParamList, 'BattleResults'>;

const BattleResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const { won, myScore, oppScore, eloDelta, roomCode } = route.params;

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <LinearGradient colors={[...Brand.gradient]} style={styles.hero}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('BattleLobby')}
          activeOpacity={0.85}
        >
          <Icon name="arrow-left" size={ms(16)} color="#fff" solid />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>{won ? 'Victory!' : 'Defeat'}</Text>
        <Text style={styles.heroSub}>Battle complete</Text>
        <Icon name={won ? 'trophy' : 'flag'} size={ms(44)} color="#fff" solid />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + vs(28) }]}
      >
        <View style={[styles.scoreCard, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
          <Text style={[styles.scoreLine, { color: c.text }]}>
            {myScore} <Text style={{ color: c.textMuted }}>—</Text> {oppScore}
          </Text>
          <View style={[styles.eloRow, { borderTopColor: c.border }]}>
            <Text style={[styles.eloLbl, { color: c.textMuted }]}>ELO change</Text>
            <Text
              style={[
                styles.eloVal,
                { color: eloDelta >= 0 ? '#16A34A' : '#EF4444' },
              ]}
            >
              {eloDelta >= 0 ? '+' : ''}
              {eloDelta}
            </Text>
          </View>
          {roomCode ? (
            <Text style={[styles.room, { color: c.textMuted }]}>Room {roomCode}</Text>
          ) : null}
        </View>

        <PrimaryButton
          label="Play again"
          onPress={() => navigation.replace('BattleMatchmaker', { mode: '1v1' })}
        />
        <PrimaryButton
          label="Back to arena"
          onPress={() => navigation.navigate('BattleLobby')}
          variant="outline"
          style={{ marginTop: vs(10) }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    gap: vs(6),
  },
  backBtn: {
    alignSelf: 'flex-start',
    padding: vs(8),
    marginBottom: vs(4),
  },
  heroTitle: {
    fontSize: font.headline + 2,
    fontWeight: '900',
    color: '#fff',
  },
  heroSub: {
    fontSize: font.caption,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: vs(8),
  },
  body: { flexGrow: 1, padding: spacing.md, gap: vs(12) },
  scoreCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  scoreLine: { fontSize: font.headline, fontWeight: '900' },
  eloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: vs(16),
    paddingTop: vs(14),
    borderTopWidth: 1,
  },
  eloLbl: { fontSize: font.caption, fontWeight: '600' },
  eloVal: { fontSize: font.title, fontWeight: '900' },
  room: { fontSize: font.micro, marginTop: vs(12) },
});

export default BattleResultsScreen;
