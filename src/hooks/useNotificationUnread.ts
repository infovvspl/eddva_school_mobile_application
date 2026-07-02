import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { fetchMergedUnreadCount } from '../services/notificationFeed.service';

/** Unread API notifications + unseen calendar events. */
export function useNotificationUnread(refreshOnFocus = true) {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(() => {
    fetchMergedUnreadCount()
      .then(count => setUnread(count))
      .catch(() => setUnread(0));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      if (refreshOnFocus) refresh();
    }, [refresh, refreshOnFocus]),
  );

  return { unread, refresh };
}
