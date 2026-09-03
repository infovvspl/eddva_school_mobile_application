import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@eddva/auth_token';
const ROLE_KEY = '@eddva/auth_role';
const INSTITUTE_KEY = '@eddva/institute_id';

export type Session = {
  token: string;
  role: 'student' | 'teacher';
  // Every API call must carry this as the X-Institute-Id header, so it has to
  // survive a restart alongside the token or the restored session is unusable.
  instituteId?: string;
};

/**
 * Persist the session so it survives a reload or app restart. Storage failures
 * are swallowed on purpose: the in-memory token is already set by the caller,
 * so a failed write costs the user persistence, not the current session.
 */
export const saveSession = async (session: Session): Promise<void> => {
  try {
    // 2.2.0's batch API is array-of-tuples (multiSet/multiGet/multiRemove);
    // the object-shaped setMany/getMany/removeMany convenience methods were
    // only added in a later major than this project's pinned version.
    await AsyncStorage.multiSet([
      [TOKEN_KEY, session.token],
      [ROLE_KEY, session.role],
      [INSTITUTE_KEY, session.instituteId ?? ''],
    ]);
  } catch (e) {
    console.warn('[session] failed to persist session', e);
  }
};

export const loadSession = async (): Promise<Session | null> => {
  try {
    const stored = Object.fromEntries(
      await AsyncStorage.multiGet([TOKEN_KEY, ROLE_KEY, INSTITUTE_KEY]),
    );
    const token = stored[TOKEN_KEY];
    if (!token) return null;
    return {
      token,
      role: stored[ROLE_KEY] === 'teacher' ? 'teacher' : 'student',
      instituteId: stored[INSTITUTE_KEY] || undefined,
    };
  } catch (e) {
    console.warn('[session] failed to read session', e);
    return null;
  }
};

export const clearSession = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY, INSTITUTE_KEY]);
  } catch (e) {
    console.warn('[session] failed to clear session', e);
  }
};
