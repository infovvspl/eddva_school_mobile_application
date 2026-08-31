import re

with open('src/utils/api.ts', 'r') as f:
    content = f.read()

# I will just write a completely new, clean api.ts file that I construct based on what I've seen.
clean_api = """const BASE_URL = 'https://dev-api.eddva.in/api/v1'; // Actual dev API URL
const AI_BASE_URL = 'https://dev-api.eddva.in/api/v1/ai'; // Update if AI engine has a different host

let currentToken = '';

export const setAuthToken = (token: string) => {
  currentToken = token;
};

// Helper to get auth token
const getAuthToken = async () => {
  return currentToken; 
};

const mockData: Record<string, any> = {
  '/school/students/dashboard': { streak: 12, points: 2450, level: 'Gold' },

  '/school/timetables/student/me': {
    '2026-07-08': [
      { id: 1, title: 'Mathematics', teacher: 'Mr. Anderson', startTime: '09:00 AM', endTime: '09:45 AM', room: 'Room 101', type: 'Math', isLive: false },
      { id: 2, title: 'Science', teacher: 'Dr. Smith', startTime: '10:00 AM', endTime: '10:45 AM', room: 'Lab 2', type: 'Science', isLive: false },
    ],
    '2026-07-09': [
      { id: 3, title: 'English Literature', teacher: 'Mrs. Davis', startTime: '08:30 AM', endTime: '09:15 AM', room: 'Room 204', type: 'English', isLive: false },
      { id: 4, title: 'Advanced Physics', teacher: 'Dr. Smith', startTime: '10:00 AM', endTime: '11:30 AM', room: 'Virtual', type: 'Physics', isLive: true },
      { id: 5, title: 'Computer Science', teacher: 'Mr. Gates', startTime: '01:00 PM', endTime: '02:00 PM', room: 'Lab 1', type: 'Computer', isLive: false },
    ],
    '2026-07-10': [
      { id: 6, title: 'History', teacher: 'Mr. Brown', startTime: '09:00 AM', endTime: '09:45 AM', room: 'Room 302', type: 'History', isLive: false },
    ],
    '2026-07-11': [
      { id: 7, title: 'Physical Education', teacher: 'Coach Carter', startTime: '08:00 AM', endTime: '09:30 AM', room: 'Field', type: 'PE', isLive: false },
    ],
    '2026-07-12': [
      { id: 8, title: 'Art & Design', teacher: 'Ms. Picasso', startTime: '10:00 AM', endTime: '11:30 AM', room: 'Art Studio', type: 'Art', isLive: false },
    ]
  },
  '/school/classes/recordings': [
    { id: 1, title: 'Calculus 101', duration: '45 mins', date: 'Yesterday' },
    { id: 2, title: 'World History', duration: '50 mins', date: 'Monday' }
  ],
  '/school/materials': [
    { id: 1, title: 'Chapter 4 Notes.pdf', size: '2 MB' },
    { id: 2, title: 'Biology Study Guide', size: '5 MB' }
  ],
  '/school/doubts': [
    { id: 1, question: 'How does photosynthesis work?', status: 'Answered' }
  ],
  '/school/students/courses/my': [
    { id: 1, title: 'Read History Chapter 5', completed: false },
    { id: 2, title: 'Complete Math Worksheet', completed: true }
  ],
  '/school/assignments': [
    { 
      id: 1, 
      title: 'Chemical Equations', 
      subject: 'Science', 
      classInfo: 'Class 10 · A', 
      description: '# Chemical Equations ## Sec A: Homework Assignment ### Introduction\\nChemical equations are a crucial part of chemistry, as they provide a concise and informative way to represent chemical reactions. A chemical...',
      dueDate: '7/2/2026', 
      submissions: 1, 
      feedback: 'good', 
      marks: 50, 
      status: 'EVALUATED' 
    },
    { 
      id: 2, 
      title: 'Distribution Rule', 
      subject: 'Mathematics', 
      classInfo: 'Class 10 · A', 
      description: 'Practice all the questions in exercise 6-a',
      dueDate: '6/25/2026', 
      submissions: 0, 
      feedback: 'Teacher feedback pending',
      status: 'OVERDUE' 
    },
    { 
      id: 3, 
      title: 'Real Numbers', 
      subject: 'Mathematics', 
      classInfo: 'Class 10 · A', 
      description: '',
      dueDate: '6/23/2026', 
      submissions: 0, 
      feedback: 'Teacher feedback pending',
      status: 'OVERDUE' 
    }
  ],
  '/school/assessments': [
    { 
      id: 1, 
      title: 'Test - 1', 
      subject: 'Science', 
      classInfo: 'Class 10', 
      maxMarks: 100, 
      timeAllowed: '120 mins', 
      status: 'Submitted online',
      type: 'Topic Test',
      date: '6/20/2026',
      score: 70
    },
    { 
      id: 2, 
      title: 'Real Numbers', 
      subject: 'Mathematics', 
      classInfo: 'Class 10', 
      maxMarks: 100, 
      timeAllowed: '120 mins', 
      status: 'Submitted online',
      type: 'Topic Test',
      date: '6/18/2026',
      score: 50
    },
    { 
      id: 3, 
      title: 'Term 1 Mock Exam', 
      subject: 'Science', 
      classInfo: 'Class 10', 
      maxMarks: 100, 
      timeAllowed: '180 mins', 
      status: 'Pending',
      type: 'Mock Test'
    }
  ],
  '/school/career/explore': [
    { id: 1, title: 'Software Engineering', field: 'Engineering & Tech', matchPercentage: 98, salaryRange: '$80k - $150k', reqEducation: 'Bachelors', isTopMatch: true },
    { id: 2, title: 'Data Science', field: 'Engineering & Tech', matchPercentage: 92, salaryRange: '$90k - $160k', reqEducation: 'Bachelors/Masters', isTopMatch: true },
    { id: 3, title: 'Biomedical Research', field: 'Medical & Sciences', matchPercentage: 75, salaryRange: '$60k - $120k', reqEducation: 'Masters/PhD', isTopMatch: false }
  ],
  '/school/career-guidance': {
    profileComplete: true,
    type: 'Investigative + Social',
    completedDate: '09/06/2026',
    retakeUnlockedIn: '2mo 1d 23h 50m 38s',
    academicProfile: [
      { subject: 'Science', score: 70, grade: 'B' },
      { subject: 'Mathematics', score: 50, grade: 'D' }
    ],
    needsWork: 'Mathematics',
    reportGeneratedDate: '09/06/2026',
    topMatches: [
      { name: 'Medicine (MBBS/BDS)', score: 70 },
      { name: 'Psychology / Counselling', score: 64 },
      { name: 'Entrepreneurship / Business', score: 58 }
    ]
  },
  '/school/profile/me': {
    firstName: 'Pratap',
    lastName: 'Das',
    classId: { name: 'Class 10 - A' },
    rollNumber: '24'
  },
  '/school/attendance/me': {
    percentage: 92,
    status: 'Good'
  },
  '/school/analytics/me': {
    score: 85,
    trend: '+5%'
  },
  '/school/gamification/quiz-rush/leaderboard': [
    { id: 1, studentName: 'Alice', points: 1500 },
    { id: 2, studentName: 'Bob', points: 1200 },
    { id: 3, studentName: 'Charlie', points: 1100 }
  ],
  '/school/calendar/events': [
    { id: 1, title: 'Science Fair', date: 'Oct 15' },
    { id: 2, title: 'Parent-Teacher Meeting', date: 'Oct 20' }
  ],
  '/assessments/topics/general-topic-id/pyqs/overview': [
    { id: '1', title: 'CBSE Board Paper 2024', subject: 'Science', year: '2024', difficulty: 'Medium' },
    { id: '2', title: 'Sample Paper Set A', subject: 'Mathematics', year: '2023', difficulty: 'Hard' },
    { id: '3', title: 'CBSE Board Paper 2022', subject: 'English', year: '2022', difficulty: 'Easy' },
    { id: '4', title: 'Term 2 Final Exam', subject: 'History', year: '2021', difficulty: 'Medium' },
    { id: '5', title: 'Previous Year Paper', subject: 'Science', year: '2020', difficulty: 'Hard' },
    { id: '6', title: 'Mid-Term Exam', subject: 'Mathematics', year: '2019', difficulty: 'Easy' }
  ],
  '/school/notices/platform': [
    { id: 1, title: 'Holiday Announcement', date: 'Today' },
    { id: 2, title: 'Library Renovation', date: 'Yesterday' }
  ],
  '/school/notifications': [
    { id: '1', title: 'New Grade Posted', message: 'You received an A in Advanced Physics.', time: '10 mins ago', type: 'academic', read: false },
    { id: '2', title: 'Upcoming Event', message: 'Science Fair is happening this Friday!', time: '2 hours ago', type: 'event', read: false },
    { id: '3', title: 'System Update', message: 'The app will be down for maintenance at midnight.', time: '1 day ago', type: 'system', read: true },
    { id: '4', title: 'Assignment Due', message: 'Calculus assignment is due tomorrow.', time: '1 day ago', type: 'academic', read: true }
  ],
  '/school/study-plans/today': {
    stats: { completion: 33, estTime: 120 },
    items: [
      { id: 't1', title: 'Calculus Fundamentals', type: 'lecture', status: 'completed', content: { subjectName: 'Mathematics', topicName: 'Limits' }, estimatedMinutes: 45, xpReward: 50 },
      { id: 't2', title: 'Quadratic Equations Practice', type: 'practice', status: 'pending', content: { subjectName: 'Mathematics', topicName: 'Polynomials' }, estimatedMinutes: 30, xpReward: 40 },
      { id: 't3', title: 'Cell Biology Notes', type: 'revision', status: 'pending', content: { subjectName: 'Biology', topicName: 'Cell Structure' }, estimatedMinutes: 20, xpReward: 25 },
      { id: 't4', title: 'Physics Mini-Mock', type: 'mock_test', status: 'pending', content: { subjectName: 'Physics', topicName: 'Kinematics' }, estimatedMinutes: 25, xpReward: 100 }
    ]
  },
  '/school/study-plans/backlogs': {
    missedTasks: 55, videoLectures: 11, notes: 0, mindmaps: 21, pyqs: 14, dpps: 8
  },
  '/school/study-plans/weak-topics': {
    weakChapters: 3, lowAccuracy: 12, forgotten: 5, highNegative: 2
  },
  '/school/study-plans/revision': {
    spacedRepetition: 8, intensiveRevisionLocked: true, aiRevisionNotes: 1, practiceHistory: 14
  },
  '/school/study-plans/roadmap': [
    { subject: 'Democratic Politics', chapters: 5, completedTopics: 0, totalTopics: 20 },
    { subject: 'Economics', chapters: 5, completedTopics: 0, totalTopics: 22 },
    { subject: 'English', chapters: 2, completedTopics: 0, totalTopics: 18 },
    { subject: 'Mathematics', chapters: 14, completedTopics: 0, totalTopics: 82 },
    { subject: 'Science', chapters: 16, completedTopics: 0, totalTopics: 94 }
  ]
};

export const fetchApi = async (endpoint: string, options: RequestInit = {}, isAiEngine = false) => {
  const baseUrl = isAiEngine ? AI_BASE_URL : BASE_URL;
  const url = `${baseUrl}${endpoint}`;
  
  const token = await getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'API Error');
    }

    return await response.json();
  } catch (error) {
    // Return mock data if available
    if (mockData[endpoint]) {
      return new Promise(resolve => setTimeout(() => resolve(mockData[endpoint]), 800));
    }
    
    // For parameterized routes in mockData
    if (endpoint.startsWith('/school/career/explore/')) {
       return new Promise(resolve => setTimeout(() => resolve(mockData['/school/career/explore'][0]), 800));
    }
    if (endpoint.startsWith('/school/doubts/')) {
       return new Promise(resolve => setTimeout(() => resolve(mockData['/school/doubts'][0]), 800));
    }

    console.warn(`API Error (${endpoint}):`, error);
    throw error;
  }
};

export const schoolApi = {
  // --- AUTH ---
  login: (data: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => { currentToken = ''; return Promise.resolve(); },

  // --- CORE SYSTEM ---
  getProfile: () => fetchApi('/school/students/dashboard'),
  getMyProfile: () => fetchApi('/school/profile/me'),
  getAttendance: () => fetchApi('/school/attendance/me'),
  getMyAnalytics: () => fetchApi('/school/analytics/me'),
  
  getCareers: () => fetchApi('/school/career/explore'),
  getCareerGuidance: () => fetchApi('/school/career-guidance'),
  saveCareer: (id: string) => fetchApi(`/school/career/${id}/save`, { method: 'POST' }),

  createStudent: (data: any) => fetchApi('/school/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: any) => fetchApi(`/school/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent: (id: string) => fetchApi(`/school/students/${id}`, { method: 'DELETE' }),
  getStudent: (id: string) => fetchApi(`/school/students/${id}`),

  // --- ASSIGNMENTS & ASSESSMENTS (Shared) ---
  getAssignments: () => fetchApi('/school/assignments'),
  getAssessments: () => fetchApi('/school/assessments'),
  
  // --- LEARN TAB (Shared) ---
  getRecordings: () => fetchApi('/school/classes/recordings'),
  getMaterials: () => fetchApi('/school/materials'),
  getMaterialDetails: (id: string) => fetchApi(`/school/materials/${id}`),
  downloadMaterial: (id: string) => fetchApi(`/school/materials/${id}/download`),
  getDoubts: () => fetchApi('/school/doubts'),
  startAiTutor: (data: any) => fetchApi('/tutor/session', { method: 'POST', body: JSON.stringify(data) }, true),

  // --- DISCOVER TAB (Shared) ---
  getEvents: () => fetchApi('/school/calendar/events'),
  getPlatformNotices: () => fetchApi('/school/notices/platform'),
  
  // --- NOTIFICATIONS ---
  getNotifications: () => fetchApi('/school/notifications'),
  getUnreadNotificationsCount: () => fetchApi('/school/notifications/unread-count'),
  markNotificationRead: (id: string) => fetchApi(`/school/notifications/${id}/read`, { method: 'PATCH' }),

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
  getDoubtDetails: (id: string) => fetchApi(`/school/doubts/${id}`),
  getDoubtStats: () => fetchApi('/school/doubts/stats'),
  createDoubt: (data: any) => fetchApi('/school/doubts', { method: 'POST', body: JSON.stringify(data) }),
  getMyDoubts: () => fetchApi('/school/doubts/my-doubts'),
  replyToDoubt: (id: string, data: any) => fetchApi(`/school/doubts/${id}/reply`, { method: 'POST', body: JSON.stringify(data) }),
  resolveDoubt: (id: string) => fetchApi(`/school/doubts/${id}/resolve`, { method: 'PATCH' }),

  // --- CLASSES ---
  getClasses: () => fetchApi('/school/classes'),
  getClassDetails: (id: string) => fetchApi(`/school/classes/${id}`),
  getClassSubjects: (id: string) => fetchApi(`/school/classes/${id}/subjects`),
  getClassTeachers: (id: string) => fetchApi(`/school/classes/${id}/teachers`),
  getClassStudents: (id: string) => fetchApi(`/school/classes/${id}/students`),

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
  completeStudyPlanItem: (id: string) => fetchApi(`/school/study-plans/items/${id}/complete`, { method: 'POST' }),
  skipStudyPlanItem: (id: string) => fetchApi(`/school/study-plans/items/${id}/skip`, { method: 'POST' }),
  getSpacedRevision: () => fetchApi('/school/study-plans/revision/spaced'),
  getIntensiveRevision: () => fetchApi('/school/study-plans/revision/intensive'),
  getNotesRevision: () => fetchApi('/school/study-plans/revision/notes'),
  getPracticeRevision: () => fetchApi('/school/study-plans/revision/practice'),
  startRevisionSession: (data: any) => fetchApi('/school/study-plans/revision/start', { method: 'POST', body: JSON.stringify(data) }),
};
"""

with open('src/utils/api.ts', 'w') as f:
    f.write(clean_api)

print("api.ts completely rewritten")
