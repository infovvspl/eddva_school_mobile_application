import { saveSession, loadSession, clearSession, Session } from './session';

const BASE_URL = 'https://api.eddva.in/api/v1';
const AI_BASE_URL = BASE_URL;

let currentToken = '';
// The API is multi-tenant: every call must carry the caller's institute as a
// header, not just the bearer token. Kept in step with currentToken.
let currentInstituteId = '';

// Called when the server rejects our token, so the app can send the user back
// to the login screen instead of leaving them on a screen that cannot load.
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

/**
 * Set the token for this session and, by default, persist it so a reload or
 * app restart keeps the user logged in. Previously the token lived only in
 * this module variable, so every reload silently signed the user out.
 *
 * `persist: false` (the login screen's "Remember me" left unchecked) still
 * sets the in-memory token -- the current app session works normally -- it
 * just never reaches storage, so a restart lands back on the login screen.
 */
export const setAuthToken = (
  token: string,
  role: Session['role'] = 'student',
  instituteId = '',
  persist = true,
) => {
  currentToken = token;
  currentInstituteId = instituteId;
  if (persist) void saveSession({ token, role, instituteId });
};

/**
 * Rehydrate the in-memory token from storage. Call once on app start, before
 * rendering anything that makes an authenticated request.
 */
export const restoreAuthToken = async (): Promise<Session | null> => {
  const session = await loadSession();
  if (session) {
    currentToken = session.token;
    currentInstituteId = session.instituteId ?? '';
  }
  return session;
};

export const clearAuthToken = async () => {
  currentToken = '';
  currentInstituteId = '';
  await clearSession();
};

// Helper to get auth token
const getAuthToken = async () => {
  return currentToken; 

};

export const fetchApi = async (endpoint: string, options: RequestInit = {}, isAiEngine = false) => {
  const baseUrl = isAiEngine ? AI_BASE_URL : BASE_URL;
  const url = `${baseUrl}${endpoint}`;
  
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(currentInstituteId ? { 'X-Institute-Id': currentInstituteId } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // A rejected token is a dead session: drop it so the app stops retrying
      // with credentials the server has already refused.
      if (response.status === 401 && currentToken) {
        await clearAuthToken();
        onUnauthorized?.();
      }
      throw new Error(errorData.message || 'API Error');
    }

    const json = await response.json();
    // The API wraps every payload as { success:true, data:<payload> }. Unwrap
    // once here so screens read the payload directly instead of each one
    // re-implementing the same "is it wrapped?" ladder. Responses that are not
    // enveloped are passed through untouched.
    if (
      json &&
      typeof json === 'object' &&
      !Array.isArray(json) &&
      'success' in json &&
      'data' in json
    ) {
      return (json as any).data;
    }
    return json;
  } catch (error) {
    throw error;
  }
};

export const schoolApi = {
  // --- AUTH ---
  login: (data: any) => fetchApi('/school/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  // The account's real role, confirmed live: e.g. "STUDENT" or a comma-joined
  // "TEACHER,INSTITUTE_ADMIN". Used as a fallback when a login response's own
  // user object doesn't carry a role.
  getMe: () => fetchApi('/school/auth/me'),
  register: (data: any) => fetchApi('/school/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => clearAuthToken(),
  registerDeviceToken: (token: string, platform: 'android' | 'ios') =>
    fetchApi('/school/students/device-token', { method: 'POST', body: JSON.stringify({ token, platform }) }),

  // --- CORE SYSTEM ---
  getProfile: () => fetchApi('/school/students/dashboard'),
  getDashboardStats: () => fetchApi('/school/students/dashboard'),
  getTimetable: () => fetchApi('/school/timetables/student/me'),
  listTimetables: () => fetchApi('/school/timetables'),
  getMyProfile: () => fetchApi('/school/students/profile/me'),
  getMyCourses: () => fetchApi('/school/students/courses/my'),
  getCourseCurriculum: (classId: string) => fetchApi(`/school/students/courses/${classId}`),
  getStudentStats: () => fetchApi('/school/students/stats'),
  getAttendance: () => fetchApi('/school/attendance'),
  getAttendanceReport: () => fetchApi('/school/attendance/report'),
  getAttendanceHistory: () => fetchApi('/school/attendance/history'),
  getMyAnalytics: () => fetchApi('/school/reports/my-analytics'),
  getStudentReport: () => fetchApi('/school/reports/student'),
  getAssessmentReport: () => fetchApi('/school/reports/assessment'),
  
  getCareers: () => fetchApi('/school/career/explore'),
  getCareerGuidance: () => fetchApi('/school/career/quiz/status'),
  saveCareer: (id: string) => fetchApi(`/school/career/${id}/save`, { method: 'POST' }),
  getCareerQuizQuestions: () => fetchApi('/school/career/quiz/questions'),
  submitCareerQuiz: (data: any) => fetchApi('/school/career/quiz/submit', { method: 'POST', body: JSON.stringify(data) }),
  generateCareerReport: () => fetchApi('/school/career/report/generate', { method: 'POST' }),
  getCareerReport: () => fetchApi('/school/career/report'),
  exploreCareerDetails: (careerId: string) => fetchApi(`/school/career/explore/${careerId}`),

  createStudent: (data: any) => fetchApi('/school/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: any) => fetchApi(`/school/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id: string) => fetchApi(`/school/students/${id}`, { method: 'DELETE' }),
  getStudent: (id: string) => fetchApi(`/school/students/${id}`),

  // --- ASSIGNMENTS & ASSESSMENTS (Shared) ---
  getAssignments: () => fetchApi('/school/assignments'),
  getAssessments: () => fetchApi('/school/assessments'),
  getAssessmentDetails: (id: string) => fetchApi(`/school/assessments/${id}`),
  getAssessmentResults: (id: string) => fetchApi(`/school/assessments/${id}/results`),
  startAssessmentAttempt: (id: string, data: any = {}) => fetchApi(`/school/assessments/${id}/start`, { method: 'POST', body: JSON.stringify(data) }),
  saveAssessmentAnswer: (id: string, data: any) => fetchApi(`/school/assessments/${id}/answer`, { method: 'POST', body: JSON.stringify(data) }),
  submitAssessment: (id: string, data: any = {}) => fetchApi(`/school/assessments/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  getMyAssessmentSubmission: (id: string) => fetchApi(`/school/assessments/${id}/my-submission`),
  
  // --- LEARN TAB (Shared) ---
  getRecordings: () => fetchApi('/school/classes/recordings'),
  // Call right before playback: the list's video_url is not always playable.
  getRecordingPlayUrl: (id: string) => fetchApi(`/school/classes/recordings/${id}/play-url`),
  getRecordingNotes: (id: string) => fetchApi(`/school/classes/recordings/${id}/notes-images-data`),
  // Personal notes are scoped per recording: the same endpoint returns a
  // different string per recordingId, and the response is { success, notes }
  // with `notes` at the top level rather than inside `data`.
  getStudentNotes: (recordingId: string) =>
    fetchApi(`/school/classes/student-notes?recordingId=${encodeURIComponent(recordingId)}`),
  saveStudentNote: (recordingId: string, notes: string) =>
    fetchApi('/school/classes/student-notes', {
      method: 'POST',
      body: JSON.stringify({ recordingId, notes }),
    }),
  getRecordingProgress: (id: string) => fetchApi(`/school/classes/recordings/${id}/progress`),
  upsertRecordingProgress: (id: string, data: any) => fetchApi(`/school/classes/recordings/${id}/progress`, { method: 'POST', body: JSON.stringify(data) }),
  submitVideoQuizResponse: (id: string, data: any) => fetchApi(`/school/classes/recordings/${id}/quiz-response`, { method: 'POST', body: JSON.stringify(data) }),
  getMaterials: () => fetchApi('/school/materials'),
  getMaterialDetails: (id: string) => fetchApi(`/school/materials/${id}`),
  getMaterialHighlights: (id: string) => fetchApi(`/school/materials/${id}/highlights`),
  saveMaterialHighlight: (id: string, data: any) => fetchApi(`/school/materials/${id}/highlights`, { method: 'POST', body: JSON.stringify(data) }),
  downloadMaterial: (id: string) => fetchApi(`/school/materials/${id}/download`),
  getDoubts: () => fetchApi('/school/doubts'),
  startAiTutor: (data: any) => fetchApi('/tutor/session', { method: 'POST', body: JSON.stringify(data) }, true),

  // --- DISCOVER TAB (Shared) ---
  getEvents: () => fetchApi('/school/calendar/events'),
  getPlatformNotices: () => fetchApi('/school/notices/platform'),
  
  // --- NOTIFICATIONS ---
  getNotifications: () => fetchApi('/school/notifications'),
  getUnreadNotificationsCount: () => fetchApi('/school/notifications/unread-count'),
  markNotificationRead: (id: string) => fetchApi(`/school/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => fetchApi('/school/notifications/read-all', { method: 'PUT' }),
  getNotificationPreferences: () => fetchApi('/school/notifications/preferences'),
  updateNotificationPreferences: (data: any) => fetchApi('/school/notifications/preferences', { method: 'PUT', body: JSON.stringify(data) }),

  // --- GAMIFICATION & ARCADE ---
  // Quiz Rush
  startQuizRush: () => fetchApi('/school/gamification/quiz-rush/start'),
  submitQuizRush: (data: any) => fetchApi('/school/gamification/quiz-rush/submit', { method: 'POST', body: JSON.stringify(data) }),
  getQuizRushLeaderboard: () => fetchApi('/school/gamification/quiz-rush/leaderboard'), 
  
  // Treasure Map
  getTreasureMaps: () => fetchApi('/school/gamification/treasure/maps'),
  getTreasureChallenge: () => fetchApi('/school/gamification/treasure/challenge'),
  completeTreasureStage: (data: any) => fetchApi('/school/gamification/treasure/complete', { method: 'POST', body: JSON.stringify(data) }),

  // Math Sprint
  startMathSprint: () => fetchApi('/school/gamification/math-sprint/start'),
  submitMathSprint: (data: any) => fetchApi('/school/gamification/math-sprint/submit', { method: 'POST', body: JSON.stringify(data) }),
  getMathSprintLeaderboard: () => fetchApi('/school/gamification/math-sprint/leaderboard'),

  // Memory Match
  getMemoryMatchDecks: () => fetchApi('/school/gamification/memory-match/decks'),
  startMemoryMatch: () => fetchApi('/school/gamification/memory-match/start'),
  submitMemoryMatch: (data: any) => fetchApi('/school/gamification/memory-match/submit', { method: 'POST', body: JSON.stringify(data) }),
  getMemoryMatchLeaderboard: () => fetchApi('/school/gamification/memory-match/leaderboard'),

  // Word Master
  getWordMasterDecks: () => fetchApi('/school/gamification/word-master/decks'),
  startWordMaster: () => fetchApi('/school/gamification/word-master/start'),
  submitWordMaster: (data: any) => fetchApi('/school/gamification/word-master/submit', { method: 'POST', body: JSON.stringify(data) }),
  getWordMasterLeaderboard: () => fetchApi('/school/gamification/word-master/leaderboard'),

  // --- DOUBTS ---
  getDoubtContext: () => fetchApi('/school/doubts/context'),
  getDoubtDetails: (id: string) => fetchApi(`/school/doubts/${id}`),
  getDoubtStats: () => fetchApi('/school/doubts/stats'),
  createDoubt: (data: any) => fetchApi('/school/doubts', { method: 'POST', body: JSON.stringify(data) }),
  getDoubtUploadUrl: (data: any) => fetchApi('/school/doubts/upload-url', { method: 'POST', body: JSON.stringify(data) }),
  getMyDoubts: () => fetchApi('/school/doubts/my-doubts'),
  replyToDoubt: (id: string, data: any) => fetchApi(`/school/doubts/${id}/reply`, { method: 'POST', body: JSON.stringify(data) }),
  resolveDoubt: (id: string) => fetchApi(`/school/doubts/${id}/resolve`, { method: 'PATCH' }),
  escalateDoubt: (id: string) => fetchApi(`/school/doubts/${id}/escalate`, { method: 'POST' }),
  markDoubtHelpful: (id: string, data: any) => fetchApi(`/school/doubts/${id}/helpful`, { method: 'PATCH', body: JSON.stringify(data) }),
  getAiDoubtSuggestion: (id: string) => fetchApi(`/school/doubts/${id}/ai-suggest`, { method: 'POST' }),

  // --- CLASSES ---
  // NOTE: every /school/classes/* route below answers 404 on the live API --
  // the real class list lives at /school/academic/classes (see getAcademicClasses).
  // They are kept only because two screens still reference them; both surface
  // an error rather than data until they are migrated.
  getClasses: () => fetchApi('/school/classes'),
  getClassDetails: (id: string) => fetchApi(`/school/classes/${id}`),
  getClassSubjects: (id: string) => fetchApi(`/school/classes/${id}/subjects`),
  getClassTeachers: (id: string) => fetchApi(`/school/classes/${id}/teachers`),
  getClassStudents: (id: string) => fetchApi(`/school/classes/${id}/students`),

  // --- COURSE CONTENT (curriculum tree) ---
  // Classes with their sections nested, plus totalStudents and classTeacherName
  // on both the class and each section -- the source for the "Class Teacher" badge.
  getAcademicClasses: () => fetchApi('/school/academic/classes'),
  getAcademicSections: () => fetchApi('/school/academic/sections'),
  // Subjects taught in one class-section, each carrying a `chapters` array.
  // That array is denormalised: it holds the chapters of EVERY subject sharing
  // the same name across classes, so callers must keep only the entries whose
  // chapter.subjectId matches the subject's own id (verified live: Class 10
  // Science returns 68 chapters, of which 13 are actually Class 10's).
  getSubjectsForSection: (classId: string, sectionId: string) =>
    fetchApi(`/school/subjects?classId=${encodeURIComponent(classId)}&sectionId=${encodeURIComponent(sectionId)}`),
  getChapterTopics: (chapterId: string) =>
    fetchApi(`/school/topics?chapterId=${encodeURIComponent(chapterId)}`),
  // Materials filtered server-side. chapterId returns only the chapter-level
  // items (those with no topic); topicId returns that topic's own items.
  getChapterMaterials: (chapterId: string) =>
    fetchApi(`/school/materials?chapterId=${encodeURIComponent(chapterId)}`),
  getTopicMaterials: (topicId: string) =>
    fetchApi(`/school/materials?topicId=${encodeURIComponent(topicId)}`),
  deleteMaterial: (id: string) => fetchApi(`/school/materials/${id}`, { method: 'DELETE' }),

  // --- SUBJECTS & TOPICS ---
  getSubjects: () => fetchApi('/school/subjects'),
  getSubjectDetails: (id: string) => fetchApi(`/school/subjects/${id}`),
  getClassSubjectsList: (classId: string) => fetchApi(`/school/subjects/class/${classId}`),
  getSubjectStats: (id: string) => fetchApi(`/school/subjects/${id}/stats`),
  getTopics: () => fetchApi('/school/topics'),
  getTopicDetails: (id: string) => fetchApi(`/school/topics/${id}`),

  // --- LIVE CLASSES ---
  getLiveClassDetails: (id: string) => fetchApi(`/school/live/${id}`),
  getPastLiveClasses: () => fetchApi('/school/live/recorded'),
  getLiveClassAttendance: (id: string) => fetchApi(`/school/live/${id}/attendance`),
  getLiveClassPolls: (id: string) => fetchApi(`/school/live/${id}/polls`),
  getUpcomingLiveClasses: () => fetchApi('/school/live/student/upcoming'),
  joinLiveClass: (id: string) => fetchApi(`/school/live/${id}/join`, { method: 'POST' }),

  // --- RECORDING HIGHLIGHTS ---
  getRecordingHighlights: () => fetchApi('/school/recording-highlights'),

  // --- ASSIGNMENTS ---
  getAssignmentDetails: (id: string) => fetchApi(`/school/assignments/${id}`),
  getAssignmentSubmissions: (id: string) => fetchApi(`/school/assignments/${id}/submissions`),
  submitAssignment: (id: string, data: any) => fetchApi(`/school/assignments/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),

  // --- PREVIOUS YEAR QUESTIONS (PYQ) ---
  getTopicPyqsOverview: (topicId: string) => fetchApi(`/assessments/topics/${topicId}/pyqs/overview`),
  getTopicPyqs: (topicId: string) => fetchApi(`/assessments/topics/${topicId}/pyqs`),
  submitTopicPyq: (topicId: string, questionId: string, data: any) => fetchApi(`/assessments/topics/${topicId}/pyqs/${questionId}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  startPyqSession: (topicId: string, data: any) => fetchApi(`/assessments/topics/${topicId}/pyqs/start-session`, { method: 'POST', body: JSON.stringify(data) }),
  getPyqProgress: (topicId: string) => fetchApi(`/assessments/topics/${topicId}/pyqs/my-progress`),
  getChapterPyqsOverview: (chapterId: string) => fetchApi(`/assessments/chapters/${chapterId}/pyqs/overview`),

  // --- PERSONALIZED STUDY PLANS ---
  getStudyPlans: () => fetchApi('/school/study-plans'),
  // Study Planner
  getTodayStudyPlan: () => fetchApi('/school/study-plans/today'),
  getBacklogs: () => fetchApi('/school/study-plans/backlogs'),
  getStudyPlanWeakTopics: () => fetchApi('/school/study-plans/weak-topics'),
  getRevision: () => fetchApi('/school/study-plans/revision'),
  getRoadmap: () => fetchApi('/school/study-plans/roadmap'),
  getStudyPlanCourses: () => fetchApi('/school/study-plans/courses'),
  getNextAction: () => fetchApi('/school/study-plans/next-action'),
  generateStudyPlan: (data: any) => fetchApi('/school/study-plans/generate', { method: 'POST', body: JSON.stringify(data) }),
  regenerateStudyPlan: () => fetchApi('/school/study-plans/regenerate', { method: 'POST' }),
  clearStudyPlan: () => fetchApi('/school/study-plans/clear', { method: 'POST' }),
  completeStudyPlanItem: (id: string) => fetchApi(`/school/study-plans/items/${id}/complete`, { method: 'POST' }),
  skipStudyPlanItem: (id: string) => fetchApi(`/school/study-plans/items/${id}/skip`, { method: 'POST' }),
  getSpacedRevision: () => fetchApi('/school/study-plans/revision/spaced'),
  getIntensiveRevision: () => fetchApi('/school/study-plans/revision/intensive'),
  getNotesRevision: () => fetchApi('/school/study-plans/revision/notes'),
  getPracticeRevision: () => fetchApi('/school/study-plans/revision/practice'),
  startRevisionSession: (data: any) => fetchApi('/school/study-plans/revision/start', { method: 'POST', body: JSON.stringify(data) }),
  completeRevisionSession: () => fetchApi('/school/study-plans/revision-session/complete', { method: 'POST' }),

  // --- AI TUTOR & TOPIC PROGRESS ---
  getTopicStudyStatus: (topicId: string) => fetchApi(`/school/topics/${topicId}/study-status`),
  startAiStudy: (topicId: string) => fetchApi(`/school/topics/${topicId}/ai-study/start`, { method: 'POST' }),
  askAiQuestion: (topicId: string, sessionId: string, data: any) => fetchApi(`/school/topics/${topicId}/ai-study/${sessionId}/ask`, { method: 'POST', body: JSON.stringify(data) }),
  completeAiStudy: (topicId: string, sessionId: string) => fetchApi(`/school/topics/${topicId}/ai-study/${sessionId}/complete`, { method: 'PATCH' }),
  saveAiStudyNotes: (topicId: string, sessionId: string, data: any) => fetchApi(`/school/topics/${topicId}/ai-study/${sessionId}/save-notes`, { method: 'PATCH', body: JSON.stringify(data) }),
  completeAiQuiz: (topicId: string, data: any) => fetchApi(`/school/topics/${topicId}/ai-quiz/complete`, { method: 'POST', body: JSON.stringify(data) }),

  // Aliases for missing AI APIs
  generateAiQuiz: (topicId: string) => fetchApi('/school/topics/' + topicId + '/ai-quiz/generate', { method: 'POST' }),
  getToday: () => fetchApi('/school/study-plans/today'),
  generate: (data: any) => fetchApi('/school/study-plans/generate', { method: 'POST', body: JSON.stringify(data) }),
  completeItem: (id: string) => fetchApi('/school/study-plans/items/' + id + '/complete', { method: 'PATCH' }),
  skipItem: (id: string) => fetchApi('/school/study-plans/items/' + id + '/skip', { method: 'PATCH' }),
  quizRushLeaderboard: () => fetchApi('/school/gamification/quiz-rush/leaderboard'),

  // Add missing standard endpoints
//   getMaterials: () => fetchApi('/school/materials'),
//   getRecordings: () => fetchApi('/school/classes/recordings'),
//   getNotifications: () => fetchApi('/school/notifications'),
//   getEvents: () => fetchApi('/school/calendar/events'),
//   getPlatformNotices: () => fetchApi('/school/notices/platform'),
//   getAssessments: () => fetchApi('/school/assessments'),


  // --- NEW LIVE CLASSES APIs ---
  getScheduledLiveLectures: () => fetchApi('/school/live/lectures'),
  getActiveLiveLectures: () => fetchApi('/school/live/lectures/live'),
  getStreamUrl: (id: string) => fetchApi(`/school/live/lectures/${id}/stream-url`),
  raiseHand: (id: string, raised: boolean) => fetchApi(`/school/live/lectures/${id}/hand`, { method: 'POST', body: JSON.stringify({ raised }) }),
  getLiveChat: (id: string) => fetchApi(`/school/live/lectures/${id}/chat`),
  getActivePoll: (id: string) => fetchApi(`/school/live/lectures/${id}/polls/active`),
  votePoll: (id: string, pollId: string, option: string) => fetchApi(`/school/live/lectures/${id}/polls/${pollId}/vote`, { method: 'POST', body: JSON.stringify({ option }) }),
  getAllPolls: (id: string) => fetchApi(`/school/live/lectures/${id}/polls`),
  getLiveRecordings: () => fetchApi('/school/live/recordings'),
  getRecordingUrl: (id: string) => fetchApi(`/school/live/lectures/${id}/recording-url`),

  // ==========================================
  //            TEACHER PORTAL APIs
  // ==========================================
  teacher: {
    // 1. Dashboard & Stats
    getStats: () => fetchApi('/school/teachers/stats'),
    
    // 2. Classes & Subjects
    getClasses: () => fetchApi('/school/reports/teacher/class'),
    getSubjects: (teacherId: string) => fetchApi(`/school/subjects/teacher/${teacherId}`),
    
    // 3. Assignments
    getAssignments: () => fetchApi('/school/assignments'),
    createAssignment: (data: any) => fetchApi('/school/assignments', { method: 'POST', body: JSON.stringify(data) }),
    getInboxSubmissions: () => fetchApi('/school/assignments/submissions/inbox'),
    getAssignmentSubmissions: (id: string) => fetchApi(`/school/assignments/${id}/submissions`),
    gradeSubmission: (assignmentId: string, submissionId: string, data: any) => fetchApi(`/school/assignments/${assignmentId}/submissions/${submissionId}/grade`, { method: 'POST', body: JSON.stringify(data) }),
    aiGenerateAssignment: (data: any) => fetchApi('/school/assignments/ai-generate', { method: 'POST', body: JSON.stringify(data) }),
    
    // 4. Assessments (Exams/Quizzes)
    getAssessments: () => fetchApi('/school/assessments'),
    createAssessment: (data: any) => fetchApi('/school/assessments', { method: 'POST', body: JSON.stringify(data) }),
    aiGenerateAssessment: (data: any) => fetchApi('/school/assessments/ai-generate', { method: 'POST', body: JSON.stringify(data) }),
    getAssessmentResults: (id: string) => fetchApi(`/school/assessments/${id}/results`),
    // 5. Recordings & Materials
    getRecordings: (teacherId: string) => fetchApi(`/school/teachers/${teacherId}/recordings`),
    analyzeRecording: (teacherId: string, recordingId: string) => fetchApi(`/school/teachers/${teacherId}/recordings/${recordingId}/analyze`, { method: 'POST' }),

    // 6. Attendance
    markAttendanceSession: (data: any) => fetchApi('/school/attendance/session', { method: 'POST', body: JSON.stringify(data) }),
    getAttendanceLogs: () => fetchApi('/school/attendance'),

    // 7. Doubts
    getDoubts: () => fetchApi('/school/doubts'),
    respondToDoubt: (id: string, data: any) => fetchApi(`/school/doubts/${id}/respond`, { method: 'POST', body: JSON.stringify(data) }),

    // 8. Materials & PPT
    uploadMaterial: (data: any) => fetchApi('/school/materials', { method: 'POST', body: JSON.stringify(data) }),
    generatePPT: (data: any) => fetchApi('/school/ppt/generate', { method: 'POST', body: JSON.stringify(data) }),
    generateAiNotes: (data: any) => fetchApi('/school/materials/ai-generate', { method: 'POST', body: JSON.stringify(data) }),
    /**
     * The AI content generator behind Course Content. Takes
     * `{ chapterId | topicId, contentType, language }` and answers
     * `{ content, contentType, topicName, source }`.
     *
     * Two behaviours worth knowing, both confirmed against the live API:
     *  - it only GENERATES; nothing is written to the library, so the caller
     *    has to POST the result through createMaterial to keep it.
     *  - the type field must be `contentType`. Sending `materialType` or
     *    `type` is silently ignored and the server falls back to plain notes.
     */
    aiGenerateMaterial: (data: {
      chapterId?: string;
      topicId?: string;
      contentType: string;
      language?: string;
    }) => fetchApi('/school/materials/ai-generate', { method: 'POST', body: JSON.stringify(data) }),

    // Saves a material. `description` carries the Markdown body for generated
    // content, which is where the app reads it back from -- AI material has no
    // file behind it, so fileUrl stays empty.
    createMaterial: (data: {
      title: string;
      description: string;
      fileType: string;
      chapterId: string;
      topicId?: string;
      subjectId: string;
      classId: string;
      sectionId?: string;
    }) => fetchApi('/school/materials', { method: 'POST', body: JSON.stringify(data) }),

    // 9. Live Classes
    startLiveLecture: (data: any) => fetchApi('/school/live/lectures', { method: 'POST', body: JSON.stringify(data) }),
    endLiveLecture: (id: string) => fetchApi(`/school/live/lectures/${id}/end`, { method: 'POST' }),
    createLivePoll: (id: string, data: any) => fetchApi(`/school/live/lectures/${id}/polls`, { method: 'POST', body: JSON.stringify(data) }),

    // 10. Timetables
    getTimetables: () => fetchApi('/school/timetables'),
    createTimetable: (data: any) => fetchApi('/school/timetables', { method: 'POST', body: JSON.stringify(data) }),
  }
};
