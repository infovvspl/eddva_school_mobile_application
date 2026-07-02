import { USE_MOCK } from '../config/appConfig';
import { mockAuthService } from '../mocks/mockAuthService';
import api from './api';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: any;
}

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return phone.trim();
};

const phoneCandidates = (phone: string) => {
  const raw = phone.trim();
  const digits = raw.replace(/\D/g, '');
  const values = new Set<string>();

  if (raw) values.add(raw);
  if (digits.length === 10) {
    values.add(digits);
    values.add(`91${digits}`);
    values.add(`+91${digits}`);
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    values.add(digits);
    values.add(`+${digits}`);
    values.add(digits.slice(2));
  }

  values.add(formatPhone(raw));
  return Array.from(values).filter(Boolean);
};

const isEmailIdentifier = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const realAuthService = {
  sendOtp: (phone: string) =>
    api.post('/auth/otp/send', { phoneNumber: formatPhone(phone) }),

  verifyOtp: (phone: string, otp: string): Promise<{ data: AuthTokens }> =>
    api.post('/auth/otp/verify', { phoneNumber: formatPhone(phone), otp }),

  login: async (identifier: string, password: string): Promise<{ data: AuthTokens }> => {
    const raw = identifier.trim();
    const requestBodies = isEmailIdentifier(raw)
      ? [
          { email: raw.toLowerCase(), password },
          { identifier: raw.toLowerCase(), password },
        ]
      : phoneCandidates(raw).flatMap(candidate => [
          { phoneNumber: candidate, password },
          { identifier: candidate, password },
        ]);
    let lastErr: any;

    for (const payload of requestBodies) {
      try {
        return await api.post('/auth/login', payload);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status !== 401 && status !== 400) throw err;
        lastErr = err;
      }
    }

    throw lastErr;
  },

  register: (payload: {
    fullName: string;
    careOf: string;
    phoneNumber: string;
    email: string;
    address: string;
    postOffice: string;
    city: string;
    landmark: string;
    state: string;
    pinCode: string;
    password: string;
    alternatePhoneNumber?: string;
  }) => api.post('/auth/register', payload),

  onboard: (payload: {
    examTarget: string;
    class: string;
    examYear: string;
    dailyStudyHours: number;
    targetCollege?: string;
    language?: string;
    city?: string;
    state?: string;
  }) => api.post('/auth/onboard', payload),

  getMe: () => api.get('/auth/me'),

  logout: (_refreshToken?: string) => api.post('/auth/logout'),

  setPassword: (password: string) => api.post('/auth/password', { password }),

  requestPasswordReset: (email: string) => api.post('/auth/forgot-password', { email }),

  confirmPasswordReset: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),

  updateProfile: (payload: { name?: string; email?: string }) =>
    api.patch('/auth/profile', payload),

  uploadProfileAvatar: (file: {
    uri: string;
    type?: string;
    name?: string;
  }) => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.name || 'avatar.jpg',
    } as any);
    return api.post('/auth/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const authService = USE_MOCK ? mockAuthService : realAuthService;
