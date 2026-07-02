import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { LB_COLORS, LEADERBOARD_INFO_PAGES } from '../../constants/leaderboardXp';
import { font, hs, layout, ms, pagePadding, vs } from '../../utils/responsive';

type Props = {
  title?: string;
  pageIndex?: number;
  showProgress?: boolean;
  onBack: () => void;
  rightAction?: React.ReactNode;
};

/** PW-style dark header: back + title + optional segment progress */
const LeaderboardDarkHeader: React.FC<Props> = ({
  title = 'Information',
  pageIndex = 0,
  showProgress = false,
  onBack,
  rightAction,
}) => (
  <View style={styles.wrap}>
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}
        activeOpacity={0.85}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Icon name="arrow-left" size={ms(16)} color={LB_COLORS.text} solid />
        <Text style={styles.backLabel}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {rightAction ?? <View style={styles.backSpacer} />}
    </View>
    {showProgress ? (
      <View style={styles.segments}>
        {LEADERBOARD_INFO_PAGES.map((p, i) => (
          <View key={p.id} style={[styles.segment, i === pageIndex && styles.segmentActive]} />
        ))}
      </View>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: pagePadding,
    paddingBottom: vs(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: LB_COLORS.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.touchTarget,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: hs(6),
    paddingVertical: vs(6),
    paddingRight: hs(8),
    minWidth: hs(72),
  },
  backLabel: { fontSize: font.caption, fontWeight: '700', color: LB_COLORS.text },
  title: {
    flex: 1,
    fontSize: font.subhead,
    fontWeight: '800',
    color: LB_COLORS.text,
    textAlign: 'center',
  },
  backSpacer: { minWidth: hs(72) },
  segments: { flexDirection: 'row', gap: hs(6), marginTop: vs(12) },
  segment: {
    flex: 1,
    height: vs(3),
    borderRadius: ms(2),
    backgroundColor: LB_COLORS.borderSoft,
  },
  segmentActive: { backgroundColor: LB_COLORS.text },
});

export default LeaderboardDarkHeader;
