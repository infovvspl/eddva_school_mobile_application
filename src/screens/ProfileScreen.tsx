import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import ProfileAvatar from '../components/ProfileAvatar';
import IconBadge from '../components/IconBadge';
import { Brand } from '../constants/brand';
import { BorderRadius, Shadow } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { navigateRoot, resetToAuth } from '../navigation/navigationRef';
import { studentService } from '../services/student.service';
import {
  formatProfileSubtitle,
  normalizeStudentProfile,
  profileFieldRows,
  type StudentProfile,
} from '../utils/profileMappers';
import { font, hs, layout, ms, pagePadding, spacing, vs } from '../utils/responsive';
import UseCurrentLocationButton from '../components/UseCurrentLocationButton';
import { deviceService } from '../services/device.service';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const { data: profile, loading, refetch } = useApi(() => studentService.getFullProfile(), []);
  const profileData: StudentProfile = profile || normalizeStudentProfile(user);

  const refreshAll = async () => {
    await Promise.all([refetch(), refreshUser()]);
  };

  React.useEffect(() => {
    if (profile?.avatarUrl) {
      refreshUser();
    }
  }, [profile?.avatarUrl, refreshUser]);

  const startEdit = () => {
    setEditName(profileData.fullName || profileData.name || '');
    setEditEmail(profileData.email || '');
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await studentService.updateProfile({
        fullName: editName.trim(),
        name: editName.trim(),
        email: editEmail.trim(),
      });
      await refreshUser();
      refetch();
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = async () => {
    await logout();
    resetToAuth();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: confirmLogout },
      ],
    );
  };

  const p = profileData;
  const displayName = p.fullName || p.name || 'Student';
  const subtitle = formatProfileSubtitle(p);
  const detailRows = profileFieldRows(p);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ paddingBottom: vs(32) }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshAll} tintColor={c.primary} />}
    >
      <View style={[styles.banner, { paddingTop: insets.top + 12, backgroundColor: '#FFFFFF', borderBottomColor: c.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { top: insets.top + 8, backgroundColor: c.chipBg }]}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="arrow-left" size={18} color={c.text} solid />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuBtn, { top: insets.top + 8, backgroundColor: c.chipBg }]}
          onPress={() => navigateRoot('AccountHub')}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Icon name="user-circle" size={18} color={c.text} solid />
        </TouchableOpacity>
        <View style={styles.avatarWrap}>
          <ProfileAvatar
            uri={p.avatarUrl}
            name={displayName}
            size={layout.avatarLg}
            borderColor={c.primary}
            style={styles.avatar}
            textStyle={styles.avatarInitials}
          />
          {!editing && (
            <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: c.primary, borderColor: c.surface }]} onPress={startEdit}>
              <Icon name="pen" size={12} color="#fff" solid />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.bannerName, { color: c.text }]}>{p.name}</Text>
        {subtitle ? (
          <Text style={[styles.bannerPhone, { color: c.textMuted }]}>{subtitle}</Text>
        ) : (
          <Text style={[styles.bannerPhone, { color: c.textMuted }]}>{p.phone || p.email || ''}</Text>
        )}

        {p.bio ? (
          <Text style={[styles.bio, { color: c.textMuted }]}>{p.bio}</Text>
        ) : null}

        <View style={styles.badgesRow}>
          {p.rankLabel ? (
            <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="shield-alt" size={12} color="#B45309" solid />
              <Text style={[styles.badgeText, { color: '#92400E' }]}>{p.rankLabel}</Text>
            </View>
          ) : null}
          {p.xp != null ? (
            <View style={[styles.badge, { backgroundColor: c.chipBg }]}>
              <Icon name="star" size={12} color="#f59e0b" solid />
              <Text style={[styles.badgeText, { color: c.text }]}>{p.xp.toLocaleString()} XP</Text>
            </View>
          ) : null}
          {p.streak != null ? (
            <View style={[styles.badge, { backgroundColor: c.chipBg }]}>
              <Text style={styles.badgeEmoji}>🔥</Text>
              <Text style={[styles.badgeText, { color: c.text }]}>{p.streak}d Streak</Text>
            </View>
          ) : null}
          {p.coursesCount != null && p.coursesCount > 0 ? (
            <View style={[styles.badge, { backgroundColor: c.chipBg }]}>
              <Icon name="book" size={12} color={c.primary} solid />
              <Text style={[styles.badgeText, { color: c.text }]}>{p.coursesCount} Courses</Text>
            </View>
          ) : null}
          {p.rank != null && !p.rankLabel ? (
            <View style={[styles.badge, { backgroundColor: c.chipBg }]}>
              <Icon name="trophy" size={12} color="#f59e0b" solid />
              <Text style={[styles.badgeText, { color: c.text }]}>Rank #{p.rank}</Text>
            </View>
          ) : null}
        </View>

        {p.examReadiness != null ? (
          <View style={[styles.readinessPill, { backgroundColor: `${c.primary}12`, borderColor: c.primary }]}>
            <Text style={[styles.readinessVal, { color: c.primary }]}>{p.examReadiness}%</Text>
            <Text style={[styles.readinessLbl, { color: c.textMuted }]}>Exam ready</Text>
          </View>
        ) : null}
      </View>

      {editing && (
        <View style={[styles.editCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.editTitle, { color: c.text }]}>Edit Profile</Text>

          <Text style={[styles.label, { color: c.text }]}>Full Name</Text>
          <View style={[styles.inputRow, { backgroundColor: c.background, borderColor: c.border }]}>
            <Icon name="user" size={14} color={c.textMuted} solid />
            <TextInput
              style={[styles.input, { color: c.text }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={c.textMuted}
            />
          </View>

          <Text style={[styles.label, { color: c.text }]}>Email</Text>
          <View style={[styles.inputRow, { backgroundColor: c.background, borderColor: c.border }]}>
            <Icon name="envelope" size={14} color={c.textMuted} solid />
            <TextInput
              style={[styles.input, { color: c.text }]}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="email@example.com"
              placeholderTextColor={c.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.editActions}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: c.border }]} onPress={() => setEditing(false)}>
              <Text style={[styles.cancelBtnText, { color: c.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: c.primary }, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!editing && (
        <View style={styles.infoSection}>
          <Text style={[styles.sectionHead, { color: c.text }]}>Personal details</Text>
          <UseCurrentLocationButton
            label="Update address from location"
            syncToServer
            onResolved={async parsed => {
              try {
                await studentService.updateProfile({
                  address: parsed.address,
                  postOffice: parsed.postOffice,
                  city: parsed.city,
                  landmark: parsed.landmark,
                  state: parsed.state,
                  stateName: parsed.state,
                  pinCode: parsed.pinCode,
                });
                await refreshUser();
                refetch();
                Alert.alert('Location', 'Address updated from your current location.');
              } catch (err: any) {
                Alert.alert('Location', err?.message || 'Could not save address');
              }
            }}
          />
          <View style={[styles.infoCard, { backgroundColor: c.card, borderColor: c.border }]}>
            {detailRows.map((row, i) => (
              <View key={row.label}>
                {i > 0 ? <Divider borderColor={c.borderLight} /> : null}
                <InfoRow
                  icon={row.icon}
                  label={row.label}
                  value={row.value || '—'}
                  color={c.primary}
                  textColor={c.text}
                  mutedColor={c.textMuted}
                  borderColor={c.borderLight}
                />
              </View>
            ))}
          </View>

          <Text style={[styles.sectionHead, { color: c.text }]}>Performance</Text>
          <View style={[styles.statsCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.statsGrid}>
              <StatBox label="Accuracy" value={`${p.accuracy ?? 0}%`} color="#6366f1" bgColor={c.background} mutedColor={c.textMuted} />
              <StatBox label="Attempts" value={String(p.totalAttempts ?? 0)} color="#f59e0b" bgColor={c.background} mutedColor={c.textMuted} />
              <StatBox label="Topics" value={String(p.topicsCompleted ?? 0)} color="#10b981" bgColor={c.background} mutedColor={c.textMuted} />
              <StatBox label="Doubts" value={String(p.totalDoubts ?? 0)} color="#f43f5e" bgColor={c.background} mutedColor={c.textMuted} />
            </View>
            {p.dailyStudyHours != null ? (
              <Text style={[styles.statFoot, { color: c.textMuted }]}>
                Daily study target: {p.dailyStudyHours}h
              </Text>
            ) : null}
          </View>

          <View style={[styles.actionsCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <ActionRow icon="bell" label="Notifications" onPress={() => navigation.navigate('Notifications' as never)} textColor={c.text} mutedColor={c.textMuted} borderColor={c.borderLight} dangerColor={c.danger} />
            <Divider borderColor={c.borderLight} />
            <ActionRow icon="shield-alt" label="Privacy & Security" onPress={() => {}} textColor={c.text} mutedColor={c.textMuted} borderColor={c.borderLight} dangerColor={c.danger} />
            <Divider borderColor={c.borderLight} />
            <ActionRow icon="question-circle" label="Help & Support" onPress={() => {}} textColor={c.text} mutedColor={c.textMuted} borderColor={c.borderLight} dangerColor={c.danger} />
            <Divider borderColor={c.borderLight} />
            <ActionRow icon="sign-out-alt" label="Logout" onPress={handleLogout} danger textColor={c.text} mutedColor={c.textMuted} borderColor={c.borderLight} dangerColor={c.danger} />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const InfoRow: React.FC<{
  icon: string; label: string; value?: string;
  color: string; textColor: string; mutedColor: string; borderColor: string;
}> = ({ icon, label, value, color, textColor, mutedColor }) => (
  <View style={styles.infoRow}>
    <IconBadge name={icon} color={color} size="sm" variant="soft" />
    <View style={{ flex: 1 }}>
      <Text style={[styles.infoLabel, { color: mutedColor }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: textColor }]}>{value || '—'}</Text>
    </View>
  </View>
);

const ActionRow: React.FC<{
  icon: string; label: string; onPress: () => void; danger?: boolean;
  textColor: string; mutedColor: string; borderColor: string; dangerColor: string;
}> = ({ icon, label, onPress, danger, textColor, mutedColor, borderColor, dangerColor }) => (
  <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
    <Icon name={icon} size={16} color={danger ? dangerColor : mutedColor} solid />
    <Text style={[styles.actionLabel, { color: danger ? dangerColor : textColor }]}>{label}</Text>
    <Icon name="chevron-right" size={12} color={borderColor} solid />
  </TouchableOpacity>
);

const StatBox: React.FC<{ label: string; value: string; color: string; bgColor: string; mutedColor: string }> = ({ label, value, color, bgColor, mutedColor }) => (
  <View style={[styles.statBox, { backgroundColor: bgColor }]}>
    <Text style={[styles.statBoxValue, { color }]}>{value}</Text>
    <Text style={[styles.statBoxLabel, { color: mutedColor }]}>{label}</Text>
  </View>
);

const Divider = ({ borderColor }: { borderColor: string }) => (
  <View style={[styles.divider, { backgroundColor: borderColor }]} />
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    paddingHorizontal: spacing.xl,
    paddingBottom: vs(28),
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    position: 'absolute',
    left: pagePadding,
    width: layout.avatarSm,
    height: layout.avatarSm,
    borderRadius: layout.avatarSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  menuBtn: {
    position: 'absolute',
    right: pagePadding,
    width: layout.avatarSm,
    height: layout.avatarSm,
    borderRadius: layout.avatarSm / 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  avatarWrap: { position: 'relative', marginBottom: vs(12) },
  avatar: {
    width: layout.avatarLg,
    height: layout.avatarLg,
    borderRadius: layout.avatarLg / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInitials: { fontSize: font.headline, fontWeight: '800' },
  editAvatarBtn: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: hs(26),
    height: hs(26),
    borderRadius: hs(13),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  bannerName: { fontSize: font.title, fontWeight: '800', marginBottom: vs(4) },
  bannerPhone: { fontSize: font.tiny, marginBottom: vs(8), textAlign: 'center' },
  bio: {
    fontSize: font.caption,
    textAlign: 'center',
    lineHeight: ms(18),
    marginBottom: vs(10),
    paddingHorizontal: hs(8),
  },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: hs(8) },
  readinessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    marginTop: vs(10),
    paddingHorizontal: hs(14),
    paddingVertical: vs(8),
    borderRadius: ms(20),
    borderWidth: 1,
  },
  readinessVal: { fontSize: font.subhead, fontWeight: '900' },
  readinessLbl: { fontSize: font.caption, fontWeight: '600' },
  sectionHead: { fontSize: font.body, fontWeight: '800', marginBottom: vs(8) },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(5),
    paddingHorizontal: hs(10),
    paddingVertical: vs(5),
    borderRadius: ms(14),
  },
  badgeEmoji: { fontSize: font.caption },
  badgeText: { fontSize: font.caption, fontWeight: '700' },
  editCard: { margin: spacing.md, borderRadius: BorderRadius.xl, padding: spacing.lg, borderWidth: 1, ...Shadow.soft },
  editTitle: { fontSize: font.subhead, fontWeight: '800', marginBottom: vs(16) },
  label: { fontSize: font.caption, fontWeight: '700', marginBottom: vs(6), marginTop: vs(10) },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: spacing.md,
    height: vs(48),
    borderWidth: 1.5,
    gap: hs(8),
  },
  input: { flex: 1, fontSize: font.body },
  editActions: { flexDirection: 'row', gap: hs(10), marginTop: vs(20) },
  cancelBtn: {
    flex: 1,
    height: vs(46),
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontSize: font.body, fontWeight: '700' },
  saveBtn: {
    flex: 1,
    height: vs(46),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontSize: font.body, fontWeight: '700', color: '#fff' },
  infoSection: { padding: spacing.md, gap: vs(14) },
  infoCard: { borderRadius: BorderRadius.xl, padding: ms(4), borderWidth: 1, ...Shadow.soft },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: hs(12), padding: spacing.md },
  infoLabel: { fontSize: font.tiny, fontWeight: '600', marginBottom: vs(2) },
  infoValue: { fontSize: font.body, fontWeight: '600' },
  statsCard: { borderRadius: BorderRadius.xl, padding: spacing.md, borderWidth: 1, ...Shadow.soft },
  statFoot: { fontSize: font.tiny, fontWeight: '600', marginTop: vs(12), textAlign: 'center' },
  statsGrid: { flexDirection: 'row', gap: hs(8) },
  statBox: { flex: 1, alignItems: 'center', borderRadius: BorderRadius.md, padding: spacing.sm, gap: vs(4) },
  statBoxValue: { fontSize: font.subhead, fontWeight: '800' },
  statBoxLabel: { fontSize: font.micro, fontWeight: '600' },
  actionsCard: { borderRadius: BorderRadius.xl, padding: ms(4), borderWidth: 1, ...Shadow.soft },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: hs(12), padding: spacing.md },
  actionLabel: { flex: 1, fontSize: font.body, fontWeight: '600' },
  divider: { height: 1, marginHorizontal: spacing.md },
});

export default ProfileScreen;
