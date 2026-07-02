import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BorderRadius } from '../../constants/theme';
import { hs, ms, type as t, vs } from '../../utils/responsive';

export type StudyPlanTab = 'today' | 'roadmap' | 'backlogs' | 'weak' | 'revision';

type Props = {
  tab: StudyPlanTab;
  backlogCount?: number;
  onTabChange: (tab: StudyPlanTab) => void;
};

const TABS: { key: StudyPlanTab; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'roadmap', label: 'Roadmap' },
  { key: 'backlogs', label: 'Backlogs' },
  { key: 'weak', label: 'Weak Topics' },
  { key: 'revision', label: 'Revision' },
];

/** Tab strip only — greeting/stats live on Home, not duplicated here. */
const StudyPlanHero: React.FC<Props> = ({ tab, backlogCount = 0, onTabChange }) => {
  const { theme } = useTheme();
  const c = theme.colors;

  return (
    <View style={[styles.wrap, { backgroundColor: c.background, borderBottomColor: c.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabRow}
      >
        {TABS.map(item => {
          const active = tab === item.key;
          const badge = item.key === 'backlogs' && backlogCount > 0 ? backlogCount : 0;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.tab,
                { borderColor: c.border, backgroundColor: c.chipBg },
                active && {
                  backgroundColor: c.chipActiveBg,
                  borderColor: c.chipActiveBorder,
                },
              ]}
              onPress={() => onTabChange(item.key)}
              activeOpacity={0.88}
            >
              <Text style={[styles.tabText, { color: c.textMuted }, active && { color: c.primary }]}>
                {item.label}
              </Text>
              {badge > 0 ? (
                <View style={[styles.badge, { backgroundColor: c.danger }]}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: hs(12),
    paddingTop: vs(8),
    paddingBottom: vs(10),
    borderBottomWidth: 1,
  },
  tabRow: { gap: hs(8), paddingHorizontal: hs(4) },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(14),
    paddingVertical: vs(10),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: hs(6),
  },
  tabText: { ...t.captionBold },
  badge: {
    minWidth: hs(18),
    height: hs(18),
    borderRadius: hs(9),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: hs(4),
  },
  badgeText: { ...t.microBold, color: '#fff' },
});

export default StudyPlanHero;
