import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import EDDVAScreenHeader from '../components/EDDVAScreenHeader';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/notification.service';
import {
  fetchMergedNotifications,
  markCalendarNotificationsSeen,
} from '../services/notificationFeed.service';
import type { AppNotification } from '../types/notification';
import { BorderRadius, Shadow } from '../constants/theme';
import { font, hs, ms, spacing, vs } from '../utils/responsive';
import {
  checkNotificationPermission,
  requestNotificationPermission,
} from '../utils/permissions';
import {
  resetInboxNotificationBaseline,
  syncNotificationTrayBaseline,
} from '../services/notificationInboxSync';
import { initPushNotifications } from '../services/pushNotifications';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifAllowed, setNotifAllowed] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const merged = await fetchMergedNotifications(50);
      setNotifications(merged);
      await syncNotificationTrayBaseline(merged);
      await markCalendarNotificationsSeen(
        merged.filter(n => n.id.startsWith('cal-')).map(n => n.id),
      );
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications],
  );

  const refreshPermission = useCallback(async () => {
    setNotifAllowed(await checkNotificationPermission());
  }, []);

  const enableAppNotifications = async () => {
    const ok = await requestNotificationPermission();
    setNotifAllowed(ok);
    if (ok) {
      await initPushNotifications();
      await resetInboxNotificationBaseline();
    } else if (Platform.OS === 'android') {
      Linking.openSettings();
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
      refreshPermission();
      requestNotificationPermission().then(granted => {
        if (granted) initPushNotifications().catch(() => {});
      });
    }, [load, refreshPermission]),
  );

  const openNotification = async (item: AppNotification) => {
    if (!item.read && !item.id.startsWith('cal-')) {
      try {
        await notificationService.markRead(item.id);
        load();
      } catch {
        /* keep UI usable */
      }
    }
    if (item.routeName) {
      navigation.navigate(item.routeName as never, item.routeParams as never);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      await markCalendarNotificationsSeen(
        notifications.filter(n => n.id.startsWith('cal-')).map(n => n.id),
      );
      load();
    } catch {
      /* ignore */
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <EDDVAScreenHeader
        title="Notifications"
        subtitle={
          loading && notifications.length === 0
            ? 'Loading…'
            : unreadCount > 0
              ? `${unreadCount} unread`
              : 'All caught up'
        }
        onBack={() => navigation.goBack()}
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={[styles.markAll, { color: c.primary }]}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={c.primary} />
        }
      >
        {notifAllowed === false ? (
          <View style={[styles.permissionCard, { backgroundColor: `${c.primary}12`, borderColor: c.border }]}>
            <Icon name="bell-slash" size={ms(20)} color={c.primary} solid />
            <View style={{ flex: 1 }}>
              <Text style={[styles.permissionTitle, { color: c.text }]}>App alerts are off</Text>
              <Text style={[styles.permissionSub, { color: c.textMuted }]}>
                Turn on notifications for class updates and calendar reminders.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.enableBtn, { backgroundColor: c.primary }]}
              onPress={enableAppNotifications}
            >
              <Text style={styles.enableBtnText}>Enable</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={[styles.hint, { color: c.textMuted }]}>
          Includes calendar events and messages from your institute.
        </Text>

        {loading && notifications.length === 0 ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: vs(32) }} />
        ) : error && notifications.length === 0 ? (
          <View style={styles.emptyWrap}>
            <IconBadgePlaceholder color={c.primary} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>Could not load notifications</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: c.primary }]} onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyWrap}>
            <IconBadgePlaceholder color={c.primary} />
            <Text style={[styles.emptyTitle, { color: c.text }]}>No notifications yet</Text>
            <Text style={[styles.emptySub, { color: c.textMuted }]}>
              Calendar events and institute updates will appear here.
            </Text>
          </View>
        ) : (
          notifications.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                { backgroundColor: c.card, borderColor: c.border },
                !item.read && { borderColor: `${c.primary}50` },
              ]}
              activeOpacity={0.85}
              onPress={() => openNotification(item)}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${item.iconColor}18` }]}>
                <Icon name={item.icon} size={ms(18)} color={item.iconColor} solid />
              </View>
              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {!item.read ? <View style={[styles.dot, { backgroundColor: c.primary }]} /> : null}
                </View>
                {item.body ? (
                  <Text style={[styles.body, { color: c.textMuted }]} numberOfLines={2}>
                    {item.body}
                  </Text>
                ) : null}
                {item.time ? (
                  <Text style={[styles.time, { color: c.textMuted }]}>{item.time}</Text>
                ) : null}
                {item.id.startsWith('cal-') ? (
                  <Text style={[styles.calTag, { color: c.primary }]}>Calendar</Text>
                ) : null}
              </View>
              {item.routeName ? (
                <Icon name="chevron-right" size={ms(12)} color={c.textMuted} solid />
              ) : null}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const IconBadgePlaceholder = ({ color }: { color: string }) => (
  <View style={[styles.emptyIcon, { backgroundColor: `${color}18` }]}>
    <Icon name="bell" size={ms(28)} color={color} solid />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: vs(32), gap: vs(10) },
  markAll: { fontSize: font.tiny, fontWeight: '800' },
  hint: { fontSize: font.tiny, marginBottom: vs(4), lineHeight: ms(16) },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: vs(8),
  },
  permissionTitle: { fontSize: font.caption, fontWeight: '800', marginBottom: vs(4) },
  permissionSub: { fontSize: font.tiny, lineHeight: ms(16) },
  enableBtn: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(8),
    borderRadius: BorderRadius.md,
  },
  enableBtnText: { color: '#fff', fontSize: font.tiny, fontWeight: '800' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  iconWrap: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: hs(8) },
  title: { flex: 1, fontSize: font.subhead, fontWeight: '700' },
  dot: { width: ms(8), height: ms(8), borderRadius: ms(4) },
  body: { fontSize: font.caption, marginTop: vs(4), lineHeight: ms(18) },
  time: { fontSize: font.tiny, marginTop: vs(6) },
  calTag: { fontSize: font.micro, fontWeight: '800', marginTop: vs(4), textTransform: 'uppercase' },
  emptyWrap: { alignItems: 'center', paddingVertical: vs(40), gap: vs(10) },
  emptyIcon: {
    width: hs(64),
    height: hs(64),
    borderRadius: ms(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(8),
  },
  emptyTitle: { fontSize: font.subhead, fontWeight: '800' },
  emptySub: { fontSize: font.caption, textAlign: 'center', paddingHorizontal: spacing.lg },
  retryBtn: { marginTop: vs(12), paddingHorizontal: hs(20), paddingVertical: vs(10), borderRadius: BorderRadius.md },
  retryText: { color: '#fff', fontWeight: '800', fontSize: font.caption },
});

export default NotificationsScreen;
