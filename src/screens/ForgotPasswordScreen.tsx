import React, { useRef, useState, useEffect } from 'react';
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
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import SwipeAuthButton from '../components/SwipeAuthButton';
import { useTheme } from '../context/ThemeContext';
import { font, hs, ms, spacing, textFamily, vs } from '../utils/responsive';
import { authService } from '../services/auth.service';

type Props = { navigation: any };

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const scrollRef = useRef<ScrollView>(null);
  const keyboardLift = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const c = theme.colors;

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, event => {
      const lift =
        Platform.OS === 'android'
          ? -Math.min(150, Math.max(88, event.endCoordinates.height * 0.3))
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

  const handleSendOtp = async () => {
    if (!emailOrPhone.trim()) {
      setError('Enter your registered email or phone number');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Simulate API call for now. Replace with actual authService call.
      // await authService.requestPasswordResetOtp(emailOrPhone);
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('OtpVerification', { identifier: emailOrPhone, purpose: 'reset_password' });
      }, 1000);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Failed to send OTP. Please try again.');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={c.background}
      />
      <View style={[styles.header, { paddingTop: insets.top + vs(10), backgroundColor: c.background }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={ms(20)} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }, textFamily.bold]}>Forgot Password</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1, paddingBottom: insets.bottom, backgroundColor: c.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Animated.View style={[styles.keyboardLift, { transform: [{ translateY: keyboardLift }] }]}>
          <ScrollView
            ref={scrollRef}
            style={{ backgroundColor: c.background }}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: c.chipActiveBg, borderColor: c.chipActiveBorder }]}>
                <Icon name="lock" size={ms(40)} color={c.primary} solid />
              </View>
            </View>

            <Text style={[styles.description, { color: c.textSecondary }, textFamily.medium]}>
              Enter your registered email or phone number below to receive password reset instructions.
            </Text>

            {error ? (
              <View
                style={[
                  styles.messageBox,
                  {
                    backgroundColor: isDark ? 'rgba(248, 113, 113, 0.16)' : '#FEE2E2',
                    borderColor: isDark ? 'rgba(248, 113, 113, 0.32)' : '#FECACA',
                  },
                ]}
              >
                <Text style={[styles.messageText, { color: isDark ? c.danger : '#B91C1C' }, textFamily.medium]}>{error}</Text>
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
                value={emailOrPhone}
                onChangeText={v => {
                  setEmailOrPhone(v);
                  setError('');
                }}
                onFocus={() => scrollToInput(vs(100))}
                autoCapitalize="none"
                keyboardType="default"
              />
            </View>

            <View style={styles.btnWrapper}>
              <SwipeAuthButton
                label="Swipe to Send OTP"
                icon="paper-plane"
                onComplete={handleSendOtp}
                loading={loading}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(12),
  },
  backBtn: {
    padding: ms(4),
    marginRight: hs(12),
  },
  headerTitle: { fontSize: font.title },
  keyboardLift: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: vs(20),
    paddingBottom: vs(120),
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: vs(30),
  },
  iconCircle: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(40),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: font.body,
    textAlign: 'center',
    marginBottom: vs(24),
    lineHeight: 22,
  },
  messageBox: {
    width: '100%',
    padding: hs(12),
    borderRadius: ms(12),
    marginBottom: vs(16),
    borderWidth: 1,
  },
  messageText: { fontSize: font.caption, textAlign: 'center' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    width: '100%',
    borderRadius: ms(14),
    paddingHorizontal: hs(14),
    height: vs(52),
    marginBottom: vs(24),
    borderWidth: 1,
  },
  iconSlot: {
    width: hs(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: { flex: 1, fontSize: font.body, padding: 0 },
  btnWrapper: {
    marginTop: vs(10),
  },
});

export default ForgotPasswordScreen;
