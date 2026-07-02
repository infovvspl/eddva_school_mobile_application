import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';
import { APP_BUILD_LABEL } from '../config/appConfig';
import { INTRO_BUILD_STORAGE_KEY, INTRO_SEEN_STORAGE_KEY } from '../constants/introOnboarding';
import IntroOnboardingScreen from '../screens/onboarding/IntroOnboardingScreen';
import SplashScreen from '../screens/onboarding/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OtpLoginScreen from '../screens/OtpLoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const lastBuild = await AsyncStorage.getItem(INTRO_BUILD_STORAGE_KEY);
      if (lastBuild !== APP_BUILD_LABEL) {
        await AsyncStorage.multiRemove([INTRO_SEEN_STORAGE_KEY]);
        await AsyncStorage.setItem(INTRO_BUILD_STORAGE_KEY, APP_BUILD_LABEL);
        setIntroSeen(false);
        return;
      }
      const value = await AsyncStorage.getItem(INTRO_SEEN_STORAGE_KEY);
      setIntroSeen(value === 'true');
    })();
  }, []);

  if (introSeen === null) {
    return <View style={styles.loading} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'fade' }}
      initialRouteName={introSeen ? 'Login' : 'Intro'}
    >
      <Stack.Screen name="Intro" component={IntroOnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#F8FBFF' },
});

export default AuthNavigator;
