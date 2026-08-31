# School Vertical - Exhaustive Role-Wise API Reference

This document lists all **343 backend routes** detected across the school NestJS controllers, grouped by roles and modules to aid in mobile application development.

---

## 1. Super Admin Portal (0 Endpoints)

*No endpoints in this group.*

## 2. Parent Portal (20 Endpoints)

| Method | Route | Function / DTO |
| :--- | :--- | :--- |
| `GET` | `/school/parent/profile` | **Func**: `getProfile` |
| `PUT` | `/school/parent/profile` | **Func**: `updateProfile` |
| `GET` | `/school/parent/students` | **Func**: `getChildren` |
| `GET` | `/school/parent/students/:id/summary` | **Func**: `getSummary` |
| `GET` | `/school/parent/students/:id/attendance` | **Func**: `getAttendance` |
| `POST` | `/school/parent/students/:id/leave-request` | **Func**: `submitLeaveRequest` |
| `GET` | `/school/parent/students/:id/marks` | **Func**: `getMarks` |
| `GET` | `/school/parent/students/:id/homework` | **Func**: `getHomework` |
| `GET` | `/school/parent/students/:id/tests` | **Func**: `getTests` |
| `GET` | `/school/parent/teachers` | **Func**: `getTeachers` |
| `GET` | `/school/parent/chat/:teacherId` | **Func**: `getChat` |
| `POST` | `/school/parent/chat/:teacherId` | **Func**: `sendMessage` |
| `GET` | `/school/parent/meeting-requests` | **Func**: `getMeetingRequests` |
| `POST` | `/school/parent/meeting-requests` | **Func**: `createMeetingRequest` |
| `DELETE` | `/school/parent/meeting-requests/:id` | **Func**: `cancelMeetingRequest` |
| `GET` | `/school/parent/grievances` | **Func**: `getGrievances` |
| `POST` | `/school/parent/grievances` | **Func**: `submitGrievance` |
| `PUT` | `/school/parent/grievances/:id/reopen` | **Func**: `reopenGrievance` |
| `GET` | `/school/parent/notifications` | **Func**: `getNotifications` |
| `PUT` | `/school/parent/notifications/read` | **Func**: `markRead` |

## 3. Student Portal (36 Endpoints)

| Method | Route | Function / DTO |
| :--- | :--- | :--- |
| `GET` | `/school/attendance/class/:classId/students` | **Func**: `getStudentsByClass` |
| `GET` | `/school/attendance/students` | **Func**: `getStudentsByClassAndSection` |
| `GET` | `/school/gamification/quiz-rush/start` | **Func**: `startQuizRush` |
| `POST` | `/school/gamification/quiz-rush/submit` | **Func**: `submitQuizRush` |
| `GET` | `/school/gamification/quiz-rush/leaderboard` | **Func**: `quizRushLeaderboard` |
| `GET` | `/school/gamification/treasure/maps` | **Func**: `getTreasureMaps` |
| `GET` | `/school/gamification/treasure/challenge` | **Func**: `getTreasureChallenge` |
| `POST` | `/school/gamification/treasure/complete` | **Func**: `completeTreasureStage` |
| `GET` | `/school/gamification/math-sprint/start` | **Func**: `startMathSprint` |
| `POST` | `/school/gamification/math-sprint/submit` | **Func**: `submitMathSprint` |
| `GET` | `/school/gamification/math-sprint/leaderboard` | **Func**: `mathSprintLeaderboard` |
| `GET` | `/school/gamification/memory-match/decks` | **Func**: `getMemoryMatchDecks` |
| `GET` | `/school/gamification/memory-match/start` | **Func**: `startMemoryMatch` |
| `POST` | `/school/gamification/memory-match/submit` | **Func**: `submitMemoryMatch` |
| `GET` | `/school/gamification/memory-match/leaderboard` | **Func**: `memoryMatchLeaderboard` |
| `GET` | `/school/gamification/word-master/decks` | **Func**: `getWordMasterDecks` |
| `GET` | `/school/gamification/word-master/start` | **Func**: `startWordMaster` |
| `POST` | `/school/gamification/word-master/submit` | **Func**: `submitWordMaster` |
| `GET` | `/school/gamification/word-master/leaderboard` | **Func**: `wordMasterLeaderboard` |
| `GET` | `/school/reports/student` | **Func**: `studentReport` |
| `POST` | `/school/students/bulk-import` | **Func**: `bulkImport` |
| `POST` | `/school/students` | **Func**: `create` |
| `GET` | `/school/students/profile/me` | **Func**: `getMyProfile` |
| `GET` | `/school/students/stats` | **Func**: `stats` |
| `GET` | `/school/students` | **Func**: `list` |
| `GET` | `/school/students/courses/my` | **Func**: `myCourses` |
| `GET` | `/school/students/dashboard` | **Func**: `dashboard` |
| `GET` | `/school/students/courses/:classId` | **Func**: `courseCurriculum` |
| `GET` | `/school/students/:id` | **Func**: `findOne` |
| `PUT` | `/school/students/:id` | **Func**: `update` |
| `DELETE` | `/school/students/:id` | **Func**: `remove` |
| `POST` | `/school/students/:id/send-credentials` | **Func**: `sendParentCredentials` |
| `GET` | `/school/student-promotions/overview` | **Func**: `overview` |
| `GET` | `/school/student-promotions/sections/:sectionId/students` | **Func**: `sectionStudents` |
| `POST` | `/school/student-promotions/promote` | **Func**: `promote` |
| `GET` | `/school/timetables/student/me` | **Func**: `getStudentTimetable` |

## 4. Teacher Portal (42 Endpoints)

| Method | Route | Function / DTO |
| :--- | :--- | :--- |
| `GET` | `/school/assessments` | **Func**: `list` |
| `GET` | `/school/assessments/mock-tests` | **Func**: `legacyMockTests` |
| `GET` | `/school/assessments/sessions` | **Func**: `listSessions` |
| `POST` | `/school/assessments/ai-generate` | **Func**: `aiGenerate` |
| `POST` | `/school/assessments/translate` | **Func**: `translate` |
| `POST` | `/school/assessments` | **Func**: `create` |
| `GET` | `/school/assessments/:id/my-submission` | **Func**: `mySubmission` |
| `POST` | `/school/assessments/:id/start` | **Func**: `startAttempt` |
| `POST` | `/school/assessments/:id/answer` | **Func**: `saveAnswer` |
| `POST` | `/school/assessments/:id/submit` | **Func**: `submit` |
| `GET` | `/school/assessments/:id/submissions` | **Func**: `listSubmissions` |
| `GET` | `/school/assessments/:id` | **Func**: `findOne` |
| `PUT` | `/school/assessments/:id` | **Func**: `update` |
| `DELETE` | `/school/assessments/:id` | **Func**: `remove` |
| `GET` | `/school/assessments/:id/results` | **Func**: `listResults` |
| `POST` | `/school/assessments/results` | **Func**: `saveResult` |
| `GET` | `/school/assignments` | **Func**: `list` |
| `GET` | `/school/assignments/submissions/inbox` | **Func**: `listInbox` |
| `POST` | `/school/assignments/upload-url` | **Func**: `presignUpload` |
| `POST` | `/school/assignments/ai-generate` | **Func**: `aiGenerate` |
| `POST` | `/school/assignments/from-image` | **Func**: `fromImage` |
| `POST` | `/school/assignments` | **Func**: `create` |
| `POST` | `/school/assignments/:id/submit` | **Func**: `submit` |
| `GET` | `/school/assignments/:id/submissions` | **Func**: `getSubmissions` |
| `POST` | `/school/assignments/:id/submissions/:submissionId/grade` | **Func**: `gradeSubmission` |
| `GET` | `/school/assignments/submissions/:submissionId/file` | **Func**: `getSubmissionFile` |
| `GET` | `/school/assignments/:id` | **Func**: `findOne` |
| `PUT` | `/school/assignments/:id` | **Func**: `update` |
| `DELETE` | `/school/assignments/:id` | **Func**: `remove` |
| `GET` | `/school/reports/teacher/class` | **Func**: `teacherClassReport` |
| `GET` | `/school/subjects/teacher/:teacherId` | **Func**: `listTeacherSubjects` |
| `POST` | `/school/subjects/teacher` | **Func**: `assignTeacherSubject` |
| `POST` | `/school/teachers/bulk-import` | **Func**: `bulkImport` |
| `POST` | `/school/teachers` | **Func**: `create` |
| `GET` | `/school/teachers/stats` | **Func**: `stats` |
| `GET` | `/school/teachers` | **Func**: `list` |
| `GET` | `/school/teachers/:teacherId/recordings/summary` | **Func**: `recordingsSummary` |
| `GET` | `/school/teachers/:teacherId/recordings` | **Func**: `recordings` |
| `POST` | `/school/teachers/:teacherId/recordings/:recordingId/analyze` | **Func**: `analyzeRecording` |
| `GET` | `/school/teachers/:id` | **Func**: `findOne` |
| `PUT` | `/school/teachers/:id` | **Func**: `update` |
| `DELETE` | `/school/teachers/:id` | **Func**: `remove` |

## 5. School/Institute Admin Portal (17 Endpoints)

| Method | Route | Function / DTO |
| :--- | :--- | :--- |
| `GET` | `/school/admin/audit-logs/actors` | **Func**: `getActors` |
| `GET` | `/school/admin/audit-logs` | **Func**: `list` |
| `POST` | `/school/admin/audit-logs` | **Func**: `createLog` |
| `GET` | `/school/admin/users` | **Func**: `listUsers` |
| `GET` | `/school/admin/stats` | **Func**: `adminStats` |
| `GET` | `/school/institutes/tenant/current` | **Func**: `getCurrentTenant` |
| `GET` | `/school/institutes/tenant/:tenantDomain` | **Func**: `getByTenant` |
| `POST` | `/school/institutes` | **Func**: `create` |
| `GET` | `/school/institutes` | **Func**: `list` |
| `GET` | `/school/institutes/:id` | **Func**: `findOne` |
| `PUT` | `/school/institutes/:id` | **Func**: `update` |
| `PUT` | `/school/institutes/:id/approve` | **Func**: `approve` |
| `PUT` | `/school/institutes/:id/reject` | **Func**: `reject` |
| `DELETE` | `/school/institutes/:id` | **Func**: `delete` |
| `GET` | `/school/admin/security/summary` | **Func**: `getSummary` |
| `GET` | `/school/admin/security/sessions` | **Func**: `getActiveSessions` |
| `DELETE` | `/school/admin/security/sessions/:sessionId` | **Func**: `forceLogout` |

## 6. General Academic & Content management (73 Endpoints)

| Method | Route | Function / DTO |
| :--- | :--- | :--- |
| `GET` | `/school/academic/classes` | **Func**: `listClasses` |
| `POST` | `/school/academic/classes` | **Func**: `createClass` |
| `PUT` | `/school/academic/classes/:id` | **Func**: `updateClass` |
| `DELETE` | `/school/academic/classes/:id` | **Func**: `deleteClass` |
| `GET` | `/school/academic/sections/:sectionId/teaching-map` | **Func**: `getSectionTeachingMap` |
| `GET` | `/school/academic/sections` | **Func**: `listSections` |
| `POST` | `/school/academic/sections` | **Func**: `createSection` |
| `PUT` | `/school/academic/sections/:id` | **Func**: `updateSection` |
| `DELETE` | `/school/academic/sections/:id` | **Func**: `deleteSection` |
| `GET` | `/school/academic/periods` | **Func**: `listPeriods` |
| `POST` | `/school/academic/periods` | **Func**: `createPeriod` |
| `PUT` | `/school/academic/periods/:id` | **Func**: `updatePeriod` |
| `DELETE` | `/school/academic/periods/:id` | **Func**: `deletePeriod` |
| `GET` | `/school/classes/recordings` | **Func**: `listRecordings` |
| `GET` | `/school/classes/recordings/:id/play-url` | **Func**: `getRecordingPlayUrl` |
| `POST` | `/school/classes/recordings/upload-url` | **Func**: `presignRecording` |
| `POST` | `/school/classes/recordings` | **Func**: `createRecording` |
| `POST` | `/school/classes/recordings/:id/retranscribe` | **Func**: `retranscribe` |
| `POST` | `/school/classes/recordings/:id/regenerate-notes` | **Func**: `regenerateNotes` |
| `POST` | `/school/classes/recordings/:id/regenerate-notes-images` | **Func**: `regenerateNotesImages` |
| `POST` | `/school/classes/recordings/:id/generate-quiz` | **Func**: `generateQuiz` |
| `GET` | `/school/classes/recordings/:id/quiz-analytics` | **Func**: `getQuizAnalytics` |
| `GET` | `/school/classes/recordings/:id/progress` | **Func**: `getRecordingProgress` |
| `POST` | `/school/classes/recordings/:id/progress` | **Func**: `upsertRecordingProgress` |
| `POST` | `/school/classes/recordings/:id/quiz-response` | **Func**: `submitQuizResponse` |
| `DELETE` | `/school/classes/recordings/:id` | **Func**: `removeRecording` |
| `POST` | `/school/classes/recordings/:id/thumbnail` | **Func**: `updateThumbnail` |
| `POST` | `/school/classes/recordings/:id/regenerate-thumbnail` | **Func**: `regenerateThumbnail` |
| `GET` | `/school/materials/proxy-pdf` | **Func**: `proxyPdf` |
| `GET` | `/school/materials` | **Func**: `list` |
| `POST` | `/school/materials/upload-url` | **Func**: `presignUpload` |
| `POST` | `/school/materials/ai-generate` | **Func**: `aiGenerate` |
| `POST` | `/school/materials/ai-save` | **Func**: `aiSave` |
| `GET` | `/school/materials/audit-data` | **Func**: `auditMaterialData` |
| `POST` | `/school/materials/dump` | **Func**: `dumpData` |
| `POST` | `/school/materials/migrations/ai-tags` | **Func**: `aiSlideImage` |
| `POST` | `/school/materials` | **Func**: `create` |
| `GET` | `/school/materials/:id/highlights` | **Func**: `getHighlights` |
| `POST` | `/school/materials/:id/highlights` | **Func**: `saveHighlight` |
| `PATCH` | `/school/materials/:id/highlights/:highlightId` | **Func**: `updateHighlight` |
| `DELETE` | `/school/materials/:id/highlights/:highlightId` | **Func**: `deleteHighlight` |
| `GET` | `/school/materials/:id` | **Func**: `findOne` |
| `PUT` | `/school/materials/:id` | **Func**: `update` |
| `DELETE` | `/school/materials/:id` | **Func**: `remove` |
| `GET` | `/school/subjects` | **Func**: `list` |
| `POST` | `/school/subjects` | **Func**: `create` |
| `PUT` | `/school/subjects/:id` | **Func**: `update` |
| `DELETE` | `/school/subjects/:id` | **Func**: `remove` |
| `GET` | `/school/subjects/class/:classId` | **Func**: `listClassSubjects` |
| `POST` | `/school/subjects/class` | **Func**: `addClassSubject` |
| `GET` | `/school/subjects` | **Func**: `list` |
| `POST` | `/school/subjects` | **Func**: `create` |
| `PUT` | `/school/subjects/:id` | **Func**: `update` |
| `DELETE` | `/school/subjects/:id` | **Func**: `remove` |
| `GET` | `/school/schedules` | **Func**: `listSchedules` |
| `POST` | `/school/schedules` | **Func**: `createSchedule` |
| `PUT` | `/school/schedules/:id` | **Func**: `updateSchedule` |
| `DELETE` | `/school/schedules/:id` | **Func**: `removeSchedule` |
| `GET` | `/school/timetables` | **Func**: `listTimetables` |
| `POST` | `/school/timetables` | **Func**: `createTimetable` |
| `PUT` | `/school/timetables/bulk/update` | **Func**: `bulkUpdate` |
| `GET` | `/school/timetables/:id` | **Func**: `findOneTimetable` |
| `PUT` | `/school/timetables/:id` | **Func**: `updateTimetable` |
| `DELETE` | `/school/timetables/:id` | **Func**: `removeTimetable` |
| `GET` | `/school/topics` | **Func**: `listTopics` |
| `POST` | `/school/topics` | **Func**: `createTopic` |
| `PUT` | `/school/topics/:id` | **Func**: `updateTopic` |
| `DELETE` | `/school/topics/:id` | **Func**: `deleteTopic` |
| `GET` | `/school/topics/chapters` | **Func**: `listChapters` |
| `POST` | `/school/topics/bulk-import` | **Func**: `bulkImport` |
| `POST` | `/school/topics/chapters` | **Func**: `createChapter` |
| `PUT` | `/school/topics/chapters/:id` | **Func**: `updateChapter` |
| `DELETE` | `/school/topics/chapters/:id` | **Func**: `deleteChapter` |

## 7. Shared / Infrastructure Endpoints (155 Endpoints)

| Method | Route | Function / DTO |
| :--- | :--- | :--- |
| `GET` | `/school/ai-usage/overview` | **Func**: `overview` |
| `GET` | `/school/ai-usage/by-feature` | **Func**: `byFeature` |
| `GET` | `/school/ai-usage/trend` | **Func**: `trend` |
| `GET` | `/school/ai-usage/by-institute` | **Func**: `byInstitute` |
| `GET` | `/school/ai-usage/me` | **Func**: `me` |
| `GET` | `/school/ai-usage/quotas` | **Func**: `getQuotas` |
| `POST` | `/school/ai-usage/quotas` | **Func**: `setQuota` |
| `DELETE` | `/school/ai-usage/quotas` | **Func**: `deleteQuota` |
| `GET` | `/school/ai-usage/logs` | **Func**: `getRawLogs` |
| `GET` | `/school/ai-usage/debug` | **Func**: `debug` |
| `POST` | `/school/attendance` | **Func**: `mark` |
| `GET` | `/school/attendance` | **Func**: `get` |
| `POST` | `/school/attendance/session` | **Func**: `markSession` |
| `GET` | `/school/attendance/report` | **Func**: `getReport` |
| `GET` | `/school/attendance/dashboard-stats` | **Func**: `getDashboardStats` |
| `GET` | `/school/attendance/history` | **Func**: `getHistory` |
| `GET` | `/school/attendance/session/check` | **Func**: `checkSession` |
| `GET` | `/school/attendance/session/:sessionId` | **Func**: `getSessionDetails` |
| `POST` | `/school/auth/login` | **Func**: `login` |
| `POST` | `/school/auth/register` | **Func**: `register` |
| `POST` | `/school/auth/register-user` | **Func**: `registerUser` |
| `GET` | `/school/auth/me` | **Func**: `getMe` |
| `GET` | `/school/auth/logout` | **Func**: `logout` |
| `GET` | `/school/calendar/events` | **Func**: `getEvents` |
| `GET` | `/school/career/quiz/questions` | **Func**: `quizQuestions` |
| `GET` | `/school/career/quiz/status` | **Func**: `quizStatus` |
| `POST` | `/school/career/quiz/submit` | **Func**: `submitQuiz` |
| `POST` | `/school/career/report/generate` | **Func**: `generateReport` |
| `GET` | `/school/career/report` | **Func**: `report` |
| `GET` | `/school/career/explore` | **Func**: `explore` |
| `GET` | `/school/career/explore/:careerId` | **Func**: `exploreOne` |
| `GET` | `/school/chat/conversations` | **Func**: `getConversations` |
| `GET` | `/school/chat/users` | **Func**: `getUsers` |
| `GET` | `/school/chat/messages/:peerId` | **Func**: `getMessagesByPeer` |
| `PATCH` | `/school/chat/messages/:peerId/read` | **Func**: `markRead` |
| `GET` | `/school/chat/rooms` | **Func**: `listRooms` |
| `POST` | `/school/chat/rooms` | **Func**: `createRoom` |
| `POST` | `/school/chat/rooms/:id/join` | **Func**: `joinRoom` |
| `GET` | `/school/chat/rooms/:id/messages` | **Func**: `getMessages` |
| `GET` | `/school/chat/directory` | **Func**: `getParentDirectory` |
| `POST` | `/school/chat/messages` | **Func**: `sendMessage` |
| `PATCH` | `/school/chat/messages/:messageId/edit` | **Func**: `editMessage` |
| `DELETE` | `/school/chat/messages/:messageId` | **Func**: `deleteMessage` |
| `GET` | `/school/complaints` | **Func**: `list` |
| `POST` | `/school/complaints` | **Func**: `create` |
| `GET` | `/school/complaints/:id/messages` | **Func**: `listMessages` |
| `POST` | `/school/complaints/:id/messages` | **Func**: `createMessage` |
| `GET` | `/school/complaints/:id` | **Func**: `findOne` |
| `PUT` | `/school/complaints/:id` | **Func**: `update` |
| `DELETE` | `/school/complaints/:id` | **Func**: `remove` |
| `GET` | `/school/dashboard/stats` | **Func**: `stats` |
| `GET` | `/school/search` | **Func**: `search` |
| `GET` | `/school/doubts/context` | **Func**: `getContext` |
| `GET` | `/school/doubts` | **Func**: `list` |
| `POST` | `/school/doubts` | **Func**: `create` |
| `POST` | `/school/doubts/upload-url` | **Func**: `presignUpload` |
| `GET` | `/school/doubts/:id` | **Func**: `findOne` |
| `POST` | `/school/doubts/:id/escalate` | **Func**: `escalate` |
| `PATCH` | `/school/doubts/:id/helpful` | **Func**: `markHelpful` |
| `POST` | `/school/doubts/:id/ai-suggest` | **Func**: `aiSuggest` |
| `POST` | `/school/doubts/:id/respond` | **Func**: `respond` |
| `GET` | `/school/events` | **Func**: `list` |
| `POST` | `/school/events` | **Func**: `create` |
| `GET` | `/school/events/:id` | **Func**: `findOne` |
| `PUT` | `/school/events/:id` | **Func**: `update` |
| `DELETE` | `/school/events/:id` | **Func**: `remove` |
| `GET` | `/school/fees` | **Func**: `list` |
| `POST` | `/school/fees` | **Func**: `create` |
| `GET` | `/school/fees/:id` | **Func**: `findOne` |
| `PUT` | `/school/fees/:id` | **Func**: `update` |
| `DELETE` | `/school/fees/:id` | **Func**: `remove` |
| `GET` | `/school/grievances` | **Func**: `list` |
| `POST` | `/school/grievances` | **Func**: `create` |
| `GET` | `/school/grievances/:id/messages` | **Func**: `listMessages` |
| `POST` | `/school/grievances/:id/messages` | **Func**: `createMessage` |
| `GET` | `/school/grievances/:id` | **Func**: `findOne` |
| `PUT` | `/school/grievances/:id` | **Func**: `update` |
| `DELETE` | `/school/grievances/:id` | **Func**: `remove` |
| `POST` | `/school/live/lectures` | **Func**: `create` |
| `GET` | `/school/live/lectures` | **Func**: `list` |
| `GET` | `/school/live/lectures/live` | **Func**: `live` |
| `DELETE` | `/school/live/lectures/:id` | **Func**: `delete` |
| `POST` | `/school/live/lectures/:id/end` | **Func**: `end` |
| `GET` | `/school/live/lectures/:id/stream-url` | **Func**: `streamUrl` |
| `GET` | `/school/live/lectures/:id/chat` | **Func**: `chat` |
| `GET` | `/school/live/lectures/:id/participants/active` | **Func**: `activeParticipants` |
| `POST` | `/school/live/lectures/:id/hand` | **Func**: `hand` |
| `GET` | `/school/live/lectures/:id/stats` | **Func**: `stats` |
| `POST` | `/school/live/lectures/:id/polls` | **Func**: `createPoll` |
| `POST` | `/school/live/lectures/:id/polls/:pollId/end` | **Func**: `endPoll` |
| `GET` | `/school/live/lectures/:id/polls/active` | **Func**: `activePoll` |
| `POST` | `/school/live/lectures/:id/polls/:pollId/vote` | **Func**: `votePoll` |
| `GET` | `/school/live/lectures/:id/polls` | **Func**: `listPolls` |
| `POST` | `/school/live/validate` | **Func**: `validate` |
| `POST` | `/school/live/ended` | **Func**: `ended` |
| `GET` | `/school/live/hls/:streamKey/:file` | **Func**: `hls` |
| `GET` | `/school/meetings` | **Func**: `list` |
| `GET` | `/school/meetings/options` | **Func**: `getOptions` |
| `POST` | `/school/meetings` | **Func**: `create` |
| `PATCH` | `/school/meetings/:id/status` | **Func**: `updateStatus` |
| `GET` | `/school/notices/platform` | **Func**: `listPlatform` |
| `POST` | `/school/notices/broadcast` | **Func**: `broadcast` |
| `GET` | `/school/notices` | **Func**: `list` |
| `POST` | `/school/notices` | **Func**: `create` |
| `GET` | `/school/notices/:id` | **Func**: `findOne` |
| `PUT` | `/school/notices/:id` | **Func**: `update` |
| `DELETE` | `/school/notices/:id` | **Func**: `remove` |
| `GET` | `/school/notifications` | **Func**: `list` |
| `GET` | `/school/notifications/unread-count` | **Func**: `getUnreadCount` |
| `POST` | `/school/notifications` | **Func**: `create` |
| `PUT` | `/school/notifications/read-all` | **Func**: `markAllAsReadPut` |
| `PATCH` | `/school/notifications/read-all` | **Func**: `markAllAsReadPatch` |
| `PATCH` | `/school/notifications/bulk-read` | **Func**: `bulkRead` |
| `DELETE` | `/school/notifications/bulk-delete` | **Func**: `bulkDelete` |
| `GET` | `/school/notifications/preferences` | **Func**: `getPreferences` |
| `PUT` | `/school/notifications/preferences` | **Func**: `updatePreferences` |
| `GET` | `/school/notifications/:id` | **Func**: `findOne` |
| `PUT` | `/school/notifications/:id` | **Func**: `update` |
| `PUT` | `/school/notifications/:id/read` | **Func**: `markReadPut` |
| `PATCH` | `/school/notifications/:id/read` | **Func**: `markReadPatch` |
| `DELETE` | `/school/notifications/:id` | **Func**: `remove` |
| `POST` | `/school/ppt/generate` | **Func**: `generate` |
| `POST` | `/school/ppt/regenerate-slide` | **Func**: `regenerate` |
| `POST` | `/school/ppt/search-image` | **Func**: `searchImage` |
| `GET` | `/school/ppt/proxy-image` | **Func**: `proxyImage` |
| `GET` | `/school/recordings/:recordingId/highlights` | **Func**: `getHighlights` |
| `POST` | `/school/recordings/:recordingId/highlights` | **Func**: `createHighlight` |
| `DELETE` | `/school/recordings/:recordingId/highlights/:highlightId` | **Func**: `deleteHighlight` |
| `GET` | `/school/reports/class` | **Func**: `classReport` |
| `GET` | `/school/reports/my-analytics` | **Func**: `myAnalytics` |
| `GET` | `/school/reports/assessment` | **Func**: `assessmentReport` |
| `GET` | `/school/topics/:topicId/study-status` | **Func**: `getStudyStatus` |
| `GET` | `/school/ai-study/history` | **Func**: `getAiStudyHistory` |
| `GET` | `/school/topics/:topicId/ai-study/session` | **Func**: `getAiStudySession` |
| `POST` | `/school/topics/:topicId/ai-study/start` | **Func**: `startAiStudy` |
| `POST` | `/school/topics/:topicId/ai-study/:sessionId/ask` | **Func**: `askAiQuestion` |
| `PATCH` | `/school/topics/:topicId/ai-study/:sessionId/complete` | **Func**: `completeAiStudy` |
| `PATCH` | `/school/topics/:topicId/ai-study/:sessionId/save-notes` | **Func**: `saveAiStudyNotes` |
| `POST` | `/school/topics/:topicId/ai-quiz/generate` | **Func**: `generateAiQuiz` |
| `POST` | `/school/topics/:topicId/ai-quiz/complete` | **Func**: `completeAiQuiz` |
| `GET` | `/school/study-plans/courses` | **Func**: `getCourses` |
| `POST` | `/school/study-plans/generate` | **Func**: `generate` |
| `POST` | `/school/study-plans/regenerate` | **Func**: `regenerate` |
| `POST` | `/school/study-plans/clear` | **Func**: `clear` |
| `GET` | `/school/study-plans/today` | **Func**: `getToday` |
| `GET` | `/school/study-plans` | **Func**: `getRange` |
| `PATCH` | `/school/study-plans/items/:itemId/complete` | **Func**: `completeItem` |
| `PATCH` | `/school/study-plans/items/:itemId/skip` | **Func**: `skipItem` |
| `GET` | `/school/study-plans/next-action` | **Func**: `getNextAction` |
| `GET` | `/school/study-plans/revision/spaced` | **Func**: `getRevisionSpaced` |
| `GET` | `/school/study-plans/revision/intensive` | **Func**: `getRevisionIntensive` |
| `GET` | `/school/study-plans/revision/notes` | **Func**: `getRevisionNotes` |
| `GET` | `/school/study-plans/revision/practice` | **Func**: `getRevisionPractice` |
| `POST` | `/school/study-plans/revision-session` | **Func**: `startRevisionSession` |
| `POST` | `/school/study-plans/revision-session/complete` | **Func**: `completeRevisionSession` |


## 8. AI Engine Endpoints (Django Service - 45 Endpoints)

These represent the core AI endpoints hosted by the python AI vertical that the NestJS backend bridges to or that are queried directly for AI tasks.

| Method | AI Route (Base Url: AI_BASE_URL) | Target Handler | Primary Role / Context |
| :--- | :--- | :--- | :--- |
| `POST` | `/doubt/resolve` | `bridge.resolve_doubt` | **Student** |
| `POST` | `/doubt/ocr-image` | `bridge.ocr_doubt_image` | **Student** |
| `POST` | `/tutor/session` | `bridge.start_tutor_session` | **Student** |
| `POST` | `/tutor/continue` | `bridge.continue_tutor_session` | **Student** |
| `POST` | `/recommend/content` | `bridge.recommend_content` | **Student** |
| `POST` | `/stt/notes` | `bridge.generate_stt_notes` | **Teacher** |
| `POST` | `/stt/transcribe` | `bridge.stt_transcribe_only` | **Teacher** |
| `POST` | `/stt/notes-from-text` | `bridge.generate_notes_from_transcript` | **Teacher** |
| `POST` | `/stt/notes-from-youtube` | `bridge.generate_notes_from_youtube` | **Teacher** |
| `POST` | `/stt/regenerate-note-image` | `bridge.regenerate_single_note_image` | **Teacher** |
| `POST` | `/stt/extract-image-terms` | `bridge.extract_image_search_terms` | **Teacher** |
| `POST` | `/search/educational-images` | `bridge.search_educational_images` | **General / Integrated** |
| `POST` | `/feedback/generate` | `bridge.generate_feedback` | **General / Integrated** |
| `POST` | `/notes/analyze` | `bridge.analyze_notes` | **General / Integrated** |
| `POST` | `/resume/analyze` | `bridge.analyze_resume` | **General / Integrated** |
| `POST` | `/interview/start` | `bridge.start_interview_prep` | **General / Integrated** |
| `POST` | `/plan/generate` | `bridge.generate_plan` | **Student** |
| `POST` | `/syllabus/generate` | `bridge.generate_syllabus` | **General / Integrated** |
| `POST` | `/quiz/generate` | `bridge.generate_quiz_questions` | **General / Integrated** |
| `POST` | `/translate` | `bridge.translate_text` | **General / Integrated** |
| `POST` | `/content/generate` | `bridge.generate_topic_content` | **Teacher** |
| `GET` | `/ai/health` | `bridge.ai_engine_health` | **General / Integrated** |
| `POST` | `/evaluate/batch` | `evaluate.evaluate_batch` | **General / Integrated** |
| `GET` | `/evaluate/health` | `evaluate.health` | **General / Integrated** |
| `POST` | `/feedback/analyze/` | `feedback.analyze_feedback` | **General / Integrated** |
| `GET` | `/feedback/health/` | `feedback.health` | **General / Integrated** |
| `POST` | `/notes/upload/` | `notes.upload_and_generate_notes` | **General / Integrated** |
| `GET` | `/notes/list/` | `notes.list_saved_notes` | **General / Integrated** |
| `GET` | `/notes/health/` | `notes.health` | **General / Integrated** |
| `POST` | `/content/suggest/` | `content.suggest_resources` | **General / Integrated** |
| `GET` | `/content/health/` | `content.health` | **General / Integrated** |
| `POST` | `/test/generate/` | `test.generate_practice_test` | **General / Integrated** |
| `POST` | `/test/batch/` | `test.batch_generate_tests` | **General / Integrated** |
| `GET` | `/test/batch/status/` | `test.batch_status` | **General / Integrated** |
| `GET` | `/test/health/` | `test.health` | **General / Integrated** |
| `POST` | `/career/generate/` | `career.generate_career_plan` | **Student / Career Guidance** |
| `POST` | `/career/guidance` | `career.career_guidance` | **Student / Career Guidance** |
| `GET` | `/career/health/` | `career.health` | **Student / Career Guidance** |
| `POST` | `/personalization/generate/` | `personalization.generate_study_plan` | **Student** |
| `GET` | `/personalization/health/` | `personalization.health` | **Student** |
| `GET` | `/admin-api/usage/` | `admin_api.usage_dashboard` | **Admin** |
| `POST` | `/admin-api/cache/flush/` | `admin_api.flush_cache` | **Admin** |
| `POST` | `/admin-api/cache/stats/` | `admin_api.cache_stats` | **Admin** |
| `GET` | `/admin-api/cache/health/` | `admin_api.cache_health` | **Admin** |
| `GET` | `/admin-api/info/` | `admin_api.institute_info` | **Admin** |
