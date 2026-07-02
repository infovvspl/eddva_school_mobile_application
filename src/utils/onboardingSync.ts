import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GOAL_PREF_STORAGE_KEY,
  preferenceIdFromWizard,
  saveGoalPreference,
  type ExamPreferenceId,
} from '../constants/examPreferences';
import type { StudentProfile } from './profileMappers';

export const ONBOARDING_DONE_KEY = 'eddva_onboarding_done';

/** Profile already has exam/class from register or API — skip local wizard. */
export function profileHasOnboardingData(profile: StudentProfile): boolean {
  return Boolean(profile.examTarget?.trim() && profile.className?.trim());
}

/** Mark wizard complete and mirror server profile into catalog goal preference. */
export async function persistOnboardingFromProfile(profile: StudentProfile): Promise<boolean> {
  if (!profileHasOnboardingData(profile)) return false;

  await AsyncStorage.setItem(ONBOARDING_DONE_KEY, 'true');

  const existing = await AsyncStorage.getItem(GOAL_PREF_STORAGE_KEY);
  if (!existing) {
    const id = preferenceIdFromWizard(profile.examTarget!, profile.className!);
    await saveGoalPreference(id);
  }
  return true;
}

export async function readOnboardingDoneFlag(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDING_DONE_KEY)) === 'true';
}
