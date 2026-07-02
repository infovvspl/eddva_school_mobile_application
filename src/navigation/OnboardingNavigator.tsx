import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../types/navigation';
import OnboardingWizardScreen from '../screens/onboarding/OnboardingWizardScreen';
import PlanGeneratorSplashScreen from '../screens/onboarding/PlanGeneratorSplashScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

type Props = { initialRouteName?: keyof OnboardingStackParamList };

const OnboardingNavigator: React.FC<Props> = ({
  initialRouteName = 'OnboardingWizard',
}) => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
    <Stack.Screen name="OnboardingWizard" component={OnboardingWizardScreen} />
    <Stack.Screen name="PlanGeneratorSplash" component={PlanGeneratorSplashScreen} />
  </Stack.Navigator>
);

export default OnboardingNavigator;
