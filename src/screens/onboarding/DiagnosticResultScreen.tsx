import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import PrimaryButton from '../../components/PrimaryButton';
import { useOnboarding } from '../../context/OnboardingContext';
import { OnboardingStackParamList } from '../../types/navigation';
import { font, ms, spacing, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DiagnosticResult'>;

const DiagnosticResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { completeDiagnostic } = useOnboarding();
  const { score, fidelity, tier } = route.params;

  const continueFlow = async () => {
    await completeDiagnostic();
    navigation.replace('PlanGeneratorSplash');
  };

  return (
    <LinearGradient colors={['#0F0A1A', '#312E81']} style={styles.wrap}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + vs(24), paddingBottom: insets.bottom + vs(28) },
        ]}
      >
        <Text style={styles.label}>Neural Fidelity Score</Text>
        <View style={styles.ring}>
          <Text style={styles.score}>{fidelity}%</Text>
        </View>
        <Text style={styles.tier}>Starting ELO Tier: {tier}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cognitive Drift Analysis</Text>
          <Row label="Conceptual gaps" value={`${100 - score}%`} />
          <Row label="Silly mistakes" value="12%" />
          <Row label="Time pressure" value="8%" />
        </View>

        <PrimaryButton label="Generate 30-Day Plan" onPress={continueFlow} />
      </ScrollView>
    </LinearGradient>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={rowStyles.row}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text style={rowStyles.value}>{value}</Text>
  </View>
);

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: vs(8) },
  label: { fontSize: font.caption, color: '#94A3B8' },
  value: { fontSize: font.caption, color: '#E2E8F0', fontWeight: '800' },
});

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  label: { fontSize: font.caption, color: '#38bdf8', fontWeight: '700', marginBottom: vs(12) },
  ring: {
    width: ms(160),
    height: ms(160),
    borderRadius: ms(80),
    borderWidth: 8,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(16),
  },
  score: { fontSize: font.headline + 4, fontWeight: '900', color: '#fff' },
  tier: { fontSize: font.subhead, fontWeight: '800', color: '#F59E0B', marginBottom: vs(24) },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: ms(18),
    padding: spacing.lg,
    marginBottom: vs(28),
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
  },
  cardTitle: { fontSize: font.subhead, fontWeight: '800', color: '#fff', marginBottom: vs(8) },
});

export default DiagnosticResultScreen;
