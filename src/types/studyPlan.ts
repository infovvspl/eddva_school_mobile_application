export type BacklogCategory = {
  id: string;
  title: string;
  description: string;
  pending: number;
  status: 'clear' | 'pending';
  icon: string;
  color: string;
};

export type StudyPlanCourse = {
  courseId: string;
  id: string;
  courseName: string;
  batchName?: string;
  examType?: string;
  examYear?: string;
  startsOn?: string;
  dailyHours?: number;
  hasStudyPlan?: boolean;
  daysLeft?: number;
};

export type StudyPlanTodayItem = {
  id: string;
  title: string;
  type: string;
  estimatedMinutes?: number;
  completed: boolean;
  skipped?: boolean;
  overdue?: boolean;
  xpReward?: number;
  subject?: string;
  topicId?: string;
  lectureId?: string;
  batchId?: string;
  testId?: string;
};
