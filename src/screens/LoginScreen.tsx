import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Mail, Lock, Eye, EyeOff, Check, GraduationCap, UserCog,
  ScanFace, TriangleAlert, ArrowRight,
} from 'lucide-react-native';
import { hs, vs, ms } from '../utils/responsive';
import { useAppTheme } from '../context/ThemeContext';
import ReactNativeBiometrics from 'react-native-biometrics';
import { schoolApi, setAuthToken, clearAuthToken } from '../utils/api';

// Confirmed live against a real account: the server's role field is a
// comma-joined uppercase list, e.g. "STUDENT" or "TEACHER,INSTITUTE_ADMIN".
// Anything carrying TEACHER or ADMIN belongs on the teacher side of the app;
// there is no third UI to send an institute admin to.
const isTeacherRole = (roleStr: string) => /TEACHER|ADMIN/i.test(roleStr || '');
import { HeaderBackdrop } from '../components/HeaderBackdrop';

export function LoginScreen({ onLogin }: { onLogin: (role: string) => void; }) {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [heroSize, setHeroSize] = useState({ w: 0, h: 0 });

  // A button offering Face ID/Touch ID is only shown once a sensor is
  // confirmed present; otherwise every tap would just fail with "not available".
  const [biometry, setBiometry] = useState<{ available: boolean; label: string }>({
    available: false,
    label: 'Biometrics',
  });

  useEffect(() => {
    new ReactNativeBiometrics()
      .isSensorAvailable()
      .then(({ available, biometryType }) => {
        setBiometry({
          available: !!available,
          label:
            biometryType === 'FaceID' ? 'Face ID'
            : biometryType === 'TouchID' ? 'Touch ID'
            : 'Biometrics',
        });
      })
      .catch(() => setBiometry({ available: false, label: 'Biometrics' }));
  }, []);

  const handleBiometricLogin = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { success } = await rnBiometrics.simplePrompt({ promptMessage: `Login with ${biometry.label}` });
      if (success) {
        setAuthToken('biometric-token-12345', role);
        onLogin(role);
      }
    } catch {
      setError(`Could not verify your ${biometry.label.toLowerCase()}.`);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await schoolApi.login({ email, password });

      // This API wraps responses in an envelope ({ success, statusCode, data }),
      // so the token is not always at the top level. Check the shapes the
      // backend is known to use rather than assuming one.
      const token =
        data?.token ??
        data?.accessToken ??
        data?.data?.token ??
        data?.data?.accessToken;

      if (!token) {
        console.warn('Login response contained no token:', JSON.stringify(data));
        setError('Login succeeded but no token was returned. Please contact support.');
        return;
      }

      // Multi-tenant API: every subsequent call needs the institute as a
      // header, and login is the only place it is returned.
      const user = data?.user ?? data?.data?.user;
      const instituteId = user?.instituteId ?? user?.institute_id ?? '';
      if (!instituteId) {
        console.warn('Login response contained no instituteId:', JSON.stringify(data));
      }

      // The Student/Teacher tab is just a UI choice -- the credentials alone
      // decide who this account actually is, and the server never checks the
      // tab against them. Confirmed live: a teacher account signed in with
      // "Student" selected and landed on the student dashboard with a token
      // that has no student profile behind it. So the account's real role is
      // read back and checked here before anything is persisted or navigated.
      let serverRole: string = user?.role ?? '';
      if (!serverRole) {
        // Some login responses omit it; arm the token just long enough to
        // ask /auth/me directly rather than trusting the client-picked tab.
        setAuthToken(token, role, instituteId, false);
        try {
          const me = await schoolApi.getMe();
          serverRole = (me?.data ?? me)?.role ?? '';
        } catch (e) {
          console.warn('[login] could not confirm account role via /auth/me', e);
        } finally {
          await clearAuthToken();
        }
      }

      if (serverRole) {
        const accountIsTeacher = isTeacherRole(serverRole);
        if (role === 'student' && accountIsTeacher) {
          setError('This is a teacher account. Switch to the Teacher tab to sign in.');
          return;
        }
        if (role === 'teacher' && !accountIsTeacher) {
          setError('This is a student account. Switch to the Student tab to sign in.');
          return;
        }
      } else {
        // Could not determine the real role at all (no field, and /auth/me
        // also failed) -- fail closed rather than let a possible mismatch
        // through silently.
        setError('Could not verify your account type. Please try again.');
        return;
      }

      // "Remember me" controls whether the session survives a restart; the
      // in-memory token is set either way, so this launch stays logged in.
      setAuthToken(token, role, instituteId, rememberMe);
      onLogin(role);
    } catch (err: any) {
      console.warn('Full Login Error:', err);
      setError(`Login failed: ${err.message || JSON.stringify(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: same gradient identity as the dashboard header, so login
            reads as the same product rather than a bolted-on screen. */}
        <View
          style={styles.hero}
          onLayout={e => setHeroSize({
            w: e.nativeEvent.layout.width,
            h: e.nativeEvent.layout.height,
          })}
        >
          <HeaderBackdrop width={heroSize.w} height={heroSize.h} radius={36} />
          <View style={[styles.heroContent, { paddingTop: insets.top + vs(28) }]}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.heroTitle}>Welcome back</Text>
            <Text style={styles.heroSubtitle}>Sign in to keep your streak going</Text>
          </View>
        </View>

        {/* Form card: floats up over the hero's curve. */}
        <View style={styles.formCard}>
          <View style={styles.roleSelector}>
            {([
              { id: 'student', label: 'Student', Icon: GraduationCap },
              { id: 'teacher', label: 'Teacher', Icon: UserCog },
            ] as const).map(r => {
              const on = role === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleBtn, on && styles.roleBtnActive]}
                  onPress={() => setRole(r.id)}
                  activeOpacity={0.85}
                >
                  <r.Icon size={ms(15)} color={on ? theme.primary : theme.subtext} />
                  <Text style={[styles.roleBtnText, on && styles.roleBtnTextActive]}>{r.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email address</Text>
            <View style={[styles.inputContainer, emailFocused && styles.inputContainerFocused]}>
              <Mail color={emailFocused ? theme.primary : theme.subtext} size={ms(19)} style={styles.inputIcon} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="you@school.edu"
                placeholderTextColor={theme.subtext}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputContainer, passwordFocused && styles.inputContainerFocused]}>
              <Lock color={passwordFocused ? theme.primary : theme.subtext} size={ms(19)} style={styles.inputIcon} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={theme.subtext}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn} hitSlop={8}>
                {showPassword
                  ? <EyeOff color={theme.subtext} size={ms(19)} />
                  : <Eye color={theme.subtext} size={ms(19)} />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(v => !v)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <Check size={ms(13)} color="#fff" strokeWidth={3} />}
            </View>
            <Text style={styles.checkboxLabel}>Keep me signed in on this device</Text>
          </TouchableOpacity>

          {!!error && (
            <View style={styles.errorBox}>
              <TriangleAlert size={ms(15)} color={theme.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.9}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Sign in</Text>
                <ArrowRight size={ms(18)} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          {biometry.available && (
            <>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.biometricBtn}
                onPress={handleBiometricLogin}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                <ScanFace size={ms(19)} color={theme.primary} />
                <Text style={styles.biometricBtnText}>Sign in with {biometry.label}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.footerNote}>
          Trouble signing in? Contact your school administrator.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: vs(40),
  },
  hero: {
    // Deliberately taller than the dashboard's header: it has to carry the
    // whole brand moment here, not share the screen with live content.
    height: vs(300),
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: hs(24),
  },
  logo: {
    width: hs(180),
    height: vs(56),
    marginBottom: vs(18),
  },
  heroTitle: {
    fontSize: ms(24),
    fontWeight: '700',
    color: '#fff',
  },
  heroSubtitle: {
    fontSize: ms(13.5),
    color: 'rgba(255,255,255,0.78)',
    marginTop: vs(4),
  },
  formCard: {
    marginTop: -vs(34),
    marginHorizontal: hs(20),
    backgroundColor: theme.surface,
    borderRadius: ms(26),
    padding: ms(22),
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: ms(24),
    shadowOffset: { width: 0, height: vs(10) },
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: theme.background,
    borderRadius: ms(14),
    padding: ms(4),
    marginBottom: vs(20),
    gap: hs(4),
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(6),
    paddingVertical: vs(10),
    borderRadius: ms(11),
  },
  roleBtnActive: {
    backgroundColor: theme.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: ms(5),
    shadowOffset: { width: 0, height: vs(2) },
    elevation: 2,
  },
  roleBtnText: {
    fontSize: ms(13.5),
    fontWeight: '600',
    color: theme.subtext,
  },
  roleBtnTextActive: {
    color: theme.text,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: vs(16),
  },
  label: {
    fontSize: ms(12.5),
    fontWeight: '600',
    color: theme.subtext,
    marginBottom: vs(7),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: ms(14),
    backgroundColor: theme.background,
    height: vs(52),
  },
  inputContainerFocused: {
    borderColor: theme.primary,
    backgroundColor: theme.surface,
    shadowColor: theme.primary,
    shadowOpacity: 0.15,
    shadowRadius: ms(8),
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  inputIcon: {
    marginLeft: hs(14),
    marginRight: hs(10),
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: ms(14.5),
    color: theme.text,
    paddingRight: hs(10),
  },
  eyeBtn: {
    padding: ms(14),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(18),
  },
  checkbox: {
    width: ms(19),
    height: ms(19),
    borderRadius: ms(6),
    borderWidth: 1.5,
    borderColor: theme.border,
    marginRight: hs(9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  checkboxLabel: {
    fontSize: ms(13),
    color: theme.subtext,
    fontWeight: '500',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    backgroundColor: '#FEF2F2',
    borderRadius: ms(10),
    paddingHorizontal: hs(12),
    paddingVertical: vs(10),
    marginBottom: vs(16),
  },
  errorText: {
    flex: 1,
    fontSize: ms(12.5),
    color: theme.danger,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    backgroundColor: theme.primary,
    borderRadius: ms(14),
    height: vs(52),
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: vs(6) },
    shadowOpacity: 0.28,
    shadowRadius: ms(12),
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: ms(15.5),
    fontWeight: '700',
    color: '#fff',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(10),
    marginTop: vs(20),
    marginBottom: vs(16),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  dividerText: {
    fontSize: ms(12),
    color: theme.subtext,
    fontWeight: '600',
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(9),
    borderWidth: 1.5,
    borderColor: theme.primary,
    borderRadius: ms(14),
    height: vs(50),
  },
  biometricBtnText: {
    fontSize: ms(14),
    fontWeight: '700',
    color: theme.primary,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: ms(12),
    color: theme.subtext,
    marginTop: vs(22),
    paddingHorizontal: hs(32),
  },
});
