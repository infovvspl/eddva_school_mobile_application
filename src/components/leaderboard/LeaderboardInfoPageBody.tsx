import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../Icon';
import XpHexBadge from './XpHexBadge';
import {
  LB_COLORS,
  LEADERBOARD_LEVELS,
  type InfoPageKind,
} from '../../constants/leaderboardXp';
import { font, hs, ms, spacing, vs } from '../../utils/responsive';
import { Colors } from '../../constants/theme';

type Props = { kind: InfoPageKind };

const RewardRow: React.FC<{
  icon: string;
  iconBg: string;
  title: string;
  xpAmount: number;
}> = ({ icon, iconBg, title, xpAmount }) => (
  <View style={styles.rewardRow}>
    <View style={[styles.rewardIcon, { backgroundColor: iconBg }]}>
      <Icon name={icon} size={ms(14)} color="#fff" solid />
    </View>
    <View style={styles.rewardText}>
      <Text style={styles.rewardTitle}>{title}</Text>
      <View style={styles.rewardSubRow}>
        <Text style={styles.rewardSub}>{xpAmount} </Text>
        <XpHexBadge size="sm" />
        <Text style={styles.rewardSub}> for every correct answer</Text>
      </View>
    </View>
  </View>
);

const ZoneCard: React.FC<{
  icon: string;
  iconColor: string;
  title: string;
  body: string;
}> = ({ icon, iconColor, title, body }) => (
  <View style={styles.zoneCard}>
    <View style={[styles.zoneIconWrap, { backgroundColor: `${iconColor}22` }]}>
      <Icon name={icon} size={ms(20)} color={iconColor} solid />
    </View>
    <View style={styles.zoneText}>
      <Text style={styles.zoneTitle}>{title}</Text>
      <Text style={styles.zoneBody}>{body}</Text>
    </View>
  </View>
);

/** Mini UI mock — video player (lectures page) */
const VideoPlayerMock: React.FC = () => (
  <View style={styles.videoMock}>
    <View style={styles.videoScreen}>
      <View style={styles.playCircle}>
        <Icon name="play" size={ms(22)} color="#fff" solid />
      </View>
      <View style={styles.videoProgress}>
        <View style={styles.videoProgressFill} />
      </View>
    </View>
    <View style={styles.videoXpBadge}>
      <XpHexBadge size="sm" />
    </View>
    <Icon name="star" size={ms(12)} color="#FBBF24" solid style={styles.sparkle1} />
    <Icon name="clock" size={ms(11)} color={LB_COLORS.purple} solid style={styles.sparkle2} />
  </View>
);

/** Mini UI mock — quiz card (DPP / tests) */
const QuizCardMock: React.FC = () => (
  <View style={styles.quizMock}>
    <View style={styles.quizQ}>
      <View style={styles.quizDot} />
      <View style={[styles.quizLine, { width: '70%' }]} />
    </View>
    <View style={[styles.quizOpt, styles.quizOptCorrect]}>
      <Text style={styles.quizOptText}>Correct option</Text>
    </View>
    <View style={styles.quizOpt}>
      <View style={[styles.quizLine, { width: '50%' }]} />
    </View>
    <View style={styles.quizXp}>
      <XpHexBadge size="sm" />
    </View>
  </View>
);

const LeaderboardInfoPageBody: React.FC<Props> = ({ kind }) => {
  switch (kind) {
    case 'levelup-intro':
      return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.introTag}>~ INTRODUCING ~</Text>
          <Text style={styles.levelUpTitle}>Level UP!</Text>
          <Text style={styles.introSub}>MAKING LEARNING FUN</Text>
          <Text style={styles.bodyCenter}>
            Earn XP by watching videos, doing DPPs, and taking tests to climb the leaderboard.
          </Text>

          <View style={styles.zigzagRow}>
            <XpHexBadge size="lg" />
            <View style={styles.zigzagCopy}>
              <Text style={styles.sectionHead}>XP or Experience Points</Text>
              <Text style={styles.body}>
                XP is a special currency you earn by watching videos, attempting DPPs, and taking tests.
              </Text>
            </View>
          </View>

          <View style={[styles.zigzagRow, styles.zigzagReverse]}>
            <View style={styles.zigzagCopy}>
              <Text style={styles.sectionHead}>Leaderboard</Text>
              <Text style={styles.body}>
                Students are divided into groups of 30 and ranked based on XP earned during the cycle.
              </Text>
            </View>
            <LinearGradient colors={['#FB923C', '#3B82F6']} style={styles.tileIcon}>
              <Icon name="trophy" size={ms(26)} color="#FFD700" solid />
            </LinearGradient>
          </View>

          <View style={styles.zigzagRow}>
            <LinearGradient colors={['#F97316', '#EA580C']} style={styles.tileIcon}>
              <Text style={styles.tileNum}>1</Text>
            </LinearGradient>
            <View style={styles.zigzagCopy}>
              <Text style={styles.sectionHead}>Reshuffling</Text>
              <Text style={styles.body}>
                The leaderboard resets every 14 days. Your zone decides if you are promoted, stay, or
                demoted.
              </Text>
            </View>
          </View>
        </ScrollView>
      );

    case 'what-xp':
      return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>What is XP?</Text>
          <Text style={styles.bodyCenter}>
            XP, which stands for Experience Points, is like a special currency you earn by doing
            different things on our app.
          </Text>
          <View style={styles.heroBadge}>
            <XpHexBadge size="lg" />
          </View>
          <Text style={styles.bodyCenter}>
            It&apos;s the main thing we look at in the Leaderboard to see how well you&apos;re doing
            compared to others.
          </Text>
        </ScrollView>
      );

    case 'what-leaderboard':
      return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>What is Leaderboard?</Text>
          <Text style={styles.bodyCenter}>
            The Leaderboard compares your activities and gives you a rank based on XP earned during the
            week. You can see your XP and compare it with your mates.
          </Text>
          <View style={styles.podiumWrap}>
            <View style={[styles.podiumBlock, styles.podium2]}>
              <Icon name="star" size={ms(14)} color="#C0C0C0" solid />
              <Text style={styles.podiumRank}>2</Text>
            </View>
            <View style={[styles.podiumBlock, styles.podium1]}>
              <Icon name="star" size={ms(22)} color="#FFD700" solid />
              <Text style={styles.podiumRank}>1</Text>
            </View>
            <View style={[styles.podiumBlock, styles.podium3]}>
              <Icon name="star" size={ms(12)} color="#CD7F32" solid />
              <Text style={styles.podiumRank}>3</Text>
            </View>
          </View>
          <Text style={[styles.bodyCenter, { marginTop: vs(8) }]}>
            There are 10 levels in the leaderboard which are as follows :-
          </Text>
          <View style={styles.levelGrid}>
            {LEADERBOARD_LEVELS.map(l => (
              <View key={l.level} style={styles.levelCell}>
                <View style={[styles.levelBadge, { backgroundColor: l.color }]}>
                  <Text style={styles.levelNum}>{l.level}</Text>
                </View>
                <Text style={styles.levelLabel}>Level {l.level}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.bodyCenter}>
            Every student starts at the base level which is Level 1 and has to get promoted to climb up
            the ladder.
          </Text>
        </ScrollView>
      );

    case 'xp-lectures':
      return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>How can you earn XP in lectures?</Text>
          <Text style={[styles.bodyCenter, styles.peachText]}>
            You can get XP by watching videos, solving DPPs, or taking tests.
          </Text>
          <View style={styles.illustrationCard}>
            <VideoPlayerMock />
          </View>
          <Text style={styles.bullet}>
            • You will earn <Text style={styles.bold}>2XP</Text> for <Text style={styles.bold}>every minute</Text>{' '}
            you watch in Live Lectures, Recorded Lectures and Khazana Videos.
          </Text>
          <Text style={styles.bullet}>
            • <Text style={styles.bold}>XPs earned</Text> during videos depend on the actual{' '}
            <Text style={styles.bold}>watch time</Text>, not the lecture length.
          </Text>
        </ScrollView>
      );

    case 'xp-dpp':
      return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>How can you earn XP in DPP?</Text>
          <View style={styles.illustrationCardLight}>
            <QuizCardMock />
          </View>
          <Text style={styles.bulletStart}>
            • In DPPs, you earn XP for each correct answer. The XP varies based on your attempt number:
          </Text>
          <View style={styles.rewardCard}>
            <RewardRow icon="arrow-right" iconBg={LB_COLORS.purple} title="First Attempt" xpAmount={3} />
            <View style={styles.rewardDivider} />
            <RewardRow icon="redo" iconBg={LB_COLORS.orange} title="Re-attempts" xpAmount={1} />
          </View>
        </ScrollView>
      );

    case 'xp-tests':
      return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>How can you earn XP in Tests?</Text>
          <View style={styles.illustrationCardLight}>
            <QuizCardMock />
          </View>
          <Text style={[styles.bodyCenter, styles.dashLead]}>
            - You earn XP for each correct answer, but the amount depends on your attempts and whether
            the test is Live or Non-Live -
          </Text>
          <View style={styles.sectionBlock}>
            <View style={styles.sectionBar}>
              <Text style={styles.sectionBarText}>Live Tests</Text>
            </View>
            <RewardRow icon="play" iconBg={LB_COLORS.red} title="Attempt" xpAmount={5} />
          </View>
          <View style={styles.sectionBlock}>
            <View style={styles.sectionBar}>
              <Text style={styles.sectionBarText}>Non - Live Tests</Text>
            </View>
            <RewardRow icon="arrow-right" iconBg={LB_COLORS.blue} title="First Attempt" xpAmount={3} />
            <View style={styles.rewardDivider} />
            <RewardRow icon="redo" iconBg={LB_COLORS.orange} title="Re-attempts" xpAmount={1} />
          </View>
        </ScrollView>
      );

    case 'zones':
      return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Text style={styles.bodyCenter}>
            Each Leaderboard has 2 or 3 zones based on your Level. These zones are:
          </Text>
          <ZoneCard
            icon="arrow-up"
            iconColor={LB_COLORS.green}
            title="Promotion zone"
            body="Finishing in this zone will take you to the next level."
          />
          <ZoneCard
            icon="shield-alt"
            iconColor={LB_COLORS.yellow}
            title="Safety zone"
            body="Finishing in this zone means that you neither get promoted nor demoted."
          />
          <ZoneCard
            icon="arrow-down"
            iconColor={LB_COLORS.red}
            title="Demotion zone"
            body="Finishing in this zone means that you will drop a level."
          />
          <Text style={[styles.pageTitle, { marginTop: vs(20) }]}>How does the leaderboard work?</Text>
          <Text style={styles.bodyCenter}>
            The leaderboard resets every 2 weeks. During this time, the XP you earn gets used up in
            determining your rank, which places you in a zone that decides if you&apos;ll be promoted,
            demoted, or stay at the same level.
          </Text>
          <Text style={[styles.pageTitle, { marginTop: vs(16) }]}>Why does my XP reset?</Text>
          <Text style={styles.bodyCenter}>
            Your weekly leaderboard XP resets after the rank is calculated to ensure everyone competes
            on a fair playing field in the next cycle.
          </Text>
        </ScrollView>
      );

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  scroll: { paddingBottom: vs(24), paddingHorizontal: spacing.md, paddingTop: vs(8) },
  pageTitle: {
    fontSize: font.subhead,
    fontWeight: '800',
    color: LB_COLORS.text,
    textAlign: 'center',
    marginBottom: vs(12),
  },
  introTag: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: LB_COLORS.textMuted,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: vs(4),
  },
  levelUpTitle: {
    fontSize: font.headline + 4,
    fontWeight: '900',
    color: LB_COLORS.accent,
    textAlign: 'center',
  },
  introSub: {
    fontSize: font.caption,
    fontWeight: '800',
    color: LB_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: vs(16),
    letterSpacing: 0.5,
  },
  sectionHead: {
    fontSize: font.subhead,
    fontWeight: '800',
    color: LB_COLORS.orange,
    marginBottom: vs(6),
  },
  body: { fontSize: font.body, color: LB_COLORS.textMuted, lineHeight: vs(20) },
  bodyCenter: {
    fontSize: font.body,
    color: LB_COLORS.textMuted,
    textAlign: 'center',
    lineHeight: vs(20),
    marginBottom: vs(12),
  },
  peachText: { color: LB_COLORS.peach },
  dashLead: { fontStyle: 'italic', marginVertical: vs(8) },
  bold: { fontWeight: '800', color: LB_COLORS.peach },
  bullet: {
    fontSize: font.body,
    color: LB_COLORS.peach,
    lineHeight: vs(22),
    marginBottom: vs(12),
  },
  bulletStart: {
    fontSize: font.body,
    color: LB_COLORS.textMuted,
    lineHeight: vs(22),
    marginBottom: vs(12),
  },
  heroBadge: { alignItems: 'center', marginVertical: vs(24) },
  zigzagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(14),
    marginBottom: vs(24),
  },
  zigzagReverse: { flexDirection: 'row-reverse' },
  zigzagCopy: { flex: 1 },
  tileIcon: {
    width: hs(64),
    height: hs(64),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileNum: { fontSize: font.headline, fontWeight: '900', color: '#fff' },
  podiumWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: hs(8),
    marginVertical: vs(20),
    paddingHorizontal: hs(8),
  },
  podiumBlock: {
    width: hs(52),
    borderTopLeftRadius: ms(6),
    borderTopRightRadius: ms(6),
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: vs(8),
  },
  podium1: { height: vs(80), backgroundColor: '#22C55E' },
  podium2: { height: vs(60), backgroundColor: '#3B82F6' },
  podium3: { height: vs(48), backgroundColor: '#EF4444' },
  podiumRank: { fontSize: font.subhead, fontWeight: '900', color: '#fff', marginTop: vs(4) },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: vs(16),
    padding: spacing.md,
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: LB_COLORS.border,
    backgroundColor: LB_COLORS.surface,
  },
  levelCell: { width: '18%', alignItems: 'center', marginBottom: vs(10) },
  levelBadge: {
    width: hs(34),
    height: hs(34),
    borderRadius: hs(17),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(4),
  },
  levelNum: { fontSize: font.caption, fontWeight: '900', color: '#fff' },
  levelLabel: { fontSize: font.micro, color: LB_COLORS.textMuted, fontWeight: '600' },
  illustrationCard: {
    backgroundColor: LB_COLORS.peach,
    borderRadius: ms(16),
    padding: spacing.md,
    marginVertical: vs(14),
    overflow: 'hidden',
  },
  illustrationCardLight: {
    backgroundColor: LB_COLORS.surface,
    borderRadius: ms(14),
    padding: spacing.md,
    marginVertical: vs(14),
    borderWidth: 1,
    borderColor: LB_COLORS.border,
  },
  videoMock: { position: 'relative', minHeight: vs(100) },
  videoScreen: {
    backgroundColor: '#E8E0F0',
    borderRadius: ms(10),
    padding: spacing.md,
    minHeight: vs(88),
    justifyContent: 'center',
  },
  playCircle: {
    width: hs(48),
    height: hs(48),
    borderRadius: hs(24),
    backgroundColor: LB_COLORS.purple,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(12),
  },
  videoProgress: {
    height: vs(6),
    backgroundColor: '#D1D5DB',
    borderRadius: ms(3),
    overflow: 'hidden',
  },
  videoProgressFill: {
    width: '45%',
    height: '100%',
    backgroundColor: LB_COLORS.purple,
    borderRadius: ms(3),
  },
  videoXpBadge: { position: 'absolute', right: hs(8), top: vs(8) },
  sparkle1: { position: 'absolute', left: hs(12), top: vs(4) },
  sparkle2: { position: 'absolute', right: hs(48), bottom: vs(28) },
  quizMock: {
    backgroundColor: '#F8FAFC',
    borderRadius: ms(10),
    padding: spacing.md,
    position: 'relative',
  },
  quizQ: { flexDirection: 'row', alignItems: 'center', gap: hs(8), marginBottom: vs(10) },
  quizDot: { width: hs(8), height: hs(8), borderRadius: hs(4), backgroundColor: LB_COLORS.purple },
  quizLine: { height: vs(8), backgroundColor: '#E2E8F0', borderRadius: ms(4) },
  quizOpt: {
    padding: vs(10),
    borderRadius: ms(8),
    marginBottom: vs(6),
    backgroundColor: '#F1F5F9',
  },
  quizOptCorrect: { backgroundColor: '#DCFCE7', borderWidth: 1, borderColor: '#86EFAC' },
  quizOptText: { fontSize: font.tiny, fontWeight: '700', color: '#166534' },
  quizXp: { position: 'absolute', right: hs(8), bottom: vs(8) },
  rewardCard: {
    backgroundColor: LB_COLORS.card,
    borderRadius: ms(12),
    overflow: 'hidden',
    marginTop: vs(4),
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(12),
    padding: spacing.md,
  },
  rewardIcon: {
    width: hs(40),
    height: hs(40),
    borderRadius: hs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardText: { flex: 1 },
  rewardTitle: { fontSize: font.body, fontWeight: '800', color: LB_COLORS.text },
  rewardSubRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: vs(4) },
  rewardSub: { fontSize: font.caption, color: LB_COLORS.textMuted },
  rewardDivider: { height: 1, backgroundColor: LB_COLORS.borderSoft, marginLeft: hs(52) },
  sectionBlock: {
    marginTop: vs(12),
    borderRadius: ms(12),
    overflow: 'hidden',
    backgroundColor: LB_COLORS.card,
  },
  sectionBar: {
    backgroundColor: LB_COLORS.purpleBar,
    paddingVertical: vs(10),
    paddingHorizontal: spacing.md,
  },
  sectionBarText: { fontSize: font.body, fontWeight: '800', color: '#fff' },
  zoneCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: hs(12),
    backgroundColor: LB_COLORS.card,
    borderRadius: ms(12),
    padding: spacing.md,
    marginBottom: vs(10),
  },
  zoneIconWrap: {
    width: hs(44),
    height: hs(44),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneText: { flex: 1 },
  zoneTitle: { fontSize: font.body, fontWeight: '800', color: LB_COLORS.text, marginBottom: vs(4) },
  zoneBody: { fontSize: font.caption, color: LB_COLORS.textMuted, lineHeight: vs(18) },
});

export default LeaderboardInfoPageBody;
