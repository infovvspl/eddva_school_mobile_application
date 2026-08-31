import json
import re

with open('src/utils/api.ts', 'r') as f:
    content = f.read()

# Add missing methods to schoolApi
if 'getCareerGuidance:' not in content:
    content = content.replace('  getCareers: () => fetchApi(\'/school/career/explore\'),', 
                              '  getCareers: () => fetchApi(\'/school/career/explore\'),\n  getCareerGuidance: () => fetchApi(\'/school/career-guidance\'),\n  getMyProfile: () => fetchApi(\'/school/profile/me\'),\n  getAttendance: () => fetchApi(\'/school/attendance/me\'),\n  getMyAnalytics: () => fetchApi(\'/school/analytics/me\'),')

if 'getMemoryMatchDecks:' not in content:
    # Append to the end of schoolApi
    content = content.replace('};\n', '''
  // Memory Match
  getMemoryMatchDecks: () => fetchApi('/school/gamification/memory-match/decks'),
  startMemoryMatch: () => fetchApi('/school/gamification/memory-match/start'),
  submitMemoryMatch: (data: any) => fetchApi('/school/gamification/memory-match/submit', { method: 'POST', body: JSON.stringify(data) }),
  getMemoryMatchLeaderboard: () => fetchApi('/school/gamification/memory-match/leaderboard'),

  // Math Sprint
  startMathSprint: () => fetchApi('/school/gamification/math-sprint/start'),
  submitMathSprint: (data: any) => fetchApi('/school/gamification/math-sprint/submit', { method: 'POST', body: JSON.stringify(data) }),
  getMathSprintLeaderboard: () => fetchApi('/school/gamification/math-sprint/leaderboard'),

  // Word Master
  getWordMasterDecks: () => fetchApi('/school/gamification/word-master/decks'),
  startWordMaster: () => fetchApi('/school/gamification/word-master/start'),
  submitWordMaster: (data: any) => fetchApi('/school/gamification/word-master/submit', { method: 'POST', body: JSON.stringify(data) }),
  getWordMasterLeaderboard: () => fetchApi('/school/gamification/word-master/leaderboard'),

  // --- CLASSES ---
  getClasses: () => fetchApi('/school/classes'),
  getClassDetails: (id: string) => fetchApi(`/school/classes/${id}`),
  getClassSubjects: (id: string) => fetchApi(`/school/classes/${id}/subjects`),
  getClassTeachers: (id: string) => fetchApi(`/school/classes/${id}/teachers`),
  getClassStudents: (id: string) => fetchApi(`/school/classes/${id}/students`),
};
''')

with open('src/utils/api.ts', 'w') as f:
    f.write(content)

print("api.ts patched")
