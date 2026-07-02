import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { DemoProvider } from './src/context/DemoContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ensureNotificationChannel } from './src/services/notificationDisplay';

type ErrorBoundaryState = { error: Error | null };

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crash:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={errorStyles.wrap}>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <ScrollView>
            <Text style={errorStyles.msg}>{this.state.error.message}</Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  wrap: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#FEE2E2' },
  title: { fontSize: 18, fontWeight: '800', color: '#991B1B', marginBottom: 12 },
  msg: { fontSize: 13, color: '#7F1D1D' },
});

const App = () => {
  useEffect(() => {
    ensureNotificationChannel().catch(() => {});
  }, []);

  return (
  <ErrorBoundary>
    <SafeAreaProvider>
      <ThemeProvider>
        <DemoProvider>
          <OnboardingProvider>
            <AuthProvider>
              <AppNavigator />
            </AuthProvider>
          </OnboardingProvider>
        </DemoProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  </ErrorBoundary>
  );
};

export default App;
