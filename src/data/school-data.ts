export type TabId = 'home' | 'timetable' | 'tasks' | 'attendance' | 'news' | 'menu' | 'profile';

export const student = {
  name: 'Pratap Das',
  className: 'Class 9 - B',
  school: 'Green Valley Public School',
  avatarInitials: 'PD',
};

export type AssignmentStatus = 'pending' | 'submitted' | 'graded';

export type Assignment = {
  id: string;
  subject: string;
  title: string;
  status: AssignmentStatus;
};

export const assignments: Assignment[] = [
  { id: 'a1', subject: 'Mathematics', title: 'Algebra Worksheet Ch. 4', status: 'pending' },
  { id: 'a2', subject: 'Physics', title: 'Lab Report: Refraction', status: 'pending' },
  { id: 'a3', subject: 'English', title: 'Essay: My Favourite Book', status: 'submitted' },
];

export type Announcement = {
  id: string;
  title: string;
  time: string;
};

export const announcements: Announcement[] = [
  { id: 'n1', title: 'Half-Yearly Exam Schedule Released', time: '2h ago' },
  { id: 'n2', title: 'Annual Sports Day - July 12', time: '5h ago' },
  { id: 'n3', title: 'Library Books Return Reminder', time: 'Yesterday' },
];
