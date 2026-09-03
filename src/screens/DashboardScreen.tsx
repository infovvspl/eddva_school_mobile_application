import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, SafeAreaView, StatusBar } from 'react-native';
import { hs, vs, ms } from '../utils/responsive';
import {
  Bell, GraduationCap, ClipboardList, FileCheck, NotebookPen,
  PenTool, BookOpen, FileText, Clock, FileSignature, FileCheck2, HelpCircle,
  TrendingUp, Gamepad2, Briefcase, Calendar, User, Play,
} from 'lucide-react-native';
import { student } from '../data/school-data';
import { schoolApi } from '../utils/api';
import { HeaderBackdrop } from '../components/HeaderBackdrop';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getContinueWatching, WatchEntry } from '../utils/watchHistory';

const { width } = Dimensions.get('window');

// Quick Action tiles use the brand blue so they read as one set and stay crisp
// at any screen density on both platforms.
const QUICK_ACTION_COLOR = '#1e3a8a';

type MenuItem = {
  id: string;
  title: string;
  Icon: any;
  color?: string;
  badge?: string;
  // Tiles are ~3-to-a-row, so long titles get a compact label for the grid.
  short?: string;
};

// Everything that used to live behind the Menu tab. Live and recorded classes
// are deliberately absent: they are now the dedicated Videos tab.
const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Academics',
    items: [
      { id: 'studyPlan', title: 'Personalized Study Plan', short: 'Study Plan', Icon: PenTool, color: '#1e3a8a', badge: 'AI' },
      { id: 'aiStudy', title: 'AI Study Assistant', short: 'AI Assistant', Icon: BookOpen, color: '#8B5CF6', badge: 'New' },
      { id: 'studyMaterials', title: 'Study Materials', Icon: FileText },
      { id: 'timetable', title: 'Class Timetable', short: 'Timetable', Icon: Clock },
    ],
  },
  {
    title: 'Assessments & Doubts',
    items: [
      { id: 'assignments', title: 'Assignments', Icon: FileSignature },
      { id: 'assessments', title: 'Tests & Assessments', short: 'Tests', Icon: FileCheck2 },
      { id: 'pyq', title: 'Previous Year Papers (PYQ)', short: 'PYQ Papers', Icon: BookOpen },
      { id: 'doubt', title: 'Doubt Forum', short: 'Doubts', Icon: HelpCircle },
    ],
  },
  {
    title: 'Performance & Growth',
    items: [
      { id: 'analytics', title: 'My Analytics', short: 'Analytics', Icon: TrendingUp, color: '#10B981' },
      { id: 'gamification', title: 'Arcade & Games', short: 'Arcade', Icon: Gamepad2, color: '#F59E0B' },
      { id: 'careers', title: 'Career Guidance', short: 'Careers', Icon: Briefcase },
    ],
  },
  {
    title: 'General',
    items: [
      { id: 'calendar', title: 'School Calendar', short: 'Calendar', Icon: Calendar },
      { id: 'attendance', title: 'Attendance', Icon: User },
      { id: 'profile', title: 'My Profile', short: 'Profile', Icon: User },
    ],
  },
];

export function DashboardScreen({ theme, onNavigate }: any) {
  // The root SafeAreaView skips the top edge for this screen so the header
  // artwork runs behind the status bar; that inset is applied here instead.
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [profile, setProfile] = useState<any>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pendingAssignments, setPendingAssignments] = useState(0);
  const [headerSize, setHeaderSize] = useState({ w: 0, h: 0 });
  const [continueList, setContinueList] = useState<WatchEntry[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await schoolApi.getDashboardStats();
        setStats(statsRes?.data ?? statsRes);
        setLoadFailed(false);
      } catch (err) {
        console.error(err);
        setLoadFailed(true);
      }
    };
    const fetchUnread = async () => {
      try {
        const res = await schoolApi.getUnreadNotificationsCount();
        const value = res?.count ?? res?.data?.count ?? res?.unreadCount ?? res?.data?.unreadCount;
        setUnreadCount(Number(value) || 0);
      } catch {
        setUnreadCount(0);
      }
    };
    // /students/dashboard has no name on it; the display name lives on the
    // profile endpoint as a single "name" field.
    const fetchProfile = async () => {
      try {
        const res = await schoolApi.getMyProfile();
        setProfile(res?.data ?? res);
      } catch (err) {
        console.error('[dashboard] profile load failed', err);
      }
    };
    const fetchPendingAssignments = async () => {
      try {
        const res = await schoolApi.getAssignments();
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        setPendingAssignments(
          list.filter((a: any) => !a.mySubmission || a.status === 'pending').length,
        );
      } catch {
        setPendingAssignments(0);
      }
    };
    /**
     * The shelf comes from the local watch index (the API cannot list which
     * recordings a student has progress on). Progress for the few entries
     * actually shown is then refreshed from the server so the percentage and
     * resume point stay authoritative.
     */
    const fetchContinueWatching = async () => {
      const local = await getContinueWatching(6);
      if (local.length === 0) {
        setContinueList([]);
        return;
      }
      setContinueList(local);

      const refreshed = await Promise.all(
        local.map(async entry => {
          try {
            const res: any = await schoolApi.getRecordingProgress(entry.id);
            const p = res?.data ?? res;
            const pct = Number(p?.watchPercentage);
            if (!isFinite(pct)) return entry;
            return {
              ...entry,
              percent: Math.max(0, Math.min(100, Math.round(pct))),
              lastPositionSeconds: Number(p?.lastPositionSeconds) || entry.lastPositionSeconds,
            };
          } catch {
            return entry;
          }
        }),
      );
      // A recording finished on another device drops off the shelf.
      setContinueList(refreshed.filter(e => e.percent > 0 && e.percent < 95));
    };

    fetchDashboardData();
    fetchUnread();
    fetchProfile();
    fetchPendingAssignments();
    fetchContinueWatching();
  }, []);

  // The API returns one "name" string ("Abhijit Singh"), not first/last parts.
  const fullName: string = profile?.name ?? '';
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? '';
  const initials =
    nameParts.slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase() || '--';
  const streak = stats?.currentStreak;
  const points = stats?.xpTotal;
  // The dashboard payload carries no counts object, so the badge is derived
  // from the assignments list: "pending" means nothing submitted yet.
  const assignmentsDue = pendingAssignments;
  // '…' only while the request is still in flight. Once it has resolved (or
  // failed) a missing value shows '--' rather than spinning forever.
  const settled = stats !== null || loadFailed;
  const showValue = (v: any) =>
    v === undefined || v === null ? (settled ? '--' : '…') : String(v);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Top Dark Section */}
        <View
          style={[styles.topSection, { paddingTop: insets.top + vs(12) }]}
          onLayout={e => setHeaderSize({
            w: e.nativeEvent.layout.width,
            h: e.nativeEvent.layout.height,
          })}
        >
          <View style={styles.heroGlowOne} />
          <View style={styles.heroGlowTwo} />
          <View style={styles.heroGlowThree} />
          <HeaderBackdrop width={headerSize.w} height={headerSize.h} />
          <View style={styles.header}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.iconButton} onPress={() => onNavigate('notifications')}>
                <Bell size={ms(20)} color="#fff" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatarButton} onPress={() => onNavigate('profile')}>
                <Text style={styles.avatarText}>{initials}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.greeting}>{firstName ? `Hello, ${firstName}! 👋` : 'Hello! 👋'}</Text>
          <Text style={styles.subtitle}>Ready to conquer your goals today?</Text>
        </View>

        {/* Stats Pill Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Image source={require('../../assets/fire.jpg')} style={styles.statImage} />
            </View>
            <View>
              <Text style={styles.statValue}>{showValue(streak)}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <View style={styles.statIconBox}>
              <Image source={require('../../assets/coin.jpg')} style={styles.statImage} />
            </View>
            <View>
              <Text style={styles.statValue}>{showValue(points)}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('todaySchedule')}>
              <View style={styles.actionIconBox}>
                <GraduationCap size={ms(32)} color={QUICK_ACTION_COLOR} strokeWidth={1.75} />
              </View>
              <Text style={styles.actionLabel}>My Classes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('assignments')}>
              <View style={styles.actionIconBox}>
                <ClipboardList size={ms(32)} color={QUICK_ACTION_COLOR} strokeWidth={1.75} />
                {assignmentsDue > 0 && (
                  <View style={styles.actionBadge}>
                    <Text style={styles.badgeText}>{assignmentsDue > 9 ? '9+' : assignmentsDue}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionLabel} numberOfLines={1}>Assignments</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('assessments')}>
              <View style={styles.actionIconBox}>
                <FileCheck size={ms(32)} color={QUICK_ACTION_COLOR} strokeWidth={1.75} />
              </View>
              <Text style={styles.actionLabel} numberOfLines={1}>Assessment</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('studyMaterials')}>
              <View style={styles.actionIconBox}>
                <NotebookPen size={ms(32)} color={QUICK_ACTION_COLOR} strokeWidth={1.75} />
              </View>
              <Text style={styles.actionLabel}>Notes</Text>
            </TouchableOpacity>
          </View>

          {/* Continue Learning — rendered only when there is something to
              resume, so a new student never sees a dead placeholder. */}
          {continueList.length > 0 && (
            <>
              <View style={styles.continueHeader}>
                <Text style={styles.sectionTitle}>Continue Learning</Text>
                <TouchableOpacity onPress={() => onNavigate('videos')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.continueRow}
              >
                {continueList.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.continueCard}
                    activeOpacity={0.85}
                    onPress={() => onNavigate('videos', { resumeRecordingId: item.id })}
                  >
                    <View style={styles.continueThumb}>
                      {!!item.thumbnailUrl && (
                        <Image
                          source={{ uri: item.thumbnailUrl }}
                          style={styles.continueThumbImg}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.continuePlay}>
                        <Play size={ms(16)} color="#FFF" fill="#FFF" />
                      </View>
                      {item.durationMins ? (
                        <View style={styles.continueDuration}>
                          <Text style={styles.continueDurationText}>{item.durationMins} min</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.continueBarTrack}>
                      <View style={[styles.continueBarFill, { width: `${item.percent}%` }]} />
                    </View>

                    <Text style={styles.continueTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.continueMeta} numberOfLines={1}>
                      {item.percent}% watched
                      {item.subjectName ? ` · ${item.subjectName}` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {MENU_SECTIONS.map(section => (
            <View key={section.title} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{section.title}</Text>
              <View style={styles.menuGrid}>
                {section.items.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.menuTile}
                    onPress={() => onNavigate(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuTileIcon}>
                      <item.Icon size={ms(22)} color={item.color ?? QUICK_ACTION_COLOR} strokeWidth={1.75} />
                    </View>
                    <Text style={styles.menuTileText} numberOfLines={2}>
                      {item.short ?? item.title}
                    </Text>
                    {item.badge && (
                      <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: vs(100),
  },
  topSection: {
    backgroundColor: '#0b2d6b',
    overflow: 'hidden',
    paddingHorizontal: hs(20),
    paddingBottom: vs(80),
    borderBottomLeftRadius: ms(32),
    borderBottomRightRadius: ms(32),
    shadowColor: '#0b2d6b',
    shadowOffset: { width: 0, height: vs(10) },
    shadowOpacity: 0.28,
    shadowRadius: ms(18),
    elevation: 8,
  },
  heroGlowOne: {
    position: 'absolute',
    width: hs(260),
    height: hs(260),
    borderRadius: hs(130),
    backgroundColor: 'rgba(96, 165, 250, 0.18)',
    top: -hs(80),
    right: -hs(40),
  },
  heroGlowTwo: {
    position: 'absolute',
    width: hs(230),
    height: hs(230),
    borderRadius: hs(115),
    backgroundColor: 'rgba(59, 130, 246, 0.14)',
    bottom: -hs(60),
    left: -hs(50),
  },
  heroGlowThree: {
    position: 'absolute',
    width: hs(360),
    height: hs(360),
    borderRadius: hs(180),
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -hs(200),
    right: -hs(120),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(30),
  },
  logo: {
    width: hs(120),
    height: vs(40),
    tintColor: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: hs(40),
    height: vs(40),
    borderRadius: ms(20),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hs(10),
  },
  badge: {
    position: 'absolute',
    top: vs(5),
    right: hs(5),
    backgroundColor: '#ef4444',
    borderRadius: ms(10),
    width: hs(16),
    height: vs(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  badgeText: {
    color: '#fff',
    fontSize: ms(9),
    fontWeight: 'bold',
  },
  avatarButton: {
    width: hs(40),
    height: vs(40),
    borderRadius: ms(20),
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: ms(16),
  },
  greeting: {
    color: '#fff',
    fontSize: ms(31),
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: vs(8),
    textShadowColor: 'rgba(59, 130, 246, 0.35)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 14,
  },
  subtitle: {
    color: '#dbeafe',
    fontSize: ms(16),
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: ms(24),
    marginHorizontal: hs(20),
    marginTop: vs(-45),
    paddingVertical: vs(16),
    paddingHorizontal: hs(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.05,
    shadowRadius: ms(10),
    elevation: 3,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statIconBox: {
    width: hs(40),
    height: vs(40),
    borderRadius: ms(20),
    backgroundColor: '#fffbeb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: hs(12),
  },
  statImage: {
    width: hs(24),
    height: vs(24),
  },
  statValue: {
    fontSize: ms(18),
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: ms(12),
    color: '#64748b',
    marginTop: vs(2),
  },
  statDivider: {
    width: hs(1),
    height: vs(40),
    backgroundColor: '#e2e8f0',
  },
  contentSection: {
    paddingHorizontal: hs(20),
    paddingTop: vs(24),
  },
  sectionTitle: {
    fontSize: ms(20),
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: vs(24),
    marginBottom: vs(16),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    width: (width - 40) / 4,
  },
  actionIconBox: {
    width: hs(70),
    height: vs(70),
    backgroundColor: '#fff',
    borderRadius: ms(24),
    // A tinted outline in the brand blue, so the tiles keep their edge against
    // the near-white page instead of relying on the shadow alone.
    borderWidth: 1.5,
    borderColor: '#C7D7F5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.05,
    shadowRadius: ms(8),
    elevation: 2,
    marginBottom: vs(8),
  },
  actionBadge: {
    position: 'absolute',
    top: vs(-5),
    right: hs(-5),
    backgroundColor: '#3b82f6',
    borderRadius: ms(10),
    width: hs(20),
    height: vs(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  actionLabel: {
    fontSize: ms(12),
    color: '#475569',
    fontWeight: '500',
    textAlign: 'center',
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: ms(14),
    marginTop: vs(8),
  },
  continueRow: {
    gap: hs(12),
    paddingRight: hs(4),
    paddingBottom: vs(4),
  },
  continueCard: {
    width: hs(180),
  },
  continueThumb: {
    width: '100%',
    height: vs(102),
    borderRadius: ms(12),
    backgroundColor: '#1e293b',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueThumbImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  continuePlay: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueDuration: {
    position: 'absolute',
    right: hs(7),
    bottom: vs(7),
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: ms(6),
    paddingHorizontal: hs(6),
    paddingVertical: vs(2),
  },
  continueDurationText: {
    color: '#FFF',
    fontSize: ms(10),
    lineHeight: ms(14),
    fontWeight: '600',
  },
  // Sits flush under the thumbnail so it reads as the video's own progress.
  continueBarTrack: {
    height: vs(3),
    backgroundColor: '#E2E8F0',
    borderBottomLeftRadius: ms(3),
    borderBottomRightRadius: ms(3),
    overflow: 'hidden',
    marginTop: -vs(3),
  },
  continueBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  continueTitle: {
    fontSize: ms(13),
    lineHeight: ms(18),
    fontWeight: '600',
    color: '#1E293B',
    marginTop: vs(8),
  },
  continueMeta: {
    fontSize: ms(11),
    lineHeight: ms(15),
    color: '#64748B',
    marginTop: vs(3),
  },
  menuSection: {
    marginTop: vs(24),
  },
  menuSectionTitle: {
    fontSize: ms(13),
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: vs(8),
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // Three tiles per row with an even gutter; the gap handles both axes so
    // a short last row stays left-aligned instead of stretching.
    gap: hs(10),
  },
  menuTile: {
    width: (width - hs(40) - hs(20)) / 3,
    backgroundColor: '#fff',
    borderRadius: ms(16),
    paddingVertical: vs(14),
    paddingHorizontal: hs(6),
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: vs(104),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: vs(2) },
    shadowOpacity: 0.05,
    shadowRadius: ms(8),
    elevation: 2,
  },
  menuTileIcon: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(14),
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  menuTileText: {
    fontSize: ms(11.5),
    lineHeight: ms(15),
    color: '#475569',
    fontWeight: '600',
    textAlign: 'center',
  },
  menuBadge: {
    position: 'absolute',
    top: vs(8),
    right: hs(8),
    paddingHorizontal: hs(6),
    paddingVertical: vs(1),
    borderRadius: ms(8),
    backgroundColor: '#EEF2FF',
  },
  menuBadgeText: {
    fontSize: ms(10),
    fontWeight: '700',
    color: '#6366F1',
  },
  emptyStateBox: {
    backgroundColor: '#fff',
    borderRadius: ms(20),
    padding: ms(24),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: '#94a3b8',
    fontSize: ms(14),
  }
});
