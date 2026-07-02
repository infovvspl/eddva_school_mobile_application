import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { initPushNotifications } from '../services/pushNotifications';
import { startInboxNotificationSync } from '../services/notificationInboxSync';
import { navigateRoot } from '../navigation/navigationRef';

/** Push (FCM) + inbox polling for tray notifications when logged in. */
const AppServicesBootstrap = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const pushStarted = useRef(false);
  const stopInboxSync = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      pushStarted.current = false;
      stopInboxSync.current?.();
      stopInboxSync.current = null;
      return;
    }

    const openNotifications = () => navigateRoot('Notifications');

    if (!pushStarted.current) {
      pushStarted.current = true;
      initPushNotifications({ onNotificationOpen: openNotifications }).catch(() => {
        pushStarted.current = false;
      });
      stopInboxSync.current = startInboxNotificationSync();
    }

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && isAuthenticated) {
        initPushNotifications({ onNotificationOpen: openNotifications }).catch(() => {});
      }
    });

    return () => {
      sub.remove();
    };
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    return () => {
      stopInboxSync.current?.();
    };
  }, []);

  return null;
};

export default AppServicesBootstrap;
