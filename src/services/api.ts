import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://dev-api.eddva.in';
const API_VERSION = '/api/v1';

const api = axios.create({
  baseURL: `${BASE_URL}${API_VERSION}`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

/** API returns { success, data, message } — unwrap to inner `data` for callers */
const unwrap = (body: any) => {
  if (body != null && typeof body === 'object' && 'success' in body && 'data' in body) {
    return body.data;
  }
  return body;
};

const stripHtml = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const htmlTitle = (value: string) => {
  const match = value.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? stripHtml(match[1]) : '';
};

export const getApiErrorMessage = (
  error: any,
  fallback = 'Something went wrong. Please try again.',
) => {
  const status = error?.response?.status;
  const body = error?.response?.data;

  if (status === 502 || status === 503 || status === 504) {
    return 'Server is temporarily unavailable. Please try again in a few minutes.';
  }

  if (body && typeof body === 'object') {
    if (typeof body.message === 'string' && body.message.trim()) return body.message.trim();
    if (typeof body.error === 'string' && body.error.trim()) return body.error.trim();
  }

  if (typeof body === 'string' && body.trim()) {
    const trimmed = body.trim();
    if (/<html[\s>]/i.test(trimmed) || /<body[\s>]/i.test(trimmed)) {
      return htmlTitle(trimmed) || fallback;
    }
    return trimmed;
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
};

const isAuthRoute = (url?: string) =>
  !!url && /\/auth\/(login|register|otp|refresh|logout|password|forgot|reset)/.test(url);

// Attach token and tenant subdomain to every request
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Send tenant subdomain so the backend resolves the correct tenant
  // (web app gets this from the URL hostname; mobile must send it explicitly)
  const tenantCode = await AsyncStorage.getItem('eddva_tenant_code');
  if (tenantCode) config.headers['X-Tenant-Subdomain'] = tenantCode;

  return config;
});

api.interceptors.response.use(
  res => {
    res.data = unwrap(res.data);
    return res;
  },
  async error => {
    const original = error.config;
    const status = error.response?.status;

    // Don't retry token refresh on login/register/OTP calls
    if (status === 401 && original && !original._retry && !isAuthRoute(original.url)) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data: raw } = await axios.post(
          `${BASE_URL}${API_VERSION}/auth/refresh`,
          { refreshToken },
        );
        const tokens = unwrap(raw);
        await AsyncStorage.setItem('accessToken', tokens.accessToken);
        if (tokens.refreshToken) {
          await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
        }
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(original);
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      }
    }

    error.message = getApiErrorMessage(error, error.message);

    return Promise.reject(error);
  },
);

export default api;
