import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../Icon';
import { Brand } from '../../constants/brand';
import { Shadow } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import {
  type BattleDaily,
  isActiveDailyBattle,
  isJoinableDailyBattle,
} from '../../utils/battleMappers';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';

type Props = {
  dailyBattle: BattleDaily | null;
  onDaily: () => void;
  onQuickDuel: () => void;
  onFriend: () => void;
};

const BattlePlayPanel: React.FC<Props> = ({
  dailyBattle,
  onDaily,
  onQuickDuel,
  onFriend,
}) => {
  const { theme } = useTheme();
  const c = theme.colors;
  const showDaily = isActiveDailyBattle(dailyBattle);
  const joinableDaily = isJoinableDailyBattle(dailyBattle);

  return (
    <View style={styles.wrap}>
      {showDaily ? (
        <TouchableOpacity
          style={[styles.dailyCard, { borderColor: c.border }]}
          onPress={onDaily}
          activeOpacity={0.9}
        >
          <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.dailyGrad}>
            <View style={styles.dailyBadge}>
              <Icon name="bolt" size={ms(10)} color="#fff" solid />
              <Text style={styles.dailyBadgeText}>DAILY</Text>
            </View>
            <Text style={[styles.dailyTitle, { color: c.text }]}>{dailyBattle!.title}</Text>
            <Text style={[styles.dailySub, { color: c.textMuted }]}>
              {joinableDaily
                ? dailyBattle!.description
                : 'Start a fresh daily duel — no old room codes'}
            </Text>
            {joinableDaily && dailyBattle!.roomCode ? (
              <Text style={styles.dailyCode}>Room {dailyBattle!.roomCode}</Text>
            ) : null}
          </LinearGradient>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={[styles.modeLive, { borderColor: c.border }]}
        onPress={onQuickDuel}
        activeOpacity={0.9}
      >
        <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.modeGrad}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>FIND MATCH</Text>
          </View>
          <Text style={[styles.modeTitle, { color: c.text }]}>1v1 Quick Duel</Text>
          <Text style={[styles.modeSub, { color: c.textMuted }]}>
            Match with another student online
          </Text>
          <View style={styles.modePlay}>
            <Icon name="play" size={ms(14)} color={Brand.blue700} solid />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modeCard, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={onFriend}
        activeOpacity={0.9}
      >
        <Icon name="users" size={ms(20)} color={c.primary} solid />
        <View style={{ flex: 1 }}>
          <Text style={[styles.modeTitleDark, { color: c.text }]}>Challenge Friend</Text>
          <Text style={[styles.modeSubDark, { color: c.textMuted }]}>
            Create or join with a room code
          </Text>
        </View>
        <Icon name="chevron-right" size={ms(12)} color={c.textMuted} solid />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: vs(12) },
  dailyCard: {
    borderRadius: ms(20),
    overflow: 'hidden',
    borderWidth: 1,
    ...Shadow.soft,
  },
  dailyGrad: { padding: spacing.md, borderRadius: ms(20) },
  dailyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    alignSelf: 'flex-start',
    backgroundColor: Brand.blue700,
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    borderRadius: ms(8),
    marginBottom: vs(6),
  },
  dailyBadgeText: { fontSize: font.micro, fontWeight: '800', color: '#fff' },
  dailyTitle: { fontSize: font.subhead, fontWeight: '800' },
  dailySub: { fontSize: font.caption, marginTop: vs(2) },
  dailyCode: {
    fontSize: font.caption,
    fontWeight: '700',
    color: Brand.blue700,
    marginTop: vs(8),
    letterSpacing: 2,
  },
  modeLive: { borderRadius: ms(24), overflow: 'hidden', borderWidth: 1 },
  modeGrad: { padding: spacing.lg, borderRadius: ms(24) },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    alignSelf: 'flex-start',
    backgroundColor: Brand.blue700,
    paddingHorizontal: hs(8),
    paddingVertical: vs(3),
    borderRadius: ms(8),
    marginBottom: vs(8),
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  liveBadgeText: { fontSize: font.micro, fontWeight: '800', color: '#fff' },
  modeTitle: { fontSize: font.subhead, fontWeight: '900' },
  modeSub: { fontSize: font.caption, marginTop: vs(4), marginBottom: vs(12) },
  modePlay: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    marginTop: -hs(20),
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: spacing.md,
    borderRadius: ms(20),
    borderWidth: 1,
    ...Shadow.soft,
  },
  modeTitleDark: { fontSize: font.subhead, fontWeight: '800' },
  modeSubDark: { fontSize: font.caption, marginTop: vs(2) },
});

export default BattlePlayPanel;
