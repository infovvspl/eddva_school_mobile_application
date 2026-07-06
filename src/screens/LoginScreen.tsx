<<<<<<< HEAD
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Switch,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import SwipeAuthButton from '../components/SwipeAuthButton';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/auth.service';
import { getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { font, hs, ms, spacing, textFamily, vs } from '../utils/responsive';

type Props = { navigation: any };
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

const normalizePhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return value.trim();
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const c = theme.colors;
  const { login } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToInput = (y: number) => {
    if (Platform.OS === 'android') return;
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 120);
  };

  const handleLogin = async () => {
    const identifier = loginId.trim();
    if (!identifier) {
      setError('Enter your email or phone number');
      return;
    }
    const normalizedPhone = normalizePhoneInput(identifier);
    const isEmail = emailRegex.test(identifier.toLowerCase());
    const phoneDigits = normalizedPhone.replace(/\D/g, '');
    const isPhone =
      phoneRegex.test(normalizedPhone) || phoneRegex.test(phoneDigits) || phoneRegex.test(`+${phoneDigits}`);
    if (!isEmail && !isPhone) {
      setError('Enter a valid email or Indian phone number');
      return;
    }
    if (!password.trim()) {
      setError('Enter your password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await authService.login(isPhone ? normalizedPhone : identifier, password);
      await login(data);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = getApiErrorMessage(err, 'Login failed. Please try again.');
      if (status === 401 || msg.toLowerCase().includes('invalid credentials')) {
        setError('Invalid email/phone number or password.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
=======
import React, { useState } from 'react';
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
  Alert
} from 'react-native';
import { Mail, Lock, Eye, Check } from 'lucide-react-native';
import { hs, vs, ms } from '../utils/responsive';

const API_BASE_URL = 'https://dev-api.eddva.in/api/v1';

export function LoginScreen({
  onLogin,
  theme,
}: {
  onLogin: () => void;
  theme: { background: string; surface: string; text: string; subtext: string; primary: string; primarySoft: string; border: string; accent: string };
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/school/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials. Please try again.');
      }

      // Successful login
      // TODO: Save token to AsyncStorage or SecureStore here if needed
      console.log('Login successful:', data);
      onLogin(); // Navigate to main app
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
>>>>>>> 17e1994 (bhagyasree changes)
    }
  };

  return (
<<<<<<< HEAD
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={c.background}
      />
      <KeyboardAvoidingView
        style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: c.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.themeBar, { backgroundColor: c.background }]}>
          <Icon name={isDark ? 'moon' : 'sun'} size={ms(16)} color={c.primary} solid />
          <Text style={[styles.themeBarText, { color: c.text }, textFamily.medium]}>Dark</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: c.primary }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.keyboardBody}>
          <ScrollView
            ref={scrollRef}
            style={{ backgroundColor: c.background }}
            contentContainerStyle={[styles.scroll, keyboardVisible && styles.scrollKeyboardOpen]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
          <Image
            source={require('../assets/login_illustration.jpg')}
            style={styles.heroIllustration}
            resizeMode="contain"
            accessibilityLabel="Login illustration"
          />

          <Text style={[styles.headline, { color: c.text }, textFamily.bold]}>
            Login
          </Text>

          <View style={[styles.authSwitch, { backgroundColor: c.chipBg, borderColor: c.border }]}>
            <View style={[styles.authSwitchActive, { backgroundColor: c.primary, borderColor: c.primary }]}>
              <Text style={[styles.authSwitchTextActive, textFamily.bold]}>Login</Text>
            </View>
            <TouchableOpacity
              style={styles.authSwitchItem}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={[styles.authSwitchText, { color: c.primary }, textFamily.semibold]}>Sign up</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: isDark ? 'rgba(248, 113, 113, 0.16)' : '#FEE2E2',
                  borderColor: isDark ? 'rgba(248, 113, 113, 0.32)' : '#FECACA',
                },
              ]}
            >
              <Text style={[styles.errorText, { color: isDark ? c.danger : '#B91C1C' }, textFamily.medium]}>{error}</Text>
            </View>
          ) : null}

          <View style={[styles.inputWrap, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.iconSlot}>
              <Icon name="mobile-alt" size={ms(16)} color={c.primary} solid />
            </View>
            <TextInput
              style={[styles.input, { color: c.text }, textFamily.regular]}
              placeholder="Email or Mobile Number"
              placeholderTextColor={c.textMuted}
              value={loginId}
              onChangeText={v => {
                setLoginId(v);
                setError('');
              }}
              onFocus={() => scrollToInput(vs(220))}
              autoCapitalize="none"
              keyboardType="default"
              autoComplete="tel"
            />
          </View>

          <View style={[styles.inputWrap, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.iconSlot}>
              <Icon name="lock" size={ms(16)} color={c.textMuted} solid />
            </View>
            <TextInput
              style={[styles.input, { color: c.text }, textFamily.regular]}
              placeholder="Password"
              placeholderTextColor={c.textMuted}
              value={password}
              onChangeText={v => {
                setPassword(v);
                setError('');
              }}
              onFocus={() => scrollToInput(vs(280))}
              secureTextEntry={!showPassword}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
              <Icon
                name={showPassword ? 'eye-slash' : 'eye'}
                size={ms(16)}
                color={c.textMuted}
                solid
              />
            </TouchableOpacity>
          </View>

          <SwipeAuthButton
            label="Swipe to Login"
            icon="graduation-cap"
            onComplete={handleLogin}
            loading={loading}
          />

          <TouchableOpacity
            style={styles.linkWrap}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={[styles.link, { color: c.primary }, textFamily.semibold]}>
              Forgot password?
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: c.textMuted }, textFamily.regular]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.link, { color: c.primary }, textFamily.bold]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  themeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: hs(8),
    paddingHorizontal: spacing.lg,
    paddingTop: vs(4),
  },
  themeBarText: { fontSize: font.caption },
  keyboardBody: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(72),
  },
  scrollKeyboardOpen: {
    paddingBottom: vs(24),
  },
  heroIllustration: {
    width: '100%',
    height: vs(300),
    marginBottom: vs(16),
    alignSelf: 'center',
  },
  headline: { fontSize: font.title, marginBottom: vs(14) },
  authSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: ms(22),
    padding: ms(3),
    marginBottom: vs(16),
  },
  authSwitchItem: {
    flex: 1,
    height: vs(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  authSwitchActive: {
    flex: 1,
    height: vs(36),
    borderRadius: ms(18),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authSwitchText: { fontSize: font.caption },
  authSwitchTextActive: { fontSize: font.caption, color: '#FFFFFF' },
  errorBox: {
    width: '100%',
    padding: hs(12),
    borderRadius: ms(12),
    marginBottom: vs(12),
    borderWidth: 1,
  },
  errorText: { fontSize: font.caption, textAlign: 'center' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    width: '100%',
    borderRadius: ms(14),
    paddingHorizontal: hs(14),
    height: vs(52),
    marginBottom: vs(12),
    borderWidth: 1,
  },
  iconSlot: {
    width: hs(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: { flex: 1, fontSize: font.body, padding: 0 },
  linkWrap: { alignItems: 'center', marginTop: vs(14) },
  link: { fontSize: font.body },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(16),
    flexWrap: 'wrap',
  },
  footerText: { fontSize: font.body },
});

export default LoginScreen;
=======
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.innerContainer}>
        
        {/* Hero Section */}
        <View style={styles.heroWrapper}>
          <Image 
            source={require('../../assets/intro_boy.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to your student account</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Mail color="#0052FF" size={20} style={styles.inputIcon} strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock color="#0052FF" size={20} style={styles.inputIcon} strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Eye color="#94A3B8" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Check size={14} color="#FFF" strokeWidth={3} />}
                </View>
                <Text style={styles.checkboxLabel}>Remember me</Text>
              </TouchableOpacity>
            </View>

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleLogin}
              activeOpacity={0.9}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            
          </View>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: vs(20),
  },
  heroWrapper: {
    width: '100%',
    height: vs(280),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(-40), // Pull content up significantly to close the gap
    marginTop: vs(-20), // Push image up slightly
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: hs(24),
    paddingTop: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1,
  },
  header: {
    marginBottom: vs(16),
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: ms(28),
    color: '#0F172A',
    marginBottom: vs(4),
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: ms(15),
    color: '#64748B',
  },
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: ms(24),
    padding: ms(20),
    shadowColor: '#64748B',
    shadowOpacity: 0.1,
    shadowRadius: ms(24),
    shadowOffset: { width: 0, height: vs(12) },
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: ms(13),
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: vs(16),
  },
  inputGroup: {
    marginBottom: vs(16),
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: ms(14),
    color: '#334155',
    marginBottom: vs(6),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: ms(16),
    backgroundColor: '#F8FAFC',
    height: vs(56),
  },
  inputIcon: {
    marginLeft: hs(16),
    marginRight: hs(12),
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: 'Poppins-Regular',
    fontSize: ms(15),
    color: '#0F172A',
  },
  eyeBtn: {
    padding: ms(16),
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(20),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: ms(20),
    height: ms(20),
    borderRadius: ms(6),
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: hs(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#0052FF',
    borderColor: '#0052FF',
  },
  checkboxLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: ms(14),
    color: '#475569',
  },
  button: {
    backgroundColor: '#0052FF',
    borderRadius: ms(16),
    height: vs(56),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0052FF',
    shadowOffset: { width: 0, height: vs(4) },
    shadowOpacity: 0.2,
    shadowRadius: ms(8),
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: ms(16),
    color: '#FFFFFF',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontFamily: 'Poppins-Medium',
    color: '#94A3B8',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  schoolAccountButton: {
    flexDirection: 'row',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0052FF',
  },
  schoolAccountText: {
    fontFamily: 'Poppins-Bold',
    color: '#0052FF',
    fontSize: 15,
  },
  newStudentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  newStudentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newStudentTextContainer: {
    flex: 1,
  },
  newStudentTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 14,
    color: '#0F172A',
  },
  newStudentSub: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    color: '#0052FF',
  },
  footerGraphic: {
    marginTop: 20,
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    opacity: 0.5,
  },
  footerIcon: {
    transform: [{ rotate: '-15deg' }]
  },
});
>>>>>>> 17e1994 (bhagyasree changes)
