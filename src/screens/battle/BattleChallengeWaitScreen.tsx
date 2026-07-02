import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from '../../components/Icon';
import EDDVAScreenHeader from '../../components/EDDVAScreenHeader';
import BattleParticipantsList from '../../components/battle/BattleParticipantsList';
import PrimaryButton from '../../components/PrimaryButton';
import { Brand } from '../../constants/brand';
import { BorderRadius, Shadow } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { battleService } from '../../services/battle.service';
import { mapBattleRoom, type BattleParticipant } from '../../utils/battleMappers';
import { BattleStackParamList } from '../../types/navigation';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = NativeStackScreenProps<BattleStackParamList, 'BattleChallengeWait'>;

const BattleChallengeWaitScreen: React.FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { theme } = useTheme();
  const c = theme.colors;
  const { battleId, roomCode, opponentName } = route.params;
  const [status, setStatus] = useState(`Waiting for ${opponentName} to accept…`);
  const [participants, setParticipants] = useState<BattleParticipant[]>([]);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const { data } = await battleService.getRoom(battleId);
        const room = mapBattleRoom(data, user?.id);
        if (cancelled || !room) return;
        setParticipants(room.participants);
        const joined = room.participants.find(
          p =>
            p.studentId &&
            p.studentId !== user?.id &&
            !p.isBot,
        );
        if (joined) {
          setStatus(`${joined.name} accepted! Starting battle…`);
        }
        if (room.readyToPlay) {
          navigation.replace('BattleLive', {
            roomCode,
            battleId,
            opponent: room.opponentName || opponentName,
          });
        }
      } catch {
        /* keep polling */
      }
    };
    poll();
    const t = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [battleId, roomCode, opponentName, navigation, user?.id]);

  const shareCode = () => {
    Share.share({
      message: `Join my EDDVA battle on EDDVA! Room code: ${roomCode}`,
      title: 'Battle challenge',
    }).catch(() => undefined);
  };

  const cancel = () => {
    battleService.cancel(battleId).catch(() => undefined);
    navigation.goBack();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: c.background }]}>
      <EDDVAScreenHeader
        title="Challenge sent"
        subtitle={opponentName}
        onBack={cancel}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + vs(28) }]}
      >
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.soft]}>
        <View style={[styles.iconWrap, { backgroundColor: `${c.primary}15` }]}>
          <Icon name="paper-plane" size={ms(28)} color={c.primary} solid />
        </View>
        <Text style={[styles.title, { color: c.text }]}>Challenge {opponentName}</Text>
        <Text style={[styles.sub, { color: c.textMuted }]}>{status}</Text>

        <View style={[styles.codeBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
          <Text style={styles.codeLbl}>Room code</Text>
          <Text style={styles.code}>{roomCode}</Text>
        </View>

        <Text style={[styles.help, { color: c.textMuted }]}>
          When they open Battle Arena → Challenge friend → enter this code and tap Join, the
          battle starts for both of you.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton label="Share room code" onPress={shareCode} />
          <TouchableOpacity style={styles.shareBtn} onPress={shareCode} activeOpacity={0.88}>
            <Icon name="share-alt" size={ms(14)} color={c.primary} solid />
            <Text style={[styles.shareText, { color: c.primary }]}>Share code</Text>
          </TouchableOpacity>
        </View>

        <ActivityIndicator color={c.primary} style={{ marginTop: vs(16) }} />
      </View>

      <BattleParticipantsList
        participants={participants}
        myStudentId={user?.id}
        title="Room status"
        emptyText={`Waiting for ${opponentName}…`}
      />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: spacing.md },
  scroll: {
    flexGrow: 1,
    gap: vs(14),
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconWrap: {
    width: hs(64),
    height: hs(64),
    borderRadius: hs(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(12),
  },
  title: { fontSize: font.title, fontWeight: '900', textAlign: 'center' },
  sub: { fontSize: font.caption, marginTop: vs(8), textAlign: 'center' },
  codeBox: {
    marginTop: vs(20),
    paddingVertical: vs(16),
    paddingHorizontal: hs(24),
    borderRadius: ms(16),
    borderWidth: 1,
    alignItems: 'center',
    width: '100%',
  },
  codeLbl: {
    fontSize: font.micro,
    fontWeight: '800',
    color: Brand.blue700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  code: {
    fontSize: font.headline + 4,
    fontWeight: '900',
    color: Brand.blue700,
    letterSpacing: 6,
    marginTop: vs(6),
  },
  help: {
    fontSize: font.caption,
    lineHeight: vs(20),
    textAlign: 'center',
    marginTop: vs(16),
  },
  actions: { width: '100%', marginTop: vs(8), gap: vs(10) },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(8),
    paddingVertical: vs(10),
  },
  shareText: { fontSize: font.caption, fontWeight: '800' },
});

export default BattleChallengeWaitScreen;
