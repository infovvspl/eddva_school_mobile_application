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
import { useAppTheme } from '../context/ThemeContext';
import ReactNativeBiometrics from 'react-native-biometrics';
import { schoolApi, setAuthToken } from '../utils/api';

const API_BASE_URL = 'https://dev-api.eddva.in/api/v1';

export function LoginScreen({ onLogin }: { onLogin: (role: string) => void; }) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'student'|'teacher'>('student');

  
  const handleBiometricLogin = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      if (available && biometryType) {
        const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Login with Biometrics' });
        if (success) {
          setAuthToken('biometric-token-12345');
          console.log('Biometric Login successful');
          onLogin(role);
        } else {
          setError('Biometric authentication cancelled or failed.');
        }
      } else {
        setError('Biometrics not available on this device.');
      }
    } catch (err: any) {
      setError('Error using biometrics.');
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

      // Save token in memory
      if (data && data.token) {
        setAuthToken(data.token);
      }
      console.log('Login successful:', data);
      onLogin(role); // Navigate to main app
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
            <Text style={styles.subtitle}>Login to your account</Text>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            
            <View style={styles.roleSelector}>
              <TouchableOpacity 
                style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]} 
                onPress={() => setRole('student')}
              >
                <Text style={[styles.roleBtnText, role === 'student' && styles.roleBtnTextActive]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleBtn, role === 'teacher' && styles.roleBtnActive]} 
                onPress={() => setRole('teacher')}
              >
                <Text style={[styles.roleBtnText, role === 'teacher' && styles.roleBtnTextActive]}>Teacher</Text>
              </TouchableOpacity>
            </View>
            
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
                  <Eye color={theme.subtext} size={20} />
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
                  {rememberMe && <Check size={14} color={theme.surface} strokeWidth={3} />}
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
                <ActivityIndicator color={theme.surface} />
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

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: theme.surface,
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
    backgroundColor: theme.surface,
    zIndex: 1,
  },
  header: {
    marginBottom: vs(16),
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: ms(28),
    color: theme.text,
    marginBottom: vs(4),
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: ms(15),
    color: theme.subtext,
  },
  formCard: {
    width: '100%',
    backgroundColor: theme.surface,
    borderRadius: ms(24),
    padding: ms(20),
    shadowColor: theme.subtext,
    shadowOpacity: 0.1,
    shadowRadius: ms(24),
    shadowOffset: { width: 0, height: vs(12) },
    elevation: 8,
    borderWidth: 1,
    borderColor: theme.surfaceAlt,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: ms(12),
    padding: ms(4),
    marginBottom: vs(20),
  },
  roleBtn: {
    flex: 1,
    paddingVertical: vs(10),
    alignItems: 'center',
    borderRadius: ms(10),
  },
  roleBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: ms(4),
    shadowOffset: { width: 0, height: vs(2) },
    elevation: 2,
  },
  roleBtnText: {
    fontFamily: 'Poppins-Medium',
    fontSize: ms(14),
    color: '#64748B',
  },
  roleBtnTextActive: {
    color: '#1E293B',
    fontWeight: '700',
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
    color: theme.text,
    marginBottom: vs(6),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: ms(16),
    backgroundColor: theme.background,
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
    color: theme.text,
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
    borderColor: theme.border,
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
    color: theme.subtext,
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
    backgroundColor: theme.subtext,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontFamily: 'Poppins-Bold',
    fontSize: ms(16),
    color: theme.surface,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  dividerText: {
    fontFamily: 'Poppins-Medium',
    color: theme.subtext,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  schoolAccountButton: {
    flexDirection: 'row',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.surface,
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
    backgroundColor: theme.background,
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
    color: theme.text,
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
