import { mockDelay } from './delay';
import { MOCK_USER_ENROLLED } from './catalog';
import { hasAnyEnrollment } from './mockStore';
import { MOCK_USER } from './catalog';

const TOKENS = {
  accessToken: 'mock-access-token-demo',
  refreshToken: 'mock-refresh-token-demo',
};

export const mockAuthService = {
  login: async () => {
    await mockDelay();
    const user = hasAnyEnrollment() ? MOCK_USER_ENROLLED : MOCK_USER;
    return { data: { ...TOKENS, user } };
  },

  register: async () => {
    await mockDelay();
    return { data: { message: 'OTP sent (demo)' } };
  },

  sendOtp: async () => {
    await mockDelay();
    return { data: { message: 'OTP sent' } };
  },

  verifyOtp: async () => {
    await mockDelay();
    const user = hasAnyEnrollment() ? MOCK_USER_ENROLLED : MOCK_USER;
    return { data: { ...TOKENS, user } };
  },

  onboard: async () => {
    await mockDelay();
    return { data: { ...TOKENS, user: MOCK_USER } };
  },

  getMe: async () => {
    await mockDelay();
    return { data: hasAnyEnrollment() ? MOCK_USER_ENROLLED : MOCK_USER };
  },

  logout: async () => {
    await mockDelay();
    return { data: { success: true } };
  },

  setPassword: async () => {
    await mockDelay();
    return { data: { success: true } };
  },

  requestPasswordReset: async () => {
    await mockDelay();
    return { data: { success: true } };
  },

  confirmPasswordReset: async () => {
    await mockDelay();
    return { data: { success: true } };
  },

  uploadProfileAvatar: async () => {
    await mockDelay();
    return { data: { avatarUrl: 'https://example.com/mock-avatar.jpg' } };
  },

  refresh: async () => {
    await mockDelay();
    return { data: TOKENS };
  },
};
