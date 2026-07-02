import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PrimaryButton from '../../components/PrimaryButton';
import RichText from '../../components/learning/RichText';
import { OnboardingStackParamList } from '../../types/navigation';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DiagnosticTest'>;

const QUESTIONS = [
  {
    q: 'A particle moves with velocity $v = 3t^2$. Find displacement at $t = 2\\,\\text{s}$.',
    options: ['4 m', '8 m', '12 m', '16 m'],
    answer: 1,
  },
  {
    q: 'Which functional group is present in ethanol?',
    options: ['Ketone', 'Aldehyde', 'Alcohol', 'Ester'],
    answer: 2,
  },
  {
    q: 'Value of $\\int_0^1 x^2\\,dx$ is:',
    options: ['$\\frac{1}{2}$', '$\\frac{1}{3}$', '$\\frac{1}{4}$', '$\\frac{2}{3}$'],
    answer: 1,
  },
];

const DiagnosticTestScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [seconds, setSeconds] = useState(60 * 60);

  useEffect(() => {
    const iv = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const q = QUESTIONS[idx];
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const submit = () => {
    const nextCorrect = correct + (selected === q.answer ? 1 : 0);
    if (idx < QUESTIONS.length - 1) {
      setCorrect(nextCorrect);
      setIdx(i => i + 1);
      setSelected(null);
      return;
    }
    const score = Math.round(((nextCorrect) / QUESTIONS.length) * 100);
    const fidelity = Math.min(98, score + 12);
    const tier = fidelity >= 80 ? 'Bronze' : fidelity >= 60 ? 'Iron' : 'Iron';
    navigation.replace('DiagnosticResult', { score, fidelity, tier });
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top }]}>
      <View style={styles.timerBar}>
        <Text style={styles.timer}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </Text>
        <Text style={styles.progress}>
          Q {idx + 1}/{QUESTIONS.length}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${((idx + 1) / QUESTIONS.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <RichText textStyle={styles.q}>{q.q}</RichText>
        {q.options.map((opt, i) => (
          <TouchableOpacity
            key={opt}
            style={[styles.opt, selected === i && styles.optOn]}
            onPress={() => setSelected(i)}
            activeOpacity={0.88}
          >
            <RichText textStyle={[styles.optText, selected === i && styles.optTextOn]}>{opt}</RichText>
          </TouchableOpacity>
        ))}
        <PrimaryButton label="Submit Answer" onPress={submit} style={{ marginTop: vs(20) }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0F0A1A' },
  timerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(12),
  },
  timer: { fontSize: font.subhead, fontWeight: '800', color: '#F59E0B' },
  progress: { fontSize: font.caption, color: '#94A3B8', fontWeight: '700' },
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: spacing.lg },
  fill: { height: 4, backgroundColor: '#0066cc' },
  body: { padding: spacing.lg, paddingBottom: vs(40) },
  q: { fontSize: font.subhead, fontWeight: '800', color: '#F8FAFC', lineHeight: ms(24), marginBottom: vs(20) },
  opt: {
    padding: spacing.md,
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.25)',
    marginBottom: vs(10),
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  optOn: { borderColor: '#0066cc', backgroundColor: 'rgba(0,102,204,0.2)' },
  optText: { fontSize: font.body, color: '#CBD5E1', fontWeight: '600' },
  optTextOn: { color: '#fff', fontWeight: '800' },
});

export default DiagnosticTestScreen;
