import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Bell,
  Calendar,
  Bookmark,
  BookOpen,
  FileText,
  Link2,
  CalendarDays,
  Gamepad2,
  MessageCircle,
  ClipboardCheck,
  ChartLine,
  Trophy,
  User,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  type LucideIcon,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import ProfileAvatar from '../components/ProfileAvatar';
import { Brand } from '../constants/brand';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { navigateRoot, resetToAuth } from '../navigation/navigationRef';
import { font, hs, ms, spacing, type as t, vs } from '../utils/responsive';

type HubItem = {
  id: string;
  label: string;
  sub?: string;
  Icon: LucideIcon;
  onPress: () => void;
  danger?: boolean;
};

const AccountHubScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const c = theme.colors;
  const { user, logout } = useAuth();
  const name = user?.name || 'Student';
  const email = user?.email || user?.phone || '';

  const goTab = (screen: string) => {
    if (screen === 'Battle') {
      (navigation as any).navigate('Main', {
        screen: 'Battle',
        params: { screen: 'BattleLobby' },
      });
    } else {
      (navigation as any).navigate('Main', { screen });
    }
  };

  const goStack = (screen: string) => {
    navigation.goBack();
    setTimeout(() => navigateRoot(screen as never), 200);
  };

  const confirmLogout = async () => {
    await logout();
    resetToAuth();
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: confirmLogout },
    ]);
  };

  const sections: { title: string; items: HubItem[] }[] = [
    {
      title: 'Learning',
      items: [
        {
          id: 'courses',
          label: 'My Courses',
          sub: 'Resume classes & batches',
          Icon: BookOpen,
          onPress: () => goTab('Learn'),
        },
        {
          id: 'materials',
          label: 'Study Materials',
          sub: 'Books, previews & downloads',
          Icon: FileText,
          onPress: () => goStack('StudyMaterials'),
        },
        {
          id: 'join',
          label: 'Join with invite',
          sub: 'Use institute invite code',
          Icon: Link2,
          onPress: () => goStack('JoinBatch'),
        },
        {
          id: 'study',
          label: 'Study Plan',
          sub: 'Today, backlogs & roadmap',
          Icon: CalendarDays,
          onPress: () => goTab('StudyPlan'),
        },
        {
          id: 'battle',
          label: 'Battle Arena',
          sub: '1v1 practice battles',
          Icon: Gamepad2,
          onPress: () => goTab('Battle'),
        },
        {
          id: 'help',
          label: 'Doubts & Help',
          sub: 'Ask AI or teachers',
          Icon: MessageCircle,
          onPress: () => goTab('Help'),
        },
        {
          id: 'pyq',
          label: 'Practice PYQ',
          Icon: ClipboardCheck,
          onPress: () => goStack('PracticePYQ'),
        },
      ],
    },
    {
      title: 'Progress',
      items: [
        {
          id: 'performance',
          label: 'Performance',
          Icon: ChartLine,
          onPress: () => goStack('Progress'),
        },
        {
          id: 'leaderboard',
          label: 'Leaderboard',
          Icon: Trophy,
          onPress: () => goStack('Leaderboard'),
        },
      ],
    },
    {
      title: 'Shortcuts',
      items: [
        {
          id: 'notif',
          label: 'Notifications',
          Icon: Bell,
          onPress: () => goStack('Notifications'),
        },
        {
          id: 'cal',
          label: 'Calendar',
          Icon: Calendar,
          onPress: () => goStack('Calendar'),
        },
        {
          id: 'saved',
          label: 'Saved',
          Icon: Bookmark,
          onPress: () => goStack('Saved'),
        },
        {
          id: 'batches',
          label: 'All Batches',
          Icon: BookOpen,
          onPress: () => goStack('Courses'),
        },
      ],
    },
  ];

  return (
    <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <View style={[styles.topBar, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
          <ChevronRight
            size={ms(22)}
            color={c.text}
            strokeWidth={2.5}
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: c.text }]}>Menu</Text>
        <View style={{ width: hs(40) }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + vs(24) }]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => goStack('Profile')}
          style={styles.profileTouch}
        >
          <LinearGradient colors={[Brand.blue900, Brand.blue700]} style={styles.profileCard}>
            <ProfileAvatar
              uri={user?.avatarUrl}
              name={name}
              size={hs(56)}
              borderColor="#fff"
              style={styles.profileAvatar}
            />
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{name}</Text>
              {email ? <Text style={styles.profileEmail}>{email}</Text> : null}
              <View style={styles.profileLinkRow}>
                <User size={ms(12)} color="rgba(255,255,255,0.9)" strokeWidth={2.5} />
                <Text style={styles.profileLink}>View full profile</Text>
                <ChevronRight size={ms(14)} color="#fff" strokeWidth={2.5} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={[styles.themeCard, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
          <View style={[styles.themeIcon, { backgroundColor: `${c.primary}18` }]}>
            {isDark ? (
              <Moon size={ms(20)} color={c.primary} strokeWidth={2} />
            ) : (
              <Sun size={ms(20)} color={c.primary} strokeWidth={2} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.themeTitle, { color: c.text }]}>Dark mode</Text>
            <Text style={[styles.themeSub, { color: c.textMuted }]}>Easier on eyes at night</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: c.primary }}
            thumbColor="#fff"
          />
        </View>

        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.textMuted }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
              {section.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 ? <View style={[styles.divider, { backgroundColor: c.border }]} /> : null}
                  <TouchableOpacity style={styles.row} onPress={item.onPress} activeOpacity={0.7}>
                    <View style={[styles.rowIcon, { backgroundColor: c.chipBg }]}>
                      <item.Icon
                        size={ms(18)}
                        color={item.danger ? c.danger : c.primary}
                        strokeWidth={2}
                      />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={[styles.rowLabel, { color: item.danger ? c.danger : c.text }]}>
                        {item.label}
                      </Text>
                      {item.sub ? (
                        <Text style={[styles.rowSub, { color: c.textMuted }]} numberOfLines={1}>
                          {item.sub}
                        </Text>
                      ) : null}
                    </View>
                    <ChevronRight size={ms(16)} color={c.textMuted} strokeWidth={2} />
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: c.danger, backgroundColor: `${c.danger}10` }]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <LogOut size={ms(18)} color={c.danger} strokeWidth={2.5} />
          <Text style={[styles.logoutText, { color: c.danger }]}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: vs(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: ms(4) },
  topTitle: { ...t.subheadBold },
  scroll: { padding: spacing.md },
  profileTouch: { marginBottom: vs(14) },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    padding: spacing.md,
    gap: hs(14),
  },
  profileAvatar: {
    width: hs(56),
    height: hs(56),
    borderRadius: hs(28),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileAvatarImage: { width: '100%', height: '100%' },
  profileInitials: { fontSize: font.title, fontWeight: '900', color: '#fff' },
  profileText: { flex: 1 },
  profileName: { fontSize: font.subhead, fontWeight: '800', color: '#fff', marginBottom: vs(2) },
  profileEmail: { fontSize: font.caption, color: 'rgba(255,255,255,0.85)', marginBottom: vs(8) },
  profileLinkRow: { flexDirection: 'row', alignItems: 'center', gap: hs(6) },
  profileLink: { fontSize: font.caption, fontWeight: '700', color: '#fff' },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: vs(18),
  },
  themeIcon: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeTitle: { ...t.bodyBold },
  themeSub: { ...t.caption, marginTop: vs(2) },
  section: { marginBottom: vs(16) },
  sectionTitle: {
    ...t.microBold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: vs(8),
    marginLeft: hs(4),
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    paddingVertical: vs(14),
    paddingHorizontal: spacing.md,
  },
  rowIcon: {
    width: hs(40),
    height: hs(40),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, minWidth: 0 },
  rowLabel: { ...t.bodyBold },
  rowSub: { ...t.caption, marginTop: vs(2) },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: hs(52) },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    marginTop: vs(8),
    paddingVertical: vs(14),
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  logoutText: { ...t.bodyBold },
});

export default AccountHubScreen;
