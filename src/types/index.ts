export * from './navigation';

export interface Course {
  id: string;
  title: string;
  category: string;
  rating: number;
  bgColor: string;
  borderColor: string;
  enrolledCount: string;
  avatars: string[];
}

export interface StatCardData {
  label: string;
  value: string;
  unit: string;
  bgColor: string;
  iconName: string;
  iconColor: string;
}

export interface TimelineItem {
  time: string;
  subject: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  status: 'completed' | 'active' | 'upcoming';
  mentor?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  locked?: boolean;
}
