import re

with open('src/screens/LoginScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import
if 'react-native-biometrics' not in content:
    content = content.replace(
        "import { useAppTheme } from '../context/ThemeContext';",
        "import { useAppTheme } from '../context/ThemeContext';\nimport ReactNativeBiometrics from 'react-native-biometrics';"
    )

# 2. Add handleBiometricLogin
biometric_func = """
  const handleBiometricLogin = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      if (available && biometryType) {
        const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Login with Biometrics' });
        if (success) {
          setAuthToken('biometric-token-12345');
          console.log('Biometric Login successful');
          onLogin();
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
"""

if 'handleBiometricLogin' not in content:
    content = content.replace(
        "const handleLogin = async () => {",
        biometric_func + "\n  const handleLogin = async () => {"
    )

# 3. Add button below Login button
biometric_btn = """
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#E2E8F0', marginTop: 12 }]} 
              onPress={handleBiometricLogin}
              activeOpacity={0.9}
            >
              <Text style={[styles.buttonText, { color: '#334155' }]}>Login with FaceID / Fingerprint</Text>
            </TouchableOpacity>
"""

if 'Login with FaceID' not in content:
    content = content.replace(
        "</TouchableOpacity>\n            \n          </View>",
        "</TouchableOpacity>\n" + biometric_btn + "          </View>"
    )

with open('src/screens/LoginScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated LoginScreen.tsx for Biometrics")
