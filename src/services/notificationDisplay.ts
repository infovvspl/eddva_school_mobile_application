import { Platform } from 'react-native';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';

export const EDDVA_NOTIFICATION_CHANNEL = 'eddva_default';

/** Full-color logo for circular large icon on the right. */
const EDDVA_LOGO = require('../assets/eddva_logo.png');

let channelReady = false;

/** Create Android channel early so FCM system notifications can display. */
export async function ensureNotificationChannel(): Promise<void> {
  if (channelReady) return;
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: EDDVA_NOTIFICATION_CHANNEL,
      name: 'EDDVA',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  }
  channelReady = true;
}

export async function displayLocalNotification(
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  await ensureNotificationChannel();

  const now = Date.now();

  await notifee.displayNotification({
    title,
    body,
    data,
    android: {
      channelId: EDDVA_NOTIFICATION_CHANNEL,
      pressAction: { id: 'default' },
      /** Branded silhouette + blue circle (like PhonePe / Zomato left icon). */
      smallIcon: 'ic_stat_eddva',
      largeIcon: 'ic_eddva_large',
      circularLargeIcon: true,

      importance: AndroidImportance.HIGH,
      showTimestamp: true,
      timestamp: now,
      style: {
        type: AndroidStyle.BIGTEXT,
        text: body,
      },
    },
    ios: {
      sound: 'default',
      attachments: [
        {
          url: EDDVA_LOGO,
          thumbnailHidden: false,
        },
      ],
    },
  });
}
