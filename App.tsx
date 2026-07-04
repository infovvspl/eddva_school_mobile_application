import React, { useState } from 'react';

import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TimetableScreen } from './src/screens/TimetableScreen';
import { AssignmentsScreen } from './src/screens/AssignmentsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const theme = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#111827',
  subtext: '#6B7280',
  primary: '#2563EB',
  primarySoft: '#DBEAFE',
  border: '#E5E7EB',
  accent: '#3B82F6',
};

type Screen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'dashboard'
  | 'timetable'
  | 'assignments'
  | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');

  switch (screen) {
    case 'splash':
      return (
        <SplashScreen
          theme={theme}
          onFinish={() => setScreen('onboarding')}
        />
      );

    case 'onboarding':
      return (
        <OnboardingScreen
          theme={theme}
          onContinue={() => setScreen('login')}
        />
      );

    case 'login':
      return (
        <LoginScreen
          theme={theme}
          onLogin={() => setScreen('dashboard')}
        />
      );

    case 'dashboard':
      return (
        <DashboardScreen
          theme={theme}
          onNavigate={(tab) => setScreen(tab)}
        />
      );

    case 'timetable':
      return <TimetableScreen theme={theme} />;

    case 'assignments':
      return <AssignmentsScreen theme={theme} />;

    case 'profile':
      return <ProfileScreen theme={theme} />;

    default:
      return null;
  }
}