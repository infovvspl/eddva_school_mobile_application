import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { hs, vs, ms } from './src/utils/responsive';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Home, BookOpen, FileText, Clock, Gamepad2, Briefcase, Bot, MonitorPlay } from 'lucide-react-native';

import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { restoreAuthToken, setUnauthorizedHandler } from './src/utils/api';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TimetableScreen } from './src/screens/TimetableScreen';
import { AssignmentsScreen } from './src/screens/AssignmentsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { MenuScreen } from './src/screens/MenuScreen';
import { VideosScreen } from './src/screens/VideosScreen';
import { TodayScheduleScreen } from './src/screens/TodayScheduleScreen';
import { LiveClassesScreen } from './src/screens/LiveClassesScreen';
import { StudyMaterialsScreen } from './src/screens/StudyMaterialsScreen';
import { MaterialViewerScreen } from './src/screens/MaterialViewerScreen';
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
  | 'videos'
  | 'todaySchedule'
  | 'liveClasses'
  | 'studyMaterials'
  | 'materialViewer'
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
  // Params that travel with a navigation (assessmentId, topicId, material url...).
  // Screens are mounted from a switch rather than a router, so without this the
  // second argument of onNavigate() was silently dropped and detail screens
  // had nothing to fetch with.
  const [routeParams, setRouteParams] = useState<any>(null);
  // Who is signed in. This has to be tracked explicitly rather than inferred
  // from the current screen: screens like Notifications and Profile are shared
  // by both roles, so a name-based guess turns a teacher into a student the
  // moment they open one.
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  const { theme } = useAppTheme();

  const isTeacher = role === 'teacher';
  const homeScreen: Screen = isTeacher ? 'teacherDashboard' : 'dashboard';

  const navigate = (tab: any, params?: any) => {
    // 'dashboard' is the student home. The shared screens hard-code it as their
    // Back target, so for a teacher it is redirected to their own home instead
    // of dropping them into the student panel.
    const target = tab === 'dashboard' ? homeScreen : tab;
    if (target === 'login') setRole(null);
    setScreen(target);
    setRouteParams(params ?? null);
  };

  // Restore a persisted session on start. Until this resolves we stay on the
  // splash screen, otherwise a logged-in user would see a flash of the login
  // screen before being redirected.
  useEffect(() => {
    let cancelled = false;

    restoreAuthToken()
      .then(session => {
        if (cancelled) return;
        if (session) {
          setRole(session.role === 'teacher' ? 'teacher' : 'student');
          setScreen(session.role === 'teacher' ? 'teacherDashboard' : 'dashboard');
        }
      })
      .catch(() => {
        /* no usable session; fall through to the normal splash -> login flow */
      });

    // A token the server rejects means the session is over: go back to login.
    setUnauthorizedHandler(() => { setRole(null); setScreen('login'); });

    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, []);

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
        return <SplashScreen onFinish={() => navigate('onboarding')} />;
      case 'onboarding':
        return <OnboardingScreen onContinue={() => navigate('login')} />;
      case 'login':
        return (
          <LoginScreen
            onLogin={(loggedInRole: string) => {
              // setScreen directly rather than navigate(): the role state set
              // here is not visible to navigate() until the next render, so its
              // student-home redirect would not yet know this is a teacher.
              const next = loggedInRole === 'teacher' ? 'teacher' : 'student';
              setRole(next);
              setScreen(next === 'teacher' ? 'teacherDashboard' : 'dashboard');
              setRouteParams(null);
            }}
          />
        );
      case 'dashboard':
        return <DashboardScreen onNavigate={navigate} />;
      case 'menu':
        return <MenuScreen onNavigate={navigate} onClose={() => navigate('dashboard')} />;
      case 'videos':
        return <VideosScreen onNavigate={navigate} routeParams={routeParams} />;
      case 'todaySchedule':
        return <TodayScheduleScreen onNavigate={navigate} />;
      case 'liveClasses':
        return <LiveClassesScreen onNavigate={navigate} />;
      case 'studyMaterials':
        return <StudyMaterialsScreen onNavigate={navigate} />;
      case 'materialViewer':
        return <MaterialViewerScreen onNavigate={navigate} routeParams={routeParams} />;
      case 'attendance':
        return <AttendanceScreen onNavigate={navigate} />;
      case 'calendar':
        return <CalendarScreen onNavigate={navigate} />;
      case 'doubt':
        return <DoubtScreen onNavigate={navigate} />;
      case 'askDoubt':
        return <AskDoubtScreen onNavigate={navigate} />;
      case 'assessments':
        return <AssessmentsScreen onNavigate={navigate} />;
      case 'discover':
        return <DiscoverScreen onNavigate={navigate} />;
      case 'timetable':
        return <TimetableScreen onNavigate={navigate} />;
      case 'assignments':
        return <AssignmentsScreen onNavigate={navigate} />;
      case 'profile':
        return <ProfileScreen onNavigate={navigate} />;
      case 'notifications':
        return <NotificationsScreen onNavigate={navigate} />;
      case 'studyPlan':
        return <StudyPlanScreen onNavigate={navigate} />;
      case 'analytics':
        return <AnalyticsScreen onNavigate={navigate} />;
      case 'pyq':
        return <PYQScreen onNavigate={navigate} />;
      case 'careers':
        return <CareersScreen onNavigate={navigate} />;
      case 'recordedClasses':
        return <RecordedClassesScreen onNavigate={navigate} />;
      case 'gamification':
        return <GamificationScreen onNavigate={navigate} />;
      case 'aiStudy':
        return <AiStudyScreen onNavigate={navigate} routeParams={routeParams} />;
      case 'aiQuiz':
        return <AiQuizScreen onNavigate={navigate} routeParams={routeParams} />;
      case 'careerQuiz':
        return <CareerQuizScreen onNavigate={navigate} />;
      case 'exam':
        return <ExamScreen onNavigate={navigate} routeParams={routeParams} />;
      case 'pdfViewer':
        return <PdfViewerScreen onNavigate={navigate} routeParams={routeParams} />;
      case 'liveClassRoom':
        return <LiveClassRoomScreen onNavigate={navigate} routeParams={routeParams} />;
      case 'teacherDashboard':
        return <TeacherDashboardScreen onNavigate={navigate} />;
      case 'teacherAssignments':
        return <TeacherAssignmentsScreen onNavigate={navigate} />;
      case 'teacherAssessments':
        return <TeacherAssessmentsScreen onNavigate={navigate} />;
      case 'teacherRecordings':
        return <TeacherRecordingsScreen onNavigate={navigate} />;
      case 'teacherClasses':
        return <TeacherClassesScreen onNavigate={navigate} />;
      case 'teacherAttendance':
        return <TeacherAttendanceScreen onNavigate={navigate} />;
      case 'teacherDoubts':
        return <TeacherDoubtsScreen onNavigate={navigate} />;
      case 'teacherMaterials':
        return <TeacherMaterialsScreen onNavigate={navigate} />;
      case 'teacherLiveHost':
        return <TeacherLiveHostScreen onNavigate={navigate} />;
      case 'teacherTimetable':
        return <TeacherTimetableScreen onNavigate={navigate} />;
      default:
        return null;
    }
  };

  // The arcade is a full-screen surface: its own back arrow is the way out, so
  // the tab bar is hidden to keep it immersive.
  const showBottomNav = !['splash', 'onboarding', 'login', 'menu', 'liveClassRoom', 'teacherLiveHost', 'gamification'].includes(screen);

  // Screens whose header runs edge-to-edge in the brand colour: the status bar
  // inset has to match it, otherwise it reads as a white gap above the header.
  // The arcade is a dark surface, so a light status-bar strip would read as a
  // seam across the top of it.
  const topInsetColor = ['dashboard', 'teacherDashboard'].includes(screen)
    ? '#1e3a8a'
    : screen === 'gamification'
    ? '#070B18'
    // Login's hero panel runs its own gradient behind the status bar, same
    // reasoning as the dashboard: the inset colour has to match its top edge.
    : screen === 'login'
    ? '#152A66'
    : theme.background;
  

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        {/* Android 16 (targetSdk 36) enforces edge-to-edge: the system bars always
            draw over the app window, so the root has to inset itself. */}
        {/* The dashboard paints its own artwork behind the status bar, so it
            opts out of the top inset and applies that padding itself. */}
        <SafeAreaView
          style={{ flex: 1, backgroundColor: topInsetColor }}
          edges={['dashboard', 'teacherDashboard', 'login'].includes(screen) ? [] : ['top']}
        >
          <View style={{ flex: 1, backgroundColor: theme.background }}>
          <View style={{ flex: 1 }}>{renderScreen()}</View>
          {showBottomNav && (
            <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.surface }}>
            <View style={[styles.bottomNav, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
              {isTeacher ? (
                <>
                  <TouchableOpacity style={styles.navItem} onPress={() => navigate('teacherDashboard')}>
                    <Home size={ms(24)} color={screen === 'teacherDashboard' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'teacherDashboard' && { color: theme.primary, fontWeight: '700' }]}>Home</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => navigate('teacherClasses')}>
                    <BookOpen size={ms(24)} color={screen === 'teacherClasses' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'teacherClasses' && { color: theme.primary, fontWeight: '700' }]}>Classes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => navigate('teacherMaterials')}>
                    <FileText size={ms(24)} color={screen === 'teacherMaterials' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'teacherMaterials' && { color: theme.primary, fontWeight: '700' }]}>Course Content</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => navigate('teacherTimetable')}>
                    <Clock size={ms(24)} color={screen === 'teacherTimetable' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'teacherTimetable' && { color: theme.primary, fontWeight: '700' }]}>My Schedule</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.navItem} onPress={() => navigate('dashboard')}>
                    <Home size={ms(24)} color={screen === 'dashboard' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'dashboard' && { color: theme.primary, fontWeight: '700' }]}>Home</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => navigate('videos')}>
                    <MonitorPlay size={ms(24)} color={screen === 'videos' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'videos' && { color: theme.primary, fontWeight: '700' }]}>Videos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => navigate('doubt')}>
                    <Bot size={ms(24)} color={screen === 'doubt' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'doubt' && { color: theme.primary, fontWeight: '700' }]}>AI Tutor</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => navigate('gamification')}>
                    <Gamepad2 size={ms(24)} color={screen === 'gamification' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'gamification' && { color: theme.primary, fontWeight: '700' }]}>Games</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.navItem} onPress={() => navigate('careers')}>
                    <Briefcase size={ms(24)} color={screen === 'careers' ? theme.primary : theme.subtext} />
                    <Text style={[styles.navText, { color: theme.subtext }, screen === 'careers' && { color: theme.primary, fontWeight: '700' }]}>Career</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
            </SafeAreaView>
          )}
          {/* Screens without the tab bar still need the home-indicator inset.
              It carries the screen's own colour so a dark screen does not end
              in a light strip. */}
          {!showBottomNav && (
            <SafeAreaView
              edges={['bottom']}
              style={{ backgroundColor: screen === 'gamification' ? '#070B18' : theme.background }}
            />
          )}
          </View>
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
    paddingVertical: vs(12),
    // Home indicator / gesture bar spacing comes from the root SafeAreaView inset.
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: ms(10),
    marginTop: vs(4),
    color: '#64748B',
    fontFamily: 'Poppins-Medium',
  },
  tabLabelActive: {
    color: '#2563EB',
    fontFamily: 'Poppins-Medium',
  },
  navText: {
    fontSize: ms(10),
    marginTop: vs(4),
    color: '#6B7280',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: hs(20),
    backgroundColor: '#2563EB',
    width: hs(56),
    height: vs(56),
    borderRadius: ms(28),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.3,
    shadowRadius: ms(8),
    elevation: 5,
    zIndex: 1000,
  },
});