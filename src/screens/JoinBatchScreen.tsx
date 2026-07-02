import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import EDDVAScreenHeader from '../components/EDDVAScreenHeader';
import { BorderRadius } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { studentService } from '../services/student.service';
import { font, hs, ms, spacing, vs } from '../utils/responsive';

type Props = { navigation: any };

const JoinBatchScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const c = theme.colors;
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      Alert.alert('Invite code', 'Paste your batch invite link or token.');
      return;
    }
    setLoading(true);
    try {
      await studentService.joinBatchByInviteToken(trimmed);
      Alert.alert('Success', 'You joined the batch successfully.', [
        {
          text: 'View courses',
          onPress: () => {
            navigation.navigate('Main', { screen: 'Learn' });
          },
        },
      ]);
      setToken('');
    } catch (err: any) {
      Alert.alert('Could not join', err?.message || 'Invalid or expired invite code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <EDDVAScreenHeader
          title="Join with invite"
          subtitle="Enter code from your teacher or institute"
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + vs(28) }]}
        >
          <View style={[styles.inputWrap, { backgroundColor: c.card, borderColor: c.border }]}>
            <Icon name="link" size={ms(16)} color={c.primary} solid />
            <TextInput
              style={[styles.input, { color: c.text }]}
              placeholder="Invite token or link"
              placeholderTextColor={c.textMuted}
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={() => void submit()}
            />
          </View>
          <Text style={[styles.hint, { color: c.textMuted }]}>
            Example: paste the full invite URL or the token shared by your institute.
          </Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: c.primary }, loading && { opacity: 0.7 }]}
            onPress={submit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Join batch</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
        </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { padding: spacing.md },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: hs(14),
    height: vs(52),
  },
  input: { flex: 1, fontSize: font.body, padding: 0 },
  hint: { fontSize: font.caption, marginTop: vs(10), lineHeight: ms(20) },
  btn: {
    marginTop: vs(20),
    paddingVertical: vs(14),
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: font.body, fontWeight: '800' },
});

export default JoinBatchScreen;
