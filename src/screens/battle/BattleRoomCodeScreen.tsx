import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import EDDVAScreenHeader from '../../components/EDDVAScreenHeader';
import PrimaryButton from '../../components/PrimaryButton';
import { battleService } from '../../services/battle.service';
import { extractBattleId, extractRoomCode } from '../../hooks/useBattleRoom';
import { mapBattleRoom, type BattleParticipant } from '../../utils/battleMappers';
import BattleParticipantsList from '../../components/battle/BattleParticipantsList';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Brand } from '../../constants/brand';
import { BattleStackParamList } from '../../types/navigation';
import { font, ms, spacing, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<BattleStackParamList, 'BattleRoomCode'>;

const BattleRoomCodeScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const c = theme.colors;
  const [code, setCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [battleId, setBattleId] = useState<string | undefined>();
  const [waitingFor, setWaitingFor] = useState<string | null>(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [participants, setParticipants] = useState<BattleParticipant[]>([]);
  const [loading, setLoading] = useState(false);

  const goLive = (roomCode: string, id?: string, opponent = 'Friend') => {
    navigation.navigate('BattleLive', { roomCode, battleId: id, opponent });
  };

  useEffect(() => {
    if (!battleId || !createdCode) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const { data } = await battleService.getRoom(battleId);
        const room = mapBattleRoom(data, user?.id);
        if (cancelled || !room) return;
        setPlayerCount(room.playerCount);
        setParticipants(room.participants);
        if (room.opponentFound && room.opponentName !== 'Searching…') {
          setWaitingFor(room.opponentName);
        }
        if (room.readyToPlay && createdCode) {
          navigation.replace('BattleLive', {
            roomCode: createdCode,
            battleId,
            opponent: room.opponentName || waitingFor || 'Friend',
          });
        }
      } catch {
        /* ignore */
      }
    };
    poll();
    const t = setInterval(poll, 2500);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [battleId, createdCode, user?.id, navigation, waitingFor]);

  const createRoom = async () => {
    setLoading(true);
    try {
      const { data } = await battleService.createFriendChallenge();
      const roomCode = extractRoomCode(data);
      const id = extractBattleId(data);
      if (roomCode) {
        setCreatedCode(roomCode);
        setBattleId(id);
        setWaitingFor(null);
        setPlayerCount(1);
      } else {
        Alert.alert('Unable to create room', 'No room code was returned. Please try again.');
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Please try again.';
      Alert.alert('Unable to create room', msg);
    }
    setLoading(false);
  };

  const joinRoom = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const { data } = await battleService.join(code.trim());
      const id = extractBattleId(data);
      const room = mapBattleRoom(data, user?.id);
      const roomCode = extractRoomCode(data) || code.trim().toUpperCase();
      const opponent = room?.opponentName && room.opponentName !== 'Searching…'
        ? room.opponentName
        : 'Friend';
      if (room?.readyToPlay) {
        goLive(roomCode, id, opponent);
      } else {
        setCreatedCode(roomCode);
        setBattleId(id);
        setWaitingFor(null);
        setPlayerCount(room?.playerCount ?? 1);
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Check the code and try again.';
      Alert.alert('Room not found', msg);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.wrap, { backgroundColor: c.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.wrap, { paddingTop: insets.top }]}>
        <EDDVAScreenHeader title="Room Code" onBack={() => navigation.goBack()} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + vs(28) }]}
        >
        {route.params?.create ? (
          <>
            <Text style={[styles.sub, { color: c.textMuted }]}>Share this code with your friend</Text>
            <TouchableOpacity onPress={!createdCode ? createRoom : undefined} activeOpacity={0.9}>
              <Text style={[styles.code, { color: Brand.blue700 }]}>
                {createdCode || 'Tap to create'}
              </Text>
            </TouchableOpacity>
            {createdCode ? (
              <BattleParticipantsList
                participants={participants}
                myStudentId={user?.id}
                title="Who is online in this room"
                emptyText={`Waiting for friend… (${playerCount}/2 in room)`}
              />
            ) : null}
            {!createdCode ? (
              <PrimaryButton label="Create Room" onPress={createRoom} loading={loading} />
            ) : (
              <PrimaryButton
                label={waitingFor ? `Battle ${waitingFor}` : 'Enter Battle (solo practice)'}
                onPress={() => goLive(createdCode!, battleId, waitingFor || 'Waiting…')}
              />
            )}
          </>
        ) : null}

        <Text style={[styles.divider, { color: c.textMuted }]}>— or join —</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
          placeholder="Enter room code"
          placeholderTextColor={c.textMuted}
          value={code}
          onChangeText={v => setCode(v.toUpperCase())}
          autoCapitalize="characters"
          maxLength={8}
          returnKeyType="done"
          onSubmitEditing={() => void joinRoom()}
        />
        <PrimaryButton label="Join Room" onPress={joinRoom} loading={loading} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  body: { padding: spacing.lg, gap: vs(14) },
  sub: { fontSize: font.caption, textAlign: 'center' },
  code: { fontSize: font.headline, fontWeight: '900', textAlign: 'center', letterSpacing: 4, marginVertical: vs(16) },
  waitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: vs(10),
    padding: spacing.md,
    borderRadius: ms(14),
    borderWidth: 1,
  },
  waitText: { flex: 1, fontSize: font.caption, fontWeight: '600' },
  divider: { textAlign: 'center', fontSize: font.caption, marginVertical: vs(8) },
  input: { borderWidth: 1, borderRadius: ms(14), padding: spacing.md, fontSize: font.body, fontWeight: '700', letterSpacing: 2 },
});

export default BattleRoomCodeScreen;
