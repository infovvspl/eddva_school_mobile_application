/** EDDVA architecture — 30 screens + navigation params */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StudyResource } from '../utils/topicResources';
import type { MockDoubt } from '../mocks/mockDoubtService';

export type AuthStackParamList = {
  Intro: undefined;
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  OtpLogin: undefined;
  ForgotPassword: undefined;
  OtpVerification: { identifier: string; purpose: string };
  ResetPassword: { identifier: string; otp: string };
};

export type OnboardingStackParamList = {
  OnboardingWizard: undefined;
  DiagnosticInfo: undefined;
  DiagnosticTest: undefined;
  DiagnosticResult: { score: number; fidelity: number; tier: string };
  PlanGeneratorSplash:
    | {
        exam?: string;
        studentClass?: string;
        year?: string;
        hours?: string;
        scoreTarget?: string;
        schoolHours?: string;
        weakSubjects?: string[];
      }
    | undefined;
};

export type BattleStackParamList = {
  BattleLobby: undefined;
  BattleMatchmaker: { mode: string; subject?: string; subjectId?: string; topicId?: string };
  BattleRoomCode: { create?: boolean };
  BattleChallengeWait: {
    battleId: string;
    roomCode: string;
    opponentName: string;
    opponentId?: string;
  };
  BattleLive: {
    roomCode: string;
    battleId?: string;
    opponent?: string;
    botMode?: boolean;
    subjectId?: string;
    topicId?: string;
  };
  BattleResults: {
    won: boolean;
    myScore: number;
    oppScore: number;
    eloDelta: number;
    roomCode: string;
    battleId?: string;
  };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Learn: undefined;
  StudyPlan: undefined;
  Battle: NavigatorScreenParams<BattleStackParamList> | undefined;
  Help: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: { screen?: keyof MainTabParamList; params?: object } | undefined;
  MyCourses: undefined;
  Courses: undefined;
  CourseDetail: { batchId: string };
  CourseCurriculum: {
    batchId: string;
    initialTab?: 'curriculum' | 'lectures' | 'dpp' | 'pyq' | 'notes' | 'mindmaps' | 'mock' | 'faq';
  };
  TopicDetail: {
    batchId: string;
    topicId: string;
    topicName: string;
    subjectName?: string;
    courseName?: string;
    initialTab?: 'dpp' | 'pyq' | 'material' | 'mindmaps' | 'faq' | 'about';
  };
  Leaderboard: undefined;
  LeaderboardInfo: { page?: number } | undefined;
  Progress: undefined;
  BatchListing: { initialTab?: 'my' | 'explore' | 'live' } | undefined;
  TestSeries: undefined;
  LiveClass: {
    lectureId: string;
    topicId?: string;
    title?: string;
    teacherName?: string;
    batchId?: string;
    /** Resume playback from continue-learning (0–100). */
    initialSeekPercent?: number;
    /** Pre-resolved stream from dashboard (optional). */
    videoUrl?: string;
    thumbnailUrl?: string;
  };
  AIStudyRoom: { topicId?: string; title?: string };
  ExamEngine: {
    testId: string;
    title?: string;
    sessionId?: string;
    topicId?: string;
    mode?: 'mock' | 'pyq';
  };
  PracticePYQ: { topicId?: string } | undefined;
  StudySheet: { resource: StudyResource };
  AeroRoadmap: undefined;
  Calendar: { selectedDate?: string } | undefined;
  Saved: undefined;
  Profile: undefined;
  AccountHub: undefined;
  Notifications: undefined;
  StudyPlanBacklogDetail: {
    courseId: string;
    categoryId: string;
    title: string;
  };
  StudyPlanInsights: { courseId: string };
  StudyPlanManage: { courseId: string; examType: string };
  StudyPlanWeakDetail: {
    courseId: string;
    areaId: string;
    title: string;
  };
  StudyMaterials: undefined;
  JoinBatch: undefined;
  DoubtDetail: {
    doubt: MockDoubt;
    initialMode?: 'brief' | 'detailed';
  };
  Checkout: { batchId: string; name?: string } | undefined;
  IntensiveRevision: { courseId: string };
  RevisionNotes: { courseId: string };
};
