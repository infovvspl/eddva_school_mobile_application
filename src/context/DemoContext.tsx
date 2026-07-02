import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_MOCK } from '../config/appConfig';
import { studentService } from '../services/student.service';
import { asArray } from '../utils/apiData';
import { normalizeBatchList } from '../utils/courseMappers';
import {
  DEMO_PRESET_STORAGE_KEY,
  DemoPreset,
  enrollBatch,
  getDemoPreset,
  getDemoVersion,
  hasAnyEnrollment,
  setDemoPreset,
  subscribeDemo,
} from '../mocks/mockStore';

type DemoContextType = {
  version: number;
  preset: DemoPreset;
  hasCourses: boolean;
  setPreset: (preset: DemoPreset) => void;
  enroll: (batchId: string) => void;
  refreshEnrollment: () => Promise<void>;
};

const DemoContext = createContext<DemoContextType | null>(null);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [version, setVersion] = useState(getDemoVersion);
  const [preset, setPresetState] = useState<DemoPreset>(getDemoPreset);
  const [hasCourses, setHasCourses] = useState(() => (USE_MOCK ? hasAnyEnrollment() : false));

  const refreshEnrollment = useCallback(async () => {
    if (USE_MOCK) {
      setHasCourses(hasAnyEnrollment());
      setVersion(getDemoVersion());
      return;
    }
    try {
      const { data } = await studentService.getMyCourses();
      setHasCourses(normalizeBatchList(data).length > 0);
      setVersion(v => v + 1);
    } catch {
      /* keep previous state */
    }
  }, []);

  useEffect(() => {
    if (USE_MOCK) {
      return subscribeDemo(() => {
        setVersion(getDemoVersion());
        setPresetState(getDemoPreset());
        setHasCourses(hasAnyEnrollment());
      });
    }
    refreshEnrollment();
  }, [refreshEnrollment]);

  const setPreset = useCallback((p: DemoPreset) => {
    if (!USE_MOCK) return;
    setDemoPreset(p);
    AsyncStorage.setItem(DEMO_PRESET_STORAGE_KEY, p).catch(() => {});
  }, []);

  const enroll = useCallback(
    (batchId: string) => {
      if (USE_MOCK) {
        enrollBatch(batchId);
        return;
      }
      refreshEnrollment();
    },
    [refreshEnrollment],
  );

  return (
    <DemoContext.Provider
      value={{ version, preset, hasCourses, setPreset, enroll, refreshEnrollment }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
};
