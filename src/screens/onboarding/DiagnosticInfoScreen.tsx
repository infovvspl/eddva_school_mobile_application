import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../components/Icon';
import PrimaryButton from '../../components/PrimaryButton';
import EDDVAScreenHeader from '../../components/EDDVAScreenHeader';
import { OnboardingStackParamList } from '../../types/navigation';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DiagnosticInfo'>;

const POINTS = [
  { icon: 'clock', text: '60-minute timed baseline assessment' },
  { icon: 'list-ol', text: 'MCQ, MSQ & numerical integer questions' },
  { icon: 'brain', text: 'Measures conceptual gaps & cognitive drift' },
  { icon: 'route', text: 'Unlocks your 30-day Aero Synthesis plan' },
];

const DiagnosticInfoScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={['#0F0A1A', '#1E1630', '#312E81']} style={styles.wrap}>
      <View style={{ paddingTop: insets.top }}>
        <EDDVAScreenHeader
          title="Baseline Diagnostic"
          subtitle="Required once before your roadmap"
          onBack={() => navigation.goBack()}
        />
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Icon name="microscope" size={ms(40)} color="#00a6ff" solid />
          <Text style={styles.heroTitle}>Neural Fidelity Scan</Text>
          <Text style={styles.heroSub}>
            A one-time diagnostic that calibrates your ELO tier and personalized study plan.
          </Text>
        </View>
        {POINTS.map(p => (
          <View key={p.text} style={styles.point}>
            <View style={styles.pointIcon}>
              <Icon name={p.icon} size={ms(14)} color="#10B981" solid />
            </View>
            <Text style={styles.pointText}>{p.text}</Text>
          </View>
        ))}
        <PrimaryButton
          label="Start Baseline Scan"
          onPress={() => navigation.navigate('DiagnosticTest')}
        />
        <PrimaryButton
          label="Skip for now"
          onPress={() => navigation.navigate('PlanGeneratorSplash')}
          variant="outline"
          style={{ marginTop: vs(10) }}
        />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: vs(40) },
  hero: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: ms(20),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.2)',
    marginBottom: vs(20),
  },
  heroTitle: { fontSize: font.title, fontWeight: '900', color: '#fff', marginTop: vs(12) },
  heroSub: { fontSize: font.caption, color: '#94A3B8', textAlign: 'center', marginTop: vs(8), lineHeight: ms(18) },
  point: { flexDirection: 'row', alignItems: 'center', gap: hs(12), marginBottom: vs(14) },
  pointIcon: {
    width: hs(36),
    height: hs(36),
    borderRadius: ms(10),
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointText: { flex: 1, fontSize: font.caption, color: '#E2E8F0', fontWeight: '600', lineHeight: ms(18) },
});

export default DiagnosticInfoScreen;
