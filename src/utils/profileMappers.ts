import { extractAvatarUrl } from './mediaUrl';

export type StudentProfile = {
  id?: string;
  name: string;
  fullName: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  careOf?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  landmark?: string;
  postOffice?: string;
  examTarget?: string;
  examYear?: string;
  targetCollege?: string;
  className?: string;
  language?: string;
  rankLabel?: string;
  xp?: number;
  streak?: number;
  rank?: number;
  accuracy?: number;
  totalAttempts?: number;
  topicsCompleted?: number;
  totalDoubts?: number;
  examReadiness?: number;
  coursesCount?: number;
  bio?: string;
  dailyStudyHours?: number;
  role?: string;
};

function pickString(...values: unknown[]): string {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number' && !Number.isNaN(v)) return String(v);
  }
  return '';
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const v of values) {
    if (typeof v === 'number' && !Number.isNaN(v)) return v;
    if (typeof v === 'string' && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  }
  return undefined;
}

/** Merge parent + nested student/user/profile so root-level avatar fields are kept. */
function flattenProfileRecord(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== 'object') return {};
  const merged: Record<string, unknown> = {};

  const absorb = (obj: unknown) => {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    const rec = obj as Record<string, unknown>;
    Object.assign(merged, rec);
    for (const key of ['student', 'profile', 'user', 'account']) {
      const nested = rec[key];
      if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
        absorb(nested);
      }
    }
  };

  absorb(data);
  return merged;
}

/** Map API profile / auth/me / dashboard payloads into one UI shape. */
export function normalizeStudentProfile(...sources: unknown[]): StudentProfile {
  const merged: Record<string, unknown> = {};
  let avatarUrl: string | undefined;

  for (const src of sources) {
    const flat = flattenProfileRecord(src);
    Object.assign(merged, flat);
    const found = extractAvatarUrl(flat as Record<string, any>);
    if (found) avatarUrl = found;
  }

  const nestedOnboarding =
    merged.onboarding && typeof merged.onboarding === 'object'
      ? (merged.onboarding as Record<string, unknown>)
      : {};
  const nestedStats =
    merged.stats && typeof merged.stats === 'object'
      ? (merged.stats as Record<string, unknown>)
      : merged.performance && typeof merged.performance === 'object'
        ? (merged.performance as Record<string, unknown>)
        : {};

  const fullName = pickString(
    merged.fullName,
    merged.full_name,
    merged.displayName,
    merged.display_name,
    merged.name,
  );

  const examTarget = pickString(
    merged.examTarget,
    merged.exam_target,
    merged.targetExam,
    merged.examType,
    merged.exam,
    nestedOnboarding.examTarget,
    nestedOnboarding.examType,
  );

  const className = pickString(
    merged.className,
    merged.class_name,
    merged.class,
    merged.grade,
    nestedOnboarding.class,
  );

  const profile: StudentProfile = {
    id: pickString(merged.id, merged._id, merged.studentId) || undefined,
    fullName,
    name: fullName || 'Student',
    phone: pickString(
      merged.phone,
      merged.phoneNumber,
      merged.phone_number,
      merged.mobile,
      merged.mobileNumber,
    ),
    email: pickString(merged.email),
    avatarUrl: avatarUrl || extractAvatarUrl(merged as Record<string, any>) || undefined,
    careOf: pickString(merged.careOf, merged.care_of, merged.parentName),
    alternatePhone: pickString(
      merged.alternatePhoneNumber,
      merged.alternatePhone,
      merged.altPhone,
      merged.secondaryPhone,
    ),
    address: pickString(merged.address, merged.streetAddress, merged.fullAddress),
    city: pickString(merged.city),
    state: pickString(merged.state),
    pinCode: pickString(merged.pinCode, merged.pin_code, merged.pincode, merged.postalCode),
    landmark: pickString(merged.landmark),
    postOffice: pickString(merged.postOffice, merged.post_office),
    examTarget,
    examYear: pickString(merged.examYear, merged.exam_year, nestedOnboarding.examYear),
    targetCollege: pickString(
      merged.targetCollege,
      merged.target_college,
      nestedOnboarding.targetCollege,
    ),
    className,
    language: pickString(merged.language, nestedOnboarding.language),
    rankLabel: pickString(
      merged.rankTitle,
      merged.rank_title,
      merged.tier,
      merged.league,
      merged.badge,
    ),
    xp: pickNumber(merged.xp, merged.totalXp, merged.total_xp, merged.xpPoints, nestedStats.xp),
    streak: pickNumber(
      merged.streak,
      merged.learningStreak,
      merged.learning_streak,
      merged.streakDays,
      nestedStats.streak,
    ),
    rank: pickNumber(merged.rank, merged.leaderboardRank, merged.globalRank, nestedStats.rank),
    accuracy: pickNumber(
      merged.accuracy,
      merged.accuracyIndex,
      merged.accuracyPercent,
      nestedStats.accuracy,
    ),
    totalAttempts: pickNumber(merged.totalAttempts, merged.attempts, nestedStats.totalAttempts),
    topicsCompleted: pickNumber(
      merged.topicsCompleted,
      merged.completedTopics,
      nestedStats.topicsCompleted,
    ),
    totalDoubts: pickNumber(merged.totalDoubts, merged.doubtsCount, nestedStats.totalDoubts),
    examReadiness: pickNumber(
      merged.examReadiness,
      merged.examReadyPercent,
      merged.exam_ready_percent,
      merged.readinessPercent,
    ),
    coursesCount: pickNumber(
      merged.coursesCount,
      merged.enrolledCourses,
      merged.enrolledCoursesCount,
      merged.batchCount,
    ),
    bio: pickString(merged.bio, merged.tagline, merged.about, merged.description),
    dailyStudyHours: pickNumber(merged.dailyStudyHours, merged.daily_study_hours),
    role: pickString(merged.role) || undefined,
  };

  return profile;
}

export function formatProfileSubtitle(p: StudentProfile): string {
  const parts = [
    p.examTarget ? `${p.examTarget} Aspirant` : '',
    p.className ? (p.className.match(/^class/i) ? p.className : `Class ${p.className}`) : '',
    p.examYear || '',
  ].filter(Boolean);
  return parts.join(' · ') || p.phone || p.email || '';
}

export function profileFieldRows(p: StudentProfile): { icon: string; label: string; value: string }[] {
  const rows: { icon: string; label: string; value: string }[] = [
    { icon: 'user', label: 'Full Name', value: p.fullName || p.name },
    { icon: 'phone', label: 'Phone', value: p.phone || '' },
    { icon: 'envelope', label: 'Email', value: p.email || '' },
    { icon: 'users', label: 'Care Of', value: p.careOf || '' },
    { icon: 'phone-alt', label: 'Alt. Phone', value: p.alternatePhone || '' },
    { icon: 'map-marker-alt', label: 'Address', value: p.address || '' },
    { icon: 'map-marker-alt', label: 'City', value: p.city || '' },
    { icon: 'map', label: 'State', value: p.state || '' },
    { icon: 'map-pin', label: 'Pin Code', value: p.pinCode || '' },
    { icon: 'road', label: 'Landmark', value: p.landmark || '' },
    { icon: 'building', label: 'Post Office', value: p.postOffice || '' },
    { icon: 'graduation-cap', label: 'Exam Target', value: p.examTarget || '' },
    { icon: 'calendar', label: 'Exam Year', value: p.examYear || '' },
    { icon: 'school', label: 'Class', value: p.className || '' },
    { icon: 'university', label: 'Target College', value: p.targetCollege || '' },
    { icon: 'globe', label: 'Language', value: p.language || '' },
  ];
  return rows;
}
