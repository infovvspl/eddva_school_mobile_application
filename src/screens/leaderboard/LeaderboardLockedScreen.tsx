import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../../components/Icon';
import LeaderboardDarkHeader from '../../components/leaderboard/LeaderboardDarkHeader';
import { LB_COLORS, LB_UNLOCK_GEMS } from '../../constants/leaderboardXp';
import { font, hs, layout, ms, pagePadding, spacing, vs } from '../../utils/responsive';

type Props = {
  gems: number;
  onBack: () => void;
  onInfo: () => void;
  onEarnXp: () => void;
};

const LeaderboardLockedScreen: React.FC<Props> = ({ gems, onBack, onInfo, onEarnXp }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={LB_COLORS.bg} />

      <LeaderboardDarkHeader
        title="Leaderboard"
        onBack={onBack}
        rightAction={
          <TouchableOpacity onPress={onInfo} style={styles.infoBtn} activeOpacity={0.8} hitSlop={12}>
            <Icon name="info-circle" size={ms(20)} color={LB_COLORS.textMuted} solid />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + vs(100) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.lockCircle}>
          <View style={styles.badgeWrap}>
            <View style={styles.rankHex}>
              <Text style={styles.rankNum}>1</Text>
            </View>
            <View style={styles.lockBadge}>
              <Icon name="lock" size={ms(12)} color="#fff" solid />
            </View>
          </View>
        </View>

        <Text style={styles.lockedTitle}>Leaderboard Locked</Text>
        <Text style={styles.lockedSub}>
          You need {LB_UNLOCK_GEMS}{' '}
          <Icon name="gem" size={ms(12)} color={LB_COLORS.accent} solid /> to unlock leaderboard!
        </Text>
        <Text style={styles.gemsLine}>
          You have {gems} / {LB_UNLOCK_GEMS} gems
        </Text>

        <View style={styles.divider} />

        <View style={styles.tipCard}>
          <Icon name="lightbulb" size={ms(22)} color={LB_COLORS.text} solid />
          <Text style={styles.tipText}>
            XPs for videos depend on the actual watch time, not the lecture length.
          </Text>
          <Text style={styles.tipDot}>·</Text>
          <Text style={styles.tipLink}>
            Still confused? Learn more by clicking{' '}
            <Text style={styles.tipHere} onPress={onInfo}>
              here
            </Text>
            !
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, vs(12)) }]}>
        <TouchableOpacity style={styles.cta} onPress={onEarnXp} activeOpacity={0.9}>
          <Text style={styles.ctaText}>Earn XP Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LB_COLORS.bg },
  infoBtn: { padding: ms(8), minWidth: hs(72), alignItems: 'flex-end' },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: pagePadding,
    paddingTop: vs(16),
  },
  lockCircle: {
    width: hs(168),
    height: hs(168),
    borderRadius: hs(84),
    backgroundColor: '#EAF2FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(28),
  },
  badgeWrap: { position: 'relative' },
  rankHex: {
    width: hs(92),
    height: hs(92),
    backgroundColor: LB_COLORS.orange,
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNum: { fontSize: font.headline + 2, fontWeight: '900', color: '#fff' },
  lockBadge: {
    position: 'absolute',
    right: -hs(6),
    bottom: -vs(6),
    width: hs(34),
    height: hs(34),
    borderRadius: hs(17),
    backgroundColor: LB_COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: LB_COLORS.bg,
  },
  lockedTitle: {
    fontSize: font.title,
    fontWeight: '900',
    color: LB_COLORS.accent,
    marginBottom: vs(12),
    textAlign: 'center',
  },
  lockedSub: {
    fontSize: font.body,
    color: LB_COLORS.text,
    textAlign: 'center',
    lineHeight: vs(22),
    marginBottom: vs(8),
  },
  gemsLine: { fontSize: font.caption, color: LB_COLORS.textMuted, marginBottom: vs(24) },
  divider: {
    width: '75%',
    height: 1,
    backgroundColor: LB_COLORS.border,
    marginBottom: vs(24),
  },
  tipCard: {
    backgroundColor: LB_COLORS.card,
    borderRadius: ms(14),
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  tipText: {
    fontSize: font.body,
    color: LB_COLORS.text,
    textAlign: 'center',
    lineHeight: vs(22),
    marginTop: vs(12),
    marginBottom: vs(10),
  },
  tipDot: { fontSize: font.title, color: LB_COLORS.textMuted, marginBottom: vs(8) },
  tipLink: {
    fontSize: font.caption,
    color: LB_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: vs(20),
  },
  tipHere: {
    textDecorationLine: 'underline',
    color: LB_COLORS.peach,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: pagePadding,
    paddingTop: vs(8),
    backgroundColor: LB_COLORS.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LB_COLORS.border,
  },
  cta: {
    backgroundColor: LB_COLORS.accent,
    borderRadius: ms(14),
    paddingVertical: vs(16),
    alignItems: 'center',
    minHeight: layout.touchTargetLg,
    justifyContent: 'center',
  },
  ctaText: { fontSize: font.subhead, fontWeight: '900', color: '#1A1A1A' },
});

export default LeaderboardLockedScreen;
