import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../Icon';
import { LB_COLORS, LEADERBOARD_INFO_PAGES } from '../../constants/leaderboardXp';
import { font, hs, layout, ms, pagePadding, spacing, vs } from '../../utils/responsive';

type Props = {
  pageIndex: number;
  onPrevious: () => void;
  onNext: () => void;
  bottomInset: number;
};

const LeaderboardInfoFooter: React.FC<Props> = ({
  pageIndex,
  onPrevious,
  onNext,
  bottomInset,
}) => {
  const total = LEADERBOARD_INFO_PAGES.length;
  const isFirst = pageIndex === 0;
  const isLast = pageIndex === total - 1;
  const step = LEADERBOARD_INFO_PAGES[pageIndex];

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(bottomInset, vs(12)) }]}>
      <Text style={styles.stepMeta}>
        {pageIndex + 1} / {total} · {step.stepLabel}
      </Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.btn, styles.btnOutline]}
          onPress={onPrevious}
          activeOpacity={0.85}
        >
          <Icon name="arrow-left" size={ms(12)} color={LB_COLORS.text} solid />
          <Text style={styles.btnOutlineText}>{isFirst ? 'Back' : 'Previous'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={onNext} activeOpacity={0.9}>
          <Text style={styles.btnPrimaryText}>{isLast ? 'Done' : 'Next'}</Text>
          {!isLast ? <Icon name="arrow-right" size={ms(12)} color="#1A1A1A" solid /> : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: pagePadding,
    paddingTop: vs(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: LB_COLORS.border,
    backgroundColor: LB_COLORS.bg,
  },
  stepMeta: {
    fontSize: font.tiny,
    fontWeight: '700',
    color: LB_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: vs(10),
  },
  row: { flexDirection: 'row', gap: hs(10) },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: hs(6),
    minHeight: layout.touchTarget,
    borderRadius: ms(12),
    paddingHorizontal: spacing.md,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: LB_COLORS.border,
    backgroundColor: LB_COLORS.card,
  },
  btnOutlineText: { fontSize: font.body, fontWeight: '800', color: LB_COLORS.text },
  btnPrimary: { backgroundColor: LB_COLORS.accent },
  btnPrimaryText: { fontSize: font.body, fontWeight: '900', color: '#1A1A1A' },
});

export default LeaderboardInfoFooter;
