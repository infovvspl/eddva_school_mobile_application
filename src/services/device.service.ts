import { Platform } from 'react-native';
import { USE_MOCK } from '../config/appConfig';
import api from './api';

export type PushRegistrationPayload = {
  token: string;
  platform: 'ios' | 'android';
};

export type LocationPayload = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

async function tryEndpoints<T>(
  attempts: Array<() => Promise<{ data: T }>>,
): Promise<{ data: T; endpoint: string } | null> {
  const paths = [
    '/devices/register',
    '/notifications/register-device',
    '/notifications/device-token',
    '/students/device-token',
    '/students/fcm-token',
    '/students/push-token',
    '/auth/device/register',
  ];
  for (let i = 0; i < attempts.length; i++) {
    try {
      const res = await attempts[i]();
      if (__DEV__) console.log('[device] push token saved via', paths[i] ?? i);
      return { data: res.data, endpoint: paths[i] ?? String(i) };
    } catch {
      /* try next */
    }
  }
  return null;
}

function pushBody(payload: PushRegistrationPayload) {
  return {
    fcmToken: payload.token,
    deviceToken: payload.token,
    pushToken: payload.token,
    token: payload.token,
    platform: payload.platform,
    deviceType: payload.platform,
    os: payload.platform,
    app: 'student',
    appType: 'student',
  };
}

export const deviceService = {
  registerPushToken: async (payload: PushRegistrationPayload) => {
    if (USE_MOCK) return { data: { ok: true } };
    const body = pushBody(payload);
    const result = await tryEndpoints([
      () => api.post('/devices/register', body),
      () => api.post('/notifications/register-device', body),
      () => api.post('/notifications/device-token', body),
      () => api.post('/students/device-token', body),
      () => api.post('/students/fcm-token', body),
      () => api.post('/students/push-token', { ...body, fcm_token: payload.token }),
      () => api.post('/auth/device/register', body),
      () => api.patch('/students/profile', body),
    ]);
    if (!result) {
      console.warn(
        '[device] Push token NOT saved on server — backend must expose a device/FCM register route',
      );
    }
    return result ?? { data: { ok: false } };
  },

  unregisterPushToken: async (token: string) => {
    if (USE_MOCK) return;
    const body = { token, fcmToken: token, deviceToken: token };
    for (const path of ['/devices/unregister', '/notifications/unregister-device']) {
      try {
        await api.post(path, body);
        return;
      } catch {
        /* next */
      }
    }
  },

  reportLocation: async (payload: LocationPayload) => {
    if (USE_MOCK) return { data: { ok: true } };
    const body = {
      latitude: payload.latitude,
      longitude: payload.longitude,
      lat: payload.latitude,
      lng: payload.longitude,
      accuracy: payload.accuracy,
    };
    const attempts = [
      () => api.post('/students/location', body),
      () => api.patch('/students/profile', body),
      () => api.post('/auth/location', body),
    ];
    for (const fn of attempts) {
      try {
        return await fn();
      } catch {
        /* next */
      }
    }
    return null;
  },
};

export const devicePlatform = Platform.OS === 'ios' ? 'ios' : 'android';
