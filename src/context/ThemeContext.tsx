import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppTheme,
  THEME_STORAGE_KEY,
  ThemeMode,
  darkTheme,
  lightTheme,
} from '../constants/themes';

type ThemeContextType = {
  theme: AppTheme;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(lightTheme);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(saved => {
      if (saved === 'dark') setTheme(darkTheme);
      else if (saved === 'light') setTheme(lightTheme);
    });
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    const next = mode === 'dark' ? darkTheme : lightTheme;
    setTheme(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(theme.mode === 'dark' ? 'light' : 'dark');
  }, [theme.mode, setMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme.mode === 'dark',
        setMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
