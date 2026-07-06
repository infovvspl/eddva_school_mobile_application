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
    }
  };

  return (
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
