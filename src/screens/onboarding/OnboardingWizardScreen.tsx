import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from '../../components/Icon';
import SwipeAuthButton from '../../components/SwipeAuthButton';
import { preferenceIdFromWizard, saveGoalPreference } from '../../constants/examPreferences';
import { OnboardingStackParamList } from '../../types/navigation';
import { Colors } from '../../constants/theme';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingWizard'>;

const EXAMS = ['JEE Main', 'JEE Advanced', 'NEET', 'Foundation'];
const CLASSES = ['Class 11', 'Class 12', 'Dropper'];
const YEARS = ['2025', '2026', '2027'];
const HOURS = ['2 hrs/day', '4 hrs/day', '6 hrs/day', '8+ hrs/day'];
const SCORE_TARGETS: Record<string, string[]> = {
  'JEE Main': ['Above 250', '200–250', '150–200', 'Below 150'],
  'JEE Advanced': ['AIR < 500', 'AIR 500–2000', 'AIR 2000–5000', 'AIR > 5000'],
  NEET: ['Above 680', '600–680', '500–600', 'Below 500'],
  Foundation: ['Top 10%', 'Top 25%', 'Top 50%', 'Just passing'],
};
const DEFAULT_SCORE_TARGETS = ['Top performer', 'Above average', 'Average', 'Just exploring'];
const SCHOOL_HOURS = ['No school/coaching', '2–4 hrs/day', '4–6 hrs/day', '6+ hrs/day'];

const OPTION_ICONS: Record<string, string> = {
  'JEE Main': 'atom',
  'JEE Advanced': 'rocket',
  NEET: 'flask',
  Foundation: 'book-reader',
  'Class 11': 'book-open',
  'Class 12': 'graduation-cap',
  Dropper: 'redo',
  '2025': 'calendar-alt',
  '2026': 'calendar-check',
  '2027': 'calendar-plus',
  '2 hrs/day': 'clock',
  '4 hrs/day': 'hourglass-half',
  '6 hrs/day': 'tasks',
  '8+ hrs/day': 'bolt',
  'No school/coaching': 'home',
  '2–4 hrs/day': 'hourglass-start',
  '4–6 hrs/day': 'school',
  '6+ hrs/day': 'calendar-check',
  'Above 250': 'star',
  '200–250': 'thumbs-up',
  '150–200': 'check',
  'Below 150': 'flag',
  'AIR < 500': 'trophy',
  'AIR 500–2000': 'medal',
  'AIR 2000–5000': 'award',
  'AIR > 5000': 'flag',
  'Above 680': 'trophy',
  '600–680': 'thumbs-up',
  '500–600': 'check',
  'Below 500': 'flag',
  'Top 10%': 'trophy',
  'Top 25%': 'medal',
  'Top 50%': 'check',
  'Just passing': 'flag',
  'Top performer': 'trophy',
  'Above average': 'thumbs-up',
  Average: 'check',
  'Just exploring': 'flag',
};

const TOTAL_STEPS = 6;

const OnboardingWizardScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [exam, setExam] = useState('');
  const [cls, setCls] = useState('');
  const [year, setYear] = useState('');
  const [hours, setHours] = useState('');
  const [scoreTarget, setScoreTarget] = useState('');
  const [schoolHours, setSchoolHours] = useState('');
  const [busy, setBusy] = useState(false);

  const steps = [
    { label: 'Target exam', chips: EXAMS, value: exam, onSelect: (v: string) => { setExam(v); setScoreTarget(''); } },
    { label: 'Your class', chips: CLASSES, value: cls, onSelect: (v: string) => setCls(v) },
    { label: 'Target year', chips: YEARS, value: year, onSelect: (v: string) => setYear(v) },
    { label: 'Daily study hours', chips: HOURS, value: hours, onSelect: (v: string) => setHours(v) },
    {
      label: 'Score / rank target',
      chips: SCORE_TARGETS[exam] ?? DEFAULT_SCORE_TARGETS,
      value: scoreTarget,
      onSelect: (v: string) => setScoreTarget(v),
    },
    { label: 'School / coaching hours', chips: SCHOOL_HOURS, value: schoolHours, onSelect: (v: string) => setSchoolHours(v) },
  ];

  const currentStep = steps[step];
  const chips = currentStep.chips;
  const selected = currentStep.value;
  const isLast = step === TOTAL_STEPS - 1;
  const canProceed = !!selected;

  const getIconForChip = (item: string) =>
    OPTION_ICONS[item] || 'book';

  const next = async () => {
    if (!canProceed || busy) return;
    if (step < TOTAL_STEPS - 1) {
      setStep(s => s + 1);
      return;
    }
    setBusy(true);
    try {
      await saveGoalPreference(preferenceIdFromWizard(exam, cls));
      navigation.navigate('PlanGeneratorSplash', {
        exam,
        studentClass: cls,
        year,
        hours,
        scoreTarget,
        schoolHours,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.inner,
          {
            paddingTop: insets.top + vs(16),
            paddingBottom: insets.bottom + vs(24),
          },
        ]}
      >
        <Text style={styles.progress}>Step {step + 1} of {TOTAL_STEPS}</Text>
        <View style={styles.barTrack}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[styles.barSegment, i <= step && styles.barSegmentActive]} />
          ))}
        </View>
        <Text style={styles.kicker}>Personalize your plan</Text>
        <Text style={styles.title}>{currentStep.label}</Text>
        <Text style={styles.sub}>Build your EDDVA learning roadmap around your actual goal.</Text>

        <ScrollView
          contentContainerStyle={styles.chips}
          showsVerticalScrollIndicator={false}
        >
          {chips.map(item => {
            const active = selected === item;
            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => currentStep.onSelect(item)}
                activeOpacity={0.88}
              >
                <View style={[styles.chipIcon, active && styles.chipIconActive]}>
                  <Icon
                    name={getIconForChip(item)}
                    size={ms(18)}
                    color={active ? Colors.white : Colors.primary}
                    solid
                  />
                </View>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <SwipeAuthButton
          label={isLast ? 'Finish Setup' : 'Continue'}
          icon={isLast ? 'check' : 'arrow-right'}
          onComplete={next}
          loading={busy}
          disabled={!canProceed}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, paddingHorizontal: spacing.lg },
  progress: { fontSize: font.caption, color: Colors.textMuted, fontWeight: '700' },
  barTrack: {
    flexDirection: 'row',
    gap: hs(4),
    marginTop: vs(8),
    marginBottom: vs(24),
  },
  barSegment: {
    flex: 1,
    height: vs(4),
    borderRadius: ms(4),
    backgroundColor: Colors.borderLight,
  },
  barSegmentActive: { backgroundColor: Colors.primary },
  kicker: {
    fontSize: font.micro,
    color: Colors.primary,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: vs(8),
  },
  title: { fontSize: font.title + 2, fontWeight: '900', color: Colors.text, marginBottom: vs(6) },
  sub: { fontSize: font.caption, color: Colors.textMuted, marginBottom: vs(20) },
  chips: { flexGrow: 1, gap: vs(10), paddingBottom: vs(24) },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    paddingVertical: vs(14),
    paddingHorizontal: hs(14),
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}18` },
  chipIcon: {
    width: hs(38),
    height: hs(38),
    borderRadius: ms(12),
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipIconActive: { backgroundColor: Colors.primary },
  chipText: { flex: 1, fontSize: font.body, color: Colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: Colors.primary, fontWeight: '800' },
  radio: {
    width: hs(20),
    height: hs(20),
    borderRadius: hs(10),
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: {
    width: hs(10),
    height: hs(10),
    borderRadius: hs(5),
    backgroundColor: Colors.primary,
  },
});

export default OnboardingWizardScreen;
