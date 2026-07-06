/**
 * @format
 */

<<<<<<< HEAD
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

try {
  const messaging = require('@react-native-firebase/messaging').default;
  const { displayLocalNotification, ensureNotificationChannel } = require('./src/services/notificationDisplay');

  ensureNotificationChannel().catch(() => {});

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    try {
      const n = remoteMessage.notification;
      const d = remoteMessage.data || {};
      const title =
        n?.title ||
        (typeof d.title === 'string' ? d.title : null) ||
        (typeof d.subject === 'string' ? d.subject : null) ||
        'EDDVA';
      const body =
        n?.body ||
        (typeof d.body === 'string' ? d.body : null) ||
        (typeof d.message === 'string' ? d.message : null) ||
        'You have a new notification';
      await displayLocalNotification(String(title), String(body));
    } catch {
      /* optional */
    }
  });
} catch {
  /* Firebase not linked */
}
=======
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
>>>>>>> 19c8277 (Initial commit)

AppRegistry.registerComponent(appName, () => App);
