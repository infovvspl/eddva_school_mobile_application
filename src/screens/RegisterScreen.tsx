import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import SwipeAuthButton from '../components/SwipeAuthButton';
import { BorderRadius, Colors, Shadow } from '../constants/theme';
import { authService } from '../services/auth.service';
import { getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';
import { preferenceIdFromWizard, saveGoalPreference } from '../constants/examPreferences';
import { font, hs, layout, ms, spacing, vs } from '../utils/responsive';
import UseCurrentLocationButton from '../components/UseCurrentLocationButton';
import type { ParsedAddress, GeoCoords } from '../utils/location';

type Props = { navigation: any };
type Step = 'register' | 'otp' | 'onboard';
type RegisterPage = 'identity' | 'address';
type ErrorMap = Record<string, string>;

const EXAM_OPTIONS = ['jee', 'neet', 'cbse', 'foundation', 'other'];
const CLASS_OPTIONS = ['8', '9', '10', '11', '12', 'repeater'];
const LANG_OPTIONS = ['en', 'hi'];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pinRegex = /^\d{6}$/;
const passRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const indianPhoneRegex = /^(\+91)?[6-9]\d{9}$/;

const normalizeIndianPhone = (value: string) => {
  const cleaned = value.replace(/[^\d+]/g, '');
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return cleaned;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const scrollRef = useRef<ScrollView>(null);
  const keyboardLift = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { completeOnboarding } = useOnboarding();
  const { theme, isDark } = useTheme();
  const c = theme.colors;

  const [step, setStep] = useState<Step>('register');
  const [registerPage, setRegisterPage] = useState<RegisterPage>('identity');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorMap>({});

  const [fullName, setFullName] = useState('');
  const [careOf, setCareOf] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postOffice, setPostOffice] = useState('');
  const [city, setCity] = useState('');
  const [landmark, setLandmark] = useState('');
  const [stateName, setStateName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');

  const [examTarget, setExamTarget] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [examYear, setExamYear] = useState(String(new Date().getFullYear()));
  const [targetCollege, setTargetCollege] = useState('');
  const [dailyStudyHours, setDailyStudyHours] = useState('6');
  const [language, setLanguage] = useState('en');
  const [onboardCity, setOnboardCity] = useState('');
  const [onboardState, setOnboardState] = useState('');

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const clearError = (k: string) => setErrors(prev => ({ ...prev, [k]: '' }));

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, event => {
      const lift =
        Platform.OS === 'android'
          ? -Math.min(150, Math.max(88, event.endCoordinates.height * 0.28))
          : 0;
      Animated.timing(keyboardLift, {
        toValue: lift,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardLift, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardLift]);

  const scrollToInput = (y: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 120);
  };

  const validateRegisterIdentity = () => {
    const e: ErrorMap = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!careOf.trim()) e.careOf = 'Care of / parent name is required';
    if (!indianPhoneRegex.test(normalizeIndianPhone(phoneNumber))) {
      e.phoneNumber = 'Enter a valid Indian phone number';
    }
    if (!email.trim() || !emailRegex.test(email.trim())) e.email = 'Enter a valid email';
    if (!passRegex.test(password)) {
      e.password = 'Min 8 chars with 1 uppercase, 1 number, 1 special char';
    }
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (
      alternatePhoneNumber.trim() &&
      !indianPhoneRegex.test(normalizeIndianPhone(alternatePhoneNumber))
    ) {
      e.alternatePhoneNumber = 'Enter a valid alternate Indian number';
    }
    setErrors(prev => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const validateRegisterAddress = () => {
    const e: ErrorMap = {};
    if (!address.trim()) e.address = 'Address is required';
    if (!postOffice.trim()) e.postOffice = 'Post office is required';
    if (!city.trim()) e.city = 'City is required';
    if (!landmark.trim()) e.landmark = 'Landmark/tehsil is required';
    if (!stateName.trim()) e.state = 'State is required';
    if (!pinRegex.test(pinCode.trim())) e.pinCode = 'PIN must be exactly 6 digits';
    setErrors(prev => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  };

  const validateRegister = () => {
    const e: ErrorMap = {};
    const identityValid = validateRegisterIdentity();
    const addressValid = validateRegisterAddress();
    if (!identityValid || !addressValid) {
      setErrors(prev => ({ ...prev, ...e }));
      return false;
    }
    return true;
  };

  const validateOnboarding = () => {
    const e: ErrorMap = {};
    if (!examTarget) e.examTarget = 'Select exam target';
    if (!classLevel) e.classLevel = 'Select class';
    if (!examYear.trim()) e.examYear = 'Exam year is required';
    const hours = Number(dailyStudyHours);
    if (Number.isNaN(hours) || hours < 1 || hours > 16) {
      e.dailyStudyHours = 'Daily study hours must be between 1 and 16';
    }
    if (!language.trim()) e.language = 'Language is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validateRegister()) return;
    setLoading(true);
    try {
      await authService.register({
        fullName: fullName.trim(),
        careOf: careOf.trim(),
        phoneNumber: normalizeIndianPhone(phoneNumber.trim()),
        email: email.trim(),
        address: address.trim(),
        postOffice: postOffice.trim(),
        city: city.trim(),
        landmark: landmark.trim(),
        state: stateName.trim(),
        pinCode: pinCode.trim(),
        password,
        alternatePhoneNumber: alternatePhoneNumber.trim()
          ? normalizeIndianPhone(alternatePhoneNumber.trim())
          : undefined,
      });
      await authService.sendOtp(normalizeIndianPhone(phoneNumber.trim()));
      setStep('otp');
    } catch (err: any) {
      setErrors({ general: getApiErrorMessage(err, 'Registration failed. Please retry.') });
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async () => {
    if (!/^\d{6}$/.test(otp.trim())) {
      setErrors({ otp: 'Enter valid 6-digit OTP' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.verifyOtp(
        normalizeIndianPhone(phoneNumber),
        otp.trim(),
      );
      await login(data);
      setStep('onboard');
      setOnboardCity(city);
      setOnboardState(stateName);
      setErrors({});
    } catch (err: any) {
      setErrors({ otp: getApiErrorMessage(err, 'OTP verification failed') });
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async () => {
    if (!validateOnboarding()) return;
    setLoading(true);
    setErrors({});
    const prefClass = classLevel === 'repeater' ? 'Dropper' : `Class ${classLevel}`;
    const prefId = preferenceIdFromWizard(examTarget.toUpperCase(), prefClass);

    try {
      const payload = {
        examTarget,
        class: classLevel,
        examYear: examYear.trim(),
        targetCollege: targetCollege.trim() || undefined,
        dailyStudyHours: Number(dailyStudyHours),
        language: language.trim(),
        city: onboardCity.trim() || undefined,
        state: onboardState.trim() || undefined,
      };
      const { data } = await authService.onboard(payload);
      if (data?.accessToken && data?.refreshToken) {
        await login(data);
      }
      await saveGoalPreference(prefId);
      await completeOnboarding();
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = getApiErrorMessage(err, 'Setup failed');

      if (status === 409) {
        try {
          await saveGoalPreference(prefId);
          await completeOnboarding();
          return;
        } catch {
          /* fall through */
        }
      }

      if (status === 401) {
        setErrors({
          general: 'Session expired. Go back, verify OTP again, then finish setup.',
        });
        return;
      }

      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.root, { paddingTop: insets.top, backgroundColor: c.background }]}>
        <Animated.View style={[styles.keyboardLift, { transform: [{ translateY: keyboardLift }] }]}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (step === 'register') {
                if (registerPage === 'address') setRegisterPage('identity');
                else navigation.goBack();
              } else {
                setStep('register');
              }
            }}
          >
            <Icon name="arrow-left" size={ms(16)} color={c.text} solid />
          </TouchableOpacity>

          <Image source={require('../assets/eddva_logo.png')} style={styles.logo} resizeMode="contain" />

          <View style={[styles.authSwitch, { backgroundColor: c.backgroundAlt, borderColor: c.border }]}>
            <TouchableOpacity
              style={styles.authSwitchItem}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={[styles.authSwitchText, { color: c.primary }]}>Login</Text>
            </TouchableOpacity>
            <View style={[styles.authSwitchActive, { backgroundColor: c.primary, borderColor: c.primary }]}>
              <Text style={styles.authSwitchTextActive}>Sign up</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.borderLight }]}>
            <Text style={[styles.title, { color: c.text }]}>
              {step === 'register'
                ? `Student Registration (${registerPage === 'identity' ? '1/2' : '2/2'})`
                : step === 'otp'
                  ? 'Phone Verification'
                  : 'Student Onboarding'}
            </Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              {step === 'register'
                ? registerPage === 'identity'
                  ? 'Step 1: Basic details and account credentials.'
                  : 'Step 2: Address details to complete registration.'
                : step === 'otp'
                  ? 'Enter the OTP sent to your registered phone.'
                  : 'Complete profile setup to personalize your learning.'}
            </Text>

            {errors.general ? (
              <View style={[styles.errorBanner, { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.16)' : '#FEF2F2', borderColor: isDark ? 'rgba(248, 113, 113, 0.32)' : '#FECACA' }]}>
                <Icon name="exclamation-circle" size={ms(14)} color={c.danger} solid />
                <Text style={[styles.errorBannerText, { color: c.danger }]}>{errors.general}</Text>
              </View>
            ) : null}

            {step === 'register' ? (
              <>
                {registerPage === 'identity' ? (
                  <>
                    <Field label="Full Name" value={fullName} onChangeText={v => { setFullName(v); clearError('fullName'); }} error={errors.fullName} icon="user" placeholder="Arjun Sharma" onFocus={() => scrollToInput(vs(120))} />
                    <Field label="Care Of" value={careOf} onChangeText={v => { setCareOf(v); clearError('careOf'); }} error={errors.careOf} icon="users" placeholder="Ramesh Sharma" onFocus={() => scrollToInput(vs(170))} />
                    <Field label="Phone Number" value={phoneNumber} onChangeText={v => { setPhoneNumber(v); clearError('phoneNumber'); }} error={errors.phoneNumber} icon="phone" placeholder="+919876543210" keyboardType="phone-pad" onFocus={() => scrollToInput(vs(230))} />
                    <Field label="Alternate Phone (optional)" value={alternatePhoneNumber} onChangeText={v => { setAlternatePhoneNumber(v); clearError('alternatePhoneNumber'); }} error={errors.alternatePhoneNumber} icon="phone-alt" placeholder="+919876543211" keyboardType="phone-pad" onFocus={() => scrollToInput(vs(290))} />
                    <Field label="Email" value={email} onChangeText={v => { setEmail(v); clearError('email'); }} error={errors.email} icon="envelope" placeholder="arjun@gmail.com" keyboardType="email-address" onFocus={() => scrollToInput(vs(350))} />

                    <Text style={[styles.label, { color: c.text }]}>Password</Text>
                    <View style={[styles.inputRow, { backgroundColor: c.background, borderColor: c.border }, errors.password ? { borderColor: c.danger } : null]}>
                      <Icon name="lock" size={ms(16)} color={c.textMuted} solid />
                      <TextInput
                        style={[styles.input, { color: c.text }]}
                        placeholder="StrongP@ss1"
                        placeholderTextColor={c.textMuted}
                        value={password}
                        onChangeText={v => {
                          setPassword(v);
                          clearError('password');
                        }}
                        secureTextEntry={!showPassword}
                        onFocus={() => scrollToInput(vs(410))}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                        <Icon name={showPassword ? 'eye-slash' : 'eye'} size={ms(16)} color={c.textMuted} solid />
                      </TouchableOpacity>
                    </View>
                    {errors.password ? <Text style={[styles.errorText, { color: c.danger }]}>{errors.password}</Text> : null}
                    {password ? <Text style={[styles.passwordHint, { color: c.textMuted }]}>Strength: {passwordStrength}/4</Text> : null}
                    <Field label="Confirm Password" value={confirmPassword} onChangeText={v => { setConfirmPassword(v); clearError('confirmPassword'); }} error={errors.confirmPassword} icon="lock" placeholder="Re-enter password" secureTextEntry={!showPassword} onFocus={() => scrollToInput(vs(475))} />

                    <SwipeAuthButton
                      label="Swipe for Address"
                      icon="arrow-right"
                      onComplete={() => {
                        if (validateRegisterIdentity()) setRegisterPage('address');
                      }}
                      loading={loading}
                    />
                  </>
                ) : (
                  <>
                    <UseCurrentLocationButton
                      onResolved={(parsed: ParsedAddress, _coords: GeoCoords) => {
                        if (parsed.address) setAddress(parsed.address);
                        if (parsed.postOffice) setPostOffice(parsed.postOffice);
                        if (parsed.city) setCity(parsed.city);
                        if (parsed.landmark) setLandmark(parsed.landmark);
                        if (parsed.state) setStateName(parsed.state);
                        if (parsed.pinCode) setPinCode(parsed.pinCode);
                      }}
                    />
                    <Field label="Address" value={address} onChangeText={v => { setAddress(v); clearError('address'); }} error={errors.address} icon="home" placeholder="12, Gandhi Nagar, Near Bus Stand" onFocus={() => scrollToInput(vs(150))} />
                    <Field label="Post Office" value={postOffice} onChangeText={v => { setPostOffice(v); clearError('postOffice'); }} error={errors.postOffice} icon="mail-bulk" placeholder="Andheri" onFocus={() => scrollToInput(vs(210))} />
                    <Field label="City" value={city} onChangeText={v => { setCity(v); clearError('city'); }} error={errors.city} icon="city" placeholder="Mumbai" onFocus={() => scrollToInput(vs(270))} />
                    <Field label="Landmark / Tehsil" value={landmark} onChangeText={v => { setLandmark(v); clearError('landmark'); }} error={errors.landmark} icon="map-marker-alt" placeholder="Versova" onFocus={() => scrollToInput(vs(330))} />
                    <Field label="State" value={stateName} onChangeText={v => { setStateName(v); clearError('state'); }} error={errors.state} icon="map" placeholder="Maharashtra" onFocus={() => scrollToInput(vs(390))} />
                    <Field label="PIN Code" value={pinCode} onChangeText={v => { setPinCode(v); clearError('pinCode'); }} error={errors.pinCode} icon="map-pin" placeholder="400058" keyboardType="number-pad" maxLength={6} onFocus={() => scrollToInput(vs(450))} />

                    <View style={styles.twoBtnRow}>
                      <TouchableOpacity
                        style={[styles.backSecondaryBtn, { backgroundColor: c.background, borderColor: c.border }]}
                        onPress={() => setRegisterPage('identity')}
                        disabled={loading}
                      >
                        <Text style={[styles.backSecondaryText, { color: c.text }]}>Back</Text>
                      </TouchableOpacity>
                      <SwipeAuthButton
                        label="Swipe to Sign Up"
                        icon="user-plus"
                        onComplete={handleRegister}
                        loading={loading}
                        style={styles.primaryBtnCompact}
                      />
                    </View>
                  </>
                )}
              </>
            ) : null}

            {step === 'otp' ? (
              <>
                <Text style={[styles.otpHint, { color: c.textMuted }]}>OTP sent to {normalizeIndianPhone(phoneNumber)} (dev OTP: 123456)</Text>
                <Field label="OTP" value={otp} onChangeText={v => { setOtp(v); clearError('otp'); }} error={errors.otp} icon="key" placeholder="Enter 6-digit OTP" keyboardType="number-pad" maxLength={6} onFocus={() => scrollToInput(vs(160))} />
                <SwipeAuthButton label="Swipe to Verify" icon="key" onComplete={handleOtp} loading={loading} />
              </>
            ) : null}

            {step === 'onboard' ? (
              <>
                <Text style={[styles.sectionLabel, { color: c.primary }]}>Exam Target</Text>
                <View style={styles.chipWrap}>
                  {EXAM_OPTIONS.map(opt => (
                    <Chip key={opt} label={opt.toUpperCase()} active={examTarget === opt} onPress={() => { setExamTarget(opt); clearError('examTarget'); }} />
                  ))}
                </View>
                {errors.examTarget ? <Text style={[styles.errorText, { color: c.danger }]}>{errors.examTarget}</Text> : null}

                <Text style={[styles.sectionLabel, { color: c.primary }]}>Class</Text>
                <View style={styles.chipWrap}>
                  {CLASS_OPTIONS.map(opt => (
                    <Chip key={opt} label={opt === 'repeater' ? 'REPEATER' : `CLASS ${opt}`} active={classLevel === opt} onPress={() => { setClassLevel(opt); clearError('classLevel'); }} />
                  ))}
                </View>
                {errors.classLevel ? <Text style={[styles.errorText, { color: c.danger }]}>{errors.classLevel}</Text> : null}

                <Field label="Exam Year" value={examYear} onChangeText={v => { setExamYear(v); clearError('examYear'); }} error={errors.examYear} icon="calendar" placeholder="2027" keyboardType="number-pad" maxLength={4} onFocus={() => scrollToInput(vs(260))} />
                <Field label="Target College (optional)" value={targetCollege} onChangeText={setTargetCollege} icon="university" placeholder="IIT Bombay CS" onFocus={() => scrollToInput(vs(320))} />
                <Field label="Daily Study Hours" value={dailyStudyHours} onChangeText={v => { setDailyStudyHours(v); clearError('dailyStudyHours'); }} error={errors.dailyStudyHours} icon="clock" placeholder="6" keyboardType="number-pad" maxLength={2} onFocus={() => scrollToInput(vs(380))} />

                <Text style={[styles.sectionLabel, { color: c.primary }]}>Language</Text>
                <View style={styles.chipWrap}>
                  {LANG_OPTIONS.map(opt => (
                    <Chip key={opt} label={opt.toUpperCase()} active={language === opt} onPress={() => { setLanguage(opt); clearError('language'); }} />
                  ))}
                </View>
                {errors.language ? <Text style={[styles.errorText, { color: c.danger }]}>{errors.language}</Text> : null}

                <Field label="City (optional)" value={onboardCity} onChangeText={setOnboardCity} icon="city" placeholder="Mumbai" onFocus={() => scrollToInput(vs(480))} />
                <Field label="State (optional)" value={onboardState} onChangeText={setOnboardState} icon="map" placeholder="Maharashtra" onFocus={() => scrollToInput(vs(540))} />

                <SwipeAuthButton label="Swipe to Finish" icon="check" onComplete={handleOnboard} loading={loading} />
              </>
            ) : null}

            {step === 'register' && registerPage === 'identity' ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.secondaryText, { color: c.primary }]}>Already have an account? Login</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          </ScrollView>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  icon: string;
  placeholder: string;
  error?: string;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'phone-pad';
  secureTextEntry?: boolean;
  maxLength?: number;
  onFocus?: () => void;
};

const Field: React.FC<FieldProps> = ({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
  error,
  keyboardType,
  secureTextEntry,
  maxLength,
  onFocus,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;
  return (
    <>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: c.background, borderColor: c.border }, error ? { borderColor: c.danger } : null]}>
        <Icon name={icon} size={ms(14)} color={c.textMuted} solid />
        <TextInput
          style={[styles.input, { color: c.text }]}
          placeholder={placeholder}
          placeholderTextColor={c.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize="none"
          onFocus={onFocus}
        />
      </View>
      {error ? <Text style={[styles.errorText, { color: c.danger }]}>{error}</Text> : null}
    </>
  );
};

const Chip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => {
  const { theme, isDark } = useTheme();
  const c = theme.colors;
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, { backgroundColor: isDark ? c.chipBg : '#EFF6FF', borderColor: isDark ? c.border : '#BFDBFE' }, active && { backgroundColor: c.chipActiveBg, borderColor: c.chipActiveBorder }]}>
      <Text style={[styles.chipText, { color: c.textSecondary }, active && { color: c.primary, fontWeight: '800' }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  keyboardLift: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: vs(140) },
  backBtn: {
    width: layout.avatarSm,
    height: layout.avatarSm,
    borderRadius: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: spacing.sm,
    ...Shadow.soft,
  },
  logo: { width: hs(190), height: vs(78), alignSelf: 'center', marginBottom: spacing.md, marginTop: vs(6) },
  authSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: ms(22),
    padding: ms(3),
    marginBottom: spacing.md,
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
  authSwitchText: { fontSize: font.caption, fontWeight: '700' },
  authSwitchTextActive: { fontSize: font.caption, color: '#FFFFFF', fontWeight: '800' },
  card: {
    borderRadius: BorderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    ...Shadow.soft,
  },
  title: { fontSize: font.subhead, fontWeight: '800' },
  subtitle: { fontSize: font.caption, marginTop: vs(4), marginBottom: vs(10) },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    borderWidth: 1,
    borderRadius: ms(10),
    padding: ms(10),
    marginBottom: vs(8),
  },
  errorBannerText: { fontSize: font.tiny, flex: 1 },
  label: { fontSize: font.tiny, fontWeight: '700', marginTop: vs(8), marginBottom: vs(4) },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(8),
    height: vs(48),
    borderRadius: ms(12),
    borderWidth: 1,
    paddingHorizontal: hs(12),
  },
  input: { flex: 1, fontSize: font.caption, padding: 0 },
  errorText: { fontSize: font.micro, marginTop: vs(3) },
  passwordHint: { fontSize: font.micro, marginTop: vs(4) },
  primaryBtn: {
    marginTop: vs(14),
    height: vs(50),
    borderRadius: ms(12),
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: Colors.white, fontSize: font.caption, fontWeight: '800' },
  primaryBtnCompact: { marginTop: 0, flex: 1 },
  twoBtnRow: { flexDirection: 'row', gap: hs(10), marginTop: vs(14) },
  backSecondaryBtn: {
    height: vs(50),
    paddingHorizontal: hs(18),
    borderRadius: ms(12),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSecondaryText: { fontSize: font.caption, fontWeight: '700' },
  disabled: { opacity: 0.7 },
  secondaryBtn: { marginTop: vs(12), alignItems: 'center' },
  secondaryText: { fontSize: font.caption, fontWeight: '700' },
  otpHint: { fontSize: font.caption, marginBottom: vs(6) },
  sectionLabel: {
    marginTop: vs(10),
    marginBottom: vs(6),
    fontSize: font.caption,
    fontWeight: '800',
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: hs(8) },
  chip: {
    paddingHorizontal: hs(10),
    paddingVertical: vs(7),
    borderRadius: ms(16),
    borderWidth: 1,
  },
  chipText: { fontSize: font.tiny, fontWeight: '700' },
});

export default RegisterScreen;
