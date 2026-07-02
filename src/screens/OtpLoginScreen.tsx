import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Image, ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useTheme } from '../context/ThemeContext';
import { BorderRadius, Gradients, Shadow } from '../constants/theme';
import { authService } from '../services/auth.service';
import { getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { font, hs, layout, ms, spacing, vs } from '../utils/responsive';

type Props = { navigation: any };

const OtpLoginScreen: React.FC<Props> = ({ navigation }) => {
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme, isDark } = useTheme();
  const c = theme.colors;

  const handleSendOtp = async () => {
    if (phone.trim().length < 10) { setError('Enter a valid 10-digit phone number'); return; }
    setError(''); setLoading(true);
    try {
      await authService.sendOtp(phone.trim());
      setStep('otp');
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Failed to send OTP'));
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (otp.trim().length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await authService.verifyOtp(phone.trim(), otp.trim());
      await login(data);
      /* Root navigator switches to Main or Onboarding when auth state updates */
    } catch (err: any) {
      setError(getApiErrorMessage(err, 'Invalid OTP'));
    } finally { setLoading(false); }
  };

  const scrollToInput = (y: number) => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 120);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.bg, { backgroundColor: c.background }]}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + vs(130) },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)' }]} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={16} color={c.text} solid />
          </TouchableOpacity>

          <View style={styles.logoSection}>
            <View style={[styles.logoCard, { backgroundColor: c.card }]}>
              <Image source={require('../assets/eddva_logo.png')} style={styles.logo} resizeMode="contain" />
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: c.card }]}>
            <Text style={[styles.title, { color: c.text }]}>{step === 'phone' ? 'Phone Login' : 'Enter OTP'}</Text>
            <Text style={[styles.subtitle, { color: c.textMuted }]}>
              {step === 'phone' ? 'Enter your registered phone number' : `OTP sent to +91 ${phone} · Dev: 123456`}
            </Text>

            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.16)' : '#FEE2E2', borderColor: isDark ? 'rgba(248, 113, 113, 0.32)' : '#FECACA' }]}>
                <Icon name="exclamation-circle" size={13} color={c.danger} solid />
                <Text style={[styles.errorText, { color: c.danger }]}>{error}</Text>
              </View>
            ) : null}

            {step === 'phone' ? (
              <>
                <Text style={[styles.label, { color: c.text }]}>Phone Number</Text>
                <View style={[styles.inputRow, { backgroundColor: c.backgroundAlt, borderColor: c.border }]}>
                  <Text style={[styles.countryCode, { color: c.text }]}>+91</Text>
                  <View style={[styles.inputDivider, { backgroundColor: c.borderLight }]} />
                  <TextInput
                    style={[styles.input, { color: c.text }]}
                    placeholder="10-digit mobile number"
                    placeholderTextColor={c.textMuted}
                    value={phone}
                    onChangeText={v => { setPhone(v); setError(''); }}
                    keyboardType="phone-pad"
                    maxLength={10}
                    onFocus={() => scrollToInput(vs(220))}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.btn, loading && styles.btnDisabled]}
                  onPress={handleSendOtp} disabled={loading} activeOpacity={0.85}
                >
                  <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                    {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.btnText}>Send OTP</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={[styles.label, { color: c.text }]}>One-Time Password</Text>
                <View style={[styles.inputRow, styles.otpInputRow, { backgroundColor: c.backgroundAlt, borderColor: c.border }]}>
                  <Icon name="key" size={15} color={c.textMuted} solid />
                  <TextInput
                    style={[styles.input, styles.otpInput, { color: c.text }]}
                    placeholder="• • • • • •"
                    placeholderTextColor={c.textMuted}
                    value={otp}
                    onChangeText={v => { setOtp(v); setError(''); }}
                    keyboardType="number-pad"
                    maxLength={6}
                    onFocus={() => scrollToInput(vs(220))}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.btn, loading && styles.btnDisabled]}
                  onPress={handleVerify} disabled={loading} activeOpacity={0.85}
                >
                  <LinearGradient colors={Gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                    {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.btnText}>Verify & Login</Text>}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resendRow} onPress={() => { setStep('phone'); setOtp(''); setError(''); }}>
                  <Icon name="arrow-left" size={11} color={c.primary} solid />
                  <Text style={[styles.resendText, { color: c.primary }]}>Change number / Resend OTP</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: vs(32) },
  backBtn: { width: layout.avatarSm, height: layout.avatarSm, borderRadius: ms(20), alignItems: 'center', justifyContent: 'center', marginBottom: vs(20) },
  logoSection: { alignItems: 'center', marginBottom: vs(28) },
  logoCard: { borderRadius: BorderRadius.xl, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, ...Shadow.glow },
  logo: { width: hs(140), height: vs(46) },
  card: { borderRadius: BorderRadius.xxl, padding: vs(28), ...Shadow.nav },
  title: { fontSize: font.headline, fontWeight: '800', marginBottom: spacing.xs },
  subtitle: { fontSize: font.caption, marginBottom: vs(20) },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: ms(8), padding: vs(10), marginBottom: vs(14), borderWidth: 1 },
  errorText: { fontSize: font.caption, flex: 1 },
  label: { fontSize: font.caption, fontWeight: '700', marginBottom: vs(7), marginTop: spacing.xs },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, paddingHorizontal: hs(14), height: layout.touchTargetLg, borderWidth: 1.5, gap: spacing.sm, marginBottom: vs(20) },
  otpInputRow: { gap: vs(10) },
  countryCode: { fontSize: font.subhead, fontWeight: '700' },
  inputDivider: { width: 1, height: vs(24) },
  input: { flex: 1, fontSize: font.subhead },
  otpInput: { fontSize: font.headline, letterSpacing: hs(10), fontWeight: '700' },
  btn: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  btnGrad: { height: layout.touchTargetLg, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: font.title, fontWeight: '700', color: '#FFFFFF' },
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: vs(6), marginTop: spacing.md },
  resendText: { fontSize: font.caption, fontWeight: '600' },
});

export default OtpLoginScreen;
