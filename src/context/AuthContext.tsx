import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USE_MOCK } from '../config/appConfig';
import { authService } from '../services/auth.service';
import { studentService } from '../services/student.service';
import { normalizeStudentProfile, type StudentProfile } from '../utils/profileMappers';
import {
  DEMO_PRESET_STORAGE_KEY,
  setDemoPreset,
  type DemoPreset,
} from '../mocks/mockStore';
import { initPushNotifications, unregisterPushNotifications } from '../services/pushNotifications';
import { clearNotificationSessionSeed } from '../services/notificationInboxSync';

type User = StudentProfile;

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (tokens: { accessToken: string; refreshToken: string; user: User }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [token, storedUser] = await AsyncStorage.multiGet(['accessToken', 'user']);
        const tokenVal = token[1];
        const userVal = storedUser[1];
        if (tokenVal) {
          setAccessToken(tokenVal);
          if (USE_MOCK) {
            const savedPreset = (await AsyncStorage.getItem(DEMO_PRESET_STORAGE_KEY)) as DemoPreset | null;
            setDemoPreset(savedPreset === 'with_courses' ? 'with_courses' : 'no_courses');
            try {
              const { data } = await authService.getMe();
              const normalized = normalizeStudentProfile(data);
              setUser(normalized);
              await AsyncStorage.setItem('user', JSON.stringify(normalized));
            } catch {
              if (userVal) setUser(normalizeStudentProfile(JSON.parse(userVal)));
            }
          } else if (userVal) {
            setUser(normalizeStudentProfile(JSON.parse(userVal)));
            (async () => {
              try {
                const { data: me } = await authService.getMe();
                let normalized = normalizeStudentProfile(me);
                try {
                  const { data: profile } = await studentService.getProfile();
                  normalized = normalizeStudentProfile(profile, me);
                } catch {
                  /* auth/me only */
                }
                setUser(normalized);
                await AsyncStorage.setItem('user', JSON.stringify(normalized));
              } catch {
                /* keep cached user */
              }
            })();
          }
        } else if (USE_MOCK) {
          setDemoPreset('no_courses');
          await AsyncStorage.setItem(DEMO_PRESET_STORAGE_KEY, 'no_courses');
        }
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (tokens: {
    accessToken: string;
    refreshToken: string;
    user?: User;
  }) => {
    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new Error('Invalid login response from server');
    }
    await AsyncStorage.multiSet([
      ['accessToken', tokens.accessToken],
      ['refreshToken', tokens.refreshToken],
    ]);
    setAccessToken(tokens.accessToken);

    let normalized: StudentProfile;
    if (tokens.user) {
      normalized = normalizeStudentProfile(tokens.user);
    } else {
      const { data: me } = await authService.getMe();
      normalized = normalizeStudentProfile(me);
    }
    try {
      const { data: profile } = await studentService.getProfile();
      normalized = normalizeStudentProfile(profile, normalized);
    } catch {
      /* profile optional */
    }
    await AsyncStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
    initPushNotifications().catch(() => {});
    clearNotificationSessionSeed().catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) await authService.logout(refreshToken);
    } catch {}
    try {
      await unregisterPushNotifications();
    } catch {}
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    setAccessToken(null);
    setUser(null);
    if (USE_MOCK) {
      setDemoPreset('no_courses');
      await AsyncStorage.setItem(DEMO_PRESET_STORAGE_KEY, 'no_courses');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data: me } = await authService.getMe();
      let normalized = normalizeStudentProfile(me);
      try {
        const { data: profile } = await studentService.getProfile();
        normalized = normalizeStudentProfile(profile, me);
      } catch {
        // auth/me alone is enough when profile endpoint fails
      }
      setUser(normalized);
      await AsyncStorage.setItem('user', JSON.stringify(normalized));
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{
      user, accessToken, isLoading,
      isAuthenticated: !!accessToken,
      login, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
