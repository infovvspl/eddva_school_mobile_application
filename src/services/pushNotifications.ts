import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { EventType } from '@notifee/react-native';
import { deviceService, devicePlatform } from './device.service';
import {
  displayLocalNotification,
  ensureNotificationChannel,
} from './notificationDisplay';
import { requestNotificationPermission } from '../utils/permissions';

const FCM_TOKEN_KEY = 'fcmToken';

type FirebaseMessaging = typeof import('@react-native-firebase/messaging').default;
type RemoteMessage = import('@react-native-firebase/messaging').FirebaseMessagingTypes.RemoteMessage;

function getMessaging(): FirebaseMessaging | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@react-native-firebase/messaging').default as FirebaseMessaging;
  } catch {
    return null;
  }
}

export function extractPushContent(message: RemoteMessage): { title: string; body: string } {
  const n = message.notification;
  const d = message.data ?? {};
  const pick = (key: string) => {
    const v = d[key];
    return typeof v === 'string' && v.trim() ? v.trim() : '';
  };
  const title = n?.title || pick('title') || pick('subject') || pick('heading') || 'EDDVA';
  const body =
    n?.body ||
    pick('body') ||
    pick('message') ||
    pick('content') ||
    pick('description') ||
    'You have a new notification';
  return { title, body };
}

let listenersAttached = false;
let pushSetupDone = false;

function attachNotifeeOpenHandler(onOpen?: () => void) {
  if (listenersAttached) return;
  listenersAttached = true;
  notifee.onForegroundEvent(({ type }) => {
    if (type === EventType.PRESS) onOpen?.();
  });
}

export async function getStoredFcmToken(): Promise<string | null> {
  return AsyncStorage.getItem(FCM_TOKEN_KEY);
}

async function registerTokenWithBackend(token: string) {
  await deviceService.registerPushToken({ token, platform: devicePlatform });
}

export async function initPushNotifications(options?: {
  onNotificationOpen?: () => void;
}): Promise<string | null> {
  await ensureNotificationChannel();

  const messaging = getMessaging();
  if (!messaging) {
    console.warn('[push] Firebase Messaging unavailable');
    return null;
  }

  attachNotifeeOpenHandler(options?.onNotificationOpen);

  const notifGranted = await requestNotificationPermission();
  if (!notifGranted) {
    console.warn('[push] Notification permission denied');
    return null;
  }

  if (Platform.OS === 'ios') {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) return null;
    } catch {
      return null;
    }
  }

  let token: string | null = null;
  try {
    token = await messaging().getToken();
  } catch (e) {
    console.warn('[push] FCM getToken failed', e);
    return null;
  }

  if (token) {
    await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
    await registerTokenWithBackend(token);
  }

  if (!pushSetupDone) {
    pushSetupDone = true;

    messaging().onTokenRefresh(async newToken => {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);
      await registerTokenWithBackend(newToken);
    });

    messaging().onMessage(async remoteMessage => {
      const { title, body } = extractPushContent(remoteMessage);
      const data: Record<string, string> = {};
      Object.entries(remoteMessage.data || {}).forEach(([k, v]) => {
        if (typeof v === 'string') data[k] = v;
      });
      await displayLocalNotification(title, body, data);
    });

    messaging().onNotificationOpenedApp(() => {
      options?.onNotificationOpen?.();
    });

    messaging()
      .getInitialNotification()
      .then(initial => {
        if (initial) options?.onNotificationOpen?.();
      })
      .catch(() => {});
  } else if (token) {
    await registerTokenWithBackend(token);
  }

  return token;
}

export async function unregisterPushNotifications() {
  const token = await getStoredFcmToken();
  if (token) await deviceService.unregisterPushToken(token);
  const messaging = getMessaging();
  if (messaging) {
    try {
      await messaging().deleteToken();
    } catch {
      /* ignore */
    }
  }
  await AsyncStorage.removeItem(FCM_TOKEN_KEY);
}
