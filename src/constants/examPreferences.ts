import AsyncStorage from '@react-native-async-storage/async-storage';

export type ExamPreferenceId = 'dropper_jee' | 'dropper_neet' | 'class12_jee' | 'class12_neet';

export type ExamPreference = {
  id: ExamPreferenceId;
  label: string;
  subtitle: string;
  examFilter: 'JEE' | 'NEET' | 'ALL';
};

export const EXAM_PREFERENCES: ExamPreference[] = [
  { id: 'dropper_jee', label: 'Dropper - IIT JEE', subtitle: 'JEE Main & Advanced batches', examFilter: 'JEE' },
  { id: 'dropper_neet', label: 'Dropper - NEET', subtitle: 'Medical entrance batches', examFilter: 'NEET' },
  { id: 'class12_jee', label: 'Class 12 - JEE', subtitle: 'Board + JEE preparation', examFilter: 'JEE' },
  { id: 'class12_neet', label: 'Class 12 - NEET', subtitle: 'Board + NEET preparation', examFilter: 'NEET' },
];

export const DEFAULT_PREFERENCE_ID: ExamPreferenceId = 'dropper_jee';

export const GOAL_PREF_STORAGE_KEY = 'eddva_goal_preference';

export function getPreferenceById(id: ExamPreferenceId): ExamPreference {
  return EXAM_PREFERENCES.find(p => p.id === id) ?? EXAM_PREFERENCES[0];
}

/** Map onboarding wizard picks → catalog goal preference */
export function preferenceIdFromWizard(exam: string, studentClass: string): ExamPreferenceId {
  const isNeet = exam.toLowerCase().includes('neet');
  const isDropper = studentClass.toLowerCase().includes('dropper');
  if (isNeet) return isDropper ? 'dropper_neet' : 'class12_neet';
  return isDropper ? 'dropper_jee' : 'class12_jee';
}

export async function saveGoalPreference(id: ExamPreferenceId): Promise<void> {
  await AsyncStorage.setItem(GOAL_PREF_STORAGE_KEY, id);
}

/** Map onboarding wizard labels → POST /auth/onboard body */
export function wizardToOnboardPayload(
  exam: string,
  studentClass: string,
  year: string,
  hoursLabel: string,
  extras?: {
    scoreTarget?: string;
    schoolHours?: string;
    weakSubjects?: string[];
  },
) {
  const examLower = exam.toLowerCase();
  const examTarget = examLower.includes('neet')
    ? 'neet'
    : examLower.includes('foundation') || examLower.includes('cbse')
      ? 'foundation'
      : 'jee';
  const classLevel = studentClass.toLowerCase().includes('dropper')
    ? 'repeater'
    : studentClass.match(/\d+/)?.[0] ?? '12';
  const dailyStudyHours = Math.min(
    16,
    Math.max(1, parseInt(hoursLabel, 10) || 4),
  );
  return {
    examTarget,
    class: classLevel,
    examYear: year.trim(),
    dailyStudyHours,
    scoreTarget: extras?.scoreTarget,
    schoolHours: extras?.schoolHours ? parseInt(extras.schoolHours, 10) || undefined : undefined,
    weakSubjects: extras?.weakSubjects,
    language: 'en' as const,
  };
}
