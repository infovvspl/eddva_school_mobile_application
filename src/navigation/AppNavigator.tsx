import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navigationRef';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../types/navigation';
export type { RootStackParamList, MainTabParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';
import EDDVATabBar from '../components/EDDVATabBar';

import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';

const OnboardingGate = () => (
  <OnboardingNavigator initialRouteName="OnboardingWizard" />
);
import BattleNavigator from './BattleNavigator';

import DashboardScreen from '../screens/DashboardScreen';
import MyCoursesScreen from '../screens/MyCoursesScreen';
import StudyPlanScreen from '../screens/StudyPlanScreen';
import StudyPlanBacklogDetailScreen from '../screens/StudyPlanBacklogDetailScreen';
import StudyPlanInsightsScreen from '../screens/StudyPlanInsightsScreen';
import StudyPlanManageScreen from '../screens/StudyPlanManageScreen';
import StudyPlanWeakDetailScreen from '../screens/StudyPlanWeakDetailScreen';
import DoubtsScreen from '../screens/DoubtsScreen';
import CoursesScreen from '../screens/CoursesScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import LeaderboardInfoScreen from '../screens/leaderboard/LeaderboardInfoScreen';
import ProgressScreen from '../screens/ProgressScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import CourseCurriculumScreen from '../screens/CourseCurriculumScreen';
import TopicDetailScreen from '../screens/TopicDetailScreen';
import BatchListingScreen from '../screens/BatchListingScreen';
import TestSeriesScreen from '../screens/TestSeriesScreen';
import LiveClassScreen from '../screens/LiveClassScreen';
import CalendarScreen from '../screens/CalendarScreen';
import SavedTabScreen from '../screens/SavedTabScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AccountHubScreen from '../screens/AccountHubScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AIStudyRoomScreen from '../screens/learning/AIStudyRoomScreen';
import ExamEngineScreen from '../screens/learning/ExamEngineScreen';
import StudySheetScreen from '../screens/learning/StudySheetScreen';
import AeroRoadmapScreen from '../screens/learning/AeroRoadmapScreen';
import PracticePYQScreen from '../screens/learning/PracticePYQScreen';
import StudyMaterialsScreen from '../screens/StudyMaterialsScreen';
import JoinBatchScreen from '../screens/JoinBatchScreen';
import DoubtDetailScreen from '../screens/DoubtDetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import AppServicesBootstrap from '../components/AppServicesBootstrap';
import EddvaAnimatedSplash from '../components/EddvaAnimatedSplash';
import IntensiveRevisionScreen from '../screens/IntensiveRevisionScreen';
import RevisionNotesScreen from '../screens/RevisionNotesScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    tabBar={props => <EDDVATabBar {...props} />}
    screenOptions={{ headerShown: false, lazy: true }}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Learn" component={MyCoursesScreen} />
    <Tab.Screen name="StudyPlan" component={StudyPlanScreen} />
    <Tab.Screen name="Battle" component={BattleNavigator} />
    <Tab.Screen name="Help" component={DoubtsScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const {
    onboardingDone,
    loading: obLoading,
    syncFromStudentProfile,
  } = useOnboarding();
  const { theme } = useTheme();
  const [launchSplashDone, setLaunchSplashDone] = useState(false);
  const [startupTimedOut, setStartupTimedOut] = useState(false);
  const finishLaunchSplash = useCallback(() => setLaunchSplashDone(true), []);

  useEffect(() => {
    if (isAuthenticated && user && !onboardingDone) {
      syncFromStudentProfile(user);
    }
  }, [isAuthenticated, user, onboardingDone, syncFromStudentProfile]);

  useEffect(() => {
    const timer = setTimeout(() => setStartupTimedOut(true), 9000);
    return () => clearTimeout(timer);
  }, []);

  const appReady = startupTimedOut || (!isLoading && !obLoading);

  if (!launchSplashDone || !appReady) {
    return (
      <EddvaAnimatedSplash onFinish={finishLaunchSplash} canFinish={appReady} />
    );
  }

  const needsOnboarding = isAuthenticated && !onboardingDone;

  return (
    <NavigationContainer ref={navigationRef}>
      <AppServicesBootstrap />
      <StatusBar
        barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : needsOnboarding ? (
          <RootStack.Screen name="Onboarding" component={OnboardingGate} />
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainTabs} />
            <RootStack.Screen name="MyCourses" component={MyCoursesScreen} />
            <RootStack.Screen name="Courses" component={CoursesScreen} />
            <RootStack.Screen
              name="CourseDetail"
              component={CourseDetailScreen}
            />
            <RootStack.Screen
              name="CourseCurriculum"
              component={CourseCurriculumScreen}
            />
            <RootStack.Screen
              name="TopicDetail"
              component={TopicDetailScreen}
            />
            <RootStack.Screen
              name="Leaderboard"
              component={LeaderboardScreen}
            />
            <RootStack.Screen
              name="LeaderboardInfo"
              component={LeaderboardInfoScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <RootStack.Screen name="Progress" component={ProgressScreen} />
            <RootStack.Screen
              name="BatchListing"
              component={BatchListingScreen}
            />
            <RootStack.Screen name="TestSeries" component={TestSeriesScreen} />
            <RootStack.Screen
              name="LiveClass"
              component={LiveClassScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <RootStack.Screen
              name="AIStudyRoom"
              component={AIStudyRoomScreen}
            />
            <RootStack.Screen name="ExamEngine" component={ExamEngineScreen} />
            <RootStack.Screen
              name="StudySheet"
              component={StudySheetScreen}
              options={{
                animation: 'fade',
                presentation: 'transparentModal',
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
              }}
            />
            <RootStack.Screen
              name="AeroRoadmap"
              component={AeroRoadmapScreen}
            />
            <RootStack.Screen
              name="PracticePYQ"
              component={PracticePYQScreen}
            />
            <RootStack.Screen
              name="StudyPlanBacklogDetail"
              component={StudyPlanBacklogDetailScreen}
            />
            <RootStack.Screen
              name="StudyPlanInsights"
              component={StudyPlanInsightsScreen}
            />
            <RootStack.Screen
              name="StudyPlanManage"
              component={StudyPlanManageScreen}
            />
            <RootStack.Screen
              name="StudyPlanWeakDetail"
              component={StudyPlanWeakDetailScreen}
            />
            <RootStack.Screen name="Calendar" component={CalendarScreen} />
            <RootStack.Screen name="Saved" component={SavedTabScreen} />
            <RootStack.Screen name="Profile" component={ProfileScreen} />
            <RootStack.Screen name="AccountHub" component={AccountHubScreen} />
            <RootStack.Screen
              name="Notifications"
              component={NotificationsScreen}
            />
            <RootStack.Screen
              name="StudyMaterials"
              component={StudyMaterialsScreen}
            />
            <RootStack.Screen name="JoinBatch" component={JoinBatchScreen} />
            <RootStack.Screen
              name="DoubtDetail"
              component={DoubtDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <RootStack.Screen name="Checkout" component={CheckoutScreen} />
            <RootStack.Screen
              name="IntensiveRevision"
              component={IntensiveRevisionScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <RootStack.Screen
              name="RevisionNotes"
              component={RevisionNotesScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
