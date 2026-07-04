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
