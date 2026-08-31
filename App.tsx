import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Home, BookOpen, MessageSquare, Gamepad2, Briefcase, Bot } from 'lucide-react-native';

import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TimetableScreen } from './src/screens/TimetableScreen';
import { AssignmentsScreen } from './src/screens/AssignmentsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { LiveClassesScreen } from './src/screens/LiveClassesScreen';
import { StudyMaterialsScreen } from './src/screens/StudyMaterialsScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { AssessmentsScreen } from './src/screens/AssessmentsScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { StudyPlanScreen } from './src/screens/StudyPlanScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { PYQScreen } from './src/screens/PYQScreen';
import { CareersScreen } from './src/screens/CareersScreen';
import { CareerQuizScreen } from './src/screens/CareerQuizScreen';
import { GamificationScreen } from './src/screens/GamificationScreen';
import { RecordedClassesScreen } from './src/screens/RecordedClassesScreen';
import { DoubtScreen } from './src/screens/DoubtScreen';
import { AskDoubtScreen } from './src/screens/AskDoubtScreen';
import { AiStudyScreen } from './src/screens/AiStudyScreen';
import { AiQuizScreen } from './src/screens/AiQuizScreen';
import { LiveClassRoomScreen } from './src/screens/LiveClassRoomScreen';
import { PdfViewerScreen } from './src/screens/PdfViewerScreen';
import { ExamScreen } from './src/screens/ExamScreen';

// Teacher Screens
import { TeacherDashboardScreen } from './src/screens/TeacherDashboardScreen';
import { TeacherAssignmentsScreen } from './src/screens/TeacherAssignmentsScreen';
import { TeacherAssessmentsScreen } from './src/screens/TeacherAssessmentsScreen';
import { TeacherRecordingsScreen } from './src/screens/TeacherRecordingsScreen';
import { TeacherClassesScreen } from './src/screens/TeacherClassesScreen';
import { TeacherAttendanceScreen } from './src/screens/TeacherAttendanceScreen';
import { TeacherDoubtsScreen } from './src/screens/TeacherDoubtsScreen';
import { TeacherMaterialsScreen } from './src/screens/TeacherMaterialsScreen';
import { TeacherLiveHostScreen } from './src/screens/TeacherLiveHostScreen';
import { TeacherTimetableScreen } from './src/screens/TeacherTimetableScreen';



type Screen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'dashboard'
  | 'timetable'
  | 'assignments'
  | 'profile'
  | 'menu'
  | 'liveClasses'
  | 'studyMaterials'
  | 'attendance'
  | 'calendar'
  | 'assessments'
  | 'discover'
  | 'notifications'
  | 'studyPlan'
  | 'analytics'
  | 'pyq'
  | 'careers'
  | 'gamification'
  | 'doubt'
  | 'askDoubt'
  | 'recordedClasses'
  | 'aiStudy'
  | 'aiQuiz'
  | 'liveClassRoom'
  | 'pdfViewer'
  | 'careerQuiz'
  | 'exam'
  | 'teacherDashboard'
  | 'teacherAssignments'
  | 'teacherAssessments'
  | 'teacherRecordings'
  | 'teacherClasses'
  | 'teacherAttendance'
  | 'teacherDoubts'
  | 'teacherMaterials'
  | 'teacherLiveHost'
  | 'teacherTimetable';

function MainApp() {
  const [screen, setScreen] = useState<Screen>('splash');
  const { theme } = useAppTheme();

  const paperTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: theme.primary,
      background: theme.background,
      surface: theme.surface,
      text: theme.text,
    },
  };

  const renderScreen = () => {
    switch (screen) {
      case 'splash':
        return <SplashScreen onFinish={() => setScreen('onboarding')} />;
      case 'onboarding':
        return <OnboardingScreen onContinue={() => setScreen('login')} />;
      case 'login':
        return <LoginScreen onLogin={(role: string) => setScreen(role === 'teacher' ? 'teacherDashboard' : 'dashboard')} />;
      case 'dashboard':
        return <DashboardScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'menu':
        return <MenuScreen onNavigate={(tab: any) => setScreen(tab)} onClose={() => setScreen('dashboard')} />;
      case 'liveClasses':
        return <LiveClassesScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'studyMaterials':
        return <StudyMaterialsScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'attendance':
        return <AttendanceScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'calendar':
        return <CalendarScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'doubt':
        return <DoubtScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'askDoubt':
        return <AskDoubtScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'assessments':
        return <AssessmentsScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'discover':
        return <DiscoverScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'timetable':
        return <TimetableScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'assignments':
        return <AssignmentsScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'profile':
        return <ProfileScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'notifications':
        return <NotificationsScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'studyPlan':
        return <StudyPlanScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'analytics':
        return <AnalyticsScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'pyq':
        return <PYQScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'careers':
        return <CareersScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'recordedClasses':
        return <RecordedClassesScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'gamification':
        return <GamificationScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'aiStudy':
        return <AiStudyScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'aiQuiz':
        return <AiQuizScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'careerQuiz':
        return <CareerQuizScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'exam':
        return <ExamScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'pdfViewer':
        return <PdfViewerScreen url="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" onBack={() => setScreen('dashboard')} />;
      case 'liveClassRoom':
        return <LiveClassRoomScreen onNavigate={(tab: any) => setScreen(tab)} routeParams={{ id: 'c69f9e30-23fa-6125-df14-1ae7e90d614e' }} />;
      case 'teacherDashboard':
        return <TeacherDashboardScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'teacherAssignments':
        return <TeacherAssignmentsScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'teacherAssessments':
        return <TeacherAssessmentsScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'teacherRecordings':
        return <TeacherRecordingsScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'teacherClasses':
        return <TeacherClassesScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'teacherAttendance':
        return <TeacherAttendanceScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'teacherDoubts':
        return <TeacherDoubtsScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'teacherMaterials':
        return <TeacherMaterialsScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'teacherLiveHost':
        return <TeacherLiveHostScreen onNavigate={(tab: any) => setScreen(tab)} />;
      case 'teacherTimetable':
        return <TeacherTimetableScreen onNavigate={(tab: any) => setScreen(tab)} />;
      default:
        return null;
    }
  };

  const showBottomNav = !['splash', 'onboarding', 'login', 'menu', 'liveClassRoom', 'teacherLiveHost'].includes(screen);
  
  // Conditionally render bottom nav tabs based on role
  const isTeacher = screen.startsWith('teacher');

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        {/* Android 16 (targetSdk 36) enforces edge-to-edge: the system bars always
            draw over the app window, so the root has to inset itself. */}
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
          <View style={{ flex: 1 }}>{renderScreen()}</View>
          {showBottomNav && (
            <View style={[styles.bottomNav, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
              {isTeacher ? (
                <>
                  <TouchableOpacity style={styles.navItem} onPress={() => setScreen('teacherDashboard')}>
                    <Home size={24} color={screen === 'teacherDashboard' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'teacherDashboard' && { color: theme.primary, fontWeight: '700' }]}>Home</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => setScreen('teacherClasses')}>
                    <BookOpen size={24} color={screen === 'teacherClasses' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'teacherClasses' && { color: theme.primary, fontWeight: '700' }]}>Classes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => setScreen('teacherAssignments')}>
                    <MessageSquare size={24} color={screen === 'teacherAssignments' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'teacherAssignments' && { color: theme.primary, fontWeight: '700' }]}>Assignments</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => setScreen('teacherAssessments')}>
                    <Briefcase size={24} color={screen === 'teacherAssessments' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'teacherAssessments' && { color: theme.primary, fontWeight: '700' }]}>Assessments</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.navItem} onPress={() => setScreen('dashboard')}>
                    <Home size={24} color={screen === 'dashboard' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'dashboard' && { color: theme.primary, fontWeight: '700' }]}>Home</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => setScreen('menu')}>
                    <BookOpen size={24} color={screen === 'menu' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'menu' && { color: theme.primary, fontWeight: '700' }]}>Menu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => setScreen('doubt')}>
                    <Bot size={24} color={screen === 'doubt' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'doubt' && { color: theme.primary, fontWeight: '700' }]}>AI Tutor</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => setScreen('gamification')}>
                    <Gamepad2 size={24} color={screen === 'gamification' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'gamification' && { color: theme.primary, fontWeight: '700' }]}>Games</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => setScreen('careers')}>
                    <Briefcase size={24} color={screen === 'careers' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'careers' && { color: theme.primary, fontWeight: '700' }]}>Career</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    // Home indicator / gesture bar spacing comes from the root SafeAreaView inset.
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    color: '#64748B',
    fontFamily: 'Poppins-Medium',
  },
  tabLabelActive: {
    color: '#2563EB',
    fontFamily: 'Poppins-Medium',
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: '#6B7280',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    backgroundColor: '#2563EB',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
});