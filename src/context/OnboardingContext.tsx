import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistOnboardingFromProfile,
  readOnboardingDoneFlag,
  ONBOARDING_DONE_KEY,
} from '../utils/onboardingSync';
import type { StudentProfile } from '../utils/profileMappers';

const KEYS = {
  tenant: 'eddva_tenant_code',
  onboarding: ONBOARDING_DONE_KEY,
  diagnostic: 'eddva_diagnostic_done',
} as const;

type OnboardingContextType = {
  tenantCode: string | null;
  onboardingDone: boolean;
  diagnosticDone: boolean;
  loading: boolean;
  setTenantCode: (code: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  completeDiagnostic: () => Promise<void>;
  syncFromStudentProfile: (profile: StudentProfile) => Promise<void>;
  resetFlow: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantCode, setTenant] = useState<string | null>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [diagnosticDone, setDiagnosticDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet([KEYS.tenant, KEYS.onboarding, KEYS.diagnostic]).then((pairs) => {
      setTenant(pairs[0][1]);
      setOnboardingDone(pairs[1][1] === 'true');
      setDiagnosticDone(pairs[2][1] === 'true');
      setLoading(false);
    });
  }, []);

  const setTenantCode = useCallback(async (code: string) => {
    await AsyncStorage.setItem(KEYS.tenant, code);
    setTenant(code);
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(KEYS.onboarding, 'true');
    setOnboardingDone(true);
  }, []);

  const completeDiagnostic = useCallback(async () => {
    await AsyncStorage.setItem(KEYS.diagnostic, 'true');
    setDiagnosticDone(true);
  }, []);

  const syncFromStudentProfile = useCallback(async (profile: StudentProfile) => {
    if (await readOnboardingDoneFlag()) {
      setOnboardingDone(true);
      return;
    }
    const done = await persistOnboardingFromProfile(profile);
    if (done) setOnboardingDone(true);
  }, []);

  const resetFlow = useCallback(async () => {
    await AsyncStorage.multiRemove([KEYS.tenant, KEYS.onboarding, KEYS.diagnostic]);
    setTenant(null);
    setOnboardingDone(false);
    setDiagnosticDone(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        tenantCode,
        onboardingDone,
        diagnosticDone,
        loading,
        setTenantCode,
        completeOnboarding,
        completeDiagnostic,
        syncFromStudentProfile,
        resetFlow,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
};
