import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../../components/Icon';
import EDDVAScreenHeader from '../../components/EDDVAScreenHeader';
import { Brand } from '../../constants/brand';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { battleService } from '../../services/battle.service';
import { extractBattleId, extractRoomCode } from '../../hooks/useBattleRoom';
import { mapBattleRoom, type BattleParticipant } from '../../utils/battleMappers';
import BattleParticipantsList from '../../components/battle/BattleParticipantsList';
import { BattleStackParamList } from '../../types/navigation';
import { font, hs, ms, spacing, useScreenLayout, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<BattleStackParamList, 'BattleMatchmaker'>;

const BattleMatchmakerScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { isShort, isNarrow } = useScreenLayout();
  const c = theme.colors;
  const { subject = 'Quick Duel', subjectId, topicId } = route.params;
  const [eta, setEta] = useState(30);
  const [status, setStatus] = useState('Creating battle room…');
  const [opponentName, setOpponentName] = useState<string | null>(null);
  const [participants, setParticipants] = useState<BattleParticipant[]>([]);
  const battleIdRef = useRef<string | undefined>();
  const roomCodeRef = useRef<string>('');

  const myName = user?.fullName || user?.name || 'You';
  const myInitial = (myName[0] || 'Y').toUpperCase();

  useEffect(() => {
    let cancelled = false;
    const timer = setInterval(() => setEta(e => Math.max(0, e - 1)), 1000);

    (async () => {
      try {
        const { data } = await battleService.createQuickDuel();
        if (cancelled) return;
        const battleId = extractBattleId(data);
        const roomCode = extractRoomCode(data) || '';
        if (!battleId || !roomCode) {
          throw new Error('Invalid room response');
        }
        battleIdRef.current = battleId;
        roomCodeRef.current = roomCode;
        setStatus(`Room ${roomCode} — waiting for opponent…`);

        const started = Date.now();
        while (!cancelled && Date.now() - started < 45000) {
          try {
            const { data: roomData } = await battleService.getRoom(battleId);
            const room = mapBattleRoom(roomData, user?.id);
            if (room) {
              setParticipants(room.participants);
              if (room.opponentFound && room.opponentName !== 'Searching…') {
                setOpponentName(room.opponentName);
                setStatus(`${room.opponentName} joined!`);
              }
              if (room.readyToPlay) {
                navigation.replace('BattleLive', {
                  roomCode,
                  battleId,
                  opponent: room.opponentName,
                  subjectId,
                  topicId,
                });
                return;
              }
            }
          } catch {
            /* keep polling */
          }
          await new Promise(r => setTimeout(r, 2000));
        }

        if (!cancelled) {
          Alert.alert(
            'No opponent yet',
            'Nobody joined your room in time. Try again when more students are online.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            (err as { message?: string })?.message || 'Could not create battle room';
          Alert.alert('Battle unavailable', msg, [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(timer);
      const id = battleIdRef.current;
      if (id) battleService.cancel(id).catch(() => undefined);
    };
  }, [navigation, subjectId, topicId, user?.id]);

  return (
    <View style={[styles.wrap, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <EDDVAScreenHeader
        title="Finding Opponent"
        subtitle={subject}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + vs(24) },
        ]}
      >
        <LinearGradient
          colors={['#EFF6FF', c.background]}
          style={[styles.lobby, isShort && styles.lobbyShort, { borderColor: c.border }]}
        >
        <ActivityIndicator size="large" color={Brand.blue700} style={{ marginTop: isShort ? 0 : vs(16) }} />
        <Text style={[styles.status, { color: c.textMuted }]}>{status}</Text>
        <View style={[styles.vsRow, isNarrow && styles.vsRowNarrow]}>
          <PlayerCard
            label={myName}
            rank="Ready"
            level={user?.rankLabel || `Lvl ${user?.xp ? Math.floor(user.xp / 100) : 1}`}
            initial={myInitial}
            you
            borderColor={Brand.blue700}
          />
          <View style={[styles.vsBadge, { backgroundColor: Brand.blue700 }]}>
            <Text style={styles.vsText}>VS</Text>
          </View>
          <PlayerCard
            label={opponentName || 'Searching…'}
            rank={opponentName ? 'Joined' : `0:${String(eta).padStart(2, '0')}`}
            searching={!opponentName}
            initial={opponentName ? opponentName[0].toUpperCase() : '?'}
            borderColor={opponentName ? '#22C55E' : c.border}
          />
        </View>

        <BattleParticipantsList
          participants={participants}
          myStudentId={user?.id}
          title="Who is online in this room"
        />

        <TouchableOpacity
          style={[styles.cancel, { borderColor: c.border, backgroundColor: c.card }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.88}
        >
          <Text style={[styles.cancelText, { color: c.text }]}>Cancel Search</Text>
        </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

const PlayerCard: React.FC<{
  label: string;
  rank: string;
  level?: string;
  initial: string;
  you?: boolean;
  searching?: boolean;
  borderColor: string;
}> = ({ label, rank, level, initial, you, searching, borderColor }) => (
  <View style={styles.player}>
    <View style={[styles.avatar, { borderColor }, you && styles.avatarYou]}>
      {searching ? (
        <Icon name="user-secret" size={ms(24)} color="#94A3B8" solid />
      ) : (
        <Text style={styles.initial}>{initial}</Text>
      )}
    </View>
    {level && you ? (
      <View style={[styles.lvlBadge, { backgroundColor: Brand.blue700 }]}>
        <Text style={styles.lvlText}>{level}</Text>
      </View>
    ) : null}
    <Text style={styles.pName} numberOfLines={1}>
      {label}
    </Text>
    <Text style={styles.pRank}>{rank}</Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: spacing.md,
  },
  lobby: {
    borderRadius: ms(28),
    padding: spacing.lg,
    borderWidth: 1,
    minHeight: vs(520),
  },
  lobbyShort: { minHeight: vs(440), padding: spacing.md },
  status: {
    textAlign: 'center',
    fontSize: font.caption,
    marginTop: vs(12),
    fontWeight: '600',
    paddingHorizontal: hs(12),
  },
  vsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: vs(24),
  },
  vsRowNarrow: { marginHorizontal: -hs(6) },
  player: { alignItems: 'center', width: hs(110) },
  avatar: {
    width: hs(72),
    height: hs(72),
    borderRadius: hs(36),
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  avatarYou: {},
  initial: { fontSize: font.title, fontWeight: '900', color: Brand.blue700 },
  lvlBadge: {
    position: 'absolute',
    top: hs(58),
    paddingHorizontal: hs(8),
    paddingVertical: vs(2),
    borderRadius: ms(10),
    borderWidth: 2,
    borderColor: '#fff',
  },
  lvlText: { fontSize: font.micro, fontWeight: '800', color: '#fff' },
  pName: { fontSize: font.caption, fontWeight: '800', color: '#0F172A', marginTop: vs(10) },
  pRank: { fontSize: font.tiny, color: '#64748B', marginTop: vs(2) },
  vsBadge: {
    width: hs(44),
    height: hs(44),
    borderRadius: hs(22),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  vsText: { color: '#fff', fontWeight: '900', fontStyle: 'italic', fontSize: font.subhead },
  cancel: {
    alignSelf: 'center',
    marginTop: vs(32),
    paddingHorizontal: hs(24),
    paddingVertical: vs(10),
    borderRadius: ms(20),
    borderWidth: 1,
  },
  cancelText: { fontSize: font.caption, fontWeight: '800' },
});

export default BattleMatchmakerScreen;
