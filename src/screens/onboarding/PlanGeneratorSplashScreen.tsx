import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Brand } from '../../constants/brand';
import { useOnboarding } from '../../context/OnboardingContext';
import { resetToMainWhenReady } from '../../navigation/navigationRef';
import { authService } from '../../services/auth.service';
import { studyPlanService } from '../../services/studyplan.service';
import { wizardToOnboardPayload } from '../../constants/examPreferences';
import { asArray } from '../../utils/apiData';
import { OnboardingStackParamList } from '../../types/navigation';
import { font, ms, spacing, textFamily, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PlanGeneratorSplash'>;

const PlanGeneratorSplashScreen: React.FC<Props> = ({ route }) => {
  const { completeOnboarding } = useOnboarding();
  const exam = route.params?.exam ?? 'JEE Main';
  const studentClass = route.params?.studentClass ?? 'Class 12';
  const year = route.params?.year ?? String(new Date().getFullYear());
  const hours = route.params?.hours ?? '4 hrs/day';
  const scoreTarget = route.params?.scoreTarget;
  const schoolHours = route.params?.schoolHours;
  const weakSubjects = route.params?.weakSubjects ?? [];
  const [status, setStatus] = useState('Saving your preferences…');

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      try {
        setStatus('Syncing profile…');
        await authService.onboard(wizardToOnboardPayload(exam, studentClass, year, hours));
      } catch (err: unknown) {
        const statusCode = (err as { response?: { status?: number } })?.response?.status;
        if (statusCode !== 409) {
          /* 409 = already onboarded — safe to continue */
        }
      }

      if (cancelled) return;

      try {
        setStatus('Building your study plan…');
        const { data: coursesRaw } = await studyPlanService.getCourses();
        const courses = asArray(coursesRaw, ['courses', 'batches']);
        const batchId = String(
          (courses[0] as Record<string, unknown>)?.batchId ??
            (courses[0] as Record<string, unknown>)?.id ??
            '',
        );
        if (batchId) {
          const dailyStudyHours = parseInt(hours) || 4;
          const mappedExam = exam.toLowerCase().includes('neet') ? 'neet' 
            : exam.toLowerCase().includes('foundation') ? 'foundation' 
            : exam.toLowerCase().includes('advanced') ? 'jee_advanced' : 'jee_mains';
          const mappedClass = studentClass.toLowerCase().includes('dropper') ? 'dropper' 
            : studentClass.match(/\d+/)?.[0] ?? '12';
          
          await studyPlanService.generate({
            batchId,
            targetExam: mappedExam,
            examYear: year,
            currentClass: mappedClass,
            dailyStudyHours,
          });
        }
      } catch {
        /* plan can be generated later from Study Plan tab */
      }

      if (cancelled) return;

      setStatus('Almost there…');
      await completeOnboarding();
      await new Promise<void>(resolve => setTimeout(resolve, 600));
      if (cancelled) return;
      resetToMainWhenReady();
    };

    finish();
    return () => {
      cancelled = true;
    };
  }, [completeOnboarding, exam, studentClass, year, hours]);

  return (
    <LinearGradient colors={[Brand.blue900, Brand.blue700, '#059669']} style={styles.wrap}>
      <Text style={[styles.title, textFamily.bold]}>Building your study plan</Text>
      <Text style={[styles.sub, textFamily.regular]}>{status}</Text>
      <ActivityIndicator color="#fff" size="large" style={{ marginTop: vs(28) }} />
      <View style={styles.nodes}>
        {[1, 2, 3, 4, 5].map(i => (
          <View key={i} style={[styles.node, { opacity: 0.3 + i * 0.14 }]} />
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  title: { fontSize: font.title + 2, color: '#fff', textAlign: 'center' },
  sub: {
    fontSize: font.body,
    color: 'rgba(255,255,255,0.9)',
    marginTop: vs(10),
    textAlign: 'center',
    lineHeight: ms(20),
  },
  nodes: { flexDirection: 'row', gap: 8, marginTop: vs(36) },
  node: {
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    backgroundColor: '#fff',
  },
});

export default PlanGeneratorSplashScreen;
