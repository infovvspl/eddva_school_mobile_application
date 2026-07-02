import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import ProfileAvatar from './ProfileAvatar';
import { Brand } from '../constants/brand';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { BorderRadius, Colors } from '../constants/theme';
import { hs, spacing, vs } from '../utils/responsive';
import { navigateRoot, resetToAuth } from '../navigation/navigationRef';

type Props = {
  visible: boolean;
  onClose: () => void;
  navigation: any;
};

const AppMenuSheet: React.FC<Props> = ({ visible, onClose, navigation }) => {
  const { height: windowHeight } = useWindowDimensions();
  const sheetMax = windowHeight * 0.78;
  const menuScrollMax = sheetMax - vs(220);
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout, user } = useAuth();
  const c = theme.colors;

  const goTab = (screen: string) => {
    onClose();
    setTimeout(() => {
      if (screen === 'Battle') {
        navigation.navigate('Battle', { screen: 'BattleLobby' });
      } else {
        navigation.navigate(screen);
      }
    }, 180);
  };

  const goStack = (screen: string, params?: object) => {
    onClose();
    setTimeout(() => navigateRoot(screen as any, params as any), 180);
  };

  const confirmLogout = async () => {
    onClose();
    await logout();
    resetToAuth();
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: confirmLogout },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: c.overlay }]}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { backgroundColor: c.surface, borderColor: c.border, maxHeight: sheetMax }]}>
          <View style={[styles.handle, { backgroundColor: c.textMuted }]} />

          <View style={styles.profileRow}>
            <ProfileAvatar
              uri={user?.avatarUrl}
              name={user?.name || 'Student'}
              size={hs(48)}
              borderColor={c.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.profileName, { color: c.text }]}>{user?.name || 'Student'}</Text>
              {(user?.email || user?.phone) ? (
                <Text style={[styles.profileEmail, { color: c.textMuted }]}>
                  {user?.email || user?.phone}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.themeRow, { backgroundColor: c.chipBg, borderColor: c.border }]}>
            <View style={styles.themeLeft}>
              <Icon name={isDark ? 'moon' : 'sun'} size={18} color={c.primary} solid />
              <Text style={[styles.themeLabel, { color: c.text }]}>Dark mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#CBD5E1', true: c.primary }}
              thumbColor="#fff"
            />
          </View>

          <ScrollView
            style={[styles.menuScroll, { maxHeight: menuScrollMax }]}
            contentContainerStyle={styles.menuScrollContent}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            <MenuItem icon="bell" label="Notifications" colors={c} onPress={() => goStack('Notifications')} />
            <MenuItem icon="clipboard-check" label="Practice PYQ" colors={c} onPress={() => goStack('PracticePYQ')} />
            <MenuItem icon="gamepad" label="Battle Arena" colors={c} onPress={() => goTab('Battle')} />
            <MenuItem icon="chart-line" label="Performance" colors={c} onPress={() => goStack('Progress')} />
            <MenuItem icon="trophy" label="Leaderboard" colors={c} onPress={() => goStack('Leaderboard')} />
            <MenuItem icon="book-open" label="All batches" colors={c} onPress={() => goStack('Courses')} />
            <MenuItem icon="calendar-alt" label="Calendar" colors={c} onPress={() => goStack('Calendar')} />
            <MenuItem icon="bookmark" label="Saved" colors={c} onPress={() => goStack('Saved')} />
            <MenuItem icon="user" label="My profile" colors={c} onPress={() => goStack('Profile')} />
            <MenuItem icon="comment-dots" label="Help & doubts" colors={c} onPress={() => goTab('Help')} />
          </ScrollView>

          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: c.danger }]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Icon name="sign-out-alt" size={16} color={c.danger} solid />
            <Text style={[styles.logoutText, { color: c.danger }]}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const MenuItem: React.FC<{
  icon: string;
  label: string;
  colors: { text: string; textMuted: string; border: string; chipBg: string };
  onPress: () => void;
}> = ({ icon, label, colors, onPress }) => (
  <TouchableOpacity
    style={[menuStyles.item, { borderBottomColor: colors.border }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[menuStyles.iconWrap, { backgroundColor: colors.chipBg }]}>
      <Icon name={icon} size={16} color={colors.textMuted} solid />
    </View>
    <Text style={[menuStyles.label, { color: colors.text }]}>{label}</Text>
    <Icon name="chevron-right" size={12} color={colors.textMuted} solid />
  </TouchableOpacity>
);

const menuStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontSize: 15, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: {
    position: 'absolute',
    top: vs(56),
    left: hs(12),
    right: hs(12),
    borderRadius: BorderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  profileName: { fontSize: 17, fontWeight: '800' },
  profileEmail: { fontSize: 12, marginTop: 2 },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  themeLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  themeLabel: { fontSize: 15, fontWeight: '700' },
  menuScroll: { flexGrow: 0 },
  menuScrollContent: { paddingBottom: 4 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  logoutText: { fontSize: 15, fontWeight: '800' },
});

export default AppMenuSheet;
